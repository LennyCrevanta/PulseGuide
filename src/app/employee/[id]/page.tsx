import EmployeeProfile from '../../../components/EmployeeProfile';

interface EmployeePageProps {
  params: {
    id: string;
  };
}

export default function EmployeePage({ params }: EmployeePageProps) {
  return <EmployeeProfile employeeId={params.id} />;
} 