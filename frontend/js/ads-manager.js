/**
 * Google Ads & AdSense Management Module
 * Handles ads tracking, spending, revenue, and API configuration
 */

import firebaseService from './firebase-rest.js';

class AdsManager {
  constructor() {
    this.firebaseAdmin = firebaseService;
    this.adsData = null;
    this.adsenseData = null;
    this.init();
  }

  init() {
    console.log('✅ Ads Manager initialized');
    this.setupEventListeners();
    this.loadAdsData();
  }

  setupEventListeners() {
    // Event delegation for dynamically created elements
    document.addEventListener('click', (e) => {
      if (e.target.matches('[onclick*="showAdsSetup"]') || 
          e.target.closest('[onclick*="showAdsSetup"]')) {
        e.preventDefault();
        this.showAdsSetup();
      }
      if (e.target.matches('[onclick*="syncGoogleAds"]') || 
          e.target.closest('[onclick*="syncGoogleAds"]')) {
        e.preventDefault();
        this.syncGoogleAds();
      }
      if (e.target.matches('[onclick*="syncAdSense"]') || 
          e.target.closest('[onclick*="syncAdSense"]')) {
        e.preventDefault();
        this.syncAdSense();
      }
    });
  }

  async loadAdsData() {
    try {
      // Load Google Ads data
      const adsResult = await this.firebaseAdmin.getGoogleAdsData();
      if (adsResult.success) {
        this.adsData = adsResult.data;
        this.updateAdsMetrics();
      }

      // Load AdSense data
      const adsenseResult = await this.firebaseAdmin.getAdSenseData();
      if (adsenseResult.success) {
        this.adsenseData = adsenseResult.data;
        this.updateAdSenseMetrics();
      }
    } catch (error) {
      console.error('Error loading ads data:', error);
    }
  }

  updateAdsMetrics() {
    if (!this.adsData) return;

    const spend = this.adsData.totalSpend || 0;
    const impressions = this.adsData.impressions || 0;
    const clicks = this.adsData.clicks || 0;
    const ctr = impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : 0;

    this.updateElement('ads-spend', `$${spend.toFixed(2)}`);
    this.updateElement('ads-impressions', impressions.toLocaleString());
    this.updateElement('ads-clicks', clicks.toLocaleString());
    this.updateElement('ads-ctr', `${ctr}%`);
  }

  updateAdSenseMetrics() {
    if (!this.adsenseData) return;

    const revenue = this.adsenseData.revenue || 0;
    const views = this.adsenseData.pageViews || 0;
    const rpm = views > 0 ? ((revenue / views) * 1000).toFixed(2) : 0;
    const ctr = this.adsenseData.ctr || 0;

    this.updateElement('adsense-revenue', `$${revenue.toFixed(2)}`);
    this.updateElement('adsense-views', views.toLocaleString());
    this.updateElement('adsense-rpm', `$${rpm}`);
    this.updateElement('adsense-ctr', `${ctr.toFixed(2)}%`);
  }

  updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value;
    }
  }

  showAdsSetup() {
    const modal = this.createAdsSetupModal();
    document.body.appendChild(modal);
  }

  createAdsSetupModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content" style="max-width: 700px;">
        <div class="modal-header">
          <h3>Google Ads & AdSense Configuration</h3>
          <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
        </div>
        <div class="modal-body">
          <div class="setup-tabs">
            <button class="tab-btn active" data-tab="google-ads">Google Ads</button>
            <button class="tab-btn" data-tab="adsense">AdSense</button>
            <button class="tab-btn" data-tab="manual-entry">Manual Entry</button>
          </div>

          <!-- Google Ads Tab -->
          <div class="tab-content active" id="google-ads-tab">
            <div class="setup-section">
              <h4><i class="fab fa-google"></i> Google Ads API Setup</h4>
              <p class="help-text">Connect your Google Ads account to track spending and performance.</p>
              
              <div class="form-group">
                <label>Google Ads Customer ID</label>
                <input type="text" id="ads-customer-id" placeholder="123-456-7890">
                <small>Found in your Google Ads account (top right corner)</small>
              </div>

              <div class="form-group">
                <label>Developer Token</label>
                <input type="password" id="ads-dev-token" placeholder="Enter developer token">
                <small>Get from Google Ads API Center</small>
              </div>

              <div class="form-group">
                <label>Client ID</label>
                <input type="text" id="ads-client-id" placeholder="Enter OAuth2 Client ID">
              </div>

              <div class="form-group">
                <label>Client Secret</label>
                <input type="password" id="ads-client-secret" placeholder="Enter OAuth2 Client Secret">
              </div>

              <div class="form-group">
                <label>Refresh Token</label>
                <input type="password" id="ads-refresh-token" placeholder="Enter refresh token">
              </div>

              <div class="info-box">
                <i class="fas fa-info-circle"></i>
                <div>
                  <strong>Need help?</strong>
                  <p>Visit <a href="https://developers.google.com/google-ads/api/docs/first-call/overview" target="_blank">Google Ads API Documentation</a> to get your credentials.</p>
                </div>
              </div>
            </div>
          </div>

          <!-- AdSense Tab -->
          <div class="tab-content" id="adsense-tab">
            <div class="setup-section">
              <h4><i class="fas fa-dollar-sign"></i> AdSense API Setup</h4>
              <p class="help-text">Connect your AdSense account to track revenue and performance.</p>
              
              <div class="form-group">
                <label>AdSense Publisher ID</label>
                <input type="text" id="adsense-publisher-id" placeholder="pub-1234567890123456">
                <small>Found in your AdSense account settings</small>
              </div>

              <div class="form-group">
                <label>Client ID</label>
                <input type="text" id="adsense-client-id" placeholder="Enter OAuth2 Client ID">
              </div>

              <div class="form-group">
                <label>Client Secret</label>
                <input type="password" id="adsense-client-secret" placeholder="Enter OAuth2 Client Secret">
              </div>

              <div class="form-group">
                <label>Refresh Token</label>
                <input type="password" id="adsense-refresh-token" placeholder="Enter refresh token">
              </div>

              <div class="info-box">
                <i class="fas fa-info-circle"></i>
                <div>
                  <strong>Need help?</strong>
                  <p>Visit <a href="https://developers.google.com/adsense/management/getting_started" target="_blank">AdSense API Documentation</a> to get your credentials.</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Manual Entry Tab -->
          <div class="tab-content" id="manual-entry-tab">
            <div class="setup-section">
              <h4><i class="fas fa-edit"></i> Manual Data Entry</h4>
              <p class="help-text">Don't have API access? Enter your data manually.</p>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div>
                  <h5>Google Ads (Last 30 Days)</h5>
                  <div class="form-group">
                    <label>Total Spend ($)</label>
                    <input type="number" id="manual-ads-spend" step="0.01" min="0" placeholder="0.00">
                  </div>
                  <div class="form-group">
                    <label>Impressions</label>
                    <input type="number" id="manual-ads-impressions" min="0" placeholder="0">
                  </div>
                  <div class="form-group">
                    <label>Clicks</label>
                    <input type="number" id="manual-ads-clicks" min="0" placeholder="0">
                  </div>
                </div>

                <div>
                  <h5>AdSense (Last 30 Days)</h5>
                  <div class="form-group">
                    <label>Revenue ($)</label>
                    <input type="number" id="manual-adsense-revenue" step="0.01" min="0" placeholder="0.00">
                  </div>
                  <div class="form-group">
                    <label>Page Views</label>
                    <input type="number" id="manual-adsense-views" min="0" placeholder="0">
                  </div>
                  <div class="form-group">
                    <label>CTR (%)</label>
                    <input type="number" id="manual-adsense-ctr" step="0.01" min="0" max="100" placeholder="0.00">
                  </div>
                </div>
              </div>

              <button class="btn-primary" onclick="window.adsManager.saveManualData(); this.closest('.modal').remove();" style="margin-top: 20px;">
                <i class="fas fa-save"></i> Save Manual Data
              </button>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
          <button class="btn-primary" onclick="window.adsManager.saveAdsConfig(); this.closest('.modal').remove();">
            <i class="fas fa-check"></i> Save Configuration
          </button>
        </div>
      </div>
    `;

    // Setup tab switching
    const tabs = modal.querySelectorAll('.tab-btn');
    const contents = modal.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        contents.forEach(c => c.classList.remove('active'));
        
        tab.classList.add('active');
        const targetTab = modal.querySelector(`#${tab.dataset.tab}-tab`);
        if (targetTab) {
          targetTab.classList.add('active');
        }
      });
    });

    return modal;
  }

  async saveAdsConfig() {
    try {
      const config = {
        googleAds: {
          customerId: document.getElementById('ads-customer-id')?.value,
          developerToken: document.getElementById('ads-dev-token')?.value,
          clientId: document.getElementById('ads-client-id')?.value,
          clientSecret: document.getElementById('ads-client-secret')?.value,
          refreshToken: document.getElementById('ads-refresh-token')?.value,
        },
        adSense: {
          publisherId: document.getElementById('adsense-publisher-id')?.value,
          clientId: document.getElementById('adsense-client-id')?.value,
          clientSecret: document.getElementById('adsense-client-secret')?.value,
          refreshToken: document.getElementById('adsense-refresh-token')?.value,
        }
      };

      const result = await this.firebaseAdmin.saveAdsConfig(config);
      
      if (result.success) {
        this.showNotification('Configuration saved successfully', 'success');
      } else {
        this.showNotification('Failed to save configuration', 'error');
      }
    } catch (error) {
      console.error('Error saving ads config:', error);
      this.showNotification('Error saving configuration', 'error');
    }
  }

  async saveManualData() {
    try {
      const adsData = {
        totalSpend: parseFloat(document.getElementById('manual-ads-spend')?.value || 0),
        impressions: parseInt(document.getElementById('manual-ads-impressions')?.value || 0),
        clicks: parseInt(document.getElementById('manual-ads-clicks')?.value || 0),
        lastUpdated: Date.now(),
        source: 'manual'
      };

      const adsenseData = {
        revenue: parseFloat(document.getElementById('manual-adsense-revenue')?.value || 0),
        pageViews: parseInt(document.getElementById('manual-adsense-views')?.value || 0),
        ctr: parseFloat(document.getElementById('manual-adsense-ctr')?.value || 0),
        lastUpdated: Date.now(),
        source: 'manual'
      };

      const adsResult = await this.firebaseAdmin.saveGoogleAdsData(adsData);
      const adsenseResult = await this.firebaseAdmin.saveAdSenseData(adsenseData);

      if (adsResult.success && adsenseResult.success) {
        this.adsData = adsData;
        this.adsenseData = adsenseData;
        this.updateAdsMetrics();
        this.updateAdSenseMetrics();
        this.showNotification('Manual data saved successfully', 'success');
      } else {
        this.showNotification('Failed to save data', 'error');
      }
    } catch (error) {
      console.error('Error saving manual data:', error);
      this.showNotification('Error saving data', 'error');
    }
  }

  async syncGoogleAds() {
    this.showNotification('Syncing Google Ads data...', 'info');
    
    // TODO: Implement actual Google Ads API sync
    // For now, just reload from Firebase
    await this.loadAdsData();
    
    this.showNotification('Google Ads data synced', 'success');
  }

  async syncAdSense() {
    this.showNotification('Syncing AdSense data...', 'info');
    
    // TODO: Implement actual AdSense API sync
    // For now, just reload from Firebase
    await this.loadAdsData();
    
    this.showNotification('AdSense data synced', 'success');
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
      <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('fade-out');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}

// Create singleton instance
const adsManager = new AdsManager();

// Export for use in other modules
export default adsManager;

// Make available globally for HTML onclick handlers
window.adsManager = adsManager;
window.showAdsSetup = () => adsManager.showAdsSetup();
window.syncGoogleAds = () => adsManager.syncGoogleAds();
window.syncAdSense = () => adsManager.syncAdSense();
