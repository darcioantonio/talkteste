const API_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:4000';

// Helper para fazer requisições autenticadas
const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erro na requisição' }));
    throw new Error(error.error || 'Erro na requisição');
  }

  return response.json();
};

// Auth
export const register = (username, email, password) =>
  apiRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password }),
  });

export const login = (email, password) =>
  apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

export const getMe = () => apiRequest('/api/auth/me');

export const logout = () => apiRequest('/api/auth/logout', { method: 'POST' });

// Servers
export const createServer = (name, description) =>
  apiRequest('/api/servers', {
    method: 'POST',
    body: JSON.stringify({ name, description }),
  });

export const getMyServers = () => apiRequest('/api/servers/my-servers');

export const getServer = (id) => apiRequest(`/api/servers/${id}`);

export const updateServer = (id, data) =>
  apiRequest(`/api/servers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const deleteServer = (id) =>
  apiRequest(`/api/servers/${id}`, { method: 'DELETE' });

// Channels
export const createChannel = (serverId, data) =>
  apiRequest(`/api/channels/${serverId}`, {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updateChannel = (serverId, channelId, data) =>
  apiRequest(`/api/channels/${serverId}/${channelId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const deleteChannel = (serverId, channelId) =>
  apiRequest(`/api/channels/${serverId}/${channelId}`, { method: 'DELETE' });

