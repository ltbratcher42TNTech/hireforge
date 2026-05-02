// electron/main.js
const { app, BrowserWindow } = require('electron')
const { spawn } = require('child_process')
const path = require('path')

// Start the backend sevrer
const objServer = spawn(process.execPath, [path.join(__dirname, '..', 'server.js')], {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit'
})

// Wait for backend then open window
const fnCreateWindow = () => {
    const objWindow = new BrowserWindow({ width: 1280, height: 900 })

    // Give Express a moment to start, then load it
    setTimeout(() => {
        objWindow.loadURL('http://localhost:8000')
    }, 1500)
}

app.whenReady().then(fnCreateWindow)

// Kill the backend when app closes
app.on('will-quit', () => {
    objServer.kill()
})