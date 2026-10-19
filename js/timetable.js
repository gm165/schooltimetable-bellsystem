/**
 * Class-wise, Teacher-wise views & Timetable Editor
 */
const TimetableUI = {
  selectedClass: 'all',
  selectedTeacher: 'T005',
  selectedDay: null,

  renderClassWise() {
    const classes = AppState.data.classes.filter(c => c.active);
    const dayNum = this.selectedDay != null ? this.selectedDay : (new Date().getDay() || 6);
    const dayName = Utils.DAY_MAP[dayNum] || 'Monday';
    const showAll = this.selectedClass === 'all';

    const options = `<option value="all" ${showAll ? 'selected' : ''}>All Classes</option>` +
      classes.map(c =>
        `<option value="${c.id}" ${c.id === this.selectedClass ? 'selected' : ''}>${Utils.escapeHtml(c.name)}</option>`
      ).join('');

    const dayOpts = [1,2,3,4,5,6].map(d =>
      `<option value="${d}" ${d === dayNum ? 'selected' : ''}>${Utils.DAY_MAP[d]}</option>`
    ).join('');

    const school = AppState.data.school;
    // Class-wise: only Period 1–9 + Break (hide Assembly, School Over, activity)
    const periods = AppState.getPeriodsForDay(dayName).filter(
      p => p.type === 'period' || p.type === 'break'
    );

    // Classes to display: all or single
    const displayClasses = showAll ? classes : classes.filter(c => c.id === this.selectedClass);

    const headerCells = periods.map(p => `
      <th>
        ${Utils.escapeHtml(p.name)}
        <div class="period-time">${p.start} – ${p.end}</div>
      </th>
    `).join('');

    const bodyRows = displayClasses.map(cls => {
      const tt = AppState.getClassTimetable(cls.id, dayNum);
      const rows = tt.rows.filter(r => r.period.type === 'period' || r.period.type === 'break');
      return `
        <tr>
          <td style="font-weight:600;background:var(--bg);white-space:nowrap">${Utils.escapeHtml(cls.name)}</td>
          ${rows.map(r => {
            if (r.isBreak || r.period.type === 'break') {
              return `<td class="tt-break">${Utils.escapeHtml(r.period.name)}</td>`;
            }
            if (!r.entries.length) {
              return `<td class="tt-cell empty" onclick="TimetableUI.openEditor('${cls.id}','${r.period.id}')">—</td>`;
            }
            const dualClass = r.entries.length > 1 ? ' dual' : '';
            return `<td class="tt-cell${dualClass}">
              ${r.entries.map((e, i) => `
                <div class="tt-entry" onclick="event.stopPropagation();TimetableUI.editEntry('${e.id}')" title="Edit this entry">
                  <div class="teacher urdu">${Utils.escapeHtml(e.teacher?.name || '')}</div>
                  <div class="subject urdu">${Utils.escapeHtml(e.subject?.name || '')}</div>
                  ${e.days && e.days !== '1-6' ? `<div class="days-tag">${Utils.escapeHtml(e.days)}</div>` : ''}
                  ${e.notes && String(e.notes).toLowerCase().includes('alt') ? '<div class="alt-tag">alt</div>' : ''}
                </div>
                ${i < r.entries.length - 1 ? '<hr class="tt-dual-sep">' : ''}
              `).join('')}
              <button type="button" class="btn-add-dual" title="Add second teacher/subject in this period"
                onclick="event.stopPropagation();TimetableUI.openEditor('${cls.id}','${r.period.id}',true)">+ dual</button>
            </td>`;
          }).join('')}
        </tr>`;
    }).join('');

    const gridHtml = `
      <div class="table-wrap">
        <table class="tt-grid">
          <thead>
            <tr>
              <th>CLASS</th>
              ${headerCells}
            </tr>
          </thead>
          <tbody>
            ${bodyRows || '<tr><td colspan="20" class="text-muted">No classes found</td></tr>'}
          </tbody>
        </table>
      </div>
    `;

    const addClassId = showAll ? (classes[0]?.id || '') : this.selectedClass;

    return `
      <div class="card mb-2 no-print">
        <div class="card-body flex gap-1 flex-wrap items-center justify-between">
          <div class="flex gap-1 flex-wrap items-center">
            <label class="form-label" style="margin:0">Class</label>
            <select class="form-select" style="width:auto;min-width:140px" onchange="TimetableUI.selectedClass=this.value;App.refresh()">
              ${options}
            </select>
            <label class="form-label" style="margin:0">Day</label>
            <select class="form-select" style="width:auto" onchange="TimetableUI.selectedDay=Number(this.value);App.refresh()">
              ${dayOpts}
            </select>
          </div>
          <div class="flex gap-1">
            <button class="btn btn-primary btn-sm" onclick="TimetableUI.openEditor('${addClassId}')">+ Add Entry</button>
            <button class="btn btn-sm" onclick="window.print()">Print</button>
            <button class="btn btn-sm" onclick="TimetableUI.exportClassCSV()">Export CSV</button>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-header">
          <div>
            <div>${Utils.escapeHtml(school.name)}</div>
            <div class="text-sm text-muted">CLASS WISE TIME TABLE · ${Utils.escapeHtml(school.session)} · ${dayName}${showAll ? ' · All Classes' : ''}</div>
          </div>
        </div>
        <div class="card-body">${gridHtml}</div>
      </div>
    `;
  },

  renderTeacherWise() {
    const teachers = AppState.data.teachers.filter(t => t.status === 'active');
    const dayNum = this.selectedDay != null ? this.selectedDay : (new Date().getDay() || 6);
    const dayName = Utils.DAY_MAP[dayNum] || 'Monday';
    const options = teachers.map(t =>
      `<option value="${t.id}" ${t.id === this.selectedTeacher ? 'selected' : ''}>${Utils.escapeHtml(t.name)}</option>`
    ).join('');
    const dayOpts = [1,2,3,4,5,6].map(d =>
      `<option value="${d}" ${d === dayNum ? 'selected' : ''}>${Utils.DAY_MAP[d]}</option>`
    ).join('');

    // All teachers summary — only Period 1–9 + Break (hide Assembly / School Over / activity)
    const workload = AppState.getAllTeachersWorkload(dayNum);
    const school = AppState.data.school;
    const twPeriods = AppState.getPeriodsForDay(dayName).filter(
      p => p.type === 'period' || p.type === 'break'
    );

    let allTable = `
      <div class="table-wrap mb-2">
        <table class="data-table">
          <thead>
            <tr>
              <th>#</th><th>Teacher</th>
              ${twPeriods.map(p => `<th>${Utils.escapeHtml(p.name)}<div class="period-time text-xs">${p.start}–${p.end}</div></th>`).join('')}
              <th>Periods</th>
            </tr>
          </thead>
          <tbody>
            ${workload.map((w, i) => {
              const tt = AppState.getTeacherTimetable(w.teacher.id, dayNum);
              const rows = tt.rows.filter(r => r.period.type === 'period' || r.period.type === 'break');
              return `<tr style="cursor:pointer" onclick="TimetableUI.selectedTeacher='${w.teacher.id}';App.refresh()">
                <td>${i + 1}</td>
                <td class="urdu font-bold">${Utils.escapeHtml(w.teacher.name)}</td>
                ${rows.map(r => {
                  if (r.period.type === 'break' || r.isBreak) {
                    return `<td class="tt-break text-xs">${Utils.escapeHtml(r.period.name)}</td>`;
                  }
                  if (!r.entries.length) return '<td class="text-muted">—</td>';
                  return `<td class="text-xs urdu">${r.entries.map(e =>
                    `${Utils.escapeHtml(e.subject?.name || '')}<br><span class="text-muted">${Utils.escapeHtml(e.class?.name || '')}</span>`
                  ).join('<hr class="tt-dual-sep">')}</td>`;
                }).join('')}
                <td><strong>${w.periods}</strong></td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;

    return `
      <div class="card mb-2 no-print">
        <div class="card-body flex gap-1 flex-wrap items-center justify-between">
          <div class="flex gap-1 items-center flex-wrap">
            <label class="form-label" style="margin:0">Focus Teacher</label>
            <select class="form-select" style="width:auto;min-width:180px" onchange="TimetableUI.selectedTeacher=this.value;App.refresh()">
              ${options}
            </select>
            <label class="form-label" style="margin:0">Day</label>
            <select class="form-select" style="width:auto" onchange="TimetableUI.selectedDay=Number(this.value);App.refresh()">
              ${dayOpts}
            </select>
          </div>
          <div class="flex gap-1">
            <button class="btn btn-sm" onclick="window.print()">Print</button>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-header">
          <div>
            <div>${Utils.escapeHtml(school.name)}</div>
            <div class="text-sm text-muted">TEACHER WISE TIME TABLE · ${Utils.escapeHtml(school.session)} · ${dayName}</div>
          </div>
        </div>
        <div class="card-body">${allTable}</div>
      </div>
    `;
  },

  renderEditor() {
    const classes = AppState.data.classes.filter(c => c.active);
    const teachers = AppState.data.teachers.filter(t => t.status === 'active');
    const subjects = AppState.data.subjects.filter(s => s.active);
    const periods = AppState.data.periodTemplates.default.filter(p => p.type === 'period');

    return `
      <div class="card" style="max-width:640px">
        <div class="card-header">Timetable Entry Editor</div>
        <div class="card-body">
          <input type="hidden" id="ed-id" value="">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Days (e.g. 1-6, 1-5, 6, 1-4,6)</label>
              <input class="form-control" id="ed-days" value="1-6" placeholder="1-6">
            </div>
            <div class="form-group">
              <label class="form-label">Class</label>
              <select class="form-select" id="ed-class">
                ${classes.map(c => `<option value="${c.id}">${Utils.escapeHtml(c.name)}</option>`).join('')}
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Period</label>
              <select class="form-select" id="ed-period">
                ${periods.map(p => `<option value="${p.id}">${Utils.escapeHtml(p.name)} (${p.start}–${p.end})</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Teacher</label>
              <select class="form-select" id="ed-teacher">
                ${teachers.map(t => `<option value="${t.id}">${Utils.escapeHtml(t.name)}</option>`).join('')}
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Subject</label>
              <select class="form-select" id="ed-subject">
                ${subjects.map(s => `<option value="${s.id}">${Utils.escapeHtml(s.name)}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Room</label>
              <input class="form-control" id="ed-room" placeholder="Room">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label" style="display:flex;align-items:center;gap:.5rem;cursor:pointer">
              <input type="checkbox" id="ed-dual" onchange="TimetableUI.onDualToggle()">
              <span>Dual / Alternative subject (same class &amp; period)</span>
            </label>
            <div class="text-sm text-muted" style="margin-top:.25rem">
              Use for two subjects in one period (e.g. Computer + Biology). Marks this entry as <code>alt</code> so it shares the cell without conflict.
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Notes</label>
            <input class="form-control" id="ed-notes" placeholder="Optional notes">
          </div>
          <div id="ed-conflicts" class="mb-1"></div>
          <div class="flex gap-1">
            <button class="btn btn-primary" onclick="TimetableUI.saveEntry()">Save</button>
            <button class="btn btn-danger" onclick="TimetableUI.deleteEntry()">Delete</button>
            <button class="btn" onclick="App.navigate('class-wise')">Cancel</button>
          </div>
        </div>
      </div>
      <div class="card mt-2">
        <div class="card-header">All Timetable Entries (${AppState.data.timetable.length})</div>
        <div class="card-body">
          <div class="table-wrap" style="max-height:400px;overflow-y:auto">
            <table class="data-table">
              <thead><tr><th>Days</th><th>Class</th><th>Period</th><th>Teacher</th><th>Subject</th><th></th></tr></thead>
              <tbody>
                ${AppState.data.timetable.map(tt => `
                  <tr>
                    <td>${Utils.escapeHtml(tt.days)}</td>
                    <td>${Utils.escapeHtml(AppState.getClassById(tt.classId)?.name || '')}</td>
                    <td>${Utils.escapeHtml(tt.period)}</td>
                    <td class="urdu">${Utils.escapeHtml(AppState.getTeacherById(tt.teacherId)?.name || '')}</td>
                    <td class="urdu">${Utils.escapeHtml(AppState.getSubjectById(tt.subjectId)?.name || '')}</td>
                    <td><button class="btn btn-sm" onclick="TimetableUI.editEntry('${tt.id}')">Edit</button></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  openEditor(classId, periodId, asDual) {
    App.navigate('tt-editor');
    setTimeout(() => {
      document.getElementById('ed-id').value = '';
      if (classId) document.getElementById('ed-class').value = classId;
      if (periodId) document.getElementById('ed-period').value = periodId;
      const dual = !!asDual;
      const dualEl = document.getElementById('ed-dual');
      if (dualEl) dualEl.checked = dual;
      const notesEl = document.getElementById('ed-notes');
      if (notesEl) {
        if (dual) {
          const n = (notesEl.value || '').trim();
          notesEl.value = n.toLowerCase().includes('alt') ? n : (n ? n + ' alt' : 'alt');
        }
      }
    }, 50);
  },

  onDualToggle() {
    const dual = document.getElementById('ed-dual')?.checked;
    const notesEl = document.getElementById('ed-notes');
    if (!notesEl) return;
    let n = (notesEl.value || '').trim();
    if (dual) {
      if (!n.toLowerCase().includes('alt')) notesEl.value = n ? n + ' alt' : 'alt';
    } else {
      notesEl.value = n.replace(/\balt\b/gi, '').replace(/\s{2,}/g, ' ').trim();
    }
  },

  editEntry(id) {
    const tt = AppState.data.timetable.find(t => t.id === id);
    if (!tt) return;
    App.navigate('tt-editor');
    setTimeout(() => {
      document.getElementById('ed-id').value = tt.id;
      document.getElementById('ed-days').value = tt.days;
      document.getElementById('ed-class').value = tt.classId;
      document.getElementById('ed-period').value = tt.period;
      document.getElementById('ed-teacher').value = tt.teacherId;
      document.getElementById('ed-subject').value = tt.subjectId;
      document.getElementById('ed-room').value = tt.room || '';
      document.getElementById('ed-notes').value = tt.notes || '';
      const isDual = !!(tt.notes && String(tt.notes).toLowerCase().includes('alt'));
      const dualEl = document.getElementById('ed-dual');
      if (dualEl) dualEl.checked = isDual;
    }, 50);
  },

  async saveEntry() {
    const id = document.getElementById('ed-id').value || Utils.uid('TT');
    let notes = document.getElementById('ed-notes').value.trim();
    const dual = document.getElementById('ed-dual')?.checked;
    if (dual && !notes.toLowerCase().includes('alt')) {
      notes = notes ? notes + ' alt' : 'alt';
    }
    if (!dual && notes.toLowerCase().includes('alt')) {
      // keep notes as typed if user unchecked but left alt text — still treat as dual via notes
    }
    const entry = {
      id,
      days: document.getElementById('ed-days').value.trim() || '1-6',
      classId: document.getElementById('ed-class').value,
      period: document.getElementById('ed-period').value,
      teacherId: document.getElementById('ed-teacher').value,
      subjectId: document.getElementById('ed-subject').value,
      room: document.getElementById('ed-room').value.trim(),
      notes
    };
    const conflicts = AppState.findConflicts(entry);
    const box = document.getElementById('ed-conflicts');
    if (conflicts.length) {
      box.innerHTML = `<div class="badge badge-danger" style="display:block;padding:.75rem;white-space:normal">
        CONFLICTS DETECTED:<br>${conflicts.map(c => Utils.escapeHtml(c.message)).join('<br>')}
        <br><button class="btn btn-sm btn-warning mt-1" onclick="TimetableUI.forceSave()">Save Anyway</button>
      </div>`;
      this._pendingEntry = entry;
      return;
    }
    this._commitEntry(entry);
  },

  forceSave() {
    if (this._pendingEntry) this._commitEntry(this._pendingEntry);
  },

  async _commitEntry(entry) {
    const idx = AppState.data.timetable.findIndex(t => t.id === entry.id);
    if (idx >= 0) AppState.data.timetable[idx] = entry;
    else AppState.data.timetable.push(entry);
    await AppState.save('Timetable updated');
    Utils.toast('Timetable entry saved', 'success');
    this._pendingEntry = null;
    App.navigate('class-wise');
  },

  async deleteEntry() {
    const id = document.getElementById('ed-id').value;
    if (!id) { Utils.toast('No entry selected', 'warning'); return; }
    if (!Utils.confirm('Delete this timetable entry?')) return;
    AppState.data.timetable = AppState.data.timetable.filter(t => t.id !== id);
    await AppState.save('Timetable entry deleted');
    Utils.toast('Deleted', 'success');
    App.navigate('class-wise');
  },

  exportClassCSV() {
    const dayNum = this.selectedDay != null ? this.selectedDay : (new Date().getDay() || 6);
    const classes = AppState.data.classes.filter(c => c.active);
    const exportList = this.selectedClass === 'all'
      ? classes
      : classes.filter(c => c.id === this.selectedClass);

    let csv = 'Class,Period,Start,End,Teacher,Subject,Days\n';
    exportList.forEach(cls => {
      const tt = AppState.getClassTimetable(cls.id, dayNum);
      tt.rows.forEach(r => {
        if (r.isBreak) {
          csv += `"${cls.name}","${r.period.name}","${r.period.start}","${r.period.end}","—","—","—"\n`;
        } else if (!r.entries.length) {
          csv += `"${cls.name}","${r.period.name}","${r.period.start}","${r.period.end}","","",""\n`;
        } else {
          r.entries.forEach(e => {
            csv += `"${cls.name}","${r.period.name}","${r.period.start}","${r.period.end}","${e.teacher?.name || ''}","${e.subject?.name || ''}","${e.days || ''}"\n`;
          });
        }
      });
    });
    const label = this.selectedClass === 'all' ? 'all-classes' : (exportList[0]?.name || 'class');
    Utils.downloadText(`${label}-timetable.csv`, csv, 'text/csv');
  }
};
