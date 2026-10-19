/**
 * Teachers, Subjects, Classes, Settings, Backup, Bell settings, Reports
 */
const Management = {
  renderTeachers() {
    const list = AppState.data.teachers;
    return `
      <div class="card mb-2 no-print">
        <div class="card-body flex justify-between items-center flex-wrap gap-1">
          <input class="form-control" style="max-width:240px" placeholder="Search teacher…" id="teacher-search" oninput="Management.filterTeachers()">
          <button class="btn btn-primary" onclick="Management.showTeacherForm()">+ Add Teacher</button>
        </div>
      </div>
      <div class="card">
        <div class="card-header">Staff List (${list.length})</div>
        <div class="card-body">
          <div class="table-wrap">
            <table class="data-table" id="teachers-table">
              <thead><tr><th>#</th><th>Teacher</th><th>Subject(s)</th><th>Classes</th><th>Phone</th><th>Availability</th><th>Status</th><th></th></tr></thead>
              <tbody>
                ${list.map((t, i) => `
                  <tr data-name="${Utils.escapeHtml(t.name)}">
                    <td>${i + 1}</td>
                    <td class="urdu font-bold">${Utils.escapeHtml(t.name)}</td>
                    <td class="urdu text-sm">${Utils.escapeHtml(t.subject)}</td>
                    <td class="text-sm">${(t.classes || []).join(', ')}</td>
                    <td class="text-sm">${Utils.escapeHtml(t.phone || '—')}</td>
                    <td>${Utils.escapeHtml(t.availability || '')}</td>
                    <td><span class="badge ${t.status === 'active' ? 'badge-success' : 'badge-muted'}">${t.status}</span></td>
                    <td>
                      <button class="btn btn-sm" onclick="Management.showTeacherForm('${t.id}')">Edit</button>
                      <button class="btn btn-sm btn-danger" onclick="Management.deleteTeacher('${t.id}')">Del</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  filterTeachers() {
    const q = (document.getElementById('teacher-search')?.value || '').toLowerCase();
    document.querySelectorAll('#teachers-table tbody tr').forEach(tr => {
      const name = (tr.dataset.name || '').toLowerCase();
      tr.style.display = name.includes(q) ? '' : 'none';
    });
  },

  showTeacherForm(id) {
    const t = id ? AppState.getTeacherById(id) : { id: '', name: '', subject: '', classes: [], phone: '', availability: '1-6', status: 'active' };
    const html = `
      <div class="modal-overlay show" id="modal">
        <div class="modal">
          <div class="modal-header">${id ? 'Edit' : 'Add'} Teacher <button class="btn btn-ghost btn-sm" onclick="document.getElementById('modal').remove()">✕</button></div>
          <div class="modal-body">
            <input type="hidden" id="tf-id" value="${t.id}">
            <div class="form-group"><label class="form-label">Name (Urdu)</label><input class="form-control urdu" id="tf-name" value="${Utils.escapeHtml(t.name)}"></div>
            <div class="form-group"><label class="form-label">Subject(s)</label><input class="form-control urdu" id="tf-subject" value="${Utils.escapeHtml(t.subject)}"></div>
            <div class="form-group"><label class="form-label">Classes (comma separated)</label><input class="form-control" id="tf-classes" value="${(t.classes||[]).join(', ')}"></div>
            <div class="form-group"><label class="form-label">WhatsApp / Mobile</label>
              <input class="form-control" id="tf-phone" value="${Utils.escapeHtml(t.phone || '')}" placeholder="03XXXXXXXXX or 923XXXXXXXXX">
              <div class="text-xs text-muted mt-1">Used to notify when this teacher is assigned as substitute</div>
            </div>
            <div class="form-group"><label class="form-label">Availability</label><input class="form-control" id="tf-avail" value="${Utils.escapeHtml(t.availability||'1-6')}"></div>
            <div class="form-group"><label class="form-label">Status</label>
              <select class="form-select" id="tf-status"><option value="active" ${t.status==='active'?'selected':''}>Active</option><option value="inactive" ${t.status==='inactive'?'selected':''}>Inactive</option></select>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn" onclick="document.getElementById('modal').remove()">Cancel</button>
            <button class="btn btn-primary" onclick="Management.saveTeacher()">Save</button>
          </div>
        </div>
      </div>`;
    document.body.insertAdjacentHTML('beforeend', html);
  },

  async saveTeacher() {
    const id = document.getElementById('tf-id').value || Utils.uid('T');
    const entry = {
      id,
      name: document.getElementById('tf-name').value.trim(),
      subject: document.getElementById('tf-subject').value.trim(),
      classes: document.getElementById('tf-classes').value.split(',').map(s => s.trim()).filter(Boolean),
      phone: document.getElementById('tf-phone').value.trim(),
      availability: document.getElementById('tf-avail').value.trim(),
      status: document.getElementById('tf-status').value
    };
    // preserve other fields if editing
    const prevT = AppState.getTeacherById(id);
    if (prevT) Object.assign(entry, { ...prevT, ...entry });
    if (!entry.name) { Utils.toast('Name required', 'error'); return; }
    const idx = AppState.data.teachers.findIndex(t => t.id === id);
    if (idx >= 0) AppState.data.teachers[idx] = entry;
    else AppState.data.teachers.push(entry);
    await AppState.save('Teacher saved');
    document.getElementById('modal')?.remove();
    App.refresh();
  },

  async deleteTeacher(id) {
    if (!Utils.confirm('Delete this teacher?')) return;
    AppState.data.teachers = AppState.data.teachers.filter(t => t.id !== id);
    await AppState.save('Teacher deleted');
    App.refresh();
  },

  renderSubjects() {
    const list = AppState.data.subjects;
    return `
      <div class="card mb-2 no-print">
        <div class="card-body flex justify-between">
          <span class="text-muted">${list.length} subjects</span>
          <button class="btn btn-primary" onclick="Management.showSubjectForm()">+ Add Subject</button>
        </div>
      </div>
      <div class="card">
        <div class="card-body">
          <div class="table-wrap">
            <table class="data-table">
              <thead><tr><th>#</th><th>Name</th><th>Short</th><th>Code</th><th>Status</th><th></th></tr></thead>
              <tbody>
                ${list.map((s, i) => `
                  <tr>
                    <td>${i+1}</td>
                    <td class="urdu"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${s.color};margin-right:6px"></span>${Utils.escapeHtml(s.name)}</td>
                    <td>${Utils.escapeHtml(s.shortName)}</td>
                    <td>${Utils.escapeHtml(s.code)}</td>
                    <td><span class="badge ${s.active?'badge-success':'badge-muted'}">${s.active?'Active':'Off'}</span></td>
                    <td><button class="btn btn-sm" onclick="Management.showSubjectForm('${s.id}')">Edit</button></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  showSubjectForm(id) {
    const s = id ? AppState.getSubjectById(id) : { id: '', name: '', shortName: '', code: '', color: '#64748b', active: true };
    document.body.insertAdjacentHTML('beforeend', `
      <div class="modal-overlay show" id="modal">
        <div class="modal">
          <div class="modal-header">${id?'Edit':'Add'} Subject <button class="btn btn-ghost btn-sm" onclick="document.getElementById('modal').remove()">✕</button></div>
          <div class="modal-body">
            <input type="hidden" id="sf-id" value="${s.id}">
            <div class="form-group"><label class="form-label">Name</label><input class="form-control urdu" id="sf-name" value="${Utils.escapeHtml(s.name)}"></div>
            <div class="form-row">
              <div class="form-group"><label class="form-label">Short</label><input class="form-control" id="sf-short" value="${Utils.escapeHtml(s.shortName)}"></div>
              <div class="form-group"><label class="form-label">Code</label><input class="form-control" id="sf-code" value="${Utils.escapeHtml(s.code)}"></div>
              <div class="form-group"><label class="form-label">Color</label><input type="color" class="form-control" id="sf-color" value="${s.color}"></div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn" onclick="document.getElementById('modal').remove()">Cancel</button>
            <button class="btn btn-primary" onclick="Management.saveSubject()">Save</button>
          </div>
        </div>
      </div>`);
  },

  async saveSubject() {
    const id = document.getElementById('sf-id').value || Utils.uid('S');
    const entry = {
      id,
      name: document.getElementById('sf-name').value.trim(),
      shortName: document.getElementById('sf-short').value.trim(),
      code: document.getElementById('sf-code').value.trim(),
      color: document.getElementById('sf-color').value,
      active: true
    };
    const idx = AppState.data.subjects.findIndex(s => s.id === id);
    if (idx >= 0) AppState.data.subjects[idx] = { ...AppState.data.subjects[idx], ...entry };
    else AppState.data.subjects.push(entry);
    await AppState.save('Subject saved');
    document.getElementById('modal')?.remove();
    App.refresh();
  },

  renderClasses() {
    const list = AppState.data.classes;
    return `
      <div class="card mb-2 no-print">
        <div class="card-body flex justify-between">
          <span class="text-muted">${list.length} classes</span>
          <button class="btn btn-primary" onclick="Management.showClassForm()">+ Add Class</button>
        </div>
      </div>
      <div class="card">
        <div class="card-body">
          <table class="data-table">
            <thead><tr><th>#</th><th>Class</th><th>Section</th><th>Class Teacher</th><th>Room</th><th>Status</th><th></th></tr></thead>
            <tbody>
              ${list.map((c, i) => `
                <tr>
                  <td>${i+1}</td>
                  <td class="font-bold">${Utils.escapeHtml(c.name)}</td>
                  <td>${Utils.escapeHtml(c.section || '—')}</td>
                  <td class="urdu">${Utils.escapeHtml(AppState.getTeacherById(c.classTeacher)?.name || '—')}</td>
                  <td>${Utils.escapeHtml(c.room || '')}</td>
                  <td><span class="badge ${c.active?'badge-success':'badge-muted'}">${c.active?'Active':'Off'}</span></td>
                  <td><button class="btn btn-sm" onclick="Management.showClassForm('${c.id}')">Edit</button></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  showClassForm(id) {
    const c = id ? AppState.getClassById(id) : { id: '', name: '', section: '', classTeacher: '', room: '', active: true };
    const teachers = AppState.data.teachers.filter(t => t.status === 'active');
    document.body.insertAdjacentHTML('beforeend', `
      <div class="modal-overlay show" id="modal">
        <div class="modal">
          <div class="modal-header">${id?'Edit':'Add'} Class <button class="btn btn-ghost btn-sm" onclick="document.getElementById('modal').remove()">✕</button></div>
          <div class="modal-body">
            <input type="hidden" id="cf-id" value="${c.id}">
            <div class="form-row">
              <div class="form-group"><label class="form-label">Class Name</label><input class="form-control" id="cf-name" value="${Utils.escapeHtml(c.name)}"></div>
              <div class="form-group"><label class="form-label">Section</label><input class="form-control" id="cf-section" value="${Utils.escapeHtml(c.section||'')}"></div>
            </div>
            <div class="form-row">
              <div class="form-group"><label class="form-label">Class Teacher</label>
                <select class="form-select" id="cf-teacher">
                  <option value="">—</option>
                  ${teachers.map(t => `<option value="${t.id}" ${t.id===c.classTeacher?'selected':''}>${Utils.escapeHtml(t.name)}</option>`).join('')}
                </select>
              </div>
              <div class="form-group"><label class="form-label">Room</label><input class="form-control" id="cf-room" value="${Utils.escapeHtml(c.room||'')}"></div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn" onclick="document.getElementById('modal').remove()">Cancel</button>
            <button class="btn btn-primary" onclick="Management.saveClass()">Save</button>
          </div>
        </div>
      </div>`);
  },

  async saveClass() {
    const id = document.getElementById('cf-id').value || Utils.uid('C');
    const entry = {
      id,
      name: document.getElementById('cf-name').value.trim(),
      section: document.getElementById('cf-section').value.trim(),
      classTeacher: document.getElementById('cf-teacher').value,
      room: document.getElementById('cf-room').value.trim(),
      students: 0,
      active: true
    };
    const idx = AppState.data.classes.findIndex(c => c.id === id);
    if (idx >= 0) AppState.data.classes[idx] = { ...AppState.data.classes[idx], ...entry };
    else AppState.data.classes.push(entry);
    await AppState.save('Class saved');
    document.getElementById('modal')?.remove();
    App.refresh();
  },

  renderBellSettings() {
    const s = AppState.data.bellSettings;
    const periods = AppState.data.periodTemplates.default || [];
    const friday = AppState.data.periodTemplates.Friday || [];

    const periodRows = (list, templateKey) => list.map((p, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${Utils.escapeHtml(p.name)}</td>
        <td>${p.start}</td>
        <td>${p.end}</td>
        <td>${p.duration || '—'} min</td>
        <td><span class="badge badge-muted">${p.type}</span></td>
        <td>${p.bell ? '✓' : '—'}</td>
        <td>${p.active !== false ? '<span class="badge badge-success">Yes</span>' : '<span class="badge badge-muted">No</span>'}</td>
        <td>
          <button class="btn btn-sm" onclick="Management.editPeriod('${templateKey}',${i})">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="Management.deletePeriod('${templateKey}',${i})">Del</button>
        </td>
      </tr>
    `).join('');

    return `
      <div class="grid grid-2 mb-2">
        <div class="card">
          <div class="card-header">Bell Durations & Modes</div>
          <div class="card-body">
            <div class="form-group"><label class="form-label">Normal Period Bell (seconds)</label>
              <input type="number" class="form-control" id="bs-normal" value="${s.normalDuration}" min="1" max="60"></div>
            <div class="form-group"><label class="form-label">Assembly Bell (seconds)</label>
              <input type="number" class="form-control" id="bs-assembly" value="${s.assemblyDuration}" min="1" max="60"></div>
            <div class="form-group"><label class="form-label">Break START Bell (sec)</label>
              <input type="number" class="form-control" id="bs-break" value="${s.breakDuration || 15}" min="1" max="120"></div>
            <div class="form-group"><label class="form-label">Break END Bell (sec) — long ring when break finishes</label>
              <input type="number" class="form-control" id="bs-break-end" value="${s.breakEndDuration || 20}" min="1" max="120"></div>
            <div class="form-group"><label class="form-label">Special / Activity Bell (seconds)</label>
              <input type="number" class="form-control" id="bs-special" value="${s.specialDuration}" min="1" max="60"></div>
            <div class="form-group"><label class="form-label">Assembly Mode</label>
              <select class="form-select" id="bs-asm-mode">
                <option value="single" ${s.assemblyMode==='single'?'selected':''}>Single Ring</option>
                <option value="continuous" ${s.assemblyMode==='continuous'?'selected':''}>Continuous Ring</option>
              </select></div>
            <div class="form-group"><label class="form-label">Break Mode</label>
              <select class="form-select" id="bs-brk-mode">
                <option value="single" ${s.breakMode==='single'?'selected':''}>Single Ring</option>
                <option value="continuous" ${s.breakMode==='continuous'?'selected':''}>Continuous Ring</option>
              </select></div>
            <div class="form-group"><label class="form-label">Bell Ring Speed (tan-tan tempo)</label>
              <select class="form-select" id="bs-ring-speed">
                <option value="slow" ${s.ringSpeed==='slow'?'selected':''}>Slow — calm tan … tan</option>
                <option value="normal" ${!s.ringSpeed||s.ringSpeed==='normal'?'selected':''}>Normal — classic school bell</option>
                <option value="fast" ${s.ringSpeed==='fast'?'selected':''}>Fast — quick tan-tan</option>
              </select>
            </div>
            <div class="form-group"><label class="form-label">Continuous Total Duration (sec)</label>
              <input type="number" class="form-control" id="bs-cont-total" value="${s.continuousTotalDuration}" min="5" max="120"></div>
            <div class="form-group"><label class="form-label">Ring Interval between pairs (sec)</label>
              <input type="number" class="form-control" id="bs-interval" value="${s.breakRingInterval}" min="1" max="30" step="0.5">
              <div class="text-xs text-muted mt-1">How often tan-tan repeats during continuous / break rings</div>
            </div>
            <div class="flex gap-1 flex-wrap">
              <button class="btn btn-primary" onclick="Management.saveBellSettings()">Save Settings</button>
              <button class="btn btn-warning" onclick="BellSystem.testBell()">Test Bell</button>
              <button class="btn btn-accent" onclick="BellSystem.unlock(true)">Unlock Sound</button>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card-header">Bell Sound</div>
          <div class="card-body">
            <div class="form-group">
              <label class="form-label">Sound Source</label>
              <select class="form-select" id="bs-sound-type" onchange="BellSystem.setSoundType(this.value)">
                <option value="default" ${s.soundType!=='custom'?'selected':''}>Default patterns (built-in)</option>
                <option value="custom" ${s.soundType==='custom'?'selected':''}>Custom uploaded sounds</option>
              </select>
            </div>
            <p class="text-xs text-muted mb-1">Default: Period N = N rings · Assembly = triple pattern · Break = rapid double pattern (max 30s, not full period length)</p>
            <div class="form-group">
              <label class="form-label">Period bell sound (optional)</label>
              <input type="file" class="form-control" accept="audio/*,.mp3,.wav,.ogg"
                onchange="if(this.files[0]) BellSystem.uploadSoundFor('period', this.files[0])">
              ${s.soundPeriodName ? `<div class="text-sm mt-1">${Utils.escapeHtml(s.soundPeriodName)} <button class="btn btn-sm btn-danger" onclick="BellSystem.clearCustomSound('period')">Remove</button></div>` : ''}
            </div>
            <div class="form-group">
              <label class="form-label">Assembly bell sound (optional)</label>
              <input type="file" class="form-control" accept="audio/*,.mp3,.wav,.ogg"
                onchange="if(this.files[0]) BellSystem.uploadSoundFor('assembly', this.files[0])">
              ${s.soundAssemblyName ? `<div class="text-sm mt-1">${Utils.escapeHtml(s.soundAssemblyName)} <button class="btn btn-sm btn-danger" onclick="BellSystem.clearCustomSound('assembly')">Remove</button></div>` : ''}
            </div>
            <div class="form-group">
              <label class="form-label">Break bell sound (optional)</label>
              <input type="file" class="form-control" accept="audio/*,.mp3,.wav,.ogg"
                onchange="if(this.files[0]) BellSystem.uploadSoundFor('break', this.files[0])">
              ${s.soundBreakName ? `<div class="text-sm mt-1">${Utils.escapeHtml(s.soundBreakName)} <button class="btn btn-sm btn-danger" onclick="BellSystem.clearCustomSound('break')">Remove</button></div>` : ''}
            </div>
            <div class="form-group">
              <label class="form-label">Period count rings</label>
              <select class="form-select" id="bs-period-count">
                <option value="true" ${s.periodCountRings!==false?'selected':''}>Yes — Period 1 = 1 ring, Period 2 = 2 rings…</option>
                <option value="false" ${s.periodCountRings===false?'selected':''}>No — always same pattern</option>
              </select>
            </div>
            <div class="flex gap-1 flex-wrap mt-1">
              <button class="btn btn-sm btn-warning" onclick="BellSystem.testBell()">Test Period (2 rings)</button>
              <button class="btn btn-sm" onclick="BellSystem.manualRing('assembly')">Test Assembly</button>
              <button class="btn btn-sm" onclick="BellSystem.manualRing('break')">Test Break</button>
            </div>
            <hr style="margin:1rem 0;border:none;border-top:1px solid var(--border)">
            <p class="text-sm text-muted mb-1">Edit period times below. Changes apply to dashboard, countdown, and auto bell after save.</p>
            <p class="text-sm text-muted mb-1"><strong>Default</strong> = Mon–Thu & Sat · <strong>Friday</strong> = special schedule</p>
          </div>
        </div>
      </div>

      <div class="card mb-2">
        <div class="card-header">
          <span>Period Schedule — Default (Mon–Thu & Sat)</span>
          <button class="btn btn-sm btn-primary" onclick="Management.editPeriod('default',-1)">+ Add Period</button>
        </div>
        <div class="card-body">
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr><th>#</th><th>Name</th><th>Start</th><th>End</th><th>Duration</th><th>Type</th><th>Bell</th><th>Active</th><th>Actions</th></tr>
              </thead>
              <tbody>
                ${periodRows(periods, 'default') || '<tr><td colspan="9" class="text-muted">No periods</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <span>Period Schedule — Friday (صرف جمعہ)</span>
          <button class="btn btn-sm btn-primary" onclick="Management.editPeriod('Friday',-1)">+ Add Period</button>
        </div>
        <div class="card-body">
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr><th>#</th><th>Name</th><th>Start</th><th>End</th><th>Duration</th><th>Type</th><th>Bell</th><th>Active</th><th>Actions</th></tr>
              </thead>
              <tbody>
                ${periodRows(friday, 'Friday') || '<tr><td colspan="9" class="text-muted">No Friday periods</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  editPeriod(templateKey, index) {
    const list = AppState.data.periodTemplates[templateKey] || [];
    const isNew = index < 0;
    const p = isNew
      ? { id: Utils.uid('P'), name: '', type: 'period', start: '08:00', end: '08:35', duration: 35, bell: true, active: true }
      : { ...list[index] };

    document.body.insertAdjacentHTML('beforeend', `
      <div class="modal-overlay show" id="modal">
        <div class="modal">
          <div class="modal-header">
            ${isNew ? 'Add' : 'Edit'} Period — ${templateKey === 'Friday' ? 'Friday' : 'Default'}
            <button class="btn btn-ghost btn-sm" onclick="document.getElementById('modal').remove()">✕</button>
          </div>
          <div class="modal-body">
            <input type="hidden" id="pe-key" value="${templateKey}">
            <input type="hidden" id="pe-index" value="${index}">
            <input type="hidden" id="pe-id" value="${Utils.escapeHtml(p.id || '')}">
            <div class="form-group">
              <label class="form-label">Name</label>
              <input class="form-control" id="pe-name" value="${Utils.escapeHtml(p.name)}" placeholder="e.g. Period 1 / تفریح / Assembly">
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Start (HH:MM)</label>
                <input class="form-control" id="pe-start" value="${p.start}" placeholder="08:15">
              </div>
              <div class="form-group">
                <label class="form-label">End (HH:MM)</label>
                <input class="form-control" id="pe-end" value="${p.end}" placeholder="08:50">
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Type</label>
                <select class="form-select" id="pe-type">
                  <option value="period" ${p.type==='period'?'selected':''}>Period</option>
                  <option value="assembly" ${p.type==='assembly'?'selected':''}>Assembly</option>
                  <option value="break" ${p.type==='break'?'selected':''}>Break</option>
                  <option value="activity" ${p.type==='activity'?'selected':''}>Activity</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Bell</label>
                <select class="form-select" id="pe-bell">
                  <option value="true" ${p.bell?'selected':''}>Yes</option>
                  <option value="false" ${!p.bell?'selected':''}>No</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Active</label>
                <select class="form-select" id="pe-active">
                  <option value="true" ${p.active!==false?'selected':''}>Yes</option>
                  <option value="false" ${p.active===false?'selected':''}>No</option>
                </select>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn" onclick="document.getElementById('modal').remove()">Cancel</button>
            <button class="btn btn-primary" onclick="Management.savePeriod()">Save</button>
          </div>
        </div>
      </div>`);
  },

  async savePeriod() {
    const key = document.getElementById('pe-key').value;
    const index = Number(document.getElementById('pe-index').value);
    const start = document.getElementById('pe-start').value.trim();
    const end = document.getElementById('pe-end').value.trim();
    const name = document.getElementById('pe-name').value.trim();

    if (!name || !start || !end) {
      Utils.toast('Name, start and end are required', 'error');
      return;
    }
    // Basic time validation
    const timeRe = /^\d{1,2}:\d{2}$/;
    if (!timeRe.test(start) || !timeRe.test(end)) {
      Utils.toast('Use time format HH:MM (e.g. 08:15)', 'error');
      return;
    }

    const startM = Utils.timeToMinutes(start);
    const endM = Utils.timeToMinutes(end);
    if (endM <= startM) {
      Utils.toast('End time must be after start time', 'error');
      return;
    }

    const entry = {
      id: document.getElementById('pe-id').value || Utils.uid('P'),
      name,
      start,
      end,
      duration: endM - startM,
      type: document.getElementById('pe-type').value,
      bell: document.getElementById('pe-bell').value === 'true',
      active: document.getElementById('pe-active').value === 'true'
    };

    if (!AppState.data.periodTemplates[key]) {
      AppState.data.periodTemplates[key] = [];
    }
    const list = AppState.data.periodTemplates[key];
    if (index >= 0 && index < list.length) {
      list[index] = entry;
    } else {
      list.push(entry);
    }
    // Keep chronological order
    list.sort((a, b) => Utils.timeToMinutes(a.start) - Utils.timeToMinutes(b.start));

    await AppState.save('Period schedule updated');
    document.getElementById('modal')?.remove();
    Utils.toast('Period saved', 'success');
    App.refresh();
  },

  async deletePeriod(templateKey, index) {
    const list = AppState.data.periodTemplates[templateKey] || [];
    if (index < 0 || index >= list.length) return;
    const name = list[index].name;
    if (!Utils.confirm(`Delete "${name}" from ${templateKey === 'Friday' ? 'Friday' : 'Default'} schedule?`)) return;
    list.splice(index, 1);
    await AppState.save('Period deleted');
    Utils.toast('Period deleted', 'success');
    App.refresh();
  },

  async saveBellSettings() {
    const s = AppState.data.bellSettings;
    s.normalDuration = Number(document.getElementById('bs-normal').value) || 5;
    s.assemblyDuration = Number(document.getElementById('bs-assembly').value) || 10;
    s.breakDuration = Number(document.getElementById('bs-break').value) || 15;
    s.breakEndDuration = Number(document.getElementById('bs-break-end')?.value) || 20;
    s.specialDuration = Number(document.getElementById('bs-special').value) || 8;
    s.assemblyMode = document.getElementById('bs-asm-mode').value;
    s.breakMode = document.getElementById('bs-brk-mode').value;
    s.continuousTotalDuration = Number(document.getElementById('bs-cont-total').value) || 40;
    s.breakRingInterval = Number(document.getElementById('bs-interval').value) || 4;
    s.assemblyRingInterval = s.breakRingInterval;
    s.ringSpeed = document.getElementById('bs-ring-speed')?.value || 'normal';
    s.periodCountRings = document.getElementById('bs-period-count')?.value !== 'false';
    await AppState.save('Bell settings updated');
    Utils.toast('Bell settings saved', 'success');
  },

  renderBellTimetable() {
    const school = AppState.data.school;
    const def = AppState.data.periodTemplates.default;
    const fri = AppState.data.periodTemplates.Friday || [];
    return `
      <div class="card">
        <div class="card-header">
          <div>
            <div class="font-bold">TIME TABLE (Bell)</div>
            <div class="text-sm">${Utils.escapeHtml(school.name)}, ${Utils.escapeHtml(school.address)}</div>
            <div class="text-sm text-muted">Session ${Utils.escapeHtml(school.session)}</div>
          </div>
          <div class="flex gap-1 no-print">
            <button class="btn btn-sm btn-primary" onclick="App.navigate('bell-settings')">Edit Schedule</button>
            <button class="btn btn-sm" onclick="window.print()">Print</button>
          </div>
        </div>
        <div class="card-body">
          <h3 class="mb-1">Normal Days (Mon–Thu, Sat)</h3>
          <table class="data-table mb-2">
            <thead><tr><th>Period</th><th>Start</th><th>End</th><th>Interval</th></tr></thead>
            <tbody>
              ${def.map(p => `<tr><td>${Utils.escapeHtml(p.name)}</td><td>${p.start}</td><td>${p.end}</td><td>${p.duration} min</td></tr>`).join('')}
            </tbody>
          </table>
          <h3 class="mb-1">Friday (صرف جمعہ کے دن کے لئے)</h3>
          <table class="data-table">
            <thead><tr><th>Period</th><th>Start</th><th>End</th><th>Interval</th></tr></thead>
            <tbody>
              ${fri.map(p => `<tr><td>${Utils.escapeHtml(p.name)}</td><td>${p.start}</td><td>${p.end}</td><td>${p.duration} min</td></tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  renderBellHistory() {
    const hist = AppState.data.bellHistory || [];
    return `
      <div class="card">
        <div class="card-header">
          <span>Bell History</span>
          <button class="btn btn-sm btn-danger" onclick="Management.clearBellHistory()">Clear</button>
        </div>
        <div class="card-body">
          <table class="data-table">
            <thead><tr><th>Date</th><th>Time</th><th>Event</th><th>Duration</th><th>Status</th></tr></thead>
            <tbody>
              ${hist.length ? hist.map(h => `
                <tr>
                  <td>${Utils.escapeHtml(h.date)}</td>
                  <td>${Utils.escapeHtml(h.time)}</td>
                  <td>${Utils.escapeHtml(h.event)}</td>
                  <td>${Utils.escapeHtml(h.duration)}</td>
                  <td><span class="badge badge-info">${Utils.escapeHtml(h.status)}</span></td>
                </tr>
              `).join('') : '<tr><td colspan="5" class="text-muted">No bell events yet</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  async clearBellHistory() {
    if (!Utils.confirm('Clear all bell history?')) return;
    AppState.data.bellHistory = [];
    await AppState.save('Bell history cleared');
    App.refresh();
  },

  renderSettings() {
    const s = AppState.data.school;
    return `
      <div class="card" style="max-width:640px">
        <div class="card-header">School Settings</div>
        <div class="card-body">
          <div class="form-group">
            <label class="form-label">School Logo</label>
            <div class="flex gap-1 items-center flex-wrap">
              ${s.logo ? `<img src="${s.logo}" alt="Logo" style="height:56px;width:auto;border-radius:8px;border:1px solid var(--border)">` : '<span class="text-muted text-sm">No logo</span>'}
              <input type="file" class="form-control" style="max-width:220px" accept="image/*" id="set-logo-file"
                onchange="Management.uploadLogo(this.files[0])">
              ${s.logo ? `<button class="btn btn-sm btn-danger" onclick="Management.clearLogo()">Remove</button>` : ''}
            </div>
          </div>
          <div class="form-group"><label class="form-label">School Name</label><input class="form-control" id="set-name" value="${Utils.escapeHtml(s.name)}"></div>
          <div class="form-row">
            <div class="form-group"><label class="form-label">Code</label><input class="form-control" id="set-code" value="${Utils.escapeHtml(s.code)}"></div>
            <div class="form-group"><label class="form-label">Session</label><input class="form-control" id="set-session" value="${Utils.escapeHtml(s.session)}"></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label class="form-label">District</label><input class="form-control" id="set-district" value="${Utils.escapeHtml(s.district)}"></div>
            <div class="form-group"><label class="form-label">Tehsil</label><input class="form-control" id="set-tehsil" value="${Utils.escapeHtml(s.tehsil)}"></div>
          </div>
          <div class="form-group"><label class="form-label">Address</label><input class="form-control" id="set-address" value="${Utils.escapeHtml(s.address)}"></div>
          <div class="form-group"><label class="form-label">Headteacher / Headmistress</label><input class="form-control" id="set-head" value="${Utils.escapeHtml(s.headteacher)}"></div>
          <div class="form-row">
            <div class="form-group"><label class="form-label">Phone</label><input class="form-control" id="set-phone" value="${Utils.escapeHtml(s.phone)}"></div>
            <div class="form-group"><label class="form-label">Email</label><input class="form-control" id="set-email" value="${Utils.escapeHtml(s.email)}"></div>
          </div>
          <div class="form-group"><label class="form-label">Theme</label>
            <select class="form-select" id="set-theme" onchange="Management.setTheme(this.value)">
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
          <button class="btn btn-primary" onclick="Management.saveSettings()">Save Settings</button>
        </div>
      </div>
      <div class="card mt-2" style="max-width:640px">
        <div class="card-header">Software by</div>
        <div class="card-body">
          <div class="brand-dev" style="font-size:1.05rem;margin-bottom:.35rem">GM TECH SOLUTIONS</div>
          <div class="text-sm text-muted mb-1">School Timetable &amp; Automatic Bell System</div>
          <a class="brand-wa" href="https://wa.me/923336283082" target="_blank" rel="noopener">WhatsApp: 923336283082</a>
          <p class="text-xs text-muted mt-2 mb-0">Changing the school name above updates the sidebar and window title after you save.</p>
        </div>
      </div>
    `;
  },

  async saveSettings() {
    const s = AppState.data.school;
    s.name = document.getElementById('set-name').value.trim();
    s.code = document.getElementById('set-code').value.trim();
    s.session = document.getElementById('set-session').value.trim();
    s.district = document.getElementById('set-district').value.trim();
    s.tehsil = document.getElementById('set-tehsil').value.trim();
    s.address = document.getElementById('set-address').value.trim();
    s.headteacher = document.getElementById('set-head').value.trim();
    s.phone = document.getElementById('set-phone').value.trim();
    s.email = document.getElementById('set-email').value.trim();
    await AppState.save('School settings updated');
    App.applyBranding();
    Utils.toast('Settings saved — school name updated', 'success');
    App.refresh();
  },

  uploadLogo(file) {
    if (!file) return;
    if (file.size > 1.5 * 1024 * 1024) { Utils.toast('Logo max 1.5 MB', 'error'); return; }
    const reader = new FileReader();
    reader.onload = async (e) => {
      AppState.data.school.logo = e.target.result;
      await AppState.save('Logo uploaded');
      Utils.toast('Logo uploaded', 'success');
      App.refresh();
    };
    reader.readAsDataURL(file);
  },

  async clearLogo() {
    AppState.data.school.logo = '';
    await AppState.save('Logo removed');
    App.refresh();
  },

  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ST_theme', theme);
  },

  async renderBackup() {
    const list = await DB.listBackups();
    return `
      <div class="grid grid-2 mb-2">
        <div class="card">
          <div class="card-header">Backup & Restore</div>
          <div class="card-body flex gap-1 flex-wrap">
            <button class="btn btn-primary" onclick="Management.createBackup()">Create Backup Now</button>
            <button class="btn" onclick="DB.exportJSON()">Download JSON</button>
            <label class="btn" style="cursor:pointer">
              Import JSON
              <input type="file" accept=".json" style="display:none" onchange="Management.importFile(this)">
            </label>
            <button class="btn btn-danger" onclick="Management.resetData()">Reset to Default</button>
          </div>
        </div>
        <div class="card">
          <div class="card-header">Activity Log (recent)</div>
          <div class="card-body" style="max-height:200px;overflow-y:auto">
            ${(AppState.data.auditLog||[]).slice(0,15).map(a => `
              <div class="text-sm mb-1"><span class="text-muted">${new Date(a.timestamp).toLocaleString()}</span> — ${Utils.escapeHtml(a.action)}</div>
            `).join('') || '<div class="text-muted">No activity yet</div>'}
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-header">Backup History</div>
        <div class="card-body">
          <table class="data-table">
            <thead><tr><th>Date</th><th>Reason</th><th>Size</th><th>Actions</th></tr></thead>
            <tbody>
              ${list.length ? list.map(b => `
                <tr>
                  <td>${new Date(b.timestamp).toLocaleString()}</td>
                  <td>${Utils.escapeHtml(b.reason)}</td>
                  <td>${Math.round(b.size/1024)} KB</td>
                  <td>
                    <button class="btn btn-sm btn-primary" onclick="Management.restoreBackup(${b.id})">Restore</button>
                    <button class="btn btn-sm btn-danger" onclick="Management.deleteBackup(${b.id})">Delete</button>
                  </td>
                </tr>
              `).join('') : '<tr><td colspan="4" class="text-muted">No backups yet</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  async createBackup() {
    await DB.createBackup(AppState.data, 'Manual backup');
    Utils.toast('Backup created', 'success');
    App.refresh();
  },

  async restoreBackup(id) {
    if (!Utils.confirm('Restore this backup? Current data will be backed up first.')) return;
    AppState.data = await DB.restoreBackup(id);
    Utils.toast('Backup restored', 'success');
    App.refresh();
  },

  async deleteBackup(id) {
    if (!Utils.confirm('Delete this backup?')) return;
    await DB.deleteBackup(id);
    App.refresh();
  },

  async importFile(input) {
    const file = input.files[0];
    if (!file) return;
    if (!Utils.confirm('This will replace current data. A backup will be created first. Continue?')) return;
    try {
      AppState.data = await DB.importJSON(file);
      Utils.toast('Import successful', 'success');
      App.refresh();
    } catch (e) {
      Utils.toast('Import failed: ' + e.message, 'error');
    }
  },

  async resetData() {
    if (!Utils.confirm('Reset ALL data to Excel seed values? Current data will be backed up.')) return;
    AppState.data = await DB.resetToSeed();
    Utils.toast('Reset to default data', 'success');
    App.refresh();
  },

  renderReports() {
    const dayNum = new Date().getDay() || 6;
    const workload = AppState.getAllTeachersWorkload(dayNum);
    return `
      <div class="card mb-2">
        <div class="card-header">Teacher Workload · ${Utils.DAY_MAP[dayNum]}</div>
        <div class="card-body">
          <table class="data-table">
            <thead><tr><th>Teacher</th><th>Teaching Periods</th><th>Free Periods</th></tr></thead>
            <tbody>
              ${workload.map(w => `
                <tr>
                  <td class="urdu">${Utils.escapeHtml(w.teacher.name)}</td>
                  <td><strong>${w.periods}</strong></td>
                  <td>${w.free}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
      <div class="card">
        <div class="card-header">Quick Reports</div>
        <div class="card-body flex gap-1 flex-wrap">
          <button class="btn" onclick="App.navigate('class-wise')">Class Timetable</button>
          <button class="btn" onclick="App.navigate('teacher-wise')">Teacher Timetable</button>
          <button class="btn" onclick="App.navigate('bell-timetable')">Bell Schedule</button>
          <button class="btn" onclick="window.print()">Print Current View</button>
        </div>
      </div>
    `;
  },

  renderScheme() {
    const classes = ['10th','9th','8th','7th','6th','5th','4th','3rd'];
    return `
      <div class="card mb-2 no-print">
        <div class="card-body flex gap-1 flex-wrap items-center justify-between">
          <p class="text-muted mb-0">Weekly topic planning sheets for each class. Dual subjects get a second line.</p>
          <button class="btn btn-sm" onclick="window.print()">Print</button>
        </div>
      </div>
      <div class="card">
        <div class="card-header">Scheme of Study</div>
        <div class="card-body">
          <div class="tabs no-print">
            ${classes.map((c,i) => `<button class="tab ${i===0?'active':''}" onclick="Management.showSchemeClass('${c}', this)">${c}</button>`).join('')}
          </div>
          <div id="scheme-content">
            ${this._schemeTable('10th')}
          </div>
        </div>
      </div>
    `;
  },

  showSchemeClass(cls, btn) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('scheme-content').innerHTML = this._schemeTable(cls);
  },

  _schemeTable(clsName) {
    const classObj = AppState.data.classes.find(c => c.name === clsName);
    if (!classObj) return '<div class="text-muted">No data</div>';
    const dayNum = new Date().getDay() || 6;
    const tt = AppState.getClassTimetable(classObj.id, dayNum);
    // Only teaching periods (P1–P9); dual/alt entries get their own row
    const periodRows = tt.rows.filter(r => r.period.type === 'period');
    const body = periodRows.map(r => {
      const entries = r.entries.length ? r.entries : [null];
      return entries.map((e, idx) => {
        const isDual = idx > 0 || (e && e.notes && String(e.notes).toLowerCase().includes('alt'));
        const periodLabel = idx === 0
          ? Utils.escapeHtml(r.period.name)
          : `<span class="text-muted">${Utils.escapeHtml(r.period.name)}</span> <span class="alt-tag">alt</span>`;
        return `<tr class="${isDual && idx > 0 ? 'scheme-dual-row' : ''}">
          <td>${periodLabel}</td>
          <td class="urdu">${Utils.escapeHtml(e?.teacher?.name || '—')}</td>
          <td class="urdu">${Utils.escapeHtml(e?.subject?.name || '—')}${isDual && idx > 0 ? ' <span class="alt-tag">alt</span>' : ''}</td>
          <td></td><td></td><td></td><td></td><td></td><td></td>
        </tr>`;
      }).join('');
    }).join('');

    return `
      <div class="text-sm text-muted mb-1">Class: ${Utils.escapeHtml(clsName)} · Based on current timetable assignments · Dual subjects shown on a second line</div>
      <div class="table-wrap">
        <table class="data-table scheme-table">
          <thead>
            <tr>
              <th>Period</th><th>Teacher</th><th>Subject</th>
              <th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th><th>Sat</th>
            </tr>
          </thead>
          <tbody>
            ${body || '<tr><td colspan="9" class="text-muted">No periods</td></tr>'}
          </tbody>
        </table>
      </div>
      <p class="text-xs text-muted mt-1">Topic cells (Mon–Sat) are blank for teachers to fill during the week. Dual / alternative subjects appear on a second line with an <span class="alt-tag">alt</span> tag.</p>
    `;
  },

  // ── Teacher Attendance ──────────────────────────────────────────
  _attDate: null,

  _attDateStr() {
    if (!this._attDate) this._attDate = new Date();
    return AppState.dateKey(this._attDate);
  },

  renderAttendance() {
    const date = this._attDate || new Date();
    this._attDate = date;
    const dateStr = AppState.dateKey(date);
    const dayName = Utils.getDayName(date);
    const teachers = (AppState.data.teachers || []).filter(t => t.status === 'active');
    const map = AppState.getAttendanceMap(date);
    let present = 0, leave = 0;
    teachers.forEach(t => {
      if ((map[t.id] || 'present') === 'leave') leave++;
      else present++;
    });

    return `
      <div class="card mb-2 no-print">
        <div class="card-body flex gap-1 flex-wrap items-center justify-between">
          <div class="flex gap-1 flex-wrap items-center">
            <label class="form-label" style="margin:0">Date</label>
            <input type="date" class="form-control" style="width:auto" id="att-date"
              value="${dateStr}" onchange="Management.onAttDateChange(this.value)">
            <span class="badge badge-success">Present: ${present}</span>
            <span class="badge badge-danger">On Leave: ${leave}</span>
            <span class="text-sm text-muted">${Utils.escapeHtml(dayName)}</span>
          </div>
          <div class="flex gap-1 flex-wrap">
            <button class="btn btn-sm btn-success" onclick="Management.markAllAttendance('present')">All Present</button>
            <button class="btn btn-sm" onclick="Management.markAllAttendance('leave')">All Leave</button>
            <button class="btn btn-sm btn-primary" onclick="App.navigate('alternate-tt')">→ Alternate Timetable</button>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-header">Teacher Attendance · ${Utils.escapeHtml(dateStr)}</div>
        <div class="card-body">
          <p class="text-sm text-muted mb-2">Mark teachers <strong>Present</strong> or <strong>On Leave</strong>. Periods of teachers on leave can be reassigned on the Alternate Timetable page.</p>
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr><th>#</th><th>Teacher</th><th>Subject(s)</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                ${teachers.map((t, i) => {
                  const st = map[t.id] || 'present';
                  const isLeave = st === 'leave';
                  return `<tr>
                    <td>${i + 1}</td>
                    <td class="urdu font-bold">${Utils.escapeHtml(t.name)}</td>
                    <td class="urdu text-sm">${Utils.escapeHtml(t.subject || '')}</td>
                    <td>
                      <span class="badge ${isLeave ? 'badge-danger' : 'badge-success'}">
                        ${isLeave ? 'On Leave' : 'Present'}
                      </span>
                    </td>
                    <td>
                      <button class="btn btn-sm ${isLeave ? 'btn-success' : ''}"
                        onclick="Management.setAttendance('${t.id}','present')"
                        ${!isLeave ? 'disabled' : ''}>Present</button>
                      <button class="btn btn-sm ${isLeave ? '' : 'btn-danger'}"
                        onclick="Management.setAttendance('${t.id}','leave')"
                        ${isLeave ? 'disabled' : ''}>On Leave</button>
                    </td>
                  </tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  onAttDateChange(val) {
    if (!val) return;
    const [y, m, d] = val.split('-').map(Number);
    this._attDate = new Date(y, m - 1, d);
    App.refresh();
  },

  async setAttendance(teacherId, status) {
    if (!this._attDate) this._attDate = new Date();
    AppState.setTeacherAttendance(teacherId, status, this._attDate);
    // If marked present again, remove substitutions for that teacher on this date
    if (status === 'present') {
      const key = AppState.dateKey(this._attDate);
      AppState.data.substitutions = (AppState.data.substitutions || []).filter(
        s => !(s.date === key && s.originalTeacherId === teacherId)
      );
    }
    await AppState.save('Attendance updated');
    App.refresh();
  },

  async markAllAttendance(status) {
    if (!this._attDate) this._attDate = new Date();
    AppState.setAllAttendance(status, this._attDate);
    if (status === 'present') {
      const key = AppState.dateKey(this._attDate);
      AppState.data.substitutions = (AppState.data.substitutions || []).filter(s => s.date !== key);
    }
    await AppState.save('Attendance bulk update');
    App.refresh();
  },

  // ── Alternate Timetable (substitutions for leave teachers) ──────
  renderAlternateTT() {
    const date = this._attDate || new Date();
    this._attDate = date;
    const dateStr = AppState.dateKey(date);
    const dayName = Utils.getDayName(date);
    const dayNum = date.getDay();
    const leavePeriods = AppState.getLeavePeriods(date);
    const leaveCount = new Set(leavePeriods.map(p => p.teacher?.id).filter(Boolean)).size;
    const assigned = leavePeriods.filter(p => p.substitution?.substituteTeacherId).length;
    const pending = leavePeriods.length - assigned;

    const rows = leavePeriods.map(lp => {
      const free = AppState.getFreeTeachersForPeriod(lp.period.id, date, lp.teacher?.id);
      const subId = lp.substitution?.substituteTeacherId || '';
      // keep currently assigned sub in list even if somehow busy
      if (subId && !free.find(t => t.id === subId)) {
        const t = AppState.getTeacherById(subId);
        if (t) free.unshift(t);
      }
      const opts = `<option value="">— Select free teacher —</option>` +
        free.map(t =>
          `<option value="${t.id}" ${t.id === subId ? 'selected' : ''}>${Utils.escapeHtml(t.name)}</option>`
        ).join('');
      return `
        <tr>
          <td>${Utils.escapeHtml(lp.period.name)}<div class="text-xs text-muted">${lp.period.start}–${lp.period.end}</div></td>
          <td>${Utils.escapeHtml(lp.class?.name || '')}</td>
          <td class="urdu">${Utils.escapeHtml(lp.subject?.name || '')}</td>
          <td class="urdu"><span class="badge badge-danger">${Utils.escapeHtml(lp.teacher?.name || '')}</span></td>
          <td>
            <select class="form-select" style="min-width:160px"
              onchange="Management.assignSubstitute('${lp.entry.id}','${lp.period.id}','${lp.entry.classId}','${lp.entry.teacherId}','${lp.entry.subjectId || ''}', this.value)">
              ${opts}
            </select>
          </td>
          <td>
            ${lp.substitution
              ? `<button class="btn btn-sm btn-danger" onclick="Management.clearSubstitute('${lp.substitution.id}')">Clear</button>`
              : '<span class="text-muted text-sm">—</span>'}
          </td>
        </tr>`;
    }).join('');

    // Summary of substitutions as alternate class view hint
    const subs = AppState.getSubstitutionsForDate(date);

    return `
      <div class="card mb-2 no-print">
        <div class="card-body flex gap-1 flex-wrap items-center justify-between">
          <div class="flex gap-1 flex-wrap items-center">
            <label class="form-label" style="margin:0">Date</label>
            <input type="date" class="form-control" style="width:auto" id="alt-date"
              value="${dateStr}" onchange="Management.onAttDateChange(this.value)">
            <span class="text-sm text-muted">${Utils.escapeHtml(dayName)}</span>
            <span class="badge badge-danger">Leave teachers: ${leaveCount}</span>
            <span class="badge badge-warning">Slots to cover: ${leavePeriods.length}</span>
            <span class="badge badge-success">Assigned: ${assigned}</span>
            ${pending ? `<span class="badge badge-danger">Pending: ${pending}</span>` : ''}
          </div>
          <div class="flex gap-1 flex-wrap">
            <button class="btn btn-sm" onclick="App.navigate('attendance')">← Attendance</button>
            <button class="btn btn-sm btn-success" onclick="Management.notifyAllSubstitutesWhatsApp()" title="Open WhatsApp chats for all assigned substitutes">WhatsApp notify all</button>
            <button class="btn btn-sm" onclick="window.print()">Print</button>
          </div>
        </div>
      </div>

      ${dayNum === 0 ? `
        <div class="card"><div class="card-body text-muted">School is closed on Sunday. Choose a working day.</div></div>
      ` : leavePeriods.length === 0 ? `
        <div class="card">
          <div class="card-body">
            <p class="text-muted mb-1">No teachers on leave for this date, or no periods to cover.</p>
            <p class="text-sm">Go to <button class="btn btn-sm" onclick="App.navigate('attendance')">Attendance</button> and mark teachers <strong>On Leave</strong>.</p>
          </div>
        </div>
      ` : `
        <div class="card mb-2">
          <div class="card-header">Cover periods for teachers on leave</div>
          <div class="card-body">
            <p class="text-sm text-muted mb-2">
              Select a free teacher for each period. Only teachers who are <strong>Present</strong> and not already teaching that period are listed.
            </p>
            <div class="table-wrap">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Period</th>
                    <th>Class</th>
                    <th>Subject</th>
                    <th>On Leave</th>
                    <th>Substitute Teacher</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>${rows}</tbody>
              </table>
            </div>
          </div>
        </div>
      `}

      <div class="card mb-2">
        <div class="card-header">Alternate Timetable summary · ${Utils.escapeHtml(dateStr)} (${subs.length} substitution${subs.length === 1 ? '' : 's'})</div>
        <div class="card-body">
          ${subs.length === 0
            ? '<p class="text-muted">No substitutions saved for this date yet.</p>'
            : `<div class="table-wrap"><table class="data-table">
                <thead><tr><th>Period</th><th>Class</th><th>Subject</th><th>Original</th><th>Substitute</th></tr></thead>
                <tbody>
                  ${subs.map(s => {
                    const per = (AppState.getPeriodsForDay(dayName) || []).find(p => p.id === s.period);
                    return `<tr>
                      <td>${Utils.escapeHtml(per?.name || s.period)}</td>
                      <td>${Utils.escapeHtml(AppState.getClassById(s.classId)?.name || '')}</td>
                      <td class="urdu">${Utils.escapeHtml(AppState.getSubjectById(s.subjectId)?.name || '')}</td>
                      <td class="urdu text-muted">${Utils.escapeHtml(AppState.getTeacherById(s.originalTeacherId)?.name || '')}</td>
                      <td class="urdu font-bold">${Utils.escapeHtml(AppState.getTeacherById(s.substituteTeacherId)?.name || '')}</td>
                    </tr>`;
                  }).join('')}
                </tbody>
              </table></div>`}
        </div>
      </div>

      ${(() => {
        const groups = this.getSubstituteNotifyGroups(date);
        if (!groups.length) return '';
        return `
      <div class="card no-print">
        <div class="card-header">WhatsApp notify alternate teachers</div>
        <div class="card-body">
          <p class="text-sm text-muted mb-2">
            Opens WhatsApp with a ready message (period, class, subject). You tap <strong>Send</strong> in WhatsApp.
            Fully silent auto-send needs WhatsApp Business API (not available in offline school app).
            Add each teacher’s number under <strong>Staff → Edit → WhatsApp / Mobile</strong>.
          </p>
          <div class="table-wrap"><table class="data-table">
            <thead><tr><th>Substitute</th><th>Periods</th><th>Phone</th><th>Actions</th></tr></thead>
            <tbody>
              ${groups.map(g => `
                <tr>
                  <td class="urdu font-bold">${Utils.escapeHtml(g.teacher?.name || '')}</td>
                  <td>${g.count}</td>
                  <td class="text-sm">${g.wa ? Utils.escapeHtml(g.phone) : '<span class="badge badge-danger">No number</span>'}</td>
                  <td class="flex gap-1 flex-wrap">
                    <button class="btn btn-sm btn-success" ${g.wa ? '' : 'disabled'}
                      onclick="Management.notifySubstituteWhatsApp('${g.teacherId}')">WhatsApp</button>
                    <button class="btn btn-sm" onclick="Management.copySubstituteMessage('${g.teacherId}')">Copy text</button>
                  </td>
                </tr>`).join('')}
            </tbody>
          </table></div>
          <button class="btn btn-success mt-2" onclick="Management.notifyAllSubstitutesWhatsApp()">WhatsApp notify all assigned</button>
        </div>
      </div>`;
      })()}
    `;
  },

  async assignSubstitute(entryId, periodId, classId, originalTeacherId, subjectId, substituteTeacherId) {
    if (!this._attDate) this._attDate = new Date();
    const dateStr = AppState.dateKey(this._attDate);
    if (!substituteTeacherId) {
      // clear
      const existing = (AppState.data.substitutions || []).find(
        s => s.date === dateStr && s.originalEntryId === entryId
      );
      if (existing) {
        AppState.removeSubstitution(existing.id);
        await AppState.save('Substitution cleared');
        Utils.toast('Substitution cleared', 'info');
        App.refresh();
      }
      return;
    }
    const sub = {
      id: Utils.uid('SUB'),
      date: dateStr,
      classId,
      period: periodId,
      originalTeacherId,
      substituteTeacherId,
      subjectId: subjectId || '',
      originalEntryId: entryId,
      notes: ''
    };
    // reuse id if updating
    const prev = (AppState.data.substitutions || []).find(
      s => s.date === dateStr && s.originalEntryId === entryId
    );
    if (prev) sub.id = prev.id;
    AppState.upsertSubstitution(sub);
    await AppState.save('Substitution assigned');
    Utils.toast('Substitute assigned', 'success');
    App.refresh();
  },

  async clearSubstitute(id) {
    AppState.removeSubstitution(id);
    await AppState.save('Substitution removed');
    Utils.toast('Cleared', 'info');
    App.refresh();
  },

  /** Pakistan / intl mobile → digits for wa.me */
  normalizeWhatsAppPhone(phone) {
    let d = String(phone || '').replace(/\D/g, '');
    if (!d) return null;
    if (d.startsWith('00')) d = d.slice(2);
    if (d.startsWith('0')) d = '92' + d.slice(1);
    if (d.length < 10 || d.length > 15) return null;
    return d;
  },

  /** Group today's substitutions by substitute teacher */
  getSubstituteNotifyGroups(date) {
    const dayName = Utils.getDayName(date);
    const periods = AppState.getPeriodsForDay(dayName) || [];
    const school = AppState.data.school?.name || 'School';
    const dateStr = AppState.dateKey(date);
    const subs = AppState.getSubstitutionsForDate(date);
    const map = {};
    subs.forEach(s => {
      const tid = s.substituteTeacherId;
      if (!tid) return;
      if (!map[tid]) map[tid] = [];
      map[tid].push(s);
    });
    return Object.keys(map).map(tid => {
      const teacher = AppState.getTeacherById(tid);
      const lines = map[tid].map(s => {
        const per = periods.find(p => p.id === s.period);
        const cls = AppState.getClassById(s.classId);
        const subj = AppState.getSubjectById(s.subjectId);
        const orig = AppState.getTeacherById(s.originalTeacherId);
        const time = per ? `${per.start || ''}–${per.end || ''}` : '';
        return `• ${per?.name || s.period}${time ? ' (' + time + ')' : ''} — Class: ${cls?.name || '-'} — Subject: ${subj?.name || '-'} (instead of ${orig?.name || 'teacher on leave'})`;
      });
      const body =
        `Assalam o Alaikum ${teacher?.name || ''},\n\n` +
        `Aap ko substitute duty assign ki gai hai.\n\n` +
        `School: ${school}\n` +
        `Date: ${dateStr}\n\n` +
        `Periods:\n${lines.join('\n')}\n\n` +
        `Please be on time. Shukriya.\n` +
        `— ${school}\n` +
        `(GM TECH SOLUTIONS Timetable)`;
      return {
        teacherId: tid,
        teacher,
        phone: teacher?.phone || '',
        wa: this.normalizeWhatsAppPhone(teacher?.phone),
        count: map[tid].length,
        message: body
      };
    });
  },

  _waQueue: [],
  _waQueueIndex: 0,

  /** Keep pre-filled text short enough for wa.me URL limits */
  clipWhatsAppText(text) {
    let msg = String(text || '');
    if (encodeURIComponent(msg).length > 1200) {
      msg = msg.slice(0, 500).trim() + '\n\n…(see Alternate TT in app for full detail)';
    }
    return msg;
  },

  whatsappUrls(phoneDigits, text) {
    const msg = this.clipWhatsAppText(text);
    const q = encodeURIComponent(msg);
    const phone = String(phoneDigits || '').replace(/\D/g, '');
    const list = [];
    if (phone) {
      // api.whatsapp.com works well with WhatsApp Web
      list.push(`https://api.whatsapp.com/send?phone=${phone}&text=${q}`);
      list.push(`https://wa.me/${phone}?text=${q}`);
      list.push(`whatsapp://send?phone=${phone}&text=${q}`);
    } else {
      list.push(`https://api.whatsapp.com/send?text=${q}`);
    }
    return list;
  },

  /**
   * Open one chat. windowName must be UNIQUE so WhatsApp Web opens a new tab/window
   * per teacher instead of replacing the previous chat.
   */
  async openWhatsAppMessage(phoneDigits, text, windowName) {
    const urls = this.whatsappUrls(phoneDigits, text);
    if (!urls.length) return false;
    const name = windowName || ('wa_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8));

    // Prefer a dedicated browser window/tab per teacher (critical for "notify all")
    for (const url of urls) {
      if (url.startsWith('whatsapp:')) continue; // handle deep-link after
      try {
        const w = window.open(url, name, 'noopener,noreferrer');
        if (w) {
          try { w.focus(); } catch (_) {}
          return true;
        }
      } catch (e) {
        console.warn('window.open failed', e);
      }
    }

    // Electron system open (may reuse same browser tab — use only as fallback)
    if (window.BackgroundBell && typeof window.BackgroundBell.openExternal === 'function') {
      for (const url of urls) {
        try {
          const ok = await window.BackgroundBell.openExternal(url);
          if (ok) return true;
        } catch (e) {
          console.warn('openExternal failed', e);
        }
      }
    }

    // <a target=_blank>
    try {
      const a = document.createElement('a');
      a.href = urls[0];
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => a.remove(), 500);
      return true;
    } catch (_) {}

    return false;
  },

  notifySubstituteWhatsApp(teacherId) {
    if (!this._attDate) this._attDate = new Date();
    const groups = this.getSubstituteNotifyGroups(this._attDate);
    const g = groups.find(x => x.teacherId === teacherId);
    if (!g) { Utils.toast('No assignment found', 'error'); return; }
    if (!g.wa) {
      Utils.toast('Add WhatsApp number for ' + (g.teacher?.name || 'teacher') + ' in Staff', 'error');
      return;
    }
    this.openWhatsAppMessage(g.wa, g.message, 'wa_one_' + teacherId).then(ok => {
      if (ok) Utils.toast('WhatsApp opened — tap Send', 'success');
      else Utils.toast('Could not open WhatsApp. Allow popups for this app.', 'error');
    });
  },

  /** Remove floating queue UI if present */
  removeWaQueuePanel() {
    document.getElementById('wa-queue-panel')?.remove();
  },

  /** Floating panel: open one teacher, then Next for the rest (reliable with WhatsApp Web) */
  showWaQueuePanel() {
    this.removeWaQueuePanel();
    const total = this._waQueue.length;
    const i = this._waQueueIndex;
    if (i >= total) {
      Utils.toast('All alternate teachers processed', 'success');
      return;
    }
    const g = this._waQueue[i];
    const html = `
      <div id="wa-queue-panel" class="wa-queue-panel no-print">
        <div class="wa-queue-title">WhatsApp notify · ${i + 1} of ${total}</div>
        <div class="wa-queue-name urdu">${Utils.escapeHtml(g.teacher?.name || g.phone)}</div>
        <div class="wa-queue-hint">Chat opens with message ready. Tap <b>Send</b> in WhatsApp, then click <b>Next teacher</b>.</div>
        <div class="wa-queue-actions">
          <button type="button" class="btn btn-success btn-sm" id="wa-q-open">Open WhatsApp</button>
          <button type="button" class="btn btn-primary btn-sm" id="wa-q-next">Next teacher</button>
          <button type="button" class="btn btn-sm" id="wa-q-skip">Skip</button>
          <button type="button" class="btn btn-sm" id="wa-q-close">Close</button>
        </div>
      </div>`;
    document.body.insertAdjacentHTML('beforeend', html);
    document.getElementById('wa-q-open').onclick = () => this.waQueueOpenCurrent();
    document.getElementById('wa-q-next').onclick = () => this.waQueueNext();
    document.getElementById('wa-q-skip').onclick = () => this.waQueueNext(true);
    document.getElementById('wa-q-close').onclick = () => this.removeWaQueuePanel();
  },

  async waQueueOpenCurrent() {
    const g = this._waQueue[this._waQueueIndex];
    if (!g) return;
    const ok = await this.openWhatsAppMessage(g.wa, g.message, 'wa_q_' + g.teacherId + '_' + this._waQueueIndex);
    if (ok) Utils.toast('WhatsApp: ' + (g.teacher?.name || '') + ' — tap Send', 'success');
    else Utils.toast('Popup blocked. Allow popups, then click Open WhatsApp again.', 'error');
  },

  waQueueNext(skip) {
    this._waQueueIndex++;
    if (this._waQueueIndex >= this._waQueue.length) {
      this.removeWaQueuePanel();
      Utils.toast(skip ? 'Queue finished' : 'All teachers notified (check each WhatsApp Send)', 'success');
      return;
    }
    this.showWaQueuePanel();
    // Auto-open next chat
    this.waQueueOpenCurrent();
  },

  /**
   * Notify ALL alternate teachers.
   * 1) Tries separate windows/tabs for each (unique window name).
   * 2) Always shows a queue panel so you can Open / Next if Web only kept one tab.
   */
  async notifyAllSubstitutesWhatsApp() {
    if (!this._attDate) this._attDate = new Date();
    const groups = this.getSubstituteNotifyGroups(this._attDate);
    if (!groups.length) {
      Utils.toast('No substitutes assigned for this date', 'info');
      return;
    }
    const missing = groups.filter(g => !g.wa);
    const ready = groups.filter(g => g.wa);
    if (!ready.length) {
      Utils.toast('No phone numbers. Staff → Edit → add WhatsApp/Mobile.', 'error');
      return;
    }

    this._waQueue = ready;
    this._waQueueIndex = 0;

    Utils.toast('Opening WhatsApp for ' + ready.length + ' teacher(s)…', 'info');

    // Open first immediately (same user-gesture tick works best)
    await this.openWhatsAppMessage(ready[0].wa, ready[0].message, 'wa_all_0_' + ready[0].teacherId);

    // Open the rest in unique windows with delay (WhatsApp Web needs time)
    for (let i = 1; i < ready.length; i++) {
      await new Promise(r => setTimeout(r, 1200));
      const g = ready[i];
      await this.openWhatsAppMessage(g.wa, g.message, 'wa_all_' + i + '_' + g.teacherId);
    }

    // Queue panel so user can re-open any / go Next if only one tab appeared
    this.showWaQueuePanel();
    if (missing.length) {
      Utils.toast(missing.length + ' teacher(s) skipped (no phone)', 'info');
    } else {
      Utils.toast('Use Next teacher if a chat did not open. Tap Send in each WhatsApp window.', 'success');
    }
  },

  copySubstituteMessage(teacherId) {
    if (!this._attDate) this._attDate = new Date();
    const g = this.getSubstituteNotifyGroups(this._attDate).find(x => x.teacherId === teacherId);
    if (!g) return;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(g.message).then(() => Utils.toast('Message copied', 'success'));
    } else {
      Utils.toast('Copy not supported', 'error');
    }
  }
};
