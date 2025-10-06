/**
 * Budget & Revenue Management Module
 * Handles financial tracking, income/expense management, and revenue analytics
 */

import { firebaseAdmin } from './firebase-admin.js';

class BudgetManager {
    constructor() {
        this.firebaseAdmin = firebaseAdmin;
        this.expenses = [];
        this.revenue = [];
        this.init();
    }

    async init() {
        await this.loadFinancialData();
        this.updateBudgetSummary();
        this.updateBreakdowns();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Add Income button
        const addIncomeBtn = document.getElementById('add-income-btn');
        if (addIncomeBtn) {
            addIncomeBtn.addEventListener('click', () => this.showAddIncomeModal());
        }

        // Add Expense button
        const addExpenseBtn = document.getElementById('add-expense-btn');
        if (addExpenseBtn) {
            addExpenseBtn.addEventListener('click', () => this.showAddExpenseModal());
        }

        // Export Report button
        const exportBtn = document.getElementById('export-budget-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportBudgetReport());
        }
    }

    async loadFinancialData() {
        try {
            // Load submissions to calculate project revenue
            const result = await this.firebaseAdmin.getContactSubmissions();
            const submissions = result.submissions || [];
            this.calculateProjectRevenue(submissions);
            
            // In a real app, you'd load expenses from a separate collection
            // For now, we'll use sample data
            this.loadSampleData();
        } catch (error) {
            console.error('Error loading financial data:', error);
            this.loadSampleData();
        }
    }

    calculateProjectRevenue(submissions) {
        // Calculate revenue from completed projects
        const completedProjects = submissions.filter(s => s.status === 'completed');
        
        const budgetValues = {
            'under-5k': 2500,
            '5k-15k': 10000,
            '15k-50k': 32500,
            '50k-100k': 75000,
            'over-100k': 150000
        };

        this.revenue = completedProjects.map(project => ({
            id: project.id,
            source: 'Project Revenue',
            description: `${project.businessName || 'Client'} - ${project.projectType || 'Project'}`,
            amount: budgetValues[project.budget] || 0,
            date: project.timestamp,
            type: 'project'
        }));

        // Add sample AdSense revenue
        this.addSampleAdSenseRevenue();
    }

    addSampleAdSenseRevenue() {
        // Add sample monthly AdSense revenue
        const currentMonth = new Date();
        for (let i = 0; i < 6; i++) {
            const date = new Date(currentMonth);
            date.setMonth(date.getMonth() - i);
            
            this.revenue.push({
                id: `adsense-${i}`,
                source: 'Google AdSense',
                description: `AdSense Revenue - ${date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
                amount: Math.floor(Math.random() * 500) + 100, // Random between $100-$600
                date: date.toISOString(),
                type: 'adsense'
            });
        }
    }

    loadSampleData() {
        // Sample expenses data
        this.expenses = [
            {
                id: 'exp-1',
                category: 'Google Ads',
                description: 'Search Campaign - December',
                amount: 850,
                date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                type: 'advertising'
            },
            {
                id: 'exp-2',
                category: 'Software & Tools',
                description: 'VS Code Pro License',
                amount: 199,
                date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
                type: 'tools'
            },
            {
                id: 'exp-3',
                category: 'Hosting & Infrastructure',
                description: 'Cloudflare Pro Plan',
                amount: 20,
                date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
                type: 'hosting'
            },
            {
                id: 'exp-4',
                category: 'Marketing',
                description: 'Social Media Ads',
                amount: 300,
                date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
                type: 'marketing'
            }
        ];
    }

    updateBudgetSummary() {
        // Calculate totals
        const totalRevenue = this.revenue.reduce((sum, item) => sum + item.amount, 0);
        const totalExpenses = this.expenses.reduce((sum, item) => sum + item.amount, 0);
        const netProfit = totalRevenue - totalExpenses;

        // Update summary cards
        this.updateSummaryCard('total-revenue', totalRevenue, 'positive');
        this.updateSummaryCard('total-expenses', totalExpenses, 'negative');
        this.updateSummaryCard('net-profit', netProfit, netProfit >= 0 ? 'positive' : 'negative');
        this.updateSummaryCard('profit-margin', 
            totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0, 
            netProfit >= 0 ? 'positive' : 'negative',
            '%'
        );
    }

    updateSummaryCard(id, amount, className, suffix = '') {
        const card = document.getElementById(id);
        if (card) {
            const amountElement = card.querySelector('.summary-amount');
            if (amountElement) {
                amountElement.textContent = suffix === '%' ? `${amount}${suffix}` : `$${amount.toLocaleString()}`;
                amountElement.className = `summary-amount ${className}`;
            }
        }
    }

    updateBreakdowns() {
        this.updateRevenueBreakdown();
        this.updateExpenseBreakdown();
    }

    updateRevenueBreakdown() {
        const container = document.getElementById('revenue-breakdown');
        if (!container) return;

        // Group revenue by source
        const revenueBySource = {};
        this.revenue.forEach(item => {
            revenueBySource[item.source] = (revenueBySource[item.source] || 0) + item.amount;
        });

        container.innerHTML = '';
        Object.entries(revenueBySource).forEach(([source, amount]) => {
            const item = document.createElement('div');
            item.className = 'budget-item';
            item.innerHTML = `
                <span class="item-label">${source}</span>
                <span class="item-amount">$${amount.toLocaleString()}</span>
            `;
            container.appendChild(item);
        });
    }

    updateExpenseBreakdown() {
        const container = document.getElementById('expense-breakdown');
        if (!container) return;

        // Group expenses by category
        const expensesByCategory = {};
        this.expenses.forEach(item => {
            expensesByCategory[item.category] = (expensesByCategory[item.category] || 0) + item.amount;
        });

        container.innerHTML = '';
        Object.entries(expensesByCategory).forEach(([category, amount]) => {
            const item = document.createElement('div');
            item.className = 'budget-item';
            item.innerHTML = `
                <span class="item-label">${category}</span>
                <span class="item-amount negative">-$${amount.toLocaleString()}</span>
            `;
            container.appendChild(item);
        });
    }

    showAddIncomeModal() {
        const modal = this.createIncomeModal();
        document.body.appendChild(modal);
        modal.style.display = 'flex';
    }

    showAddExpenseModal() {
        const modal = this.createExpenseModal();
        document.body.appendChild(modal);
        modal.style.display = 'flex';
    }

    createIncomeModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Add Income Entry</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <form id="add-income-form" class="modal-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Source</label>
                            <select id="income-source" required>
                                <option value="">Select source...</option>
                                <option value="Project Revenue">Project Revenue</option>
                                <option value="Google AdSense">Google AdSense</option>
                                <option value="Consulting">Consulting</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Amount ($)</label>
                            <input type="number" id="income-amount" min="0" step="0.01" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Description</label>
                        <input type="text" id="income-description" placeholder="Brief description of income" required>
                    </div>
                    <div class="form-group">
                        <label>Date</label>
                        <input type="date" id="income-date" required>
                    </div>
                    <div class="modal-actions">
                        <button type="button" class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                        <button type="submit" class="btn-primary">Add Income</button>
                    </div>
                </form>
            </div>
        `;

        // Set default date to today
        const dateInput = modal.querySelector('#income-date');
        dateInput.value = new Date().toISOString().split('T')[0];

        // Handle form submission
        const form = modal.querySelector('#add-income-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addIncomeEntry(modal);
        });

        return modal;
    }

    createExpenseModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Add Expense Entry</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <form id="add-expense-form" class="modal-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Category</label>
                            <select id="expense-category" required>
                                <option value="">Select category...</option>
                                <option value="Google Ads">Google Ads</option>
                                <option value="Software & Tools">Software & Tools</option>
                                <option value="Hosting & Infrastructure">Hosting & Infrastructure</option>
                                <option value="Marketing">Marketing</option>
                                <option value="Office Expenses">Office Expenses</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Amount ($)</label>
                            <input type="number" id="expense-amount" min="0" step="0.01" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Description</label>
                        <input type="text" id="expense-description" placeholder="Brief description of expense" required>
                    </div>
                    <div class="form-group">
                        <label>Date</label>
                        <input type="date" id="expense-date" required>
                    </div>
                    <div class="modal-actions">
                        <button type="button" class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                        <button type="submit" class="btn-primary">Add Expense</button>
                    </div>
                </form>
            </div>
        `;

        // Set default date to today
        const dateInput = modal.querySelector('#expense-date');
        dateInput.value = new Date().toISOString().split('T')[0];

        // Handle form submission
        const form = modal.querySelector('#add-expense-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addExpenseEntry(modal);
        });

        return modal;
    }

    addIncomeEntry(modal) {
        const formData = {
            id: `income-${Date.now()}`,
            source: modal.querySelector('#income-source').value,
            description: modal.querySelector('#income-description').value,
            amount: parseFloat(modal.querySelector('#income-amount').value),
            date: modal.querySelector('#income-date').value + 'T00:00:00.000Z',
            type: 'manual'
        };

        this.revenue.push(formData);
        this.updateBudgetSummary();
        this.updateBreakdowns();
        
        modal.remove();
        this.showNotification('Income entry added successfully', 'success');
    }

    addExpenseEntry(modal) {
        const formData = {
            id: `expense-${Date.now()}`,
            category: modal.querySelector('#expense-category').value,
            description: modal.querySelector('#expense-description').value,
            amount: parseFloat(modal.querySelector('#expense-amount').value),
            date: modal.querySelector('#expense-date').value + 'T00:00:00.000Z',
            type: 'manual'
        };

        this.expenses.push(formData);
        this.updateBudgetSummary();
        this.updateBreakdowns();
        
        modal.remove();
        this.showNotification('Expense entry added successfully', 'success');
    }

    exportBudgetReport() {
        const reportData = {
            generatedAt: new Date().toISOString(),
            summary: {
                totalRevenue: this.revenue.reduce((sum, item) => sum + item.amount, 0),
                totalExpenses: this.expenses.reduce((sum, item) => sum + item.amount, 0),
                netProfit: this.revenue.reduce((sum, item) => sum + item.amount, 0) - 
                          this.expenses.reduce((sum, item) => sum + item.amount, 0)
            },
            revenue: this.revenue,
            expenses: this.expenses
        };

        // Create and download JSON file
        const dataStr = JSON.stringify(reportData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `budget-report-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        this.showNotification('Budget report exported successfully', 'success');
    }

    showNotification(message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize budget manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('budget-view')) {
        window.budgetManager = new BudgetManager();
    }
});