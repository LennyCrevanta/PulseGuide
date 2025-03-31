import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { BenefitsPage } from '@/components/benefits/BenefitsPage';

interface BenefitsPageProps {
  params: {
    id: string;
  };
}

export default function EmployeeBenefitsPage({ params }: BenefitsPageProps) {
  // This would normally be fetched from an API or database
  const employees = {
    peg: {
      id: 'peg',
      name: 'Peg',
      planType: 'HMO',
      imgSrc: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80',
      department: 'Marketing',
    },
    joe: {
      id: 'joe',
      name: 'Joe',
      planType: 'PPO',
      imgSrc: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80',
      department: 'Finance',
    },
    mia: {
      id: 'mia',
      name: 'Mia',
      planType: 'HDHP',
      imgSrc: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80',
      department: 'Engineering',
    }
  };

  const employee = employees[params.id as keyof typeof employees];

  if (!employee) {
    return notFound();
  }

  return <BenefitsPage employee={employee} />;
} 