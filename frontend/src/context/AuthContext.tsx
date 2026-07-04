import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

export type User = {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
} | null;

type AuthContextType = {
  user: User;
  setError: React.Dispatch<React.SetStateAction<string>>;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  register: (
    name: string,
    email: string,
    phone: string,
    password: string,
  ) => Promise<any>;
};

export const authContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:5005/api/user/me", {
          withCredentials: true,
        });
        if (res.data.success) {
          setUser(res.data.user);
          // console.log(res.data.user)
        }
      } catch {
        // setLoading(true);
        setUser(null);
        toast.error("Please Login First")
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    getCurrentUser();
  }, []);

  const register = async (
    name: string,
    email: string,
    phone: string,
    password: string,
  ) => {
    setError("");
    try {
      const response = await axios.post(
        "http://localhost:5005/api/user/register",
        { name, email, phone, password },
        {
          withCredentials: true,
        },
      );
      const data = response.data;
      setUser(data.user);
      toast.success("Account created successfully! Welcome aboard.");
      return data;
    } catch (err) {
      const msg = "Registration failed.";
      setError(msg);
      toast.error(msg);
      throw new Error(msg);
    }
  };

  const login = async (email: string, password: string) => {
    setError("");
    try {
      const respone = await axios.post(
        "http://localhost:5005/api/user/login",
        { email, password },
        { withCredentials: true },
      );

      setUser(respone.data.user);
      toast.success(`Successfully logged in as ${respone.data.user.name}!`);
      return respone.data;
    } catch (error) {
      const msg = "Login failed. Please verify credentials.";
      setError(msg);
      toast.error(msg);
      throw new Error(msg);
    }
  };

  const logout = async () => {
    try {
      await axios.post("http://localhost:5005/api/user/logout", null, {
        withCredentials: true,
      });
      toast.success("Signed out successfully. See you soon!");
    } catch (error) {
      toast.error("Logout failed. Please try again.");
    } finally {
      setUser(null);
    }
  };

  const value = { user, setError, login, logout, register };

  if (loading) {
    return (
      <div>
        <Backdrop
          sx={(theme) => ({ color: "#fff", zIndex: theme.zIndex.drawer + 1 })}
          open={loading}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      </div>
    );
  }

  return <authContext.Provider value={value}>{children}</authContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(authContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
