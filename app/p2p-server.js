const { json } = require("body-parser");
const Websocket = require("ws"); /// use in the peer to peer server

const P2P_PORT = process.env.P2P_PORT || 5001;

//checking if there is any peers websocket specified
const peers = process.env.PEERS ? process.env.PEERS.split(",") : [];

class P2pServer {
  constructor(blockchain) {
    this.blockchain = blockchain;
    this.sockets = [];
  }

  listen() {
    const server = new Websocket.Server({
      port: P2P_PORT,
    });

    server.on("connection", (socket) => this.connectSocket(socket));

    this.connectToPeers();

    console.log(`Listening for peer-peer connection on: ${P2P_PORT}`);
  }

  connectToPeers() {
    peers.forEach((peer) => {
      //ws://localhost:5001

      const socket = new Websocket(peer);

      //if one peer should come after another but it is specify first
      //by using the open event, the first peer will wait until the other
      //is connected

      socket.on("open", () => this.connectSocket(socket));
    });
  }

  connectSocket(socket) {
    this.sockets.push(socket);
    console.log("Socket connected");
    this.messageHandler(socket);

    this.sendChain(socket);
  }

  messageHandler(socket) {
    socket.on("message", (message) => {
      const data = JSON.parse(message);

      this.blockchain.replaceChain(data);
    });
  }

  sendChain(socket){
    socket.send(JSON.stringify(this.blockchain.chain));
  }

  syncChains(){
      
    this.sockets.forEach(socket => {
        this.sendChain(socket);
    });
  }
}

module.exports = P2pServer;
