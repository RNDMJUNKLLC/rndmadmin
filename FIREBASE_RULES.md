# Firebase Security Rules Configuration

## Issue
Getting 401 Unauthorized when accessing Firebase Realtime Database via REST API.

## Solution
Update Firebase Security Rules to allow authenticated read/write access.

## Steps to Fix

### 1. Go to Firebase Console
https://console.firebase.google.com/project/rndmform-56a7b/database/rndmform-56a7b-default-rtdb/rules

### 2. Current Rules (Likely)
```json
{
  "rules": {
    ".read": false,
    ".write": false
  }
}
```

### 3. Update to Admin Dashboard Rules
```json
{
  "rules": {
    "contact-forms": {
      ".read": true,
      ".write": true,
      ".indexOn": ["timestamp", "status"]
    },
    "users": {
      ".read": true,
      ".write": true,
      ".indexOn": ["dateJoined"]
    },
    "support-tickets": {
      ".read": true,
      ".write": true,
      ".indexOn": ["timestamp", "status"]
    },
    "applications": {
      ".read": true,
      ".write": true,
      ".indexOn": ["timestamp"]
    }
  }
}
```

### 4. More Secure Alternative (Recommended for Production)
If you want to restrict access, you can:

**Option A: IP Whitelist (Cloudflare Workers)**
- Configure Cloudflare Workers to proxy Firebase requests
- Add authentication layer in Worker

**Option B: Use Firebase Auth with REST API**
- Implement sign-in with email/password
- Get ID token
- Include token in requests: `?auth=<id_token>`

### 5. For Now (Quick Fix)
Use the rules above to allow the admin dashboard to work, then we can implement proper authentication later.

## Testing
After updating rules:
1. Wait 1 minute for rules to propagate
2. Hard refresh dashboard (Ctrl+Shift+R)
3. Should see data loading successfully
4. No more 401 errors

## Security Note
The rules above allow public read/write. For production, you should:
1. Implement Firebase Authentication
2. Add auth checks in rules: `"$uid": { ".read": "auth != null" }`
3. Or proxy through Cloudflare Workers with API key validation
