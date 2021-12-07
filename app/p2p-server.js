const { json } = require("body-parser");
const Websocket = require("ws"); /// use in the peer to peer server

const P2P_PORT = process.env.P2P_PORT || 5001;

//checking if there is any peers websocket specified
const peers = process.env.PEERS ? process.env.PEERS.split(",") : [];

const MESSAGE_TYPES = {
  chain: "CHAIN",
  transaction: "TRANSACTION",
  clear_transactions: "CLEAR_TRANSACTIONS"
};

class P2pServer {
  constructor(blockchain, transactionPool) {
    this.blockchain = blockchain;
    this.sockets = [];
    this.transactionPool = transactionPool;
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

    console.log("triggered")
    socket.on("message", (message) => {
      const data = JSON.parse(message);

      switch (data.type) {
        case MESSAGE_TYPES.chain:
          this.blockchain.replaceChain(data.chain);
          break;
        case MESSAGE_TYPES.transaction:
          console.log("trans update")
          this.transactionPool.updateOrAddTransaction(data.transaction);
          break;
        case MESSAGE_TYPES.clear_transactions:
          this.transactionPool.clear();
          break;
      }
    });
  }

  sendChain(socket) {
    socket.send(
      JSON.stringify({
        type: MESSAGE_TYPES.chain,
        chain: this.blockchain.chain,
      })
    );
  }

  sendTransaction(socket, transaction) {
    console.log("transactionsent")
    socket.send(
      JSON.stringify({ type: MESSAGE_TYPES.transaction, transaction })
    );
  }

  syncChains() {
    this.sockets.forEach((socket) => {
      this.sendChain(socket);
    });
  }

  broadcastTransaction(transaction) {
    console.log(this.sockets.length);
    this.sockets.forEach((socket) => this.sendTransaction(socket, transaction));
  
  }

  broadcastClearTransaction(transaction) {
    console.log(this.sockets.length);
    this.sockets.forEach((socket) => socket.send(JSON.stringify({
      type: MESSAGE_TYPES.clear_transactions
    })));
  }
}

module.exports = P2pServer;
