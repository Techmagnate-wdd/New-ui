import { createContext, useState, useEffect } from "react";
import { getInternalProfile, getProfile, internalUserLogin } from "../../services/api";
import { useNavigate } from "react-router-dom";

const InternalAuthContext = createContext();

export const InternalAuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("internalToken"));
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(!!token);
  const navigate = useNavigate()

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
      const res = await getInternalProfile(token);
      console.log(res,"res")
      setUser(res.data.user);
    } catch (err) {
      console.error("Failed to fetch user", err);
      logout();
    } finally {
        setLoadingUser(false);
      }
    };

  const login = async (data) => {
    const res = await internalUserLogin(data);
    const { user: u, token: t } = res.data;
    localStorage.setItem("internalToken", t);
    localStorage.setItem("internalUser", JSON.stringify(u));
    setToken(t);
    setUser(u);
  };

  const logout = () => {
    localStorage.removeItem("internalToken");
    localStorage.removeItem("internalUser");
    setToken(null);
    setUser(null);
    // navigate('internal-login')
    window.location.reload();
  };

  return (
    <InternalAuthContext.Provider value={{ user, token, loadingUser, login, logout }}>
      {children}
    </InternalAuthContext.Provider>
  );
};

export default InternalAuthContext;
