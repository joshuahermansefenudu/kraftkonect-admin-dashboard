import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User {
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  loginStep: "email" | "2fa";
  pendingEmail: string;
}

const initialState: AuthState = {
  user: null,
  isLoading: false,
  isAuthenticated: false,
  loginStep: "email",
  pendingEmail: "",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.isLoading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setLoginStep: (state, action: PayloadAction<"email" | "2fa">) => {
      state.loginStep = action.payload;
    },
    setPendingEmail: (state, action: PayloadAction<string>) => {
      state.pendingEmail = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loginStep = "email";
      state.pendingEmail = "";
    },
  },
});

export const { setUser, setLoading, setLoginStep, setPendingEmail, logout } =
  authSlice.actions;
export default authSlice.reducer;
