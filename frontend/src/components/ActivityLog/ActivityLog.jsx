import React, { useState, useEffect } from 'react';
import { fetchActivityLogs } from '../../services/logService'; // Import log service
import socket from '../../utils/socket'; // Import socket instance
import './ActivityLog.css'; // Styling for the activity log
import '../common/LoadingSpinner.css'; // For loading spinner

function ActivityLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const MAX_LOGS = 20; // Define maximum number of logs to display

  useEffect(() => {
    const getInitialLogs = async () => {
      try {
        setLoading(true);
        const initialLogs = await fetchActivityLogs(MAX_LOGS);
        setLogs(Array.isArray(initialLogs) ? initialLogs : []);
        setError('');
      } catch (err) {
        console.error('Error fetching activity logs:', err);
        setError(err.response?.data?.message || 'Failed to load activity logs.');
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };

    getInitialLogs();

    // Listen for newActionLogged event
    socket.on('newActionLogged', (newLog) => {
      console.log('newActionLogged event received:', newLog);
      setLogs(prevLogs => {
        const updatedLogs = [newLog, ...prevLogs]; // Prepend new log
        return updatedLogs.slice(0, MAX_LOGS); // Keep only the last MAX_LOGS
      });
    });

    // Cleanup function for socket listener
    return () => {
      socket.off('newActionLogged');
    };
  }, []); // Empty dependency array means this runs once on mount and cleans up on unmount

  if (loading) return <div className="activity-log-loading"><div className="spinner"></div>Loading activity log...</div>;
  if (error) return <div className="activity-log-error">{error}</div>;

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
                {new Date(log.createdAt).toLocaleString()}
              </span>
              <p className="log-description">
                <strong>{log.user?.username || 'Unknown User'}</strong> {log.description}
                {log.taskTitle && ` (Task: "${log.taskTitle}")`}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ActivityLog;