const crypto = require('crypto');

class Block {
    constructor(index, timestamp, data, previousHash = '') {
        this.index = index;
        this.timestamp = timestamp;
        this.data = data;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
        this.nonce = 0;
    }

    calculateHash() {
        return crypto
            .createHash('sha256')
            .update(this.index + this.previousHash + this.timestamp + JSON.stringify(this.data) + this.nonce)
            .digest('hex');
    }

    mineBlock(difficulty) {
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
            this.nonce++;
            this.hash = this.calculateHash();
        }

        console.log(`Block mined: ${this.hash}`);
    }
}

class Blockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 2;
    }

    createGenesisBlock() {
        return new Block(0, '01/01/2021', 'Genesis Block', '0');
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    addBlock(newBlock) {
        newBlock.previousHash = this.getLatestBlock().hash;
        newBlock.mineBlock(this.difficulty);
        this.chain.push(newBlock);
    }

    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }

            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }

        return true;
    }
}

class Transaction {
    constructor(fromAddress, toAddress, amount) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
    }
}

class RebelCoin {
    constructor() {
        this.blockchain = new Blockchain();
        this.pendingTransactions = [];
        this.miningReward = 100;
    }

    createTransaction(transaction) {
        this.pendingTransactions.push(transaction);
    }

    minePendingTransactions(miningRewardAddress) {
        const block = new Block(Date.now(), this.pendingTransactions, this.blockchain.getLatestBlock().hash);
        block.mineBlock(this.blockchain.difficulty);

        console.log('Block successfully mined!');
        this.blockchain.addBlock(block);

        this.pendingTransactions = [
            new Transaction(null, miningRewardAddress, this.miningReward)
        ];
    }

    getBalanceOfAddress(address) {
        let balance = 0;

        for (const block of this.blockchain.chain) {
            for (const trans of block.data) {
                if (trans.fromAddress === address) {
                    balance -= trans.amount;
                }

                if (trans.toAddress === address) {
                    balance += trans.amount;
                }
            }
        }

        return balance;
    }
}

module.exports = { Blockchain, Transaction, RebelCoin };
