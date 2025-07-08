import { useReducer } from 'react';

interface AuthResponse {
  data?: {
    message: string;
  };
  error?: {
    message: string;
  };
}

interface RegisterData {
  email: string;
  password: string;
  passwordConfirm: string;
}

interface AuthState {
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'SET_SUCCESS'; payload: string }
  | { type: 'CLEAR_MESSAGES' }
  | { type: 'RESET' };

const initialState: AuthState = {
  isLoading: false,
  error: null,
  successMessage: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        successMessage: null,
        isLoading: false,
      };
    case 'SET_SUCCESS':
      return {
        ...state,
        successMessage: action.payload,
        error: null,
        isLoading: false,
      };
    case 'CLEAR_MESSAGES':
      return { ...state, error: null, successMessage: null };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

export function useAuth() {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const clearMessages = () => {
    dispatch({ type: 'CLEAR_MESSAGES' });
  };

  const reset = () => {
    dispatch({ type: 'RESET' });
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_MESSAGES' });

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = (await response.json()) as AuthResponse;

      if (!response.ok) {
        dispatch({
          type: 'SET_ERROR',
          payload: responseData.error?.message || 'Nie udało się utworzyć konta. Spróbuj ponownie.',
        });
        return false;
      }

      dispatch({
        type: 'SET_SUCCESS',
        payload:
          responseData.data?.message ||
          'Konto zostało utworzone. Link weryfikacyjny został wysłany na podany adres email.',
      });
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: 'Wystąpił problem z połączeniem. Spróbuj ponownie.',
      });
      return false;
    }
  };

  const logout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = (await response.json()) as AuthResponse;
        throw new Error(errorData.error?.message || 'Failed to logout');
      }

      // After successful logout, redirect to home page
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const navigateToLogin = () => {
    window.location.href = '/auth/login';
  };

  return {
    ...state,
    register,
    logout,
    navigateToLogin,
    clearMessages,
    reset,
  };
}
