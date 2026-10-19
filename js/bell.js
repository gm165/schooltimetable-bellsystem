/**
 * School Bell — reliable ringing engine
 * Uses Web Audio + HTMLAudio fallback so sound actually plays
 */
const BellSystem = {
  audioCtx: null,
  enabled: true,
  unlocked: false,
  isRinging: false,
  ringStopTimer: null,
  activeSources: [],
  sounds: { period: null, assembly: null, break: null },
  lastStatus: 'Idle',
  _beepUrl: null, // generated short WAV data-URL

  async enable() { return this.unlock(true); },

  async unlock(showToast = false) {
    try {
      this.enabled = true;
      if (!this.audioCtx) {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (this.audioCtx.state === 'suspended') {
        await Promise.race([
          this.audioCtx.resume(),
          new Promise(r => setTimeout(r, 400))
        ]);
      }
      // silent buffer unlock
      try {
        const buf = this.audioCtx.createBuffer(1, 1, 22050);
        const src = this.audioCtx.createBufferSource();
        src.buffer = buf;
        src.connect(this.audioCtx.destination);
        src.start(0);
      } catch (_) {}

      if (!this._beepUrl) this._beepUrl = this.makeBeepWav(0.25, 880);

      await this.loadCustomFromSettings();
      this.unlocked = this.audioCtx.state === 'running' || this.audioCtx.state === 'suspended';
      // mark unlocked after gesture path even if still suspended
      if (showToast) this.unlocked = true;

      if (AppState.data) {
        if (!AppState.data.bellSettings) AppState.data.bellSettings = {};
        AppState.data.bellSettings.enabled = true;
        try { AppState.save('silent'); } catch (_) {}
      }

      if (!this._onVisibility) {
        this._onVisibility = () => {
          if (document.visibilityState === 'visible') this.ensureAudio();
        };
        document.addEventListener('visibilitychange', this._onVisibility);
      }
      if (this._keepAlive) clearInterval(this._keepAlive);
      this._keepAlive = setInterval(() => this.ensureAudio(), 8000);

      if (showToast) Utils.toast('🔔 Bell ready — sound unlocked', 'success');
      this.updateUI();
      return true;
    } catch (e) {
      console.warn('unlock', e);
      this.enabled = true;
      this.updateUI();
      return false;
    }
  },

  async ensureAudio() {
    try {
      if (!this.audioCtx) {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (this.audioCtx.state === 'suspended') {
        await Promise.race([
          this.audioCtx.resume(),
          new Promise(r => setTimeout(r, 300))
        ]);
      }
    } catch (_) {}
  },

  disable() {
    this.stop();
    Utils.toast('Bell stays ON (stopped current ring only)', 'info');
    this.updateUI();
  },

  updateUI() {
    const running = this.audioCtx && this.audioCtx.state === 'running';
    const el = document.getElementById('bell-status-badge');
    if (el) {
      el.textContent = running ? '🔔 Bell: ON' : '🔔 Bell: ON (click once for sound)';
      el.className = 'badge badge-success';
    }
    const dash = document.getElementById('bell-dash-status');
    if (dash) dash.textContent = running ? 'ON' : 'ON — click';
    const st = document.getElementById('bell-last-status');
    if (st) st.textContent = this.lastStatus;
  },

  async loadCustomFromSettings() {
    const s = AppState.data?.bellSettings || {};
    this.sounds.period = s.soundPeriod || s.customSoundData || null;
    this.sounds.assembly = s.soundAssembly || null;
    this.sounds.break = s.soundBreak || null;
  },

  /** Generate a short WAV beep as data-URL (HTMLAudio fallback) */
  makeBeepWav(durationSec, freq) {
    const sr = 22050;
    const n = Math.floor(sr * durationSec);
    const data = new ArrayBuffer(44 + n * 2);
    const v = new DataView(data);
    const w = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
    w(0, 'RIFF');
    v.setUint32(4, 36 + n * 2, true);
    w(8, 'WAVE');
    w(12, 'fmt ');
    v.setUint32(16, 16, true);
    v.setUint16(20, 1, true);
    v.setUint16(22, 1, true);
    v.setUint32(24, sr, true);
    v.setUint32(28, sr * 2, true);
    v.setUint16(32, 2, true);
    v.setUint16(34, 16, true);
    w(36, 'data');
    v.setUint32(40, n * 2, true);
    for (let i = 0; i < n; i++) {
      const t = i / sr;
      const env = Math.min(1, t * 30) * Math.min(1, (durationSec - t) * 8);
      const sample = Math.sin(2 * Math.PI * freq * t) * env * 0.6;
      v.setInt16(44 + i * 2, sample * 32767, true);
    }
    const bytes = new Uint8Array(data);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return 'data:audio/wav;base64,' + btoa(binary);
  },

  /** Play one beep via HTMLAudio (most reliable after user gesture) */
  playHtmlBeep(freq) {
    return new Promise((resolve) => {
      try {
        const url = this.makeBeepWav(0.28, freq || 880);
        const a = new Audio(url);
        a.volume = 1;
        const done = () => resolve(true);
        a.onended = done;
        a.onerror = () => resolve(false);
        a.play().then(() => setTimeout(done, 400)).catch(() => resolve(false));
      } catch (_) {
        resolve(false);
      }
    });
  },

  /** Play one metallic strike via Web Audio */
  playStrikeWA(freq) {
    try {
      if (!this.audioCtx) return false;
      const ctx = this.audioCtx;
      if (ctx.state === 'suspended') ctx.resume();
      const now = ctx.currentTime;
      const f = freq || 784;
      [1, 2.7, 5.2].forEach((ratio, i) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = f * ratio;
        const peak = 0.4 / (i + 1);
        g.gain.setValueAtTime(0.001, now);
        g.gain.exponentialRampToValueAtTime(peak, now + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 1);
        this.activeSources.push(osc);
      });
      return true;
    } catch (e) {
      console.warn('WA strike fail', e);
      return false;
    }
  },

  /** One ring: try WebAudio then HTMLAudio fallback */
  async playOneRing(freq) {
    await this.ensureAudio();
    let ok = this.playStrikeWA(freq);
    // Always also fire HTML beep as backup so user hears something
    const htmlOk = await this.playHtmlBeep(freq || 880);
    return ok || htmlOk;
  },

  async playCountRings(n) {
    n = Math.max(1, Math.min(12, n | 0));
    const gap = 0.55;
    for (let i = 0; i < n; i++) {
      if (!this.isRinging && i > 0) break;
      await this.playOneRing(i % 2 === 0 ? 784 : 880);
      if (i < n - 1) await new Promise(r => setTimeout(r, gap * 1000));
    }
    return n * gap + 0.5;
  },

  async playAssemblyPattern() {
    await this.playOneRing(523);
    await new Promise(r => setTimeout(r, 500));
    await this.playOneRing(659);
    await new Promise(r => setTimeout(r, 500));
    await this.playOneRing(784);
    return 2.5;
  },

  async playBreakPattern() {
    await this.playOneRing(880);
    await new Promise(r => setTimeout(r, 280));
    await this.playOneRing(988);
    await new Promise(r => setTimeout(r, 500));
    await this.playOneRing(880);
    await new Promise(r => setTimeout(r, 280));
    await this.playOneRing(988);
    return 2.2;
  },

  playDataUrl(dataUrl) {
    return new Promise((resolve) => {
      if (!dataUrl) { resolve(0); return; }
      try {
        const a = new Audio(dataUrl);
        a.volume = 1;
        a.onended = () => resolve(2);
        a.onerror = () => resolve(0);
        a.play().then(() => setTimeout(() => resolve(2), 3000)).catch(() => resolve(0));
      } catch (_) { resolve(0); }
    });
  },

  getPeriodNumber(period) {
    if (!period) return 1;
    const m = String(period.id || period.name || '').match(/(\d+)/);
    return m ? parseInt(m[1], 10) : 1;
  },

  async ringForEvent(ev, settings) {
    this.enabled = true;
    await this.ensureAudio();
    try { await this.unlock(false); } catch (_) {}

    const type = ev.type || 'period';
    this.isRinging = true;
    this.updateRingingUI(true);
    this.lastStatus = 'Ringing: ' + (ev.name || type);
    this.updateUI();
    console.log('[Bell]', this.lastStatus, new Date().toLocaleTimeString());

    try {
      const customMap = {
        period: this.sounds.period,
        assembly: this.sounds.assembly || this.sounds.period,
        break: this.sounds.break || this.sounds.period,
        'break-end': this.sounds.break || this.sounds.period,
        activity: this.sounds.assembly || this.sounds.period,
        dismiss: this.sounds.assembly || this.sounds.period
      };
      const custom = customMap[type];
      const useCustom = custom && (settings.soundType === 'custom');

      if (useCustom) {
        let repeats = 1;
        if (type === 'period') repeats = Math.min(this.getPeriodNumber(ev.periodObj) || 1, 9);
        else if (type === 'break' || type === 'break-end') repeats = 3;
        else if (type === 'assembly' || type === 'dismiss') repeats = 3;
        for (let i = 0; i < repeats; i++) {
          await this.playDataUrl(custom);
          await new Promise(r => setTimeout(r, 300));
        }
      } else if (type === 'dismiss') {
        // School Over — longer clear pattern
        const total = Math.min(settings.dismissDuration || 12, 25);
        const t0 = Date.now();
        while (Date.now() - t0 < total * 1000 && this.isRinging) {
          await this.playAssemblyPattern();
          await new Promise(r => setTimeout(r, 600));
        }
      } else if (type === 'assembly' || type === 'activity') {
        await this.playAssemblyPattern();
      } else if (type === 'break' || type === 'break-end') {
        const total = Math.min(type === 'break-end' ? (settings.breakEndDuration || 8) : (settings.breakDuration || 8), 20);
        const t0 = Date.now();
        while (Date.now() - t0 < total * 1000 && this.isRinging) {
          await this.playBreakPattern();
          await new Promise(r => setTimeout(r, 800));
        }
      } else {
        // Period: N rings
        const n = settings.periodCountRings === false ? 2 : Math.min(this.getPeriodNumber(ev.periodObj) || 1, 9);
        await this.playCountRings(n);
      }
    } catch (e) {
      console.error('[Bell] ring error', e);
      // last resort single beep
      await this.playHtmlBeep(880);
    }

    this.isRinging = false;
    this.updateRingingUI(false);
    this.lastStatus = 'Last: ' + (ev.name || type) + ' @ ' + new Date().toLocaleTimeString();
    this.updateUI();
  },

  stop() {
    if (this.ringStopTimer) clearTimeout(this.ringStopTimer);
    this.ringStopTimer = null;
    this.activeSources.forEach(s => { try { s.stop(); } catch (_) {} });
    this.activeSources = [];
    this.isRinging = false;
    this.updateRingingUI(false);
    this.lastStatus = 'Stopped';
    this.updateUI();
  },

  updateRingingUI(ringing) {
    const el = document.getElementById('bell-ringing-indicator');
    if (el) {
      el.classList.toggle('hidden', !ringing);
      el.classList.toggle('bell-ringing', ringing);
    }
  },

  getEventKey(date, id) {
    return date.toISOString().slice(0, 10) + '-' + id;
  },

  hasFired(key) {
    return !!(AppState.data?.firedBellEvents || {})[key];
  },

  markFired(key) {
    if (!AppState.data) return;
    if (!AppState.data.firedBellEvents) AppState.data.firedBellEvents = {};
    AppState.data.firedBellEvents[key] = new Date().toISOString();
    try { AppState.save('silent'); } catch (_) {}
  },

  logBell(event, period, duration, status) {
    if (!AppState.data) return;
    if (!AppState.data.bellHistory) AppState.data.bellHistory = [];
    AppState.data.bellHistory.unshift({
      id: 'BH' + Date.now(),
      date: Utils.formatDateShort(new Date()),
      time: Utils.formatTimeShort(new Date()),
      event, period, type: event, duration, status
    });
    if (AppState.data.bellHistory.length > 200) {
      AppState.data.bellHistory = AppState.data.bellHistory.slice(0, 200);
    }
    try { AppState.save('silent'); } catch (_) {}
  },

  /**
   * Called every second. Rings once at period START (any second of that minute)
   * and at break END.
   */
  checkAndRing(now) {
    if (!AppState.data) return;
    this.enabled = true;

    try {
      const dayName = Utils.getDayName(now);
      const dayNum = now.getDay();
      if (dayNum === 0) return;
      if (AppState.data.workingDays && !AppState.data.workingDays.includes(dayName)) return;

      const periods = AppState.getPeriodsForDay(dayName) || [];
      const nowMins = now.getHours() * 60 + now.getMinutes();
      const settings = AppState.data.bellSettings || {};

      // Last teaching period of the day (for school-close fallback if no dismiss row)
      const teachingPeriods = periods.filter(p => p.type === 'period' && p.active !== false);
      const lastTeaching = teachingPeriods.length
        ? teachingPeriods.reduce((a, b) =>
            Utils.timeToMinutes(a.end) >= Utils.timeToMinutes(b.end) ? a : b)
        : null;
      const hasDismiss = periods.some(p => p.type === 'dismiss' && p.active !== false && p.bell !== false);

      periods.forEach(p => {
        if (p.active === false || p.bell === false) return;
        const startM = Utils.timeToMinutes(p.start);
        const endM = Utils.timeToMinutes(p.end);

        // START — entire minute (covers School Over / dismiss at end of day)
        if (nowMins === startM) {
          const key = this.getEventKey(now, p.id + '-start');
          if (!this.hasFired(key)) {
            this.markFired(key);
            const ev = {
              key, name: p.name + (p.type === 'dismiss' ? '' : ' Start'), periodId: p.id,
              periodObj: p, type: p.type || 'period'
            };
            this.ringForEvent(ev, settings).then(() => {
              this.logBell(ev.name, p.id, 'auto', 'Triggered');
            });
          }
        }

        // BREAK END
        if (p.type === 'break' && nowMins === endM) {
          const key = this.getEventKey(now, p.id + '-end');
          if (!this.hasFired(key)) {
            this.markFired(key);
            const ev = {
              key, name: p.name + ' End', periodId: p.id,
              periodObj: p, type: 'break-end'
            };
            this.ringForEvent(ev, settings).then(() => {
              this.logBell(ev.name, p.id, 'auto', 'Triggered');
            });
          }
        }

        // Fallback: end of last teaching period → School Over bell
        // (used when periodTemplates has no explicit "dismiss" row)
        if (!hasDismiss && lastTeaching && p.id === lastTeaching.id && nowMins === endM) {
          const key = this.getEventKey(now, 'school-over-end');
          if (!this.hasFired(key)) {
            this.markFired(key);
            const ev = {
              key, name: 'School Over', periodId: p.id,
              periodObj: { id: 'PSO', name: 'School Over', type: 'dismiss' },
              type: 'dismiss'
            };
            this.ringForEvent(ev, settings).then(() => {
              this.logBell('School Over', p.id, 'auto', 'Triggered');
            });
          }
        }
      });
    } catch (e) {
      console.error('[Bell] checkAndRing', e);
    }
  },

  async manualRing(style) {
    await this.unlock(false);
    await this.ensureAudio();
    const settings = AppState.data?.bellSettings || {};
    let ev = { type: 'period', periodObj: { id: 'P3', name: 'Period 3' }, name: 'Manual Period' };
    if (style === 'short') ev = { type: 'period', periodObj: { id: 'P1', name: 'Period 1' }, name: 'Manual Short' };
    if (style === 'assembly') ev = { type: 'assembly', periodObj: { name: 'Assembly' }, name: 'Manual Assembly' };
    if (style === 'long' || style === 'break') ev = { type: 'break', periodObj: { name: 'Break' }, name: 'Manual Break' };
    if (style === 'normal') ev = { type: 'period', periodObj: { id: 'P3', name: 'Period 3' }, name: 'Manual' };
    await this.ringForEvent(ev, settings);
    this.logBell('Manual ' + style, style, 'manual', 'Manual');
    Utils.toast('🔔 Rang: ' + style, 'info');
  },

  async testBell() {
    await this.unlock(true);
    await this.ensureAudio();
    this.isRinging = true;
    this.updateRingingUI(true);
    this.lastStatus = 'TEST ringing…';
    this.updateUI();
    // Force 2 clear beeps both ways
    await this.playOneRing(880);
    await new Promise(r => setTimeout(r, 400));
    await this.playOneRing(988);
    this.isRinging = false;
    this.updateRingingUI(false);
    this.lastStatus = 'TEST done @ ' + new Date().toLocaleTimeString();
    this.updateUI();
    Utils.toast('Test bell played (2 beeps)', 'success');
  },

  async uploadSoundFor(slot, file) {
    if (!file || file.size > 2 * 1024 * 1024) {
      Utils.toast('Max 2 MB', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = async (e) => {
      const s = AppState.data.bellSettings;
      if (slot === 'period') { s.soundPeriod = e.target.result; s.soundPeriodName = file.name; }
      if (slot === 'assembly') { s.soundAssembly = e.target.result; s.soundAssemblyName = file.name; }
      if (slot === 'break') { s.soundBreak = e.target.result; s.soundBreakName = file.name; }
      s.soundType = 'custom';
      await this.loadCustomFromSettings();
      await AppState.save('Bell sound: ' + slot);
      Utils.toast('Uploaded ' + slot, 'success');
      App.refresh();
    };
    reader.readAsDataURL(file);
  },

  async uploadSound(file) { return this.uploadSoundFor('period', file); },

  async clearCustomSound(slot) {
    const s = AppState.data.bellSettings || {};
    if (!slot || slot === 'period') { s.soundPeriod = null; s.soundPeriodName = null; s.customSoundData = null; }
    if (!slot || slot === 'assembly') { s.soundAssembly = null; s.soundAssemblyName = null; }
    if (!slot || slot === 'break') { s.soundBreak = null; s.soundBreakName = null; }
    if (!s.soundPeriod && !s.soundAssembly && !s.soundBreak) s.soundType = 'default';
    await this.loadCustomFromSettings();
    await AppState.save('Sound cleared');
    App.refresh();
  },

  async setSoundType(type) {
    AppState.data.bellSettings.soundType = type;
    await AppState.save('silent');
  }
};
