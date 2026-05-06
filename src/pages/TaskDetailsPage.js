import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { taskAPI, projectAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/dashboard.css';

const TaskDetailsPage = () => {
  const { projectId, taskId } = useParams();
  const { user } = useAuth();
  const [task, setTask] = useState(null);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comment, setComment] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignUserId, setAssignUserId] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError('');
        const [taskRes, projectRes] = await Promise.all([
          taskAPI.getById(projectId, taskId),
          projectAPI.getById(projectId),
        ]);
        setTask(taskRes.data.data);
        setProject(projectRes.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Task load nahi ho paya');
      } finally {
        setLoading(false);
      }
    };

    if (projectId && taskId) {
      loadData();
    }
  }, [projectId, taskId]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      setActionMessage('');
      await taskAPI.addComment(projectId, taskId, comment);
      setComment('');
      setActionMessage('💬 Comment added!');
      // Reload task
      const res = await taskAPI.getById(projectId, taskId);
      setTask(res.data.data);
    } catch (err) {
      setActionMessage(err.response?.data?.message || 'Comment add nahi ho paya');
    }
  };

  const handleAssignUser = async (e) => {
    e.preventDefault();
    try {
      setActionMessage('');
      await taskAPI.assign(projectId, taskId, { userId: assignUserId });
      setAssignUserId('');
      setShowAssignModal(false);
      setActionMessage('✅ User assigned!');
      const res = await taskAPI.getById(projectId, taskId);
      setTask(res.data.data);
    } catch (err) {
      setActionMessage(err.response?.data?.message || 'Assign nahi ho paya');
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setActionMessage('');
      await taskAPI.updateStatus(projectId, taskId, newStatus);
      setActionMessage('📊 Status updated!');
      const res = await taskAPI.getById(projectId, taskId);
      setTask(res.data.data);
    } catch (err) {
      setActionMessage(err.response?.data?.message || 'Status update nahi ho paya');
    }
  };

  const handleUnassign = async (userId) => {
    try {
      setActionMessage('');
      await taskAPI.unassign(projectId, taskId, userId);
      setActionMessage('👤 User removed!');
      const res = await taskAPI.getById(projectId, taskId);
      setTask(res.data.data);
    } catch (err) {
      setActionMessage(err.response?.data?.message || 'Remove nahi ho paya');
    }
  };

  const handleUpdateField = async (field, value) => {
    try {
      setActionMessage('');
      await taskAPI.update(projectId, taskId, { [field]: value });
      setEditingField(null);
      setActionMessage('✏️ Updated!');
      const res = await taskAPI.getById(projectId, taskId);
      setTask(res.data.data);
    } catch (err) {
      setActionMessage(err.response?.data?.message || 'Update nahi ho paya');
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-content">
          <p>Task load ho raha hai...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="dashboard-content">
          <p className="error-message">{error}</p>
          <Link to={`/project/${projectId}`} className="btn btn-primary">
            Back to Project
          </Link>
        </div>
      </div>
    );
  }

  if (!task) {
    return null;
  }

  const formatDate = (value) => {
    if (!value) return '-';
    return new Date(value).toLocaleDateString('en-IN');
  };

  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="nav-container">
          <h1>📋 Task Details</h1>
          <div className="user-section">
            <Link to={`/project/${projectId}`} className="btn btn-small">
              ← Back
            </Link>
          </div>
        </div>
      </nav>

      <div className="dashboard-content task-details">
        {actionMessage && <div className="success-message">{actionMessage}</div>}

        <div className="task-header">
          <div>
            <h2>{task.title}</h2>
            <p>{task.description || 'No description'}</p>
          </div>
          <select
            className="task-status-select"
            value={task.status}
            onChange={(e) => handleStatusChange(e.target.value)}
          >
            <option value="pending">pending</option>
            <option value="in_progress">in_progress</option>
            <option value="in_review">in_review</option>
            <option value="completed">completed</option>
            <option value="blocked">blocked</option>
          </select>
        </div>

        <div className="task-details-grid">
          <div className="detail-card">
            <h3>📅 Dates</h3>
            <p><strong>Due Date:</strong> {formatDate(task.dueDate)}</p>
            <p><strong>Created:</strong> {formatDate(task.createdAt)}</p>
            {task.completedDate && <p><strong>Completed:</strong> {formatDate(task.completedDate)}</p>}
          </div>

          <div className="detail-card">
            <h3>🎯 Priority & Hours</h3>
            <p><strong>Priority:</strong> {task.priority}</p>
            <p><strong>Estimated Hours:</strong> {task.estimatedHours || 'Not set'}</p>
            <p><strong>Progress:</strong> {task.progressPercentage}%</p>
          </div>

          <div className="detail-card">
            <h3>👤 Created By</h3>
            <p>{task.createdBy?.name || 'Unknown'}</p>
            <p className="text-secondary">{task.createdBy?.email}</p>
          </div>
        </div>

        <div className="detail-card">
          <h3>👥 Team Members Working on This</h3>
          {task.assignedTo && task.assignedTo.length > 0 ? (
            <div className="assignees-list">
              {task.assignedTo.map((assignment) => (
                <div key={assignment.userId?._id} className="assignee-item">
                  <div>
                    <strong>{assignment.userId?.name || 'Unknown'}</strong>
                    {assignment.isLead && <span className="badge">Lead</span>}
                  </div>
                  <button
                    className="btn btn-small"
                    onClick={() => handleUnassign(assignment.userId?._id || assignment.userId)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p>No one assigned yet</p>
          )}
          <button className="btn btn-primary" onClick={() => setShowAssignModal(true)}>
            + Assign Person
          </button>
        </div>

        <div className="detail-card">
          <h3>💬 Comments</h3>
          {task.comments && task.comments.length > 0 ? (
            <div className="comments-list">
              {task.comments.map((cmt, idx) => (
                <div key={idx} className="comment-item">
                  <strong>{cmt.userId?.name || 'User'}</strong>
                  <p>{cmt.text}</p>
                  <small>{formatDate(cmt.createdAt)}</small>
                </div>
              ))}
            </div>
          ) : (
            <p>No comments yet</p>
          )}

          <form onSubmit={handleAddComment} className="comment-form">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment..."
              rows="3"
            />
            <button type="submit" className="btn btn-primary">
              Post Comment
            </button>
          </form>
        </div>
      </div>

      {showAssignModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setShowAssignModal(false)}>
              ✕
            </span>
            <h2>Assign Team Member</h2>
            <p className="helper-text">Project members ka User ID dalo task assign karne ke liye.</p>
            <form onSubmit={handleAssignUser}>
              <div className="form-group">
                <label>Team Member User ID</label>
                <input
                  type="text"
                  value={assignUserId}
                  onChange={(e) => setAssignUserId(e.target.value)}
                  placeholder="User ID"
                  required
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">Assign</button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAssignModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskDetailsPage;
