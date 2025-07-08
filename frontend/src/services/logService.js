// Assuming this is in frontend/src/services/actionLogService.js or similar

import api from './api'; // Our configured axios instance

export const fetchActivityLogs = async () => { // Removed 'limit' parameter
  try {
    // Corrected endpoint to /api/actionlogs
    const response = await api.get(`/api/actionlogs`);
    return response.data;
  } catch (error) {
    throw error;
  }
};