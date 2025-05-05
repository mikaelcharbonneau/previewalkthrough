import { format } from 'date-fns';
import { MapPin, AlertCircle } from 'lucide-react';
import { Inspection } from '../../types';
import StatusChip from '../ui/StatusChip';

interface InspectionCardProps {
  inspection: Inspection;
}

const InspectionCard = ({ inspection }: InspectionCardProps) => {
  const formattedDate = format(new Date(inspection.date), 'MMM d, yyyy');

  return (
    <div className="card p-4 hover:bg-gray-50 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <StatusChip status={inspection.status} />
        <span className="text-sm text-gray-500">{formattedDate}</span>
      </div>
      <div className="mb-2">
        <div className="flex items-start mt-1">
          <MapPin size={16} className="text-hpe-blue-400 mt-0.5 mr-1.5 flex-shrink-0" />
          <p className="text-sm text-hpe-blue-700 font-medium">{inspection.location}</p>
        </div>
      </div>
      <div className="flex items-center mt-3 text-sm">
        <AlertCircle size={16} className="text-hpe-blue-400 mr-1.5" />
        <span className="font-medium">{inspection.issueCount}</span>
        <span className="ml-1 text-gray-600">
          {inspection.issueCount === 1 ? 'issue' : 'issues'} reported
        </span>
      </div>
    </div>
  );
};

export default InspectionCard;