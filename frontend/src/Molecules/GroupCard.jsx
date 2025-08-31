import { useAuthContext } from "../Context/authContext";
import { removeGroupFromRuleHook } from "../utils/GroupsHelper";

const GroupCard = ({ group, index, setRuleGroups }) => {
  const { user } = useAuthContext();
  const removeGroup = async () => {
    const data = await removeGroupFromRuleHook(group.group_id, user._id);
    if (data.success)
      setRuleGroups(data?.groupsSequence || data?.rule?.groups || []);
  };
  return (
    <div className="bg-white border border-gray-200 shadow-sm rounded-lg px-5 py-4 w-64 flex justify-between items-start space-x-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex flex-col text-left">
        <span className="text-xs text-gray-500 font-semibold tracking-wide">
          Group #{index + 1}
        </span>
        <span className="text-base font-medium text-gray-700 mt-1">
          {group.group_name}
        </span>
      </div>

      {/* Right: Remove Button */}
      <button
        onClick={() => removeGroup()}
        className="text-gray-400 hover:text-red-500 transition-colors duration-200"
        title="Remove Group"
      >
        ✕
      </button>
    </div>
  );
};

export default GroupCard;
