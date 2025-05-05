import { useNavigate } from 'react-router-dom';
import { ClipboardCheck, AlertCircle, CheckCircle, ArrowRight, ChevronDown } from 'lucide-react';
import StatusCard from '../components/dashboard/StatusCard';
import InspectionCard from '../components/dashboard/InspectionCard';
import ReportCard from '../components/dashboard/ReportCard';
import { recentInspections, reports, issues, datacenters } from '../data/mockData';
import { useState } from 'react';
import { useUser } from '../context/UserContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user } = useUser();
  
  const completedInspections = recentInspections.filter(i => i.status === 'completed').length;
  const activeIssues = issues.filter(i => i.status === 'open' || i.status === 'in-progress').length;
  const resolvedIssues = issues.filter(i => i.status === 'resolved').length;

  const startWalkthrough = (datahallId: string) => {
    navigate('/inspection', { state: { datahallId } });
    setIsDropdownOpen(false);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-hpe-blue-700">Dashboard</h1>
          <p className="text-hpe-blue-500 mt-1">
            Welcome back, {user.name}
          </p>
        </div>
        <div className="relative mt-4 sm:mt-0">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="btn-primary flex items-center"
          >
            <ClipboardCheck className="mr-2 h-5 w-5" />
            Start Walkthrough
            <ChevronDown className="ml-2 h-4 w-4" />
          </button>
          
          {isDropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-10"
                onClick={() => setIsDropdownOpen(false)}
              ></div>
              <div className="absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
                <div className="py-1">
                  {datacenters.map((datacenter) => (
                    <button
                      key={datacenter.id}
                      className="w-full text-left px-4 py-2 text-sm text-hpe-blue-600 hover:bg-hpe-green-50 hover:text-hpe-green-600"
                      onClick={() => startWalkthrough(datacenter.id)}
                    >
                      <div className="font-medium">{datacenter.name}</div>
                      <div className="text-xs text-gray-500">{datacenter.location}</div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatusCard
          title="Completed Walkthroughs"
          count={completedInspections}
          icon={<ClipboardCheck className="h-6 w-6 text-white" />}
          color="bg-hpe-green"
          onClick={() => navigate('/inspection')}
        />
        <StatusCard
          title="Active Issues"
          count={activeIssues}
          icon={<AlertCircle className="h-6 w-6 text-white" />}
          color="bg-hpe-warning"
          onClick={() => navigate('/reports')}
        />
        <StatusCard
          title="Resolved Issues"
          count={resolvedIssues}
          icon={<CheckCircle className="h-6 w-6 text-white" />}
          color="bg-hpe-blue-500"
          onClick={() => navigate('/reports')}
        />
      </div>

      {/* Recent Inspections */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">Recent Inspections</h2>
          <button
            onClick={() => navigate('/inspection')}
            className="text-sm text-hpe-green hover:text-hpe-green-600 font-medium flex items-center"
          >
            View All
            <ArrowRight className="ml-1 h-4 w-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recentInspections.map((inspection) => (
            <InspectionCard key={inspection.id} inspection={inspection} />
          ))}
        </div>
      </div>

      {/* Reports */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">Reports</h2>
          <button
            onClick={() => navigate('/reports')}
            className="text-sm text-hpe-green hover:text-hpe-green-600 font-medium flex items-center"
          >
            View All
            <ArrowRight className="ml-1 h-4 w-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;