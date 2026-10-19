/**
 * DatabaseService - IndexedDB + localStorage abstraction
 * Single source of truth for the school timetable application
 */
const DB = (() => {
  const DB_NAME = 'SchoolTimetableDB';
  const DB_VERSION = 1;
  const STORE = 'appdata';
  const BACKUP_STORE = 'backups';
  let db = null;
  let memoryCache = null;

  function openDB() {
    return new Promise((resolve, reject) => {
      if (db) return resolve(db);
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onerror = () => reject(req.error);
      req.onsuccess = () => {
        db = req.result;
        resolve(db);
      };
      req.onupgradeneeded = (e) => {
        const d = e.target.result;
        if (!d.objectStoreNames.contains(STORE)) {
          d.createObjectStore(STORE, { keyPath: 'key' });
        }
        if (!d.objectStoreNames.contains(BACKUP_STORE)) {
          const bs = d.createObjectStore(BACKUP_STORE, { keyPath: 'id', autoIncrement: true });
          bs.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  async function get(key) {
    try {
      const d = await openDB();
      return new Promise((resolve, reject) => {
        const tx = d.transaction(STORE, 'readonly');
        const req = tx.objectStore(STORE).get(key);
        req.onsuccess = () => resolve(req.result ? req.result.value : null);
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      // Fallback localStorage
      const raw = localStorage.getItem('ST_' + key);
      return raw ? JSON.parse(raw) : null;
    }
  }

  async function set(key, value) {
    memoryCache = value;
    try {
      const d = await openDB();
      return new Promise((resolve, reject) => {
        const tx = d.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).put({ key, value });
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);
      });
    } catch (e) {
      localStorage.setItem('ST_' + key, JSON.stringify(value));
      return true;
    }
  }

  async function loadAppData() {
    let data = await get('main');
    if (!data) {
      data = JSON.parse(JSON.stringify(window.SEED_DATA));
      await set('main', data);
    }
    memoryCache = data;
    return data;
  }

  async function saveAppData(data, reason = 'Auto-save') {
    // Create backup before major saves
    if (reason !== 'silent') {
      await createBackup(data, reason);
    }
    await set('main', data);
    memoryCache = data;
    // Audit
    if (reason !== 'silent' && reason !== 'Auto-save') {
      data.auditLog = data.auditLog || [];
      data.auditLog.unshift({
        id: 'A' + Date.now(),
        timestamp: new Date().toISOString(),
        action: reason,
        description: reason
      });
      if (data.auditLog.length > 500) data.auditLog = data.auditLog.slice(0, 500);
      await set('main', data);
    }
    return true;
  }

  function getCache() {
    return memoryCache;
  }

  async function createBackup(data, reason) {
    try {
      const d = await openDB();
      const snapshot = JSON.parse(JSON.stringify(data));
      // Don't store nested backups inside backup
      snapshot.backups = [];
      const entry = {
        timestamp: new Date().toISOString(),
        reason: reason || 'Manual backup',
        size: JSON.stringify(snapshot).length,
        data: snapshot
      };
      return new Promise((resolve, reject) => {
        const tx = d.transaction(BACKUP_STORE, 'readwrite');
        const store = tx.objectStore(BACKUP_STORE);
        const req = store.add(entry);
        req.onsuccess = () => {
          // Keep only last 30 backups
          const idx = store.index('timestamp');
          const all = idx.openCursor(null, 'prev');
          let count = 0;
          all.onsuccess = (e) => {
            const cursor = e.target.result;
            if (cursor) {
              count++;
              if (count > 30) cursor.delete();
              cursor.continue();
            }
          };
          resolve(req.result);
        };
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn('Backup failed', e);
      return null;
    }
  }

  async function listBackups() {
    try {
      const d = await openDB();
      return new Promise((resolve, reject) => {
        const tx = d.transaction(BACKUP_STORE, 'readonly');
        const req = tx.objectStore(BACKUP_STORE).index('timestamp').getAll();
        req.onsuccess = () => {
          const list = (req.result || []).reverse().map(b => ({
            id: b.id,
            timestamp: b.timestamp,
            reason: b.reason,
            size: b.size
          }));
          resolve(list);
        };
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      return [];
    }
  }

  async function getBackup(id) {
    const d = await openDB();
    return new Promise((resolve, reject) => {
      const tx = d.transaction(BACKUP_STORE, 'readonly');
      const req = tx.objectStore(BACKUP_STORE).get(Number(id));
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function deleteBackup(id) {
    const d = await openDB();
    return new Promise((resolve, reject) => {
      const tx = d.transaction(BACKUP_STORE, 'readwrite');
      tx.objectStore(BACKUP_STORE).delete(Number(id));
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  }

  async function restoreBackup(id) {
    const backup = await getBackup(id);
    if (!backup || !backup.data) throw new Error('Backup not found');
    // Backup current first
    const current = await loadAppData();
    await createBackup(current, 'Before restore');
    await set('main', backup.data);
    memoryCache = backup.data;
    return backup.data;
  }

  async function exportJSON() {
    const data = await loadAppData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `school-timetable-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function importJSON(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (!data.school || !data.teachers || !data.timetable) {
            throw new Error('Invalid timetable backup file');
          }
          const current = await loadAppData();
          await createBackup(current, 'Before import');
          await set('main', data);
          memoryCache = data;
          resolve(data);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }

  async function resetToSeed() {
    const current = await loadAppData();
    await createBackup(current, 'Before reset to default');
    const data = JSON.parse(JSON.stringify(window.SEED_DATA));
    await set('main', data);
    memoryCache = data;
    return data;
  }

  return {
    loadAppData, saveAppData, getCache, createBackup,
    listBackups, getBackup, deleteBackup, restoreBackup,
    exportJSON, importJSON, resetToSeed
  };
})();
