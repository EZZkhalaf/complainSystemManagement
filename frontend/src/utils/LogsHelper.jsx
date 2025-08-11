import { toast } from "react-toastify";

export const getLogsHook = async(page , logsPerPage , {action , resource , user}) =>{
    try {
        const res = await fetch(`http://localhost:5000/api/logs/`, {
                method : "POST",
                credentials : "include",
                headers: {
                  'Content-Type' : 'application/json'
                } ,
                body :JSON.stringify({
                    page : page ,
                    logsPerPage:logsPerPage ,
                    action , 
                    user :user ,
                    resource : resource
                })
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