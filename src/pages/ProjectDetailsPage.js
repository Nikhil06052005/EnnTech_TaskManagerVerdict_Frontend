import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { projectAPI, taskAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Plus, Users, BarChart3, Activity } from 'lucide-react';
import '../styles/design-system.css';

const ProjectDetailsPage = () => {
  const { projectId } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [stats, setStats] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    estimatedHours: '',
  });
  const [memberForm, setMemberForm] = useState({ userId: '', role: 'member' });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError('');
        const [projectRes, statsRes, tasksRes] = await Promise.all([
          projectAPI.getById(projectId),
          projectAPI.getStats(projectId),
          taskAPI.getAll(projectId),
        ]);

        setProject(projectRes.data.data);
        setStats(statsRes.data.data);
        setTasks(tasksRes.data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load project');
      } finally {
        setLoading(false);
      }
    };

    if (projectId) loadData();
  }, [projectId]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...taskForm,
        estimatedHours: taskForm.estimatedHours === '' ? 0 : Number(taskForm.estimatedHours),
      };
      await taskAPI.create(projectId, payload);
      setTaskForm({ title: '', description: '', dueDate: '', priority: 'medium', estimatedHours: '' });
      setShowTaskModal(false);

      const res = await taskAPI.getAll(projectId);
      setTasks(res.data.data || []);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await projectAPI.addMember(projectId, memberForm);
      setMemberForm({ userId: '', role: 'member' });
      setShowMemberModal(false);

      const res = await projectAPI.getById(projectId);
      setProject(res.data.data);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[#030304] flex items-center justify-center">
        <div className="text-[#F7931A] font-mono text-lg">Loading project...</div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-[#030304] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#94A3B8] mb-4">{error}</p>
          <Link to="/dashboard" className="btn btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );

  if (!project) return null;

  const canManage =
    project.owner?._id === user?._id ||
    project.members?.some((m) => m.userId?._id === user?._id && m.role === 'admin');

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#030304] via-[#0F1115] to-[#030304]">
      {/* Header */}
      <div className="border-b border-white/10 sticky top-0 z-40 backdrop-blur-sm">
        <div className="container-wide py-4 flex items-center justify-between">
          <Link to="/dashboard" className="btn btn-outline btn-sm flex items-center gap-2">
            <ArrowLeft size={16} />
            Back
          </Link>

          <h1 className="font-heading text-2xl font-bold flex-1 ml-6">{project.name}</h1>

          {canManage && (
            <div className="flex gap-2">
              <button onClick={() => setShowTaskModal(true)} className="btn btn-primary btn-sm">
                <Plus size={16} />
                Add Task
              </button>
              <button onClick={() => setShowMemberModal(true)} className="btn btn-secondary btn-sm">
                <Users size={16} />
                Add Member
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="container-wide py-8">
        {/* Hero Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-12">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-[#F7931A] font-heading">
                  {stats?.totalTasks || 0}
                </div>
                <div className="text-sm text-[#94A3B8] mt-1">Total Tasks</div>
              </div>
              <BarChart3 size={28} className="text-[#F7931A]/50" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-[#FFD600] font-heading">
                  {stats?.completionPercentage || 0}%
                </div>
                <div className="text-sm text-[#94A3B8] mt-1">Completion</div>
              </div>
              <Activity size={28} className="text-[#FFD600]/50" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-white font-heading">
                  {project.members?.length || 0}
                </div>
                <div className="text-sm text-[#94A3B8] mt-1">Members</div>
              </div>
              <Users size={28} className="text-white/50" />
            </div>
          </div>

          <div className="card">
            <div>
              <div className="text-sm font-mono text-[#F7931A] font-bold">{project.status}</div>
              <div className="text-sm text-[#94A3B8] mt-3">
                {formatDate(project.startDate)} → {formatDate(project.endDate)}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Project Info */}
          <div className="lg:col-span-2">
            {/* Description */}
            <div className="card mb-8">
              <h3 className="font-heading text-lg font-bold mb-4 flex items-center gap-2">
                About Project
              </h3>
              <p className="text-[#94A3B8]">{project.description || 'No description added'}</p>
            </div>

            {/* Tasks */}
            <div className="card">
              <h3 className="font-heading text-lg font-bold mb-6">Tasks ({tasks.length})</h3>

              {tasks.length === 0 ? (
                <p className="text-[#94A3B8] text-center py-8">No tasks yet. Create one to get started!</p>
              ) : (
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <Link
                      key={task._id}
                      to={`/project/${projectId}/task/${task._id}`}
                      className="block p-4 bg-white/5 border border-white/10 rounded-lg hover:border-[#F7931A]/50 hover:bg-white/10 transition-all group"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-heading font-semibold text-white group-hover:text-[#F7931A] transition-colors">
                            {task.title}
                          </h4>
                          <p className="text-sm text-[#94A3B8] mt-1 line-clamp-1">
                            {task.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="badge">{task.status}</span>
                          <span className="text-sm text-[#94A3B8]">{formatDate(task.dueDate)}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Team & Activity */}
          <div>
            {/* Team Members */}
            <div className="card mb-8">
              <h3 className="font-heading text-lg font-bold mb-4">Team</h3>
              <div className="space-y-3">
                {project.members && project.members.length > 0 ? (
                  project.members.map((member) => (
                    <div key={member.userId?._id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div>
                        <p className="font-mono text-sm font-bold text-white">
                          {member.userId?.name}
                        </p>
                        <p className="text-xs text-[#94A3B8] mt-1">{member.role}</p>
                      </div>
                      <div className="w-2 h-2 bg-[#22c55e] rounded-full" />
                    </div>
                  ))
                ) : (
                  <p className="text-[#94A3B8] text-sm">No members yet</p>
                )}
              </div>
            </div>

            {/* Project Stats */}
            <div className="card">
              <h3 className="font-heading text-lg font-bold mb-4">Progress</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-[#94A3B8]">Completion</span>
                    <span className="font-bold text-[#F7931A]">{stats?.completionPercentage || 0}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#EA580C] to-[#F7931A] rounded-full"
                      style={{ width: `${stats?.completionPercentage || 0}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                  <div className="text-center">
                    <div className="text-lg font-bold text-[#22c55e]">
                      {stats?.completedTasks || 0}
                    </div>
                    <div className="text-xs text-[#94A3B8] mt-1">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-[#FFD600]">
                      {(stats?.totalTasks || 0) - (stats?.completedTasks || 0)}
                    </div>
                    <div className="text-xs text-[#94A3B8] mt-1">Remaining</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card card-glass w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-heading text-2xl font-bold">Create Task</h2>
              <button
                onClick={() => setShowTaskModal(false)}
                className="text-white/50 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-mono text-[#94A3B8] mb-2">TITLE</label>
                <input
                  type="text"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  required
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-mono text-[#94A3B8] mb-2">DESCRIPTION</label>
                <textarea
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  rows="3"
                  className="input w-full resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-mono text-[#94A3B8] mb-2">DUE DATE</label>
                  <input
                    type="date"
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                    required
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-mono text-[#94A3B8] mb-2">PRIORITY</label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                    className="input w-full"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn btn-primary flex-1">
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showMemberModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card card-glass w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-heading text-2xl font-bold">Add Member</h2>
              <button
                onClick={() => setShowMemberModal(false)}
                className="text-white/50 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-sm font-mono text-[#94A3B8] mb-2">USER ID</label>
                <input
                  type="text"
                  value={memberForm.userId}
                  onChange={(e) => setMemberForm({ ...memberForm, userId: e.target.value })}
                  required
                  className="input w-full font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-mono text-[#94A3B8] mb-2">ROLE</label>
                <select
                  value={memberForm.role}
                  onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}
                  className="input w-full"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn btn-primary flex-1">
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setShowMemberModal(false)}
                  className="btn btn-secondary flex-1"
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

export default ProjectDetailsPage;
