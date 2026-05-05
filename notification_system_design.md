# Stage 1

## Notification System REST API Design & Real-Time Mechanism

This document outlines the REST API contract, structures, and real-time mechanism for a user notification platform. It is designed to be highly readable, predictable, and scalable.

### 1. Core Actions Supported

The notification platform supports the following core actions for a logged-in user:
1. **Fetch Notifications**: Retrieve a paginated list of notifications (both read and unread).
2. **Get Unread Count**: Retrieve the total count of unread notifications to display on UI badges.
3. **Mark as Read**: Mark a specific single notification as read.
4. **Mark All as Read**: Mark all currently unread notifications as read in a single action.
5. **Delete Notification**: Remove a notification from the user's view entirely.

---

### 2. REST API Endpoints & Contracts

#### Common Headers
All authenticated API requests must include the following headers:
```json
{
  "Authorization": "Bearer <JWT_ACCESS_TOKEN>",
  "Content-Type": "application/json",
  "Accept": "application/json"
}
```

#### 2.1 Fetch Notifications
Retrieves a paginated list of user notifications.

* **Endpoint**: `GET /api/v1/notifications`
* **Query Parameters**:
  * `page` (integer, optional): Page number (default: `1`)
  * `limit` (integer, optional): Items per page (default: `20`)
  * `status` (string, optional): Filter by status (`read`, `unread`, or `all` - default: `all`)

* **Request Body**: `None`

* **Success Response (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "notifications": [
      {
        "id": "notif_8f72a9b1",
        "type": "SYSTEM_ALERT",
        "title": "System Maintenance",
        "message": "Scheduled maintenance will occur on Saturday at 2 AM UTC.",
        "actionUrl": "https://myapp.com/maintenance-info",
        "isRead": false,
        "createdAt": "2023-10-27T10:00:00Z"
      },
      {
        "id": "notif_3c45e6d2",
        "type": "NEW_MESSAGE",
        "title": "New message from John",
        "message": "Hey, are we still meeting today?",
        "actionUrl": "https://myapp.com/messages/user_123",
        "isRead": true,
        "createdAt": "2023-10-26T15:30:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 95,
      "limit": 20
    }
  }
}
```

#### 2.2 Get Unread Notification Count
Quickly retrieves the count of unread notifications, useful for rendering UI elements like a red dot with a number.

* **Endpoint**: `GET /api/v1/notifications/unread-count`
* **Request Body**: `None`
* **Success Response (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "unreadCount": 12
  }
}
```

#### 2.3 Mark a Notification as Read
Updates the status of a specific notification to 'read'. Using `PATCH` because we are partially updating the resource.

* **Endpoint**: `PATCH /api/v1/notifications/{notificationId}/read`
* **Path Parameters**:
  * `notificationId` (string, required): The unique identifier of the notification.
* **Request Body**: `None`
* **Success Response (200 OK)**:
```json
{
  "status": "success",
  "message": "Notification marked as read.",
  "data": {
    "id": "notif_8f72a9b1",
    "isRead": true,
    "readAt": "2023-10-27T12:05:00Z"
  }
}
```

#### 2.4 Mark All Notifications as Read
Updates all unread notifications for the authenticated user to 'read'.

* **Endpoint**: `PATCH /api/v1/notifications/read-all`
* **Request Body**: `None`
* **Success Response (200 OK)**:
```json
{
  "status": "success",
  "message": "All notifications marked as read.",
  "data": {
    "updatedCount": 12
  }
}
```

#### 2.5 Delete a Notification
Removes a notification from the database or soft-deletes it.

* **Endpoint**: `DELETE /api/v1/notifications/{notificationId}`
* **Path Parameters**:
  * `notificationId` (string, required): The unique identifier of the notification.
* **Request Body**: `None`
* **Success Response (204 No Content)**:
*(No response body returned on successful deletion)*

---

### 3. Mechanism for Real-Time Notifications

To ensure users receive notifications immediately without constantly refreshing the page (polling), we will implement **WebSockets**. WebSockets provide a persistent, bi-directional, low-latency communication channel between the client and the server.

#### Architecture & Data Flow:
1. **Connection Establishment**: When the user logs into the front-end application, the client establishes a secure WebSocket connection to the server (e.g., `wss://api.myapp.com/ws/notifications`).
2. **Authentication**: The client authenticates the WebSocket connection. This is typically done by passing a temporary, short-lived authentication ticket retrieved via REST API, or by sending the JWT token in the initial connection payload.
3. **Session Mapping**: Once authenticated, the server maps the active WebSocket connection to the specific user's ID in memory or a distributed cache like Redis.
4. **Event Trigger & Pub/Sub**: When an event occurs in the backend that triggers a notification (e.g., another user sends a message), the relevant microservice publishes a message to a message broker (e.g., Redis Pub/Sub, Kafka, or RabbitMQ) targeted at the receiving user's ID.
5. **Real-time Delivery**: The WebSocket server, subscribed to the message broker, receives the event. It finds the active WebSocket connection(s) for that user ID and pushes the serialized JSON notification payload directly to the connected client.

#### Real-Time WebSocket Payload Schema
When a new notification arrives in real-time, the server pushes the following JSON payload over the active socket to the client:

```json
{
  "event": "NEW_NOTIFICATION",
  "data": {
    "id": "notif_9a8b7c6d",
    "type": "FRIEND_REQUEST",
    "title": "New Friend Request",
    "message": "Alice wants to connect with you.",
    "actionUrl": "https://myapp.com/friends/requests",
    "isRead": false,
    "createdAt": "2023-10-27T12:10:00Z"
  }
}
```

#### Fallback Mechanism: Server-Sent Events (SSE)
*Interview Talking Point:* If the system requires strictly one-way communication (server to client) and bi-directional interaction isn't strictly necessary for notifications, **Server-Sent Events (SSE)** is an excellent, lighter-weight alternative. It operates over standard HTTP, natively supports auto-reconnection, and avoids the complexity of managing a custom WebSocket protocol, though it is limited to unidirectional data flow.

---

# Stage 2

## Database Storage & Scaling Strategy

### 1. Persistent Storage Choice: PostgreSQL

For this notification platform, I suggest using **PostgreSQL**, a robust, open-source Relational Database Management System (RDBMS).

**Reasons for choice:**
* **Reliability and ACID compliance**: Ensures that notification states (like `is_read`) are strictly consistent, preventing scenarios where a user reads a notification but it still shows as unread due to eventual consistency delays.
* **Excellent Indexing**: PostgreSQL supports advanced indexing (like B-trees and partial indexes), which is critical for querying unread notifications efficiently.
* **JSONB Support**: Notifications often have flexible payloads (e.g., specific metadata depending on the notification `type`). PostgreSQL's JSONB columns allow storing unstructured metadata while still being indexable.
* **Partitioning**: PostgreSQL natively supports table partitioning. Since notification data is time-series-like and grows extremely fast, partitioning by date (e.g., monthly) allows the system to scale massively and makes archiving old data trivial.

*(Alternative for massive scale: A NoSQL DB like **MongoDB** or **Cassandra** is also highly suitable if the volume exceeds relational database capabilities easily, as notifications are write-heavy, user-partitioned, and don't strictly require complex joins. However, PostgreSQL with partitioning handles the vast majority of application scales while keeping the ecosystem simpler.)*

### 2. Database Schema

Here is the proposed schema for the `notifications` table:

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- Indexed: Foreign key to the user receiving the notification
    type VARCHAR(50) NOT NULL, -- e.g., 'SYSTEM_ALERT', 'NEW_MESSAGE'
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    action_url VARCHAR(2048),
    is_read BOOLEAN NOT NULL DEFAULT FALSE, -- Indexed (Partial index for unread)
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
```

### 3. Scaling Challenges and Solutions

**Problem 1: Massive Data Volume (Slower Reads/Writes)**
As millions of notifications are generated, the table will become enormous, slowing down inserts and standard queries.
**Solution: Table Partitioning & Archival**
* **Partitioning**: Implement PostgreSQL Range Partitioning on the `created_at` column (e.g., partitioning by month). Queries usually look for recent notifications, so the DB only scans the latest partition.
* **Archival/TTL**: Users rarely look at notifications older than 30-90 days. Implement a background cron job or database trigger to delete or move old partitions to cheaper "cold" storage automatically.

**Problem 2: Heavy Load from "Unread Count" Queries**
The `GET /api/v1/notifications/unread-count` is called every time a user opens the app or switches pages. Running a `COUNT(*)` query on the DB continuously is expensive.
**Solution: Caching with Redis**
* Maintain an `unread_count:{user_id}` integer in a fast in-memory store like Redis.
* **Increment** the Redis key when a new notification is inserted.
* **Decrement** the key when a notification is marked as read.
* The API fetches the count directly from Redis in milliseconds, completely bypassing the primary database.

**Problem 3: High Write Throughput Impacting Reads**
Constant inserts of new notifications could lock tables and slow down read queries for users trying to view their feeds.
**Solution: Read Replicas and Asynchronous Processing**
* Separate the database into a Primary (for writes) and Read Replicas (for reads).
* When an event occurs, push it to a message queue (like RabbitMQ/Kafka). Background workers consume the queue and batch-insert notifications into the DB, smoothing out write spikes.

### 4. SQL Queries based on REST APIs (Stage 1)

**4.1 Fetch Notifications (Paginated)**
*(Assuming page 1, limit 20. Pagination is handled using `LIMIT` and `OFFSET` or keyset pagination for better performance).*
```sql
SELECT id, type, title, message, action_url, is_read, created_at
FROM notifications
WHERE user_id = 'user_uuid_here'
ORDER BY created_at DESC
LIMIT 20 OFFSET 0;
```

**4.2 Get Unread Count**
*(If falling back to DB instead of Redis)*
```sql
SELECT COUNT(*)
FROM notifications
WHERE user_id = 'user_uuid_here' AND is_read = FALSE;
```

**4.3 Mark a Notification as Read**
```sql
UPDATE notifications
SET is_read = TRUE, read_at = NOW()
WHERE id = 'notification_uuid_here' AND user_id = 'user_uuid_here';
```

**4.4 Mark All Notifications as Read**
```sql
UPDATE notifications
SET is_read = TRUE, read_at = NOW()
WHERE user_id = 'user_uuid_here' AND is_read = FALSE;
```

**4.5 Delete a Notification**
```sql
DELETE FROM notifications
WHERE id = 'notification_uuid_here' AND user_id = 'user_uuid_here';
```

---

# Stage 3

## Query Performance and Optimization

### 1. Analysis of the Original Query

**Original Query:**
```sql
SELECT * FROM notifications
WHERE studentID = 1042 AND isRead = false
ORDER BY createdAt ASC;
```

**Is this query accurate?**
Functionally, the query is accurate for fetching all unread notifications for a specific student. However, logically, users typically want to see their *newest* notifications first, so `ORDER BY createdAt DESC` is usually the correct business requirement. Additionally, `SELECT *` is considered a poor practice in production environments because it fetches all columns, including potentially large payload texts that might not be needed in a list view.

**Why is this slow?**
As the table has grown to 5,000,000 rows, if there is no index (or only a simple index on `studentID`), the database engine must perform a massive scan. Even with an index on `studentID`, if the student has thousands of notifications, the database fetches all of them, filters out the read ones, and then performs an in-memory sort (`filesort`) to order them by `createdAt`. Sorting large datasets in memory is computationally expensive and slow.

### 2. Proposed Changes and Computation Cost

**What I would change:**
1.  **Avoid `SELECT *`**: Explicitly select only the necessary columns (e.g., `id`, `title`, `createdAt`).
2.  **Pagination**: Add a `LIMIT` (and `OFFSET` or keyset cursor) to prevent returning thousands of rows at once.
3.  **Order Direction**: Change to `ORDER BY createdAt DESC` to show the most recent alerts first.
4.  **Composite Index**: Create a composite index to cover the `WHERE` and `ORDER BY` clauses perfectly.

**Optimized Query:**
```sql
SELECT id, type, title, createdAt 
FROM notifications
WHERE studentID = 1042 AND isRead = false
ORDER BY createdAt DESC
LIMIT 20;
```

**Index needed:**
```sql
CREATE INDEX idx_student_unread_sort ON notifications (studentID, isRead, createdAt DESC);
```

**Likely Computation Cost:**
*   **Before (No composite index):** The cost was **O(N)** (Full Table Scan or Index Scan + memory sort). High CPU and memory usage.
*   **After (With composite index):** The cost drops dramatically to **O(log N)** for the B-Tree traversal to find the student's unread node, plus **O(L)** where L is the limit (20 rows). Because the index is already sorted by `createdAt`, the database avoids the sorting phase entirely. This takes execution time from seconds to milliseconds.

### 3. Evaluating "Index Every Column" Advice

**Is the advice to add indexes on every column effective?**
**No, this is highly ineffective and a recognized anti-pattern.**

**Why not?**
1.  **Severe Write Penalty**: Every time a notification is inserted, updated, or deleted, the database must also update *every single index*. For a notification system with 5,000,000 rows and high write-throughput, this will drastically slow down insert performance.
2.  **Storage Bloat**: Indexes consume disk space and RAM. Indexing every column wastes enormous amounts of storage and pushes valuable, active data out of the fast in-memory cache (Buffer Pool).
3.  **Optimizer Confusion**: Having too many overlapping or unnecessary indexes can sometimes confuse the SQL query planner, causing it to pick a suboptimal execution plan.

Indexes should be carefully targeted based on actual query patterns (the `WHERE`, `JOIN`, and `ORDER BY` clauses).

### 4. Query: Placement Notifications in the Last 7 Days

To find all unique students who received a "Placement" notification in the last 7 days:

```sql
SELECT DISTINCT studentID 
FROM notifications 
WHERE notificationType = 'Placement' 
  AND createdAt >= NOW() - INTERVAL '7 days';
```
*(Note: Syntax for date subtraction depends slightly on the SQL dialect; the above is standard for PostgreSQL. For MySQL, it would be `createdAt >= NOW() - INTERVAL 7 DAY`)*

---

# Stage 4

## Performance Optimization for High Read Traffic

**The Problem:** Fetching notifications from the primary database on *every single page load* for *every student* causes a massive read bottleneck. It overwhelms the database connections and CPU, leading to slow response times and a poor user experience.

To solve this, we must decouple the page load from a direct database query. Here are the primary strategies to resolve this, along with their tradeoffs:

### Strategy 1: Server-Side Caching (Redis) + Read-Through

Instead of querying the SQL database on every page load, we cache the most frequently accessed notification data (like the `unread_count` and the first 20 recent notifications) in a fast, in-memory datastore like **Redis**.

*   **How it works:**
    1. On page load, the backend requests the user's notifications from Redis.
    2. If the data is in Redis (Cache Hit), it's returned instantly (sub-millisecond).
    3. If not (Cache Miss), the backend queries the PostgreSQL database, saves the result in Redis with a Time-To-Live (TTL), and then returns it to the user.
    4. When a new notification is created or marked as read, the backend invalidates or updates that specific user's Redis cache.
*   **Tradeoffs:**
    *   *(+)* **Pros:** Massively reduces load on the primary DB. Extremely fast read performance.
    *   *(-)* **Cons:** Adds infrastructure complexity (managing Redis). Cache invalidation is notoriously difficult to get perfectly right, potentially leading to temporarily stale data (e.g., a user reads a notification on their phone, but their laptop still shows it unread for a few minutes).

### Strategy 2: Real-Time Push (WebSockets or Server-Sent Events)

Instead of the client *pulling* data on every page navigation, the client fetches the notifications *once* when the application initially loads. Subsequent updates are *pushed* by the server in real-time.

*   **How it works:**
    1. The student logs in. The frontend makes one API call to fetch the initial state (e.g., 5 unread notifications).
    2. The frontend establishes a persistent WebSocket connection (or SSE channel).
    3. As the student navigates between different pages in a Single Page Application (SPA), no further notification API calls are made. The frontend relies on its local state.
    4. If a new notification arrives, the server pushes it through the WebSocket, and the frontend updates its local state dynamically.
*   **Tradeoffs:**
    *   *(+)* **Pros:** Best possible user experience (instant delivery). Almost entirely eliminates polling and page-load API requests, saving massive amounts of HTTP overhead.
    *   *(-)* **Cons:** Highest complexity. Requires maintaining stateful, long-lived connections on the server, which can be memory-intensive. Requires handling connection drops and automatic reconnections cleanly on the frontend.

### Strategy 3: Client-Side State Management & Local Storage

This is a frontend-centric optimization, ideal for Single Page Applications (SPAs like React, Vue, or Angular).

*   **How it works:**
    1. The notifications are fetched once when the app mounts and stored in global state (e.g., Redux, React Context) and persisted in browser `localStorage` or `IndexedDB`.
    2. Navigating between routes inside the app doesn't trigger new network requests; the UI simply reads from the local state.
    3. The client can periodically poll (e.g., every 60 seconds) strictly for the *unread count* rather than the full payload, or only fetch notifications created *after* the last known timestamp.
*   **Tradeoffs:**
    *   *(+)* **Pros:** Very low implementation cost on the backend. Fast navigation between pages.
    *   *(-)* **Cons:** If the user opens multiple tabs, they might get out of sync unless you use the `BroadcastChannel` API or `localStorage` events to sync tabs. If the user does a hard browser refresh, a network request is still required.

### My Recommendation

For a robust, modern application, I would implement a **hybrid approach: Strategy 1 + Strategy 3**.

1.  Use **Client-Side State** so navigation within the app doesn't trigger network requests.
2.  Use **Redis Caching** on the backend so that when a request *is* made (e.g., on a hard refresh or initial login), it hits the cache instead of the DB.

If real-time delivery is a strict business requirement, I would implement **Strategy 2 (WebSockets)**, as outlined in Stage 1, which inherently solves the page-load polling issue.

---

# Stage 6 & 7

## Priority Inbox Algorithm & Full-Stack Implementation

### 1. Priority Inbox Algorithm (Stage 6)

The requirement for the Priority Inbox is to always display the top *n* most important **unread** notifications based on a combination of **weight** and **recency**.

**Weight Definitions:**
*   `Placement` = 3
*   `Result` = 2
*   `Event` = 1
*   *Other* = 0

**The Approach:**
Since the requirement explicitly states "DB query is not expected" for finding the top 10, the logic is implemented in the application layer (Node.js backend):
1.  **Fetch Pool:** We fetch all `unread` notifications for the user from the database.
2.  **Scoring Function:** We iterate through the notifications and assign a weight based on the `type`.
3.  **Sorting Logic:** We sort the array using a custom comparator function:
    *   First, compare the weights. Sort descending (highest weight first).
    *   If weights are equal, sort by `created_at` descending (most recent first).
4.  **Slicing:** We return the top *n* elements using `.slice(0, n)`.

*(Note: While fetching all unread notifications into memory works for smaller datasets, for massive scale, this logic should eventually be pushed down to the database level using a SQL `ORDER BY CASE WHEN type='Placement' THEN 3... END DESC, created_at DESC LIMIT 10`, or by maintaining a sorted set in Redis.)*

### 2. Frontend Implementation (Stage 7)

A fully responsive, uncluttered frontend has been implemented using **React (Vite)** and **Material UI (MUI)**.

**Key Features Implemented:**
*   **Exclusively localhost:3000:** Configured Vite to run strictly on port 3000 as per constraints.
*   **Clean UI/UX:** Utilized Material UI Cards, Typography, and Chips to create a premium, readable interface. "New" notifications are highlighted with a distinct background color and a primary "New" chip, clearly differentiating them from already read notifications.
*   **Dashboard Page:** Displays all notifications with server-side pagination and a filter toggle group to switch between "All", "Events", "Results", and "Placements".
*   **Priority Inbox Page:** A dedicated route (`/priority`) that fetches and displays the Top 10 notifications sorted by our custom algorithm.
*   **Robust Error Handling:** API failures or unauthorized states (like a missing or expired JWT) are caught gracefully using MUI `<Alert>` components and redirect flows. Loading states are handled with Circular Progress indicators to prevent jarring UI jumps.
*   **Authentication:** Simulated a protected route environment using JWTs to adhere to the Stage 6 constraints.
