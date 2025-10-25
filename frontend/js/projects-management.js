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
                links: [
                    {
                        id: this.generateId(),
                        title: 'Design Mockups',
                        url: 'https://figma.com/mockups',
                        description: 'Latest design mockups and wireframes',
                        category: 'design',
                        createdAt: new Date().toISOString()
                    },
                    {
                        id: this.generateId(),
                        title: 'Project Repository',
                        url: 'https://github.com/project/website',
                        description: 'Main development repository',
                        category: 'development',
                        createdAt: new Date().toISOString()
                    }
                ],
                files: [
                    {
                        id: this.generateId(),
                        name: 'project-proposal.pdf',
                        size: 2048000,
                        type: 'application/pdf',
                        category: 'document',
                        notes: 'Initial project proposal and requirements',
                        uploadedAt: new Date('2024-01-15').toISOString()
                    }
                ],
                notes: [
                    {
                        id: this.generateId(),
                        content: 'Client requested additional mobile optimizations for the checkout process.',
                        createdAt: new Date('2024-02-10').toISOString()
                    },
                    {
                        id: this.generateId(),
                        content: 'Need to schedule user testing session before final deployment.',
                        createdAt: new Date('2024-02-15').toISOString()
                    }
                ],
                appearance: {
                    backgroundType: 'gradient',
                    gradientColor1: '#6366f1',
                    gradientColor2: '#8b5cf6',
                    gradientDirection: 'to bottom right',
                    textColor: '#ffffff',
                    panelOpacity: 0.9
                },
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
                links: [
                    {
                        id: this.generateId(),
                        title: 'API Documentation',
                        url: 'https://docs.api.startup.com',
                        description: 'Backend API documentation',
                        category: 'documentation',
                        createdAt: new Date().toISOString()
                    }
                ],
                files: [],
                notes: [
                    {
                        id: this.generateId(),
                        content: 'Initial architecture planning completed. Moving to development phase next week.',
                        createdAt: new Date('2024-02-01').toISOString()
                    }
                ],
                appearance: {
                    backgroundType: 'color',
                    backgroundColor: '#f8fafc',
                    textColor: '#1e293b',
                    panelOpacity: 1
                },
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
                links: [
                    {
                        id: this.generateId(),
                        title: 'Live Website',
                        url: 'https://retailsolutions.com',
                        description: 'Production website',
                        category: 'general',
                        createdAt: new Date('2023-12-31').toISOString()
                    }
                ],
                files: [
                    {
                        id: this.generateId(),
                        name: 'final-invoice.pdf',
                        size: 1024000,
                        type: 'application/pdf',
                        category: 'invoice',
                        notes: 'Final project invoice - PAID',
                        uploadedAt: new Date('2023-12-31').toISOString()
                    },
                    {
                        id: this.generateId(),
                        name: 'project-handover.docx',
                        size: 512000,
                        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                        category: 'document',
                        notes: 'Project handover documentation',
                        uploadedAt: new Date('2023-12-31').toISOString()
                    }
                ],
                notes: [
                    {
                        id: this.generateId(),
                        content: 'Project completed successfully. Client is very happy with the results.',
                        createdAt: new Date('2023-12-31').toISOString()
                    },
                    {
                        id: this.generateId(),
                        content: 'Added to portfolio. Potential for future maintenance contract.',
                        createdAt: new Date('2024-01-05').toISOString()
                    }
                ],
                appearance: {
                    backgroundType: 'color',
                    backgroundColor: '#10b981',
                    textColor: '#ffffff',
                    panelOpacity: 0.95
                },
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
                        <button class="project-action-btn" onclick="projectsManager.viewProject('${project.id}')" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
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
                        <button class="table-action-btn" onclick="projectsManager.viewProject('${project.id}')" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
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

    // Project detail view functionality
    viewProject(projectId) {
        const project = this.projects.find(p => p.id === projectId);
        if (!project) return;
        
        this.currentProject = project;
        this.showProjectDetailView(project);
    }

    showProjectDetailView(project) {
        // Switch to project detail view
        document.querySelectorAll('.view-container').forEach(view => view.classList.remove('active'));
        document.getElementById('project-detail-view').classList.add('active');
        
        // Update page title
        document.getElementById('pageTitle').textContent = project.name;
        
        // Populate project details
        this.populateProjectDetails(project);
        
        // Apply custom appearance if exists
        this.applyProjectAppearance(project);
        
        // Load project-specific data
        this.loadProjectLinks(project.id);
        this.loadProjectFiles(project.id);
        this.loadProjectNotes(project.id);
    }

    populateProjectDetails(project) {
        // Basic info
        document.getElementById('project-detail-name').textContent = project.name;
        document.getElementById('project-detail-client').textContent = project.client || 'No client specified';
        
        // Status and priority badges
        const statusElement = document.getElementById('detail-status');
        statusElement.textContent = project.status;
        statusElement.className = `project-status-badge ${project.status}`;
        
        const priorityElement = document.getElementById('detail-priority');
        priorityElement.textContent = project.priority;
        priorityElement.className = `project-priority-badge ${project.priority}`;
        
        // Progress
        document.getElementById('detail-progress-fill').style.width = project.progress + '%';
        document.getElementById('detail-progress-text').textContent = project.progress + '%';
        
        // Budget
        document.getElementById('detail-budget').textContent = project.budget ? 
            `$${project.budget.toLocaleString()}` : 'No budget set';
        
        // Dates
        document.getElementById('detail-start-date').textContent = project.startDate ? 
            new Date(project.startDate).toLocaleDateString() : 'Not set';
        document.getElementById('detail-due-date').textContent = project.dueDate ? 
            new Date(project.dueDate).toLocaleDateString() : 'Not set';
        
        // Description
        document.getElementById('detail-description').textContent = project.description || 'No description available.';
        
        // Tags
        const tagsContainer = document.getElementById('detail-tags');
        if (project.tags && project.tags.length > 0) {
            tagsContainer.innerHTML = project.tags.map(tag => 
                `<span class="project-tag">${this.escapeHtml(tag)}</span>`
            ).join('');
        } else {
            tagsContainer.innerHTML = '<span class="no-tags">No tags</span>';
        }
    }

    applyProjectAppearance(project) {
        const contentElement = document.getElementById('project-detail-content');
        const settings = project.appearance || {};
        
        // Reset classes
        contentElement.classList.remove('custom-bg', 'custom-text');
        contentElement.style.removeProperty('background');
        contentElement.style.removeProperty('--custom-text-color');
        contentElement.style.removeProperty('--panel-opacity');
        
        if (settings.backgroundType && settings.backgroundType !== 'default') {
            contentElement.classList.add('custom-bg');
            
            switch (settings.backgroundType) {
                case 'color':
                    if (settings.backgroundColor) {
                        contentElement.style.background = settings.backgroundColor;
                    }
                    break;
                case 'gradient':
                    if (settings.gradientColor1 && settings.gradientColor2) {
                        const direction = settings.gradientDirection || 'to right';
                        contentElement.style.background = 
                            `linear-gradient(${direction}, ${settings.gradientColor1}, ${settings.gradientColor2})`;
                    }
                    break;
                case 'image':
                    if (settings.backgroundImage) {
                        const size = settings.backgroundSize || 'cover';
                        const position = settings.backgroundPosition || 'center';
                        contentElement.style.background = `url(${settings.backgroundImage}) ${position}/${size}`;
                    }
                    break;
            }
        }
        
        if (settings.textColor) {
            contentElement.classList.add('custom-text');
            contentElement.style.setProperty('--custom-text-color', settings.textColor);
        }
        
        if (settings.panelOpacity !== undefined) {
            contentElement.style.setProperty('--panel-opacity', settings.panelOpacity);
        }
    }

    // Project links functionality
    loadProjectLinks(projectId) {
        const project = this.projects.find(p => p.id === projectId);
        if (!project || !project.links) {
            this.showEmptyState('links');
            return;
        }
        
        const container = document.getElementById('project-links-container');
        const emptyState = document.getElementById('empty-links-state');
        
        if (project.links.length === 0) {
            this.showEmptyState('links');
            return;
        }
        
        emptyState.style.display = 'none';
        container.innerHTML = project.links.map(link => this.createLinkItem(link)).join('');
    }

    createLinkItem(link) {
        return `
            <div class="project-link-item" data-link-id="${link.id}">
                <div class="link-header">
                    <div class="link-info">
                        <div class="link-title">${this.escapeHtml(link.title)}</div>
                        <a href="${link.url}" target="_blank" class="link-url">${link.url}</a>
                    </div>
                    <div class="link-actions">
                        <button class="link-action-btn" onclick="editLink('${link.id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="link-action-btn" onclick="deleteLink('${link.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                ${link.description ? `<div class="link-description">${this.escapeHtml(link.description)}</div>` : ''}
                <div class="link-embed" id="embed-${link.id}">
                    <div class="embed-loading">Loading preview...</div>
                </div>
            </div>
        `;
    }

    // Project files functionality
    loadProjectFiles(projectId) {
        const project = this.projects.find(p => p.id === projectId);
        if (!project || !project.files) {
            this.showEmptyState('files');
            return;
        }
        
        const container = document.getElementById('project-files-container');
        const emptyState = document.getElementById('empty-files-state');
        
        if (project.files.length === 0) {
            this.showEmptyState('files');
            return;
        }
        
        emptyState.style.display = 'none';
        container.innerHTML = project.files.map(file => this.createFileItem(file)).join('');
    }

    createFileItem(file) {
        const fileIcon = this.getFileIcon(file.name);
        const fileSize = this.formatFileSize(file.size);
        const uploadDate = new Date(file.uploadedAt).toLocaleDateString();
        
        return `
            <div class="project-file-item" data-file-id="${file.id}">
                <div class="file-icon ${fileIcon.class}">
                    <i class="fas ${fileIcon.icon}"></i>
                </div>
                <div class="file-info">
                    <div class="file-name">${this.escapeHtml(file.name)}</div>
                    <div class="file-meta">${fileSize} • ${uploadDate} • ${file.category}</div>
                    ${file.notes ? `<div class="file-notes">${this.escapeHtml(file.notes)}</div>` : ''}
                </div>
                <div class="file-actions">
                    <button class="file-action-btn" onclick="downloadFile('${file.id}')" title="Download">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="file-action-btn" onclick="deleteFile('${file.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    getFileIcon(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        
        switch (ext) {
            case 'pdf':
                return { icon: 'fa-file-pdf', class: 'pdf' };
            case 'doc':
            case 'docx':
                return { icon: 'fa-file-word', class: 'doc' };
            case 'xls':
            case 'xlsx':
                return { icon: 'fa-file-excel', class: 'xls' };
            case 'png':
            case 'jpg':
            case 'jpeg':
            case 'gif':
                return { icon: 'fa-file-image', class: 'img' };
            case 'zip':
            case 'rar':
                return { icon: 'fa-file-archive', class: 'zip' };
            default:
                return { icon: 'fa-file', class: 'other' };
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Project notes functionality
    loadProjectNotes(projectId) {
        const project = this.projects.find(p => p.id === projectId);
        if (!project || !project.notes) {
            this.showEmptyState('notes');
            return;
        }
        
        const container = document.getElementById('project-notes-container');
        const emptyState = document.getElementById('empty-notes-state');
        
        if (project.notes.length === 0) {
            this.showEmptyState('notes');
            return;
        }
        
        emptyState.style.display = 'none';
        container.innerHTML = project.notes.map(note => this.createNoteItem(note)).join('');
    }

    createNoteItem(note) {
        const noteDate = new Date(note.createdAt).toLocaleDateString();
        
        return `
            <div class="project-note-item" data-note-id="${note.id}">
                <div class="note-header">
                    <div class="note-date">${noteDate}</div>
                    <div class="note-actions">
                        <button class="link-action-btn" onclick="editNote('${note.id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="link-action-btn" onclick="deleteNote('${note.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="note-content">${this.escapeHtml(note.content)}</div>
            </div>
        `;
    }

    showEmptyState(type) {
        const emptyStates = {
            'links': 'empty-links-state',
            'files': 'empty-files-state',
            'notes': 'empty-notes-state'
        };
        
        const emptyState = document.getElementById(emptyStates[type]);
        if (emptyState) {
            emptyState.style.display = 'block';
        }
    }

    // Link management
    addProjectLink(linkData) {
        if (!this.currentProject) return;
        
        if (!this.currentProject.links) {
            this.currentProject.links = [];
        }
        
        const newLink = {
            id: this.generateId(),
            ...linkData,
            createdAt: new Date().toISOString()
        };
        
        this.currentProject.links.push(newLink);
        this.updateProject(this.currentProject);
        this.loadProjectLinks(this.currentProject.id);
        
        // Load embed for the new link
        this.loadLinkEmbed(newLink);
    }

    async loadLinkEmbed(link) {
        const embedContainer = document.getElementById(`embed-${link.id}`);
        if (!embedContainer) return;
        
        try {
            // Simple preview generation (in a real app, you'd use a service like LinkPreview API)
            const preview = await this.generateLinkPreview(link.url);
            embedContainer.innerHTML = preview;
        } catch (error) {
            embedContainer.innerHTML = `<div class="embed-error">Could not load preview</div>`;
        }
    }

    async generateLinkPreview(url) {
        // Simplified preview generation
        const domain = new URL(url).hostname;
        
        return `
            <div class="link-preview">
                <div class="link-preview-content">
                    <div class="link-preview-title">${domain}</div>
                    <div class="link-preview-description">Click to visit this link</div>
                </div>
            </div>
        `;
    }

    // File management
    addProjectFiles(files, category, notes) {
        if (!this.currentProject) return;
        
        if (!this.currentProject.files) {
            this.currentProject.files = [];
        }
        
        files.forEach(file => {
            const fileData = {
                id: this.generateId(),
                name: file.name,
                size: file.size,
                type: file.type,
                category: category,
                notes: notes,
                uploadedAt: new Date().toISOString(),
                // In a real app, you'd upload to a server and store the URL
                data: null // Placeholder for file data
            };
            
            this.currentProject.files.push(fileData);
        });
        
        this.updateProject(this.currentProject);
        this.loadProjectFiles(this.currentProject.id);
    }

    // Notes management
    addProjectNote(content) {
        if (!this.currentProject) return;
        
        if (!this.currentProject.notes) {
            this.currentProject.notes = [];
        }
        
        const newNote = {
            id: this.generateId(),
            content: content,
            createdAt: new Date().toISOString()
        };
        
        this.currentProject.notes.push(newNote);
        this.updateProject(this.currentProject);
        this.loadProjectNotes(this.currentProject.id);
    }

    // Project settings management
    saveProjectAppearance(settings) {
        if (!this.currentProject) return;
        
        if (!this.currentProject.appearance) {
            this.currentProject.appearance = {};
        }
        
        Object.assign(this.currentProject.appearance, settings);
        this.updateProject(this.currentProject);
        this.applyProjectAppearance(this.currentProject);
    }

    updateProject(project) {
        const index = this.projects.findIndex(p => p.id === project.id);
        if (index !== -1) {
            this.projects[index] = { ...project, updatedAt: new Date().toISOString() };
            this.saveProjects();
        }
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

// Project detail view functions
window.backToProjects = function() {
    document.querySelectorAll('.view-container').forEach(view => view.classList.remove('active'));
    document.getElementById('projects-view').classList.add('active');
    document.getElementById('pageTitle').textContent = 'Projects';
    window.projectsManager.currentProject = null;
};

window.editCurrentProject = function() {
    if (window.projectsManager && window.projectsManager.currentProject) {
        window.projectsManager.editProject(window.projectsManager.currentProject.id);
    }
};

window.editProjectSettings = function() {
    document.getElementById('project-settings-modal').style.display = 'flex';
    if (window.projectsManager && window.projectsManager.currentProject) {
        populateProjectSettings(window.projectsManager.currentProject);
    }
};

window.closeProjectSettingsModal = function() {
    document.getElementById('project-settings-modal').style.display = 'none';
};

window.switchSettingsTab = function(tabName) {
    // Update tab buttons
    document.querySelectorAll('.settings-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.settings-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    document.getElementById(`${tabName}-settings`).classList.add('active');
};

window.updateBackgroundType = function() {
    const type = document.getElementById('background-type').value;
    
    // Hide all controls
    document.querySelectorAll('.bg-control').forEach(control => {
        control.style.display = 'none';
    });
    
    // Show relevant control
    document.getElementById(`${type}-control`).style.display = 'block';
    
    updateAppearancePreview();
};

window.updateAppearancePreview = function() {
    const preview = document.getElementById('appearance-preview');
    const backgroundType = document.getElementById('background-type').value;
    
    let background = '';
    
    switch (backgroundType) {
        case 'color':
            background = document.getElementById('bg-color').value;
            break;
        case 'gradient':
            const color1 = document.getElementById('gradient-color1').value;
            const color2 = document.getElementById('gradient-color2').value;
            const direction = document.getElementById('gradient-direction').value;
            background = `linear-gradient(${direction}, ${color1}, ${color2})`;
            break;
        case 'image':
            // Handle image preview
            const fileInput = document.getElementById('bg-image');
            if (fileInput.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const size = document.getElementById('bg-image-size').value;
                    const position = document.getElementById('bg-image-position').value;
                    preview.style.background = `url(${e.target.result}) ${position}/${size}`;
                };
                reader.readAsDataURL(fileInput.files[0]);
                return;
            }
            break;
    }
    
    if (background) {
        preview.style.background = background;
    }
    
    // Apply text color
    const textColor = document.getElementById('text-color').value;
    preview.style.color = textColor;
    
    // Apply opacity
    const opacity = document.getElementById('panel-opacity').value;
    document.getElementById('opacity-value').textContent = Math.round(opacity * 100) + '%';
    preview.querySelector('.preview-panel').style.opacity = opacity;
};

window.saveProjectSettings = function() {
    if (!window.projectsManager || !window.projectsManager.currentProject) return;
    
    const settings = {
        backgroundType: document.getElementById('background-type').value,
        textColor: document.getElementById('text-color').value,
        panelOpacity: parseFloat(document.getElementById('panel-opacity').value),
        showProgressOnPage: document.getElementById('show-progress-on-page').checked,
        autoSaveNotes: document.getElementById('auto-save-notes').checked,
        enableNotifications: document.getElementById('enable-notifications').checked
    };
    
    // Add background-specific settings
    switch (settings.backgroundType) {
        case 'color':
            settings.backgroundColor = document.getElementById('bg-color').value;
            break;
        case 'gradient':
            settings.gradientColor1 = document.getElementById('gradient-color1').value;
            settings.gradientColor2 = document.getElementById('gradient-color2').value;
            settings.gradientDirection = document.getElementById('gradient-direction').value;
            break;
        case 'image':
            const fileInput = document.getElementById('bg-image');
            if (fileInput.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    settings.backgroundImage = e.target.result;
                    settings.backgroundSize = document.getElementById('bg-image-size').value;
                    settings.backgroundPosition = document.getElementById('bg-image-position').value;
                    window.projectsManager.saveProjectAppearance(settings);
                };
                reader.readAsDataURL(fileInput.files[0]);
                closeProjectSettingsModal();
                return;
            }
            break;
    }
    
    window.projectsManager.saveProjectAppearance(settings);
    closeProjectSettingsModal();
};

window.resetAppearance = function() {
    if (!window.projectsManager || !window.projectsManager.currentProject) return;
    
    window.projectsManager.currentProject.appearance = {};
    window.projectsManager.updateProject(window.projectsManager.currentProject);
    window.projectsManager.applyProjectAppearance(window.projectsManager.currentProject);
    populateProjectSettings(window.projectsManager.currentProject);
};

// Link management functions
window.showAddLinkModal = function() {
    document.getElementById('add-link-modal').style.display = 'flex';
    document.getElementById('add-link-form').reset();
};

window.closeAddLinkModal = function() {
    document.getElementById('add-link-modal').style.display = 'none';
};

// File upload functions  
window.showUploadModal = function() {
    document.getElementById('upload-file-modal').style.display = 'flex';
    document.getElementById('upload-file-form').reset();
    document.getElementById('uploaded-files-preview').innerHTML = '';
};

window.closeUploadModal = function() {
    document.getElementById('upload-file-modal').style.display = 'none';
};

// Notes functions
window.addNote = function() {
    const content = prompt('Enter note content:');
    if (content && content.trim() && window.projectsManager) {
        window.projectsManager.addProjectNote(content.trim());
    }
};

// Helper functions
function populateProjectSettings(project) {
    const settings = project.appearance || {};
    
    // Appearance settings
    document.getElementById('background-type').value = settings.backgroundType || 'color';
    document.getElementById('bg-color').value = settings.backgroundColor || '#ffffff';
    document.getElementById('bg-color-hex').value = settings.backgroundColor || '#ffffff';
    document.getElementById('text-color').value = settings.textColor || '#1e293b';
    document.getElementById('text-color-hex').value = settings.textColor || '#1e293b';
    document.getElementById('panel-opacity').value = settings.panelOpacity || 1;
    
    if (settings.gradientColor1) document.getElementById('gradient-color1').value = settings.gradientColor1;
    if (settings.gradientColor2) document.getElementById('gradient-color2').value = settings.gradientColor2;
    if (settings.gradientDirection) document.getElementById('gradient-direction').value = settings.gradientDirection;
    if (settings.backgroundSize) document.getElementById('bg-image-size').value = settings.backgroundSize;
    if (settings.backgroundPosition) document.getElementById('bg-image-position').value = settings.backgroundPosition;
    
    // General settings
    document.getElementById('show-progress-on-page').checked = settings.showProgressOnPage || false;
    document.getElementById('auto-save-notes').checked = settings.autoSaveNotes || false;
    document.getElementById('enable-notifications').checked = settings.enableNotifications || false;
    
    updateBackgroundType();
    updateAppearancePreview();
}

// Event listeners for settings
document.addEventListener('DOMContentLoaded', function() {
    // Color input synchronization
    const bgColorInput = document.getElementById('bg-color');
    const bgColorHex = document.getElementById('bg-color-hex');
    const textColorInput = document.getElementById('text-color');
    const textColorHex = document.getElementById('text-color-hex');
    
    if (bgColorInput && bgColorHex) {
        bgColorInput.addEventListener('input', function() {
            bgColorHex.value = this.value;
            updateAppearancePreview();
        });
        
        bgColorHex.addEventListener('input', function() {
            if (/^#[0-9A-F]{6}$/i.test(this.value)) {
                bgColorInput.value = this.value;
                updateAppearancePreview();
            }
        });
    }
    
    if (textColorInput && textColorHex) {
        textColorInput.addEventListener('input', function() {
            textColorHex.value = this.value;
            updateAppearancePreview();
        });
        
        textColorHex.addEventListener('input', function() {
            if (/^#[0-9A-F]{6}$/i.test(this.value)) {
                textColorInput.value = this.value;
                updateAppearancePreview();
            }
        });
    }
    
    // Other appearance controls
    const appearanceControls = [
        'gradient-color1', 'gradient-color2', 'gradient-direction',
        'bg-image-size', 'bg-image-position', 'panel-opacity'
    ];
    
    appearanceControls.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', updateAppearancePreview);
        }
    });
    
    // File upload handling
    const fileInput = document.getElementById('file-input');
    const uploadArea = document.getElementById('file-upload-area');
    const uploadForm = document.getElementById('upload-file-form');
    const addLinkForm = document.getElementById('add-link-form');
    
    if (fileInput && uploadArea) {
        // File drag and drop
        uploadArea.addEventListener('click', () => fileInput.click());
        
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('drag-over');
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('drag-over');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
            fileInput.files = e.dataTransfer.files;
            handleFileSelection();
        });
        
        fileInput.addEventListener('change', handleFileSelection);
    }
    
    if (uploadForm) {
        uploadForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const files = Array.from(fileInput.files);
            const category = document.getElementById('file-category').value;
            const notes = document.getElementById('file-notes').value;
            
            if (files.length > 0 && window.projectsManager) {
                window.projectsManager.addProjectFiles(files, category, notes);
                closeUploadModal();
            }
        });
    }
    
    if (addLinkForm) {
        addLinkForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const linkData = {
                title: document.getElementById('link-title').value,
                url: document.getElementById('link-url').value,
                description: document.getElementById('link-description').value,
                category: document.getElementById('link-category').value
            };
            
            if (window.projectsManager) {
                window.projectsManager.addProjectLink(linkData);
                closeAddLinkModal();
            }
        });
    }
});

function handleFileSelection() {
    const files = Array.from(document.getElementById('file-input').files);
    const preview = document.getElementById('uploaded-files-preview');
    
    preview.innerHTML = files.map(file => `
        <div class="file-preview-item">
            <div class="file-preview-info">
                <div class="file-preview-name">${file.name}</div>
                <div class="file-preview-size">${formatFileSize(file.size)}</div>
            </div>
            <button type="button" class="remove-file-btn" onclick="removeFile('${file.name}')">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

window.removeFile = function(fileName) {
    const fileInput = document.getElementById('file-input');
    const dt = new DataTransfer();
    
    Array.from(fileInput.files).forEach(file => {
        if (file.name !== fileName) {
            dt.items.add(file);
        }
    });
    
    fileInput.files = dt.files;
    handleFileSelection();
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