"use client";

import { useChatStore } from "@/store/chatStore";
import dynamic from "next/dynamic";

// This will eventually be dynamic based on user profile and RAG
const generateRecommendations = (planType: string | null, interests: string[]) => {
  const recommendations = [
    {
      title: "Complete your wellness screening",
      description: "Earn rewards by completing your annual health screening",
      icon: "🩺"
    },
    {
      title: "Check FSA/HSA balances",
      description: "Use your pre-tax funds before they expire",
      icon: "💰"
    },
    {
      title: "Explore mental wellness resources",
      description: "Access your free counseling sessions",
      icon: "🧠"
    }
  ];

  // In the future, this will filter based on RAG data + user profiles
  return recommendations;
};

const BenefitRecommendations = () => {
  const { userProfile } = useChatStore();
  const recommendations = generateRecommendations(userProfile.plan, userProfile.interests);

  return (
    <div className="border-t px-6 py-4 bg-white">
      <h3 className="text-sm font-medium text-gray-500 mb-3">Recommended for you</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {recommendations.map((rec, index) => (
          <div key={index} className="border rounded-lg p-3 flex items-start gap-3 hover:bg-blue-50 cursor-pointer transition-colors">
            <div className="text-2xl">{rec.icon}</div>
            <div>
              <h4 className="font-medium text-blue-900">{rec.title}</h4>
              <p className="text-sm text-gray-600">{rec.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Export a client-only version of the component
export default dynamic(() => Promise.resolve(BenefitRecommendations), {
  ssr: false
}); 