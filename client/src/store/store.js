import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import authReducer from "./authSlice";
import { api } from "./api";
import { loadAuthState, saveAuthState } from "./storage";

const preloadedAuth = loadAuthState();

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [api.reducerPath]: api.reducer,
  },
  preloadedState: preloadedAuth ? { auth: preloadedAuth } : undefined,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

store.subscribe(() => {
  saveAuthState(store.getState().auth);
});

setupListeners(store.dispatch);
