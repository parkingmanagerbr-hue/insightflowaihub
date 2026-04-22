// Set GitHub Actions secrets using libsodium sealed box (official GitHub approach)
import _sodium from 'libsodium-wrappers';

const GITHUB_TOKEN = process.env.GH_TOKEN || '';
const REPO = 'parkingmanagerbr-hue/insightflowaihub';

async function getPublicKey() {
  const res = await fetch(
    `https://api.github.com/repos/${REPO}/actions/secrets/public-key`,
    { headers: { Authorization: `token ${GITHUB_TOKEN}`, Accept: 'application/vnd.github.v3+json' } }
  );
  return res.json();
}

async function encryptSecret(secretValue, publicKeyBase64) {
  await _sodium.ready;
  const sodium = _sodium;
  const publicKey = sodium.from_base64(publicKeyBase64, sodium.base64_variants.ORIGINAL);
  const secretBytes = sodium.from_string(secretValue);
  const encrypted = sodium.crypto_box_seal(secretBytes, publicKey);
  return sodium.to_base64(encrypted, sodium.base64_variants.ORIGINAL);
}

async function setSecret(name, value, keyId, publicKey) {
  const encrypted = await encryptSecret(value, publicKey);
  const res = await fetch(
    `https://api.github.com/repos/${REPO}/actions/secrets/${name}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        Accept: 'application/vnd.github.v3+json',
      },
      body: JSON.stringify({ encrypted_value: encrypted, key_id: keyId }),
    }
  );
  const ok = res.status === 204 || res.status === 201;
  console.log(`  ${ok ? '✅' : '❌'} ${name} (HTTP ${res.status})`);
  if (!ok) console.log('     Error:', await res.text());
}

const SECRETS = {
  VERCEL_ORG_ID:             'team_BJZ13WbfG2MO9aOKJq3im7I6',
  VERCEL_PROJECT_ID:         'prj_2MxDZRRW7JZEzOHJKXDXhn6guoYC',
  VITE_SUPABASE_URL:         'https://ehzikjukkowxvfkfiyxu.supabase.co',
  VITE_SUPABASE_PROJECT_ID:  'ehzikjukkowxvfkfiyxu',
  VITE_SUPABASE_PUBLISHABLE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVoemlranVra293eHZma2ZpeXh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1MDU0MjUsImV4cCI6MjA4NDA4MTQyNX0.FpqKa1pQgXNUCRaovR91zVw9SPp9ewA3_9Bm9IQfAzs',
};

(async () => {
  if (!GITHUB_TOKEN) { console.error('Set GH_TOKEN env var'); process.exit(1); }
  const { key_id, key } = await getPublicKey();
  console.log('Definindo secrets do GitHub Actions...\n');
  for (const [name, value] of Object.entries(SECRETS)) {
    await setSecret(name, value, key_id, key);
  }
  console.log('\n⚠️  Defina manualmente estes secrets sensíveis:');
  console.log('   URL: https://github.com/parkingmanagerbr-hue/insightflowaihub/settings/secrets/actions');
  console.log('   - VERCEL_TOKEN         → token clássico em https://vercel.com/account/tokens');
  console.log('   - GMAIL_USERNAME       → ex: seuemail@gmail.com');
  console.log('   - GMAIL_APP_PASSWORD   → App Password do Google (16 chars sem espaços)');
  console.log('   - NOTIFY_EMAIL         → email que receberá as notificações de deploy');
})();
