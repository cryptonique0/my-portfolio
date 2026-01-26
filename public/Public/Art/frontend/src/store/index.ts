import { create } from 'zustand';

interface User {
  address: string | null;
  username: string | null;
  avatar: string | null;
  chain: 'base' | null;
  balance: string | null;
  isConnected: boolean;
}

interface ThemeStore {
  isDarkMode: boolean;
  colorScheme: 'default' | 'ocean' | 'sunset' | 'forest';
  toggleTheme: () => void;
  setColorScheme: (scheme: 'default' | 'ocean' | 'sunset' | 'forest') => void;
  toggle: () => void; // alias for backwards compatibility
}

interface NotificationStore {
  notifications: any[];
  addNotification: (notification: any) => void;
  removeNotification: (id: string) => void;
}

// User Store
export const useUserStore = create<{
  user: User;
  setUser: (user: User) => void;
  logout: () => void;
}>((set) => ({
  user: {
    address: null,
    username: null,
    avatar: null,
    chain: null,
    balance: null,
    isConnected: false
  },
  setUser: (user) => set({ user }),
  logout: () => set({
    user: {
      address: null,
      username: null,
      avatar: null,
      chain: null,
      balance: null,
      isConnected: false
    }
  })
}));

// Theme Store with color schemes
export const useThemeStore = create<ThemeStore>((set) => ({
  isDarkMode: localStorage.getItem('theme') === 'dark' || false,
  colorScheme: (localStorage.getItem('colorScheme') as any) || 'default',
  toggleTheme: () => set((state) => {
    const newMode = !state.isDarkMode;
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newMode);
    applyColorScheme(state.colorScheme, newMode);
    return { isDarkMode: newMode };
  }),
  toggle: () => set((state) => {
    const newMode = !state.isDarkMode;
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newMode);
    applyColorScheme(state.colorScheme, newMode);
    return { isDarkMode: newMode };
  }),
  setColorScheme: (scheme) => set((state) => {
    localStorage.setItem('colorScheme', scheme);
    applyColorScheme(scheme, state.isDarkMode);
    return { colorScheme: scheme };
  })
}));

// Apply color scheme CSS variables
function applyColorScheme(scheme: string, isDark: boolean) {
  const root = document.documentElement;
  const schemes = {
    default: {
      light: { primary: '#3b82f6', secondary: '#8b5cf6', accent: '#06b6d4' },
      dark: { primary: '#60a5fa', secondary: '#a78bfa', accent: '#22d3ee' }
    },
    ocean: {
      light: { primary: '#0ea5e9', secondary: '#06b6d4', accent: '#14b8a6' },
      dark: { primary: '#38bdf8', secondary: '#22d3ee', accent: '#2dd4bf' }
    },
    sunset: {
      light: { primary: '#f97316', secondary: '#ec4899', accent: '#eab308' },
      dark: { primary: '#fb923c', secondary: '#f472b6', accent: '#fbbf24' }
    },
    forest: {
      light: { primary: '#10b981', secondary: '#059669', accent: '#84cc16' },
      dark: { primary: '#34d399', secondary: '#10b981', accent: '#a3e635' }
    }
  };
  const colors = schemes[scheme as keyof typeof schemes]?.[isDark ? 'dark' : 'light'] || schemes.default.light;
  root.style.setProperty('--color-primary', colors.primary);
  root.style.setProperty('--color-secondary', colors.secondary);
  root.style.setProperty('--color-accent', colors.accent);
}

// Notification Store
export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  addNotification: (notification) => set((state) => ({
    notifications: [...state.notifications, { ...notification, id: Date.now().toString() }]
  })),
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  }))
}));
