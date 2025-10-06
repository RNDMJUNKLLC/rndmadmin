// Firebase imports
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

import {
  getDatabase,
  ref,
  push,
  set,
  get,
  update,
  remove,
  query,
  orderByChild,
  limitToLast,
  child,
  orderByKey
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

class FirebaseAdminService {
  constructor() {
    this.app = null;
    this.database = null;
    this.auth = null;
    this.initialized = false;
    
    // References will be set after initialization
    this.contactFormsRef = null;
    this.usersRef = null;
    this.supportTicketsRef = null;
    this.applicationsRef = null;
  }

  // Get Firebase configuration from secure endpoint
  async getFirebaseConfig() {
    try {
      const response = await fetch('/api/config/firebase');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to get Firebase config:', error);
      return null;
    }
  }

  // Initialize Firebase
  async initialize() {
    if (this.initialized) {
      return true;
    }

    try {
      const config = await this.getFirebaseConfig();
      if (!config) {
        console.warn('Firebase config not available - running in demo mode');
        return false;
      }

      // Initialize Firebase
      this.app = initializeApp(config);
      this.database = getDatabase(this.app);
      this.auth = getAuth(this.app);

      // Set up database references
      this.contactFormsRef = ref(this.database, 'contact-forms');
      this.usersRef = ref(this.database, 'users');
      this.supportTicketsRef = ref(this.database, 'support-tickets');
      this.applicationsRef = ref(this.database, 'applications');

      this.initialized = true;
      console.log('Firebase initialized successfully');
      return true;
    } catch (error) {
      console.error('Firebase initialization failed:', error);
      return false;
    }
  }

  // Sign in admin user
  async signInAdmin(email, password) {
    if (!await this.initialize()) {
      return { success: false, message: 'Firebase not available - running in demo mode' };
    }
    
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, message: error.message };
    }
  }

  // Get contact form submissions
  async getContactSubmissions(limit = 100) {
    if (!await this.initialize()) {
      return { success: true, submissions: [] }; // Return empty array in demo mode
    }
    
    try {
      // Query contact forms with optional limit
      const contactQuery = query(
        this.contactFormsRef,
        orderByChild('timestamp'),
        limitToLast(limit)
      );
      
      const snapshot = await get(contactQuery);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        
        // Convert to array and add IDs
        const submissions = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        
        // Sort by timestamp (newest first)
        submissions.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        
        return { success: true, submissions };
      } else {
        return { success: true, submissions: [] };
      }
    } catch (error) {
      console.error('Error getting contact submissions:', error);
      return { success: false, message: error.message };
    }
  }

  // Update contact form submission
  async updateContactSubmission(submissionId, updatedData) {
    if (!await this.initialize()) {
      return { success: false, message: 'Firebase not available - running in demo mode' };
    }
    
    try {
      const submissionRef = ref(this.database, `contact-forms/${submissionId}`);
      await update(submissionRef, {
        ...updatedData,
        lastModified: Date.now()
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating submission:', error);
      return { success: false, message: error.message };
    }
  }

  // Delete contact form submission
  async deleteContactSubmission(submissionId) {
    if (!await this.initialize()) {
      return { success: false, message: 'Firebase not available - running in demo mode' };
    }
    
    try {
      const submissionRef = ref(this.database, `contact-forms/${submissionId}`);
      await remove(submissionRef);
      return { success: true };
    } catch (error) {
      console.error('Error deleting submission:', error);
      return { success: false, message: error.message };
    }
  }

  // Get all users
  async getAllUsers(limit = 100) {
    if (!await this.initialize()) {
      return { success: true, users: [] }; // Return empty in demo mode
    }
    
    try {
      const snapshot = await get(query(this.usersRef, limitToLast(limit)));
      if (snapshot.exists()) {
        const data = snapshot.val();
        const users = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })).sort((a, b) => (b.dateJoined || 0) - (a.dateJoined || 0));
        
        return { success: true, users };
      }
      return { success: true, users: [] };
    } catch (error) {
      console.error('Error getting users:', error);
      return { success: false, message: error.message };
    }
  }

  // Get support tickets
  async getSupportTickets(limit = 50) {
    if (!await this.initialize()) {
      return { success: true, tickets: [] }; // Return empty in demo mode
    }
    
    try {
      const snapshot = await get(query(this.supportTicketsRef, limitToLast(limit)));
      if (snapshot.exists()) {
        const data = snapshot.val();
        const tickets = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        
        return { success: true, tickets };
      }
      return { success: true, tickets: [] };
    } catch (error) {
      console.error('Error getting support tickets:', error);
      return { success: false, message: error.message };
    }
  }

  // Get applications (job applications)
  async getApplications(limit = 50) {
    if (!await this.initialize()) {
      return { success: true, applications: [] }; // Return empty in demo mode
    }
    
    try {
      const snapshot = await get(query(this.applicationsRef, limitToLast(limit)));
      if (snapshot.exists()) {
        const data = snapshot.val();
        const applications = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        
        return { success: true, applications };
      }
      return { success: true, applications: [] };
    } catch (error) {
      console.error('Error getting applications:', error);
      return { success: false, message: error.message };
    }
  }

  // Get analytics data
  async getAnalytics() {
    if (!await this.initialize()) {
      // Return demo analytics data
      return {
        success: true,
        analytics: {
          submissions: { total: 0, today: 0, week: 0, month: 0, byType: {}, byBudget: {}, byTimeline: {}, byPriority: {} },
          users: { total: 0, week: 0, month: 0 },
          tickets: { total: 0, open: 0, week: 0 }
        }
      };
    }
    
    try {
      const [submissionsResult, usersResult, ticketsResult] = await Promise.all([
        this.getContactSubmissions(1000),
        this.getAllUsers(1000),
        this.getSupportTickets(1000)
      ]);

      const submissions = submissionsResult.submissions || [];
      const users = usersResult.users || [];
      const tickets = ticketsResult.tickets || [];

      // Calculate analytics
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

  // Utility function to group by field
  groupBy(array, field) {
    return array.reduce((acc, item) => {
      const key = item[field] || 'unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }

  // Get revenue estimates from project submissions
  async getRevenueEstimates() {
    if (!await this.initialize()) {
      return { success: true, estimates: { totalEstimated: 0, byMonth: {}, byType: {}, potentialRevenue: [] } };
    }
    
    try {
      const result = await this.getContactSubmissions(1000);
      if (!result.success) return result;

      const submissions = result.submissions;
      const budgetRanges = {
        '10-50': 30,      // Average of range
        '50-100': 75,
        '100-200': 150,
        '200-300': 250,
        '300+': 400,      // Conservative estimate
        'flexible': 200   // Average estimate
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
}

// Create and export singleton instance
export const firebaseAdmin = new FirebaseAdminService();
export { FirebaseAdminService };