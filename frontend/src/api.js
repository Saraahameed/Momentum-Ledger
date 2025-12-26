const API_BASE = import.meta.env.VITE_API_URL || '';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    credentials: 'include',
    ...options
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.error || 'Request failed.';
    throw new Error(message);
  }
  return data;
}

export function getMe() {
  return request('/api/auth/me');
}

export function register(payload) {
  return request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function login(payload) {
  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function logout() {
  return request('/api/auth/logout', { method: 'POST' });
}

export function getTasks() {
  return request('/api/tasks');
}

export function createTask(payload) {
  return request('/api/tasks', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function updateTask(id, payload) {
  return request(`/api/tasks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
}

export function deleteTask(id) {
  return request(`/api/tasks/${id}`, {
    method: 'DELETE'
  });
}

export function getProjects() {
  return request('/api/projects');
}

export function createProject(payload) {
  return request('/api/projects', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function updateProject(id, payload) {
  return request(`/api/projects/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
}

export function deleteProject(id) {
  return request(`/api/projects/${id}`, {
    method: 'DELETE'
  });
}
