"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useChatStore } from '@/store/chatStore';

// These would typically come from an API or database
const employeeData = {
  peg: {
    id: 'peg',
    name: 'Peg',
    email: 'peg@company.com',
    phone: '555-123-4567',
    department: 'Marketing',
    jobTitle: 'Senior Marketing Manager',
    planType: 'HMO',
    description: 'Having a baby (9 months of in-network pre-natal care and hospital delivery)',
    imgSrc: 'https://images.unsplash.com/photo-1592598015799-35c84b09394c?format=auto&fit=crop&q=80',
    planDetails: {
      deductible: '$1,000',
      specialist_copay: '$45',
      hospital_coinsurance: '20%',
      other_coinsurance: '20%',
      totalCost: '$12,700',
      userPays: '$3,660',
      breakdown: {
        deductibles: '$1,000',
        copayments: '$500',
        coinsurance: '$2,100',
        notCovered: '$60'
      },
      services: [
        'Specialist office visits (prenatal care)',
        'Childbirth/Delivery Professional Services',
        'Childbirth/Delivery Facility Services',
        'Diagnostic tests (ultrasounds and blood work)',
        'Specialist visit (anesthesia)'
      ]
    }
  },
  joe: {
    id: 'joe',
    name: 'Joe',
    email: 'joe@company.com',
    phone: '555-987-6543',
    department: 'Finance',
    jobTitle: 'Financial Analyst',
    planType: 'PPO',
    description: 'Managing Type 2 Diabetes (a year of routine in-network care of a well-controlled condition)',
    imgSrc: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80',
    planDetails: {
      deductible: '$1,000',
      specialist_copay: '$45',
      hospital_coinsurance: '20%',
      other_coinsurance: '20%',
      totalCost: '$5,600',
      userPays: '$2,270',
      breakdown: {
        deductibles: '$800',
        copayments: '$1,100',
        coinsurance: '$350',
        notCovered: '$20'
      },
      services: [
        'Primary care physician office visits (including disease education)',
        'Diagnostic tests (blood work)',
        'Prescription drugs',
        'Durable medical equipment (glucose meter)'
      ]
    }
  },
  mia: {
    id: 'mia',
    name: 'Mia',
    email: 'mia@company.com',
    phone: '555-456-7890',
    department: 'Engineering',
    jobTitle: 'Software Engineer',
    planType: 'HDHP',
    description: 'Simple Fracture (in-network emergency room visit and follow up care)',
    imgSrc: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80',
    planDetails: {
      deductible: '$1,000',
      specialist_copay: '$45',
      hospital_coinsurance: '20%',
      other_coinsurance: '20%',
      totalCost: '$2,800',
      userPays: '$1,740',
      breakdown: {
        deductibles: '$1,000',
        copayments: '$500',
        coinsurance: '$240',
        notCovered: '$0'
      },
      services: [
        'Emergency room care (including medical supplies)',
        'Diagnostic test (x-ray)',
        'Durable medical equipment (crutches)',
        'Rehabilitation services (physical therapy)'
      ]
    }
  }
};

interface EmployeeProfileProps {
  employeeId: string;
}

export default function EmployeeProfile({ employeeId }: EmployeeProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const employee = employeeData[employeeId as keyof typeof employeeData];
  const router = useRouter();
  const { createThread, setUserProfile } = useChatStore();

  const startChatAsEmployee = () => {
    // Set the user profile to the employee's information
    setUserProfile({
      name: employee.name,
      plan: employee.planType as "HMO" | "PPO" | "HDHP",
      location: employee.department,
      interests: []
    });
    
    // Create a new chat thread
    const threadId = createThread();
    
    // Navigate to the chat page
    router.push('/chat');
  };

  if (!employee) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Employee Not Found</h1>
          <p className="mt-2 text-gray-600">The employee you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/" className="mt-4 inline-block text-blue-600 hover:underline">
            Return to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 w-full">
      <div className="py-8 px-4 sm:px-6 lg:px-8 w-full max-w-[1600px] mx-auto">
        <div className="mb-6">
          <Link href="/" className="text-blue-600 hover:underline flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Employee Selection
          </Link>
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/4 bg-blue-900 text-white p-6">
              <div className="relative h-56 w-56 mx-auto rounded-full overflow-hidden border-4 border-white">
                <Image 
                  src={employee.imgSrc} 
                  alt={`${employee.name}'s profile`} 
                  fill
                  className="object-cover"
                  priority
                  unoptimized
                  sizes="(max-width: 768px) 100vw, 25vw"
                />
              </div>
              <div className="text-center mt-6">
                <h2 className="text-2xl font-bold">{employee.name}</h2>
                <p className="text-blue-200 mt-1">{employee.jobTitle}</p>
                <div className="mt-2 inline-block bg-blue-800 px-3 py-1 rounded-full">
                  {employee.planType} Plan
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-semibold border-b border-blue-800 pb-2">Contact Information</h3>
                <div className="mt-4 space-y-3">
                  <div>
                    <p className="text-blue-200">Email</p>
                    <p>{employee.email}</p>
                  </div>
                  <div>
                    <p className="text-blue-200">Phone</p>
                    <p>{employee.phone}</p>
                  </div>
                  <div>
                    <p className="text-blue-200">Department</p>
                    <p>{employee.department}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <button 
                  onClick={startChatAsEmployee}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                  </svg>
                  Chat as {employee.name}
                </button>
              </div>
            </div>

            <div className="md:w-3/4 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Health Plan Details</h2>
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  {isEditing ? 'Save Changes' : 'Edit Profile'}
                </button>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  {employee.description}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-gray-600">Plan&apos;s overall deductible</p>
                    <p className="font-semibold">{employee.planDetails.deductible}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Specialist copayment</p>
                    <p className="font-semibold">{employee.planDetails.specialist_copay}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Hospital (facility) coinsurance</p>
                    <p className="font-semibold">{employee.planDetails.hospital_coinsurance}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Other coinsurance</p>
                    <p className="font-semibold">{employee.planDetails.other_coinsurance}</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Covered Services</h3>
                <ul className="list-disc pl-5 space-y-2">
                  {employee.planDetails.services.map((service, index) => (
                    <li key={index} className="text-gray-700">{service}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Cost Breakdown</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between border-b pb-2 mb-2">
                    <span className="font-medium">Total Example Cost:</span>
                    <span className="font-bold">{employee.planDetails.totalCost}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2 mb-2 text-lg text-blue-900">
                    <span className="font-medium">Patient Pays:</span>
                    <span className="font-bold">{employee.planDetails.userPays}</span>
                  </div>
                  
                  <div className="space-y-2 mt-4">
                    <div className="flex justify-between">
                      <span>Deductibles</span>
                      <span>{employee.planDetails.breakdown.deductibles}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Copayments</span>
                      <span>{employee.planDetails.breakdown.copayments}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Coinsurance</span>
                      <span>{employee.planDetails.breakdown.coinsurance}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Limits or exclusions</span>
                      <span>{employee.planDetails.breakdown.notCovered}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 