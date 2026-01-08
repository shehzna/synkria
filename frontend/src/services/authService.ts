import { User, LoginCredentials, SignupCredentials } from "@/types";

interface BackendAuthResponse {
  access: string;
  refresh: string;
  user: {
    id: number | string;
    email: string;
    name: string;
    age?: number;
    cycle_length?: number;
  };
}

interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  tokenExpiry: number;
}

const API_BASE_URL = "http://127.0.0.1:8000";
const STORAGE_KEY = "synkria_auth";


const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Request failed");
  }

  return response.json();
};


const transformBackendUser = (backendUser: any): User => ({
  id: String(backendUser.id),
  email: backendUser.email,
  name: backendUser.name,
  age: backendUser.age,
  cycleLength: backendUser.cycle_length,
  avatar: undefined,
  createdAt: new Date(),
});


export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response: BackendAuthResponse = await apiRequest("/api/auth/login/", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    const authResponse: AuthResponse = {
      user: transformBackendUser(response.user),
      token: response.access,
      refreshToken: response.refresh,
      tokenExpiry: Date.now() + 60 * 60 * 1000,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(authResponse));
    return authResponse;
  },

  async signup(credentials: SignupCredentials): Promise<AuthResponse> {
    const response: BackendAuthResponse = await apiRequest("/api/auth/register/", {
      method: "POST",
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
        name: credentials.name,
        age: credentials.age,
        cycleLength: credentials.cycleLength,
      }),
    });

    const authResponse: AuthResponse = {
      user: transformBackendUser(response.user),
      token: response.access,
      refreshToken: response.refresh,
      tokenExpiry: Date.now() + 60 * 60 * 1000,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(authResponse));
    return authResponse;
  },

  async refreshToken(refreshToken: string) {
    const response = await apiRequest("/api/auth/token/refresh/", {
      method: "POST",
      body: JSON.stringify({ refresh: refreshToken }),
    });

    return {
      token: response.access,
      tokenExpiry: Date.now() + 60 * 60 * 1000,
    };
  },

  getStoredAuth(): AuthResponse | null {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored);
    if (Date.now() >= parsed.tokenExpiry) {
      this.clearStoredAuth();
      return null;
    }
    return parsed;
  },

  clearStoredAuth() {
    localStorage.removeItem(STORAGE_KEY);
  },
};
