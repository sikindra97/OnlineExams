import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

   api.get("/auth/me")
  .then(res => setUser(res.data.user))
  .catch(() => {
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
  })
  .finally(() => setLoading(false));
  }, []);

  const login = (token, user) => {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
  api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  setUser(user);
};

  const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  delete api.defaults.headers.common["Authorization"];
  setUser(null);
};

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
