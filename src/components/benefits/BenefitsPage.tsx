"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChatWidget } from '@/components/chat/ChatWidget';

// Define interfaces
interface Employee {
  id: string;
  name: string;
  planType: string;
  imgSrc: string;
  department: string;
}

interface BenefitsPageProps {
  employee: Employee;
}

export function BenefitsPage({ employee }: BenefitsPageProps) {
  const router = useRouter();

  // Benefits data based on plan type
  const benefitsData = {
    HMO: {
      title: 'Health Maintenance Organization (HMO)',
      features: [
        'Lower out-of-pocket costs',
        'Lower monthly premiums',
        'Primary care physician required',
        'Referrals needed for specialists',
        'In-network care only (except emergencies)',
        'Predictable copays'
      ],
      coverage: [
        'Prenatal and maternity care',
        'Preventive care coverage',
        'Emergency services',
        'Hospital stays',
        'Prescription drugs'
      ]
    },
    PPO: {
      title: 'Preferred Provider Organization (PPO)',
      features: [
        'More flexibility in choosing doctors',
        'No referrals needed for specialists',
        'Coverage for out-of-network care (at higher cost)',
        'Higher monthly premiums',
        'Higher out-of-pocket costs',
        'Larger provider network'
      ],
      coverage: [
        'Chronic condition management',
        'Specialist visits',
        'Hospitalization',
        'Preventive care',
        'Prescription coverage with tiered pricing'
      ]
    },
    HDHP: {
      title: 'High Deductible Health Plan (HDHP)',
      features: [
        'Lower monthly premiums',
        'Higher deductibles',
        'HSA-eligible for tax advantages',
        'Preventive care covered before deductible',
        'More financial responsibility',
        'Good for generally healthy individuals'
      ],
      coverage: [
        'Emergency services (after deductible)',
        'Hospitalization (after deductible)',
        'Rehabilitation services',
        'Lab work and diagnostics',
        'HSA contribution options'
      ]
    }
  };

  const planData = benefitsData[employee.planType as keyof typeof benefitsData];
  const unsplashQuery = employee.planType === 'HMO' ? 'family health' : 
                        employee.planType === 'PPO' ? 'doctor office' : 'healthcare savings';

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="text-2xl font-bold text-blue-800">PulseGuide Benefits</div>
          </div>
          <nav className="flex space-x-8">
            <Link href="/" className="text-gray-700 hover:text-blue-800">Home</Link>
            <Link href="#benefits" className="text-gray-700 hover:text-blue-800">Benefits</Link>
            <Link href="#resources" className="text-gray-700 hover:text-blue-800">Resources</Link>
            <Link href="#contact" className="text-gray-700 hover:text-blue-800">Contact</Link>
          </nav>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-8">
          <div className="md:flex">
            <div className="md:w-1/3 bg-blue-800 text-white p-8">
              <div className="relative h-48 w-48 mx-auto rounded-full overflow-hidden border-4 border-white">
                <Image 
                  src={employee.planType === 'HMO' ? 
                    "https://images.unsplash.com/photo-1592598015799-35c84b09394c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80" : 
                    employee.planType === 'PPO' ?
                    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80" :
                    "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80"
                  } 
                  alt={`${employee.name}'s profile`} 
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 192px"
                />
              </div>
              <div className="text-center mt-6">
                <h1 className="text-3xl font-bold">{employee.name}</h1>
                <p className="text-blue-200 mt-1">{employee.department}</p>
                <div className="mt-2 inline-block bg-blue-700 px-3 py-1 rounded-full">
                  {employee.planType} Plan
                </div>
              </div>
            </div>
            
            <div className="md:w-2/3 p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Your {planData.title} Benefits</h2>
              
              <div className="relative h-64 w-full mb-6 rounded-lg overflow-hidden">
                <Image 
                  src={employee.planType === 'HMO' ? 
                    "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" : 
                    employee.planType === 'PPO' ?
                    "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" :
                    "https://images.unsplash.com/photo-1579621970588-a35d0e7ab9b6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                  } 
                  alt="Benefits illustration" 
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 800px"
                />
              </div>
              
              <p className="text-gray-600 mb-6">
                Welcome to your personalized benefits portal. Here you can explore your health plan details, 
                manage your benefits, and access resources to help you maximize your coverage.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-xl font-semibold text-blue-800 mb-3">Plan Features</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {planData.features.map((feature, index) => (
                      <li key={index} className="text-gray-700">{feature}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-xl font-semibold text-blue-800 mb-3">Coverage Highlights</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {planData.coverage.map((item, index) => (
                      <li key={index} className="text-gray-700">{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div id="benefits" className="mt-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Additional Benefits</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="relative h-40 w-full mb-4 rounded overflow-hidden">
                <Image 
                  src="https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80" 
                  alt="Dental coverage" 
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 400px"
                />
              </div>
              <h3 className="text-xl font-semibold text-blue-800 mb-2">Dental Coverage</h3>
              <p className="text-gray-600">Comprehensive dental care including preventive, basic, and major services.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="relative h-40 w-full mb-4 rounded overflow-hidden">
                <Image 
                  src="https://images.unsplash.com/photo-1574258495973-f010dfbb5371?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80" 
                  alt="Vision coverage" 
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 400px"
                />
              </div>
              <h3 className="text-xl font-semibold text-blue-800 mb-2">Vision Benefits</h3>
              <p className="text-gray-600">Eye exams, glasses, and contact lenses with network discounts.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="relative h-40 w-full mb-4 rounded overflow-hidden">
                <Image 
                  src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80" 
                  alt="Wellness program" 
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 400px"
                />
              </div>
              <h3 className="text-xl font-semibold text-blue-800 mb-2">Wellness Program</h3>
              <p className="text-gray-600">Fitness reimbursements, health coaching, and preventive care incentives.</p>
            </div>
          </div>
        </div>
        
        <div id="resources" className="mt-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Resources & Tools</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md flex">
              <div className="mr-4 text-blue-800">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-blue-800 mb-2">Plan Documents</h3>
                <p className="text-gray-600 mb-3">Access your plan documents, coverage details, and benefit summaries.</p>
                <a href="#" className="text-blue-600 hover:underline">View Documents →</a>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md flex">
              <div className="mr-4 text-blue-800">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-blue-800 mb-2">Claims Center</h3>
                <p className="text-gray-600 mb-3">Submit and track claims, view explanations of benefits, and manage payments.</p>
                <a href="#" className="text-blue-600 hover:underline">Go to Claims Center →</a>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md flex">
              <div className="mr-4 text-blue-800">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-blue-800 mb-2">PulseGuide Chat Assistant</h3>
                <p className="text-gray-600 mb-3">Have questions about your benefits? Chat with our AI assistant for instant help.</p>
                <Link 
                  href={`/chat?persona=${employee.id}`}
                  className="text-blue-600 hover:underline"
                >
                  Start Chatting →
                </Link>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md flex">
              <div className="mr-4 text-blue-800">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-blue-800 mb-2">Find Care</h3>
                <p className="text-gray-600 mb-3">Search for in-network providers, facilities, and specialists near you.</p>
                <a href="#" className="text-blue-600 hover:underline">Find a Provider →</a>
              </div>
            </div>
          </div>
        </div>
        
        <div id="contact" className="mt-12 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Need Help?</h2>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-semibold text-blue-800 mb-3">Customer Support</h3>
                <p className="text-gray-600 mb-2">
                  <span className="font-medium">Phone:</span> 1-800-555-HELP
                </p>
                <p className="text-gray-600 mb-2">
                  <span className="font-medium">Email:</span> support@pulseguide.example.com
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Hours:</span> Monday-Friday, 8am-8pm EST
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-blue-800 mb-3">Benefits Department</h3>
                <p className="text-gray-600 mb-2">
                  <span className="font-medium">Contact:</span> HR Benefits Team
                </p>
                <p className="text-gray-600 mb-2">
                  <span className="font-medium">Email:</span> benefits@company.example.com
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Office:</span> Building A, 3rd Floor
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add ChatWidget with personaId */}
      <ChatWidget 
        personaId={employee.id}
        title="PulseGuide Benefits Assistant"
        iconText="PG"
        position="bottom-right"
        themeColor="#1e40af" // blue-800
      />
    </div>
  );
} 