import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  token: null,
  employee: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(state, action) {
      const { token, employee } = action.payload || {};
      state.token = token || null;
      state.employee = employee || null;
    },
    logout(state) {
      state.token = null;
      state.employee = null;
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
