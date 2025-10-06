/**
 * Analytics Dashboard Module
 * Handles data visualization and metrics for the admin dashboard
 */

import { firebaseAdmin } from './firebase-admin.js';

class AnalyticsManager {
    constructor() {
        this.firebaseAdmin = firebaseAdmin;
        this.charts = {};
        this.submissions = [];
        this.init();
    }

    async init() {
        await this.loadData();
        this.initializeCharts();
        this.updateEngagementMetrics();
        this.setupRealTimeUpdates();
    }

    async loadData() {
        try {
            this.submissions = await this.firebaseAdmin.getAllSubmissions();
        } catch (error) {
            console.error('Error loading analytics data:', error);
            this.submissions = [];
        }
    }

    initializeCharts() {
        this.createSubmissionTrendsChart();
        this.createProjectTypeChart();
        this.createBudgetDistributionChart();
        this.createConversionFunnelChart();
    }

    createSubmissionTrendsChart() {
        const ctx = document.getElementById('submissions-trend-chart');
        if (!ctx) return;

        const trendData = this.getSubmissionTrendData();
        
        this.charts.submissionTrends = new Chart(ctx, {
            type: 'line',
            data: {
                labels: trendData.labels,
                datasets: [{
                    label: 'Submissions',
                    data: trendData.data,
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Submission Trends (Last 30 Days)'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }

    createProjectTypeChart() {
        const ctx = document.getElementById('project-type-chart');
        if (!ctx) return;

        const projectData = this.getProjectTypeData();
        
        this.charts.projectType = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: projectData.labels,
                datasets: [{
                    data: projectData.data,
                    backgroundColor: [
                        '#3b82f6',
                        '#10b981',
                        '#f59e0b',
                        '#ef4444',
                        '#8b5cf6',
                        '#06b6d4'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    title: {
                        display: true,
                        text: 'Project Type Distribution'
                    }
                }
            }
        });
    }

    createBudgetDistributionChart() {
        const ctx = document.getElementById('budget-distribution-chart');
        if (!ctx) return;

        const budgetData = this.getBudgetDistributionData();
        
        this.charts.budgetDistribution = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: budgetData.labels,
                datasets: [{
                    label: 'Number of Projects',
                    data: budgetData.data,
                    backgroundColor: 'rgba(16, 185, 129, 0.8)',
                    borderColor: 'rgb(16, 185, 129)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Budget Range Distribution'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }

    createConversionFunnelChart() {
        const ctx = document.getElementById('conversion-funnel-chart');
        if (!ctx) return;

        const funnelData = this.getConversionFunnelData();
        
        this.charts.conversionFunnel = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: funnelData.labels,
                datasets: [{
                    label: 'Count',
                    data: funnelData.data,
                    backgroundColor: [
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(34, 197, 94, 0.8)'
                    ],
                    borderColor: [
                        'rgb(59, 130, 246)',
                        'rgb(16, 185, 129)',
                        'rgb(245, 158, 11)',
                        'rgb(34, 197, 94)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Lead Conversion Funnel'
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    getSubmissionTrendData() {
        const last30Days = Array.from({length: 30}, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (29 - i));
            return date;
        });

        const labels = last30Days.map(date => 
            date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        );

        const data = last30Days.map(date => {
            const dayStart = new Date(date);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(date);
            dayEnd.setHours(23, 59, 59, 999);

            return this.submissions.filter(submission => {
                const submissionDate = new Date(submission.timestamp);
                return submissionDate >= dayStart && submissionDate <= dayEnd;
            }).length;
        });

        return { labels, data };
    }

    getProjectTypeData() {
        const projectTypes = {};
        
        this.submissions.forEach(submission => {
            const type = submission.projectType || 'Other';
            projectTypes[type] = (projectTypes[type] || 0) + 1;
        });

        const labels = Object.keys(projectTypes).map(type => {
            switch(type) {
                case 'website': return 'Website Development';
                case 'mobile-app': return 'Mobile App';
                case 'web-app': return 'Web Application';
                case 'ecommerce': return 'E-commerce';
                case 'consulting': return 'Consulting';
                default: return 'Other';
            }
        });

        const data = Object.values(projectTypes);

        return { labels, data };
    }

    getBudgetDistributionData() {
        const budgetRanges = {
            'under-5k': 'Under $5K',
            '5k-15k': '$5K - $15K',
            '15k-50k': '$15K - $50K',
            '50k-100k': '$50K - $100K',
            'over-100k': 'Over $100K'
        };

        const budgetCounts = {};
        
        this.submissions.forEach(submission => {
            const budget = submission.budget || 'under-5k';
            budgetCounts[budget] = (budgetCounts[budget] || 0) + 1;
        });

        const labels = Object.keys(budgetRanges).map(key => budgetRanges[key]);
        const data = Object.keys(budgetRanges).map(key => budgetCounts[key] || 0);

        return { labels, data };
    }

    getConversionFunnelData() {
        const statusCounts = {
            total: this.submissions.length,
            contacted: this.submissions.filter(s => ['contacted', 'quoted', 'accepted', 'completed'].includes(s.status)).length,
            quoted: this.submissions.filter(s => ['quoted', 'accepted', 'completed'].includes(s.status)).length,
            converted: this.submissions.filter(s => ['accepted', 'completed'].includes(s.status)).length
        };

        return {
            labels: ['Total Leads', 'Contacted', 'Quoted', 'Converted'],
            data: [statusCounts.total, statusCounts.contacted, statusCounts.quoted, statusCounts.converted]
        };
    }

    updateEngagementMetrics() {
        const metrics = this.calculateEngagementMetrics();
        
        this.updateMetric('total-leads', metrics.totalLeads);
        this.updateMetric('conversion-rate', `${metrics.conversionRate}%`);
        this.updateMetric('avg-response-time', metrics.avgResponseTime);
        this.updateMetric('monthly-growth', `${metrics.monthlyGrowth}%`);
        this.updateMetric('pipeline-value', `$${metrics.pipelineValue}K`);
        this.updateMetric('closed-deals', metrics.closedDeals);
    }

    calculateEngagementMetrics() {
        const totalLeads = this.submissions.length;
        const convertedLeads = this.submissions.filter(s => s.status === 'accepted' || s.status === 'completed').length;
        const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

        // Calculate monthly growth
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

        const currentMonthLeads = this.submissions.filter(s => {
            const date = new Date(s.timestamp);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        }).length;

        const lastMonthLeads = this.submissions.filter(s => {
            const date = new Date(s.timestamp);
            return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
        }).length;

        const monthlyGrowth = lastMonthLeads > 0 ? Math.round(((currentMonthLeads - lastMonthLeads) / lastMonthLeads) * 100) : 0;

        // Calculate pipeline value
        const budgetValues = {
            'under-5k': 2.5,
            '5k-15k': 10,
            '15k-50k': 32.5,
            '50k-100k': 75,
            'over-100k': 150
        };

        const activePipeline = this.submissions.filter(s => 
            ['pending', 'contacted', 'quoted'].includes(s.status || 'pending')
        );

        const pipelineValue = Math.round(activePipeline.reduce((sum, submission) => {
            return sum + (budgetValues[submission.budget] || 0);
        }, 0));

        const closedDeals = this.submissions.filter(s => s.status === 'completed').length;

        return {
            totalLeads,
            conversionRate,
            avgResponseTime: '2.5 hrs', // This would need actual response tracking
            monthlyGrowth,
            pipelineValue,
            closedDeals
        };
    }

    updateMetric(id, value) {
        const element = document.querySelector(`[data-metric="${id}"] .metric-value`);
        if (element) {
            element.textContent = value;
        }
    }

    setupRealTimeUpdates() {
        this.firebaseAdmin.onSubmissionsUpdate(async (submissions) => {
            this.submissions = submissions;
            this.updateCharts();
            this.updateEngagementMetrics();
        });
    }

    updateCharts() {
        // Update all charts with new data
        if (this.charts.submissionTrends) {
            const trendData = this.getSubmissionTrendData();
            this.charts.submissionTrends.data.labels = trendData.labels;
            this.charts.submissionTrends.data.datasets[0].data = trendData.data;
            this.charts.submissionTrends.update();
        }

        if (this.charts.projectType) {
            const projectData = this.getProjectTypeData();
            this.charts.projectType.data.labels = projectData.labels;
            this.charts.projectType.data.datasets[0].data = projectData.data;
            this.charts.projectType.update();
        }

        if (this.charts.budgetDistribution) {
            const budgetData = this.getBudgetDistributionData();
            this.charts.budgetDistribution.data.datasets[0].data = budgetData.data;
            this.charts.budgetDistribution.update();
        }

        if (this.charts.conversionFunnel) {
            const funnelData = this.getConversionFunnelData();
            this.charts.conversionFunnel.data.datasets[0].data = funnelData.data;
            this.charts.conversionFunnel.update();
        }
    }

    exportAnalyticsReport() {
        const metrics = this.calculateEngagementMetrics();
        const reportData = {
            generatedAt: new Date().toISOString(),
            totalSubmissions: this.submissions.length,
            metrics: metrics,
            submissions: this.submissions.map(s => ({
                id: s.id,
                businessName: s.businessName,
                email: s.email,
                projectType: s.projectType,
                budget: s.budget,
                status: s.status,
                timestamp: s.timestamp
            }))
        };

        // Create and download JSON file
        const dataStr = JSON.stringify(reportData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `analytics-report-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}

// Initialize analytics when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('analytics-view')) {
        window.analyticsManager = new AnalyticsManager();
    }
});