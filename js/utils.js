/**
 * Utility functions
 */
const Utils = {
  DAY_MAP: { 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday', 6: 'Saturday', 0: 'Sunday' },
  DAY_NUM: { Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6, Sunday: 0 },

  pad(n) { return String(n).padStart(2, '0'); },

  formatTime(date) {
    if (!(date instanceof Date)) date = new Date(date);
    let h = date.getHours(), m = date.getMinutes(), s = date.getSeconds();
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${this.pad(h)}:${this.pad(m)}:${this.pad(s)} ${ampm}`;
  },

  formatTimeShort(date) {
    if (!(date instanceof Date)) date = new Date(date);
    let h = date.getHours(), m = date.getMinutes();
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${this.pad(h)}:${this.pad(m)} ${ampm}`;
  },

  formatDate(date) {
    if (!(date instanceof Date)) date = new Date(date);
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${days[date.getDay()]}, ${this.pad(date.getDate())}-${months[date.getMonth()]}-${date.getFullYear()}`;
  },

  formatDateShort(date) {
    if (!(date instanceof Date)) date = new Date(date);
    return `${this.pad(date.getDate())}-${this.pad(date.getMonth()+1)}-${date.getFullYear()}`;
  },

  // "HH:MM" or "HH:MM:SS" to minutes since midnight
  timeToMinutes(t) {
    if (!t) return 0;
    const parts = String(t).split(':').map(Number);
    return (parts[0] || 0) * 60 + (parts[1] || 0);
  },

  minutesToTime(mins) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${this.pad(h)}:${this.pad(m)}`;
  },

  formatCountdown(totalSeconds) {
    if (totalSeconds < 0) totalSeconds = 0;
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    if (h > 0) return `${this.pad(h)}:${this.pad(m)}:${this.pad(s)}`;
    return `${this.pad(m)}:${this.pad(s)}`;
  },

  // Parse day range like "1-6", "1-5", "1-4,6", "6"
  dayMatches(daysStr, dayNum) {
    if (!daysStr || daysStr === 'all' || daysStr === '1-6') {
      return dayNum >= 1 && dayNum <= 6;
    }
    const parts = String(daysStr).replace(/،/g, ',').split(',');
    for (const p of parts) {
      const trimmed = p.trim();
      if (trimmed.includes('-')) {
        const [a, b] = trimmed.split('-').map(Number);
        if (dayNum >= a && dayNum <= b) return true;
      } else if (Number(trimmed) === dayNum) {
        return true;
      }
    }
    return false;
  },

  getTodayDayNum() {
    const d = new Date().getDay(); // 0=Sun
    return d === 0 ? 0 : d; // keep 1-6 for Mon-Sat
  },

  getDayName(date) {
    const d = date || new Date();
    return this.DAY_MAP[d.getDay()];
  },

  escapeHtml(str) {
    if (str == null) return '';
    const div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
  },

  uid(prefix = 'ID') {
    return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  },

  downloadText(filename, text, mime = 'text/plain') {
    const blob = new Blob([text], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  },

  toast(message, type = 'info', duration = 3500) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `<span>${this.escapeHtml(message)}</span>`;
    container.appendChild(el);
    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateX(20px)';
      setTimeout(() => el.remove(), 250);
    }, duration);
  },

  confirm(message) {
    return window.confirm(message);
  },

  // Deep clone
  clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }
};
