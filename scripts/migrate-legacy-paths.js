#!/usr/bin/env node
/**
 * One-time data migration: copy/move old RTDB paths used by the legacy
 * rndmdevelopment site to the schema used by the admin dashboard.
 *
 *   formSubmissions  ->  contact-forms
 *   sosRequests      ->  support-tickets
 *
 * By default the script COPIES (non-destructive). Pass --delete-source to
 * remove the old data after a successful copy. Pass --dry-run to preview only.
 *
 * Usage:
 *   node scripts/migrate-legacy-paths.js                # dry-run + copy preview
 *   node scripts/migrate-legacy-paths.js --apply        # actually copy
 *   node scripts/migrate-legacy-paths.js --apply --delete-source
 *
 * Requires Firebase Admin credentials (see set-admin-claim.js).
 */

const path = require('path');
const fs = require('fs');
const admin = require('firebase-admin');

const DATABASE_URL = 'https://rndmform-56a7b-default-rtdb.firebaseio.com';

const MIGRATIONS = [
  { from: 'formSubmissions', to: 'contact-forms' },
  { from: 'sosRequests', to: 'support-tickets' },
];

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

async function migrate({ apply, deleteSource }) {
  admin.initializeApp({
    credential: loadCredentials(),
    databaseURL: DATABASE_URL,
  });
  const db = admin.database();

  for (const { from, to } of MIGRATIONS) {
    console.log(`\n\u2192 Inspecting /${from}  \u2794  /${to}`);
    const sourceSnap = await db.ref(from).once('value');
    const sourceData = sourceSnap.val();

    if (!sourceData) {
      console.log(`   (empty \u2014 nothing to migrate)`);
      continue;
    }

    const sourceCount = Object.keys(sourceData).length;
    const destSnap = await db.ref(to).once('value');
    const destData = destSnap.val() || {};
    const destCount = Object.keys(destData).length;

    console.log(`   source has ${sourceCount} records, destination has ${destCount}`);

    // Skip duplicates by id
    const merged = { ...destData };
    let copied = 0;
    let skipped = 0;
    for (const [id, value] of Object.entries(sourceData)) {
      if (merged[id]) {
        skipped++;
        continue;
      }
      merged[id] = value;
      copied++;
    }
    console.log(`   would copy ${copied} new records (${skipped} already present at destination)`);

    if (!apply) continue;

    if (copied > 0) {
      await db.ref(to).update(
        Object.fromEntries(
          Object.entries(sourceData).filter(([id]) => !destData[id])
        )
      );
      console.log(`   \u2713 copied ${copied} records to /${to}`);
    }

    if (deleteSource) {
      await db.ref(from).remove();
      console.log(`   \u2713 removed source path /${from}`);
    }
  }

  console.log('\nDone.');
  process.exit(0);
}

const apply = process.argv.includes('--apply');
const deleteSource = process.argv.includes('--delete-source');

if (!apply) {
  console.log('DRY RUN \u2014 no changes will be written. Re-run with --apply to commit.');
}
if (deleteSource && !apply) {
  console.log('Note: --delete-source is ignored without --apply.');
}

migrate({ apply, deleteSource }).catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
