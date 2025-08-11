import { toast } from "react-toastify";

export const fetchUsersHook = async () => {
  try {
    const response = await fetch("http://localhost:5000/api/user/getUsersRoleEdition", {
      credentials:"include"
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      toast.error("Error fetching the users");
      return null;
    }

    return data;
    

  } catch (error) {
    console.error("Fetch error:", error);
    toast.error("Server error occurred.");
    return null;
  }
};


export const addEmployeeToGroupHelper = async(groupId , userId , navigate) => {
    console.log(groupId , userId)
    try {
        const response = await fetch("http://localhost:5000/api/user/add" , {
            method : "POST",
            credentials:"include",
            headers : {
                "Content-Type" : 'application/json'
            } ,
            body:JSON.stringify({
                groupId , 
                userId
            })
        })

        const data = await response.json();
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
            credentials:"include",
            headers : {
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
            credentials:"include"
        })
        
        const data = await response.json();
        if(data.success){
            return data
        }else {
            
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
            credentials:"include",
            body : formdata
        })

        const data = await response.json();
        if(data.success){
            toast.success("updated info successfully")

            const existingUser = JSON.parse(localStorage.getItem("user")) || {}
            const updatedUser = { ...existingUser, ...data.newUser }

            localStorage.setItem("user", JSON.stringify(updatedUser))
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
            credentials:"include",
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

export const changeUserRoleHook = async(userId , newRole) =>{
    try {

        const response = await fetch(`http://localhost:5000/api/user/changeRole` , {
            method : "POST",
            credentials:"include",
            headers : {
                'Content-Type' : 'application/json'
            },
            body : JSON.stringify({
                userId , 
                newRole
            }) 
        })

        const data =await response.json();
       return data;
    } catch (error) {
        console.log(error)
        throw new Error(error)   
    }
}

export const adminUpdateUserInfoHook = async(adminId , userId , newName , newEmail ,newPassword)=>{
    try {
        const payload = { userId , newName , newEmail ,newPassword}
        Object.keys(payload).forEach(key => {
            if (!payload[key]) delete payload[key]; // removes empty strings, null, undefined
        });

        const response = await fetch(`http://localhost:5000/api/user/editInfoAdmin/${adminId}` , {
            method : "POST",
            credentials:"include",
            headers : {
                'Content-Type' : 'application/json'
            },
            body : JSON.stringify(payload) 
        })

        const data =await response.json();
        return data;
    } catch (error) {
        console.log(error)
        throw new Error(error)   
    }
}

export const deleteUserHook = async(userId) =>{
    try {
        const response = await fetch(`http://localhost:5000/api/user/${userId}` , {
            method : "DELETE",
            credentials:"include",
            headers : {
                'Content-Type' : 'application/json'
            }
        })

        const data =await response.json();
        return data;
    }catch (error) {
        console.log(error)
        throw new Error(error)   
    }
}