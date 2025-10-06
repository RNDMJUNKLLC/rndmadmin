/**
 * Website Management Module
 * Handles contact form submissions, client data, and website analytics
 */

import { FirebaseAdminService } from './firebase-admin.js';

class WebsiteManager {
    constructor() {
        this.firebaseAdmin = new FirebaseAdminService();
        this.submissions = [];
        this.currentFilter = 'all';
        this.init();
    }

    async init() {
        await this.loadSubmissions();
        this.setupEventListeners();
        this.updateStats();
    }

    setupEventListeners() {
        // Refresh button
        const refreshBtn = document.getElementById('refresh-submissions');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadSubmissions());
        }

        // Filter dropdown
        const filterSelect = document.getElementById('submission-filter');
        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => {
                this.currentFilter = e.target.value;
                this.renderSubmissions();
            });
        }

        // Real-time updates
        this.firebaseAdmin.onSubmissionsUpdate((submissions) => {
            this.submissions = submissions;
            this.renderSubmissions();
            this.updateStats();
        });
    }

    async loadSubmissions() {
        try {
            this.showLoading();
            this.submissions = await this.firebaseAdmin.getAllSubmissions();
            this.renderSubmissions();
            this.updateStats();
        } catch (error) {
            console.error('Error loading submissions:', error);
            this.showError('Failed to load submissions');
        }
    }

    renderSubmissions() {
        const tbody = document.getElementById('submissions-tbody');
        if (!tbody) return;

        // Filter submissions
        let filteredSubmissions = [...this.submissions];
        if (this.currentFilter !== 'all') {
            filteredSubmissions = this.submissions.filter(submission => 
                submission.status === this.currentFilter
            );
        }

        // Sort by timestamp (newest first)
        filteredSubmissions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        tbody.innerHTML = '';

        if (filteredSubmissions.length === 0) {
            tbody.innerHTML = `
                <tr class="loading-row">
                    <td colspan="7">No submissions found</td>
                </tr>
            `;
            return;
        }

        filteredSubmissions.forEach(submission => {
            const row = this.createSubmissionRow(submission);
            tbody.appendChild(row);
        });
    }

    createSubmissionRow(submission) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${submission.businessName || 'N/A'}</td>
            <td>${submission.email}</td>
            <td>${submission.projectType || 'Not specified'}</td>
            <td>$${submission.budget || 'Not specified'}</td>
            <td>
                <span class="status-badge status-${submission.status || 'pending'}">
                    ${(submission.status || 'pending').charAt(0).toUpperCase() + (submission.status || 'pending').slice(1)}
                </span>
            </td>
            <td>${this.formatDate(submission.timestamp)}</td>
            <td>
                <button class="btn-edit" onclick="websiteManager.editSubmission('${submission.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-delete" onclick="websiteManager.deleteSubmission('${submission.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        return row;
    }

    async editSubmission(submissionId) {
        const submission = this.submissions.find(s => s.id === submissionId);
        if (!submission) return;

        // Create modal for editing
        const modal = this.createEditModal(submission);
        document.body.appendChild(modal);
        
        // Show modal
        modal.style.display = 'flex';
    }

    createEditModal(submission) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Edit Submission</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <form id="edit-submission-form" class="modal-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Business Name</label>
                            <input type="text" id="edit-businessName" value="${submission.businessName || ''}" required>
                        </div>
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" id="edit-email" value="${submission.email || ''}" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Phone</label>
                            <input type="text" id="edit-phone" value="${submission.phone || ''}">
                        </div>
                        <div class="form-group">
                            <label>Project Type</label>
                            <select id="edit-projectType">
                                <option value="website" ${submission.projectType === 'website' ? 'selected' : ''}>Website Development</option>
                                <option value="mobile-app" ${submission.projectType === 'mobile-app' ? 'selected' : ''}>Mobile App</option>
                                <option value="web-app" ${submission.projectType === 'web-app' ? 'selected' : ''}>Web Application</option>
                                <option value="ecommerce" ${submission.projectType === 'ecommerce' ? 'selected' : ''}>E-commerce</option>
                                <option value="consulting" ${submission.projectType === 'consulting' ? 'selected' : ''}>Consulting</option>
                                <option value="other" ${submission.projectType === 'other' ? 'selected' : ''}>Other</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Budget Range</label>
                            <select id="edit-budget">
                                <option value="under-5k" ${submission.budget === 'under-5k' ? 'selected' : ''}>Under $5,000</option>
                                <option value="5k-15k" ${submission.budget === '5k-15k' ? 'selected' : ''}>$5,000 - $15,000</option>
                                <option value="15k-50k" ${submission.budget === '15k-50k' ? 'selected' : ''}>$15,000 - $50,000</option>
                                <option value="50k-100k" ${submission.budget === '50k-100k' ? 'selected' : ''}>$50,000 - $100,000</option>
                                <option value="over-100k" ${submission.budget === 'over-100k' ? 'selected' : ''}>Over $100,000</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Timeline</label>
                            <select id="edit-timeline">
                                <option value="asap" ${submission.timeline === 'asap' ? 'selected' : ''}>ASAP</option>
                                <option value="1-month" ${submission.timeline === '1-month' ? 'selected' : ''}>1 Month</option>
                                <option value="2-3-months" ${submission.timeline === '2-3-months' ? 'selected' : ''}>2-3 Months</option>
                                <option value="3-6-months" ${submission.timeline === '3-6-months' ? 'selected' : ''}>3-6 Months</option>
                                <option value="flexible" ${submission.timeline === 'flexible' ? 'selected' : ''}>Flexible</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Priority Level</label>
                            <select id="edit-priority">
                                <option value="low" ${submission.priority === 'low' ? 'selected' : ''}>Low</option>
                                <option value="medium" ${submission.priority === 'medium' ? 'selected' : ''}>Medium</option>
                                <option value="high" ${submission.priority === 'high' ? 'selected' : ''}>High</option>
                                <option value="urgent" ${submission.priority === 'urgent' ? 'selected' : ''}>Urgent</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Status</label>
                            <select id="edit-status">
                                <option value="pending" ${submission.status === 'pending' ? 'selected' : ''}>Pending</option>
                                <option value="contacted" ${submission.status === 'contacted' ? 'selected' : ''}>Contacted</option>
                                <option value="quoted" ${submission.status === 'quoted' ? 'selected' : ''}>Quoted</option>
                                <option value="accepted" ${submission.status === 'accepted' ? 'selected' : ''}>Accepted</option>
                                <option value="rejected" ${submission.status === 'rejected' ? 'selected' : ''}>Rejected</option>
                                <option value="completed" ${submission.status === 'completed' ? 'selected' : ''}>Completed</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Message</label>
                        <textarea id="edit-message" rows="4">${submission.message || ''}</textarea>
                    </div>
                    <div class="modal-actions">
                        <button type="button" class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                        <button type="submit" class="btn-primary">Save Changes</button>
                    </div>
                </form>
            </div>
        `;

        // Handle form submission
        const form = modal.querySelector('#edit-submission-form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.saveSubmissionChanges(submission.id, modal);
        });

        return modal;
    }

    async saveSubmissionChanges(submissionId, modal) {
        try {
            const formData = {
                businessName: modal.querySelector('#edit-businessName').value,
                email: modal.querySelector('#edit-email').value,
                phone: modal.querySelector('#edit-phone').value,
                projectType: modal.querySelector('#edit-projectType').value,
                budget: modal.querySelector('#edit-budget').value,
                timeline: modal.querySelector('#edit-timeline').value,
                priority: modal.querySelector('#edit-priority').value,
                status: modal.querySelector('#edit-status').value,
                message: modal.querySelector('#edit-message').value,
                lastModified: new Date().toISOString()
            };

            await this.firebaseAdmin.updateSubmission(submissionId, formData);
            modal.remove();
            this.showSuccess('Submission updated successfully');
            this.loadSubmissions(); // Refresh the list
        } catch (error) {
            console.error('Error updating submission:', error);
            this.showError('Failed to update submission');
        }
    }

    async deleteSubmission(submissionId) {
        if (!confirm('Are you sure you want to delete this submission? This action cannot be undone.')) {
            return;
        }

        try {
            await this.firebaseAdmin.deleteSubmission(submissionId);
            this.showSuccess('Submission deleted successfully');
            this.loadSubmissions(); // Refresh the list
        } catch (error) {
            console.error('Error deleting submission:', error);
            this.showError('Failed to delete submission');
        }
    }

    updateStats() {
        // Calculate statistics
        const stats = this.calculateStats();
        
        // Update stat cards
        this.updateStatCard('total-submissions', stats.total, 'Total Submissions');
        this.updateStatCard('pending-submissions', stats.pending, 'Pending Review');
        this.updateStatCard('conversion-rate', `${stats.conversionRate}%`, 'Conversion Rate');
        this.updateStatCard('avg-project-value', `$${stats.avgValue}K`, 'Avg Project Value');
    }

    calculateStats() {
        const total = this.submissions.length;
        const pending = this.submissions.filter(s => s.status === 'pending' || !s.status).length;
        const accepted = this.submissions.filter(s => s.status === 'accepted' || s.status === 'completed').length;
        const conversionRate = total > 0 ? Math.round((accepted / total) * 100) : 0;
        
        // Calculate average project value based on budget ranges
        const budgetValues = {
            'under-5k': 2.5,
            '5k-15k': 10,
            '15k-50k': 32.5,
            '50k-100k': 75,
            'over-100k': 150
        };
        
        const totalValue = this.submissions.reduce((sum, submission) => {
            return sum + (budgetValues[submission.budget] || 0);
        }, 0);
        
        const avgValue = total > 0 ? Math.round(totalValue / total) : 0;

        return { total, pending, conversionRate, avgValue };
    }

    updateStatCard(id, value, label) {
        const card = document.querySelector(`[data-stat="${id}"]`);
        if (card) {
            const valueElement = card.querySelector('.stat-info h3');
            const labelElement = card.querySelector('.stat-info p');
            if (valueElement) valueElement.textContent = value;
            if (labelElement) labelElement.textContent = label;
        }
    }

    formatDate(timestamp) {
        if (!timestamp) return 'N/A';
        const date = new Date(timestamp);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }

    showLoading() {
        const tbody = document.getElementById('submissions-tbody');
        if (tbody) {
            tbody.innerHTML = `
                <tr class="loading-row">
                    <td colspan="7">Loading submissions...</td>
                </tr>
            `;
        }
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
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

// Initialize website manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('website-view')) {
        window.websiteManager = new WebsiteManager();
    }
});