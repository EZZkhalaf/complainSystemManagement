import { toast } from "react-toastify";

export const fetchUsersHook = async() => {
    try {
        const response = await fetch("http://localhost:5000/api/user/" , {
            headers : {
                "Authorization": `Bearer ${localStorage.getItem('token')}` , 
            }
        })

        const data = await response.json();
        if(!data.success){
            toast.error("error fetching the users")
            return;
        }else if(data.success){
            return data.users;
        }
    } catch (error) {
        console.log(error)
        throw new Error(error)   
    }
}

export const addEmployeeToGroupHelper = async(groupId , userId , navigate) => {
    console.log(groupId , userId)
    try {
        const response = await fetch("http://localhost:5000/api/user/add" , {
            method : "POST",
            headers : {
                "Authorization": `Bearer ${localStorage.getItem('token')}` , 
                "Content-Type" : 'application/json'
            } ,
            body:JSON.stringify({
                groupId , 
                userId
            })
        })

        const data = await response.json();
        // console.log(data)
        if(!data.success){
            toast.error(data.message || "error adding user ")
            return;
        }else if(data.success){
            toast.success("user added successfully")
            navigate(`/adminPage/current-group/${groupId}`)
        }    
    } catch (error) {
        console.log(error)
        throw new Error(error)   
    }
}


export const removeUserFromGroupHook = async(groupId , userId) =>{
    try {
        const response = await fetch("http://localhost:5000/api/group/removeUser" , {
            method : "DELETE",
            headers : {
                "Authorization": `Bearer ${localStorage.getItem('token')}` , 
                "Content-Type" : 'application/json'
            } ,
            body:JSON.stringify({
                groupId , 
                userId
            })
        })
        
        const data = await response.json();
        if(data.success){
            toast.success("removed successfully")
            return data
        }else {
            toast.error(data.message)
            return
        }
    } catch (error) {
        console.log(error)
        throw new Error(error)   
    }
}