const SHA256 = require("crypto-js/sha256");
const { DIFFICULTY, MIME_RATE } = require("../config");

class Block {
  constructor(timestamp, lastHash, hash, data, nonce, difficulty) {
    this.timestamp = timestamp;
    this.lastHash = lastHash;
    this.hash = hash;
    this.data = data;
    this.nonce = nonce;
    this.difficulty = difficulty || DIFFICULTY;
  }

  toString() {
    return `Block -\n
        Timestamp: ${this.timestamp} \n
        Last Hash: ${this.lastHash.substring(0, 10)} \n
        Hash: ${this.hash.substring(0, 10)} \n
        Difficulty: ${this.difficulty}\n
        Nonce: ${this.nonce}\n
        Data: ${this.data}\n`;
  }

  static genesis() {
    return new this("Gen Time", "-----", "f1r57-h4sh", [], 0, DIFFICULTY);
  }

  static mineBlock(lastBlock, data) {
    let hash, timestamp;
    const lastHash = lastBlock.hash;
    let { difficulty } = lastBlock; //es9; takes the diffculty from the object.
    let nonce = 0;

    do {
      nonce++;

      timestamp = Date.now();
      difficulty = Block.adjustDifficult(lastBlock, timestamp);

      hash = Block.hash(timestamp, lastHash, data, nonce, difficulty);
    } while (hash.substring(0, difficulty) !== "0".repeat(difficulty));

    return new this(timestamp, lastHash, hash, data, nonce, difficulty);
  }

  static hash(timestamp, lastHash, data, nonce, difficulty) {
    return SHA256(
      `${timestamp}${lastHash}${data}${nonce}${difficulty}`
    ).toString();
  }

  static blockHash(block) {
    const { timestamp, lastHash, data, nonce, difficulty } = block;
    return Block.hash(timestamp, lastHash, data, nonce, difficulty);
  }

  static adjustDifficult(lastBlock, currentTime) {
    let { difficulty } = lastBlock;
    
    //TODO: need to look at that more
    difficulty =
      lastBlock.timestamp + MIME_RATE > currentTime
        ? difficulty + 1
        : difficulty - 1;

    return difficulty;
  }
}

module.exports = Block;
