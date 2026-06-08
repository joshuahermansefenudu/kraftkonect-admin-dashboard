import createContextHook from "@nkzw/create-context-hook";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { RootState } from "@/store";
import { setUser, setAccessToken, logout as logoutAction } from "@/store/slices/authSlice";
import { adminLoginApi, setAuthToken } from "@/services/adminApi";

export const [AuthProvider, useAuth] = createContextHook(() => {
  const dispatch = useDispatch();
  const { user, isLoading, isAuthenticated, accessToken } = useSelector(
    (state: RootState) => state.auth
  );

  // Re-hydrate the module-level token whenever the persisted token changes
  useEffect(() => {
    setAuthToken(accessToken ?? null);
  }, [accessToken]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const result = await adminLoginApi(email, password);
      dispatch(setAccessToken(result.accessToken));
      dispatch(
        setUser({
          email: result.user.email ?? email,
          name: result.user.name ?? "Admin",
        })
      );
      setAuthToken(result.accessToken);
      return true;
    } catch {
      return false;
    }
  };

  const logout = async () => {
    setAuthToken(null);
    dispatch(logoutAction());
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
  };
});
