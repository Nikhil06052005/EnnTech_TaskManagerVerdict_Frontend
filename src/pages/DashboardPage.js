import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { projectAPI } from '../services/api';
import { Plus, LogOut, Users, Zap, TrendingUp } from 'lucide-react';
import '../styles/design-system.css';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProjectForTeam, setSelectedProjectForTeam] = useState(null);
  const [memberForm, setMemberForm] = useState({ userId: '', role: 'member' });
  const [actionMessage, setActionMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await projectAPI.getAll();
      setProjects(response.data.data);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await projectAPI.create(formData);
      setShowCreateModal(false);
      setFormData({ name: '', description: '', startDate: '', endDate: '' });
      setActionMessage('✨ Project created successfully!');
      await loadProjects();
      setTimeout(() => setActionMessage(''), 3000);
    } catch (error) {
      console.error('Error creating project:', error);
      setActionMessage('❌ Failed to create project');
    }
  };

  const handleAddMemberFromDashboard = async (e) => {
    e.preventDefault();
    try {
      setActionMessage('');
      await projectAPI.addMember(selectedProjectForTeam._id, memberForm);
      setActionMessage('✅ Team member added!');
      setSelectedProjectForTeam(null);
      setMemberForm({ userId: '', role: 'member' });
      await loadProjects();
      setTimeout(() => setActionMessage(''), 3000);
    } catch (err) {
      setActionMessage(err.response?.data?.message || '❌ Add nahi ho paya');
    }
  };

  const copyUserId = async () => {
    try {
      const fullId = user?._id || '';
      if (!fullId) return;
      await navigator.clipboard.writeText(fullId);
      setActionMessage('📋 User ID copied to clipboard');
      setTimeout(() => setActionMessage(''), 2500);
    } catch (err) {
      console.error('Copy failed', err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#030304] via-[#0F1115] to-[#030304]">
      {/* Navigation */}
      <nav className="border-b border-white/10 backdrop-blur-sm sticky top-0 z-50">
        <div className="container-wide py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#F7931A] to-[#FFD600] rounded-lg flex items-center justify-center">
              <Zap size={24} className="text-black" />
            </div>
            <h1 className="font-heading text-2xl font-bold">
              <span className="text-white">Task</span>
              <span className="gradient-text"> Manager</span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div
              role="button"
              onClick={copyUserId}
              title="Click to copy full User ID"
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full cursor-pointer select-none"
            >
              <span className="font-mono text-sm text-white/60">ID:</span>
              <code className="font-mono text-sm text-[#F7931A]">{user?._id?.slice(-8)}</code>
            </div>
            <button
              onClick={logout}
              className="btn btn-outline btn-sm flex items-center gap-2"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-16 md:py-24 container-wide">
        <div className="max-w-2xl mb-12">
          <h2 className="font-heading text-5xl md:text-6xl font-bold mb-4 leading-tight">
            Welcome back, <span className="gradient-text">{user?.name}</span>
          </h2>
          <p className="text-xl text-[#94A3B8] mb-8">
            Organize tasks, collaborate with teams, and ship projects faster. Your workspace awaits.
          </p>
        </div>

        {/* Share User ID Card */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-8 max-w-2xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="font-heading text-lg font-bold text-white mb-2">Invite Team Members</h3>
              <p className="text-[#94A3B8] text-sm">Share your User ID with teammates to add them to projects</p>
              <div className="mt-4 flex items-center gap-3">
                <code className="bg-white/10 px-4 py-2 rounded font-mono text-[#F7931A] text-sm font-bold">
                  {user?._id}
                </code>
                <button
                  onClick={copyUserId}
                  className="btn btn-primary btn-sm"
                >
                  Copy ID
                </button>
              </div>
            </div>
          </div>
        </div>

        {actionMessage && (
          <div className="mt-4 p-4 bg-white/5 border border-[#F7931A]/50 rounded-lg text-[#F7931A] font-mono text-sm animate-glow-pulse">
            {actionMessage}
          </div>
        )}
      </section>

      {/* Stats Bar */}
      <section className="border-y border-white/10 py-8 container-wide mb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-[#F7931A] font-heading">{projects.length}</div>
            <div className="text-sm text-[#94A3B8] mt-2">Active Projects</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-[#FFD600] font-heading">
              {projects.reduce((sum, p) => sum + (p.members?.length || 0), 0)}
            </div>
            <div className="text-sm text-[#94A3B8] mt-2">Team Members</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white font-heading">
              {projects.reduce((sum, p) => sum + (p.taskCount || 0), 0)}
            </div>
            <div className="text-sm text-[#94A3B8] mt-2">Total Tasks</div>
          </div>
          <div className="text-center">
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary btn-sm w-full"
            >
              <Plus size={16} />
              New Project
            </button>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="container-wide pb-24">
        <h3 className="font-heading text-3xl font-bold mb-12 flex items-center gap-3">
          <TrendingUp size={32} className="text-[#F7931A]" />
          My Projects
        </h3>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card skeleton h-80" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#94A3B8] text-lg">No projects yet. Create your first one!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div key={project._id} className="group card relative overflow-hidden">
                {/* Background glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#F7931A]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Content */}
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-heading text-xl font-bold text-white mb-1">
                        {project.name}
                      </h4>
                      <p className="text-sm text-[#94A3B8] line-clamp-2">
                        {project.description || 'No description'}
                      </p>
                    </div>
                    <span className="badge">{project.status}</span>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 my-6 p-4 bg-white/5 rounded-lg">
                    <div>
                      <div className="text-2xl font-bold text-[#F7931A]">
                        {project.members?.length || 0}
                      </div>
                      <div className="text-xs text-[#94A3B8] flex items-center gap-1 mt-1">
                        <Users size={12} />
                        Members
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-[#FFD600]">
                        {project.taskCount || 0}
                      </div>
                      <div className="text-xs text-[#94A3B8] mt-1">Tasks</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 mt-6">
                    <Link
                      to={`/project/${project._id}`}
                      className="btn btn-primary btn-sm flex-1"
                    >
                      View Project
                    </Link>
                    <button
                      onClick={() => setSelectedProjectForTeam(project)}
                      className="btn btn-secondary btn-sm flex-1 flex items-center justify-center gap-1"
                    >
                      <Users size={14} />
                      Add Member
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card card-glass w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-heading text-2xl font-bold">Create Project</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-white/50 hover:text-white text-2xl font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-sm font-mono text-[#94A3B8] mb-2">
                  PROJECT NAME
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Website Redesign"
                  required
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-mono text-[#94A3B8] mb-2">
                  DESCRIPTION
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="What is this project about?"
                  rows="3"
                  className="input w-full resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-mono text-[#94A3B8] mb-2">
                    START DATE
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-mono text-[#94A3B8] mb-2">
                    END DATE
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    required
                    className="input w-full"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn btn-primary flex-1">
                  <Plus size={16} />
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Team Member Modal */}
      {selectedProjectForTeam && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card card-glass w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-heading text-2xl font-bold">Add Team Member</h2>
              <button
                onClick={() => setSelectedProjectForTeam(null)}
                className="text-white/50 hover:text-white text-2xl font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-[#94A3B8] text-sm mb-6">
              Ask your teammate to share their User ID from their dashboard.
            </p>

            <form onSubmit={handleAddMemberFromDashboard} className="space-y-4">
              <div>
                <label className="block text-sm font-mono text-[#94A3B8] mb-2">
                  TEAMMATE USER ID
                </label>
                <input
                  type="text"
                  value={memberForm.userId}
                  onChange={(e) => setMemberForm({ ...memberForm, userId: e.target.value })}
                  placeholder="Paste user ID"
                  required
                  className="input w-full font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-mono text-[#94A3B8] mb-2">
                  ROLE
                </label>
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
                  <Users size={16} />
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedProjectForTeam(null)}
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

export default DashboardPage;
