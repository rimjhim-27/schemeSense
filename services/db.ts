
import { UserProfile, SchemeApplication } from '../types';

const LATENCY = 800; // Simulate DB network delay

const getStorage = (key: string) => JSON.parse(localStorage.getItem(key) || '[]');
const setStorage = (key: string, data: any) => localStorage.setItem(key, JSON.stringify(data));

export const db = {
  users: {
    async findOne(query: Partial<UserProfile>): Promise<UserProfile | null> {
      await new Promise(r => setTimeout(r, LATENCY));
      const users = getStorage('ss_users');
      return users.find((u: UserProfile) => 
        Object.entries(query).every(([k, v]) => u[k as keyof UserProfile] === v)
      ) || null;
    },

    async create(user: UserProfile): Promise<UserProfile> {
      await new Promise(r => setTimeout(r, LATENCY));
      const users = getStorage('ss_users');
      const newUser = { 
        ...user, 
        _id: `user_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString() 
      };
      users.push(newUser);
      setStorage('ss_users', users);
      return newUser;
    }
  },

  applications: {
    async findByUserId(userId: string): Promise<SchemeApplication[]> {
      await new Promise(r => setTimeout(r, LATENCY));
      const apps = getStorage('ss_apps');
      return apps.filter((a: SchemeApplication) => a.userId === userId);
    },

    async create(app: Omit<SchemeApplication, '_id' | 'appliedAt' | 'status'>): Promise<SchemeApplication> {
      await new Promise(r => setTimeout(r, LATENCY));
      const apps = getStorage('ss_apps');
      const newApp: SchemeApplication = {
        ...app,
        _id: `app_${Math.random().toString(36).substr(2, 9)}`,
        status: 'Pending',
        appliedAt: new Date().toISOString()
      };
      apps.push(newApp);
      setStorage('ss_apps', apps);
      return newApp;
    }
  }
};
