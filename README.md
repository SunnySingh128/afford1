# AffordMed Notification System

A full-stack, responsive Notification Platform designed to display user alerts, handle priority-based sorting, and ensure a premium user experience. Built strictly adhering to design and functional constraints for Afford Medical Technologies Private Limited.

## 🚀 Tech Stack

*   **Frontend:** React, Vite, Material UI (MUI), Axios, React Router Dom
*   **Backend:** Node.js, Express.js, JSON Web Tokens (JWT)
*   **Database:** PostgreSQL / MySQL (via `mysql2`)

## ✨ Features

*   **Clean, Premium UI:** Styled exclusively with Material UI, highlighting unread notifications clearly without cluttering the screen.
*   **Secure Authentication:** Protected API endpoints using JWT Bearer tokens.
*   **Dashboard Pagination & Filtering:** Users can filter their alerts by `notification_type` ("Event", "Result", "Placement") and navigate via fast server-side pagination.
*   **Priority Inbox (Stage 6):** A specialized algorithm that surfaces the **Top 10** most critical unread notifications. Priority is calculated using a custom scoring mechanism:
    *   **Weight:** Placement (3) > Result (2) > Event (1)
    *   **Recency:** Ties in weight are broken by the newest creation date.

---

## 📂 Project Structure

The repository is divided into two main sub-directories:

```text
afford/
├── backend/                  # Node.js & Express API Server
│   ├── .env                  # Environment variables (DB credentials, JWT Secret)
│   ├── db.js                 # Database connection pool setup
│   ├── server.js             # Main Express server and API routes
│   └── seed.js               # Database initialization and mock data seeder
│
├── frontend/                 # React & Vite Frontend App
│   ├── index.html            
│   ├── vite.config.js        # Configured to run strictly on port 3000
│   └── src/
│       ├── App.jsx           # Main router & MUI Theme Provider
│       ├── components/       # Reusable components (Navbar, NotificationItem)
│       └── pages/            # View components (Login, Dashboard, PriorityInbox)
```

---

## 🛠️ How to Start the Project Locally

Follow these steps to get the full-stack application running on your local machine.

### Prerequisites
*   Node.js installed (v16+)
*   MySQL Server installed and running locally

### 1. Database Configuration
Navigate to the `backend/` directory and update the `.env` file with your local MySQL credentials:

```env
PORT=5000
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=notifications_db
JWT_SECRET=supersecretjwtkey123
```

### 2. Start the Backend Server
Open a terminal inside the `backend/` folder and run the following commands:

```bash
# Install dependencies
npm install

# Run the database seeder to create the table and populate it with 50 mock notifications
node seed.js

# Start the Express server (Runs on port 5000)
node server.js
```

### 3. Start the Frontend Application
Open a **new** terminal inside the `frontend/` folder and run:

```bash
# Install dependencies
npm install

# Start the Vite development server (Strictly configured to run on port 3000)
npm run dev
```

### 4. Experience the Platform
*   Open your browser and navigate to `http://localhost:3000`.
*   Log in using the mock credentials provided on the login page.
*   Explore the **All Notifications** tab to test filtering and pagination.
*   Navigate to the **Priority Inbox** to verify the custom sorting algorithm.
*   Click the checkmark icon on any new notification to mark it as read.

---

## 📈 System Architecture & Tradeoffs (Stage 4)

To prevent the database from being overwhelmed by constant read requests on every page load, this system utilizes **Client-Side State Management (React)**. Navigating between different routes within the SPA does not trigger new database fetches. 

For a production environment at massive scale, the recommended architecture is **Strategy 1 (Redis Caching)** combined with **Strategy 2 (WebSockets)** to entirely eliminate page-load polling, as detailed in the `notification_system_design.md` document.
