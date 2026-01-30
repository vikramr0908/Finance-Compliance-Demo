# How to Start the Application

## Quick Start

The application uses **mock Supabase (localStorage)** - no backend server needed!

### Option 1: Using the start script
```bash
cd /Users/vikramramanathan/Desktop/Finance-Test-main
./start.sh
```

### Option 2: Using npm directly
```bash
cd /Users/vikramramanathan/Desktop/Finance-Test-main
npm run dev
```

### Option 3: Start both frontend and backend (when ready)
```bash
npm run dev:all
```

## Expected Output

Once started, you should see:
```
  VITE v5.x.x  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

## Troubleshooting

### If you get "ERR_CONNECTION_REFUSED"
- Make sure the server is running (check terminal output)
- Try accessing `http://localhost:5173/` in your browser
- If port 5173 is busy, Vite will automatically try the next available port

### If you get permission errors (EPERM)
- Run the command in your **Terminal app** (not Cursor's integrated terminal)
- Or grant Terminal network permissions:
  1. System Settings → Privacy & Security → Full Disk Access
  2. Add Terminal.app
  3. Restart Terminal

## Backend Server (Optional)

The backend server (`server.js`) is available as backup but **not required** for the current setup. The app uses localStorage for data storage.

To start the backend:
```bash
npm run dev:backend
```

Backend runs on: `http://localhost:3001`
