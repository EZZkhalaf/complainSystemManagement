import { toast } from "react-toastify";


export const fetchRolesHook = async() => {
    try {
        const response = await fetch(`http://localhost:5000/api/role/` , {
            method : "GET",
            headers : {
                "Authorization": `Bearer ${localStorage.getItem('token')}` , 
            }
        })

        const data = await response.json();
        console.log(data)
        if(data.success){
            return data.roles;
        }else{
            toast.error("error fetching the roles ")
            return 
        }

    } catch (error) {
        console.log(error)
        throw new Error(error)   
    }
}


export const addnewRoleHook = async(newRole) => {
    try {
        const response = await fetch(`http://localhost:5000/api/role/` , {
            method : "POST",
            headers : {
                "Authorization": `Bearer ${localStorage.getItem('token')}` , 
                'Content-Type' : 'application/json'
            },
            body : JSON.stringify({
                newRole : newRole
            })
        })

        const data = await response.json();

        if(data.success){
            toast.success(data.message)
            return data.createdRole;
        }else{
            toast.error("error fetching the roles ")
            return 
        }

    } catch (error) {
        console.log(error)
        throw new Error(error)   
    }
}