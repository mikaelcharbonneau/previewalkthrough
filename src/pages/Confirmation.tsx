import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

const Confirmation = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="max-w-md mx-auto py-8 flex flex-col items-center text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-6"
      >
        <div className="rounded-full bg-hpe-green-50 p-4 mb-4 inline-flex">
          <CheckCircle size={48} className="text-hpe-green" />
        </div>
        <h1 className="text-2xl font-bold text-hpe-blue-700 mb-2">
          Walkthrough Complete!
        </h1>
        <p className="text-hpe-blue-500">
          Your inspection has been submitted successfully.
        </p>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="card p-6 w-full mb-8"
      >
        <h2 className="text-lg font-medium text-hpe-blue-700 mb-3">
          Inspection Summary
        </h2>
        
        <div className="space-y-4">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-500">Location</span>
            <span className="text-sm font-medium">Data Center A, Row 3</span>
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-500">Date</span>
            <span className="text-sm font-medium">{new Date().toLocaleDateString()}</span>
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-500">Issues identified</span>
            <span className="text-sm font-medium">3</span>
          </div>
          
          <div className="flex justify-between py-2">
            <span className="text-sm text-gray-500">Inspector</span>
            <span className="text-sm font-medium">John Doe</span>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.6 }}
        className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3"
      >
        <button
          onClick={() => navigate('/reports')}
          className="btn-primary"
        >
          <FileText className="mr-2 h-5 w-5" />
          View Report
        </button>
        
        <button
          onClick={() => navigate('/')}
          className="btn-secondary"
        >
          <ArrowRight className="mr-2 h-5 w-5" />
          Back to Dashboard
        </button>
      </motion.div>
    </div>
  );
};

export default Confirmation;