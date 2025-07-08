import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import io from 'socket.io-client'; // Import Socket.IO client
import './ActivityLog.css';

const socket = io('http://localhost:5000'); // Ensure this matches your backend URL

function ActivityLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      // Fetch the last 20 actions
      const response = await api.get('/actions?limit=20');
      setLogs(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching activity logs:', err);
      setError('Failed to load activity logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();

    // Listen for newActionLogged event
    socket.on('newActionLogged', (newLog) => {
      console.log('New action logged via Socket.IO:', newLog);
      setLogs(prevLogs => {
        const updatedLogs = [newLog, ...prevLogs]; // Prepend new log
        // Keep only the last 20 logs
        return updatedLogs.slice(0, 20);
      });
    });

    // Clean up socket listener
    return () => {
      socket.off('newActionLogged');
    };
  }, []);

  if (loading) return <div className="log-loading-spinner"></div>;
  if (error) return <div className="log-error-message">{error}</div>;

  return (
    <div className="activity-log-panel">
      <h3>Activity Log</h3>
      <div className="log-list">
        {logs.length === 0 ? (
          <p className="no-logs">No recent activity.</p>
        ) : (
          logs.map((log) => (
            <div key={log._id} className="log-entry">
              <span className="log-timestamp">
                {new Date(log.timestamp).toLocaleString()}
              </span>
              <p className="log-description">{log.description}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ActivityLog;