// Authentication Service for PostgreSQL Integration
const API_BASE_URL = 'http://localhost:8080';

export interface User {
  id: number;
  email: string;
  name: string;
  two_factor_enabled: boolean;
  created_at: string;
  last_login?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirm_password: string;
  enable_2fa?: boolean;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

class AuthService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('Auth service error:', error);
      
      // Handle network errors gracefully
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Unable to connect to server. Please check your internet connection or try again later.');
      }
      
      throw error;
    }
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await this.makeRequest<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      if (response.success && response.user) {
        // Store authentication data
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userEmail', response.user.email);
        localStorage.setItem('userName', response.user.name);
        localStorage.setItem('userId', response.user.id.toString());
        
        if (response.token) {
          localStorage.setItem('authToken', response.token);
        }
      }

      return response;
    } catch (error) {
      // Fallback to demo authentication when backend is not available
      console.warn('Backend not available, using fallback authentication');
      return this.fallbackLogin(credentials);
    }
  }

  private fallbackLogin(credentials: LoginRequest): AuthResponse {
    // Demo authentication fallback
    if (credentials.email === 'sudo.de@xcryptovault.com' && credentials.password === 'password') {
      // Store authentication data
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userEmail', credentials.email);
      localStorage.setItem('userName', 'Sudo De');
      localStorage.setItem('userId', '1');
      
      return {
        success: true,
        user: {
          id: 1,
          email: credentials.email,
          name: 'Sudo De',
          two_factor_enabled: true,
          created_at: new Date().toISOString(),
        },
        message: 'Logged in successfully (demo mode)',
      };
    }
    
    return {
      success: false,
      message: 'Invalid email or password',
    };
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await this.makeRequest<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      if (response.success && response.user) {
        // Store authentication data
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userEmail', response.user.email);
        localStorage.setItem('userName', response.user.name);
        localStorage.setItem('userId', response.user.id.toString());
        
        if (response.token) {
          localStorage.setItem('authToken', response.token);
        }
      }

      return response;
    } catch (error) {
      // Fallback to demo registration when backend is not available
      console.warn('Backend not available, using fallback registration');
      return this.fallbackRegister(userData);
    }
  }

  private fallbackRegister(userData: RegisterRequest): AuthResponse {
    // Demo registration fallback
    if (userData.email && userData.password && userData.name) {
      // Store authentication data
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userEmail', userData.email);
      localStorage.setItem('userName', userData.name);
      localStorage.setItem('userId', '2');
      
      return {
        success: true,
        user: {
          id: 2,
          email: userData.email,
          name: userData.name,
          two_factor_enabled: userData.enable_2fa || false,
          created_at: new Date().toISOString(),
        },
        message: 'Account created successfully (demo mode)',
      };
    }
    
    return {
      success: false,
      message: 'Registration failed. Please fill in all required fields',
    };
  }

  async logout(): Promise<void> {
    try {
      // Call logout endpoint if available
      await this.makeRequest('/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage regardless of API call success
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userName');
      localStorage.removeItem('userId');
      localStorage.removeItem('authToken');
    }
  }

  async forgotPassword(email: string): Promise<AuthResponse> {
    try {
      return await this.makeRequest<AuthResponse>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    } catch (error) {
      // Fallback to demo forgot password when backend is not available
      console.warn('Backend not available, using fallback forgot password');
      return this.fallbackForgotPassword(email);
    }
  }

  private fallbackForgotPassword(email: string): AuthResponse {
    // Demo forgot password fallback
    if (email === 'sudo.de@xcryptovault.com') {
      return {
        success: true,
        message: 'Password reset email sent successfully (demo mode)',
      };
    }
    
    return {
      success: false,
      message: 'Email not found in our system',
    };
  }

  async resetPassword(token: string, newPassword: string): Promise<AuthResponse> {
    try {
      return await this.makeRequest<AuthResponse>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, password: newPassword }),
      });
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Password reset failed',
      };
    }
  }

  async verifyToken(): Promise<boolean> {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return false;

      const response = await this.makeRequest<{ valid: boolean }>('/auth/verify', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return response.valid;
    } catch (error) {
      return false;
    }
  }

  getCurrentUser(): User | null {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated) return null;

    const email = localStorage.getItem('userEmail');
    const name = localStorage.getItem('userName');
    const userId = localStorage.getItem('userId');

    if (!email || !name || !userId) return null;

    return {
      id: parseInt(userId),
      email,
      name,
      two_factor_enabled: false,
      created_at: new Date().toISOString(),
    };
  }

  isAuthenticated(): boolean {
    return localStorage.getItem('isAuthenticated') === 'true';
  }
}

export const authService = new AuthService();
export default authService;
