import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardCheck, ChevronDown, Filter, Search } from 'lucide-react';
import { recentInspections, datacenters } from '../data/mockData';
import InspectionCard from '../components/dashboard/InspectionCard';

const Inspections = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const startWalkthrough = (datahallId: string) => {
    navigate('/inspection', { state: { datahallId } });
    setIsDropdownOpen(false);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-hpe-blue-700">Inspections</h1>
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

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search inspections"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-hpe-green-300 focus:border-hpe-green-300"
            />
          </div>
          <div className="w-full md:w-48">
            <select className="block w-full border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-hpe-green-300 focus:border-hpe-green-300">
              <option value="">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="in-progress">In Progress</option>
            </select>
          </div>
          <button className="btn-secondary">
            <Filter size={18} className="mr-2" />
            More Filters
          </button>
        </div>
      </div>

      {/* Inspections Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {recentInspections.map((inspection) => (
          <InspectionCard key={inspection.id} inspection={inspection} />
        ))}
      </div>
    </div>
  );
};

export default Inspections;