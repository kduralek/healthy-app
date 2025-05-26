interface LogoutResponse {
  error?: {
    message: string;
  };
}

export function useAuth() {
  const logout = async () => {
    try {
      // Call the logout API endpoint
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = (await response.json()) as LogoutResponse;
        throw new Error(errorData.error?.message || 'Failed to logout');
      }

      // After successful logout, redirect to home page
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  return {
    logout,
  };
}
