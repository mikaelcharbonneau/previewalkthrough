import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import InspectionFlow from './pages/InspectionFlow';
import Inspections from './pages/Inspections';
import Confirmation from './pages/Confirmation';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { UserProvider } from './context/UserContext';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <ThemeProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="inspections" element={<Inspections />} />
                <Route path="inspection" element={<InspectionFlow />} />
                <Route path="confirmation" element={<Confirmation />} />
                <Route path="reports" element={<Reports />} />
                <Route path="profile" element={<Profile />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Route>
          </Routes>
        </ThemeProvider>
      </UserProvider>
    </AuthProvider>
  );
}

export default App