import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import axios from 'axios';

interface User {
  _id: string;
  name: string;
  personalEmail: string;
  iitgEmail?: string;
  rollNumber?: string;
  phoneNumber?: string;
  isAdmin: boolean;
  isVerified: boolean;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  isLoggedIn: boolean;
  login: (loginIdentifier: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean; // To indicate if auth state is being loaded (e.g., from localStorage)
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);


  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        // Here you would typically verify the token with the backend
        // and fetch user details, or decode the token if it contains enough info.
        // For simplicity, let's assume token presence means logged in for now,
        // but a real app needs a /api/auth/me endpoint or similar.
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
          // Placeholder for fetching user data. In a real app, this would be a call to a /api/auth/me or similar
          // For now, let's decode the token or assume basic user structure
          // This part needs adjustment based on how your backend sends user info after login/token verification
          const res = await axios.get('/api/auth/me'); // Assuming a route to get user details
          setUser(res.data); // The /api/auth/me route returns the user object directly
        } catch (error) {
          console.error('Failed to fetch user details with token:', error);
          setToken(null);
          setUser(null);
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
        }
      }
      setLoading(false);
    };
    loadUser();
  }, [token]);

  const login = async (loginIdentifier: string, password: string) => {
    try {
      const res = await axios.post('/api/auth/login', { loginIdentifier, password });
      const { token: newToken, user: userData } = res.data;

      setToken(newToken);
      setUser(userData);
      localStorage.setItem('token', newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    } catch (err: any) {
      console.error('Login failed:', err.response?.data || err.message);
      throw new Error(err.response?.data?.message || 'Login failed');
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  const isLoggedIn = !!token;

  return (
    <AuthContext.Provider value={{ token, user, isLoggedIn, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
