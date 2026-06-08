import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User {
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: false,
  isAuthenticated: false,
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
    setAccessToken: (state, action: PayloadAction<string | null>) => {
      state.accessToken = action.payload;
    },
    setRefreshToken: (state, action: PayloadAction<string | null>) => {
      state.refreshToken = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setUser, setAccessToken, setRefreshToken, setLoading, logout } = authSlice.actions;
export default authSlice.reducer;
