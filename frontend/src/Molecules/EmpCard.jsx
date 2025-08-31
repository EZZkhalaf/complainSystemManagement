import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../Context/authContext";
import defaultPhoto from "../assets/defaultPhoto.png";
const EmpCard = ({ emp }) => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  return (
    <div
      onClick={() => {
        navigate(
          `/${
            user.role === "admin" ? "adminPage" : "userPage"
          }/listEmployees/employee/${emp?.user?.user_id}`
        );
      }}
      className="bg-white rounded-3xl shadow-md p-6 border border-gray-100 hover:shadow-xl hover:border-blue-200 transition duration-200 flex flex-col items-center cursor-pointer group"
      key={emp.user._id}
    >
      <img
        src={
          emp.user.profilePicture
            ? `http://localhost:5000${emp?.user?.profilePicture}`
            : defaultPhoto
        }
        alt="Profile"
        className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg group-hover:scale-105 transition-transform duration-300"
      />

      <div className="mt-4 text-center">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 capitalize">
          {emp.user.user_name}
        </h3>
        <p className="mt-1 text-sm text-gray-500">{emp.user.user_email}</p>
      </div>

      <div className="mt-3">
        <span className="inline-block px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-700 capitalize font-medium">
          {emp.role}
        </span>
      </div>
    </div>
  );
};

export default EmpCard;
