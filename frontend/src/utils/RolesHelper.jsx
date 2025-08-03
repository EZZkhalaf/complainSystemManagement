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


export const fetchPermissionsHook = async() =>{
    try {
        const response = await fetch(`http://localhost:5000/api/role/getPermissions` , {
            method : "GET",
            headers : {
                "Authorization": `Bearer ${localStorage.getItem('token')}` 
            }
        })

        const data = await response.json();
        
        if(data.success){
            return data.permissions;
        }else{
            toast.error("error fetching the permissions ")
            return 
        }

    } catch (error) {
        console.log(error)
        throw new Error(error)   
    }
}


export const addPErmissionsToRoleHook = async(roleId , permissionsIds) =>{
    try {
        const response = await fetch(`http://localhost:5000/api/role/addPermissionsToRole` , {
            method : "POST",
            headers : {
                "Authorization": `Bearer ${localStorage.getItem('token')}` ,
                'Content-Type' : 'application/json'
            },
            body : JSON.stringify({
                roleId , 
                permissionsIds
            })
        })

        const data = await response.json();
        
        return data;

    } catch (error) {
        console.log(error)
        throw new Error(error)   
    }
}

export const getRoleByIdHook = async(id) => {
    try {
        const response = await fetch(`http://localhost:5000/api/role/${id}` , {
            headers : {
                'Authorization' : `Bearer ${localStorage.getItem("token")}`
            }
        })

        const data = await response.json();
        return data
    } catch (error) {
        console.log(error)
        throw new Error(error)   
    }
}

export const deleteRoleHook = async(roleId)=>{
    try {
        const response = await fetch(`http://localhost:5000/api/role/${roleId}` , {
            method : "DELETE",
            headers : {
                'Authorization' : `Bearer ${localStorage.getItem("token")}`
            }
        })

        const data = await response.json();
        console.log(data)
        if(data.success){
            toast.success(data.message)
            return data
        }else{
            toast.error(data.message)
            return 
        }
    } catch (error) {
        console.log(error)
        throw new Error(error)   
    }
}


export const createPermissionHook = async (permissions) => {
  try {
    const response = await fetch('http://localhost:5000/api/role/addPermissions', {
      method: 'POST',
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(permissions), 
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Fetch error:", error);
    return {
      success: false,
      message: 'Network or server error',
    };
  }
};


export const deletePermissionHook = async (id) => {
  try {
    const response = await fetch(`http://localhost:5000/api/role/deletePermission/${id}`, {
      method: 'DELETE',
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        'Content-Type': 'application/json',
      }
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Fetch error:", error);
    return {
      success: false,
      message: 'Network or server error',
    };
  }
};