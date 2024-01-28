const express = require('express');
const mongoose = require('mongoose');
const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect('mongodb://localhost/money_tracker', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const transactionSchema = new mongoose.Schema({
    description: String,
    amount: Number,
    type: String
});

const Transaction = mongoose.model('Transaction', transactionSchema);

app.use(express.json());
app.use(express.static('public'));

// Add a new transaction
app.post('/api/transactions', async (req, res) => {
    try {
        const { description, amount, type } = req.body;
        const transaction = new Transaction({ description, amount, type });
        await transaction.save();
        res.status(201).send(transaction);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Get all transactions
app.get('/api/transactions', async (req, res) => {
    try {
        const transactions = await Transaction.find();
        res.send(transactions);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Delete a transaction
app.delete('/api/transactions/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const transaction = await Transaction.findByIdAndDelete(id);
        if (!transaction) {
            return res.status(404).send("Transaction not found");
        }
        res.send(transaction);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Update a transaction
app.patch('/api/transactions/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const { description, amount, type } = req.body;
        const transaction = await Transaction.findByIdAndUpdate(
            id,
            { description, amount, type },
            { new: true }
        );
        if (!transaction) {
            return res.status(404).send("Transaction not found");
        }
        res.send(transaction);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
