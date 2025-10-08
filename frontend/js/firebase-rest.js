/**
 * Firebase REST API Service
 * Uses Firebase REST API instead of SDK to avoid CSP issues
 * No external scripts needed - pure fetch() calls
 */

import { firebaseConfig } from './firebase-config.js';

/**
 * Firebase REST API Service Class
 * Direct REST API calls to Firebase - no SDK dependencies
 */
class FirebaseRestService {
  constructor() {
    this.databaseURL = firebaseConfig.databaseURL;
    this.apiKey = firebaseConfig.apiKey;
    this.projectId = firebaseConfig.projectId;
    this.initialized = true;
    
    console.log('✅ Firebase REST Service initialized');
  }

  /**
   * Check if Firebase is ready
   */
  isReady() {
    return this.initialized;
  }

  /**
   * Build Firebase REST API URL
   * Note: Requires Firebase Database Rules to allow public read access
   * Or add ?auth=<database_secret> for authenticated access
   */
  buildURL(path) {
    return `${this.databaseURL}/${path}.json`;
  }

  /**
   * Get contact form submissions
   */
  async getContactSubmissions(limit = 100) {
    try {
      const url = this.buildURL('contact-forms');
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data) {
        return { success: true, submissions: [] };
      }
      
      // Convert object to array
      const submissions = Object.keys(data).map(key => ({
        id: key,
        ...data[key]
      }));
      
      // Sort by timestamp (newest first)
      submissions.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      
      // Limit results
      const limited = submissions.slice(0, limit);
      
      return { success: true, submissions: limited };
    } catch (error) {
      console.error('Error getting contact submissions:', error);
      return { success: false, message: error.message, submissions: [] };
    }
  }

  /**
   * Update contact form submission
   */
  async updateContactSubmission(submissionId, updatedData) {
    try {
      const url = this.buildURL(`contact-forms/${submissionId}`);
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...updatedData,
          lastModified: Date.now()
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error updating submission:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Delete contact form submission
   */
  async deleteContactSubmission(submissionId) {
    try {
      const url = this.buildURL(`contact-forms/${submissionId}`);
      const response = await fetch(url, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting submission:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Get all users
   */
  async getAllUsers(limit = 100) {
    try {
      const url = this.buildURL('users');
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data) {
        return { success: true, users: [] };
      }
      
      const users = Object.keys(data).map(key => ({
        id: key,
        ...data[key]
      })).sort((a, b) => (b.dateJoined || 0) - (a.dateJoined || 0));
      
      return { success: true, users: users.slice(0, limit) };
    } catch (error) {
      console.error('Error getting users:', error);
      return { success: false, message: error.message, users: [] };
    }
  }

  /**
   * Get support tickets
   */
  async getSupportTickets(limit = 50) {
    try {
      const url = this.buildURL('support-tickets');
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data) {
        return { success: true, tickets: [] };
      }
      
      const tickets = Object.keys(data).map(key => ({
        id: key,
        ...data[key]
      })).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      
      return { success: true, tickets: tickets.slice(0, limit) };
    } catch (error) {
      console.error('Error getting support tickets:', error);
      return { success: false, message: error.message, tickets: [] };
    }
  }

  /**
   * Get applications
   */
  async getApplications(limit = 50) {
    try {
      const url = this.buildURL('applications');
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data) {
        return { success: true, applications: [] };
      }
      
      const applications = Object.keys(data).map(key => ({
        id: key,
        ...data[key]
      })).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      
      return { success: true, applications: applications.slice(0, limit) };
    } catch (error) {
      console.error('Error getting applications:', error);
      return { success: false, message: error.message, applications: [] };
    }
  }

  /**
   * Get analytics data
   */
  async getAnalytics() {
    try {
      const [submissionsResult, usersResult, ticketsResult] = await Promise.all([
        this.getContactSubmissions(1000),
        this.getAllUsers(1000),
        this.getSupportTickets(1000)
      ]);

      const submissions = submissionsResult.submissions || [];
      const users = usersResult.users || [];
      const tickets = ticketsResult.tickets || [];

      // Calculate time ranges
      const now = Date.now();
      const today = new Date().setHours(0, 0, 0, 0);
      const thisWeek = now - (7 * 24 * 60 * 60 * 1000);
      const thisMonth = now - (30 * 24 * 60 * 60 * 1000);

      const analytics = {
        submissions: {
          total: submissions.length,
          today: submissions.filter(s => (s.timestamp || 0) >= today).length,
          week: submissions.filter(s => (s.timestamp || 0) >= thisWeek).length,
          month: submissions.filter(s => (s.timestamp || 0) >= thisMonth).length,
          byType: this.groupBy(submissions, 'projectType'),
          byBudget: this.groupBy(submissions, 'budget'),
          byTimeline: this.groupBy(submissions, 'timeline'),
          byPriority: this.groupBy(submissions, 'priority')
        },
        users: {
          total: users.length,
          week: users.filter(u => (u.dateJoined || 0) >= thisWeek).length,
          month: users.filter(u => (u.dateJoined || 0) >= thisMonth).length
        },
        tickets: {
          total: tickets.length,
          open: tickets.filter(t => t.status !== 'resolved').length,
          week: tickets.filter(t => (t.timestamp || 0) >= thisWeek).length
        }
      };

      return { success: true, analytics };
    } catch (error) {
      console.error('Error getting analytics:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Utility: Group array by field
   */
  groupBy(array, field) {
    return array.reduce((acc, item) => {
      const key = item[field] || 'unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }

  /**
   * Get revenue estimates
   */
  async getRevenueEstimates() {
    try {
      const result = await this.getContactSubmissions(1000);
      if (!result.success) return result;

      const submissions = result.submissions;
      const budgetRanges = {
        '10-50': 30,
        '50-100': 75,
        '100-200': 150,
        '200-300': 250,
        '300+': 400,
        'flexible': 200
      };

      const estimates = {
        totalEstimated: 0,
        byMonth: {},
        byType: {},
        potentialRevenue: submissions.map(sub => ({
          id: sub.id,
          projectType: sub.projectType,
          budget: sub.budget,
          estimatedValue: budgetRanges[sub.budget] || 150,
          date: sub.dateSubmitted || new Date(sub.timestamp).toISOString(),
          status: sub.status || 'pending'
        }))
      };

      estimates.totalEstimated = estimates.potentialRevenue.reduce((sum, project) => 
        sum + project.estimatedValue, 0);

      return { success: true, estimates };
    } catch (error) {
      console.error('Error calculating revenue estimates:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Create new user
   */
  async createUser(userData) {
    try {
      const url = this.buildURL('users');
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...userData,
          dateJoined: userData.dateJoined || Date.now(),
          status: userData.status || 'active'
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return { success: true, userId: data.name };
    } catch (error) {
      console.error('Error creating user:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Update user
   */
  async updateUser(userId, updatedData) {
    try {
      const url = this.buildURL(`users/${userId}`);
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...updatedData,
          lastModified: Date.now()
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error updating user:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Delete user
   */
  async deleteUser(userId) {
    try {
      const url = this.buildURL(`users/${userId}`);
      const response = await fetch(url, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting user:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Sign in admin user (placeholder - would need Firebase Auth REST API)
   */
  async signInAdmin(email, password) {
    console.warn('Auth not implemented in REST service - using placeholder');
    return { success: true, user: { email } };
  }

  /**
   * Sign out (placeholder)
   */
  async signOutAdmin() {
    return { success: true };
  }
}

// Create and export singleton instance
const firebaseAdmin = new FirebaseRestService();

// Export both the instance and class
export { firebaseAdmin, FirebaseRestService };
export default firebaseAdmin;
