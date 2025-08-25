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
      console.error("Failed to fetch user leaves:", error);
    } 
}


export const getLeaves = async(userId , currentPage , leavesPerPage , leave_type , leave_status , date_from , date_to) => {
    try {
        const response = await fetch(`http://localhost:5000/api/leaves/getOtherLeaves/${userId}`, {
            method : "POST",
            credentials : "include" ,
            headers : {
                'Content-Type' : 'application/json'
            },
            body : JSON.stringify({
                currentPage , 
                leavesPerPage , 
                leave_status , 
                leave_type ,
                date_from , 
                date_to
            })
        })

        const data = await response.json();
        return data;
    }catch (error) {
      console.error("Failed to fetch  leaves:", error);
    } 
}

// changeState/:leaveId

export const changeLeaveStatus = async(leaveId , leave_handler_id , new_state) => {
    try {
        const response = await fetch(`http://localhost:5000/api/leaves/changeState/${leaveId}`, {
            method : "PUT",
            credentials : "include" ,
            headers : {
                'Content-Type' : 'application/json'
            },
            body : JSON.stringify({
                leave_handler_id ,
                new_state
            })
        })

        const data = await response.json();
        return data;
    }catch (error) {
      console.error("Failed to fetch  leaves:", error);
    } 
}