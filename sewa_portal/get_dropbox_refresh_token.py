#!/usr/bin/env python3
"""
Dropbox Refresh Token Generator
This script helps you get a permanent refresh token for your Dropbox app.
"""

import sys
import webbrowser
from urllib.parse import urlencode

print("=" * 70)
print("DROPBOX REFRESH TOKEN GENERATOR")
print("=" * 70)
print()

# Your app credentials
APP_KEY = "sx8kfslf66axldy"
APP_SECRET = "kfmpvyp6uu6jtm9"

print("Your Dropbox App Credentials:")
print(f"  App Key:    {APP_KEY}")
print(f"  App Secret: {APP_SECRET[:10]}...")
print()

print("STEP 1: Get Authorization Code")
print("-" * 70)
print()
print("I will open a browser to Dropbox authorization page.")
print("You need to:")
print("  1. Login to Dropbox (if not already logged in)")
print("  2. Click 'Allow' to authorize the app")
print("  3. Copy the AUTHORIZATION CODE shown on the page")
print()

# Build authorization URL with offline access (to get refresh token)
auth_params = {
    'client_id': APP_KEY,
    'response_type': 'code',
    'token_access_type': 'offline',  # This requests a refresh token
}

auth_url = f"https://www.dropbox.com/oauth2/authorize?{urlencode(auth_params)}"

print(f"Authorization URL:")
print(f"  {auth_url}")
print()

try:
    input("Press ENTER to open browser (or Ctrl+C to cancel)...")
    webbrowser.open(auth_url)
except KeyboardInterrupt:
    print("\nCancelled.")
    sys.exit(0)

print()
print("-" * 70)
print("STEP 2: Exchange Code for Refresh Token")
print("-" * 70)
print()

auth_code = input("Paste the AUTHORIZATION CODE here: ").strip()

if not auth_code:
    print("Error: No code provided!")
    sys.exit(1)

print()
print("Exchanging code for refresh token...")
print()

try:
    import dropbox
    
    # Exchange authorization code for refresh token
    dbx_auth = dropbox.DropboxOAuth2FlowNoRedirect(
        APP_KEY,
        APP_SECRET,
        token_access_type='offline'  # Request refresh token
    )
    
    oauth_result = dbx_auth.finish(auth_code)
    
    print("=" * 70)
    print("✅ SUCCESS! Here are your tokens:")
    print("=" * 70)
    print()
    print(f"ACCESS TOKEN (expires in ~4 hours):")
    print(f"  {oauth_result.access_token}")
    print()
    print(f"REFRESH TOKEN (never expires):")
    print(f"  {oauth_result.refresh_token}")
    print()
    print("=" * 70)
    print()
    
    # Test the refresh token
    print("Testing refresh token...")
    dbx = dropbox.Dropbox(
        app_key=APP_KEY,
        app_secret=APP_SECRET,
        oauth2_refresh_token=oauth_result.refresh_token
    )
    
    account = dbx.users_get_current_account()
    print(f"✅ Connected to: {account.name.display_name}")
    print(f"✅ Email: {account.email}")
    print()
    
    print("=" * 70)
    print("CONFIGURATION INSTRUCTIONS")
    print("=" * 70)
    print()
    print("Update your settings.py with:")
    print()
    print(f"DROPBOX_APP_KEY = os.environ.get('DROPBOX_APP_KEY', '{APP_KEY}')")
    print(f"DROPBOX_APP_SECRET = os.environ.get('DROPBOX_APP_SECRET', '{APP_SECRET}')")
    print(f"DROPBOX_REFRESH_TOKEN = os.environ.get('DROPBOX_REFRESH_TOKEN', '{oauth_result.refresh_token}')")
    print()
    print("Or for Render deployment, set these environment variables:")
    print(f"  DROPBOX_APP_KEY = {APP_KEY}")
    print(f"  DROPBOX_APP_SECRET = {APP_SECRET}")
    print(f"  DROPBOX_REFRESH_TOKEN = {oauth_result.refresh_token}")
    print()
    print("=" * 70)
    print("✅ Done! Your refresh token will NEVER expire (unless you revoke it).")
    print("=" * 70)
    
except dropbox.exceptions.OAuth2FlowNoRedirectError as e:
    print(f"❌ Error: {e}")
    print()
    print("The authorization code might be:")
    print("  - Already used (codes can only be used once)")
    print("  - Expired (codes expire after ~10 minutes)")
    print("  - Invalid")
    print()
    print("Please run this script again to get a new code.")
    
except Exception as e:
    print(f"❌ Error: {type(e).__name__}: {e}")
    import traceback
    traceback.print_exc()
