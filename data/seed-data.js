// Seed data extracted from Time Table - GGHS 6 11.xlsx
// Single source of truth for the application
window.SEED_DATA = {
  version: 1,
  school: {
    name: "Govt. High School 175/9-L",
    code: "GHS-175-9-L",
    district: "Sahiwal",
    tehsil: "Chichawatni",
    address: "175/9-L, Chichawatni, Sahiwal",
    phone: "",
    email: "",
    session: "2025-26",
    headteacher: "Headmaster",
    logo: ""
  },
  teachers: [
    { id: "T001", name: "محمد شاہد", subject: "اردو", classes: ["10th"], availability: "1-6", status: "active" },
    { id: "T002", name: "غلام محمد", subject: "انگلش / کمپیوٹرسائنس / سکلز ڈیولپمنٹ", classes: ["10th","9th","8th"], availability: "1-6", status: "active" },
    { id: "T003", name: "فرخ امین", subject: "ریاضی / کیمسٹری / بائیولوجی / لائبریری", classes: ["10th","9th"], availability: "1-6", status: "active" },
    { id: "T004", name: "عبدالجبار شاہد", subject: "اسلامیات / انگلش / اردو", classes: ["10th","9th","8th","7th"], availability: "1-6", status: "active" },
    { id: "T005", name: "امجد فاروق ندیم", subject: "ریاضی / کیمسٹری / فزکس / مطالعہ پاکستان", classes: ["10th"], availability: "1-6", status: "active" },
    { id: "T006", name: "محمد عبداللہ سلیم", subject: "کمپیوٹرسائنس", classes: ["8th"], availability: "1-4,6", status: "active" },
    { id: "T007", name: "سلمان یوسف", subject: "عربی / انگلش / ریاضی / مطالعہ پاکستان / تاریخ اور جغرافیہ", classes: ["10th","9th","8th","6th"], availability: "1-6", status: "active" },
    { id: "T008", name: "حسن رضا", subject: "ریاضی جنرل / انگلش / Dril", classes: ["10th","9th","7th"], availability: "1-6", status: "active" },
    { id: "T009", name: "طالب حسین", subject: "فزکس / اسلامیات / اردو / تاریخ اور جغرافیہ", classes: ["9th","8th","7th","6th"], availability: "1-6", status: "active" },
    { id: "T010", name: "محمد افضل", subject: "بائیولوجی / ناظرہ قرآن / تاریخ اور جغرافیہ / اردو", classes: ["8th","7th","6th"], availability: "1-6", status: "active" },
    { id: "T011", name: "وحید احمد", subject: "کیمسٹری / فزکس / سائنس / اردو / اسلامیات", classes: ["9th","7th"], availability: "1-6", status: "active" },
    { id: "T012", name: "محمد احمد", subject: "زراعت / کمپیوٹرسائنس", classes: ["7th","6th"], availability: "1-6", status: "active" },
    { id: "T013", name: "ریحان علی", subject: "لائبریری / سائنس / ریاضی", classes: ["8th","7th","6th"], availability: "1-6", status: "active" },
    { id: "T014", name: "عرفان رحمت", subject: "تاریخ اور جغرافیہ / اسلامیات / ناظرہ + ترجمہ قرآن", classes: ["10th","9th","7th","3rd"], availability: "1-6", status: "active" },
    { id: "T015", name: "محمد زاہد", subject: "اسلامیات اختیاری / سائنس / انگلش / اردو / کمپیوٹرسائنس / ریاضی / تاریخ اور جغرافیہ / ناظرہ", classes: ["5th","4th"], availability: "1-6", status: "active" },
    { id: "T016", name: "علی رضا", subject: "ناظرہ / انگلش / سائنس / کمپیوٹرسائنس / ریاضی / تاریخ اور جغرافیہ / اردو / اسلامیات", classes: ["5th","4th","3rd"], availability: "1-6", status: "active" },
    { id: "T017", name: "شاہد محمود", subject: "فزیکل ایجوکیشن / انگلش / اسلامیات / سائنس / کمپیوٹرسائنس / ریاضی / تاریخ اور جغرافیہ / ناظرہ / اردو", classes: ["5th","3rd"], availability: "1-6", status: "active" }
  ],
  subjects: [
    { id: "S001", name: "اردو", shortName: "اردو", code: "URD", color: "#1e40af", active: true },
    { id: "S002", name: "انگلش", shortName: "Eng", code: "ENG", color: "#047857", active: true },
    { id: "S003", name: "ریاضی", shortName: "Math", code: "MATH", color: "#b45309", active: true },
    { id: "S004", name: "اسلامیات", shortName: "Isl", code: "ISL", color: "#7c3aed", active: true },
    { id: "S005", name: "مطالعہ پاکستان", shortName: "Pak St", code: "PST", color: "#be185d", active: true },
    { id: "S006", name: "کمپیوٹرسائنس", shortName: "CS", code: "CS", color: "#0369a1", active: true },
    { id: "S007", name: "عربی", shortName: "Arb", code: "ARB", color: "#0f766e", active: true },
    { id: "S008", name: "ریاضی جنرل", shortName: "G.Math", code: "GM", color: "#a16207", active: true },
    { id: "S009", name: "فزکس", shortName: "Phy", code: "PHY", color: "#dc2626", active: true },
    { id: "S010", name: "بائیولوجی", shortName: "Bio", code: "BIO", color: "#16a34a", active: true },
    { id: "S011", name: "کیمسٹری", shortName: "Chem", code: "CHM", color: "#ea580c", active: true },
    { id: "S012", name: "زراعت", shortName: "Agri", code: "AGR", color: "#65a30d", active: true },
    { id: "S013", name: "لائبریری", shortName: "Lib", code: "LIB", color: "#475569", active: true },
    { id: "S014", name: "تاریخ اور جغرافیہ", shortName: "Hist/Geo", code: "HG", color: "#9333ea", active: true },
    { id: "S015", name: "اسلامیات اختیاری", shortName: "Isl Opt", code: "ISO", color: "#6d28d9", active: true },
    { id: "S016", name: "ناظرہ", shortName: "Naz", code: "NAZ", color: "#0891b2", active: true },
    { id: "S017", name: "فزیکل ایجوکیشن", shortName: "PE", code: "PE", color: "#e11d48", active: true },
    { id: "S018", name: "سائنس", shortName: "Sci", code: "SCI", color: "#059669", active: true },
    { id: "S019", name: "جنرل سائنس", shortName: "G.Sci", code: "GSC", color: "#10b981", active: true },
    { id: "S020", name: "معاشرتی علوم", shortName: "Soc", code: "SOC", color: "#8b5cf6", active: true },
    { id: "S021", name: "ناظرہ قرآن", shortName: "Naz Q", code: "NQ", color: "#0e7490", active: true },
    { id: "S022", name: "ناظرہ   + ترجمہ قرآن", shortName: "Naz+Tar", code: "NT", color: "#155e75", active: true },
    { id: "S023", name: "LND", shortName: "LND", code: "LND", color: "#64748b", active: true },
    { id: "S024", name: "Dril", shortName: "Drill", code: "DRL", color: "#f43f5e", active: true },
    { id: "S025", name: "سکلز ڈیولپمنٹ", shortName: "Skills", code: "SKL", color: "#f59e0b", active: true }
  ],
  classes: [
    { id: "C10", name: "10th", section: "", classTeacher: "T005", room: "10", students: 0, active: true },
    { id: "C09", name: "9th", section: "", classTeacher: "T011", room: "9", students: 0, active: true },
    { id: "C08", name: "8th", section: "", classTeacher: "T009", room: "8", students: 0, active: true },
    { id: "C07", name: "7th", section: "", classTeacher: "T004", room: "7", students: 0, active: true },
    { id: "C06", name: "6th", section: "", classTeacher: "T007", room: "6", students: 0, active: true },
    { id: "C05", name: "5th", section: "", classTeacher: "T016", room: "5", students: 0, active: true },
    { id: "C04", name: "4th", section: "", classTeacher: "T015", room: "4", students: 0, active: true },
    { id: "C03", name: "3rd", section: "", classTeacher: "T017", room: "3", students: 0, active: true }
  ],
  rooms: [
    { id: "R10", name: "Room 10", capacity: 40 },
    { id: "R09", name: "Room 9", capacity: 40 },
    { id: "R08", name: "Room 8", capacity: 40 },
    { id: "R07", name: "Room 7", capacity: 40 },
    { id: "R06", name: "Room 6", capacity: 40 },
    { id: "R05", name: "Room 5", capacity: 35 },
    { id: "R04", name: "Room 4", capacity: 35 },
    { id: "R03", name: "Room 3", capacity: 30 }
  ],
  workingDays: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
  // Normal day period templates (Sun/Mon-Thu/Sat style)
  periodTemplates: {
    default: [
      { id: "P0", name: "Assembly", type: "assembly", start: "08:00", end: "08:15", duration: 15, bell: true, active: true },
      { id: "P1", name: "Period 1", type: "period", start: "08:15", end: "08:50", duration: 35, bell: true, active: true },
      { id: "P2", name: "Period 2", type: "period", start: "08:50", end: "09:25", duration: 35, bell: true, active: true },
      { id: "P3", name: "Period 3", type: "period", start: "09:25", end: "10:00", duration: 35, bell: true, active: true },
      { id: "P4", name: "Period 4", type: "period", start: "10:00", end: "10:35", duration: 35, bell: true, active: true },
      { id: "P5", name: "Period 5", type: "period", start: "10:35", end: "11:10", duration: 35, bell: true, active: true },
      { id: "P6", name: "Period 6", type: "period", start: "11:10", end: "11:45", duration: 35, bell: true, active: true },
      { id: "PB", name: "تفریح (Break)", type: "break", start: "11:45", end: "12:15", duration: 30, bell: true, active: true },
      { id: "P7", name: "Period 7", type: "period", start: "12:15", end: "12:45", duration: 30, bell: true, active: true },
      { id: "P8", name: "Period 8", type: "period", start: "12:45", end: "13:15", duration: 30, bell: true, active: true },
      { id: "P9", name: "Period 9", type: "period", start: "13:15", end: "13:45", duration: 30, bell: true, active: true },
      { id: "PSO", name: "School Over", type: "dismiss", start: "13:45", end: "13:50", duration: 5, bell: true, active: true }
    ],
    Friday: [
      { id: "P0", name: "Assembly", type: "assembly", start: "08:00", end: "08:15", duration: 15, bell: true, active: true },
      { id: "P1", name: "Period 1", type: "period", start: "08:15", end: "09:00", duration: 45, bell: true, active: true },
      { id: "P2", name: "Period 2", type: "period", start: "09:00", end: "09:35", duration: 35, bell: true, active: true },
      { id: "P3", name: "Period 3", type: "period", start: "09:35", end: "10:10", duration: 35, bell: true, active: true },
      { id: "P4", name: "Period 4", type: "period", start: "10:10", end: "10:45", duration: 35, bell: true, active: true },
      { id: "P5", name: "Period 5", type: "period", start: "10:45", end: "11:20", duration: 35, bell: true, active: true },
      { id: "P6", name: "Period 6", type: "period", start: "11:20", end: "11:55", duration: 35, bell: true, active: true },
      { id: "PB", name: "بزمِ ادب", type: "activity", start: "11:55", end: "12:30", duration: 35, bell: true, active: true },
      { id: "PSO", name: "School Over", type: "dismiss", start: "12:30", end: "12:35", duration: 5, bell: true, active: true }
    ]
  },
  bellSettings: {
    enabled: true,
    normalDuration: 5,
    assemblyDuration: 10,
    breakDuration: 15,
    breakEndDuration: 20,
    dismissDuration: 12,
    specialDuration: 8,
    assemblyMode: "single",
    breakMode: "continuous",
    assemblyRingInterval: 5,
    breakRingInterval: 4,
    continuousTotalDuration: 40,
    ringSpeed: "normal",
    soundType: "default",
    customSoundData: null,
    customSoundName: null
  },
  specialEvents: [],
  holidays: [],
  // Timetable entries: day can be "all" for weekly repeating, or specific day
  // days field: "1-6" means Mon-Sat, "1-5" Mon-Fri, "6" Saturday only, "1-4,6" etc.
  timetable: [
    // 10th
    { id: "TT001", days: "1-6", classId: "C10", period: "P1", teacherId: "T005", subjectId: "S003", room: "10", notes: "" },
    { id: "TT002", days: "1-6", classId: "C10", period: "P2", teacherId: "T005", subjectId: "S011", room: "10", notes: "" },
    { id: "TT003", days: "1-6", classId: "C10", period: "P3", teacherId: "T005", subjectId: "S009", room: "10", notes: "" },
    { id: "TT004", days: "1-6", classId: "C10", period: "P4", teacherId: "T003", subjectId: "S010", room: "10", notes: "" },
    { id: "TT004b", days: "1-6", classId: "C10", period: "P4", teacherId: "T002", subjectId: "S006", room: "10", notes: "alt" },
    { id: "TT005", days: "1-6", classId: "C10", period: "P5", teacherId: "T007", subjectId: "S005", room: "10", notes: "" },
    { id: "TT006", days: "1-5", classId: "C10", period: "P6", teacherId: "T004", subjectId: "S001", room: "10", notes: "" },
    { id: "TT007", days: "1-6", classId: "C10", period: "P7", teacherId: "T014", subjectId: "S022", room: "10", notes: "" },
    { id: "TT008", days: "1-4,6", classId: "C10", period: "P8", teacherId: "T008", subjectId: "S002", room: "10", notes: "" },
    { id: "TT008b", days: "6", classId: "C10", period: "P8", teacherId: "T003", subjectId: "S013", room: "10", notes: "Sat" },
    { id: "TT009", days: "1-4,6", classId: "C10", period: "P9", teacherId: "T008", subjectId: "S002", room: "10", notes: "" },
    { id: "TT009b", days: "6", classId: "C10", period: "P9", teacherId: "T002", subjectId: "S025", room: "10", notes: "Sat" },

    // 9th
    { id: "TT010", days: "1-6", classId: "C09", period: "P1", teacherId: "T011", subjectId: "S009", room: "9", notes: "" },
    { id: "TT011", days: "1-6", classId: "C09", period: "P2", teacherId: "T003", subjectId: "S011", room: "9", notes: "" },
    { id: "TT011b", days: "6", classId: "C09", period: "P2", teacherId: "T002", subjectId: "S025", room: "9", notes: "Sat" },
    { id: "TT012", days: "1-6", classId: "C09", period: "P3", teacherId: "T003", subjectId: "S010", room: "9", notes: "" },
    { id: "TT012b", days: "1-6", classId: "C09", period: "P3", teacherId: "T002", subjectId: "S006", room: "9", notes: "alt" },
    { id: "TT013", days: "1-6", classId: "C09", period: "P4", teacherId: "T008", subjectId: "S002", room: "9", notes: "" },
    { id: "TT014", days: "1-6", classId: "C09", period: "P5", teacherId: "T008", subjectId: "S002", room: "9", notes: "" },
    { id: "TT015", days: "1-6", classId: "C09", period: "P6", teacherId: "T007", subjectId: "S003", room: "9", notes: "" },
    { id: "TT016", days: "1-6", classId: "C09", period: "P7", teacherId: "T011", subjectId: "S001", room: "9", notes: "" },
    { id: "TT017", days: "1-4,6", classId: "C09", period: "P8", teacherId: "T011", subjectId: "S004", room: "9", notes: "" },
    { id: "TT018", days: "1-4,6", classId: "C09", period: "P9", teacherId: "T014", subjectId: "S022", room: "9", notes: "" },

    // 8th
    { id: "TT019", days: "1-6", classId: "C08", period: "P1", teacherId: "T009", subjectId: "S004", room: "8", notes: "" },
    { id: "TT020", days: "1-6", classId: "C08", period: "P2", teacherId: "T010", subjectId: "S021", room: "8", notes: "" },
    { id: "TT021", days: "1-6", classId: "C08", period: "P3", teacherId: "T004", subjectId: "S002", room: "8", notes: "" },
    { id: "TT022", days: "1-6", classId: "C08", period: "P4", teacherId: "T004", subjectId: "S002", room: "8", notes: "" },
    { id: "TT023", days: "1-6", classId: "C08", period: "P5", teacherId: "T013", subjectId: "S003", room: "8", notes: "" },
    { id: "TT024", days: "1-6", classId: "C08", period: "P6", teacherId: "T002", subjectId: "S006", room: "8", notes: "" },
    { id: "TT025", days: "1-6", classId: "C08", period: "P7", teacherId: "T013", subjectId: "S018", room: "8", notes: "" },
    { id: "TT026", days: "1-4,6", classId: "C08", period: "P8", teacherId: "T009", subjectId: "S001", room: "8", notes: "" },
    { id: "TT027", days: "1-4,6", classId: "C08", period: "P9", teacherId: "T007", subjectId: "S014", room: "8", notes: "" },

    // 7th
    { id: "TT028", days: "1-6", classId: "C07", period: "P1", teacherId: "T004", subjectId: "S002", room: "7", notes: "" },
    { id: "TT029", days: "1-5", classId: "C07", period: "P2", teacherId: "T004", subjectId: "S002", room: "7", notes: "" },
    { id: "TT029b", days: "6", classId: "C07", period: "P2", teacherId: "T008", subjectId: "S024", room: "7", notes: "Sat Drill" },
    { id: "TT030", days: "1-6", classId: "C07", period: "P3", teacherId: "T011", subjectId: "S018", room: "7", notes: "" },
    { id: "TT031", days: "1-6", classId: "C07", period: "P4", teacherId: "T014", subjectId: "S004", room: "7", notes: "" },
    { id: "TT032", days: "1-6", classId: "C07", period: "P5", teacherId: "T010", subjectId: "S022", room: "7", notes: "" },
    { id: "TT033", days: "1-6", classId: "C07", period: "P6", teacherId: "T010", subjectId: "S014", room: "7", notes: "" },
    { id: "TT034", days: "1-6", classId: "C07", period: "P7", teacherId: "T012", subjectId: "S006", room: "7", notes: "" },
    { id: "TT035", days: "1-4,6", classId: "C07", period: "P8", teacherId: "T013", subjectId: "S003", room: "7", notes: "" },
    { id: "TT036", days: "1-4,6", classId: "C07", period: "P9", teacherId: "T009", subjectId: "S001", room: "7", notes: "" },

    // 6th
    { id: "TT037", days: "1-6", classId: "C06", period: "P1", teacherId: "T007", subjectId: "S002", room: "6", notes: "" },
    { id: "TT038", days: "1-6", classId: "C06", period: "P2", teacherId: "T007", subjectId: "S002", room: "6", notes: "" },
    { id: "TT039", days: "1-6", classId: "C06", period: "P3", teacherId: "T013", subjectId: "S018", room: "6", notes: "" },
    { id: "TT040", days: "1-6", classId: "C06", period: "P4", teacherId: "T009", subjectId: "S004", room: "6", notes: "" },
    { id: "TT041", days: "1-6", classId: "C06", period: "P5", teacherId: "T012", subjectId: "S006", room: "6", notes: "" },
    { id: "TT042", days: "1-6", classId: "C06", period: "P6", teacherId: "T013", subjectId: "S003", room: "6", notes: "" },
    { id: "TT043", days: "1-6", classId: "C06", period: "P7", teacherId: "T009", subjectId: "S014", room: "6", notes: "" },
    { id: "TT044", days: "1-4,6", classId: "C06", period: "P8", teacherId: "T010", subjectId: "S022", room: "6", notes: "" },
    { id: "TT045", days: "1-4,6", classId: "C06", period: "P9", teacherId: "T010", subjectId: "S001", room: "6", notes: "" },

    // 5th
    { id: "TT046", days: "1-6", classId: "C05", period: "P1", teacherId: "T016", subjectId: "S002", room: "5", notes: "" },
    { id: "TT047", days: "1-6", classId: "C05", period: "P2", teacherId: "T016", subjectId: "S002", room: "5", notes: "" },
    { id: "TT048", days: "1-6", classId: "C05", period: "P3", teacherId: "T015", subjectId: "S018", room: "5", notes: "" },
    { id: "TT049", days: "1-6", classId: "C05", period: "P4", teacherId: "T017", subjectId: "S004", room: "5", notes: "" },
    { id: "TT050", days: "1-6", classId: "C05", period: "P5", teacherId: "T016", subjectId: "S006", room: "5", notes: "" },
    { id: "TT051", days: "1-6", classId: "C05", period: "P6", teacherId: "T016", subjectId: "S003", room: "5", notes: "" },
    { id: "TT052", days: "1-6", classId: "C05", period: "P7", teacherId: "T016", subjectId: "S014", room: "5", notes: "" },
    { id: "TT053", days: "1-4,6", classId: "C05", period: "P8", teacherId: "T016", subjectId: "S022", room: "5", notes: "" },
    { id: "TT054", days: "1-4,6", classId: "C05", period: "P9", teacherId: "T016", subjectId: "S001", room: "5", notes: "" },

    // 4th
    { id: "TT055", days: "1-6", classId: "C04", period: "P1", teacherId: "T015", subjectId: "S002", room: "4", notes: "" },
    { id: "TT056", days: "1-6", classId: "C04", period: "P2", teacherId: "T015", subjectId: "S002", room: "4", notes: "" },
    { id: "TT057", days: "1-6", classId: "C04", period: "P3", teacherId: "T016", subjectId: "S018", room: "4", notes: "" },
    { id: "TT058", days: "1-6", classId: "C04", period: "P4", teacherId: "T015", subjectId: "S004", room: "4", notes: "" },
    { id: "TT059", days: "1-6", classId: "C04", period: "P5", teacherId: "T015", subjectId: "S006", room: "4", notes: "" },
    { id: "TT060", days: "1-6", classId: "C04", period: "P6", teacherId: "T015", subjectId: "S003", room: "4", notes: "" },
    { id: "TT061", days: "1-6", classId: "C04", period: "P7", teacherId: "T015", subjectId: "S014", room: "4", notes: "" },
    { id: "TT062", days: "1-4,6", classId: "C04", period: "P8", teacherId: "T015", subjectId: "S022", room: "4", notes: "" },
    { id: "TT063", days: "1-4,6", classId: "C04", period: "P9", teacherId: "T015", subjectId: "S001", room: "4", notes: "" },

    // 3rd
    { id: "TT064", days: "1-6", classId: "C03", period: "P1", teacherId: "T017", subjectId: "S002", room: "3", notes: "" },
    { id: "TT065", days: "1-6", classId: "C03", period: "P2", teacherId: "T017", subjectId: "S002", room: "3", notes: "" },
    { id: "TT066", days: "1-6", classId: "C03", period: "P3", teacherId: "T014", subjectId: "S018", room: "3", notes: "" },
    { id: "TT067", days: "1-6", classId: "C03", period: "P4", teacherId: "T016", subjectId: "S004", room: "3", notes: "" },
    { id: "TT068", days: "1-6", classId: "C03", period: "P5", teacherId: "T017", subjectId: "S006", room: "3", notes: "" },
    { id: "TT069", days: "1-6", classId: "C03", period: "P6", teacherId: "T017", subjectId: "S003", room: "3", notes: "" },
    { id: "TT070", days: "1-6", classId: "C03", period: "P7", teacherId: "T017", subjectId: "S014", room: "3", notes: "" },
    { id: "TT071", days: "1-4,6", classId: "C03", period: "P8", teacherId: "T017", subjectId: "S022", room: "3", notes: "" },
    { id: "TT072", days: "1-4,6", classId: "C03", period: "P9", teacherId: "T017", subjectId: "S001", room: "3", notes: "" }
  ],
  schemesOfStudy: {
    "10th": { periods: ["P1","P2","P3","P4","P5","P6","P7","P8","P9"], teachers: {}, subjects: {}, topics: {} },
    "9th": { periods: ["P1","P2","P3","P4","P5","P6","P7","P8","P9"], teachers: {}, subjects: {}, topics: {} },
    "8th": { periods: ["P1","P2","P3","P4","P5","P6","P7","P8","P9"], teachers: {}, subjects: {}, topics: {} },
    "7th": { periods: ["P1","P2","P3","P4","P5","P6","P7","P8","P9"], teachers: {}, subjects: {}, topics: {} },
    "6th": { periods: ["P1","P2","P3","P4","P5","P6","P7","P8","P9"], teachers: {}, subjects: {}, topics: {} }
  },
  bellHistory: [],
  auditLog: [],
  backups: [],
  firedBellEvents: {}, // date-keyed event IDs that already fired
  // teacherAttendance: { "YYYY-MM-DD": { "T001": "present"|"leave", ... } }
  teacherAttendance: {},
  // substitutions: alternative cover when teacher on leave
  // { id, date, classId, period, originalTeacherId, substituteTeacherId, subjectId, originalEntryId, notes }
  substitutions: []
};
