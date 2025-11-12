import { create } from "zustand";
import { persist } from "zustand/middleware";

const DEFAULT_REDIRECT = {
  Admin: "/analytics",
  Referent: "/products",
  Menadžer: "/analytics",
};

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setCredentials: (token, user) => {
        set({ token, user, isAuthenticated: true });
      },

      logout: () => {
        localStorage.removeItem("erp.token");
        localStorage.removeItem("erp.user");
        set({ token: null, user: null, isAuthenticated: false });
      },

      hasRole: (roles) => {
        const u = get().user;
        return !!u && roles.includes(u.role);
      },

      redirectForRole: () => {
        const u = get().user;
        if (!u) return "/login";
        return DEFAULT_REDIRECT[u.role] ?? "/dashboard";
      },
    }),
    { name: "erp.auth" }
  )
);
