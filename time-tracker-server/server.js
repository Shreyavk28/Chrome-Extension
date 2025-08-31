const express = require('express');
const cors = require('cors');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const adapter = new FileSync('db.json');
const db = low(adapter);

// Initialize database
db.defaults({ users: [] }).write();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;

// API to save user data
app.post('/api/save-data', (req, res) => {
  const { userId, timeData } = req.body;

  // Find or create user
  let user = db.get('users').find({ userId }).value();

  if (!user) {
    db.get('users').push({ userId, timeData: {} }).write();
    user = db.get('users').find({ userId }).value();
  }

  // Merge new data with existing data
  const updatedTimeData = { ...user.timeData, ...timeData };
  db.get('users').find({ userId }).assign({ timeData: updatedTimeData }).write();

  res.json({ success: true });
});

// API to get user data
app.get('/api/get-data/:userId', (req, res) => {
  const { userId } = req.params;
  const user = db.get('users').find({ userId }).value();

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json(user.timeData);
});

// API to get weekly report
app.get('/api/weekly-report/:userId', (req, res) => {
  const { userId } = req.params;
  const user = db.get('users').find({ userId }).value();

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const dates = Object.keys(user.timeData).sort().slice(-7);
  const report = dates.map(date => ({
    date,
    productive: user.timeData[date]?.productive || 0,
    unproductive: user.timeData[date]?.unproductive || 0,
    neutral: user.timeData[date]?.neutral || 0
  }));

  res.json(report);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
