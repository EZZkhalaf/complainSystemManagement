import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../../Context/authContext';
import { addGroupToRuleHook, getRulesHook, removeGroupFromRuleHook, searchGroupsHook } from '../../utils/GroupsHelper';
import { ImArrowRight } from "react-icons/im";
import { toast } from 'react-toastify';

const GroupCard = ({ group , index,setRuleGroups}) => {
    const {user}= useAuthContext()
    const removeGroup = async()=>{
        const data = await removeGroupFromRuleHook(group._id , user._id)
        if(data.success)
            setRuleGroups(data?.groupsSequence || data?.rule?.groupsSequence || [])
    }
    return (
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg px-5 py-4 w-64 flex justify-between items-start space-x-4 hover:shadow-md transition-shadow duration-200">
            <div className="flex flex-col text-left">
            <span className="text-xs text-gray-500 font-semibold tracking-wide">
                Group #{index + 1}
            </span>
            <span className="text-base font-medium text-gray-700 mt-1">
                {group.name}
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

const ComplaintGroupsRule = () => {
  const [groups, setGroups] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [ruleGroups, setRuleGroups] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const { user } = useAuthContext();

  const addGroupToRule = async (group) => {
    const groupId = group._id
    if(ruleGroups.some(g => g._id === groupId)){
        toast.error("group already added ")
        return
    }
    const data = await addGroupToRuleHook(groupId, user._id);
    if (data.success) {
        setRuleGroups(data?.groupsSequence || data?.rule?.groupsSequence || [])
    }
  };

  const fetchRule = async () => {
    const data = await getRulesHook(user._id);
    setRuleGroups(data?.rule?.groupsSequence || []);
  };

  useEffect(() => {
    const delaySearch = setTimeout(async () => {
      if (searchText.trim()) {
        try {
          const data = await searchGroupsHook(searchText, user._id);
          setSearchResults(data.groups);
        } catch (error) {
          console.error('Error fetching groups:', error);
        }
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [searchText]);

  useEffect(() => {
    fetchRule();
  }, []);

  
  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-semibold mb-4  text-gray-800 tracking-tight">
        Complaint Group Flow
      </h1>

      <p className=" text-gray-600 mb-8 text-sm md:text-base max-w-2xl">
        This page allows you to add and organize groups responsible for handling complaints.
        You can define the sequence in which groups will manage complaints based on your organizational flow.
      </p>

      {/* Search Box */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="🔍 Search groups..."
          className="w-full p-3 text-sm md:text-base border border-gray-300 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

        {searchResults.length > 0 && (
          <div className="mt-2 border border-gray-200 rounded-md bg-white shadow">
            {searchResults.map((group) => (
              <div
                key={group._id}
                className="p-3 text-gray-700 hover:bg-gray-100 cursor-pointer border-b last:border-none"
                onClick={() => addGroupToRule(group)}
              >
                {group.name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Current Rule Sequence */}
      {ruleGroups.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-semibold mb-4 text-gray-700 text-center">
            Current Rule Sequence
          </h2>

          <div className="flex flex-wrap gap-4 items-center justify-center">
            {ruleGroups.map((group, index) => (
              <React.Fragment key={group._id}>
                <GroupCard
                  group={group}
                  index={index}
                  setRuleGroups={setRuleGroups}
                />
                {index < ruleGroups.length - 1 && (
                  <ImArrowRight size={20} className="text-gray-400" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintGroupsRule;
