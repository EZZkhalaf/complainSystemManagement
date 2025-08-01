import { toast } from "react-toastify"
import { useAuthContext } from "../Context/authContext";

export const loginHook = async(email,password,navigate,login) =>{
    try {
        if(!email || !password){
            toast.error("please fill the required fields")
            return;
        }
        // console.log(email,password)

        const response = await fetch("http://localhost:5000/api/auth/login",{
            method : "POST" , 
            headers : {
                "Content-Type" : 'application/json'
            },
            body : JSON.stringify({
                email : email ,
                password : password
            })
        })

        const data = await response.json();
        if(!data.success) {
            toast.error(data.message)
            return 
        }
        if(data.success){
            toast.success("logged in successfully ")
            console.log(data)
            login(data)
            if(data.user.role === "admin"){
                navigate('/adminPage')
            }else{
                navigate('/userPage')
            }
        }else{
            toast.error(data.message)
        }

    } catch (error) {
        console.log(error)
        throw new Error(error)

    }
}

export const registerHook = async(name , email , password , navigate) =>{
    try {
        const response = await fetch("http://localhost:5000/api/auth/register",{
            method : "POST" , 
            headers : {
                "Content-Type" : 'application/json'
            },
            body : JSON.stringify({
                name : name,
                email : email ,
                password : password
            })
        })
        const data = await response.json();
        console.log(data)
        if(data.success){
            toast.success("Verification email sent. Check your inbox.");
            navigate('/login');
        }else{
            toast.error(data.message || "something wrong with the server")
        }

    } catch (error) {
        console.log(error)
        throw new Error(error)
    }
}


export const hasPermission = (user ,name) =>{
    // const {user} = useAuthContext();
    const permissions = user?.permissions || []

    return permissions.some( p=> p.name === name);
}


