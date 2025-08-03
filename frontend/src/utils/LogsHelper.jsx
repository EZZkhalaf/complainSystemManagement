export const getLogsHook = async(page , logsPerPage) =>{
    try {
        const res = await fetch(`http://localhost:5000/api/logs/`, {
                method : "POST",
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                } ,
                body :{
                    page ,
                    logsPerPage
                }
              });


              const data = await res.json();
              if (data.success) {
                return data
              } else {
                toast.error(data.message || "something wrong with the server ")
                return 
              }
    }  catch (error) {
    console.error("Fetch error:", error);
    return {
      success: false,
      message: 'Network or server error',
    };
  }
}