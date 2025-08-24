export const addLeave = async (userId , leave_description ,leave_type )=>{
    try {
        const response = await fetch(`http://localhost:5000/api/leaves/${userId}`, {
            method : "POST",
            credentials : "include" ,
            headers : {
                'Content-Type' : 'application/json'
            },
            body : JSON.stringify({
                leave_description ,
                leave_type
            })
        })

        const data = await response.json();
        return data;
    }catch (error) {
      console.error("Failed to add leave:", error);
    } 
}

export const getUserLeaves = async(userId , currentPage , leavesPerPage) => {
    try {
        const response = await fetch(`http://localhost:5000/api/leaves/user/${userId}`, {
            method : "POST",
            credentials : "include" ,
            headers : {
                'Content-Type' : 'application/json'
            },
            body : JSON.stringify({
                currentPage , 
                leavesPerPage
            })
        })

        const data = await response.json();
        return data;
    }catch (error) {
      console.error("Failed to add leave:", error);
    } 
}