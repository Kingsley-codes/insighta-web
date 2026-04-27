// hooks/useSession.ts
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import { getErrorMessage, logError } from "@/lib/error-handler";
import { User } from "@/types";

interface SessionState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export function useSession() {
  const [state, setState] = useState<SessionState>({
    user: null,
    isLoading: true,
    error: null,
  });

  const fetchUser = async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      console.log("fetching user details");

      const response = await apiClient.getCurrentUser();
      setState({
        user: response.data,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      logError(err, "useSession");
      setState({
        user: null,
        isLoading: false,
        error: getErrorMessage(err, "Failed to load user session"),
      });
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const logout = async () => {
    try {
      await apiClient.logout();
      setState({
        user: null,
        isLoading: false,
        error: null,
      });
      // Redirect to login page
      window.location.href = "/login";
    } catch (err) {
      logError(err, "useSession-logout");
      setState((prev) => ({
        ...prev,
        error: getErrorMessage(err, "Logout failed"),
      }));
    }
  };

  return {
    user: state.user,
    isLoading: state.isLoading,
    error: state.error,
    isAuthenticated: !!state.user,
    isAdmin: state.user?.role === "admin",
    isAnalyst: state.user?.role === "analyst",
    logout,
    refetch: fetchUser,
  };
}
