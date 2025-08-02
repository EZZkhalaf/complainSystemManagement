// import React, { useEffect, useState } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import { getGroupInfoHook } from '../../utils/GroupsHelper';
// import { removeUserFromGroupHook } from '../../utils/UserHelper';
// import { OrbitProgress } from 'react-loading-indicators';
// import { useAuthContext } from '../../Context/authContext';
// import { hasPermission } from '../../utils/AuthHooks';

// const AdminGroupInfo = () => {
//   const [group, setGroup] = useState(null);
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState(null);
//   const {user} = useAuthContext()


//   const [currentPage , setCurrentPage] = useState(1);
//   const usersPerPage = 6;
//   const totalUsers = group?.group?.users || [];
//   const indexOfLastUser = currentPage * usersPerPage;
//   const indexOfFirstUser = indexOfLastUser - usersPerPage;
//   const currentUsers = totalUsers.slice(indexOfFirstUser, indexOfLastUser);
//   const totalPages = Math.ceil(totalUsers.length / usersPerPage);

//   const navigate = useNavigate();
//   const { id } = useParams();

//   const fetchGroup = async () => {
//     setLoading(true);
//     try {
//       const data = await getGroupInfoHook(id);
//       if (data) {
//         setGroup(data);
//       } else {
//         setError("Group not found or error occurred.");
//       }
//     } catch (err) {
//       setError("Something went wrong while fetching the group.");
//     } finally {
//       setLoading(false);
//     }
//   };
//   // console.log(group)


//   const removeUserFromGroup = async (e, userId) => {
//     e.preventDefault();

//     try {
//       setLoading(true);
//       const response = await removeUserFromGroupHook(id, userId);
//       if (response.success) {
//         setGroup(prevGroup => {
//           if (!prevGroup) return prevGroup;

//           return {
//             ...prevGroup,
//             group: {
//               ...prevGroup.group,
//               users: prevGroup.group.users.filter(user => user._id !== userId)
//             }
//           };
//         });
//       } else {
//         // handle failure, e.g. show error toast
//         console.error("Failed to remove user");
//       }
//     } catch (error) {
//       console.error(error);
//     } finally {
//       setLoading(false);
//     }
// };



//   useEffect(() => {
//     fetchGroup();
    
//   }, [id ]);

//   if(loading) return(
//             <div className="max-w-md mx-auto p-8 bg-gradient-to-br space-y-6 flex justify-center items-center">
//                 <OrbitProgress color="#32cd32" size="medium" text="" textColor="" />
//             </div>
//     )
//   if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;
//   if (!group) return null; 


//   return (
//     <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
//       {/* Group Info Card */}
//       <div className="bg-white shadow-lg rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <div>
//           <div className='flex justify-center items-center'>
//             <h1 className="text-2xl sm:text-3xl font-bold text-blue-800 mb-1">
//               {group.group.name}
//             </h1>
//           </div>
//           <p className="text-gray-500 text-sm">
//             Created at: {new Date(group.group?.createdAt).toLocaleDateString()}
//           </p>
//         </div>

//         <div  className='flex justify-between'>

//         {hasPermission(user,"add_employee_to_group") && 
//           <button
//           onClick={() => navigate(`/adminPage/add-employee/${id}`)}
//           className="bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2 rounded-lg shadow transition-all"
//           >
//             + Add Employee
//           </button>
//         }
//         {hasPermission(user,"delete_group") && 
//             <button
//             onClick={() => deleteGroup()}
//             className="bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2 rounded-lg shadow transition-all"
//             >
//               Delete Group
//             </button>
//           }
//           </div>

        
//       </div>

//       {/* Group Users Header */}
//       <div className="flex items-center justify-between flex-wrap gap-2">
//         <h2 className="text-xl font-semibold text-gray-700">Group Users</h2>
//       </div>

//           {/* Group Users Grid */}
//         {group.group.users?.length === 0 ? (
//           <div className="text-gray-500 italic">No users yet in this group.</div>
//         ) : (
//           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
//             {group?.group?.users.map(user1 => (
//               <div
//                 key={user1._id}
//                 onClick={() => navigate(`/${user?.role === 'admin' ? 'adminPage' : 'userPage'}/listEmployees/employee/${user1._id}`)}
//                 className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-all flex items-center justify-between"
//               >
//                 <div>
//                   <h3 className="text-lg font-semibold text-gray-800">{user1.name}</h3>
//                   <p className="text-gray-600 text-sm">{user1.email}</p>
//                 </div>

//                 {hasPermission(user,"remove_employee_from_group") && (
//                   <button 
//                     onClick={(e) => {
//                       removeUserFromGroup(e , user._id)
//                     }}
//                     className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-md shadow-sm transition-colors">
//                     Remove
//                   </button>
//                 )}
//               </div>
//             ))}
//           </div>
//         )}

//     </div>

//   );
// };

// export default AdminGroupInfo;



import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { deleteGroupHook, getGroupInfoHook } from '../../utils/GroupsHelper';
import { removeUserFromGroupHook } from '../../utils/UserHelper';
import { OrbitProgress } from 'react-loading-indicators';
import { useAuthContext } from '../../Context/authContext';
import { hasPermission } from '../../utils/AuthHooks';

const AdminGroupInfo = () => {
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const { id } = useParams();

  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 6;
  const totalUsers = group?.group?.users || [];
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = totalUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(totalUsers.length / usersPerPage);

  const fetchGroup = async () => {
    setLoading(true);
    try {
      const data = await getGroupInfoHook(id);
      if (data) {
        setGroup(data);
      } else {
        setError("Group not found or error occurred.");
      }
    } catch (err) {
      setError("Something went wrong while fetching the group.");
    } finally {
      setLoading(false);
    }
  };

  const removeUserFromGroup = async (e, userId) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await removeUserFromGroupHook(id, userId);
      if (response.success) {
        setGroup(prev => ({
          ...prev,
          group: {
            ...prev.group,
            users: prev.group.users.filter(u => u._id !== userId),
          },
        }));
      } else {
        console.error("Failed to remove user");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const deleteGroup = async() =>{
    let groupdId = id;
    await deleteGroupHook(groupdId , navigate);
  }

  useEffect(() => {
    fetchGroup();
  }, [id]);

  if (loading)
    return (
      <div className="w-full h-[300px] flex justify-center items-center">
        <OrbitProgress color="#32cd32" size="medium" text="" />
      </div>
    );

  if (error)
    return <div className="text-center mt-10 text-red-500">{error}</div>;

  if (!group) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Group Info */}
      {/* Group Info Card */}
      <div className="bg-white shadow-lg rounded-2xl p-6 sm:p-8 space-y-4">
        {/* Group Name and Date */}
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-800 mb-1">
            {group.group.name}
          </h1>
          <p className="text-gray-500 text-sm">
            Created at: {new Date(group.group?.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap sm:justify-end justify-center gap-3">
          {hasPermission(user, "add_employee_to_group") && (
            <button
              onClick={() => navigate(`/adminPage/add-employee/${id}`)}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg shadow transition"
            >
              + Add Employee
            </button>
          )}

          {hasPermission(user, "delete_group") && (
            <button
              onClick={() => {
                deleteGroup()
              }}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg shadow transition"
            >
              Delete Group
            </button>
          )}
        </div>
      </div>


      {/* Group Users Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-700">Group Users</h2>

        {group.group.users?.length === 0 ? (
          <div className="text-gray-500 italic">No users yet in this group.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {currentUsers.map(user1 => (
              <div
                key={user1._id}
                className="bg-white border border-gray-200 rounded-xl p-5 shadow hover:shadow-lg transition cursor-pointer flex justify-between items-center"
                onClick={() =>
                  navigate(
                    `/${user?.role === 'admin' ? 'adminPage' : 'userPage'}/listEmployees/employee/${user1._id}`
                  )
                }
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {user1.name}
                  </h3>
                  <p className="text-sm text-gray-500">{user1.email}</p>
                </div>

                {hasPermission(user, "remove_employee_from_group") && (
                  <button
                    onClick={e => removeUserFromGroup(e, user1._id)}
                    className="bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-3 py-1.5 rounded shadow transition"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-4 gap-2">
            {[...Array(totalPages).keys()].map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page + 1)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                  currentPage === page + 1
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {page + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminGroupInfo;
