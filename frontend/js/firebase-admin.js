// Firebase configuration and integration for RNDM Admin Dashboard
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { 
  getDatabase, 
  ref, 
  onValue, 
  push, 
  update, 
  remove, 
  get,
  query,
  orderByChild,
  limitToLast,
  startAt,
  endAt
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';
import { 
  getAuth, 
  signInWithEmailAndPassword,
  onAuthStateChanged 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// Firebase configuration from the reference repository
const firebaseConfig = {
  apiKey: "AIzaSyA7Y2ppKIFumXd5aa7Lwj-263p-p1jiK7M",
  authDomain: "rndmform-56a7b.firebaseapp.com",
  databaseURL: "https://rndmform-56a7b-default-rtdb.firebaseio.com",
  projectId: "rndmform-56a7b",
  storageBucket: "rndmform-56a7b.appspot.com",
  messagingSenderId: "592358469137",
  appId: "1:592358469137:web:b2d18e70a70c4c42958bb0",
  measurementId: "G-FB38H9S3QC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

class FirebaseAdminService {
  constructor() {
    this.database = database;
    this.auth = auth;
    this.currentUser = null;
    
    // Database references
    this.contactFormsRef = ref(database, 'contact-forms');
    this.usersRef = ref(database, 'users');
    this.supportTicketsRef = ref(database, 'support-tickets');
    this.applicationsRef = ref(database, 'applications');
    
    // Listen for auth changes
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
    });
  }

  // Authentication for admin
  async signInAdmin(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error('Admin sign in error:', error);
      return { success: false, message: error.message };
    }
  }

  // Get all contact form submissions
  async getContactSubmissions(limit = 100) {
    try {
      const snapshot = await get(query(this.contactFormsRef, limitToLast(limit)));
      if (snapshot.exists()) {
        const data = snapshot.val();
        const submissions = Object.keys(data).map(key => ({
          id: key,
          ...data[key],
          dateSubmitted: data[key].dateSubmitted || new Date(data[key].timestamp).toISOString()
        })).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        
        return { success: true, submissions };
      }
      return { success: true, submissions: [] };
    } catch (error) {
      console.error('Error getting submissions:', error);
      return { success: false, message: error.message };
    }
  }

  // Listen to contact submissions in real-time
  onContactSubmissionsChange(callback, limit = 100) {
    const submissionsQuery = query(this.contactFormsRef, limitToLast(limit));
    
    return onValue(submissionsQuery, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const submissions = Object.keys(data).map(key => ({
          id: key,
          ...data[key],
          dateSubmitted: data[key].dateSubmitted || new Date(data[key].timestamp).toISOString()
        })).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        
        callback({ success: true, submissions });
      } else {
        callback({ success: true, submissions: [] });
      }
    });
  }

  // Update contact submission
  async updateContactSubmission(submissionId, updatedData) {
    try {
      const submissionRef = ref(database, `contact-forms/${submissionId}`);
      await update(submissionRef, {
        ...updatedData,
        lastModified: Date.now(),
        lastModifiedDate: new Date().toISOString()
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating submission:', error);
      return { success: false, message: error.message };
    }
  }

  // Delete contact submission
  async deleteContactSubmission(submissionId) {
    try {
      const submissionRef = ref(database, `contact-forms/${submissionId}`);
      await remove(submissionRef);
      return { success: true };
    } catch (error) {
      console.error('Error deleting submission:', error);
      return { success: false, message: error.message };
    }
  }

  // Get all users
  async getAllUsers(limit = 100) {
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