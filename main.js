// Modules to control application life and create native browser window
const { app, BrowserWindow, Menu, shell } = require('electron')
const defaultMenu = require('electron-default-menu')
const isDev = require('electron-is-dev')
const { autoUpdater } = require('electron-updater')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 900, height: 700})

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  autoUpdater.checkForUpdatesAndNotify()

  createWindow()

  // menu bar
  let menu = defaultMenu(app, shell)

  // add settings shortcut
  const mainMenuItem = menu.find(menuItem => menuItem.label === 'meta-grabber')
  // only do this on macOS
  if (mainMenuItem) {
    menu = [{
        ...mainMenuItem,
        submenu: [
          ...mainMenuItem.submenu.slice(0, 2), {
            label: 'Preferences...',
            accelerator: 'Cmd+,',
            click: () => {
              mainWindow.webContents.send('settings-toggle')
            }
          }, {
            type: 'separator'
          },
          ...mainMenuItem.submenu.slice(2)
        ]
      },
      ...menu.filter(menuItem => menuItem.label !== mainMenuItem.label)
    ]
  }

  // remove devtools and relaod in prod
  if (!isDev) {
    menu = menu.map(menuItem => ({
      ...menuItem,
      submenu: menuItem.submenu.filter(subItem =>
        subItem.label !== 'Toggle Developer Tools' && subItem.label !== 'Reload')
    }))
  }

  Menu.setApplicationMenu(Menu.buildFromTemplate(menu))
})

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  // if (process.platform !== 'darwin') {
    app.quit()
  // }
})

// app.on('activate', function () {
//   // On OS X it's common to re-create a window in the app when the
//   // dock icon is clicked and there are no other windows open.
//   if (mainWindow === null) {
//     createWindow()
//   }
// })

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
