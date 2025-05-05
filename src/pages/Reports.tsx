import { useState } from 'react';
import { Download, Filter, Printer, Share2, Eye, AlertCircle } from 'lucide-react';
import ReportFilters from '../components/reports/ReportFilters';
import { reports } from '../data/mockData';
import StatusChip from '../components/ui/StatusChip';
import { format } from 'date-fns';

const Reports = () => {
  const [filters, setFilters] = useState({});
  const [filteredReports, setFilteredReports] = useState(reports);
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    // In a real app, we would apply actual filtering logic here
    setFilteredReports(reports);
  };

  const toggleReportSelection = (reportId: string) => {
    setSelectedReport(selectedReport === reportId ? null : reportId);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-hpe-blue-700">Reports</h1>
        <div className="flex space-x-2">
          <button className="btn-secondary">
            <Download className="h-4 w-4 mr-1" />
            Export
          </button>
          <button className="btn-secondary">
            <Printer className="h-4 w-4 mr-1" />
            Print
          </button>
          <button className="btn-secondary">
            <Share2 className="h-4 w-4 mr-1" />
            Share
          </button>
        </div>
      </div>

      {/* Filters */}
      <ReportFilters onFilterChange={handleFilterChange} />

      {/* Reports Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.map((report) => (
          <div key={report.id} className="card overflow-hidden">
            {/* Report Preview (PDF-like appearance) */}
            <div 
              className="aspect-[3/4] bg-gray-100 p-4 border-b relative cursor-pointer"
              onClick={() => toggleReportSelection(report.id)}
            >
              <div className="bg-white h-full rounded shadow-sm p-3 flex flex-col">
                <div className="h-6 bg-hpe-green mb-3"></div>
                <div className="h-3 bg-gray-200 w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 w-1/2 mb-4"></div>
                
                {/* Report content preview */}
                <div className="flex-1 flex flex-col space-y-2">
                  <div className="text-xs font-medium text-hpe-blue-700">Issues:</div>
                  {report.issues.length > 0 ? (
                    <div className="space-y-2 overflow-hidden">
                      {report.issues.slice(0, 3).map((issue) => (
                        <div key={issue.id} className="flex items-start">
                          <div className="w-2 h-2 rounded-full mt-1 mr-1.5 flex-shrink-0" 
                               style={{
                                 backgroundColor: 
                                   issue.severity === 'critical' ? '#FF0000' : 
                                   issue.severity === 'high' ? '#FFA500' : 
                                   issue.severity === 'medium' ? '#FFCC00' : '#00CC00'
                               }}>
                          </div>
                          <p className="text-[10px] leading-tight line-clamp-2 text-gray-700">{issue.description}</p>
                        </div>
                      ))}
                      {report.issues.length > 3 && (
                        <div className="text-[10px] text-hpe-green-500">+{report.issues.length - 3} more issues</div>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500 italic">No issues found</div>
                  )}
                  
                  {/* Report recommendations */}
                  {report.recommendations && (
                    <>
                      <div className="text-xs font-medium text-hpe-blue-700 mt-2">Recommendations:</div>
                      <p className="text-[10px] leading-tight line-clamp-3 text-gray-700">{report.recommendations}</p>
                    </>
                  )}
                </div>
              </div>

              {/* Critical Issue Badge */}
              {report.issues.some(issue => issue.severity === 'critical') && (
                <div className="absolute top-2 right-2 bg-hpe-error text-white text-xs px-2 py-0.5 rounded-full">
                  Critical
                </div>
              )}
            </div>

            {/* Report Info */}
            <div className="p-4">
              <h3 className="font-medium text-hpe-blue-700 mb-1">{report.title}</h3>
              <p className="text-sm text-hpe-blue-500 mb-3">{report.location} • {new Date(report.date).toLocaleDateString()}</p>
              
              <div className="flex space-x-2">
                <button 
                  className="btn-secondary py-1.5 px-2.5 text-xs flex-1"
                  onClick={() => toggleReportSelection(report.id)}
                >
                  <Eye className="h-3.5 w-3.5 mr-1" />
                  View
                </button>
                <button className="btn-secondary py-1.5 px-2.5 text-xs flex-1">
                  <Download className="h-3.5 w-3.5 mr-1" />
                  Download
                </button>
                <button className="btn-secondary py-1.5 px-2.5 text-xs flex-1">
                  <Share2 className="h-3.5 w-3.5 mr-1" />
                  Share
                </button>
              </div>
            </div>
            
            {/* Expanded Report View */}
            {selectedReport === report.id && (
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <h4 className="font-medium text-hpe-blue-700 mb-2">Summary</h4>
                <p className="text-sm text-gray-600 mb-4">{report.summary}</p>
                
                <h4 className="font-medium text-hpe-blue-700 mb-2">Issues</h4>
                <div className="space-y-2 mb-4">
                  {report.issues.map((issue) => (
                    <div key={issue.id} className="bg-white p-3 rounded border border-gray-200">
                      <div className="flex justify-between items-start mb-1">
                        <StatusChip status={issue.status} />
                        <div className={`px-2 py-0.5 rounded-full text-xs font-medium 
                          ${issue.severity === 'critical' ? 'bg-hpe-error-100 text-hpe-error-800' : 
                            issue.severity === 'high' ? 'bg-hpe-warning-100 text-hpe-warning-800' : 
                            issue.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-green-100 text-green-800'}`}>
                          {issue.severity.charAt(0).toUpperCase() + issue.severity.slice(1)}
                        </div>
                      </div>
                      <p className="text-sm font-medium text-hpe-blue-700 mb-1">{issue.description}</p>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{issue.location}</span>
                        <span>Updated: {format(new Date(issue.updatedAt), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                {report.recommendations && (
                  <>
                    <h4 className="font-medium text-hpe-blue-700 mb-2">Recommendations</h4>
                    <div className="bg-white p-3 rounded border border-gray-200 text-sm mb-3">
                      {report.recommendations}
                    </div>
                  </>
                )}
                
                <button 
                  className="w-full btn-secondary text-xs"
                  onClick={() => setSelectedReport(null)}
                >
                  Close Details
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reports;