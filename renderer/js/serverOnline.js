const express = require('express');;
const bodyParser = require('body-parser');

// Classe core responsavel pelo provisionamento do servidor
class ServerOnlineProvider {
  constructor(port) {
    this.port = port || 3000;
    this.server = express();
    this.server.use(bodyParser.raw({ type: '*/*' }));
  }

  startServer() {
    this.expressServer = this.server.listen(this.port, () => {
      console.log(`Server running...`);
    });
  }

  stopServer() {
    if (this.expressServer) {
      this.expressServer.close();
      console.log('Server stopped.');
    }
    if (this.expressServerHttps) {
      this.expressServerHttps.close();
      console.log('Server stopped.');
    }
  }

  addRoute(method, path, handler) {
    this.server[method.toLowerCase()](path, (req, res) => {
      console.log(`Received ${method} request to ${path}:`);
      handler(req, res);
    });
  }
}

module.exports = ServerOnlineProvider;