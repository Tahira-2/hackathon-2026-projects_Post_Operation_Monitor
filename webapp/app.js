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
    doctorPollHandle: null,
    selectedPatientId: null,  // doctor view: which patient's detail is open
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
    if (state.livePollHandle)   { clearInterval(state.livePollHandle);   state.livePollHandle = null; }
    if (state.doctorPollHandle) { clearInterval(state.doctorPollHandle); state.doctorPollHandle = null; }
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
    '/':                    renderLanding,
    '/patient/login':       renderPatientLogin,
    '/patient/signup':      renderPatientSignup,
    '/patient':             renderPatientDashboard,
    '/doctor/login':        renderDoctorLogin,
    '/doctor/signup':       renderDoctorSignup,
    '/doctor/verify':       renderDoctorVerify,
    '/doctor/verify/mock':  renderDoctorVerifyMock,
    '/doctor/verify/done':  renderDoctorVerifyDone,
    '/doctor':              renderDoctorDashboard,
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
      // No persistent nav links — the only doctor-facing screen is the
      // patient list, which is the landing target for /doctor; verification
      // shows an inline dashboard banner if needed.
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
          <strong>One-time setup</strong> — wipes any existing accounts and
          recreates the database with one verified clinician and one paired
          patient (summary permission already granted), so you can jump in
          without typing credentials.
        </p>
        <div class="btn-row">
          <button id="seed-btn" class="secondary">Wipe DB & re-seed demo data</button>
        </div>
        <div id="seed-result" style="margin-top:14px;"></div>
      </div>
    `;
    $view.appendChild(frag);
    document.getElementById('seed-btn').onclick = async () => {
      if (!confirm('This will DELETE every existing account (patients, doctors, summaries) and recreate just the demo doctor + demo patient. Continue?')) {
        return;
      }
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
      <div id="alerts-banner-host"></div>

      <div class="card">
        <h2 class="card-title">Doctor's note</h2>
        <p class="card-sub">
          What your clinician has said to expect during your recovery. The AI
          uses this note to decide what counts as out-of-range for you.
        </p>
        <div id="doctors-note-host"></div>
      </div>

      <div class="row">
        <div class="card" style="flex:2;min-width:320px;">
          <h2 class="card-title">Live vitals
            <span class="pill brand" id="sim-pill">sim hr —</span>
          </h2>
          <p class="card-sub">
            The wearable streams vitals every 3 simulated minutes. The buffer
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
        <p class="card-sub">Each summary is a 12-hour rollup of your vitals. Download as CSV (opens in Excel) for your records.</p>
        <div id="summaries-host"></div>
      </div>
    `;
    $view.appendChild(shell);
    document.getElementById('send-btn').onclick = onManualSend;

    await refreshLive();
    await refreshDoctorsNote();
    await refreshDoctors();
    await refreshSummaries();
    await refreshAlertsBanner();

    state.livePollHandle = setInterval(() => {
      refreshLive();
      refreshAlertsBanner();
    }, 2000);
  }

  async function refreshDoctorsNote() {
    const host = document.getElementById('doctors-note-host');
    if (!host) return;
    let r;
    try { r = await api('/api/patient/doctor-note'); } catch (_) { return; }
    if (!r.doctors_note) {
      host.innerHTML = '<div class="empty">Your clinician hasn’t saved a note yet.</div>';
      return;
    }
    const author = r.doctor_name
      ? `<span class="muted" style="font-size:12.5px;">From ${escapeHtml(r.doctor_name)}${r.set_at ? ` &middot; ${escapeHtml(fmtTimestamp(r.set_at))}` : ''}</span>`
      : '';
    host.innerHTML = `${author}<pre class="narrative" style="margin-top:6px;">${escapeHtml(r.doctors_note)}</pre>`;
  }

  async function refreshAlertsBanner() {
    const host = document.getElementById('alerts-banner-host');
    if (!host) return;
    let r;
    try { r = await api('/api/patient/alerts/active'); } catch (_) { return; }
    const alerts = r.alerts || [];
    if (!alerts.length) {
      host.innerHTML = '';
      return;
    }
    const critCount = alerts.filter(a => a.status === 'CRITICAL').length;
    const cls = critCount > 0 ? 'crit' : 'warn';
    const top = alerts[0];
    host.innerHTML = `
      <div class="banner ${cls}">
        <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap;">
          <div>
            <strong>${alerts.length} live alert${alerts.length === 1 ? '' : 's'} from your wearable</strong>
            ${critCount ? ` &middot; <strong>${critCount} CRITICAL</strong>` : ''}
            <div style="font-size:13px;margin-top:4px;">Most recent: <span class="kbd">${escapeHtml(top.message)}</span></div>
          </div>
          <button id="ack-banner-btn" class="ghost" style="border:1px solid currentColor;color:inherit;background:transparent;">Acknowledge</button>
        </div>
      </div>`;
    document.getElementById('ack-banner-btn').onclick = async () => {
      try {
        await api('/api/patient/alerts/ack', { method: 'POST' });
        host.innerHTML = '';
      } catch (e) { toast(e.message, 'error'); }
    };
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
    tbl.innerHTML = '<thead><tr><th>Generated</th><th>Sim window</th><th>Status</th><th>Crit / Warn cycles</th><th>HR avg</th><th>SpO2 avg</th><th></th></tr></thead>';
    const tb = document.createElement('tbody');
    for (const s of r.summaries) {
      const tr = document.createElement('tr');
      const url = `/api/patient/summaries/${s.id}/download.csv?token=${encodeURIComponent(state.token)}`;
      tr.innerHTML = `<td class="muted">${escapeHtml(fmtTimestamp(s.generated_at))}</td>
                      <td>${fmt(s.sim_hour_start, 1)} – ${fmt(s.sim_hour_end, 1)}</td>
                      <td><span class="pill ${statusPillClass(s.status_overall)}">${escapeHtml(s.status_overall)}</span></td>
                      <td>${s.alert_count_critical} / ${s.alert_count_warn}</td>
                      <td>${fmt(s.hr_avg, 1)} bpm</td>
                      <td>${fmt(s.spo2_avg, 1)} %</td>
                      <td><a class="btn ghost" style="font-size:12px;" href="${url}" download>CSV</a></td>`;
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
          <br /><span class="muted" style="font-size:12.5px;">Required: email and password (8+ characters).</span>
        </p>
        <form id="f">
          <label>Full name <span class="helper">(optional)</span>
            <input name="full_name" type="text" placeholder="e.g. Doctor Smith" />
          </label>
          <label>Email <span class="helper">required</span>
            <input name="email" type="email" required placeholder="you@hospital.org" />
          </label>
          <label>Phone <span class="helper">(optional)</span>
            <input name="phone" type="tel" />
          </label>
          <label>Password <span class="helper">required, 8+ characters</span>
            <input name="password" type="password" required minlength="8" />
          </label>
          <div class="btn-row">
            <button type="submit">Create account</button>
            <a class="btn ghost" href="#/doctor/login">I already have one</a>
          </div>
        </form>
      </div>`;
    $view.appendChild(frag);
    const form = document.getElementById('f');
    const submitBtn = form.querySelector('button[type="submit"]');
    form.onsubmit = async (e) => {
      e.preventDefault();
      submitBtn.disabled = true;
      const original = submitBtn.textContent;
      submitBtn.textContent = 'Creating account…';
      const data = Object.fromEntries(new FormData(form));
      try {
        const r = await api('/api/auth/doctor/signup', { method: 'POST', auth: false, body: data });
        setSession(r.token, 'doctor');
        toast('Account created. Please verify your ID.', 'ok');
        navigate('/doctor/verify');
      } catch (err) {
        toast(err.message, 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = original;
      }
    };
  }

  async function renderDoctorVerify() {
    if (!state.token || state.role !== 'doctor') { return navigate('/doctor/login'); }
    state.me = await api('/api/doctor/me');
    if (state.me.verified) {
      const frag = html`
        <div class="card" style="max-width:520px;margin:0 auto;">
          <h2 class="card-title">Already verified</h2>
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
          confirm new clinician accounts before they can add patients or
          receive summaries.
        </p>
        <div class="banner info">
          <strong>Demo provider:</strong> this build uses a mock stand-in.
          In production it's swapped for Persona / Stripe Identity / Onfido /
          Veriff with no other code changes.
        </div>
        <div class="btn-row">
          <button id="start-btn">Start verification</button>
        </div>
      </div>`;
    $view.appendChild(frag);

    document.getElementById('start-btn').onclick = async (ev) => {
      const btn = ev.currentTarget;
      btn.disabled = true; btn.textContent = 'Opening provider…';
      try {
        const r = await api('/api/doctor/verify/start', { method: 'POST' });
        navigate('/doctor/verify/mock', { sid: r.provider_session_id });
      } catch (e) {
        toast(e.message, 'error');
        btn.disabled = false; btn.textContent = 'Start verification';
      }
    };
  }

  async function renderDoctorVerifyMock(params) {
    if (!state.token || state.role !== 'doctor') { return navigate('/doctor/login'); }
    const sid = params.get('sid');
    if (!sid) { return navigate('/doctor/verify'); }

    const frag = html`
      <div class="card" style="max-width:560px;margin:0 auto;">
        <div class="banner info">
          <strong>Mock identity-verification provider</strong> — stand-in for
          Persona / Stripe Identity. In production the doctor would upload a
          government-issued ID and a selfie here.
        </div>
        <h2 class="card-title">Confirm your identity</h2>
        <p class="card-sub">
          Click the button below to confirm verification. A real provider would
          run document OCR + a liveness check at this step and post a webhook
          back to GuardianPost-Op with the result.
        </p>
        <div class="muted" style="font-size:12.5px;margin-bottom:12px;">
          Session: <span class="kbd">${escapeHtml(sid)}</span>
        </div>
        <div class="btn-row">
          <button id="verify-btn">Verify with mock identifier</button>
          <a class="btn ghost" href="#/doctor/verify">Cancel</a>
        </div>
      </div>`;
    $view.appendChild(frag);

    document.getElementById('verify-btn').onclick = async (ev) => {
      const btn = ev.currentTarget;
      btn.disabled = true; btn.textContent = 'Verifying…';
      try {
        // Mock provider records the "approve" decision.
        await api(`/api/verify/mock/${encodeURIComponent(sid)}/decision`, {
          method: 'POST', auth: false, body: { accept: true },
        });
        // App polls the provider, which marks the doctor verified.
        const p = await api('/api/doctor/verify/poll', { method: 'POST' });
        if (!p.verified) {
          throw new Error(p.reason || 'verification did not complete');
        }
        navigate('/doctor/verify/done');
      } catch (e) {
        toast(e.message, 'error');
        btn.disabled = false; btn.textContent = 'Verify with mock identifier';
      }
    };
  }

  async function renderDoctorVerifyDone() {
    // Blank "Verified" page that auto-navigates to the doctor sign-in form
    // after 3 seconds. The current session is cleared first so the form
    // loads fresh and the doctor can sign in as a verified clinician.
    const SECONDS = 3;
    const frag = html`
      <div class="card" style="max-width:480px;margin:80px auto;text-align:center;">
        <div style="font-size:42px;font-weight:700;color:var(--ok);margin-bottom:8px;">Verified</div>
        <p class="muted" id="redir-note">Taking you to the sign-in page in ${SECONDS}…</p>
      </div>`;
    $view.appendChild(frag);

    // Clear the session token now so the login screen we land on is empty.
    try { await api('/api/auth/logout', { method: 'POST' }); } catch (_) {}
    clearSession();
    renderTopbar();

    let remaining = SECONDS;
    const note = document.getElementById('redir-note');
    const tick = setInterval(() => {
      remaining -= 1;
      if (note) note.textContent = `Taking you to the sign-in page in ${Math.max(0, remaining)}…`;
      if (remaining <= 0) {
        clearInterval(tick);
        navigate('/doctor/login');
      }
    }, 1000);
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
      <div class="card">
        <h2 class="card-title">My patients</h2>
        <p class="card-sub">
          Click a patient's name to open their summaries. Toggle "summaries" to
          control whether GuardianPost-Op delivers their 12-hour summaries
          (auto and manual) to you.
        </p>
        <div id="patients-host"></div>
        <hr class="sep" />
        <form id="add-form">
          <label>Patient phone <span class="helper">required — they must have paired their device first</span>
            <input name="phone" type="tel" required ${state.me.verified ? '' : 'disabled'} placeholder="+1-555-0299" />
          </label>
          <label>Doctor's note <span class="helper">what to expect from this patient — the AI parses this into the safe-range envelope used for live monitoring and the 12-hour summaries</span>
            <textarea name="doctors_note" rows="6" ${state.me.verified ? '' : 'disabled'}
              placeholder="e.g. Post-CABG day 2, on metoprolol. Expect resting HR 60-78. Warn if HR sustained above 95, page critical above 110. SpO2 should stay above 94…"></textarea>
          </label>
          <div class="btn-row">
            <button type="submit" ${state.me.verified ? '' : 'disabled'}>Add patient</button>
            <span class="muted" style="font-size:12.5px;">You can edit the note any time after adding.</span>
          </div>
        </form>
      </div>

      <div id="patient-detail-host"></div>

      <div class="card">
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
    `;
    $view.appendChild(frag);

    document.getElementById('add-form').onsubmit = async (e) => {
      e.preventDefault();
      const phone = e.target.phone.value.trim();
      const doctors_note = e.target.doctors_note.value.trim();
      try {
        const r = await api('/api/doctor/patients/add', {
          method: 'POST', body: { phone, doctors_note },
        });
        const noteSuffix = r.doctors_note_saved
          ? ` Note saved (parsed via ${r.envelope_source || 'fallback'}).`
          : ' No note attached — set one from the patient detail panel.';
        toast(`Added ${r.full_name || r.patient_id}.${noteSuffix}`, 'ok');
        e.target.reset();
        await refreshDoctorView();
        // Auto-open the new patient so the doctor can see / edit the note + envelope.
        await selectPatient(r.patient_id);
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
        await refreshDoctorView();
      } catch (e) { toast(e.message, 'error'); }
    };

    await refreshDoctorView();
    state.doctorPollHandle = setInterval(refreshDoctorView, 4000);
  }

  async function refreshDoctorView() {
    // Single tick refreshes both the patients list and (if open) the
    // selected patient's detail panel.
    await refreshPatients();
    if (state.selectedPatientId != null) {
      await refreshSelectedPatient(state.selectedPatientId, { silent: true });
    }
  }

  async function refreshPatients() {
    const r = await api('/api/doctor/patients');
    const host = document.getElementById('patients-host');
    if (!host) return;
    host.innerHTML = '';
    if (!r.patients.length) {
      host.innerHTML = '<div class="empty">No patients yet. Add one below.</div>';
      return;
    }
    const tbl = document.createElement('table');
    tbl.innerHTML = `<thead><tr>
      <th>Patient</th><th>Phone</th><th>Last summary</th>
      <th>Summaries permission</th><th></th>
    </tr></thead>`;
    const tb = document.createElement('tbody');
    for (const p of r.patients) {
      const tr = document.createElement('tr');
      tr.dataset.pid = p.id;
      if (state.selectedPatientId === p.id) tr.classList.add('row-selected');

      const granted = !!p.permission_granted;
      const lastStatusPill = p.last_status
        ? `<span class="pill ${statusPillClass(p.last_status)}">${escapeHtml(p.last_status)}</span>`
        : '<span class="muted">—</span>';
      const unreadBadge = p.unread_count > 0
        ? `<span class="pill brand" style="margin-left:6px;">${p.unread_count} new</span>`
        : '';
      const alertBadge = p.open_alerts_count > 0
        ? `<span class="pill crit" style="margin-left:6px;">${p.open_alerts_count} live alerts</span>`
        : '';
      const lastTime = p.last_received_at
        ? `<div class="muted" style="font-size:11.5px;">${escapeHtml(fmtTimestamp(p.last_received_at))}</div>`
        : '';

      tr.innerHTML = `
        <td>
          <a href="#" class="patient-link" data-pid="${p.id}" style="color:var(--brand);font-weight:600;text-decoration:none;">
            ${escapeHtml(p.full_name || '—')}
          </a>${alertBadge}${unreadBadge}
        </td>
        <td class="muted">${escapeHtml(p.phone)}</td>
        <td>${lastStatusPill}${lastTime}</td>
        <td><label style="flex-direction:row;align-items:center;gap:6px;">
          <input type="checkbox" data-pid="${p.id}" ${granted ? 'checked' : ''} />
          <span class="pill ${granted ? 'ok' : 'muted'}">${granted ? 'receiving' : 'off'}</span>
        </label></td>
        <td>
          <button class="ghost" data-remove="${p.id}" title="Remove patient">Remove</button>
        </td>`;
      tb.appendChild(tr);
    }
    tbl.appendChild(tb);
    host.appendChild(tbl);

    host.querySelectorAll('a.patient-link').forEach(a => {
      a.onclick = (e) => {
        e.preventDefault();
        const pid = parseInt(a.getAttribute('data-pid'), 10);
        selectPatient(pid);
      };
    });
    host.querySelectorAll('input[type="checkbox"][data-pid]').forEach(box => {
      box.onchange = async () => {
        const pid = box.getAttribute('data-pid');
        try {
          await api(`/api/doctor/patients/${pid}/permission`, { method: 'POST', body: { granted: box.checked } });
          await refreshDoctorView();
          toast('Permission updated.', 'ok');
        } catch (e) { toast(e.message, 'error'); box.checked = !box.checked; }
      };
    });
    host.querySelectorAll('button[data-remove]').forEach(btn => {
      btn.onclick = async () => {
        const pid = parseInt(btn.getAttribute('data-remove'), 10);
        if (!confirm('Remove this patient from your list? This also disables further summaries.')) return;
        try {
          await api(`/api/doctor/patients/${pid}`, { method: 'DELETE' });
          if (state.selectedPatientId === pid) {
            state.selectedPatientId = null;
            document.getElementById('patient-detail-host').innerHTML = '';
          }
          await refreshDoctorView();
          toast('Removed.', 'ok');
        } catch (e) { toast(e.message, 'error'); }
      };
    });
  }

  async function selectPatient(pid) {
    state.selectedPatientId = pid;
    // Re-render so the row gets the .row-selected highlight.
    await refreshPatients();
    await refreshSelectedPatient(pid, { silent: false });
    // Mark all of this patient's deliveries as read; the patients list will
    // pick up the cleared badge on the next tick.
    try {
      await api(`/api/doctor/patients/${pid}/mark-read`, { method: 'POST' });
      await refreshPatients();
    } catch (_) { /* non-fatal */ }
  }

  async function refreshSelectedPatient(pid, { silent }) {
    const host = document.getElementById('patient-detail-host');
    if (!host) return;

    // Fetch in parallel.
    let summaries, note, alerts;
    try {
      [summaries, note, alerts] = await Promise.all([
        api(`/api/doctor/patients/${pid}/summaries`),
        api(`/api/doctor/patients/${pid}/note`),
        api(`/api/doctor/patients/${pid}/live-alerts`),
      ]);
    } catch (e) {
      if (!silent) toast(e.message, 'error');
      return;
    }

    const items = summaries.items || [];
    const liveAlerts = alerts.alerts || [];
    const openAlerts = liveAlerts.filter(a => a.acked_by_doctor_at == null);
    const name = note.patient_name || `Patient ${pid}`;
    const phone = note.patient_phone || '';

    const summariesBody = items.length === 0
      ? `<div class="empty">No summaries delivered yet for this patient. Click
         <strong>Force summary now</strong> to generate one immediately, or wait
         for the next 12-hour auto cycle.</div>`
      : items.map(item => `
        <div class="card" style="margin-bottom:10px;padding:14px 16px;">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap;">
            <div>
              <div style="font-weight:600;">
                <span class="pill ${statusPillClass(item.status_overall)}">${escapeHtml(item.status_overall)}</span>
                <span class="pill ${item.trigger === 'manual' ? 'brand' : 'muted'}" style="margin-left:4px;">${escapeHtml(item.trigger)}</span>
              </div>
              <div class="muted" style="font-size:12.5px;margin-top:4px;">
                sim hours ${fmt(item.sim_hour_start,1)}–${fmt(item.sim_hour_end,1)}
                &nbsp;·&nbsp; received ${escapeHtml(fmtTimestamp(item.sent_at))}
                ${item.read_at ? '' : '&nbsp;·&nbsp;<span class="pill brand">unread</span>'}
              </div>
            </div>
            <div style="text-align:right;">
              <div class="muted" style="font-size:12.5px;">
                crit ${item.alert_count_critical} · warn ${item.alert_count_warn}<br />
                HR ${fmt(item.hr_avg,1)} · HRV ${fmt(item.hrv_avg,1)} · RR ${fmt(item.rr_avg,1)} · SpO2 ${fmt(item.spo2_avg,1)} · ${fmt(item.temp_avg,2)}°C
              </div>
              <a class="btn ghost" style="margin-top:6px;font-size:12px;" href="/api/doctor/summaries/${item.id}/download.csv?token=${encodeURIComponent(state.token)}" download>Download CSV</a>
            </div>
          </div>
          <pre class="narrative" style="margin-top:10px;">${escapeHtml(item.narrative)}</pre>
        </div>`).join('');

    const alertsBody = openAlerts.length === 0
      ? `<div class="muted" style="font-size:13px;">No open live alerts.</div>`
      : `
        <div class="banner crit">
          ${openAlerts.length} open live alert${openAlerts.length === 1 ? '' : 's'}.
          <button id="ack-alerts-btn" class="ghost" style="float:right;color:white;background:transparent;border:1px solid white;">Mark all reviewed</button>
        </div>
        <div style="max-height:200px;overflow:auto;font-size:12.5px;">
          <table>
            <thead><tr><th>Sim hr</th><th>Status</th><th>Vital</th><th>Reading</th><th>Note</th></tr></thead>
            <tbody>
              ${openAlerts.slice(0, 30).map(a => `
                <tr>
                  <td>${fmt(a.sim_hour, 2)}</td>
                  <td><span class="pill ${a.status === 'CRITICAL' ? 'crit' : 'warn'}">${escapeHtml(a.status)}</span></td>
                  <td>${escapeHtml(a.vital)}</td>
                  <td>${fmt(a.value, 2)}</td>
                  <td class="muted">${escapeHtml(a.message)}</td>
                </tr>`).join('')}
            </tbody>
          </table>
          ${openAlerts.length > 30 ? `<div class="muted" style="text-align:center;padding:6px;">…and ${openAlerts.length - 30} more</div>` : ''}
        </div>`;

    const noteSetAt = note.envelope_set_at
      ? `Last updated ${escapeHtml(fmtTimestamp(note.envelope_set_at))}`
      : 'No note saved yet';
    const downloadEnvelopeUrl = `/api/doctor/patients/${pid}/envelope.csv?token=${encodeURIComponent(state.token)}`;

    host.innerHTML = `
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:10px;">
          <div>
            <h2 class="card-title" style="margin-bottom:2px;">${escapeHtml(name)}</h2>
            <div class="muted" style="font-size:12.5px;">${escapeHtml(phone)} &nbsp;·&nbsp; ${items.length} summary item(s) &nbsp;·&nbsp; ${openAlerts.length} open alert(s)</div>
          </div>
          <div class="btn-row">
            <button id="force-detail-btn" class="secondary">Force summary now</button>
            <button id="close-detail-btn" class="ghost">Close</button>
          </div>
        </div>

        <hr class="sep" />
        <h3 style="margin:0 0 6px 0;font-size:14px;">Doctor's note &amp; envelope</h3>
        <div class="muted" style="font-size:12.5px;margin-bottom:8px;">${noteSetAt}. The AI parses your note into a CSV envelope used for live monitoring + the 12-hour summaries. The patient sees the note text but never the CSV.</div>
        <textarea id="note-edit" rows="6" style="width:100%;">${escapeHtml(note.doctors_note || '')}</textarea>
        <div class="btn-row" style="margin-top:8px;">
          <button id="save-note-btn">Save note &amp; re-parse envelope</button>
          ${note.envelope_csv ? `<a class="btn secondary" href="${downloadEnvelopeUrl}" download>Download envelope CSV</a>` : ''}
        </div>

        <hr class="sep" />
        <h3 style="margin:0 0 6px 0;font-size:14px;">Live alerts (per 3-min sample)</h3>
        ${alertsBody}

        <hr class="sep" />
        <h3 style="margin:0 0 6px 0;font-size:14px;">12-hour summaries delivered to you</h3>
        <div id="detail-summaries-host">${summariesBody}</div>
      </div>
    `;

    document.getElementById('force-detail-btn').onclick = async () => {
      try {
        const r = await api(`/api/admin/force-summary/${pid}`, { method: 'POST', auth: false });
        toast('Summary generated. Use Download CSV on the new entry.', 'ok');
        await refreshSelectedPatient(pid, { silent: true });
        await refreshPatients();
      } catch (e) { toast(e.message, 'error'); }
    };
    document.getElementById('close-detail-btn').onclick = () => {
      state.selectedPatientId = null;
      host.innerHTML = '';
      refreshPatients();
    };
    document.getElementById('save-note-btn').onclick = async () => {
      const text = document.getElementById('note-edit').value;
      try {
        const r = await api(`/api/doctor/patients/${pid}/note`, {
          method: 'PUT', body: { doctors_note: text },
        });
        toast(`Note saved (parsed via ${r.envelope_source || 'fallback'}).`, 'ok');
        await refreshSelectedPatient(pid, { silent: true });
      } catch (e) { toast(e.message, 'error'); }
    };
    const ackBtn = document.getElementById('ack-alerts-btn');
    if (ackBtn) ackBtn.onclick = async () => {
      try {
        await api(`/api/doctor/patients/${pid}/live-alerts/ack`, { method: 'POST' });
        toast('Alerts marked reviewed.', 'ok');
        await refreshSelectedPatient(pid, { silent: true });
        await refreshPatients();
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
