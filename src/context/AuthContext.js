import { createContext, useState, useEffect } from "react";
import { getProfile, userLogin } from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(!!token);

  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setLoadingUser(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      setLoadingUser(true);
      const res = await getProfile(token);
      setUser(res.data.user);
    } catch (err) {
      console.error("Failed to fetch user", err);
      logout();
    } finally {
      setLoadingUser(false);
    }
  };

  const login = async (data) => {
    const res = await userLogin(data);
    const { user: u, token: t } = res.data;
    localStorage.setItem("token", t);
    localStorage.setItem("user", JSON.stringify(u));
    setToken(t);
    setUser(u);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    // window.location.reload();
  };

  return (
    <AuthContext.Provider value={{ user, token, loadingUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
