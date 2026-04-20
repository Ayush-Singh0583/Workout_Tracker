import axios from 'axios';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export const api = axios.create({ baseURL: BASE });

// Attach token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('ironforge_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Auth ──────────────────────────────────────────────
export const authApi = {
  register: (data: { email: string; password: string; displayName?: string }) =>
    api.post('/auth/register', data).then((r) => r.data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data).then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data),
};

// ── Templates ─────────────────────────────────────────
export const templateApi = {
  getAll: () => api.get('/templates').then((r) => r.data),
  getById: (id: string) => api.get(`/templates/${id}`).then((r) => r.data),
};

// ── Workouts ──────────────────────────────────────────
export const workoutApi = {
  start: (data: { templateId?: string; date?: string; notes?: string }) =>
    api.post('/workouts/start', data).then((r) => r.data),
  getAll: (params?: { limit?: number; before?: string }) =>
    api.get('/workouts', { params }).then((r) => r.data),
  getOne: (id: string) => api.get(`/workouts/${id}`).then((r) => r.data),
  getToday: () => api.get('/workouts/today').then((r) => r.data),
  getWeeklyStats: () => api.get('/workouts/weekly-stats').then((r) => r.data),
  update: (id: string, data: { completed?: boolean; notes?: string; durationMin?: number }) =>
    api.patch(`/workouts/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/workouts/${id}`).then((r) => r.data),
};

// ── Sets ──────────────────────────────────────────────
export const setApi = {
  log: (data: {
    sessionId: string; exerciseId: string; setNumber: number;
    weight: number; reps: number; rpe?: number; notes?: string;
  }) => api.post('/sets/log', data).then((r) => r.data),
  delete: (id: string) => api.delete(`/sets/${id}`).then((r) => r.data),
};

// ── Progress ──────────────────────────────────────────
export const progressApi = {
  forExercise: (id: string, weeks = 12) =>
    api.get(`/progress/exercise/${id}`, { params: { weeks } }).then((r) => r.data),
  overload: () => api.get('/progress/overload').then((r) => r.data),
  records: () => api.get('/progress/records').then((r) => r.data),
  heatmap: (days = 7) =>
    api.get('/progress/heatmap', { params: { days } }).then((r) => r.data),
};

// ── Exercises ─────────────────────────────────────────
export const exerciseApi = {
  getAll: () => api.get('/exercises').then((r) => r.data),
};