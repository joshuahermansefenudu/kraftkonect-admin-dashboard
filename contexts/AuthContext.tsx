import createContextHook from "@nkzw/create-context-hook";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { RootState } from "@/store";
import {
  setUser,
  setAccessToken,
  setRefreshToken,
  logout as logoutAction,
} from "@/store/slices/authSlice";
import {
  adminLoginApi,
  adminValidateSessionApi,
  setAuthToken,
} from "@/services/adminApi";

export const [AuthProvider, useAuth] = createContextHook(() => {
  const dispatch = useDispatch();
  const { user, isLoading, isAuthenticated, accessToken } = useSelector(
    (state: RootState) => state.auth
  );

  // True while we are verifying the persisted token against the backend.
  // Exposed as part of `isLoading` so _layout.tsx shows a spinner during validation.
  const [isValidating, setIsValidating] = useState(false);

  // Keep the module-level token in sync with the persisted Redux value so every
  // subsequent fetch carries the correct Authorization header.
  useEffect(() => {
    setAuthToken(accessToken ?? null);
  }, [accessToken]);

  // On first mount: if a token was rehydrated from storage, verify it against
  // the backend. An expired or invalid token is cleared immediately so the user
  // is redirected to login rather than silently failing on the first API call.
  useEffect(() => {
    if (!accessToken) return;

    setIsValidating(true);
    setAuthToken(accessToken);

    adminValidateSessionApi()
      .then((me) => {
        // Token is valid — refresh the stored user details in case they changed.
        dispatch(
          setUser({
            email: me.email ?? "",
            name: me.name ?? "Admin",
          })
        );
      })
      .catch(() => {
        // Token is expired or revoked — clear all auth state.
        setAuthToken(null);
        dispatch(logoutAction());
      })
      .finally(() => setIsValidating(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty — run once on mount with the rehydrated token

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const result = await adminLoginApi(email, password);

      setAuthToken(result.accessToken);
      dispatch(setAccessToken(result.accessToken));
      dispatch(setRefreshToken(result.refreshToken));
      dispatch(
        setUser({
          email: result.user.email ?? email,
          name: result.user.name ?? "Admin",
        })
      );

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
    // Expose combined loading: redux isLoading OR startup validation in progress
    isLoading: isLoading || isValidating,
    isAuthenticated,
    login,
    logout,
  };
});
