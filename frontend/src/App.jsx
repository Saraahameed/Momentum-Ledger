import { useEffect, useMemo, useState } from 'react';
import {
  createTask,
  deleteTask,
  getMe,
  getTasks,
  login,
  logout,
  register,
  updateTask,
  getProjects,
  createProject,
  updateProject,
  deleteProject
} from './api.js';

const PRIORITY_OPTIONS = ['low', 'medium', 'high'];

function formatDate(value) {
  if (!value) return 'No due date';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'No due date';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function toInputDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
}

export default function App() {
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(true);

  const [tasks, setTasks] = useState([]);
  const [taskForm, setTaskForm] = useState({
    title: '',
    project: '',
    dueDate: '',
    priority: 'medium',
    notes: ''
  });
  const [editingTask, setEditingTask] = useState(null);
  const [taskError, setTaskError] = useState('');
  const [taskLoading, setTaskLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterProject, setFilterProject] = useState('all');

  const [projects, setProjects] = useState([]);
  const [projectForm, setProjectForm] = useState({ name: '', description: '', color: '#1f7f7b' });
  const [editingProject, setEditingProject] = useState(null);
  const [projectError, setProjectError] = useState('');
  const [showProjectForm, setShowProjectForm] = useState(false);

  useEffect(() => {
    let active = true;
    const boot = async () => {
      try {
        const { user: currentUser } = await getMe();
        if (!active) return;
        setUser(currentUser);
        const [tasksData, projectsData] = await Promise.all([getTasks(), getProjects()]);
        if (!active) return;
        setTasks(tasksData.tasks || []);
        setProjects(projectsData.projects || []);
      } catch (error) {
        if (active) {
          setUser(null);
        }
      } finally {
        if (active) {
          setAuthLoading(false);
        }
      }
    };

    boot();
    return () => {
      active = false;
    };
  }, []);

  const projectOptions = useMemo(() => {
    const projectNames = projects.map((p) => p.name);
    return ['all', ...projectNames];
  }, [projects]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const statusOk = filterStatus === 'all' || task.status === filterStatus;
      const projectOk = filterProject === 'all' || task.project === filterProject;
      return statusOk && projectOk;
    });
  }, [tasks, filterStatus, filterProject]);

  const taskCounts = useMemo(() => {
    const open = tasks.filter((task) => task.status === 'open').length;
    const done = tasks.filter((task) => task.status === 'done').length;
    return { open, done };
  }, [tasks]);

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    setAuthError('');

    try {
      const payload = {
        email: authForm.email.trim(),
        password: authForm.password
      };
      if (authMode === 'register') {
        payload.name = authForm.name.trim();
      }

      const response = authMode === 'login' ? await login(payload) : await register(payload);
      setUser(response.user);
      const [tasksData, projectsData] = await Promise.all([getTasks(), getProjects()]);
      setTasks(tasksData.tasks || []);
      setProjects(projectsData.projects || []);
    } catch (error) {
      setAuthError(error.message || 'Authentication failed.');
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setTasks([]);
    setProjects([]);
    setAuthForm({ name: '', email: '', password: '' });
  };

  const handleTaskSubmit = async (event) => {
    event.preventDefault();
    setTaskError('');
    setTaskLoading(true);
    try {
      const payload = {
        title: taskForm.title.trim(),
        project: taskForm.project.trim(),
        dueDate: taskForm.dueDate,
        priority: taskForm.priority,
        notes: taskForm.notes.trim()
      };

      if (editingTask) {
        const response = await updateTask(editingTask.id, payload);
        setTasks((prev) => prev.map((item) => (item.id === editingTask.id ? response.task : item)));
        setEditingTask(null);
      } else {
        const response = await createTask(payload);
        setTasks((prev) => [response.task, ...prev]);
      }
      setTaskForm({ title: '', project: '', dueDate: '', priority: 'medium', notes: '' });
    } catch (error) {
      setTaskError(error.message || 'Could not save task.');
    } finally {
      setTaskLoading(false);
    }
  };

  const startEditTask = (task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      project: task.project || '',
      dueDate: toInputDate(task.dueDate),
      priority: task.priority,
      notes: task.notes || ''
    });
    setTaskError('');
  };

  const cancelEditTask = () => {
    setEditingTask(null);
    setTaskForm({ title: '', project: '', dueDate: '', priority: 'medium', notes: '' });
    setTaskError('');
  };

  const toggleTask = async (task) => {
    const nextStatus = task.status === 'done' ? 'open' : 'done';
    try {
      const response = await updateTask(task.id, { status: nextStatus });
      setTasks((prev) => prev.map((item) => (item.id === task.id ? response.task : item)));
    } catch (error) {
      setTaskError(error.message || 'Could not update task.');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTask(taskId);
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
    } catch (error) {
      setTaskError(error.message || 'Could not delete task.');
    }
  };

  const handleProjectSubmit = async (event) => {
    event.preventDefault();
    setProjectError('');
    try {
      const payload = {
        name: projectForm.name.trim(),
        description: projectForm.description.trim(),
        color: projectForm.color
      };

      if (editingProject) {
        const response = await updateProject(editingProject.id, payload);
        setProjects((prev) => prev.map((item) => (item.id === editingProject.id ? response.project : item)));
        setEditingProject(null);
      } else {
        const response = await createProject(payload);
        setProjects((prev) => [...prev, response.project].sort((a, b) => a.name.localeCompare(b.name)));
      }
      setProjectForm({ name: '', description: '', color: '#1f7f7b' });
      setShowProjectForm(false);
    } catch (error) {
      setProjectError(error.message || 'Could not save project.');
    }
  };

  const startEditProject = (project) => {
    setEditingProject(project);
    setProjectForm({
      name: project.name,
      description: project.description || '',
      color: project.color || '#1f7f7b'
    });
    setShowProjectForm(true);
    setProjectError('');
  };

  const cancelEditProject = () => {
    setEditingProject(null);
    setProjectForm({ name: '', description: '', color: '#1f7f7b' });
    setShowProjectForm(false);
    setProjectError('');
  };

  const handleDeleteProject = async (projectId) => {
    try {
      await deleteProject(projectId);
      setProjects((prev) => prev.filter((project) => project.id !== projectId));
    } catch (error) {
      setProjectError(error.message || 'Could not delete project.');
    }
  };

  if (authLoading) {
    return (
      <div className="page-loader">
        <div className="loader-ring"></div>
        <p>Loading your workspace...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="auth-layout">
        <section className="auth-card fade-up">
          <div className="brand">
            <span className="brand-mark">ML</span>
            <div>
              <h1>Momentum Ledger</h1>
              <p>Organize tasks, protect focus, and keep every day accountable.</p>
            </div>
          </div>

          <div className="auth-tabs">
            <button
              type="button"
              className={authMode === 'login' ? 'active' : ''}
              onClick={() => setAuthMode('login')}
            >
              Sign in
            </button>
            <button
              type="button"
              className={authMode === 'register' ? 'active' : ''}
              onClick={() => setAuthMode('register')}
            >
              Create account
            </button>
          </div>

          <form onSubmit={handleAuthSubmit} className="auth-form">
            {authMode === 'register' && (
              <label>
                Name
                <input
                  type="text"
                  value={authForm.name}
                  onChange={(event) =>
                    setAuthForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                  placeholder="Your name"
                />
              </label>
            )}
            <label>
              Email
              <input
                type="email"
                value={authForm.email}
                onChange={(event) =>
                  setAuthForm((prev) => ({ ...prev, email: event.target.value }))
                }
                placeholder="name@domain.com"
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={authForm.password}
                onChange={(event) =>
                  setAuthForm((prev) => ({ ...prev, password: event.target.value }))
                }
                placeholder="At least 8 characters"
                required
              />
            </label>
            {authError ? <div className="form-error">{authError}</div> : null}
            <button type="submit" className="primary">
              {authMode === 'login' ? 'Enter workspace' : 'Create workspace'}
            </button>
          </form>
        </section>

        <section className="auth-aside fade-up">
          <h2>Focus on what matters today.</h2>
          <ul>
            <li>Project-aware task lanes with fast filtering.</li>
            <li>Priority, due dates, and notes in one steady flow.</li>
            <li>Private workspaces per account.</li>
          </ul>
          <div className="pulse-grid">
            <div className="pulse-card">
              <span>Open</span>
              <strong>Plan</strong>
            </div>
            <div className="pulse-card">
              <span>Focus</span>
              <strong>Execute</strong>
            </div>
            <div className="pulse-card">
              <span>Close</span>
              <strong>Reflect</strong>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="top-bar">
        <div className="brand">
          <span className="brand-mark">ML</span>
          <div>
            <p className="brand-kicker">Momentum Ledger</p>
            <h1>Welcome back, {user.name || user.email}</h1>
          </div>
        </div>
        <div className="user-actions">
          <div className="user-meta">
            <span>{taskCounts.open} open</span>
            <span>{taskCounts.done} done</span>
          </div>
          <button type="button" className="ghost" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </header>

      <main className="dashboard">
        <section className="panel fade-up">
          <h2>{editingTask ? 'Edit task' : 'Capture a task'}</h2>
          <p>{editingTask ? 'Update the details below.' : 'Keep projects sorted and commitments visible.'}</p>
          <form className="task-form" onSubmit={handleTaskSubmit}>
            <label>
              Title
              <input
                type="text"
                value={taskForm.title}
                onChange={(event) =>
                  setTaskForm((prev) => ({ ...prev, title: event.target.value }))
                }
                placeholder="Ship Q3 outline"
                required
              />
            </label>
            <div className="form-grid">
              <label>
                Project
                <select
                  value={taskForm.project}
                  onChange={(event) =>
                    setTaskForm((prev) => ({ ...prev, project: event.target.value }))
                  }
                >
                  <option value="">No project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.name}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Due date
                <input
                  type="date"
                  value={taskForm.dueDate}
                  onChange={(event) =>
                    setTaskForm((prev) => ({ ...prev, dueDate: event.target.value }))
                  }
                />
              </label>
            </div>
            <label>
              Priority
              <select
                value={taskForm.priority}
                onChange={(event) =>
                  setTaskForm((prev) => ({ ...prev, priority: event.target.value }))
                }
              >
                {PRIORITY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Notes
              <textarea
                rows="3"
                value={taskForm.notes}
                onChange={(event) =>
                  setTaskForm((prev) => ({ ...prev, notes: event.target.value }))
                }
                placeholder="Add context, links, or a checklist."
              />
            </label>
            {taskError ? <div className="form-error">{taskError}</div> : null}
            <div className="form-actions">
              <button type="submit" className="primary" disabled={taskLoading}>
                {taskLoading ? 'Saving...' : editingTask ? 'Update task' : 'Add task'}
              </button>
              {editingTask && (
                <button type="button" className="ghost" onClick={cancelEditTask}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="panel fade-up">
          <div className="panel-header">
            <div>
              <h2>Task lane</h2>
              <p>Keep each project in view.</p>
            </div>
            <div className="filters">
              <select value={filterStatus} onChange={(event) => setFilterStatus(event.target.value)}>
                <option value="all">All</option>
                <option value="open">Open</option>
                <option value="done">Done</option>
              </select>
              <select
                value={filterProject}
                onChange={(event) => setFilterProject(event.target.value)}
              >
                {projectOptions.map((project) => (
                  <option key={project} value={project}>
                    {project === 'all' ? 'All projects' : project}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="empty-state">
              <p>No tasks yet. Capture something meaningful on the left.</p>
            </div>
          ) : (
            <ul className="task-list">
              {filteredTasks.map((task) => (
                <li key={task.id} className={`task-card ${task.status === 'done' ? 'done' : ''}`}>
                  <label className="task-check">
                    <input
                      type="checkbox"
                      checked={task.status === 'done'}
                      onChange={() => toggleTask(task)}
                    />
                    <span></span>
                  </label>
                  <div className="task-body">
                    <div className="task-top">
                      <div>
                        <h3>{task.title}</h3>
                        {task.project ? <span className="chip">{task.project}</span> : null}
                      </div>
                      <span className={`pill priority-${task.priority}`}>{task.priority}</span>
                    </div>
                    {task.notes ? <p className="task-notes">{task.notes}</p> : null}
                    <div className="task-meta">
                      <span>{formatDate(task.dueDate)}</span>
                      <div className="task-actions">
                        <button type="button" className="ghost" onClick={() => startEditTask(task)}>
                          Edit
                        </button>
                        <button type="button" className="ghost" onClick={() => handleDeleteTask(task.id)}>
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="panel fade-up">
          <div className="panel-header">
            <div>
              <h2>Projects</h2>
              <p>Organize your work into projects.</p>
            </div>
            {!showProjectForm && (
              <button type="button" className="primary" onClick={() => setShowProjectForm(true)}>
                New project
              </button>
            )}
          </div>

          {showProjectForm && (
            <form className="project-form" onSubmit={handleProjectSubmit}>
              <label>
                Name
                <input
                  type="text"
                  value={projectForm.name}
                  onChange={(event) =>
                    setProjectForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                  placeholder="Project name"
                  required
                />
              </label>
              <label>
                Description
                <input
                  type="text"
                  value={projectForm.description}
                  onChange={(event) =>
                    setProjectForm((prev) => ({ ...prev, description: event.target.value }))
                  }
                  placeholder="Optional description"
                />
              </label>
              <label>
                Color
                <input
                  type="color"
                  value={projectForm.color}
                  onChange={(event) =>
                    setProjectForm((prev) => ({ ...prev, color: event.target.value }))
                  }
                />
              </label>
              {projectError ? <div className="form-error">{projectError}</div> : null}
              <div className="form-actions">
                <button type="submit" className="primary">
                  {editingProject ? 'Update project' : 'Create project'}
                </button>
                <button type="button" className="ghost" onClick={cancelEditProject}>
                  Cancel
                </button>
              </div>
            </form>
          )}

          {projects.length === 0 && !showProjectForm ? (
            <div className="empty-state">
              <p>No projects yet. Create one to organize your tasks.</p>
            </div>
          ) : (
            <ul className="project-list">
              {projects.map((project) => (
                <li key={project.id} className="project-card">
                  <div className="project-color" style={{ backgroundColor: project.color }}></div>
                  <div className="project-body">
                    <h3>{project.name}</h3>
                    {project.description ? <p>{project.description}</p> : null}
                  </div>
                  <div className="project-actions">
                    <button type="button" className="ghost" onClick={() => startEditProject(project)}>
                      Edit
                    </button>
                    <button type="button" className="ghost" onClick={() => handleDeleteProject(project.id)}>
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
