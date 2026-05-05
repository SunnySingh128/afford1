require('dotenv').config();
const mysql = require('mysql2/promise');

async function seed() {
  let connection;
  try {
    // Connect without database first to create it
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root',
    });

    const dbName = process.env.DB_NAME || 'notifications_db';
    console.log(`Creating database ${dbName} if not exists...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    await connection.query(`USE \`${dbName}\``);

    console.log('Creating notifications table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id VARCHAR(50) PRIMARY KEY,
        user_id VARCHAR(50) NOT NULL,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Clearing old data...');
    await connection.query('TRUNCATE TABLE notifications');

    console.log('Inserting mock notifications...');
    const types = ['Event', 'Result', 'Placement'];
    
    // Helper to generate random dates within last 30 days
    const randomDate = () => {
      const d = new Date();
      d.setDate(d.getDate() - Math.floor(Math.random() * 30));
      return d.toISOString().slice(0, 19).replace('T', ' ');
    };

    const values = [];
    for (let i = 1; i <= 50; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      let title, message;
      
      if (type === 'Event') {
        title = `Hackathon ${i} Announcement`;
        message = `Join us for the upcoming coding event!`;
      } else if (type === 'Result') {
        title = `Semester ${Math.ceil(i/10)} Results Declared`;
        message = `Your results are out. Click to view.`;
      } else {
        title = `Placement Drive at Company ${String.fromCharCode(64 + (i%26 + 1))}`;
        message = `A top tier company is visiting campus. Register now.`;
      }

      const is_read = Math.random() > 0.7; // 30% unread
      values.push([`notif_${i}`, 'user_123', type, title, message, is_read, randomDate()]);
    }

    await connection.query(
      'INSERT INTO notifications (id, user_id, type, title, message, is_read, created_at) VALUES ?',
      [values]
    );

    console.log('Seed completed successfully!');
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    if (connection) await connection.end();
  }
}

seed();
