// GuardianPost-Op PWA — vanilla JS single-page app.
// Hash-based routing. Session token stored in localStorage.

(() => {
  const $view  = document.getElementById('view');
  const $nav   = document.getElementById('topbar-nav');
  const $sub   = document.getElementById('brand-sub');
  const $foot  = document.getElementById('footer-status');
  const $toasts = document.getElementById('toast-host');

  const TOKEN_KEY = 'guardian.token';
  const ROLE_KEY  = 'guardian.role';

  const state = {
    token: localStorage.getItem(TOKEN_KEY) || null,
    role:  localStorage.getItem(ROLE_KEY)  || null,
    me:    null,         // current patient or doctor row
    config: null,        // { demo_time_scale, ... }
    livePollHandle: null,
    inboxPollHandle: null,
  };

  // ------------------------------------------------------------- helpers

  function setSession(token, role) {
    state.token = token; state.role = role;
    if (token) localStorage.setItem(TOKEN_KEY, token); else localStorage.removeItem(TOKEN_KEY);
    if (role)  localStorage.setItem(ROLE_KEY, role);   else localStorage.removeItem(ROLE_KEY);
  }
  function clearSession() { setSession(null, null); state.me = null; }

  async function api(path, { method='GET', body=null, auth=true } = {}) {
    const headers = { 'Content-Type': 'application/json' };
    if (auth && state.token) headers['Authorization'] = `Bearer ${state.token}`;
    const resp = await fetch(path, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
    });
    let data = null;
    try { data = await resp.json(); } catch (_) { data = {}; }
    if (!resp.ok) {
      const msg = data && data.error ? data.error : `HTTP ${resp.status}`;
      const err = new Error(msg);
      err.status = resp.status; err.detail = data && data.detail;
      throw err;
    }
    return data;
  }

  function toast(msg, kind='info') {
    const el = document.createElement('div');
    el.className = `toast ${kind === 'ok' ? 'ok' : (kind === 'error' ? 'error' : '')}`;
    el.textContent = msg;
    $toasts.appendChild(el);
    setTimeout(() => el.remove(), 3800);
  }

  function clearTimers() {
    if (state.livePollHandle)  { clearInterval(state.livePollHandle);  state.livePollHandle = null; }
    if (state.inboxPollHandle) { clearInterval(state.inboxPollHandle); state.inboxPollHandle = null; }
  }

  function html(strings, ...values) {
    // tiny tagged-template helper that returns a DOM fragment
    const wrap = document.createElement('div');
    wrap.innerHTML = strings.reduce((acc, s, i) => acc + s + (values[i] !== undefined ? escapeHtml(String(values[i])) : ''), '');
    return wrap;
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[c]));
  }

  function fmt(n, digits=1) { return Number(n).toFixed(digits); }
  function fmtTimestamp(unixSec) {
    if (!unixSec) return '';
    const d = new Date(unixSec * 1000);
    return d.toLocaleString();
  }
  function statusPillClass(s) {
    return s === 'CRITICAL' ? 'crit' : (s === 'WARNING' ? 'warn' : 'ok');
  }

  // ------------------------------------------------------------- routing

  const routes = {
    '/':                renderLanding,
    '/patient/login':   renderPatientLogin,
    '/patient/signup':  renderPatientSignup,
    '/patient':         renderPatientDashboard,
    '/doctor/login':    renderDoctorLogin,
    '/doctor/signup':   renderDoctorSignup,
    '/doctor/verify':   renderDoctorVerify,
    '/doctor':          renderDoctorDashboard,
    '/verify/mock':     renderMockHostedVerify,
  };

  function parseHash() {
    const raw = (location.hash || '#/').slice(1);
    const [path, query=''] = raw.split('?');
    const params = new URLSearchParams(query);
    return { path, params };
  }

  async function navigate(path, params) {
    if (params) {
      const q = new URLSearchParams(params).toString();
      location.hash = `#${path}${q ? '?' + q : ''}`;
    } else {
      location.hash = `#${path}`;
    }
  }

  async function router() {
    clearTimers();
    const { path, params } = parseHash();
    const view = routes[path] || renderNotFound;
    $view.innerHTML = '';
    renderTopbar();
    try {
      await view(params);
    } catch (e) {
      console.error(e);
      toast(`Failed to load: ${e.message}`, 'error');
    }
  }

  function renderTopbar() {
    $nav.innerHTML = '';
    if (!state.token) {
      $sub.textContent = 'Continuous post-op monitoring';
      const a = document.createElement('a'); a.href = '#/'; a.textContent = 'Home';
      a.className = 'btn ghost'; $nav.appendChild(a);
      return;
    }
    if (state.role === 'patient') {
      $sub.textContent = state.me ? `Patient — ${state.me.full_name || state.me.phone}` : 'Patient';
      addNav('My data', '#/patient');
    } else if (state.role === 'doctor') {
      $sub.textContent = state.me
        ? `Doctor — ${state.me.full_name || state.me.email}${state.me.verified ? '' : '  (unverified)'}`
        : 'Doctor';
      addNav('Patients', '#/doctor');
      if (!state.me?.verified) addNav('Verify ID', '#/doctor/verify');
    }
    const out = document.createElement('button');
    out.className = 'ghost'; out.textContent = 'Sign out';
    out.onclick = () => doLogout();
    $nav.appendChild(out);
  }
  function addNav(label, href) {
    const a = document.createElement('a');
    a.href = href; a.textContent = label; a.className = 'btn ghost';
    $nav.appendChild(a);
  }

  async function doLogout() {
    try { await api('/api/auth/logout', { method: 'POST' }); } catch (_) {}
    clearSession();
    navigate('/');
  }

  // ------------------------------------------------------------- VIEW: landing

  function renderLanding() {
    const frag = html`
      <div class="card">
        <h2 class="card-title">Welcome</h2>
        <p class="card-sub">
          GuardianPost-Op pairs a forearm-worn wearable with this gateway app to
          monitor patients recovering from high-risk surgeries. Sign in below as
          a patient (you wear the device) or as a clinician (you receive the
          summaries).
        </p>
      </div>
      <div class="landing">
        <div class="card">
          <h2 class="card-title">I'm a patient</h2>
          <p class="card-sub">
            Sign in with your phone number and the device number printed on
            the underside of your wearable.
          </p>
          <div class="btn-row">
            <a class="btn" href="#/patient/login">Sign in</a>
            <a class="btn secondary" href="#/patient/signup">Pair a new device</a>
          </div>
        </div>
        <div class="card">
          <h2 class="card-title">I'm a clinician</h2>
          <p class="card-sub">
            Sign in with your email and password. New accounts complete a
            third-party ID verification before they can receive patient data.
          </p>
          <div class="btn-row">
            <a class="btn" href="#/doctor/login">Sign in</a>
            <a class="btn secondary" href="#/doctor/signup">Create clinician account</a>
          </div>
        </div>
      </div>
      <div class="card">
        <h2 class="card-title">Demo shortcut</h2>
        <p class="card-sub">
          Reset the database and seed one verified clinician + one paired
          patient (with summary permission already granted), then jump
          straight into either side without typing credentials.
        </p>
        <div class="btn-row">
          <button id="seed-btn" class="secondary">Reset & seed demo data</button>
        </div>
        <div id="seed-result" style="margin-top:14px;"></div>
      </div>
    `;
    $view.appendChild(frag);
    document.getElementById('seed-btn').onclick = async () => {
      const out = document.getElementById('seed-result');
      out.innerHTML = '<span class="muted">Seeding…</span>';
      try {
        const r = await api('/api/admin/seed', { method: 'POST', auth: false });
        toast('Demo data seeded.', 'ok');
        out.innerHTML = `
          <div class="banner info">
            Demo data is ready. Pick a side to log in as — credentials are
            pre-filled.
          </div>
          <div class="row" style="gap:10px;">
            <div class="card" style="flex:1;min-width:240px;margin:0;">
              <div style="font-weight:600;margin-bottom:4px;">Demo patient</div>
              <div class="muted" style="font-size:12.5px;">
                <span class="kbd">${escapeHtml(r.patient.phone)}</span> /
                <span class="kbd">${escapeHtml(r.patient.device_number)}</span>
              </div>
              <div class="btn-row" style="margin-top:10px;">
                <button id="seed-patient-go">Sign in as patient</button>
              </div>
            </div>
            <div class="card" style="flex:1;min-width:240px;margin:0;">
              <div style="font-weight:600;margin-bottom:4px;">Demo doctor</div>
              <div class="muted" style="font-size:12.5px;">
                <span class="kbd">${escapeHtml(r.doctor.email)}</span> /
                <span class="kbd">${escapeHtml(r.doctor.password)}</span>
              </div>
              <div class="btn-row" style="margin-top:10px;">
                <button id="seed-doctor-go">Sign in as doctor</button>
              </div>
            </div>
          </div>
          <p class="muted" style="font-size:12.5px;margin-top:10px;">
            Tip: open one role here and the other in an incognito window so you
            can drive both sides at once during the demo.
          </p>
        `;
        document.getElementById('seed-patient-go').onclick = async () => {
          await loginAndGo('/api/auth/patient/login',
            { phone: r.patient.phone, device_number: r.patient.device_number },
            'patient', '/patient');
        };
        document.getElementById('seed-doctor-go').onclick = async () => {
          await loginAndGo('/api/auth/doctor/login',
            { email: r.doctor.email, password: r.doctor.password },
            'doctor', '/doctor');
        };
      } catch (e) {
        toast(e.message, 'error');
        out.innerHTML = '';
      }
    };
  }

  async function loginAndGo(endpoint, body, role, route) {
    try {
      const r = await api(endpoint, { method: 'POST', auth: false, body });
      setSession(r.token, role);
      toast(`Signed in as ${role}.`, 'ok');
      navigate(route);
    } catch (e) {
      toast(e.message, 'error');
    }
  }

  // ------------------------------------------------------------- VIEW: patient login + signup

  function renderPatientLogin() {
    const frag = html`
      <div class="card" style="max-width:520px;margin:0 auto;">
        <h2 class="card-title">Patient sign in</h2>
        <p class="card-sub">Phone number and the device number printed on your wearable.</p>
        <form id="f">
          <label>Phone number<input name="phone" type="tel" placeholder="+1-555-0200" required /></label>
          <label>Device number<span class="helper">printed on the underside of your wearable</span>
            <input name="device_number" type="text" placeholder="GPO-2026-0001" required />
          </label>
          <div class="btn-row">
            <button type="submit">Sign in</button>
            <a class="btn ghost" href="#/patient/signup">Pair a new device instead</a>
          </div>
        </form>
      </div>`;
    $view.appendChild(frag);
    document.getElementById('f').onsubmit = async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(e.target));
      try {
        const r = await api('/api/auth/patient/login', { method: 'POST', auth: false, body: data });
        setSession(r.token, 'patient');
        toast('Signed in.', 'ok');
        navigate('/patient');
      } catch (err) { toast(err.message, 'error'); }
    };
  }

  async function renderPatientSignup() {
    const frag = html`
      <div class="card" style="max-width:620px;margin:0 auto;">
        <h2 class="card-title">Pair a new device</h2>
        <p class="card-sub">
          One-time setup. Your phone number identifies you; the device number
          printed on your wearable is your secret factor.
        </p>
        <div id="demo-devices-host"></div>
        <form id="f">
          <label>Full name<input name="full_name" type="text" /></label>
          <label>Phone number<input name="phone" type="tel" required placeholder="+1-555-0201" /></label>
          <label>Device number
            <span class="helper">printed on the underside of your wearable</span>
            <input name="device_number" type="text" required placeholder="GPO-2026-…" />
          </label>
          <label>Clinician's prescription
            <span class="helper">paste the plain-text discharge instructions (the AI parses this into your safe ranges)</span>
            <textarea name="prescription"></textarea>
          </label>
          <div class="btn-row">
            <button type="submit">Pair device & sign in</button>
            <a class="btn ghost" href="#/patient/login">Already paired? Sign in</a>
          </div>
        </form>
      </div>`;
    $view.appendChild(frag);

    // Pull the demo device pool and render clickable chips that auto-fill the
    // device-number input. Helpful when the demo presenter doesn't want to
    // memorize / read off serial numbers.
    try {
      const pool = await api('/api/admin/demo-devices', { auth: false });
      const host = document.getElementById('demo-devices-host');
      const $input = document.querySelector('input[name="device_number"]');
      if (pool.available.length || pool.used.length) {
        host.innerHTML = `
          <div class="banner info" style="margin-bottom:14px;">
            <div style="font-weight:600;margin-bottom:4px;">Demo device pool</div>
            <div style="font-size:12.5px;margin-bottom:8px;">
              Click a serial below to fill the device number field. Greyed-out
              entries are already paired with another patient.
            </div>
            <div class="chips" id="device-chips"></div>
          </div>`;
        const $chips = document.getElementById('device-chips');
        for (const d of pool.all) {
          const used = pool.used.includes(d);
          const chip = document.createElement(used ? 'span' : 'button');
          chip.className = 'chip' + (used ? ' chip-used' : '');
          chip.type = 'button';
          chip.textContent = d;
          if (used) chip.title = 'already paired';
          else chip.onclick = () => { $input.value = d; $input.focus(); };
          $chips.appendChild(chip);
        }
      }
    } catch (_) { /* if demo-devices file missing, just skip */ }

    document.getElementById('f').onsubmit = async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(e.target));
      try {
        const r = await api('/api/auth/patient/signup', { method: 'POST', auth: false, body: data });
        setSession(r.token, 'patient');
        toast('Device paired.', 'ok');
        navigate('/patient');
      } catch (err) { toast(err.message, 'error'); }
    };
  }

  // ------------------------------------------------------------- VIEW: patient dashboard

  async function renderPatientDashboard() {
    if (!state.token || state.role !== 'patient') { return navigate('/patient/login'); }
    try {
      state.me = await api('/api/patient/me');
    } catch (e) {
      if (e.status === 401) { clearSession(); return navigate('/patient/login'); }
      throw e;
    }
    renderTopbar();

    const config = state.config || (state.config = await api('/api/admin/config', { auth: false }));

    const shell = html`
      <div class="row">
        <div class="card" style="flex:2;min-width:320px;">
          <h2 class="card-title">Live vitals
            <span class="pill brand" id="sim-pill">sim hr —</span>
          </h2>
          <p class="card-sub">
            The wearable streams vitals every 2 simulated minutes. The buffer
            below shows the last 30 simulated minutes — exactly the window the
            on-device firmware would push over BLE.
          </p>
          <div class="vitals-grid" id="vitals"></div>
          <hr class="sep" />
          <div class="muted" id="vitals-sub" style="font-size:12.5px;"></div>
        </div>
        <div class="card" style="flex:1;min-width:280px;">
          <h2 class="card-title">Send summary now</h2>
          <p class="card-sub">
            Generate a 12-hour summary and send it to every clinician you've
            authorized. Requires that at least one of your clinicians has
            enabled summary permission for you.
          </p>
          <div class="btn-row">
            <button id="send-btn">Send to my clinicians</button>
          </div>
          <hr class="sep" />
          <div class="muted" style="font-size:12.5px;">
            Auto-summary fires every ${config.auto_summary_period_hours.toFixed(0)} simulated hours
            (current scale: 1 wall second = ${(config.demo_time_scale/60).toFixed(1)} simulated minutes).
          </div>
        </div>
      </div>

      <div class="card">
        <h2 class="card-title">My clinicians</h2>
        <p class="card-sub">
          Clinicians who've added you to their patient list. Permission is set
          on their side — they can change it anytime.
        </p>
        <div id="doctors-host"></div>
      </div>

      <div class="card">
        <h2 class="card-title">My recent summaries</h2>
        <p class="card-sub">Each summary is a 12-hour rollup of your vitals.</p>
        <div id="summaries-host"></div>
      </div>
    `;
    $view.appendChild(shell);
    document.getElementById('send-btn').onclick = onManualSend;

    await refreshLive();
    await refreshDoctors();
    await refreshSummaries();

    state.livePollHandle = setInterval(refreshLive, 2000);
  }

  async function refreshLive() {
    try {
      const r = await api('/api/patient/vitals/live?window_minutes=30');
      const $host = document.getElementById('vitals');
      const $sub  = document.getElementById('vitals-sub');
      const $pill = document.getElementById('sim-pill');
      if (!$host) return;
      const samples = r.samples || [];
      const last = samples[samples.length - 1] || null;
      $pill.textContent = `sim hr ${(r.sim_hour_now || 0).toFixed(2)}`;
      if (!last) {
        $host.innerHTML = '<div class="empty">Waiting for first sample…</div>';
        return;
      }
      $host.innerHTML = '';
      const tiles = [
        ['Heart rate',       last.heart_rate,       'bpm', 1],
        ['HRV',              last.hrv,              'ms',  1],
        ['Respiratory rate', last.respiratory_rate, 'bpm', 1],
        ['SpO2',             last.spo2,             '%',   1],
        ['Body temp',        last.body_temp,        '°C',  2],
      ];
      for (const [label, value, unit, digits] of tiles) {
        const tile = document.createElement('div');
        tile.className = 'vital';
        tile.innerHTML = `<div class="vital-label">${escapeHtml(label)}</div>
          <div class="vital-value">${fmt(value, digits)}<span class="vital-unit">${escapeHtml(unit)}</span></div>`;
        $host.appendChild(tile);
      }
      $sub.textContent = `${samples.length} samples in window — most recent at sim hour ${last.hour.toFixed(2)}`;
    } catch (e) { /* swallow polling errors */ }
  }

  async function refreshDoctors() {
    const r = await api('/api/patient/doctors');
    const host = document.getElementById('doctors-host');
    host.innerHTML = '';
    if (!r.doctors.length) {
      host.innerHTML = '<div class="empty">No clinicians have added you yet.</div>';
      return;
    }
    const tbl = document.createElement('table');
    tbl.innerHTML = '<thead><tr><th>Clinician</th><th>Email</th><th>Receives summaries</th><th>Decided</th></tr></thead>';
    const tb = document.createElement('tbody');
    for (const d of r.doctors) {
      const tr = document.createElement('tr');
      const pill = d.permission_granted
        ? '<span class="pill ok">enabled</span>'
        : '<span class="pill muted">off</span>';
      tr.innerHTML = `<td>${escapeHtml(d.full_name || '—')} ${d.verified ? '' : '<span class="pill muted">unverified</span>'}</td>
                      <td class="muted">${escapeHtml(d.email)}</td>
                      <td>${pill}</td>
                      <td class="muted">${escapeHtml(fmtTimestamp(d.permission_changed_at))}</td>`;
      tb.appendChild(tr);
    }
    tbl.appendChild(tb);
    host.appendChild(tbl);
  }

  async function refreshSummaries() {
    const r = await api('/api/patient/summaries');
    const host = document.getElementById('summaries-host');
    host.innerHTML = '';
    if (!r.summaries.length) {
      host.innerHTML = '<div class="empty">No summaries generated yet.</div>';
      return;
    }
    const tbl = document.createElement('table');
    tbl.innerHTML = '<thead><tr><th>Generated</th><th>Sim window</th><th>Status</th><th>Crit / Warn cycles</th><th>HR avg</th><th>SpO2 avg</th></tr></thead>';
    const tb = document.createElement('tbody');
    for (const s of r.summaries) {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td class="muted">${escapeHtml(fmtTimestamp(s.generated_at))}</td>
                      <td>${fmt(s.sim_hour_start, 1)} – ${fmt(s.sim_hour_end, 1)}</td>
                      <td><span class="pill ${statusPillClass(s.status_overall)}">${escapeHtml(s.status_overall)}</span></td>
                      <td>${s.alert_count_critical} / ${s.alert_count_warn}</td>
                      <td>${fmt(s.hr_avg, 1)} bpm</td>
                      <td>${fmt(s.spo2_avg, 1)} %</td>`;
      tb.appendChild(tr);
    }
    tbl.appendChild(tb);
    host.appendChild(tbl);
  }

  async function onManualSend() {
    const btn = document.getElementById('send-btn');
    btn.disabled = true; const original = btn.textContent; btn.textContent = 'Sending…';
    try {
      const r = await api('/api/patient/summaries/send', { method: 'POST' });
      toast(`Sent to ${r.delivered_to_doctor_ids.length} clinician(s).`, 'ok');
      await refreshSummaries();
    } catch (e) {
      if (e.status === 403) {
        toast(e.detail || e.message, 'error');
      } else {
        toast(e.message, 'error');
      }
    } finally {
      btn.disabled = false; btn.textContent = original;
    }
  }

  // ------------------------------------------------------------- VIEW: doctor login + signup

  function renderDoctorLogin() {
    const frag = html`
      <div class="card" style="max-width:520px;margin:0 auto;">
        <h2 class="card-title">Clinician sign in</h2>
        <form id="f">
          <label>Email<input name="email" type="email" required /></label>
          <label>Password<input name="password" type="password" required /></label>
          <div class="btn-row">
            <button type="submit">Sign in</button>
            <a class="btn ghost" href="#/doctor/signup">Create account</a>
          </div>
        </form>
      </div>`;
    $view.appendChild(frag);
    document.getElementById('f').onsubmit = async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(e.target));
      try {
        const r = await api('/api/auth/doctor/login', { method: 'POST', auth: false, body: data });
        setSession(r.token, 'doctor');
        toast('Signed in.', 'ok');
        navigate(r.verified ? '/doctor' : '/doctor/verify');
      } catch (err) { toast(err.message, 'error'); }
    };
  }

  function renderDoctorSignup() {
    const frag = html`
      <div class="card" style="max-width:560px;margin:0 auto;">
        <h2 class="card-title">Create clinician account</h2>
        <p class="card-sub">
          After creating your account you'll complete a third-party ID
          verification step before you can add patients or receive summaries.
        </p>
        <form id="f">
          <label>Full name<input name="full_name" type="text" required /></label>
          <label>Email<input name="email" type="email" required /></label>
          <label>Phone (optional)<input name="phone" type="tel" /></label>
          <label>Password<span class="helper">8+ characters</span>
            <input name="password" type="password" required minlength="8" /></label>
          <div class="btn-row">
            <button type="submit">Create account</button>
            <a class="btn ghost" href="#/doctor/login">I already have one</a>
          </div>
        </form>
      </div>`;
    $view.appendChild(frag);
    document.getElementById('f').onsubmit = async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(e.target));
      try {
        const r = await api('/api/auth/doctor/signup', { method: 'POST', auth: false, body: data });
        setSession(r.token, 'doctor');
        toast('Account created. Please verify your ID.', 'ok');
        navigate('/doctor/verify');
      } catch (err) { toast(err.message, 'error'); }
    };
  }

  async function renderDoctorVerify() {
    if (!state.token || state.role !== 'doctor') { return navigate('/doctor/login'); }
    state.me = await api('/api/doctor/me');
    if (state.me.verified) {
      const frag = html`
        <div class="card" style="max-width:520px;margin:0 auto;">
          <h2 class="card-title">Verified</h2>
          <p class="card-sub">Your clinician account is verified.</p>
          <div class="btn-row"><a class="btn" href="#/doctor">Go to dashboard</a></div>
        </div>`;
      $view.appendChild(frag);
      return;
    }
    const frag = html`
      <div class="card" style="max-width:560px;margin:0 auto;">
        <h2 class="card-title">Verify your clinical credentials</h2>
        <p class="card-sub">
          GuardianPost-Op uses a third-party identity-verification provider to
          confirm new clinician accounts. You'll be sent to the provider's
          hosted page to upload a government-issued ID.
        </p>
        <div id="step-host"></div>
      </div>`;
    $view.appendChild(frag);
    const host = document.getElementById('step-host');

    host.innerHTML = `<div class="banner info">
      <strong>Demo provider:</strong> the hosted page in this demo is a mock
      stand-in. In production this is replaced by Persona / Stripe Identity /
      Onfido / Veriff with no other code changes.
    </div>
    <button id="start-btn">Start verification</button>`;

    document.getElementById('start-btn').onclick = async () => {
      try {
        const r = await api('/api/doctor/verify/start', { method: 'POST' });
        host.innerHTML = `
          <div class="banner info">Provider session: <span class="kbd">${escapeHtml(r.provider_session_id)}</span></div>
          <p class="muted">Open the hosted page in a new tab, complete the (mock) ID upload, then come back and click "Check verification".</p>
          <div class="btn-row">
            <a class="btn secondary" href="${r.hosted_url}" target="_blank" rel="noopener">Open hosted ID page</a>
            <button id="poll-btn">Check verification</button>
          </div>
        `;
        document.getElementById('poll-btn').onclick = async () => {
          try {
            const p = await api('/api/doctor/verify/poll', { method: 'POST' });
            if (p.verified) {
              toast('Verification approved.', 'ok');
              navigate('/doctor');
            } else if (p.status === 'rejected') {
              toast(`Rejected: ${p.reason || 'unspecified'}`, 'error');
            } else {
              toast('Still pending — complete the hosted page first.', 'info');
            }
          } catch (e) { toast(e.message, 'error'); }
        };
      } catch (e) { toast(e.message, 'error'); }
    };
  }

  // ------------------------------------------------------------- VIEW: doctor dashboard

  async function renderDoctorDashboard() {
    if (!state.token || state.role !== 'doctor') { return navigate('/doctor/login'); }
    try {
      state.me = await api('/api/doctor/me');
    } catch (e) {
      if (e.status === 401) { clearSession(); return navigate('/doctor/login'); }
      throw e;
    }
    renderTopbar();

    const config = state.config || (state.config = await api('/api/admin/config', { auth: false }));

    const banner = state.me.verified
      ? ''
      : `<div class="banner warn">Your account isn't verified yet — you can't add patients or receive summaries until you complete <a href="#/doctor/verify">ID verification</a>.</div>`;

    const frag = html`
      ${banner}
      <div class="row">
        <div class="card" style="flex:2;min-width:320px;">
          <h2 class="card-title">My patients</h2>
          <p class="card-sub">
            Toggle "summaries" to control whether GuardianPost-Op delivers each
            patient's 12-hour summaries (auto and manual) to your inbox.
          </p>
          <div id="patients-host"></div>
          <hr class="sep" />
          <form id="add-form" style="flex-direction:row;align-items:end;flex-wrap:wrap;">
            <label style="flex:1;min-width:220px;">Add a patient by phone
              <span class="helper">the patient must have paired their device first</span>
              <input name="phone" type="tel" required ${state.me.verified ? '' : 'disabled'} />
            </label>
            <button type="submit" ${state.me.verified ? '' : 'disabled'}>Add patient</button>
          </form>
        </div>

        <div class="card" style="flex:1;min-width:280px;">
          <h2 class="card-title">Demo controls</h2>
          <p class="card-sub">
            Skip ahead in simulated time without waiting the full
            ${config.auto_summary_period_hours.toFixed(0)}h auto-summary cadence.
          </p>
          <div class="btn-row">
            <button id="tick-btn" class="secondary">Run scheduler tick</button>
          </div>
          <div class="muted" style="font-size:12.5px;margin-top:8px;">
            time scale x${config.demo_time_scale.toFixed(0)}
          </div>
        </div>
      </div>

      <div class="card">
        <h2 class="card-title">Inbox</h2>
        <p class="card-sub">Summaries delivered to you (auto every 12h, or manual from the patient).</p>
        <div id="inbox-host"></div>
      </div>
    `;
    $view.appendChild(frag);

    document.getElementById('add-form').onsubmit = async (e) => {
      e.preventDefault();
      const phone = e.target.phone.value.trim();
      try {
        const r = await api('/api/doctor/patients/add', { method: 'POST', body: { phone } });
        toast(`Added ${r.full_name || r.patient_id}. Decide on summary permission below.`, 'ok');
        e.target.reset();
        await refreshPatients();
      } catch (err) { toast(err.message, 'error'); }
    };

    document.getElementById('tick-btn').onclick = async () => {
      try {
        const r = await api('/api/admin/tick', { method: 'POST', auth: false });
        if (r.summarized_patient_ids.length) {
          toast(`Auto-summary generated for ${r.summarized_patient_ids.length} patient(s).`, 'ok');
        } else {
          toast('Tick ran — no patients due for auto-summary yet.', 'info');
        }
        await refreshInbox();
      } catch (e) { toast(e.message, 'error'); }
    };

    await refreshPatients();
    await refreshInbox();
    state.inboxPollHandle = setInterval(refreshInbox, 4000);
  }

  async function refreshPatients() {
    const r = await api('/api/doctor/patients');
    const host = document.getElementById('patients-host');
    host.innerHTML = '';
    if (!r.patients.length) {
      host.innerHTML = '<div class="empty">No patients yet. Add one below.</div>';
      return;
    }
    const tbl = document.createElement('table');
    tbl.innerHTML = `<thead><tr>
      <th>Patient</th><th>Phone</th><th>Summaries permission</th>
      <th>Decided</th><th>Force summary</th><th></th>
    </tr></thead>`;
    const tb = document.createElement('tbody');
    for (const p of r.patients) {
      const tr = document.createElement('tr');
      const granted = !!p.permission_granted;
      tr.innerHTML = `<td>${escapeHtml(p.full_name || '—')}</td>
                      <td class="muted">${escapeHtml(p.phone)}</td>
                      <td><label style="flex-direction:row;align-items:center;gap:6px;">
                        <input type="checkbox" data-pid="${p.id}" ${granted ? 'checked' : ''} />
                        <span class="pill ${granted ? 'ok' : 'muted'}">${granted ? 'receiving' : 'off'}</span>
                      </label></td>
                      <td class="muted">${escapeHtml(fmtTimestamp(p.permission_changed_at))}</td>
                      <td><button class="secondary" data-force="${p.id}">Force now</button></td>
                      <td><button class="ghost" data-remove="${p.id}">Remove</button></td>`;
      tb.appendChild(tr);
    }
    tbl.appendChild(tb);
    host.appendChild(tbl);

    host.querySelectorAll('input[type="checkbox"][data-pid]').forEach(box => {
      box.onchange = async () => {
        const pid = box.getAttribute('data-pid');
        try {
          await api(`/api/doctor/patients/${pid}/permission`, { method: 'POST', body: { granted: box.checked } });
          await refreshPatients();
          toast('Permission updated.', 'ok');
        } catch (e) { toast(e.message, 'error'); box.checked = !box.checked; }
      };
    });
    host.querySelectorAll('button[data-force]').forEach(btn => {
      btn.onclick = async () => {
        const pid = btn.getAttribute('data-force');
        try {
          await api(`/api/admin/force-summary/${pid}`, { method: 'POST', auth: false });
          toast('Summary generated.', 'ok');
          await refreshInbox();
        } catch (e) { toast(e.message, 'error'); }
      };
    });
    host.querySelectorAll('button[data-remove]').forEach(btn => {
      btn.onclick = async () => {
        const pid = btn.getAttribute('data-remove');
        if (!confirm('Remove this patient from your list? This also disables further summaries.')) return;
        try {
          await api(`/api/doctor/patients/${pid}`, { method: 'DELETE' });
          await refreshPatients();
          toast('Removed.', 'ok');
        } catch (e) { toast(e.message, 'error'); }
      };
    });
  }

  async function refreshInbox() {
    const host = document.getElementById('inbox-host');
    if (!host) return;
    let r;
    try { r = await api('/api/doctor/inbox'); }
    catch (_) { return; }
    host.innerHTML = '';
    if (!r.items.length) {
      host.innerHTML = '<div class="empty">No summaries yet. Auto delivery fires every 12 sim-hours.</div>';
      return;
    }
    for (const item of r.items) {
      const card = document.createElement('div');
      card.className = 'card';
      card.style.marginBottom = '10px';
      card.style.padding = '14px 16px';
      card.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap;">
          <div>
            <div style="font-weight:600;">${escapeHtml(item.patient_name || item.patient_phone)}
              <span class="pill ${statusPillClass(item.status_overall)}" style="margin-left:8px;">${escapeHtml(item.status_overall)}</span>
              <span class="pill ${item.trigger === 'manual' ? 'brand' : 'muted'}" style="margin-left:4px;">${escapeHtml(item.trigger)}</span>
            </div>
            <div class="muted" style="font-size:12.5px;margin-top:2px;">
              sim hours ${fmt(item.sim_hour_start,1)}–${fmt(item.sim_hour_end,1)}
              &nbsp;·&nbsp; received ${escapeHtml(fmtTimestamp(item.sent_at))}
            </div>
          </div>
          <div class="muted" style="font-size:12.5px;text-align:right;">
            crit ${item.alert_count_critical} · warn ${item.alert_count_warn}<br />
            HR ${fmt(item.hr_avg,1)} · HRV ${fmt(item.hrv_avg,1)} · RR ${fmt(item.rr_avg,1)} · SpO2 ${fmt(item.spo2_avg,1)} · ${fmt(item.temp_avg,2)}°C
          </div>
        </div>
        <pre class="narrative" style="margin-top:10px;">${escapeHtml(item.narrative)}</pre>
      `;
      host.appendChild(card);
    }
  }

  // ------------------------------------------------------------- VIEW: mock hosted ID page

  async function renderMockHostedVerify(params) {
    const sid = params.get('session');
    if (!sid) {
      $view.appendChild(html`<div class="card"><p>Missing session.</p></div>`);
      return;
    }
    let info = null;
    try {
      info = await api(`/api/verify/mock/${encodeURIComponent(sid)}/info`, { auth: false });
    } catch (e) {
      $view.appendChild(html`<div class="card"><p>Unknown verification session.</p></div>`);
      return;
    }
    const frag = html`
      <div class="card" style="max-width:560px;margin:0 auto;">
        <div class="banner info">
          <strong>Mock verification provider</strong> — this page stands in for
          Persona / Stripe Identity / Onfido. In production the doctor would
          upload a real ID + selfie here.
        </div>
        <h2 class="card-title">Verify your identity</h2>
        <p class="card-sub">For: <span class="kbd">${escapeHtml(info.user_name || info.user_email)}</span></p>
        <p>Pretend you've uploaded your government-issued ID and a selfie. Choose an outcome:</p>
        <div class="btn-row">
          <button id="ok-btn">Approve verification</button>
          <button id="rej-btn" class="danger">Reject</button>
        </div>
        <div id="status" class="muted" style="margin-top:12px;font-size:13px;">
          ${info.decided ? `Already decided: ${info.verified ? 'approved' : 'rejected'}` : 'Awaiting decision'}
        </div>
      </div>`;
    $view.appendChild(frag);
    document.getElementById('ok-btn').onclick = async () => {
      try {
        await api(`/api/verify/mock/${encodeURIComponent(sid)}/decision`, { method: 'POST', auth: false, body: { accept: true } });
        document.getElementById('status').textContent = 'Approved. Return to the clinician dashboard tab and click "Check verification".';
        toast('Approved.', 'ok');
      } catch (e) { toast(e.message, 'error'); }
    };
    document.getElementById('rej-btn').onclick = async () => {
      const reason = prompt('Rejection reason?', 'document unreadable') || '';
      try {
        await api(`/api/verify/mock/${encodeURIComponent(sid)}/decision`, { method: 'POST', auth: false, body: { accept: false, reason } });
        document.getElementById('status').textContent = `Rejected: ${reason}`;
        toast('Rejected.', 'ok');
      } catch (e) { toast(e.message, 'error'); }
    };
  }

  // ------------------------------------------------------------- 404

  function renderNotFound() {
    $view.appendChild(html`
      <div class="card"><h2 class="card-title">Not found</h2>
      <p>That page doesn't exist. <a href="#/">Go home</a>.</p></div>`);
  }

  // ------------------------------------------------------------- boot

  window.addEventListener('hashchange', router);
  window.addEventListener('load', () => {
    if (!location.hash) location.hash = '#/';
    api('/api/admin/config', { auth: false }).then(c => {
      state.config = c;
      $foot.textContent = `time scale x${c.demo_time_scale.toFixed(0)} · summary every ${c.auto_summary_period_hours.toFixed(0)} sim-h`;
    }).catch(() => {});
    router();
  });
})();
