/* 認証ゲート — SHA-256 ハッシュ照合 */
const AUTH_HASH = 'babb15b87d235c2af75d286d1c126c457b3544ec2fb7c926efb70083ca045087';
const AUTH_KEY  = 'es2_auth';

async function sha256(str) {
  const buf  = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
}

/* ログイン済みかチェック。未認証なら login.html へ飛ばす */
function requireAuth() {
  if (sessionStorage.getItem(AUTH_KEY) !== '1') {
    location.replace('login.html');
  }
}

/* ログアウト */
function logout() {
  sessionStorage.removeItem(AUTH_KEY);
  location.replace('login.html');
}
