/**
 * Headteacher Dashboard
 */
const Dashboard = {
  render() {
    const data = AppState.data;
    const school = data.school;
    return `
      <div class="grid grid-4 mb-2">
        <div class="stat-card primary">
          <div class="label">School</div>
          <div class="value" style="font-size:1.1rem;display:flex;align-items:center;gap:.5rem">
            ${school.logo ? `<img src="${school.logo}" alt="" style="height:36px;width:auto;border-radius:6px">` : ''}
            <span>${Utils.escapeHtml(school.name)}</span>
          </div>
          <div class="sub">${Utils.escapeHtml(school.session)} · ${Utils.escapeHtml(school.headteacher)}</div>
        </div>
        <div class="stat-card accent">
          <div class="label">Current Time</div>
          <div class="value clock-display" id="live-clock" style="font-size:1.6rem">--:--:--</div>
          <div class="sub" id="live-date">—</div>
        </div>
        <div class="stat-card info">
          <div class="label">Bell System</div>
          <div class="value" style="font-size:1.1rem" id="bell-dash-status">ON</div>
          <div class="sub">
            <button class="btn btn-sm btn-accent" onclick="BellSystem.unlock(true)">Unlock Sound</button>
            <span class="text-xs text-muted">Always ON</span>
          </div>
        </div>
        <div class="stat-card warning">
          <div class="label">Offline Mode</div>
          <div class="value" style="font-size:1.1rem">LOCAL</div>
          <div class="sub">No server required</div>
        </div>
      </div>

      <div class="grid grid-3 mb-2">
        <div class="card">
          <div class="card-body">
            <div class="activity-box" id="current-activity-box">
              <div class="label">CURRENTLY RUNNING</div>
              <div class="name" id="current-activity-name">—</div>
              <div class="time-range" id="current-activity-time">—</div>
            </div>
            <div class="countdown-box mt-1">
              <div class="text-sm text-muted">Ends in</div>
              <div class="digits" id="countdown-end">--:--</div>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card-header">Next Event</div>
          <div class="card-body" id="next-event-box">
            <div class="text-muted">Loading…</div>
          </div>
        </div>
        <div class="card">
          <div class="card-header">
            <span>🔔 Bell Panel</span>
            <span id="bell-ringing-indicator" class="hidden badge badge-warning bell-ringing">RINGING</span>
          </div>
          <div class="card-body">
            <div class="mb-1"><span id="bell-status-badge" class="badge badge-success">🔔 Bell: ON</span></div>
            <div class="flex gap-1 flex-wrap">
              <button class="btn btn-sm btn-warning" onclick="BellSystem.manualRing('normal')">Ring Now</button>
              <button class="btn btn-sm" onclick="BellSystem.manualRing('short')">Short</button>
              <button class="btn btn-sm" onclick="BellSystem.manualRing('long')">Long</button>
              <button class="btn btn-sm btn-danger" onclick="BellSystem.stop()">Stop</button>
            </div>
            <div class="mt-1 text-sm text-muted" id="next-bell-info">Next bell: —</div>
            <div class="mt-1 text-sm"><strong>Status:</strong> <span id="bell-last-status">Idle</span></div>
            <div class="mt-1 flex gap-1 flex-wrap">
              <button class="btn btn-sm btn-success" onclick="BellSystem.testBell()">🔊 Test Sound Now</button>
            </div>
          </div>
        </div>
      </div>

      <div class="card mb-2">
        <div class="card-header">Today's Timeline</div>
        <div class="card-body">
          <div class="timeline" id="today-timeline"></div>
        </div>
      </div>

      <div class="grid grid-2 mb-2">
        <div class="card">
          <div class="card-header">
            <span>Teachers</span>
            <span class="text-sm text-muted" id="teacher-counts"></span>
          </div>
          <div class="card-body">
            <div class="flex gap-1 mb-1">
              <button class="btn btn-sm btn-danger" onclick="Dashboard.filterTeachers('busy')">Busy</button>
              <button class="btn btn-sm btn-success" onclick="Dashboard.filterTeachers('free')">Free</button>
              <button class="btn btn-sm" onclick="Dashboard.filterTeachers('all')">All</button>
            </div>
            <div class="table-wrap" style="max-height:320px;overflow-y:auto">
              <table class="data-table" id="teacher-status-table">
                <thead><tr><th>Teacher</th><th>Status</th><th>Class / Subject</th><th>Next</th></tr></thead>
                <tbody></tbody>
              </table>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card-header">Class Status</div>
          <div class="card-body">
            <div class="table-wrap" style="max-height:320px;overflow-y:auto">
              <table class="data-table" id="class-status-table">
                <thead><tr><th>Class</th><th>Activity</th><th>Teacher</th><th>Subject</th><th>Next</th></tr></thead>
                <tbody></tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">Quick Actions</div>
        <div class="card-body flex gap-1 flex-wrap">
          <button class="btn btn-primary" onclick="App.navigate('tt-editor')">Add Timetable Entry</button>
          <button class="btn" onclick="App.navigate('class-wise')">Class Timetable</button>
          <button class="btn" onclick="App.navigate('teacher-wise')">Teacher Timetable</button>
          <button class="btn" onclick="App.navigate('teachers')">Staff</button>
          <button class="btn" onclick="App.navigate('bell-settings')">Bell Settings</button>
          <button class="btn" onclick="App.navigate('settings')">School Settings</button>
          <button class="btn" onclick="App.navigate('backup')">Backup</button>
          <button class="btn" onclick="window.print()">Print Today</button>
        </div>
      </div>
    `;
  },

  updateLive(now) {
    now = now || new Date();
    let info;
    try {
      info = AppState.getCurrentPeriodInfo(now);
    } catch (e) {
      console.warn('getCurrentPeriodInfo error', e);
      info = { state: 'unknown', label: '—', period: null, periods: [] };
    }

    const nameEl = document.getElementById('current-activity-name');
    const timeEl = document.getElementById('current-activity-time');
    const countEl = document.getElementById('countdown-end');
    if (nameEl) nameEl.textContent = info.label || '—';
    if (timeEl) {
      timeEl.textContent = info.period ? `${info.period.start} – ${info.period.end}` : '—';
    }
    if (countEl) {
      countEl.textContent = info.remaining != null ? Utils.formatCountdown(Math.max(0, info.remaining)) : '--:--';
    }

    // Next event
    const nextBox = document.getElementById('next-event-box');
    if (nextBox) {
      if (info.next) {
        const rem = info.remainingToNext != null ? Utils.formatCountdown(info.remainingToNext) : '';
        nextBox.innerHTML = `
          <div class="font-bold" style="font-size:1.2rem">${Utils.escapeHtml(info.next.name)}</div>
          <div class="text-muted">${info.next.start} – ${info.next.end}</div>
          <div class="mt-1">Starts in <strong>${rem}</strong></div>
        `;
      } else if (info.state === 'closed' || info.state === 'before') {
        nextBox.innerHTML = `<div class="text-muted">${info.label}</div>`;
      } else {
        nextBox.innerHTML = `<div class="text-muted">No more periods today</div>`;
      }
    }

    // Next bell info
    const nbi = document.getElementById('next-bell-info');
    if (nbi && info.next) {
      nbi.textContent = `Next bell: ${info.next.start} (${info.next.name})`;
    }

    // Timeline
    const tl = document.getElementById('today-timeline');
    if (tl && info.periods) {
      const curId = info.period ? info.period.id : null;
      const nowMins = now.getHours() * 60 + now.getMinutes();
      tl.innerHTML = info.periods.map(p => {
        const start = Utils.timeToMinutes(p.start);
        const end = Utils.timeToMinutes(p.end);
        let cls = 'timeline-item';
        if (p.id === curId) cls += ' current';
        else if (end <= nowMins) cls += ' past';
        return `<div class="${cls}"><div class="t-time">${p.start}</div><div class="t-name">${Utils.escapeHtml(p.name)}</div></div>`;
      }).join('');
    }

    // Teacher status
    try {
      this.renderTeacherStatus();
      this.renderClassStatus();
    } catch (e) {
      console.warn('Dashboard status render error', e);
    }
  },

  _teacherFilter: 'all',

  filterTeachers(f) {
    this._teacherFilter = f;
    this.renderTeacherStatus();
  },

  renderTeacherStatus() {
    const tbody = document.querySelector('#teacher-status-table tbody');
    const counts = document.getElementById('teacher-counts');
    if (!tbody) return;
    const status = AppState.getTeacherStatus();
    if (counts) counts.textContent = `Total: ${status.total} · Busy: ${status.busy.length} · Free: ${status.free.length}`;

    let rows = [];
    if (this._teacherFilter !== 'free') {
      status.busy.forEach(b => {
        rows.push({
          name: b.teacher.name,
          status: 'BUSY',
          statusClass: 'status-busy',
          detail: `${b.className} · ${b.subject}`,
          next: '—'
        });
      });
    }
    if (this._teacherFilter !== 'busy') {
      status.free.forEach(f => {
        const next = f.next ? `${f.next.period?.name || ''} ${f.next.className} ${f.next.subject}` : '—';
        rows.push({
          name: f.teacher.name,
          status: f.status === 'break' ? 'BREAK' : f.status === 'assembly' ? 'ASSEMBLY' : 'FREE',
          statusClass: f.status === 'break' ? 'status-break' : f.status === 'assembly' ? 'status-assembly' : 'status-free',
          detail: '—',
          next
        });
      });
    }
    tbody.innerHTML = rows.map(r => `
      <tr>
        <td class="urdu">${Utils.escapeHtml(r.name)}</td>
        <td><span class="badge ${r.statusClass}">${r.status}</span></td>
        <td class="urdu text-sm">${Utils.escapeHtml(r.detail)}</td>
        <td class="text-sm text-muted">${Utils.escapeHtml(r.next)}</td>
      </tr>
    `).join('') || '<tr><td colspan="4" class="text-muted">No teachers</td></tr>';
  },

  renderClassStatus() {
    const tbody = document.querySelector('#class-status-table tbody');
    if (!tbody) return;
    const list = AppState.getClassStatus();
    tbody.innerHTML = list.map(c => `
      <tr>
        <td><strong>${Utils.escapeHtml(c.class.name)}</strong></td>
        <td>${Utils.escapeHtml(c.activity)}</td>
        <td class="urdu">${c.teacher ? Utils.escapeHtml(c.teacher.name) : '—'}</td>
        <td class="urdu">${c.subject ? Utils.escapeHtml(c.subject.name) : '—'}</td>
        <td class="text-sm text-muted">${c.next ? Utils.escapeHtml(c.next.period.name + ' · ' + c.next.subject) : '—'}</td>
      </tr>
    `).join('');
  }
};
