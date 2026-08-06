import { createContext, useEffect, useMemo, useState } from 'react';
import api, { setApiAuthToken } from '../services/api';
import { updateProfilePhoto as saveProfilePhoto } from '../services/auth';
import { clearStoredAuth, getStoredAuth, setStoredAuth } from '../utils/auth';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState({
    user: null,
    token: null,
    isLoading: true
  });

  useEffect(() => {
    const restoreSession = async () => {
      const storedAuth = getStoredAuth();

      if (!storedAuth?.token) {
        setAuthState({
          user: null,
          token: null,
          isLoading: false
        });
        return;
      }

      try {
        setApiAuthToken(storedAuth.token);
        const { data } = await api.get('/auth/me');
        const nextAuthState = {
          user: data.user,
          token: storedAuth.token,
          isLoading: false
        };

        setStoredAuth({
          token: storedAuth.token,
          user: data.user
        });
        setAuthState(nextAuthState);
      } catch (error) {
        setApiAuthToken(null);
        clearStoredAuth();
        setAuthState({
          user: null,
          token: null,
          isLoading: false
        });
      }
    };

    restoreSession();
  }, []);

  const saveAuthData = ({ token, user }) => {
    setApiAuthToken(token);
    setStoredAuth({ token, user });
    setAuthState({
      user,
      token,
      isLoading: false
    });
  };

  const login = async (credentials) => {
    const { data } = await api.post('/auth/login', credentials);
    saveAuthData(data);
    return data;
  };

  const loginAdmin = async (credentials) => {
    const { data } = await api.post('/auth/admin/login', credentials);
    saveAuthData(data);
    return data;
  };

  const register = async (formData) => {
    const { data } = await api.post('/auth/register', formData);
    saveAuthData(data);
    return data;
  };

  const updateProfilePhoto = async (imageData) => {
    const user = await saveProfilePhoto(imageData);
    const nextAuthState = {
      user,
      token: authState.token,
      isLoading: false
    };

    setStoredAuth({ token: authState.token, user });
    setAuthState(nextAuthState);
    return user;
  };
  const logout = () => {
    setApiAuthToken(null);
    clearStoredAuth();
    setAuthState({
      user: null,
      token: null,
      isLoading: false
    });
  };

  const value = useMemo(
    () => ({
      user: authState.user,
      token: authState.token,
      isAuthenticated: Boolean(authState.token && authState.user),
      isAdmin: authState.user?.role === 'admin',
      isLoading: authState.isLoading,
      login,
      loginAdmin,
      register,
      updateProfilePhoto,
      logout
    }),
    [authState]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
