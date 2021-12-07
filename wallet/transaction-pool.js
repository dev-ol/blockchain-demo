const Transaction = require('./transaction');

class TransactionPool {
  constructor() {
    this.transactions = [];
  }

  updateOrAddTransaction(transaction) {

    let transactionWithId = this.transactions.find(
      t => t.id === transaction.id
    );

    //transactionWithid will be undefined if nothing is found
    if (transactionWithId) {
      this.transactions[this.transactions.indexOf(transactionWithId)] =
        transaction;
    } else {
      console.log("trans pushed")
      this.transactions.push(transaction);
    }
  }

  existingTransaction(address){
    return this.transactions.find(t => t.input.address === address);
  }

  validTransactions(){
    return this.transactions.filter(transaction => {
      const outputTotal = transaction.outputs.reduce((total, output) => {
        return total + output.amount;
      }, 0);


      if(transaction.input.amount !== outputTotal){
        console.log(`Invalid transaction from ${transaction.input.address}.`);
        return;
      }

   
      if(!Transaction.verifyTransaction(transaction)){
        console.log(`Invalid signature from ${transactio.input.address}.`);
        return;
      }

      return transaction;
    });

   
  }

  clear(){
    this.transactions = [];
  }
}


module.exports = TransactionPool;
