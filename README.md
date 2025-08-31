# Time Tracker Chrome Extension

A Chrome Extension with a backend server for tracking time and visualizing activity via a dashboard.

---

## 🚀 Features
- Track time spent on tasks directly from Chrome.
- Simple popup interface for quick task logging.
- Dashboard with charts for visualizing activity.
- Backend server with `db.json` for storing time logs.

---

## 🔧 Installation & Setup

### 1. Clone Repository
```bash
git clone https://github.com/your-username/Chrome-extension-main.git
cd Chrome-extension-main

### 2. Backend Setup (Server)
```bash
cd time-tracker-server
npm install
node server.js
## Server runs on http://localhost:3000
---
### 3. Load Extension in Chrome
1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (toggle on top-right).
3. Click **Load unpacked** and select the `time-tracker-extension` folder.
4. The extension will appear in your Chrome toolbar.
