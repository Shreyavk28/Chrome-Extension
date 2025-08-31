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

git clone https://github.com/your-username/Chrome-extension-main.git
cd Chrome-extension-main

### 2. Backend Setup (Server)

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

---

## 📊 Usage
- Click the extension icon in the Chrome toolbar to open the popup.
- Use the popup to start or stop tracking tasks.
- Tracked time data is stored in the backend server.
- Open the **Dashboard** page to view charts and insights about your activity.

---

## 📌 Requirements
- [Node.js](https://nodejs.org/) (v14 or higher recommended)
- npm (comes with Node.js)
- [Google Chrome](https://www.google.com/chrome/) (latest version)

---

## 🤝 Contributing
Contributions are welcome! 🎉  

If you’d like to contribute:  
1. Fork the repository  
2. Create a new branch (`git checkout -b feature-branch`)  
3. Commit your changes (`git commit -m "Add new feature"`)  
4. Push to the branch (`git push origin feature-branch`)  
5. Open a Pull Request  

For major changes, please open an issue first to discuss what you’d like to change.
---

## 📂 Project Structure
│ ├── package.json # Node.js dependencies
└── └── node_modules/ # Installed dependencies
