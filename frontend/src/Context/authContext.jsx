import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const UserContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        const token = localStorage.getItem("token");

        if (storedUser && token) {
            const parsedUser = JSON.parse(storedUser);
            parsedUser.token = token;
            setUser(parsedUser);
        } else {
            navigate('/login');
        }
        setLoading(false);
    }, []);

    const login = (data) => {
        const userWithToken = { ...data.user, token: data.token };
        setUser(userWithToken);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        navigate('/login'); // optional
    };

    if (loading) return <div>Loading...</div>;

    return (
        <UserContext.Provider value={{ user, login, logout }}>
            {children}
        </UserContext.Provider>
    );
};

export const useAuthContext = () => useContext(UserContext);
