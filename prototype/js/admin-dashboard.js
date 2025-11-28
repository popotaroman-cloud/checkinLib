// ========================================
// Admin Dashboard Functions
// ระบบเช็คอินคอมพิวเตอร์
// ========================================

// Auto-refresh dashboard data
function initDashboardAutoRefresh(interval = 30000) {
  setInterval(() => {
    refreshDashboardData();
  }, interval);
}

// Refresh all dashboard data
function refreshDashboardData() {
  if (typeof loadStats === 'function') {
    loadStats();
  }
  if (typeof loadRecentActivities === 'function') {
    loadRecentActivities();
  }
  if (typeof loadPCTable === 'function') {
    loadPCTable();
  }
  if (typeof loadMapView === 'function') {
    loadMapView();
  }
  if (typeof loadTableView === 'function') {
    loadTableView();
  }
}

// Monitor - Calculate duration for occupied PCs
function getOccupiedPCsWithDuration() {
  const computers = getComputers();
  return computers
    .filter(pc => pc.status === 'occupied')
    .map(pc => ({
      ...pc,
      duration: calculateDuration(pc.startTime)
    }));
}

// Get PC by status
function getPCsByStatus(status) {
  const computers = getComputers();
  return computers.filter(pc => pc.status === status);
}

// Toggle PC maintenance status
function togglePCMaintenance(pcId) {
  const pc = getComputerById(pcId);

  if (!pc) {
    throw new Error('PC not found');
  }

  if (pc.status === 'occupied') {
    throw new Error('Cannot change status while PC is occupied');
  }

  const newStatus = pc.status === 'maintenance' ? 'available' : 'maintenance';

  return updateComputerStatus(pcId, newStatus, {
    maintenanceNote: newStatus === 'maintenance' ? 'Manual maintenance' : null
  });
}

// Get usage statistics for date range
function getUsageStatsByDateRange(startDate, endDate) {
  const logs = getUsageLogs();

  const filtered = logs.filter(log => {
    const logDate = new Date(log.startTime);
    const start = new Date(startDate);
    const end = new Date(endDate);
    return logDate >= start && logDate <= end;
  });

  return {
    totalSessions: filtered.length,
    totalDuration: filtered.reduce((sum, log) => sum + log.duration, 0),
    averageDuration: filtered.length > 0
      ? Math.round(filtered.reduce((sum, log) => sum + log.duration, 0) / filtered.length)
      : 0,
    uniqueUsers: new Set(filtered.map(log => log.userId)).size,
    averageRating: filtered.filter(log => log.rating).length > 0
      ? (filtered.reduce((sum, log) => sum + (log.rating || 0), 0) / filtered.filter(log => log.rating).length).toFixed(2)
      : 0
  };
}

// Get usage by hour
function getUsageByHour() {
  const logs = getUsageLogs();
  const hourCount = {};

  for (let i = 0; i < 24; i++) {
    hourCount[i] = 0;
  }

  logs.forEach(log => {
    const hour = new Date(log.startTime).getHours();
    hourCount[hour]++;
  });

  return hourCount;
}

// Get usage by faculty
function getUsageByFaculty() {
  const logs = getUsageLogs().filter(log => log.userType === 'internal');
  const facultyCount = {};

  logs.forEach(log => {
    facultyCount[log.faculty] = (facultyCount[log.faculty] || 0) + 1;
  });

  return facultyCount;
}

// Get usage by user type
function getUsageByUserType() {
  const logs = getUsageLogs();
  const typeCount = {
    internal: 0,
    external: 0
  };

  logs.forEach(log => {
    if (typeCount[log.userType] !== undefined) {
      typeCount[log.userType]++;
    }
  });

  return typeCount;
}

// Get peak usage hours
function getPeakUsageHours(topN = 3) {
  const hourCount = getUsageByHour();
  const sorted = Object.entries(hourCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN);

  return sorted.map(([hour, count]) => ({
    hour: `${hour}:00`,
    count
  }));
}

// Get most used PCs
function getMostUsedPCs(topN = 5) {
  const logs = getUsageLogs();
  const pcCount = {};

  logs.forEach(log => {
    pcCount[log.pcId] = (pcCount[log.pcId] || 0) + 1;
  });

  const sorted = Object.entries(pcCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN);

  return sorted.map(([pcId, count]) => ({
    pcId,
    count,
    totalDuration: logs
      .filter(log => log.pcId === pcId)
      .reduce((sum, log) => sum + log.duration, 0)
  }));
}

// Get rating distribution
function getRatingDistribution() {
  const logs = getUsageLogs().filter(log => log.rating);
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  logs.forEach(log => {
    if (log.rating >= 1 && log.rating <= 5) {
      distribution[log.rating]++;
    }
  });

  return distribution;
}

// Validate reservation data
function validateReservationData(data) {
  const errors = [];

  if (!data.studentId || data.studentId.trim() === '') {
    errors.push('Student ID is required');
  }

  if (!data.pcId || data.pcId.trim() === '') {
    errors.push('PC ID is required');
  }

  if (!data.date || data.date.trim() === '') {
    errors.push('Date is required');
  }

  if (!data.time || data.time.trim() === '') {
    errors.push('Time is required');
  }

  // Validate PC exists
  const pc = getComputerById(data.pcId);
  if (!pc) {
    errors.push(`PC ${data.pcId} does not exist`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// Add reservation
function addReservation(data) {
  const validation = validateReservationData(data);

  if (!validation.valid) {
    throw new Error(validation.errors.join(', '));
  }

  const reservations = getReservations();
  const newReservation = {
    id: reservations.length + 1,
    ...data,
    createdAt: new Date().toISOString()
  };

  reservations.push(newReservation);
  localStorage.setItem(CONFIG.STORAGE_KEYS.RESERVATIONS, JSON.stringify(reservations));

  return newReservation;
}

// Parse CSV file
function parseCSV(csvText) {
  const lines = csvText.split('\n').filter(line => line.trim());

  if (lines.length < 2) {
    throw new Error('CSV file is empty');
  }

  const headers = lines[0].split(',').map(h => h.trim());
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const row = {};

    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });

    data.push(row);
  }

  return data;
}

// Import reservations from CSV
function importReservationsFromCSV(csvText) {
  const data = parseCSV(csvText);
  const results = {
    success: 0,
    failed: 0,
    errors: []
  };

  data.forEach((row, index) => {
    try {
      const reservation = {
        studentId: row.student_id || row.studentId,
        pcId: row.pc_id || row.pcId,
        date: row.date,
        time: row.time,
        duration: parseInt(row.duration) || 1,
        purpose: row.purpose || ''
      };

      addReservation(reservation);
      results.success++;
    } catch (error) {
      results.failed++;
      results.errors.push(`Row ${index + 2}: ${error.message}`);
    }
  });

  return results;
}

// Generate QR Code URL
function generateQRCodeURL(pcId) {
  const baseURL = window.location.origin + window.location.pathname.replace(/\/admin\/.*/, '');
  return `${baseURL}/user/idle.html?pc=${pcId}`;
}

// Format time for display
function formatTimeForDisplay(minutes) {
  if (minutes < 60) {
    return `${minutes} นาที`;
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (mins === 0) {
    return `${hours} ชั่วโมง`;
  }

  return `${hours} ชั่วโมง ${mins} นาที`;
}

// Get system health status
function getSystemHealth() {
  const computers = getComputers();
  const total = computers.length;
  const available = computers.filter(pc => pc.status === 'available').length;
  const occupied = computers.filter(pc => pc.status === 'occupied').length;
  const maintenance = computers.filter(pc => pc.status === 'maintenance').length;

  const availablePercent = (available / total) * 100;
  const maintenancePercent = (maintenance / total) * 100;

  let health = 'good';
  if (maintenancePercent > 20) {
    health = 'poor';
  } else if (maintenancePercent > 10 || availablePercent < 30) {
    health = 'fair';
  }

  return {
    health,
    total,
    available,
    occupied,
    maintenance,
    availablePercent: availablePercent.toFixed(1),
    occupiedPercent: ((occupied / total) * 100).toFixed(1),
    maintenancePercent: maintenancePercent.toFixed(1)
  };
}

// Notification system (placeholder)
function sendNotification(title, message, type = 'info') {
  console.log(`[${type.toUpperCase()}] ${title}: ${message}`);
  // In real implementation, this would send email/LINE notification
}

// Backup data
function backupData() {
  const backup = {
    timestamp: new Date().toISOString(),
    computers: getComputers(),
    usageLogs: getUsageLogs(),
    externalUsers: getExternalUsers(),
    reservations: getReservations()
  };

  const json = JSON.stringify(backup, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `backup_${backup.timestamp.split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);

  return backup;
}

// Restore data
function restoreData(jsonText) {
  try {
    const backup = JSON.parse(jsonText);

    if (!backup.computers || !backup.usageLogs) {
      throw new Error('Invalid backup format');
    }

    saveComputers(backup.computers);
    localStorage.setItem(CONFIG.STORAGE_KEYS.USAGE_LOGS, JSON.stringify(backup.usageLogs));
    localStorage.setItem(CONFIG.STORAGE_KEYS.EXTERNAL_USERS, JSON.stringify(backup.externalUsers || []));
    localStorage.setItem(CONFIG.STORAGE_KEYS.RESERVATIONS, JSON.stringify(backup.reservations || []));

    return true;
  } catch (error) {
    throw new Error('Failed to restore backup: ' + error.message);
  }
}

// Clear old logs (cleanup)
function clearOldLogs(daysToKeep = 30) {
  const logs = getUsageLogs();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  const filtered = logs.filter(log => {
    const logDate = new Date(log.startTime);
    return logDate >= cutoffDate;
  });

  localStorage.setItem(CONFIG.STORAGE_KEYS.USAGE_LOGS, JSON.stringify(filtered));

  return {
    original: logs.length,
    remaining: filtered.length,
    deleted: logs.length - filtered.length
  };
}

// Export functions for use in HTML
if (typeof window !== 'undefined') {
  window.AdminDashboard = {
    getOccupiedPCsWithDuration,
    getPCsByStatus,
    togglePCMaintenance,
    getUsageStatsByDateRange,
    getUsageByHour,
    getUsageByFaculty,
    getUsageByUserType,
    getPeakUsageHours,
    getMostUsedPCs,
    getRatingDistribution,
    importReservationsFromCSV,
    generateQRCodeURL,
    formatTimeForDisplay,
    getSystemHealth,
    backupData,
    restoreData,
    clearOldLogs
  };
}
