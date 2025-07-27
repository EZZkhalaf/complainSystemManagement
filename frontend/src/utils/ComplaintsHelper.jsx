import { toast } from "react-toastify";


export const listComplaintsHook = async(userId)=>{
    try {
        const response = await fetch(`http://localhost:5000/api/complaints/${userId}` , {
            method : 'GET',
            headers: {
                "Authorization": `Bearer ${localStorage.getItem('token')}`
            }
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
            headers: {
                "Authorization": `Bearer ${localStorage.getItem('token')}` , 
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