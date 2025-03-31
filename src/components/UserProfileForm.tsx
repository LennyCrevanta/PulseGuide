"use client";

import { useState } from "react";
import { useChatStore } from "@/store/chatStore";
import dynamic from "next/dynamic";

const UserProfileForm = ({ onComplete }: { onComplete: () => void }) => {
  const { userProfile, setUserProfile } = useChatStore();
  const [formData, setFormData] = useState({
    name: userProfile.name || "",
    plan: userProfile.plan || "",
    location: userProfile.location || "",
    interests: userProfile.interests || []
  });

  const interestOptions = [
    "Physical Fitness",
    "Mental Wellness",
    "Financial Planning",
    "Career Development",
    "Family Benefits",
    "Healthcare",
    "Retirement",
    "Education",
    "Work/Life Balance"
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleInterestChange = (interest: string) => {
    const updatedInterests = formData.interests.includes(interest)
      ? formData.interests.filter(i => i !== interest)
      : [...formData.interests, interest];
    
    setFormData({
      ...formData,
      interests: updatedInterests
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUserProfile({
      name: formData.name,
      plan: formData.plan as any,
      location: formData.location,
      interests: formData.interests
    });
    onComplete();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto my-8">
      <h2 className="text-2xl font-bold text-blue-900 mb-6">Personalize Your PulseGuide Experience</h2>
      <p className="text-gray-600 mb-6">
        Help us customize your benefits assistant by providing some information about yourself.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Your Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        
        <div>
          <label htmlFor="plan" className="block text-sm font-medium text-gray-700 mb-1">
            Your Health Plan
          </label>
          <select
            id="plan"
            name="plan"
            value={formData.plan}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
          >
            <option value="">Select your health plan</option>
            <option value="HDHP">High Deductible Health Plan (HDHP)</option>
            <option value="PPO">PPO with $500 deductible</option>
            <option value="HMO">HMO</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            Your Location
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="City, State"
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        
        <div>
          <p className="block text-sm font-medium text-gray-700 mb-3">
            Your Benefit Interests (Select all that apply)
          </p>
          <div className="grid grid-cols-2 gap-2">
            {interestOptions.map((interest) => (
              <div key={interest} className="flex items-center">
                <input
                  type="checkbox"
                  id={interest}
                  checked={formData.interests.includes(interest)}
                  onChange={() => handleInterestChange(interest)}
                  className="mr-2"
                />
                <label htmlFor={interest} className="text-sm text-gray-600">
                  {interest}
                </label>
              </div>
            ))}
          </div>
        </div>
        
        <button
          type="submit"
          className="w-full bg-blue-700 text-white py-2 px-4 rounded hover:bg-blue-800"
        >
          Save & Continue
        </button>
      </form>
    </div>
  );
};

// Export a client-only version of the component
export default dynamic(() => Promise.resolve(UserProfileForm), {
  ssr: false
}); 