// Expense Tracker App JavaScript
// Written for beginners learning JavaScript

// Data Arrays to store our transactions
let transactions = [];
let nextId = 1;

// Categories for different types of transactions
const expenseCategories = ['Food', 'Transportation', 'Shopping', 'Entertainment', 'Bills', 'Healthcare', 'Education', 'Travel', 'Other'];
const incomeCategories = ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'];

// Chart instances to keep track of our charts
let categoryChart = null;
let monthlyChart = null;

// DOM Elements - getting references to HTML elements we'll use
let themeToggle, transactionForm, editForm, editModal, categorySelect, editCategorySelect, filterCategorySelect, transactionList, monthSelector;

// Initialize the app when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('App starting up...');

    // Get DOM element references
    getDOMElements();

    // Set up all the basic functionality
    initializeApp();
    setupEventListeners();
    loadSampleData();
    updateDisplays();
});

// Get references to DOM elements
function getDOMElements() {
    themeToggle = document.getElementById('themeToggle');
    transactionForm = document.getElementById('transactionForm');
    editForm = document.getElementById('editForm');
    editModal = document.getElementById('editModal');
    categorySelect = document.getElementById('category');
    editCategorySelect = document.getElementById('editCategory');
    filterCategorySelect = document.getElementById('filterCategory');
    transactionList = document.getElementById('transactionList');
    monthSelector = document.getElementById('monthSelector');
}

// Main function to set up the app
function initializeApp() {
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;
    document.getElementById('editDate').value = today;

    // Set current month for monthly view
    const currentMonth = new Date().toISOString().slice(0, 7);
    monthSelector.value = currentMonth;

    // Fill category dropdowns with options
    populateCategorySelects();

    // Load user's theme preference
    loadTheme();

    // Load saved transactions from browser storage
    loadTransactions();
}

// Set up all event listeners
function setupEventListeners() {
    // Theme toggle button
    themeToggle.addEventListener('click', toggleTheme);

    // Tab navigation
    setupTabNavigation();

    // Form submissions
    transactionForm.addEventListener('submit', handleAddTransaction);
    editForm.addEventListener('submit', handleEditTransaction);

    // Transaction type change (to update categories)
    document.getElementById('type').addEventListener('change', updateCategories);
    document.getElementById('editType').addEventListener('change', updateEditCategories);

    // Export button
    document.getElementById('exportBtn').addEventListener('click', exportToCSV);

    // Filter dropdown
    filterCategorySelect.addEventListener('change', filterTransactions);

    // Month selector
    monthSelector.addEventListener('change', updateMonthlyView);

    // Modal controls
    document.getElementById('closeModal').addEventListener('click', closeEditModal);
    document.getElementById('cancelEdit').addEventListener('click', closeEditModal);

    // Close modal when clicking outside
    editModal.addEventListener('click', function(e) {
        if (e.target === editModal) {
            closeEditModal();
        }
    });
}

// Set up tab navigation functionality
function setupTabNavigation() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');

            // Remove active class from all tabs and panels
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanels.forEach(p => p.classList.remove('active'));

            // Add active class to clicked tab and corresponding panel
            this.classList.add('active');
            document.getElementById(targetTab).classList.add('active');

            // Update charts if charts tab is opened
            if (targetTab === 'charts') {
                setTimeout(updateCharts, 100); // Small delay for smooth animation
            }

            // Update monthly view if monthly tab is opened
            if (targetTab === 'monthly') {
                updateMonthlyView();
            }
        });
    });
}

// Fill category dropdown menus
function populateCategorySelects() {
    // Clear existing options
    categorySelect.innerHTML = '<option value="">Select category</option>';
    editCategorySelect.innerHTML = '<option value="">Select category</option>';
    filterCategorySelect.innerHTML = '<option value="">All Categories</option>';

    // Add expense categories by default
    expenseCategories.forEach(category => {
        const option1 = new Option(category, category);
        const option2 = new Option(category, category);
        const option3 = new Option(category, category);

        categorySelect.appendChild(option1);
        editCategorySelect.appendChild(option2);
        filterCategorySelect.appendChild(option3);
    });
}

// Update categories when transaction type changes
function updateCategories() {
    const type = document.getElementById('type').value;
    const categories = type === 'income' ? incomeCategories : expenseCategories;

    categorySelect.innerHTML = '<option value="">Select category</option>';
    categories.forEach(category => {
        const option = new Option(category, category);
        categorySelect.appendChild(option);
    });
}

// Update categories in edit form
function updateEditCategories() {
    const type = document.getElementById('editType').value;
    const categories = type === 'income' ? incomeCategories : expenseCategories;

    editCategorySelect.innerHTML = '<option value="">Select category</option>';
    categories.forEach(category => {
        const option = new Option(category, category);
        editCategorySelect.appendChild(option);
    });
}

// Handle adding new transaction
function handleAddTransaction(e) {
    e.preventDefault();

    // Get form data
    const formData = new FormData(transactionForm);
    const transaction = {
        id: nextId++,
        type: document.getElementById('type').value,
        amount: parseFloat(document.getElementById('amount').value),
        description: document.getElementById('description').value,
        category: document.getElementById('category').value,
        date: document.getElementById('date').value,
        timestamp: new Date().toISOString()
    };

    // Add to transactions array
    transactions.push(transaction);

    // Save to localStorage
    saveTransactions();

    // Update all displays
    updateDisplays();

    // Reset form
    transactionForm.reset();
    document.getElementById('date').value = new Date().toISOString().split('T')[0];

    // Show success message
    showNotification('Transaction added successfully!', 'success');
}

// Handle editing transaction
function handleEditTransaction(e) {
    e.preventDefault();

    const id = parseInt(editForm.getAttribute('data-edit-id'));
    const transactionIndex = transactions.findIndex(t => t.id === id);

    if (transactionIndex !== -1) {
        // Update transaction
        transactions[transactionIndex] = {
            ...transactions[transactionIndex],
            type: document.getElementById('editType').value,
            amount: parseFloat(document.getElementById('editAmount').value),
            description: document.getElementById('editDescription').value,
            category: document.getElementById('editCategory').value,
            date: document.getElementById('editDate').value,
            updatedAt: new Date().toISOString()
        };

        // Save to localStorage
        saveTransactions();

        // Update displays
        updateDisplays();

        // Close modal
        closeEditModal();

        // Show success message
        showNotification('Transaction updated successfully!', 'success');
    }
}

// Open edit modal with transaction data
function editTransaction(id) {
    const transaction = transactions.find(t => t.id === id);
    if (!transaction) return;

    // Fill form with transaction data
    document.getElementById('editType').value = transaction.type;
    document.getElementById('editAmount').value = transaction.amount;
    document.getElementById('editDescription').value = transaction.description;
    document.getElementById('editDate').value = transaction.date;

    // Update categories and select the right one
    updateEditCategories();
    setTimeout(() => {
        document.getElementById('editCategory').value = transaction.category;
    }, 50);

    // Set the transaction ID
    editForm.setAttribute('data-edit-id', id);

    // Show modal
    editModal.style.display = 'block';
}

// Close edit modal
function closeEditModal() {
    editModal.style.display = 'none';
    editForm.reset();
    editForm.removeAttribute('data-edit-id');
}

// Delete transaction
function deleteTransaction(id) {
    if (confirm('Are you sure you want to delete this transaction?')) {
        transactions = transactions.filter(t => t.id !== id);
        saveTransactions();
        updateDisplays();
        showNotification('Transaction deleted successfully!', 'success');
    }
}

// Update all displays
function updateDisplays() {
    updateSummary();
    updateTransactionList();
    updateMonthlyView();
    populateFilterOptions();
}

// Update balance summary
function updateSummary() {
    const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const balance = income - expenses;

    // Update display
    document.getElementById('totalBalance').textContent = formatCurrency(balance);
    document.getElementById('totalIncome').textContent = formatCurrency(income);
    document.getElementById('totalExpense').textContent = formatCurrency(expenses);

    // Add color classes for positive/negative balance
    const balanceElement = document.getElementById('totalBalance');
    balanceElement.style.color = balance >= 0 ? 'var(--success)' : 'var(--danger)';
}

// Update transaction list
function updateTransactionList() {
    const filterCategory = filterCategorySelect.value;
    let filteredTransactions = transactions;

    if (filterCategory) {
        filteredTransactions = transactions.filter(t => t.category === filterCategory);
    }

    // Sort by date (newest first)
    filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (filteredTransactions.length === 0) {
        transactionList.innerHTML = '<p class="empty-state">No transactions found.</p>';
        return;
    }

    transactionList.innerHTML = filteredTransactions.map(transaction => `
        <div class="transaction-item">
            <div class="transaction-info">
                <div class="transaction-header">
                    <span class="transaction-description">${transaction.description}</span>
                    <span class="transaction-amount ${transaction.type}">
                        ${transaction.type === 'income' ? '+' : '-'}${formatCurrency(transaction.amount)}
                    </span>
                </div>
                <div class="transaction-meta">
                    <span>📅 ${formatDate(transaction.date)}</span>
                    <span>🏷️ ${transaction.category}</span>
                </div>
            </div>
            <div class="transaction-actions">
                <button onclick="editTransaction(${transaction.id})" class="action-btn edit-btn">✏️ Edit</button>
                <button onclick="deleteTransaction(${transaction.id})" class="action-btn delete-btn">🗑️ Delete</button>
            </div>
        </div>
    `).join('');
}

// Update monthly view
function updateMonthlyView() {
    const selectedMonth = monthSelector.value;
    const monthlyTransactions = transactions.filter(t => t.date.startsWith(selectedMonth));

    // Calculate monthly stats
    const monthlyIncome = monthlyTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const monthlyExpenses = monthlyTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const monthlyNet = monthlyIncome - monthlyExpenses;

    // Update display
    document.getElementById('monthlyIncome').textContent = formatCurrency(monthlyIncome);
    document.getElementById('monthlyExpenses').textContent = formatCurrency(monthlyExpenses);
    document.getElementById('monthlyNet').textContent = formatCurrency(monthlyNet);

    // Add color for net amount
    const netElement = document.getElementById('monthlyNet');
    netElement.style.color = monthlyNet >= 0 ? 'var(--success)' : 'var(--danger)';

    // Show monthly transactions
    const monthlyTransactionsDiv = document.getElementById('monthlyTransactions');
    if (monthlyTransactions.length === 0) {
        monthlyTransactionsDiv.innerHTML = '<p class="empty-state">No transactions for this month.</p>';
        return;
    }

    monthlyTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    monthlyTransactionsDiv.innerHTML = monthlyTransactions.map(transaction => `
        <div class="transaction-item">
            <div class="transaction-info">
                <div class="transaction-header">
                    <span class="transaction-description">${transaction.description}</span>
                    <span class="transaction-amount ${transaction.type}">
                        ${transaction.type === 'income' ? '+' : '-'}${formatCurrency(transaction.amount)}
                    </span>
                </div>
                <div class="transaction-meta">
                    <span>📅 ${formatDate(transaction.date)}</span>
                    <span>🏷️ ${transaction.category}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Update charts
function updateCharts() {
    updateCategoryChart();
    updateMonthlyChart();
}

// Update category chart (pie chart)
function updateCategoryChart() {
    const ctx = document.getElementById('categoryChart').getContext('2d');
    const expenseTransactions = transactions.filter(t => t.type === 'expense');

    if (expenseTransactions.length === 0) {
        if (categoryChart) {
            categoryChart.destroy();
            categoryChart = null;
        }
        ctx.font = '16px sans-serif';
        ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--text-muted');
        ctx.textAlign = 'center';
        ctx.fillText('No expense data to display', ctx.canvas.width / 2, ctx.canvas.height / 2);
        return;
    }

    // Group expenses by category
    const categoryData = {};
    expenseTransactions.forEach(t => {
        categoryData[t.category] = (categoryData[t.category] || 0) + t.amount;
    });

    const labels = Object.keys(categoryData);
    const data = Object.values(categoryData);
    const colors = [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
        '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0'
    ];

    if (categoryChart) {
        categoryChart.destroy();
    }

    categoryChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.slice(0, labels.length),
                borderWidth: 2,
                borderColor: getComputedStyle(document.body).getPropertyValue('--bg-primary')
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: getComputedStyle(document.body).getPropertyValue('--text-primary'),
                        padding: 20
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + formatCurrency(context.raw);
                        }
                    }
                }
            }
        }
    });
}

// Update monthly chart (bar chart)
function updateMonthlyChart() {
    const ctx = document.getElementById('monthlyChart').getContext('2d');

    if (transactions.length === 0) {
        if (monthlyChart) {
            monthlyChart.destroy();
            monthlyChart = null;
        }
        ctx.font = '16px sans-serif';
        ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--text-muted');
        ctx.textAlign = 'center';
        ctx.fillText('No data to display', ctx.canvas.width / 2, ctx.canvas.height / 2);
        return;
    }

    // Get last 6 months
    const months = [];
    const currentDate = new Date();
    for (let i = 5; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const monthKey = date.toISOString().slice(0, 7);
        const monthLabel = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        months.push({ key: monthKey, label: monthLabel });
    }

    const monthlyData = months.map(month => {
        const monthTransactions = transactions.filter(t => t.date.startsWith(month.key));
        const expenses = monthTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        return expenses;
    });

    if (monthlyChart) {
        monthlyChart.destroy();
    }

    monthlyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: months.map(m => m.label),
            datasets: [{
                label: 'Monthly Expenses',
                data: monthlyData,
                backgroundColor: 'rgba(37, 99, 235, 0.7)',
                borderColor: 'rgba(37, 99, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: getComputedStyle(document.body).getPropertyValue('--text-primary')
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: getComputedStyle(document.body).getPropertyValue('--text-secondary'),
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    },
                    grid: {
                        color: getComputedStyle(document.body).getPropertyValue('--border')
                    }
                },
                x: {
                    ticks: {
                        color: getComputedStyle(document.body).getPropertyValue('--text-secondary')
                    },
                    grid: {
                        color: getComputedStyle(document.body).getPropertyValue('--border')
                    }
                }
            }
        }
    });
}

// Populate filter options
function populateFilterOptions() {
    const categories = [...new Set(transactions.map(t => t.category))];
    const currentFilter = filterCategorySelect.value;

    filterCategorySelect.innerHTML = '<option value="">All Categories</option>';
    categories.forEach(category => {
        const option = new Option(category, category);
        filterCategorySelect.appendChild(option);
    });

    // Restore previous filter
    filterCategorySelect.value = currentFilter;
}

// Filter transactions
function filterTransactions() {
    updateTransactionList();
}

// Export data to CSV
function exportToCSV() {
    if (transactions.length === 0) {
        showNotification('No transactions to export!', 'error');
        return;
    }

    const headers = ['Date', 'Type', 'Description', 'Category', 'Amount'];
    const csvData = [headers.join(',')];

    transactions.forEach(t => {
        const row = [
            t.date,
            t.type,
            `"${t.description}"`,
            t.category,
            t.amount
        ];
        csvData.push(row.join(','));
    });

    const csvString = csvData.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `expense-tracker-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    showNotification('Data exported successfully!', 'success');
}

// Theme functionality
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    themeToggle.querySelector('.theme-icon').textContent = newTheme === 'dark' ? '☀️' : '🌙';

    // Save theme preference
    localStorage.setItem('expense-tracker-theme', newTheme);

    // Update charts if they exist
    setTimeout(() => {
        if (categoryChart) updateCategoryChart();
        if (monthlyChart) updateMonthlyChart();
    }, 300);
}

function loadTheme() {
    const savedTheme = localStorage.getItem('expense-tracker-theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeToggle.querySelector('.theme-icon').textContent = savedTheme === 'dark' ? '☀️' : '🌙';
}

// Local storage functions
function saveTransactions() {
    localStorage.setItem('expense-tracker-transactions', JSON.stringify(transactions));
    localStorage.setItem('expense-tracker-next-id', nextId.toString());
}

function loadTransactions() {
    const saved = localStorage.getItem('expense-tracker-transactions');
    const savedNextId = localStorage.getItem('expense-tracker-next-id');

    if (saved) {
        transactions = JSON.parse(saved);
    }

    if (savedNextId) {
        nextId = parseInt(savedNextId);
    }
}

// Load sample data for demo
function loadSampleData() {
    if (transactions.length === 0) {
        const sampleTransactions = [
            {
                id: nextId++,
                type: 'income',
                amount: 3000,
                description: 'Monthly Salary',
                category: 'Salary',
                date: '2025-08-01',
                timestamp: new Date().toISOString()
            },
            {
                id: nextId++,
                type: 'expense',
                amount: 25.50,
                description: 'Lunch at cafe',
                category: 'Food',
                date: '2025-08-15',
                timestamp: new Date().toISOString()
            },
            {
                id: nextId++,
                type: 'expense',
                amount: 60,
                description: 'Gas station',
                category: 'Transportation',
                date: '2025-08-14',
                timestamp: new Date().toISOString()
            },
            {
                id: nextId++,
                type: 'income',
                amount: 500,
                description: 'Freelance project',
                category: 'Freelance',
                date: '2025-08-10',
                timestamp: new Date().toISOString()
            }
        ];

        transactions = sampleTransactions;
        saveTransactions();
    }
}

// Utility functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 3000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
    `;

    // Set color based on type
    if (type === 'success') {
        notification.style.backgroundColor = 'var(--success)';
    } else if (type === 'error') {
        notification.style.backgroundColor = 'var(--danger)';
    } else {
        notification.style.backgroundColor = 'var(--accent-primary)';
    }

    notification.textContent = message;
    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}