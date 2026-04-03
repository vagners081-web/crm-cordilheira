// context/AuthContext.jsx — Estado global de autenticação
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getMe } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  // Restaura sessão ao carregar
  useEffect(() => {
    const token = localStorage.getItem('crm_token');
    if (!token) { setLoading(false); return; }

    getMe()
      .then(u => setUser(u))
      .catch(() => {
        localStorage.removeItem('crm_token');
        localStorage.removeItem('crm_user');
      })
      .finally(() => setLoading(false));
  }, []);

  const signIn = useCallback((token, userData) => {
    localStorage.setItem('crm_token', token);
    localStorage.setItem('crm_user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem('crm_token');
    localStorage.removeItem('crm_user');
    setUser(null);
  }, []);

  const isAdmin = user?.tipo === 'admin';

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
