// import React from "react";
// import { useNavigate } from "react-router-dom";
// import { useAuthContext } from "../Context/authContext";

// const CustomizeButton = ({ text, onClick}) => {
//   const navigate = useNavigate();
//   return (
//     <div className="flex justify-end mb-6">
//       <button
//         onClick={() => navigate(url)}
//         className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-200"
//       >
//         {text}
//       </button>
//     </div>
//   );
// };

// export default CustomizeButton;

import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../Context/authContext";

const CustomizeButton = ({ text, onClick }) => {
  const navigate = useNavigate();
  return (
    <div className="flex justify-end mb-6">
      <button
        onClick={onClick}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-200"
      >
        {text}
      </button>
    </div>
  );
};

export default CustomizeButton;
