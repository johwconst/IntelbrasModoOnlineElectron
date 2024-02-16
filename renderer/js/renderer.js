// Online Page Components
const onlinePage = {
  IpServer: document.querySelector('#online_ip_server'),
  PortServer : document.querySelector('#online_port_server'),
  PathServer : document.querySelector('#online_path_Server'),
  StartServer : document.querySelector('#online_start_button'),
  StopServer : document.querySelector('#online_stop_button'),
  Body : document.querySelector('#online_body'),
  OnlineMessage : document.querySelector('#online_message'),
  ToggleReturn : document.querySelector('#online_toggle_return'),
  Message : document.querySelector('#online_message'),
  Terminal : document.querySelector('#terminal_eventmanager_style'),
};

// Atualiza Body
ipcRenderer.on('server:update_body', (body) =>{
  onlinePage.Body.innerText+=body;
  onlinePage.Body.scrollTop = onlinePage.Body.scrollHeight;
  }
);

// Start Server
function Startserver(){
  path_server = document.querySelector('#online_path_server').value;
  path_keepalive = document.querySelector('#online_path_keepalive').value;
  auth = onlinePage.ToggleReturn.checked
  message = onlinePage.Message.value

  ipcRenderer.send('server:start', {
    path_server,
    path_keepalive,
    auth,
    message
  });
}

// Stop Server
function Stopserver(){
  ipcRenderer.send('server:stop', {
  });
}

// Toggle 
function changeReturnValue(){
  path_server = document.querySelector('#online_path_server').value;
  path_keepalive = document.querySelector('#online_path_keepalive').value;
  auth = onlinePage.ToggleReturn.checked
  message = onlinePage.Message.value

  ipcRenderer.send('server:stop', {
  });
  ipcRenderer.send('server:start', {
    path_server,
    path_keepalive,
    auth,
    message
  });
}

onlinePage.ToggleReturn.addEventListener('change', changeReturnValue)
onlinePage.Message.addEventListener('change', changeReturnValue)
onlinePage.StartServer.addEventListener('click', Startserver);
onlinePage.StopServer.addEventListener('click', Stopserver);

module.exports = {
  eventPage: eventPage
}
