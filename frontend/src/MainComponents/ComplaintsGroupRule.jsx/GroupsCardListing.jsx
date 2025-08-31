import React from "react";
import GroupCard from "../../Molecules/GroupCard";
import { ImArrowRight } from "react-icons/im";

const GroupsCardListing = ({ ruleGroups, setRuleGroups }) => {
  return (
    <div>
      {ruleGroups.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-semibold mb-4 text-gray-700 text-center">
            Current Rule Sequence
          </h2>

          <div className="flex flex-wrap gap-4 items-center justify-center">
            {ruleGroups.map((group, index) => (
              <React.Fragment key={group.group_id}>
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

export default GroupsCardListing;
