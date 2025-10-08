# Cloudflare Workers - Disable Web Analytics

# To remove the Cloudflare Insights beacon CSP error:

# Option 1: Disable in Cloudflare Dashboard
1. Go to: https://dash.cloudflare.com
2. Select your domain: rndmjunk.com
3. Navigate to: Speed > Web Analytics
4. Toggle OFF "Enable Web Analytics"

# Option 2: Keep it (Recommended)
The error is harmless and doesn't affect functionality.
Cloudflare Web Analytics provides useful visitor insights.
The CSP error just means the beacon script can't load,
but your dashboard works perfectly fine without it.

# Your Choice:
- Keep it = Free analytics data about dashboard usage
- Disable it = No CSP error in console (purely cosmetic)
