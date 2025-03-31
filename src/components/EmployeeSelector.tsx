"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useChatStore } from '@/store/chatStore';

// Define the employee object structure
interface Employee {
  id: string;
  name: string;
  description: string;
  planType: string;
  imgSrc: string;
  department: string;
}

interface EmployeeCardProps {
  name: string;
  description: string;
  planType: string;
  imgSrc: string;
  id: string;
  department: string;
  onClick: () => void;
}

const EmployeeCard = ({ name, description, planType, imgSrc, id, department, onClick }: EmployeeCardProps) => {
  const router = useRouter();
  const { createThread, setUserProfile } = useChatStore();

  const startChatAsEmployee = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Set the user profile to the employee's information
    setUserProfile({
      name: name,
      plan: planType as "HMO" | "PPO" | "HDHP",
      location: department || "Employee", // Use department if available
      interests: []
    });
    
    // Create a new chat thread
    createThread();
    
    // Navigate to the chat page
    router.push('/chat');
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300 h-full flex flex-col"
      onClick={onClick}
    >
      <div className="h-56 w-full relative">
        <Image 
          src={imgSrc} 
          alt={`${name}'s profile`} 
          fill
          className="object-cover object-center"
          sizes="(max-width: 768px) 100vw, 33vw"
          priority
          unoptimized
        />
      </div>
      <div className="p-4 flex-grow flex flex-col">
        <h3 className="text-xl font-semibold text-blue-900">{name}</h3>
        <div className="mt-1 inline-block bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded">
          {planType} Plan
        </div>
        <p className="text-gray-600 mt-2 flex-grow">{description}</p>
        
        <div className="mt-4 flex flex-col space-y-2">
          <div className="flex space-x-2">
            <Link 
              href={`/employee/${id}`}
              className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-center text-sm"
              onClick={(e) => e.stopPropagation()}
            >
              View Profile
            </Link>
            <button
              onClick={startChatAsEmployee}
              className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-center text-sm flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
              Chat
            </button>
          </div>
          <Link 
            href={`/benefits/${id}`}
            className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-center text-sm flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            View Benefits
          </Link>
        </div>
      </div>
    </div>
  );
};

export default function EmployeeSelector() {
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const { clearUserProfile } = useChatStore();
  
  // Clear the user profile when this component loads
  useEffect(() => {
    clearUserProfile();
  }, [clearUserProfile]);

  const employees = [
    {
      id: 'peg',
      name: 'Peg',
      description: 'Having a baby (9 months of in-network pre-natal care and hospital delivery)',
      planType: 'HMO',
      imgSrc: 'https://images.unsplash.com/photo-1592598015799-35c84b09394c?auto=format&fit=crop&q=80',
      department: 'Marketing'
    },
    {
      id: 'joe',
      name: 'Joe',
      description: 'Managing Type 2 Diabetes (a year of routine in-network care of a well-controlled condition)',
      planType: 'PPO',
      imgSrc: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80',
      department: 'Finance'
    },
    {
      id: 'mia',
      name: 'Mia',
      description: 'Simple Fracture (in-network emergency room visit and follow up care)',
      planType: 'HDHP',
      imgSrc: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80',
      department: 'Engineering'
    }
  ];

  const handleSelectEmployee = (id: string) => {
    setSelectedEmployee(id);
  };

  return (
    <div className="min-h-screen bg-gray-50 w-full">
      <div className="py-8 px-4 sm:px-6 lg:px-8 w-full max-w-[1600px] mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-900 mb-4">Select an Employee Profile</h1>
          <p className="text-lg text-gray-600 mb-4">
            Choose an employee to view their profile, benefits, or chat as them
          </p>
          <div className="flex justify-center gap-4 mb-4">
            <Link 
              href="/admin" 
              className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              View Aggregate Risk Dashboard
            </Link>
            <Link 
              href="/admin/analytics" 
              className="inline-flex items-center gap-2 bg-purple-100 text-purple-800 px-4 py-2 rounded-lg hover:bg-purple-200 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              View Analytics Dashboard
            </Link>
            <Link 
              href="/demo" 
              className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-lg hover:bg-green-200 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Chat Widget Demo
            </Link>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {employees.map((employee) => (
            <div key={employee.id} className="h-full">
              <EmployeeCard
                id={employee.id}
                name={employee.name}
                description={employee.description}
                planType={employee.planType}
                imgSrc={employee.imgSrc}
                department={employee.department}
                onClick={() => handleSelectEmployee(employee.id)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}