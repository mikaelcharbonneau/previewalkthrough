import { format } from 'date-fns';
import { Download, Share2, Eye } from 'lucide-react';
import { Report } from '../../types';

interface ReportCardProps {
  report: Report;
}

const ReportCard = ({ report }: ReportCardProps) => {
  const formattedDate = format(new Date(report.date), 'MMM d, yyyy');

  return (
    <div className="card group relative overflow-hidden">
      <div 
        className="h-32 bg-gray-200 bg-cover bg-center"
        style={{ 
          backgroundImage: report.thumbnail ? `url(${report.thumbnail})` : undefined 
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent group-hover:from-black/70 transition-all"></div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
        <h3 className="font-medium text-white">{report.title}</h3>
        <div className="flex items-center text-xs text-white/80 mt-1">
          <span>{report.location}</span>
          <span className="mx-2">•</span>
          <span>{formattedDate}</span>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="p-1.5 bg-white/90 rounded-full hover:bg-white text-hpe-blue-700 transition-colors">
          <Eye size={16} />
        </button>
        <button className="p-1.5 bg-white/90 rounded-full hover:bg-white text-hpe-blue-700 transition-colors">
          <Download size={16} />
        </button>
        <button className="p-1.5 bg-white/90 rounded-full hover:bg-white text-hpe-blue-700 transition-colors">
          <Share2 size={16} />
        </button>
      </div>
    </div>
  );
};

export default ReportCard;