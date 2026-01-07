import { User, LoginCredentials, SignupCredentials } from '@/types';

interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  tokenExpiry: number;
}

const STORAGE_KEY = 'synkria_auth';
const TOKEN_EXPIRY_DURATION = 60 * 60 * 1000; // 1 hour
const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

// Mock user database
const mockUsers: Map<string, { user: User; password: string }> = new Map();

// Add a demo user
mockUsers.set('demo@synkria.com', {
  user: {
    id: '1',
    email: 'demo@synkria.com',
    name: 'Demo User',
    age: 28,
    cycleLength: 28,
    createdAt: new Date(),
  },
  password: 'password123',
});

const generateToken = (): string => {
  return 'jwt_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
};

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const userData = mockUsers.get(credentials.email);
    
    if (!userData || userData.password !== credentials.password) {
      throw new Error('Invalid email or password');
    }

    const response: AuthResponse = {
      user: userData.user,
      token: generateToken(),
      refreshToken: generateToken(),
      tokenExpiry: Date.now() + TOKEN_EXPIRY_DURATION,
    };

    // Store auth data
    localStorage.setItem(STORAGE_KEY, JSON.stringify(response));
    
    return response;
  },

  async signup(credentials: SignupCredentials): Promise<AuthResponse> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (mockUsers.has(credentials.email)) {
      throw new Error('Email already registered');
    }

    const newUser: User = {
      id: Date.now().toString(),
      email: credentials.email,
      name: credentials.name,
      age: credentials.age,
      cycleLength: credentials.cycleLength || 28,
      createdAt: new Date(),
    };

    mockUsers.set(credentials.email, {
      user: newUser,
      password: credentials.password,
    });

    const response: AuthResponse = {
      user: newUser,
      token: generateToken(),
      refreshToken: generateToken(),
      tokenExpiry: Date.now() + TOKEN_EXPIRY_DURATION,
    };

    // Store auth data
    localStorage.setItem(STORAGE_KEY, JSON.stringify(response));
    
    return response;
  },

  async refreshToken(refreshToken: string): Promise<{ token: string; tokenExpiry: number }> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    // In a real app, validate the refresh token
    if (!refreshToken) {
      throw new Error('Invalid refresh token');
    }

    return {
      token: generateToken(),
      tokenExpiry: Date.now() + TOKEN_EXPIRY_DURATION,
    };
  },

  getStoredAuth(): AuthResponse | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;
      
      const parsed = JSON.parse(stored);
      // Convert date strings back to Date objects
      if (parsed.user) {
        parsed.user.createdAt = new Date(parsed.user.createdAt);
      }
      return parsed;
    } catch {
      return null;
    }
  },

  updateStoredUser(user: User): void {
    const stored = this.getStoredAuth();
    if (stored) {
      stored.user = user;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    }
  },

  clearStoredAuth(): void {
    localStorage.removeItem(STORAGE_KEY);
  },

  isTokenExpired(expiry: number): boolean {
    return Date.now() >= expiry;
  },

  shouldRefreshToken(expiry: number): boolean {
    // Refresh if token expires in less than 5 minutes
    return Date.now() >= expiry - 5 * 60 * 1000;
  },
};
