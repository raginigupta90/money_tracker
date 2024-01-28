document.addEventListener('DOMContentLoaded', () => {
    loadTransactions();
});

async function loadTransactions() {
    const transactionList = document.getElementById('transaction-list');
    transactionList.innerHTML = '';

    const response = await fetch('/api/transactions');
    const transactions = await response.json();

    transactions.forEach(transaction => {
        displayTransaction(transaction);
    });

    updateBalance(transactions);
}

function displayTransaction(transaction) {
    const transactionList = document.getElementById('transaction-list');
    const transactionDiv = document.createElement('div');
    transactionDiv.className = `transaction ${transaction.type === 'income' ? 'income' : 'expense'}`;
    transactionDiv.innerHTML = `
        <div>${transaction.description}</div>
        <div>${transaction.amount}</div>
        <div>
            <button onclick="deleteTransaction('${transaction._id}')">Delete</button>
            <button onclick="editTransaction('${transaction._id}', '${transaction.description}', ${transaction.amount}, '${transaction.type}')">Edit</button>
        </div>
    `;
    transactionList.appendChild(transactionDiv);
}

async function addTransaction() {
    const description = document.getElementById('description').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const type = document.getElementById('type').value;

    if (!description || isNaN(amount)) {
        alert('Please enter valid values for description and amount.');
        return;
    }

    const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description, amount, type }),
    });

    const newTransaction = await response.json();
    displayTransaction(newTransaction);

    updateBalance(await getTransactions());
}

async function deleteTransaction(id) {
    const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
    });

    const deletedTransaction = await response.json();

    // Remove the deleted transaction from the UI
    const transactionElement = document.querySelector(`[data-id="${id}"]`);
    transactionElement.remove();

    updateBalance(await getTransactions());
}

function editTransaction(id, description, amount, type) {
    const updatedDescription = prompt('Edit description:', description);
    const updatedAmount = parseFloat(prompt('Edit amount:', amount));
    const updatedType = prompt('Edit type (income/expense):', type);

    if (!updatedDescription || isNaN(updatedAmount) || !['income', 'expense'].includes(updatedType)) {
        alert('Invalid values. Transaction not updated.');
        return;
    }

    const updatedTransaction = {
        description: updatedDescription,
        amount: updatedAmount,
        type: updatedType,
    };

    updateTransaction(id, updatedTransaction);
}

async function updateTransaction(id, updatedTransaction) {
    const response = await fetch(`/api/transactions/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTransaction),
    });

    const transaction = await response.json();

    // Update the UI with the edited transaction
    const transactionElement = document.querySelector(`[data-id="${id}"]`);
    transactionElement.innerHTML = `
        <div>${transaction.description}</div>
        <div>${transaction.amount}</div>
        <div>
            <button onclick="deleteTransaction('${transaction._id}')">Delete</button>
            <button onclick="editTransaction('${transaction._id}', '${transaction.description}', ${transaction.amount}, '${transaction.type}')">Edit</button>
        </div>
    `;

    updateBalance(await getTransactions());
}

async function getTransactions() {
    const response = await fetch('/api/transactions');
    return await response.json();
}

function updateBalance(transactions) {
    const balanceElement = document.getElementById('balance');
    const total = transactions.reduce((acc, transaction) => {
        return transaction.type === 'income' ? acc + transaction.amount : acc - transaction.amount;
    }, 0);

    balanceElement.textContent = `Balance: $${total.toFixed(2)}`;

    if (total >= 0) {
        balanceElement.classList.remove('negative-balance');
        balanceElement.classList.add('positive-balance');
    } else {
        balanceElement.classList.remove('positive-balance');
        balanceElement.classList.add('negative-balance');
    }
}
