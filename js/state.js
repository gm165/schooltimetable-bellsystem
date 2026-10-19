/**
 * Application State & Timetable / Dashboard services
 * Single source of truth driven from DB cache
 */
const AppState = {
  data: null,
  currentPage: 'dashboard',
  clockInterval: null,
  lastSecond: -1,
  audioCtx: null,
  bellEnabled: false,
  isRinging: false,
  ringTimeout: null,

  async init() {
    this.data = await DB.loadAppData();
    this.startClock();
    return this.data;
  },

  async save(reason = 'Auto-save') {
    await DB.saveAppData(this.data, reason);
    try { window.BackgroundBell?.sync(this.data); } catch (_) {}
    if (reason !== 'silent') {
      Utils.toast('✓ Saved', 'success', 1500);
    }
  },

  getPeriodsForDay(dayName) {
    const templates = this.data.periodTemplates;
    if (dayName === 'Friday' && templates.Friday) return templates.Friday;
    return templates.default || [];
  },

  getCurrentPeriodInfo(now) {
    now = now || new Date();
    const dayName = Utils.getDayName(now);
    const dayNum = now.getDay(); // 0=Sun
    const periods = this.getPeriodsForDay(dayName);
    const mins = now.getHours() * 60 + now.getMinutes();
    const secs = now.getSeconds();

    // Check holiday / closed
    if (dayNum === 0 || !this.data.workingDays.includes(dayName)) {
      return { state: 'closed', label: 'School Closed', period: null, periods };
    }

    // Before school
    if (periods.length && mins < Utils.timeToMinutes(periods[0].start)) {
      return {
        state: 'before',
        label: 'Before School',
        period: null,
        next: periods[0],
        periods,
        remainingToNext: (Utils.timeToMinutes(periods[0].start) - mins) * 60 - secs
      };
    }

    for (let i = 0; i < periods.length; i++) {
      const p = periods[i];
      const start = Utils.timeToMinutes(p.start);
      const end = Utils.timeToMinutes(p.end);
      if (mins >= start && mins < end) {
        const remaining = (end - mins) * 60 - secs;
        const next = periods[i + 1] || null;
        return {
          state: p.type || 'period',
          label: p.name,
          period: p,
          next,
          periods,
          remaining,
          remainingToNext: next ? (Utils.timeToMinutes(next.start) - mins) * 60 - secs : null
        };
      }
    }

    // After last period
    const last = periods[periods.length - 1];
    if (last && mins >= Utils.timeToMinutes(last.end)) {
      return { state: 'closed', label: 'School Closed', period: null, periods };
    }
    return { state: 'unknown', label: '—', period: null, periods };
  },

  // Get timetable entries active for a given day number (1-6) and period id
  getEntriesFor(dayNum, periodId, classId) {
    return (this.data.timetable || []).filter(tt => {
      if (tt.period !== periodId) return false;
      if (classId && tt.classId !== classId) return false;
      return Utils.dayMatches(tt.days, dayNum);
    });
  },

  getTeacherById(id) {
    return (this.data.teachers || []).find(t => t.id === id);
  },
  getSubjectById(id) {
    return (this.data.subjects || []).find(s => s.id === id);
  },
  getClassById(id) {
    return (this.data.classes || []).find(c => c.id === id);
  },

  // Teacher busy/free for current period
  getTeacherStatus(now) {
    now = now || new Date();
    const info = this.getCurrentPeriodInfo(now);
    const dayNum = now.getDay() === 0 ? 0 : now.getDay();
    const teachers = this.data.teachers.filter(t => t.status === 'active');
    const result = { busy: [], free: [], total: teachers.length };

    if (!info.period || info.state === 'closed' || info.state === 'before') {
      teachers.forEach(t => {
        result.free.push({ teacher: t, current: null, next: this.getNextClassForTeacher(t.id, dayNum, info) });
      });
      return result;
    }

    if (info.state === 'break' || info.state === 'assembly' || info.state === 'activity') {
      teachers.forEach(t => {
        result.free.push({ teacher: t, current: null, status: info.state, next: this.getNextClassForTeacher(t.id, dayNum, info) });
      });
      return result;
    }

    const entries = this.getEntriesFor(dayNum, info.period.id);
    const busyIds = new Set();
    entries.forEach(e => {
      const teacher = this.getTeacherById(e.teacherId);
      const subject = this.getSubjectById(e.subjectId);
      const cls = this.getClassById(e.classId);
      if (teacher) {
        busyIds.add(teacher.id);
        result.busy.push({
          teacher,
          subject: subject ? subject.name : '',
          className: cls ? cls.name : '',
          room: e.room || '',
          entry: e
        });
      }
    });

    teachers.forEach(t => {
      if (!busyIds.has(t.id)) {
        result.free.push({ teacher: t, current: null, next: this.getNextClassForTeacher(t.id, dayNum, info) });
      }
    });
    return result;
  },

  getNextClassForTeacher(teacherId, dayNum, currentInfo) {
    const periods = currentInfo.periods || this.getPeriodsForDay(Utils.getDayName());
    let foundCurrent = !currentInfo.period;
    for (const p of periods) {
      if (currentInfo.period && p.id === currentInfo.period.id) {
        foundCurrent = true;
        continue;
      }
      if (!foundCurrent) continue;
      if (p.type !== 'period') continue;
      const entries = this.getEntriesFor(dayNum, p.id).filter(e => e.teacherId === teacherId);
      if (entries.length) {
        const e = entries[0];
        return {
          period: p,
          subject: this.getSubjectById(e.subjectId)?.name || '',
          className: this.getClassById(e.classId)?.name || ''
        };
      }
    }
    return null;
  },

  // Class status for current period
  getClassStatus(now) {
    now = now || new Date();
    const info = this.getCurrentPeriodInfo(now);
    const dayNum = now.getDay() === 0 ? 0 : now.getDay();
    return (this.data.classes || []).filter(c => c.active).map(cls => {
      if (!info.period || info.state === 'closed' || info.state === 'before') {
        return { class: cls, activity: info.label, teacher: null, subject: null, next: null };
      }
      if (info.state === 'break' || info.state === 'assembly' || info.state === 'activity') {
        return { class: cls, activity: info.label, teacher: null, subject: null, next: null };
      }
      const entries = this.getEntriesFor(dayNum, info.period.id, cls.id);
      const e = entries[0];
      let next = null;
      const periods = info.periods;
      let found = false;
      for (const p of periods) {
        if (p.id === info.period.id) { found = true; continue; }
        if (!found || p.type !== 'period') continue;
        const ne = this.getEntriesFor(dayNum, p.id, cls.id)[0];
        if (ne) {
          next = {
            period: p,
            subject: this.getSubjectById(ne.subjectId)?.name || '',
            teacher: this.getTeacherById(ne.teacherId)?.name || ''
          };
          break;
        }
      }
      return {
        class: cls,
        activity: info.label,
        teacher: e ? this.getTeacherById(e.teacherId) : null,
        subject: e ? this.getSubjectById(e.subjectId) : null,
        room: e ? e.room : '',
        next,
        remaining: info.remaining
      };
    });
  },

  // Build class-wise view data
  getClassTimetable(classId, dayNum) {
    dayNum = dayNum == null ? (new Date().getDay() || 6) : dayNum;
    const dayName = Utils.DAY_MAP[dayNum] || 'Monday';
    const periods = this.getPeriodsForDay(dayName);
    const rows = periods.map(p => {
      if (p.type !== 'period') {
        return { period: p, entries: [], isBreak: true };
      }
      const entries = this.getEntriesFor(dayNum, p.id, classId);
      return {
        period: p,
        entries: entries.map(e => ({
          teacher: this.getTeacherById(e.teacherId),
          subject: this.getSubjectById(e.subjectId),
          room: e.room,
          days: e.days,
          id: e.id
        })),
        isBreak: false
      };
    });
    return { class: this.getClassById(classId), periods, rows, dayName, dayNum };
  },

  // Build teacher-wise view
  getTeacherTimetable(teacherId, dayNum) {
    dayNum = dayNum == null ? (new Date().getDay() || 6) : dayNum;
    const dayName = Utils.DAY_MAP[dayNum] || 'Monday';
    const periods = this.getPeriodsForDay(dayName);
    const teacher = this.getTeacherById(teacherId);
    let count = 0;
    const rows = periods.map(p => {
      if (p.type !== 'period') {
        return { period: p, entries: [], isBreak: true };
      }
      const entries = (this.data.timetable || []).filter(tt =>
        tt.teacherId === teacherId && tt.period === p.id && Utils.dayMatches(tt.days, dayNum)
      );
      if (entries.length) count++;
      return {
        period: p,
        entries: entries.map(e => ({
          subject: this.getSubjectById(e.subjectId),
          class: this.getClassById(e.classId),
          room: e.room,
          days: e.days,
          id: e.id
        })),
        isBreak: false
      };
    });
    return { teacher, periods, rows, dayName, dayNum, periodCount: count };
  },

  getAllTeachersWorkload(dayNum) {
    dayNum = dayNum == null ? (new Date().getDay() || 6) : dayNum;
    return (this.data.teachers || []).filter(t => t.status === 'active').map(t => {
      const tt = this.getTeacherTimetable(t.id, dayNum);
      return { teacher: t, periods: tt.periodCount, free: tt.rows.filter(r => !r.isBreak && r.entries.length === 0).length };
    });
  },

  // Conflict detection
  findConflicts(entry) {
    const conflicts = [];
    const dayNum = 1; // check generically; for specific day use dayMatches
    // Teacher conflict
    const teacherEntries = (this.data.timetable || []).filter(tt =>
      tt.id !== entry.id &&
      tt.teacherId === entry.teacherId &&
      tt.period === entry.period &&
      this._daysOverlap(tt.days, entry.days)
    );
    teacherEntries.forEach(tt => {
      conflicts.push({
        type: 'teacher',
        message: `${this.getTeacherById(entry.teacherId)?.name || 'Teacher'} already assigned to ${this.getClassById(tt.classId)?.name || ''} – ${tt.period}`
      });
    });
    // Class conflict (same class, same period, overlapping days)
    const classEntries = (this.data.timetable || []).filter(tt =>
      tt.id !== entry.id &&
      tt.classId === entry.classId &&
      tt.period === entry.period &&
      this._daysOverlap(tt.days, entry.days) &&
      !tt.notes?.includes('alt') // allow alt dual subjects
    );
    classEntries.forEach(tt => {
      if (entry.notes?.includes('alt')) return;
      conflicts.push({
        type: 'class',
        message: `${this.getClassById(entry.classId)?.name || 'Class'} already has a subject in ${tt.period}`
      });
    });
    return conflicts;
  },

  _daysOverlap(a, b) {
    for (let d = 1; d <= 6; d++) {
      if (Utils.dayMatches(a, d) && Utils.dayMatches(b, d)) return true;
    }
    return false;
  },

  // ── Teacher attendance & substitutions ──────────────────────────
  dateKey(date) {
    const d = date instanceof Date ? date : new Date(date);
    return d.getFullYear() + '-' + Utils.pad(d.getMonth() + 1) + '-' + Utils.pad(d.getDate());
  },

  getAttendanceMap(date) {
    if (!this.data.teacherAttendance) this.data.teacherAttendance = {};
    const key = this.dateKey(date);
    if (!this.data.teacherAttendance[key]) this.data.teacherAttendance[key] = {};
    return this.data.teacherAttendance[key];
  },

  getTeacherAttendance(teacherId, date) {
    const map = this.getAttendanceMap(date);
    return map[teacherId] || 'present';
  },

  setTeacherAttendance(teacherId, status, date) {
    const map = this.getAttendanceMap(date);
    map[teacherId] = status === 'leave' ? 'leave' : 'present';
  },

  setAllAttendance(status, date) {
    const map = this.getAttendanceMap(date);
    (this.data.teachers || []).filter(t => t.status === 'active').forEach(t => {
      map[t.id] = status === 'leave' ? 'leave' : 'present';
    });
  },

  /** Periods assigned to teachers marked on leave for a given date */
  getLeavePeriods(date) {
    const d = date instanceof Date ? date : new Date(date);
    const dayNum = d.getDay() === 0 ? 0 : d.getDay();
    const dayName = Utils.DAY_MAP[dayNum] || 'Monday';
    if (dayNum === 0) return [];
    const map = this.getAttendanceMap(d);
    const leaveIds = new Set(
      (this.data.teachers || [])
        .filter(t => t.status === 'active' && (map[t.id] || 'present') === 'leave')
        .map(t => t.id)
    );
    if (!leaveIds.size) return [];

    const periods = this.getPeriodsForDay(dayName).filter(p => p.type === 'period');
    const result = [];
    (this.data.timetable || []).forEach(tt => {
      if (!leaveIds.has(tt.teacherId)) return;
      if (!Utils.dayMatches(tt.days, dayNum)) return;
      const period = periods.find(p => p.id === tt.period);
      if (!period) return;
      const existingSub = (this.data.substitutions || []).find(
        s => s.date === this.dateKey(d) && s.originalEntryId === tt.id
      );
      result.push({
        entry: tt,
        period,
        class: this.getClassById(tt.classId),
        teacher: this.getTeacherById(tt.teacherId),
        subject: this.getSubjectById(tt.subjectId),
        substitution: existingSub || null
      });
    });
    // sort by period start then class
    result.sort((a, b) => {
      const ta = Utils.timeToMinutes(a.period.start);
      const tb = Utils.timeToMinutes(b.period.start);
      if (ta !== tb) return ta - tb;
      return (a.class?.name || '').localeCompare(b.class?.name || '');
    });
    return result;
  },

  /** Teachers free in a period on a date (present, not teaching, not already substitute) */
  getFreeTeachersForPeriod(periodId, date, excludeTeacherId) {
    const d = date instanceof Date ? date : new Date(date);
    const dayNum = d.getDay() === 0 ? 0 : d.getDay();
    const dateStr = this.dateKey(d);
    const map = this.getAttendanceMap(d);

    const busyIds = new Set();
    (this.data.timetable || []).forEach(tt => {
      if (tt.period !== periodId) return;
      if (!Utils.dayMatches(tt.days, dayNum)) return;
      // skip if this teacher is on leave (their slot is open)
      if ((map[tt.teacherId] || 'present') === 'leave') return;
      busyIds.add(tt.teacherId);
    });
    (this.data.substitutions || []).forEach(s => {
      if (s.date !== dateStr || s.period !== periodId) return;
      if (s.substituteTeacherId) busyIds.add(s.substituteTeacherId);
    });

    return (this.data.teachers || []).filter(t => {
      if (t.status !== 'active') return false;
      if (excludeTeacherId && t.id === excludeTeacherId) return false;
      if ((map[t.id] || 'present') === 'leave') return false;
      if (busyIds.has(t.id)) return false;
      return true;
    });
  },

  getSubstitutionsForDate(date) {
    const key = this.dateKey(date);
    return (this.data.substitutions || []).filter(s => s.date === key);
  },

  upsertSubstitution(sub) {
    if (!this.data.substitutions) this.data.substitutions = [];
    const idx = this.data.substitutions.findIndex(
      s => s.date === sub.date && s.originalEntryId === sub.originalEntryId
    );
    if (idx >= 0) this.data.substitutions[idx] = sub;
    else this.data.substitutions.push(sub);
  },

  removeSubstitution(id) {
    this.data.substitutions = (this.data.substitutions || []).filter(s => s.id !== id);
  },

  startClock() {
    if (this.clockInterval) clearInterval(this.clockInterval);
    this.clockInterval = setInterval(() => this.tick(), 1000);
    this.tick();
  },

  tick() {
    const now = new Date();
    const sec = now.getSeconds();
    if (sec === this.lastSecond) return;
    this.lastSecond = sec;

    // Update UI elements that exist
    const clockEl = document.getElementById('live-clock');
    if (clockEl) clockEl.textContent = Utils.formatTime(now);

    const dateEl = document.getElementById('live-date');
    if (dateEl) dateEl.textContent = Utils.formatDate(now);

    // Dashboard updates
    if (typeof Dashboard !== 'undefined' && this.currentPage === 'dashboard') {
      Dashboard.updateLive(now);
    }
    if (typeof BellSystem !== 'undefined') {
      BellSystem.checkAndRing(now);
    }
  }
};
