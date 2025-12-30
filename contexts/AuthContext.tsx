import createContextHook from "@nkzw/create-context-hook";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import {
  setUser,
  setLoginStep,
  setPendingEmail,
  logout as logoutAction,
} from "@/store/slices/authSlice";

interface User {
  email: string;
  name: string;
}

const DEMO_ADMIN = {
  email: "admin@kraftkonect.com",
  password: "admin123",
  twoFACode: "123456",
  name: "Admin User",
};

export const [AuthProvider, useAuth] = createContextHook(() => {
  const dispatch = useDispatch();
  const { user, isLoading, isAuthenticated, loginStep, pendingEmail } = useSelector(
    (state: RootState) => state.auth
  );

  const login = async (email: string, password: string): Promise<boolean> => {
    if (email === DEMO_ADMIN.email && password === DEMO_ADMIN.password) {
      dispatch(setPendingEmail(email));
      dispatch(setLoginStep("2fa"));
      return true;
    }
    return false;
  };

  const verify2FA = async (code: string): Promise<boolean> => {
    if (code === DEMO_ADMIN.twoFACode) {
      const userData: User = {
        email: pendingEmail,
        name: DEMO_ADMIN.name,
      };
      dispatch(setUser(userData));
      dispatch(setLoginStep("email"));
      dispatch(setPendingEmail(""));
      return true;
    }
    return false;
  };

  const logout = async () => {
    dispatch(logoutAction());
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    verify2FA,
    logout,
    loginStep,
  };
});
