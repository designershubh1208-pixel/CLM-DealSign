import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserSettings } from '@/types';


interface UserStore {
    user: User | null;
    settings: UserSettings;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    // Actions
    login: (email: string, password: string) => Promise<void>;
    signup: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    updateSettings: (settings: Partial<UserSettings>) => void;
}

const DEFAULT_SETTINGS: UserSettings = {
    riskSensitivity: 'medium',
    autoAnalysis: true,
    notifications: {
        email: true,
        inApp: true,
        approvalRequests: true,
        analysisComplete: true
    }
};

export const useUserStore = create<UserStore>()(
    persist(
        (set) => ({
            user: null, // Initial user is null
            settings: DEFAULT_SETTINGS,
            isAuthenticated: false, // Not authenticated by default
            isLoading: false,
            error: null,

            login: async (email, password) => {
                set({ isLoading: true, error: null });
                try {
                    const res = await fetch('http://localhost:5000/api/auth/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, password })
                    });

                    const data = await res.json().catch(() => null);
                    if (!res.ok) {
                        // Build a resilient error message from common shapes
                        let msg = res.statusText || `HTTP ${res.status}`;
                        if (data) {
                            if (typeof data === 'string') msg = data;
                            else if ((data as any).message) msg = (data as any).message;
                            else if ((data as any).error) msg = (data as any).error;
                            else if ((data as any).errors) msg = JSON.stringify((data as any).errors);
                            else msg = JSON.stringify(data);
                        }
                        throw new Error(msg || 'Login failed');
                    }

                    if (!data || !data.data || !data.data.accessToken) throw new Error('Login failed: missing token');
                    localStorage.setItem('deal_sign_token', data.data.accessToken);

                    // Transform backend user to frontend user
                    const user = {
                        id: data.data.user.id,
                        name: data.data.user.name,
                        email: data.data.user.email,
                        role: data.data.user.role,
                        avatar: data.data.user.avatar,
                        teamId: data.data.user.teamId || 'team-1', // Default for now
                        createdAt: data.data.user.createdAt
                    };

                    set({ user, isAuthenticated: true, isLoading: false });
                } catch (error: any) {
                    set({ error: error.message, isLoading: false });
                    throw error;
                }
            },

            signup: async (name, email, password) => {
                set({ isLoading: true, error: null });
                try {
                    const res = await fetch('http://localhost:5000/api/auth/register', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name, email, password })
                    });

                    const data = await res.json().catch(() => null);
                    if (!res.ok) {
                        let msg = res.statusText || `HTTP ${res.status}`;
                        if (data) {
                            if (typeof data === 'string') msg = data;
                            else if ((data as any).message) msg = (data as any).message;
                            else if ((data as any).error) msg = (data as any).error;
                            else if ((data as any).errors) msg = JSON.stringify((data as any).errors);
                            else msg = JSON.stringify(data);
                        }
                        throw new Error(msg || 'Signup failed');
                    }

                    if (!data || !data.data || !data.data.accessToken) throw new Error('Signup failed: missing token');
                    localStorage.setItem('deal_sign_token', data.data.accessToken);

                    const user = {
                        id: data.data.user.id,
                        name: data.data.user.name,
                        email: data.data.user.email,
                        role: data.data.user.role,
                        avatar: data.data.user.avatar,
                        teamId: data.data.user.teamId || 'team-1', // Default for now
                        createdAt: data.data.user.createdAt
                    };

                    set({ user, isAuthenticated: true, isLoading: false });
                } catch (error: any) {
                    set({ error: error.message, isLoading: false });
                    throw error;
                }
            },

            logout: () => {
                localStorage.removeItem('deal_sign_token');
                set({ user: null, isAuthenticated: false });
                // Redirect to login page
                if (typeof window !== 'undefined') {
                    window.location.href = '/login';
                }
            },

            updateSettings: (newSettings) => {
                set((state) => ({
                    settings: { ...state.settings, ...newSettings }
                }));
            }
        }),
        {
            name: 'dealsign-user-storage',
        }
    )
);
