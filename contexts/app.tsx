"use client";

import React, { createContext, useContext, useState } from "react";
import { useAuth } from "./AuthContext";

interface AppContextType {
  user: any;
  loading: boolean;
  theme: string;
  setTheme: (theme: string) => void;
  showSignModal: boolean;
  setShowSignModal: (show: boolean) => void;
}

const AppContext = createContext<AppContextType>({
  user: null,
  loading: true,
  theme: "light",
  setTheme: () => {},
  showSignModal: false,
  setShowSignModal: () => {},
});

export function AppContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const [theme, setTheme] = useState("light");
  const [showSignModal, setShowSignModal] = useState(false);

  return (
    <AppContext.Provider
      value={{
        user,
        loading,
        theme,
        setTheme,
        showSignModal,
        setShowSignModal,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => useContext(AppContext);
