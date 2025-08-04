import { toast } from "react-toastify";


export const  getUserGroupsHook = async(userId) =>{
    try {
      const res = await fetch(`http://localhost:5000/api/group/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      if (data.success) {
        return data.groups
      } else {
        return 
      }
    } catch (error) {
      console.error("Failed to fetch groups:", error);
    } 
}

export const listGroupsHook = async(id) =>{
    try {
      const res = await fetch(`http://localhost:5000/api/group/admin/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      console.log(data)
      if (data.success) {
        return data.groups
      } else {
        toast.error(data.error || "something wrong with the server ")
        return 
      }
    } catch (error) {
      console.error("Failed to fetch groups:", error);
    } 
}

export const listGroupComplaintsHook = async(groupId , userId,  
           { type,
            status,
            page,
            limit}
        )=>{
    try {
      const res = await fetch(`http://localhost:5000/api/group/groupcomplaints/${groupId}`, {
        method : "POST",
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type' : 'application/json'
        } ,
        body :JSON.stringify({
          userId : userId ,
          type ,
          status ,
          page ,
          limit
        })
      });
      const data = await res.json();
      console.log(data)
      if (data.success) {
        return data
      } else {
        toast.error(data.error || "something wrong with the server ")
        return 
      }
    } catch (error) {
      console.error("Failed to fetch groups:", error);
    } 
}

export const addGroupHook = async(userId , name , description , navigate) =>{
    try {
      const res = await fetch(`http://localhost:5000/api/group/${userId}`, {
        method : "POST",
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type' : 'application/json'
        } , 
        body : JSON.stringify({
            description , 
            name 
        })
      });
      const data = await res.json();
    //   console.log(data)
      if (data.success) {
        toast.success("group created successfully")
        navigate("/adminPage/groups")
      } else {
        toast.error(data.error || "something wrong with the server ")
        return 
      }
    } catch (error) {
      console.error("Failed to fetch groups:", error);
    } 
}

export const getGroupInfoHook = async(groupId)=>{
        try {
      const res = await fetch(`http://localhost:5000/api/group/${groupId}`, {
        method : "GET",
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        } 
      });
      const data = await res.json();
      // console.log(data)
      if (data.success) {
        return data
      } else {
        toast.error(data.error || "something wrong with the server ")
        return 
      }
    } catch (error) {
      console.error("Failed to fetch groups:", error);
    } 
}

export const deleteGroupHook = async(groupId , navigate) =>{
  try {
      const res = await fetch(`http://localhost:5000/api/group/${groupId}`, {
        method : "Delete",
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        } 
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message)
        navigate(-1)
      } else {
        toast.error(data.message || "something wrong with the server ")
        return 
      }
  }catch (error) {
      console.error("Failed to fetch groups:", error);
  } 
}