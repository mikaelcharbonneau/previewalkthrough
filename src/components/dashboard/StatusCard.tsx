import { ArrowUpRight } from 'lucide-react';

interface StatusCardProps {
  title: string;
  count: number;
  icon: React.ReactNode;
  color: string;
  onClick?: () => void;
}

const StatusCard = ({ title, count, icon, color, onClick }: StatusCardProps) => {
  return (
    <div 
      className="card p-6 flex flex-col cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-4">
        <div
          className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}
        >
          {icon}
        </div>
        <ArrowUpRight 
          size={20} 
          className="text-gray-400 group-hover:text-hpe-green-500 transition-colors" 
        />
      </div>
      <div className="mt-2">
        <h3 className="text-lg font-medium text-hpe-blue-700">{title}</h3>
        <p className="text-3xl font-semibold mt-1">{count}</p>
      </div>
    </div>
  );
};

export default StatusCard;