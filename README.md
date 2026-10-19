# School Timetable & Automatic Bell Management System

**Offline HTML application** converted from `Time Table - GGHS 6 11.xlsx`  
Govt. Girls High School 6/11-L, Chichawatni, Sahiwal · Session 2025-26

## How to run

1. Extract the project folder (or open it from this directory).
2. Double-click **`index.html`** (or open it in Chrome / Edge / Firefox).
3. No server, PHP, Node, or internet is required.
4. On first load, seed data from the Excel file is loaded into IndexedDB.
5. Click **Enable School Bell** on the Dashboard (required once per session because browsers block autoplay audio until a user gesture).

## Features

### Headteacher Dashboard
- Live clock (updates every second)
- Current period / activity detection
- Countdown to end of period and next event
- Today’s timeline
- Teacher Busy / Free status (calculated from timetable)
- Class status
- Quick actions

### Automatic Bell System
- Compares current time with period schedule
- Rings at period start (Assembly, Periods, Break, Friday activity)
- Configurable durations and continuous ring for Assembly/Break
- Web Audio API generated bell (no external files)
- Manual ring (Short / Normal / Long)
- Stop bell
- Bell history log
- Prevents duplicate rings after refresh (date-keyed event IDs)

### Timetable
- **Class Wise** view (Excel-style grid with teacher + subject in each cell)
- **Teacher Wise** view with period counts
- **Editor** with conflict detection (teacher double-booking, class conflicts)
- Friday special timetable supported separately from default days
- Day selector (Mon–Sat)
- Print-friendly CSS

### Management
- Staff (add / edit / delete / search) — seeded from Excel staff list
- Subjects — seeded from Excel
- Classes 10th → 3rd
- Scheme of Study sheets
- School settings (name, session, headteacher, etc.)
- Theme (light / dark)

### Backup & Restore
- Automatic backup before important changes
- Manual backup
- Download full JSON
- Import JSON
- Restore from history
- Reset to Excel seed data (with backup)

### Reports
- Teacher workload
- Links to class / teacher / bell schedules

## Data model

Single source of truth in IndexedDB (`SchoolTimetableDB`):

- `school`, `teachers`, `subjects`, `classes`, `rooms`
- `periodTemplates` (default + Friday)
- `bellSettings`
- `timetable[]` — all class/teacher views are generated from this
- `bellHistory`, `auditLog`, `firedBellEvents`, backups

## Browser notes

- **Audio**: Click “Enable School Bell” after opening the page. Browsers require a user interaction before playing sound.
- **Storage**: Uses IndexedDB; falls back to localStorage if needed.
- **Offline**: Fully offline after first open.
- **Urdu**: UTF-8 + `dir="auto"`; teacher and subject names kept exactly as in Excel.

## Folder structure

```
index.html
css/app.css
js/
  app.js          – router & shell
  db.js           – IndexedDB / backup
  state.js        – timetable logic, current period, teacher status
  bell.js         – auto bell, Web Audio tones
  dashboard.js    – live dashboard
  timetable.js    – class/teacher views & editor
  management.js   – staff, subjects, settings, backup, reports
  utils.js
data/seed-data.js – Excel-extracted initial data
README.md
```

## Printing

Use the Print button on Class Wise, Teacher Wise, or Bell Timetable pages.  
Print CSS hides the sidebar and controls; uses landscape A4 for timetable grids.

## Safety

- Conflict detection before saving timetable entries (override available)
- Backup before import / restore / reset
- No `eval()`, HTML escaped in UI
- Validation on import

## Original Excel mapping

| Excel sheet           | App feature              |
|-----------------------|--------------------------|
| staff list            | Staff Management + seed  |
| Class Wise            | Class Wise Timetable     |
| Teacher wise          | Teacher Wise Timetable   |
| Time table for bell   | Bell Timetable + engine  |
| Scheme of study 6–10  | Scheme of Study page     |

---

Built as a self-contained offline school administration tool.  
Open `index.html` and start with the Dashboard.
