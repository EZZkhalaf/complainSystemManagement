import React, { useState, useEffect } from "react";
import { useAuthContext } from "../../Context/authContext";
import {
  addGroupToRuleHook,
  getRulesHook,
  removeGroupFromRuleHook,
  searchGroupsHook,
} from "../../utils/GroupsHelper";
import { ImArrowRight } from "react-icons/im";
import { toast } from "react-toastify";
import PageHeader from "../../Molecules/PageHeader";
import InputText from "../../Atoms/InputText";
import GroupCard from "../../Molecules/GroupCard";
import GroupsCardListing from "../../MainComponents/ComplaintsGroupRule.jsx/GroupsCardListing";

const ComplaintGroupsRule = () => {
  const [groups, setGroups] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [ruleGroups, setRuleGroups] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const { user } = useAuthContext();

  const addGroupToRule = async (group) => {
    const groupId = group.group_id;
    if (ruleGroups.some((g) => g.group_id === groupId)) {
      toast.error("group already added ");
      return;
    }
    const data = await addGroupToRuleHook(groupId, user._id);
    if (data.success) {
      setRuleGroups(data?.groupsSequence || data?.rule?.groupsSequence || []);
    }
  };

  const fetchRule = async () => {
    const data = await getRulesHook(user._id);
    setRuleGroups(data?.rule?.groups || []);
  };

  useEffect(() => {
    const delaySearch = setTimeout(async () => {
      if (searchText.trim()) {
        try {
          const data = await searchGroupsHook(searchText, user._id);
          setSearchResults(data.groups);
        } catch (error) {
          console.error("Error fetching groups:", error);
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
    <div className="max-w-full mx-auto p-6 bg-gray-50 min-h-screen">
      <PageHeader
        header={"Complaint Group Flow"}
        paragraph={`This page allows you to add and organize groups responsible for handling
        complaints. You can define the sequence in which groups will manage
        complaints based on your organizational flow.`}
      />

      <div className="mb-8">
        <InputText
          type={"text"}
          setTarget={setSearchText}
          value={searchText}
          width={"w-full"}
          placeholder={"🔍 Search groups..."}
        />

        {searchResults.length > 0 && (
          <div className="mt-2 border border-gray-200 rounded-md bg-white shadow">
            {searchResults.map((group) => (
              <div
                key={group.group_id}
                className="p-3 text-gray-700 hover:bg-gray-100 cursor-pointer border-b last:border-none"
                onClick={() => addGroupToRule(group)}
              >
                {group.group_name}
              </div>
            ))}
          </div>
        )}
      </div>

      <GroupsCardListing
        ruleGroups={ruleGroups}
        setRuleGroups={setRuleGroups}
      />
    </div>
  );
};

export default ComplaintGroupsRule;
