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


export const fetchAdminSummaryHook = async(id) =>{
    try {
        const response = await fetch(`http://localhost:5000/api/user/getSummary/${id}` , {
            headers : {
                "Authorization": `Bearer ${localStorage.getItem('token')}` , 
            } 
        })
        
        const data = await response.json();
        if(data.success){
            return data
        }else {
            toast.error(data.message || "error fetching the summary ")
            return
        }
    } catch (error) {
        console.log(error)
        throw new Error(error)   
    }
}


export const editUserInfoHook = async(formdata , id )=>{
    try {
        const response = await fetch(`http://localhost:5000/api/user/editInfo/${id}` , {
            method : "PUT",
            headers : {
                "Authorization": `Bearer ${localStorage.getItem('token')}` , 
            } ,
            body : formdata
        })

        const data = await response.json();
        console.log(data)
        if(data.success){
            toast.success("updated info successfully")
            localStorage.setItem("user" , JSON.stringify(data.newUser))
            return data.newUser
        }else{
            toast.error(data.message)
            return 
        }

    } catch (error) {
        console.log(error)
        throw new Error(error)   
    }
}

export const getUserByIdHook = async(id) =>{
    try {
        const response = await fetch(`http://localhost:5000/api/user/getUser/${id}` , {
            headers : {
                "Authorization": `Bearer ${localStorage.getItem('token')}` , 
            } ,
        })

        const data =await response.json();
        if(data.success){
            return data
        }else{
            toast.error(data.message);
            return
        }
    } catch (error) {
        console.log(error)
        throw new Error(error)   
    }
}