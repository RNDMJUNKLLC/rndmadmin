# Google Ads & AdSense Configuration Guide

## Overview
The Admin Dashboard now supports Google Ads and AdSense tracking through three methods:
1. **API Integration** - Connect your Google Ads/AdSense accounts via API
2. **Manual Entry** - Manually enter your metrics
3. **Sync Functions** - Refresh data on demand

## Accessing the Feature

1. Navigate to **Ads & AdSense** section in the sidebar
2. Click **"Setup Integration"** button to configure

## Configuration Options

### 1. Google Ads API Setup

To connect your Google Ads account:

**Required Credentials:**
- **Customer ID**: Your Google Ads customer ID (format: 123-456-7890)
  - Found in top right of Google Ads dashboard
- **Developer Token**: From Google Ads API Center
- **Client ID**: OAuth2 Client ID from Google Cloud Console
- **Client Secret**: OAuth2 Client Secret
- **Refresh Token**: OAuth2 refresh token

**How to Get Credentials:**
1. Visit [Google Ads API Documentation](https://developers.google.com/google-ads/api/docs/first-call/overview)
2. Set up a Google Cloud Project
3. Enable Google Ads API
4. Create OAuth2 credentials
5. Generate refresh token

### 2. AdSense API Setup

To connect your AdSense account:

**Required Credentials:**
- **Publisher ID**: Your AdSense publisher ID (format: pub-1234567890123456)
  - Found in AdSense account settings
- **Client ID**: OAuth2 Client ID
- **Client Secret**: OAuth2 Client Secret  
- **Refresh Token**: OAuth2 refresh token

**How to Get Credentials:**
1. Visit [AdSense API Documentation](https://developers.google.com/adsense/management/getting_started)
2. Set up a Google Cloud Project
3. Enable AdSense Management API
4. Create OAuth2 credentials
5. Generate refresh token

### 3. Manual Data Entry (Easiest)

Don't have API access? Enter your data manually:

**Google Ads (Last 30 Days):**
- Total Spend ($)
- Impressions
- Clicks

**AdSense (Last 30 Days):**
- Revenue ($)
- Page Views
- CTR (%)

The dashboard will automatically calculate:
- Click-through rates (CTR)
- Revenue per thousand impressions (RPM)
- Other derived metrics

## Features

### Dashboard View
- **Real-time metrics** for both Google Ads and AdSense
- **30-day overview** of performance
- **Sync buttons** to refresh data on demand

### Metrics Tracked

**Google Ads:**
- Total Spend
- Impressions
- Clicks
- CTR (automatically calculated)

**AdSense:**
- Revenue
- Page Views
- RPM (automatically calculated)
- CTR

### Data Storage

All data is stored in Firebase Realtime Database:
- `google-ads-data` - Google Ads metrics
- `adsense-data` - AdSense metrics
- `ads-config` - API configuration (credentials)

⚠️ **Security Note**: API credentials are stored in Firebase. Ensure your Firebase rules restrict access to admin users only.

## Firebase Rules Required

Add these collections to your Firebase rules:

```json
{
  "rules": {
    "google-ads-data": {
      ".read": true,
      ".write": true
    },
    "adsense-data": {
      ".read": true,
      ".write": true
    },
    "ads-config": {
      ".read": true,
      ".write": true
    }
  }
}
```

## Usage

### First Time Setup
1. Click **"Setup Integration"** button
2. Choose your preferred method (API or Manual)
3. Enter your credentials or data
4. Click **"Save Configuration"** or **"Save Manual Data"**

### Updating Data
- **API Mode**: Click sync buttons to refresh from Google
- **Manual Mode**: Click "Setup Integration" → "Manual Entry" tab → Update values

### Viewing Metrics
- Navigate to **Ads & AdSense** section
- View real-time metrics in dashboard cards
- Metrics update automatically when synced

## Future Enhancements

Planned features:
- [ ] Actual Google Ads API integration (currently manual sync)
- [ ] Actual AdSense API integration (currently manual sync)
- [ ] Historical data charts
- [ ] ROI calculations
- [ ] Campaign-level breakdowns
- [ ] Automated daily sync
- [ ] Email alerts for unusual spending/revenue

## Troubleshooting

**401 Errors?**
- Update Firebase rules to allow access to new collections
- See FIREBASE_RULES_UPDATE.md

**Data not showing?**
- Check Firebase Console for data in correct collections
- Verify Firebase rules allow read access
- Check browser console for errors

**Sync not working?**
- API integration requires valid credentials
- Manual data entry works immediately without API setup

## Support

For issues or questions:
1. Check browser console for error messages
2. Verify Firebase rules are correct
3. Ensure credentials are valid (for API mode)
4. Use Manual Entry mode as fallback
