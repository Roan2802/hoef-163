// Eenvoudig toegangscode-scherm. Drempel, geen echte beveiliging:
// de inhoud blijft technisch opvraagbaar voor wie de bron leest.
// Code wijzigen: zet GATE_HASH op de SHA-256 van de nieuwe code (hoofdletterongevoelig)
// en bump GATE_KEY zodat iedereen opnieuw moet invoeren.
(function () {
  const GATE_HASH = '473b2c0db27d50138ced8daaa0e6dbb80436a03a8e485e50ec2f42efac5ad98b';
  const GATE_KEY = 'hoef163-toegang-v1';
  if (localStorage.getItem(GATE_KEY) === GATE_HASH) return;

  async function sha256(s) {
    const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
    return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
  }

  // deelbare link: ?code=XXXX ontgrendelt direct
  const urlCode = new URLSearchParams(location.search).get('code');
  if (urlCode) {
    sha256(urlCode.trim().toUpperCase()).then(h => {
      if (h === GATE_HASH) {
        localStorage.setItem(GATE_KEY, GATE_HASH);
        document.getElementById('gate')?.remove();
        document.documentElement.style.overflow = '';
      }
    });
  }

  const css = `
    #gate { position: fixed; inset: 0; z-index: 9999; display: grid; place-items: center;
      background: #0e0c0a; color: #f3ede4; font-family: 'Inter', system-ui, sans-serif; }
    #gate .card { text-align: center; padding: 24px; max-width: 380px; }
    #gate h1 { font-family: 'Fraunces', Georgia, serif; font-weight: 900; font-size: 42px; margin: 0 0 6px; }
    #gate h1 i { color: #e8743a; }
    #gate p { color: #a89f93; font-size: 14px; margin: 0 0 22px; }
    #gate input { width: 100%; box-sizing: border-box; background: #1c1815; border: 1px solid #3a332c; color: #f3ede4;
      border-radius: 12px; padding: 14px 16px; font-size: 17px; text-align: center; letter-spacing: .2em; outline: none; }
    #gate input:focus { border-color: #e8743a; }
    #gate button { margin-top: 12px; width: 100%; border: 0; border-radius: 12px; padding: 14px; font-size: 16px;
      font-weight: 700; color: #fff; background: linear-gradient(135deg, #e8743a, #c95d2c); cursor: pointer; }
    #gate .err { color: #ff8d7a; font-size: 13px; height: 18px; margin-top: 10px; }`;

  document.documentElement.style.overflow = 'hidden';
  const el = document.createElement('div');
  el.id = 'gate';
  el.innerHTML = `<style>${css}</style>
    <div class="card">
      <h1>HOEF!<i>163</i></h1>
      <p>Deze pagina is besloten.<br/>Voer de toegangscode in die je hebt gekregen.</p>
      <input type="password" id="gateCode" placeholder="••••••••" autocomplete="off" autofocus />
      <button id="gateBtn">Binnenkijken →</button>
      <div class="err" id="gateErr"></div>
    </div>`;

  async function tryCode() {
    const v = (document.getElementById('gateCode').value || '').trim().toUpperCase();
    if (await sha256(v) === GATE_HASH) {
      localStorage.setItem(GATE_KEY, GATE_HASH);
      el.remove();
      document.documentElement.style.overflow = '';
    } else {
      document.getElementById('gateErr').textContent = 'Onjuiste code — probeer opnieuw.';
    }
  }
  function mount() {
    document.body.appendChild(el);
    document.getElementById('gateBtn').onclick = tryCode;
    document.getElementById('gateCode').addEventListener('keydown', e => { if (e.key === 'Enter') tryCode(); });
  }
  if (document.body) mount(); else addEventListener('DOMContentLoaded', mount);
})();
