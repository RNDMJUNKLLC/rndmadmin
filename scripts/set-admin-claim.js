#!/usr/bin/env node
/**
 * Grant or revoke the `admin: true` custom claim on a Firebase Auth user.
 *
 * Usage:
 *   node scripts/set-admin-claim.js grant  user@example.com
 *   node scripts/set-admin-claim.js revoke user@example.com
 *
 * Requires:
 *   - GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json  (env var), OR
 *   - ./service-account.json file in the repo root (gitignored).
 *
 * Download the key from:
 *   https://console.firebase.google.com/project/rndmform-56a7b/settings/serviceaccounts/adminsdk
 *
 * After running, the user must sign out and sign back in (or call
 * getIdToken(true)) before the new claim is reflected in their token.
 */

const path = require('path');
const fs = require('fs');
const admin = require('firebase-admin');

function loadCredentials() {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return admin.credential.applicationDefault();
  }
  const local = path.resolve(process.cwd(), 'service-account.json');
  if (fs.existsSync(local)) {
    return admin.credential.cert(require(local));
  }
  console.error(
    'No credentials found. Set GOOGLE_APPLICATION_CREDENTIALS or place service-account.json at the repo root.'
  );
  process.exit(1);
}

async function main() {
  const [, , action, email] = process.argv;
  if (!action || !email || !['grant', 'revoke'].includes(action)) {
    console.error('Usage: node scripts/set-admin-claim.js <grant|revoke> <email>');
    process.exit(1);
  }

  admin.initializeApp({ credential: loadCredentials() });

  let user;
  try {
    user = await admin.auth().getUserByEmail(email);
  } catch (err) {
    console.error(`User not found: ${email}`);
    process.exit(1);
  }

  const existing = user.customClaims || {};
  const updated = { ...existing };
  if (action === 'grant') {
    updated.admin = true;
  } else {
    delete updated.admin;
  }

  await admin.auth().setCustomUserClaims(user.uid, updated);

  // Force-revoke the user's existing tokens so they pick up new claims on next sign-in.
  await admin.auth().revokeRefreshTokens(user.uid);

  console.log(
    `\u2713 ${action === 'grant' ? 'Granted' : 'Revoked'} admin claim for ${email} (uid: ${user.uid})`
  );
  console.log('  The user must sign in again for the change to take effect.');
}

main().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
