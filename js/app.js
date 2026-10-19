/**
 * Main Application Shell & Router
 */
const App = {
  pages: {
    dashboard: { title: 'Dashboard', render: () => Dashboard.render() },
    'class-wise': { title: 'Class Wise Timetable', render: () => TimetableUI.renderClassWise() },
    'teacher-wise': { title: 'Teacher Wise Timetable', render: () => TimetableUI.renderTeacherWise() },
    'tt-editor': { title: 'Timetable Editor', render: () => TimetableUI.renderEditor() },
    'bell-settings': { title: 'Bell Settings', render: () => Management.renderBellSettings() },
    'bell-timetable': { title: 'Bell Timetable', render: () => Management.renderBellTimetable() },
    'bell-history': { title: 'Bell History', render: () => Management.renderBellHistory() },
    teachers: { title: 'Staff Management', render: () => Management.renderTeachers() },
    subjects: { title: 'Subjects', render: () => Management.renderSubjects() },
    classes: { title: 'Classes', render: () => Management.renderClasses() },
    scheme: { title: 'Scheme of Study', render: () => Management.renderScheme() },
    attendance: { title: 'Teacher Attendance', render: () => Management.renderAttendance() },
    'alternate-tt': { title: 'Alternate Timetable', render: () => Management.renderAlternateTT() },
    reports: { title: 'Reports', render: () => Management.renderReports() },
    backup: { title: 'Backup & Restore', render: async () => await Management.renderBackup() },
    settings: { title: 'School Settings', render: () => Management.renderSettings() }
  },

  async init() {
    const theme = localStorage.getItem('ST_theme') || 'light';
    document.documentElement.setAttribute('data-theme', theme);

    const content = document.getElementById('content');

    try {
      // Load data with timeout so UI never hangs forever
      const dataPromise = AppState.init();
      const timeout = new Promise((_, rej) =>
        setTimeout(() => rej(new Error('Database load timeout')), 8000)
      );
      try {
        await Promise.race([dataPromise, timeout]);
      } catch (dbErr) {
        console.warn('DB issue, using seed:', dbErr);
        if (!AppState.data && window.SEED_DATA) {
          AppState.data = JSON.parse(JSON.stringify(window.SEED_DATA));
        }
      }

      if (!AppState.data) {
        AppState.data = JSON.parse(JSON.stringify(window.SEED_DATA || { school: { name: 'School' }, teachers: [], classes: [], subjects: [], timetable: [], periodTemplates: { default: [] }, bellSettings: {}, workingDays: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'] }));
      }

      // Sync the current timetable to the Windows background bell process.
      // This allows ringing even when this window is hidden/closed to tray.
      try { window.BackgroundBell?.sync(AppState.data); } catch (_) {}

      // Show UI FIRST — do not wait for audio
      BellSystem.enabled = true;
      if (AppState.data.bellSettings) AppState.data.bellSettings.enabled = true;

      this.bindNav();
      await this.navigate('dashboard');
      this.applyBranding();

      // Bell unlock in background (non-blocking)
      this.setupBellAutoEnable();

    } catch (e) {
      console.error(e);
      if (content) {
        content.innerHTML = `
          <div class="card"><div class="card-body">
            <h2>Startup Error</h2>
            <p>${(window.Utils ? Utils.escapeHtml(e.message) : e.message)}</p>
            <button class="btn btn-primary" onclick="location.reload()">Reload</button>
            <button class="btn" onclick="localStorage.clear();indexedDB.deleteDatabase('SchoolTimetableDB');location.reload()">Clear Data & Reload</button>
          </div></div>`;
      }
    }
  },

  setupBellAutoEnable() {
    // Non-blocking unlock
    setTimeout(() => {
      try { BellSystem.unlock(false); } catch (e) { console.warn(e); }
    }, 100);

    // Retry a few times in background
    let tries = 0;
    const id = setInterval(() => {
      tries++;
      try { BellSystem.unlock(false); } catch (_) {}
      if ((BellSystem.audioCtx && BellSystem.audioCtx.state === 'running') || tries > 10) {
        clearInterval(id);
      }
      try { BellSystem.updateUI(); } catch (_) {}
    }, 1000);

    // Unlock on first user gesture
    const unlockOnce = () => {
      try { BellSystem.unlock(false); } catch (_) {}
      document.removeEventListener('click', unlockOnce, true);
      document.removeEventListener('keydown', unlockOnce, true);
      document.removeEventListener('touchstart', unlockOnce, true);
      document.removeEventListener('pointerdown', unlockOnce, true);
    };
    document.addEventListener('click', unlockOnce, true);
    document.addEventListener('keydown', unlockOnce, true);
    document.addEventListener('touchstart', unlockOnce, true);
    document.addEventListener('pointerdown', unlockOnce, true);
  },

  bindNav() {
    document.querySelectorAll('[data-page]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        this.navigate(el.dataset.page);
        document.getElementById('sidebar')?.classList.remove('open');
        document.getElementById('sidebar-overlay')?.classList.remove('show');
      });
    });
    document.getElementById('menu-toggle')?.addEventListener('click', () => {
      document.getElementById('sidebar')?.classList.toggle('open');
      document.getElementById('sidebar-overlay')?.classList.toggle('show');
    });
    document.getElementById('sidebar-overlay')?.addEventListener('click', () => {
      document.getElementById('sidebar')?.classList.remove('open');
      document.getElementById('sidebar-overlay')?.classList.remove('show');
    });
  },

  async navigate(page) {
    const p = this.pages[page];
    if (!p) return;
    AppState.currentPage = page;
    document.querySelectorAll('[data-page]').forEach(el => {
      el.classList.toggle('active', el.dataset.page === page);
    });
    const titleEl = document.getElementById('page-title');
    if (titleEl) titleEl.textContent = p.title;
    const content = document.getElementById('content');
    if (!content) return;
    content.innerHTML = '<div class="text-muted" style="padding:2rem">Loading…</div>';
    try {
      const html = await p.render();
      content.innerHTML = html || '<div class="text-muted">Empty page</div>';
      if (page === 'dashboard') {
        try {
          Dashboard.updateLive(new Date());
          BellSystem.updateUI();
        } catch (e) {
          console.warn('Dashboard live update', e);
        }
      }
    } catch (e) {
      console.error(e);
      content.innerHTML = `<div class="card"><div class="card-body">
        <p>Error loading page: ${Utils.escapeHtml(e.message)}</p>
        <button class="btn" onclick="App.navigate('dashboard')">Back to Dashboard</button>
      </div></div>`;
    }
  },

  refresh() {
    this.navigate(AppState.currentPage);
    this.applyBranding();
  },

  /** Update title bar + sidebar school name from Settings */
  applyBranding() {
    const school = AppState.data?.school || {};
    const name = (school.name || 'School Timetable').trim() || 'School Timetable';
    const short = name.length > 28 ? name.slice(0, 26) + '…' : name;
    document.title = name + ' – School Timetable';
    const brand = document.getElementById('brand-school-name');
    if (brand) brand.textContent = short;
    // Electron window title follows document.title in most builds
    try {
      if (typeof document !== 'undefined') document.title = name + ' – School Timetable';
    } catch (_) {}
  }
};

document.addEventListener('DOMContentLoaded', () => {
  App.init().catch(e => {
    console.error('Fatal init', e);
    const c = document.getElementById('content');
    if (c) c.innerHTML = `<div class="card"><div class="card-body"><h2>Failed to start</h2><p>${e.message}</p><button onclick="location.reload()">Reload</button></div></div>`;
  });
});
