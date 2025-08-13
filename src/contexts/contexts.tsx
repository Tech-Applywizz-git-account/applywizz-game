import { createContext, useState } from "react";

type AuthContextProps = {
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
};

type ProviderProps = {
  children: React.ReactNode;
};

export const AuthContext = createContext<AuthContextProps | null>(null);

export const AuthContextProvider = ({ children }: ProviderProps) => {
  const [token, setToken] = useState(localStorage.getItem("token"));

  const login = (newToken: string) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  const logout = () => {
    setTimeout(() => {
      localStorage.removeItem("token");
      setToken(null);
    }, 1000);
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ token, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};
