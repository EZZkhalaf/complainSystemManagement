import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const UserContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchUser(){
            try {
                const res = await fetch("http://localhost:5000/api/auth/me", {
                    method : "GET",
                    credentials: "include",  
                });

                if (!res.ok) {
                    navigate("/login");
                    setLoading(false);
                    return;
                }

                const data = await res.json();
                console.log(data)
                setUser(data.user);
            }  catch (err) {
                console.error(err);
                navigate("/login");
            } finally {
                setLoading(false);
            }
        }

        fetchUser()
    }, []);

    const login = (data) => {
        setUser(data)
        
    };

    const setUserNewData = (data)=>{
        setUser(data)
    }

    const logout = () => {
        fetch("http://localhost:5000/api/auth/logout", {
            method: "POST",
            credentials: "include",
        }).finally(() => {
            setUser(null);
            navigate("/login");
        });
    };

    if (loading) return <div>Loading...</div>;

    return (
        <UserContext.Provider value={{ user, login, logout ,setUserNewData }}>
            {children}
        </UserContext.Provider>
    );
};

export const useAuthContext = () => useContext(UserContext);