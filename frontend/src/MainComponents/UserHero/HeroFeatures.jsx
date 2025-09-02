import React from "react";
import FeatureCard from "../../Molecules/FeatureCard";

const HeroFeatures = () => {
  return (
    <div className="w-full bg-gray-50  rounded-2xl p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FeatureCard
          title="Submit a Complaint"
          description="Use the complaint form to report issues. We'll ensure they’re reviewed and addressed."
        />
        <FeatureCard
          title="Track Your Complaints"
          description="Stay updated on the status of your complaints in real time."
        />
        <FeatureCard
          title="Group Collaboration"
          description="Join groups to engage with others and improve communication."
        />
        <FeatureCard
          title="Your Information is Safe"
          description="All your data is secured and accessible only to authorized team members."
        />
      </div>
    </div>
  );
};

export default HeroFeatures;
