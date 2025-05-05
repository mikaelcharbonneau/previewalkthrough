import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Save, AlertCircle, Plus, ChevronUp, ChevronDown, X, Server } from 'lucide-react';
import FormField from '../components/inspection/FormField';
import { formSections } from '../data/mockData';
import { racksByDatahall } from '../data/mockData';

const InspectionFlow = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const datahallId = location.state?.datahallId;
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [racks, setRacks] = useState([0]);
  const [foundIssues, setFoundIssues] = useState<boolean | null>(null);
  const [openRacks, setOpenRacks] = useState<number[]>([0]);
  const [selectedDevices, setSelectedDevices] = useState<Record<number, string[]>>({});

  // Redirect if no datahall is selected
  if (!datahallId) {
    navigate('/');
    return null;
  }

  const datahallName = datahallId.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');

  const availableRacks = racksByDatahall[datahallId] || [];

  const toggleRack = (rackIndex: number) => {
    setOpenRacks(prev => 
      prev.includes(rackIndex)
        ? prev.filter(i => i !== rackIndex)
        : [...prev, rackIndex]
    );
  };

  const handleFieldChange = (fieldId: string, value: any, rackIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      [`${fieldId}-${rackIndex}`]: value,
    }));
  };

  const saveProgress = () => {
    // In a real app, this would save to an API or localStorage
    console.log('Saving progress:', formData);
    setLastSaved(new Date());
  };

  const validateForm = () => {
    const newErrors: string[] = [];
    
    if (foundIssues === null) {
      newErrors.push('Please indicate whether you found issues');
      return false;
    }
    
    if (foundIssues) {
      // Validate each rack has at least one device selected
      racks.forEach(rackIndex => {
        if (!selectedDevices[rackIndex] || selectedDevices[rackIndex].length === 0) {
          newErrors.push(`Please select at least one device for Rack ${rackIndex + 1}`);
        } else {
          // Validate required fields for selected devices
          selectedDevices[rackIndex].forEach(deviceId => {
            formSections.find(section => section.id === deviceId)?.fields.forEach(field => {
              if (field.required && !formData[`${field.id}-${rackIndex}`]) {
                newErrors.push(`${field.label} for ${deviceId} in Rack ${rackIndex + 1} is required`);
              }
            });
          });
        }
      });
    }
    
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      saveProgress();
      navigate('/confirmation');
    }
  };

  const addRack = () => {
    const newRackIndex = racks.length;
    setRacks(prev => [...prev, newRackIndex]);
    setOpenRacks(prev => [...prev, newRackIndex]);
  };

  const removeRack = (rackIndex: number) => {
    setRacks(prev => prev.filter(rack => rack !== rackIndex));
    setOpenRacks(prev => prev.filter(rack => rack !== rackIndex));
    
    // Clean up selectedDevices and formData for this rack
    const newSelectedDevices = {...selectedDevices};
    delete newSelectedDevices[rackIndex];
    setSelectedDevices(newSelectedDevices);
    
    const newFormData = {...formData};
    Object.keys(newFormData).forEach(key => {
      if (key.endsWith(`-${rackIndex}`)) {
        delete newFormData[key];
      }
    });
    setFormData(newFormData);
  };

  const toggleDeviceSelection = (rackIndex: number, deviceId: string) => {
    setSelectedDevices(prev => {
      const current = prev[rackIndex] || [];
      const newSelection = current.includes(deviceId)
        ? current.filter(id => id !== deviceId)
        : [...current, deviceId];
      
      return {
        ...prev,
        [rackIndex]: newSelection
      };
    });
  };

  const renderSaveStatus = () => {
    if (!lastSaved) return null;
    
    return (
      <div className="flex items-center text-sm text-gray-500">
        <Save size={14} className="mr-1" />
        <span>
          Last saved: {lastSaved.toLocaleTimeString()}
        </span>
      </div>
    );
  };

  const renderInitialQuestion = () => {
    return (
      <div className="card p-6 mb-6">
        <h2 className="text-lg font-medium text-center text-hpe-blue-700 mb-6">
          Have you discovered any issues during the walkthrough?
        </h2>
        <div className="flex justify-center space-x-4">
          <button
            type="button"
            onClick={() => setFoundIssues(true)}
            className={`btn ${foundIssues === true ? 'btn-primary' : 'btn-secondary'} px-6`}
          >
            Yes, I found issues
          </button>
          <button
            type="button"
            onClick={() => setFoundIssues(false)}
            className={`btn ${foundIssues === false ? 'btn-primary' : 'btn-secondary'} px-6`}
          >
            No issues found
          </button>
        </div>
      </div>
    );
  };

  const renderRackForm = (rackIndex: number) => {
    const isOpen = openRacks.includes(rackIndex);
    const rackDevices = selectedDevices[rackIndex] || [];
    const hasSelectedDevices = rackDevices.length > 0;
    const selectedRack = formData[`rack-location-${rackIndex}`];

    return (
      <div key={rackIndex} className="card mb-6 overflow-hidden">
        <div 
          className="flex items-center justify-between p-4 cursor-pointer bg-white hover:bg-gray-50"
          onClick={() => toggleRack(rackIndex)}
        >
          <div className="flex items-center text-hpe-blue-700">
            <Server size={18} className="text-hpe-green mr-2" />
            <span className="font-medium">
              Rack{selectedRack ? `: ${selectedRack}` : ''}
            </span>
          </div>
          <div className="flex items-center">
            {rackIndex > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeRack(rackIndex);
                }}
                className="mr-2 text-gray-400 hover:text-hpe-error-500"
              >
                <X size={18} />
              </button>
            )}
            {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </div>
        
        {isOpen && (
          <div className="p-6 border-t border-gray-100">
            <div className="mb-4">
              <label className="form-label">
                Rack Location <span className="text-hpe-error-500">*</span>
              </label>
              <select
                value={formData[`rack-location-${rackIndex}`] || ''}
                onChange={(e) => handleFieldChange('rack-location', e.target.value, rackIndex)}
                className="form-input"
              >
                <option value="">Select a rack</option>
                {availableRacks.map((rack) => (
                  <option key={rack} value={rack}>{rack}</option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="form-label">
                Select Impacted Device(s) <span className="text-hpe-error-500">*</span>
              </label>
              <div className="space-y-2">
                {formSections.map((section) => (
                  <div key={section.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`device-${section.id}-${rackIndex}`}
                      checked={rackDevices.includes(section.id)}
                      onChange={() => toggleDeviceSelection(rackIndex, section.id)}
                      className="h-4 w-4 text-hpe-green-500 rounded border-gray-300 focus:ring-hpe-green-500"
                    />
                    <label
                      htmlFor={`device-${section.id}-${rackIndex}`}
                      className="ml-2 text-sm text-hpe-blue-600"
                    >
                      {section.title}
                    </label>
                  </div>
                ))}
              </div>
              
              {!hasSelectedDevices && (
                <p className="text-sm text-hpe-error-500 mt-2">
                  Please select at least one device to report an issue
                </p>
              )}
            </div>
            
            {/* Device details sections */}
            {hasSelectedDevices && rackDevices.map(deviceId => {
              const section = formSections.find(s => s.id === deviceId);
              if (!section) return null;
              
              return (
                <div key={`${deviceId}-${rackIndex}`} className="border rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-medium mb-4 text-hpe-blue-600">
                    {section.title}
                  </h3>
                  
                  <div className="space-y-4">
                    {section.fields.map((field) => (
                      <FormField
                        key={`${field.id}-${rackIndex}`}
                        field={field}
                        value={formData[`${field.id}-${rackIndex}`] || ''}
                        onChange={(id, value) => handleFieldChange(id, value, rackIndex)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-hpe-blue-700">Inspection Walkthrough</h1>
          <p className="text-hpe-blue-500 mt-1">Location: {datahallName}</p>
        </div>
        {renderSaveStatus()}
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="mb-4 p-3 bg-hpe-error-50 border border-hpe-error-200 rounded-md">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-hpe-error mr-2 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-hpe-error-700">
                Please fix the following errors:
              </p>
              <ul className="mt-1 text-sm text-hpe-error-600 list-disc list-inside">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Initial question */}
      {renderInitialQuestion()}

      {/* Rack forms - only show if found issues */}
      {foundIssues && (
        <>
          {racks.map(rackIndex => renderRackForm(rackIndex))}
          
          {/* Add Rack Button */}
          <div className="text-center mb-6">
            <button
              type="button"
              onClick={addRack}
              className="btn-secondary px-6 inline-flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Rack
            </button>
          </div>
        </>
      )}

      {/* Navigation buttons */}
      <div className="flex justify-between items-center sticky bottom-4 p-4 bg-white rounded-lg shadow-lg">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="btn-secondary"
        >
          Cancel
        </button>
        
        <button
          type="button"
          onClick={handleSubmit}
          className="btn-primary"
        >
          Complete Walkthrough
        </button>
      </div>
    </div>
  );
};

export default InspectionFlow;