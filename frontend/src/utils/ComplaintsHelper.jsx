import { toast } from "react-toastify";


export const listComplaintsHook = async(userId , page , limit )=>{
    try {
        const response = await fetch(`http://localhost:5000/api/complaints` , {
            method : 'POST',
            credentials : "include",
            headers: {
                
                "Content-Type" : "application/json"
            },
            body : JSON.stringify({
                page :page ,
                limit : limit
            })
        })

        const data= await response.json();
        // console.log(data)
        if(data.success){
            return data;
        }else {
            toast.error(data.error)
            return
        }
    }  catch (error) {
        console.log(error)
        throw new Error(error)
    }
}


export const AddComplaintHook = async(userId , description , type ,navigate) => {
    try {
        const response = await fetch(`http://localhost:5000/api/complaints/${userId}` , {
            method : 'POST',
            credentials : "include",
            headers: {
                'Content-Type' : 'application/json'
            } , 
            body : JSON.stringify({
                description , 
                type
            })
        })

        const data= await response.json();
        if(data.success){
            toast.success("complaint added successfully")
            navigate('/userPage')
        }else {
            toast.error(data.error)
            return
        }
    }  catch (error) {
        console.log(error)
        throw new Error(error)
    }
}


export const getComaplintInfoHook = async(id) =>{
    try {
        const response = await fetch(`http://localhost:5000/api/complaints/info/${id}` , {
            credentials:"include"
        })

        const data= await response.json();
        if(data.success){
            return data.complaint;
        }else {
            toast.error(data.error)
            return
        }
    }  catch (error) {
        console.log(error)
        throw new Error(error)
    }
}


export const changeComplaintStatusHook = async(complaintId, status ,userId) =>{
    try {
         const response = await fetch(`http://localhost:5000/api/complaints/` , {
            method : 'PUT',
            credentials : "include",
            headers: {
                'Content-Type' : 'application/json'
            } , 
            body : JSON.stringify({
                complaintId ,
                status , 
                userId
            })
        })

        const data= await response.json();
        if(data.success){
            return data.complaint;
        }else {
            toast.error(data.message)
            return
        }
    } catch (error) {
        console.log(error)
        throw new Error(error)
    }
}

export const ListUserComplaintsHook = async(id) =>{
    try {
        console.log(id)
         const response = await fetch(`http://localhost:5000/api/complaints/user/${id}` , {
           credentials : "include"
        })

        const data= await response.json();
        // console.log(data)
        if(data.success){
            return data.complaints;
        }else {
            toast.error(data.message)
            return
        }
    } catch (error) {
        console.log(error)
        throw new Error(error)
    }
}

export const deleteComplaintHook = async(complaintId, userId , navigate) =>{
    try {
         const response = await fetch(`http://localhost:5000/api/complaints/delete/${userId}` , {
           method:"DELETE" ,
           credentials:"include",
            headers: {
                'Content-Type' : 'application/json'
            } ,
             body : JSON.stringify({complaintId})
        })

        const data= await response.json();
        
        if(data.success){
            toast.success("complaint deleted successfully")
            navigate(-1)
        }else {
            toast.error(data.message)
            return
        }
    } catch (error) {
        console.log(error)
        throw new Error(error)
    }
}


export const handleComplaintInGroupHook = async(complaintId , userId  ,status) =>{
    try {

       const response = await fetch(`http://localhost:5000/api/complaints/handleComplaintInGroup/${complaintId}` , {
           method:"POST" ,
           credentials:"include",
            headers: {
                'Content-Type' : 'application/json'
            } ,
             body : JSON.stringify({
                userId : userId ,
                // groupId : groupId ,
                status : status

             })
        })

        const data= await response.json();
        if(data.success){
            toast.success("complaint status changed successfully")
            return data
        }else {
            toast.error(data.message)
            return
        } 
    }catch (error) {
        console.log(error)
        throw new Error(error)
    }
}