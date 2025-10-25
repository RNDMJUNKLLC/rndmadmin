// Projects Management Module
class ProjectsManager {
    constructor() {
        this.projects = [];
        this.currentView = 'grid';
        this.currentFilter = { status: 'all', priority: 'all' };
        this.currentProject = null;
        this.init();
    }

    init() {
        this.loadProjects();
        this.setupEventListeners();
        this.renderProjects();
        this.updateStats();
    }

    setupEventListeners() {
        // Add project button
        const addProjectBtn = document.getElementById('add-project-btn');
        if (addProjectBtn) {
            addProjectBtn.addEventListener('click', () => this.showAddProjectModal());
        }

        // Project form submission
        const projectForm = document.getElementById('project-form');
        if (projectForm) {
            projectForm.addEventListener('submit', (e) => this.handleProjectSubmit(e));
        }

        // Search functionality
        const searchInput = document.getElementById('project-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.searchProjects(e.target.value));
        }

        // Filter functionality
        const statusFilter = document.getElementById('project-status-filter');
        const priorityFilter = document.getElementById('project-priority-filter');
        
        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.filterProjects());
        }
        
        if (priorityFilter) {
            priorityFilter.addEventListener('change', () => this.filterProjects());
        }
    }

    loadProjects() {
        // Load projects from localStorage
        const storedProjects = localStorage.getItem('rndm_projects');
        if (storedProjects) {
            this.projects = JSON.parse(storedProjects);
        } else {
            // Initialize with sample projects for demo
            this.projects = this.getSampleProjects();
            this.saveProjects();
        }
    }

    saveProjects() {
        localStorage.setItem('rndm_projects', JSON.stringify(this.projects));
    }

    getSampleProjects() {
        return [
            {
                id: this.generateId(),
                name: 'Company Website Redesign',
                client: 'Tech Corp',
                status: 'active',
                priority: 'high',
                startDate: '2024-01-15',
                dueDate: '2024-03-01',
                budget: 15000,
                progress: 65,
                description: 'Complete redesign of the company website with modern UI/UX, responsive design, and improved performance.',
                tags: ['web', 'design', 'responsive'],
                createdAt: new Date('2024-01-15').toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: this.generateId(),
                name: 'Mobile App Development',
                client: 'StartupXYZ',
                status: 'planning',
                priority: 'medium',
                startDate: '2024-02-01',
                dueDate: '2024-06-15',
                budget: 25000,
                progress: 15,
                description: 'Native mobile application for iOS and Android with user authentication, real-time messaging, and payment integration.',
                tags: ['mobile', 'ios', 'android', 'react-native'],
                createdAt: new Date('2024-01-20').toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: this.generateId(),
                name: 'E-commerce Platform',
                client: 'Retail Solutions',
                status: 'completed',
                priority: 'high',
                startDate: '2023-10-01',
                dueDate: '2023-12-31',
                budget: 35000,
                progress: 100,
                description: 'Full-stack e-commerce platform with admin dashboard, inventory management, and payment processing.',
                tags: ['ecommerce', 'full-stack', 'payment', 'inventory'],
                createdAt: new Date('2023-10-01').toISOString(),
                updatedAt: new Date('2023-12-31').toISOString()
            }
        ];
    }

    generateId() {
        return 'proj_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    renderProjects() {
        const filteredProjects = this.getFilteredProjects();
        
        if (this.currentView === 'grid') {
            this.renderProjectsGrid(filteredProjects);
        } else {
            this.renderProjectsList(filteredProjects);
        }
    }

    getFilteredProjects() {
        let filtered = [...this.projects];

        // Apply status filter
        if (this.currentFilter.status !== 'all') {
            filtered = filtered.filter(project => project.status === this.currentFilter.status);
        }

        // Apply priority filter
        if (this.currentFilter.priority !== 'all') {
            filtered = filtered.filter(project => project.priority === this.currentFilter.priority);
        }

        // Apply search filter
        if (this.currentFilter.search) {
            const searchTerm = this.currentFilter.search.toLowerCase();
            filtered = filtered.filter(project => 
                project.name.toLowerCase().includes(searchTerm) ||
                project.client.toLowerCase().includes(searchTerm) ||
                project.description.toLowerCase().includes(searchTerm) ||
                project.tags.some(tag => tag.toLowerCase().includes(searchTerm))
            );
        }

        // Sort by creation date (newest first)
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return filtered;
    }

    renderProjectsGrid(projects) {
        const container = document.getElementById('projects-grid');
        const emptyState = document.getElementById('empty-projects-state');
        
        if (!container) return;

        if (projects.length === 0) {
            container.innerHTML = '';
            if (emptyState) {
                emptyState.style.display = 'block';
            }
            return;
        }

        if (emptyState) {
            emptyState.style.display = 'none';
        }

        container.innerHTML = projects.map(project => this.createProjectCard(project)).join('');
    }

    renderProjectsList(projects) {
        const container = document.getElementById('projects-table-body');
        if (!container) return;

        if (projects.length === 0) {
            container.innerHTML = '<tr><td colspan="7" class="empty-row">No projects found</td></tr>';
            return;
        }

        container.innerHTML = projects.map(project => this.createProjectTableRow(project)).join('');
    }

    createProjectCard(project) {
        const dueDate = project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'No due date';
        const isOverdue = project.dueDate && new Date(project.dueDate) < new Date() && project.status !== 'completed';
        const budget = project.budget ? `$${project.budget.toLocaleString()}` : 'No budget set';
        
        return `
            <div class="project-card">
                <div class="project-card-header">
                    <div class="project-title">
                        <span>${this.escapeHtml(project.name)}</span>
                        ${isOverdue ? '<i class="fas fa-exclamation-triangle" style="color: var(--error-color);" title="Overdue"></i>' : ''}
                    </div>
                    ${project.client ? `<div class="project-client">Client: ${this.escapeHtml(project.client)}</div>` : ''}
                    <div class="project-meta">
                        <span class="project-status ${project.status}">${project.status}</span>
                        <span class="project-priority ${project.priority}">${project.priority}</span>
                        <span class="project-due-date">${dueDate}</span>
                    </div>
                </div>
                
                <div class="project-card-body">
                    ${project.description ? `<div class="project-description">${this.escapeHtml(project.description)}</div>` : ''}
                    
                    <div class="project-progress">
                        <div class="progress-label">
                            <span>Progress</span>
                            <span>${project.progress}%</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${project.progress}%"></div>
                        </div>
                    </div>
                    
                    ${project.tags && project.tags.length > 0 ? `
                        <div class="project-tags">
                            ${project.tags.map(tag => `<span class="project-tag">${this.escapeHtml(tag)}</span>`).join('')}
                        </div>
                    ` : ''}
                </div>
                
                <div class="project-card-footer">
                    <div class="project-budget">${budget}</div>
                    <div class="project-actions">
                        <button class="project-action-btn" onclick="projectsManager.editProject('${project.id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="project-action-btn" onclick="projectsManager.duplicateProject('${project.id}')" title="Duplicate">
                            <i class="fas fa-copy"></i>
                        </button>
                        <button class="project-action-btn danger" onclick="projectsManager.deleteProject('${project.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    createProjectTableRow(project) {
        const dueDate = project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'No due date';
        const isOverdue = project.dueDate && new Date(project.dueDate) < new Date() && project.status !== 'completed';
        const budget = project.budget ? `$${project.budget.toLocaleString()}` : 'No budget';
        
        return `
            <tr>
                <td>
                    <div class="project-info">
                        <div class="project-name">${this.escapeHtml(project.name)}</div>
                        ${project.client ? `<div class="project-client-small">${this.escapeHtml(project.client)}</div>` : ''}
                    </div>
                </td>
                <td><span class="project-status ${project.status}">${project.status}</span></td>
                <td><span class="project-priority ${project.priority}">${project.priority}</span></td>
                <td>
                    <div class="progress-container">
                        <div class="progress-bar small">
                            <div class="progress-fill" style="width: ${project.progress}%"></div>
                        </div>
                        <span class="progress-text">${project.progress}%</span>
                    </div>
                </td>
                <td class="${isOverdue ? 'overdue' : ''}">${dueDate}</td>
                <td>${budget}</td>
                <td>
                    <div class="table-actions">
                        <button class="table-action-btn" onclick="projectsManager.editProject('${project.id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="table-action-btn" onclick="projectsManager.duplicateProject('${project.id}')" title="Duplicate">
                            <i class="fas fa-copy"></i>
                        </button>
                        <button class="table-action-btn danger" onclick="projectsManager.deleteProject('${project.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    updateStats() {
        const stats = this.calculateStats();
        
        // Update stat cards
        this.updateStatElement('total-projects', stats.total);
        this.updateStatElement('active-projects', stats.active);
        this.updateStatElement('completed-projects', stats.completed);
        this.updateStatElement('overdue-projects', stats.overdue);
    }

    calculateStats() {
        const now = new Date();
        
        return {
            total: this.projects.length,
            active: this.projects.filter(p => p.status === 'active').length,
            completed: this.projects.filter(p => p.status === 'completed').length,
            overdue: this.projects.filter(p => 
                p.dueDate && 
                new Date(p.dueDate) < now && 
                p.status !== 'completed'
            ).length
        };
    }

    updateStatElement(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
        }
    }

    // View toggle functionality
    toggleProjectView(view) {
        this.currentView = view;
        
        // Update button states
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-view="${view}"]`).classList.add('active');
        
        // Show/hide containers
        const gridContainer = document.getElementById('projects-grid');
        const listContainer = document.getElementById('projects-list');
        
        if (view === 'grid') {
            gridContainer.style.display = 'grid';
            listContainer.style.display = 'none';
        } else {
            gridContainer.style.display = 'none';
            listContainer.style.display = 'block';
        }
        
        this.renderProjects();
    }

    // Filter and search functionality
    filterProjects() {
        const statusFilter = document.getElementById('project-status-filter');
        const priorityFilter = document.getElementById('project-priority-filter');
        
        this.currentFilter.status = statusFilter ? statusFilter.value : 'all';
        this.currentFilter.priority = priorityFilter ? priorityFilter.value : 'all';
        
        this.renderProjects();
    }

    searchProjects(searchTerm) {
        this.currentFilter.search = searchTerm;
        this.renderProjects();
    }

    // Modal functionality
    showAddProjectModal() {
        this.currentProject = null;
        this.resetProjectForm();
        document.getElementById('project-modal-title').textContent = 'Add New Project';
        document.getElementById('project-submit-text').textContent = 'Add Project';
        document.getElementById('project-modal').style.display = 'flex';
    }

    editProject(projectId) {
        const project = this.projects.find(p => p.id === projectId);
        if (!project) return;
        
        this.currentProject = project;
        this.populateProjectForm(project);
        document.getElementById('project-modal-title').textContent = 'Edit Project';
        document.getElementById('project-submit-text').textContent = 'Update Project';
        document.getElementById('project-modal').style.display = 'flex';
    }

    duplicateProject(projectId) {
        const project = this.projects.find(p => p.id === projectId);
        if (!project) return;
        
        const duplicatedProject = {
            ...project,
            id: this.generateId(),
            name: project.name + ' (Copy)',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        this.projects.push(duplicatedProject);
        this.saveProjects();
        this.renderProjects();
        this.updateStats();
        
        this.showNotification('Project duplicated successfully!', 'success');
    }

    deleteProject(projectId) {
        if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
            return;
        }
        
        this.projects = this.projects.filter(p => p.id !== projectId);
        this.saveProjects();
        this.renderProjects();
        this.updateStats();
        
        this.showNotification('Project deleted successfully!', 'success');
    }

    closeProjectModal() {
        document.getElementById('project-modal').style.display = 'none';
        this.currentProject = null;
    }

    resetProjectForm() {
        const form = document.getElementById('project-form');
        if (form) {
            form.reset();
            // Set default values
            document.getElementById('project-status').value = 'active';
            document.getElementById('project-priority').value = 'medium';
            document.getElementById('project-progress').value = '0';
        }
    }

    populateProjectForm(project) {
        document.getElementById('project-name').value = project.name || '';
        document.getElementById('project-client').value = project.client || '';
        document.getElementById('project-status').value = project.status || 'active';
        document.getElementById('project-priority').value = project.priority || 'medium';
        document.getElementById('project-start-date').value = project.startDate || '';
        document.getElementById('project-due-date').value = project.dueDate || '';
        document.getElementById('project-budget').value = project.budget || '';
        document.getElementById('project-progress').value = project.progress || 0;
        document.getElementById('project-description').value = project.description || '';
        document.getElementById('project-tags').value = project.tags ? project.tags.join(', ') : '';
    }

    handleProjectSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const projectData = {
            name: document.getElementById('project-name').value.trim(),
            client: document.getElementById('project-client').value.trim(),
            status: document.getElementById('project-status').value,
            priority: document.getElementById('project-priority').value,
            startDate: document.getElementById('project-start-date').value,
            dueDate: document.getElementById('project-due-date').value,
            budget: parseFloat(document.getElementById('project-budget').value) || 0,
            progress: parseInt(document.getElementById('project-progress').value) || 0,
            description: document.getElementById('project-description').value.trim(),
            tags: document.getElementById('project-tags').value
                .split(',')
                .map(tag => tag.trim())
                .filter(tag => tag.length > 0)
        };
        
        // Validation
        if (!projectData.name) {
            this.showNotification('Project name is required!', 'error');
            return;
        }
        
        if (this.currentProject) {
            // Update existing project
            const index = this.projects.findIndex(p => p.id === this.currentProject.id);
            if (index !== -1) {
                this.projects[index] = {
                    ...this.currentProject,
                    ...projectData,
                    updatedAt: new Date().toISOString()
                };
                this.showNotification('Project updated successfully!', 'success');
            }
        } else {
            // Create new project
            const newProject = {
                id: this.generateId(),
                ...projectData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            this.projects.push(newProject);
            this.showNotification('Project added successfully!', 'success');
        }
        
        this.saveProjects();
        this.renderProjects();
        this.updateStats();
        this.closeProjectModal();
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        // Add to document
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}

// Global functions for onclick handlers
window.toggleProjectView = function(view) {
    if (window.projectsManager) {
        window.projectsManager.toggleProjectView(view);
    }
};

window.filterProjects = function() {
    if (window.projectsManager) {
        window.projectsManager.filterProjects();
    }
};

window.searchProjects = function() {
    if (window.projectsManager) {
        const searchInput = document.getElementById('project-search');
        if (searchInput) {
            window.projectsManager.searchProjects(searchInput.value);
        }
    }
};

window.showAddProjectModal = function() {
    if (window.projectsManager) {
        window.projectsManager.showAddProjectModal();
    }
};

window.closeProjectModal = function() {
    if (window.projectsManager) {
        window.projectsManager.closeProjectModal();
    }
};

// Initialize projects manager when the projects view is loaded
document.addEventListener('DOMContentLoaded', function() {
    const projectsView = document.getElementById('projects-view');
    if (projectsView) {
        window.projectsManager = new ProjectsManager();
    }
});

// Export for module use
export default ProjectsManager;