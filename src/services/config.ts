// Centralized API URL config. Prefer Vite env `VITE_API_URL`, then window override.
const fromVite = typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.VITE_API_URL
const fromWindow = (window as any).__API_URL__

export const API_URL = (fromVite || fromWindow || 'http://localhost:5000') + '/api/grievances'

export default API_URL
