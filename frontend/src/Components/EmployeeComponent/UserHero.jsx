import PageHeader from "../../Molecules/PageHeader";
import HeroSummaryCards from "../../MainComponents/UserHero/HeroSummaryCards";
import HeroFeatures from "../../MainComponents/UserHero/HeroFeatures";

const UserHero = () => {
  return (
    <div className="w-full  bg-gray-50 min-h-screen">
      <PageHeader
        header={"Complaint Management System Overview"}
        paragraph={`We’re glad to have you here. This platform helps you report issues, stay updated, and connect with your team.`}
      />

      <HeroSummaryCards />
      <HeroFeatures />
    </div>
  );
};

export default UserHero;
