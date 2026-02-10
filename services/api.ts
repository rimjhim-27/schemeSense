
import { UserProfile, Scheme, SchemeApplication } from '../types';

const API_BASE = 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('ss_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

export const api = {
  auth: {
    async register(userData: any) {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await res.json();
      if (data.token) localStorage.setItem('ss_token', data.token);
      return data;
    },
    async login(phone: string, password: string = '123456') {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password })
      });
      const data = await res.json();
      if (data.token) localStorage.setItem('ss_token', data.token);
      return data;
    },
    async getProfile(): Promise<UserProfile> {
      const res = await fetch(`${API_BASE}/user/profile`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Unauthorized');
      return res.json();
    },
    logout() {
      localStorage.removeItem('ss_token');
    }
  },

  schemes: {
    async getEligible(): Promise<Scheme[]> {
      const res = await fetch(`${API_BASE}/schemes/eligible`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch schemes');
      return res.json();
    }
  },

  applications: {
    async apply(schemeId: string, schemeTitle: string): Promise<SchemeApplication> {
      const res = await fetch(`${API_BASE}/applications`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ schemeId, schemeTitle })
      });
      return res.json();
    },
    async getMyApplications(): Promise<SchemeApplication[]> {
      const res = await fetch(`${API_BASE}/applications`, { headers: getHeaders() });
      return res.json();
    }
  },

  user: {
    async updateProfile(updates: Partial<UserProfile>) {
      const res = await fetch(`${API_BASE}/user/profile`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(updates)
      });
      return res.json();
    }
  }
};
