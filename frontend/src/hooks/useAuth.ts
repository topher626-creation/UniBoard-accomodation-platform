import { useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';
import { apiClient } from '@/lib/api';
import { User } from '@/types';

/**
 * Hook for handling API calls with error handling and notifications
 */
export const useApi = () => {
  const { addNotification } = useUiStore();

  const handleError = useCallback(
    (error: unknown, defaultMessage = 'An error occurred') => {
      const message =
        typeof error === 'object' && error !== null && 'message' in error
          ? (error as { message: string }).message
          : defaultMessage;

      addNotification({
        type: 'error',
        message,
        duration: 5000,
      });
    },
    [addNotification]
  );

  const handleSuccess = useCallback(
    (message: string) => {
      addNotification({
        type: 'success',
        message,
        duration: 3000,
      });
    },
    [addNotification]
  );

  return { apiClient, handleError, handleSuccess, addNotification };
};

/**
 * Hook for authentication operations
 */
export const useAuthActions = () => {
  const { setUser, setToken, setLoading, setError, logout } = useAuthStore();
  const { apiClient, handleError, handleSuccess } = useApi();

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiClient.post<{ user: User; token: string }>(
          '/auth/login',
          { email, password }
        );

        setUser(response.user);
        setToken(response.token);
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));

        handleSuccess('Logged in successfully!');
        return response;
      } catch (error) {
        handleError(error, 'Login failed');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [setUser, setToken, setLoading, setError, apiClient, handleError, handleSuccess]
  );

  const register = useCallback(
    async (data: {
      email: string;
      password: string;
      name: string;
      phone?: string;
      role: 'student' | 'landlord';
      business_name?: string;
      verification_document_url?: string;
    }) => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiClient.post<{ user: User; token: string }>(
          '/auth/register',
          data
        );

        setUser(response.user);
        setToken(response.token);
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));

        handleSuccess(
          response.user?.role === 'landlord' && response.user?.status === 'pending'
            ? 'Landlord account created. Waiting for admin approval.'
            : 'Account created successfully!'
        );
        return response;
      } catch (error) {
        handleError(error, 'Registration failed');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [setUser, setToken, setLoading, setError, apiClient, handleError, handleSuccess]
  );

  const handleLogout = useCallback(() => {
    logout();
    handleSuccess('Logged out successfully!');
  }, [logout, handleSuccess]);

  return { login, register, logout: handleLogout };
};
