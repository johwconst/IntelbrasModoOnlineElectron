const path = require('path');
const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const isDev = false;
const isMac = process.platform === 'darwin';
const ServerProvider = require('./renderer/js/serverOnline');

let mainWindow;

// Main Window
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 900,
    resizable: true,
    center: true,
    enableRemoteModule: true,
    nodeIntegrationInWorker: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  mainWindow.loadFile(path.join(__dirname, './renderer/index.html'));
}

// Criar Janela
app.whenReady().then(() => {
  createMainWindow();

  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);

  // Clean Memory
  mainWindow.on('closed', () => (mainWindow = null));
});

// Menu template
const menu = [
  ...(isDev
    ? [
      {
        label: 'Developer',
        submenu: [
          { role: 'reload' },
          { role: 'forcereload' },
          { type: 'separator' },
          { role: 'toggledevtools' },
        ],
      },
    ]
    : []),
];

// -------------------------------------------------------------------------------------------------

async function Startserver(options) {
  serverProvider = new ServerProvider(3000);
  serverProvider.addRoute('POST', options.path_server, (data, res) => {
    mainWindow.webContents.send('server:update_body', data.route.path + '\r\n');

    var data_list = data.body.toString().split("--myboundary\r\n");

    // trata o body text/plain
    if (data_list.length > 0) {
      for (var i = 0; i < data_list.length; i++) {
        if (data_list[i].includes("Content-Type")) {
          var lines = data_list[i].split("\r\n");
          var a_type = lines[0].split(": ")[1];
          if (a_type === "image/jpeg") {
            console.log('Image in event :)')
          } else {
            var info = lines.slice(3, -1).join("\r\n");

            // converte o texto de evento para um objeto do tipo JSON tratando corretamente os caracteres \n
            var futuro_json = info.replace(/\\n/g, "\\n")
              .replace(/\\'/g, "\\'")
              .replace(/\\"/g, '\\"')
              .replace(/\\&/g, "\\&")
              .replace(/\\r/g, "\\r")
              .replace(/\\t/g, "\\t")
              .replace(/\\b/g, "\\b")
              .replace(/\\f/g, "\\f")
              .replace(/\\/g, '')
              .replace(/[\u0000-\u0019]+/g, "");


            // replace do --myboundary-- para não dar erro no JSON.parse
            futuro_json = futuro_json.replace("--myboundary--", "");

            evento_json = JSON.parse(futuro_json);

            mainWindow.webContents.send('server:update_body', info.toString());
          }
        }
      }
    }
  
  // resposta ao dispositivo
  res.send({ "message": options.message, "code": "200", "auth": options.auth.toString() });
  });

  serverProvider.addRoute('GET', options.path_keepalive, (data, res) => {
    res.send('OK');
    mainWindow.webContents.send('server:update_body', options.path_keepalive + '\r\n');
  });

  serverProvider.startServer();
  mainWindow.webContents.send('server:update_body', 'INICIADO SERVIDOR -> http://IP_COMPUTADOR:3000' + '\r\n');
  mainWindow.webContents.send('server:update_body', 'Rota eventos: /' + options.path_server + '\r\n');
  mainWindow.webContents.send('server:update_body', 'Rota keepalive /' + options.path_keepalive + '\r\n');
  mainWindow.webContents.send('server:update_body', 'AGUARDANDO EVENTOS... \r\n');

  // StopServer
  ipcMain.on('server:stop', (e, options) => {
    serverProvider.stopServer();
    mainWindow.webContents.send('server:update_body', 'SERVIDOR PARADO!' + '\r\n');
  });
}

// StartServer
ipcMain.on('server:start', (e, options) => {
  Startserver(options);
});

// Close Window
app.on('window-all-closed', () => {
  if (!isMac) app.quit();
});

// Open a window if none are open (macOS)
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
});