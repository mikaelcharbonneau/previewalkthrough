import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, ArrowRight } from 'lucide-react';
import HPELogo from '../components/ui/HPELogo';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      const success = await login(email, password);
      if (success) {
        navigate('/');
      } else {
        setError('Invalid credentials. Try user@hpe.com / password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-hpe-blue-950 px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex mb-6">
            <HPELogo className="h-12 w-auto" />
          </div>
          <h2 className="text-2xl font-bold text-hpe-blue-700 dark:text-white">
            HPE Walkthrough App
          </h2>
          <p className="mt-2 text-sm text-hpe-blue-500 dark:text-hpe-blue-200">
            Sign in to access your dashboard
          </p>
        </div>
        
        {/* Login Card */}
        <div className="bg-white dark:bg-hpe-blue-900 shadow-md rounded-lg">
          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-hpe-error-50 dark:bg-hpe-error-900/30 border border-hpe-error-200 dark:border-hpe-error-800 rounded-md text-sm text-hpe-error-600 dark:text-hpe-error-300">
                {error}
              </div>
            )}
            
            <div className="mb-4">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={18} className="text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input pl-10"
                />
              </div>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <a href="#" className="text-sm text-hpe-green hover:text-hpe-green-600 dark:text-hpe-green-400">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input pl-10"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-hpe-green-500 rounded border-gray-300 focus:ring-hpe-green-500"
                />
                <label htmlFor="remember-me" className="ml-2 text-sm text-hpe-blue-600 dark:text-hpe-blue-100">
                  Remember me
                </label>
              </div>
            </div>
            
            <button 
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-2.5 flex items-center justify-center relative"
            >
              {loading ? (
                <span className="inline-flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                <span className="inline-flex items-center">
                  Sign in
                  <ArrowRight className="ml-2 h-4 w-4" />
                </span>
              )}
            </button>
          </form>
          
          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-hpe-blue-800 text-center rounded-b-lg">
            <p className="text-sm text-hpe-blue-500 dark:text-hpe-blue-200">
              Don't have an account? <a href="#" className="text-hpe-green hover:text-hpe-green-600 dark:text-hpe-green-400 font-medium">Contact your administrator</a>
            </p>
          </div>
        </div>
        
        {/* Footer Links */}
        <div className="mt-6 text-center">
          <div className="flex justify-center space-x-4 text-xs text-hpe-blue-500 dark:text-hpe-blue-300">
            <a href="#" className="hover:text-hpe-blue-700 dark:hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-hpe-blue-700 dark:hover:text-white">Terms of Service</a>
            <a href="#" className="hover:text-hpe-blue-700 dark:hover:text-white">Contact Support</a>
          </div>
          <p className="mt-3 text-xs text-hpe-blue-400 dark:text-hpe-blue-400">
            &copy; {new Date().getFullYear()} Hewlett Packard Enterprise Development LP
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;