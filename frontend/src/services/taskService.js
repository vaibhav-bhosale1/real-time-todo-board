// services/taskService.js
import api from './api'; // Our configured axios instance

export const fetchAllTasks = async () => { // No 'taskData' parameter needed for GET /api/tasks
  try {
    const response = await api.get('/api/tasks'); // Use the 'api' instance to ensure JWT is sent.
                                             // '/tasks' is correct because api.js has baseURL: '/api'
    // Backend's getTasks returns an array directly, so just return response.data
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createTask = async (taskData) => {
  try {
    const response = await api.post('/api/tasks', taskData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateTask = async (taskId, taskData) => {
  try {
    const response = await api.put(`/api/tasks/${taskId}`, taskData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteTask = async (taskId) => {
  try {
    const response = await api.delete(`/api/tasks/${taskId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const smartAssignTask = async (taskId, currentVersion) => {
  try {
    const response = await api.put(`/api/tasks/${taskId}/smart-assign`, { version: currentVersion });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchTaskById = async (taskId) => {
  try {
    const response = await api.get(`/api/tasks/${taskId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};