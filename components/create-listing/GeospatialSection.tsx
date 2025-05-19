import React, { useState, useEffect } from 'react';
import FileInputField from '@/components/common/FileInputField';
import { motion } from 'framer-motion';
import { getAfricanCountries, getStatesForCountry, getLocalGovernmentAreas } from '@/lib/utils/locationData';
// import { FaMapMarkerAlt } from 'react-icons/fa'; // Icon for map picker button later

// Define the specific file field name(s) used in this component
export type GeospatialFileFieldNames = 'gisFile';

export interface GeospatialFormData {
  country: string;
  state: string;
  localGovernmentArea: string;
  propertyAreaSqm: string;
  latitude: string;
  longitude: string;
  gisFile: File | null;
}

interface GeospatialProps {
  formData: GeospatialFormData;
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleDrop: (event: React.DragEvent<HTMLDivElement>, fieldName: GeospatialFileFieldNames) => void;
  filePreviews: Record<string, string | string[]>;
  inputFieldStyles: string;
  inputFieldDisabledStyles: string;
  isSubmitting: boolean;
  // onOpenMapPicker: () => void; // Prop for map picker functionality later
}

const GeospatialSection: React.FC<GeospatialProps> = ({ 
  formData, 
  handleInputChange, 
  handleFileChange, 
  handleDrop,
  filePreviews,
  inputFieldStyles,
  inputFieldDisabledStyles,
  isSubmitting
  // onOpenMapPicker 
}) => {
  // Get list of African countries
  const countries = getAfricanCountries();
  
  // Get states for selected country
  const [availableStates, setAvailableStates] = useState<string[]>([]);
  
  // Get local government areas for selected state
  const [availableLGAs, setAvailableLGAs] = useState<string[]>([]);
  
  // Update states when country changes
  useEffect(() => {
    if (formData.country) {
      setAvailableStates(getStatesForCountry(formData.country));
    } else {
      setAvailableStates([]);
    }
  }, [formData.country]);
  
  // Update local government areas when state changes
  useEffect(() => {
    if (formData.country && formData.state) {
      setAvailableLGAs(getLocalGovernmentAreas(formData.country, formData.state));
    } else {
      setAvailableLGAs([]);
    }
  }, [formData.country, formData.state]);
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }} // Adjust delay
      className="pt-8 px-8 pb-6 border-t border-gray-200 dark:border-zinc-800"
    >
      <h2 className="text-xl font-semibold text-text-light dark:text-text-dark mb-6 flex items-center">
        <span className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full mr-3 flex items-center justify-center text-sm font-bold">3</span>
        Geospatial & Boundary Data
      </h2>
      
      <div className="mb-8">
        <h3 className="text-base font-medium text-gray-700 dark:text-gray-300 mb-4 pb-2 border-b border-gray-100 dark:border-zinc-800/80">Location Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-4">
          {/* Country Dropdown */}
          <div>
            <label htmlFor="country" className="block text-text-light dark:text-text-dark opacity-80 mb-1 text-sm font-medium">Country</label>
            <select
              id="country"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              className={isSubmitting ? inputFieldDisabledStyles : inputFieldStyles}
              disabled={isSubmitting}
            >
              <option value="">Select a country</option>
              {countries.map((country) => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>
          
          {/* State/Province Dropdown */}
          <div>
            <label htmlFor="state" className="block text-text-light dark:text-text-dark opacity-80 mb-1 text-sm font-medium">State/Province</label>
            <select
              id="state"
              name="state"
              value={formData.state}
              onChange={handleInputChange}
              className={isSubmitting ? inputFieldDisabledStyles : inputFieldStyles}
              disabled={isSubmitting || !formData.country}
            >
              <option value="">Select a state</option>
              {availableStates.map((state) => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
          
          {/* Local Government Area Dropdown */}
          <div>
            <label htmlFor="localGovernmentArea" className="block text-text-light dark:text-text-dark opacity-80 mb-1 text-sm font-medium">Local Government Area</label>
            <select
              id="localGovernmentArea"
              name="localGovernmentArea"
              value={formData.localGovernmentArea}
              onChange={handleInputChange}
              className={isSubmitting ? inputFieldDisabledStyles : inputFieldStyles}
              disabled={isSubmitting || !formData.state}
            >
              <option value="">Select a local government area</option>
              {availableLGAs.map((lga) => (
                <option key={lga} value={lga}>{lga}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      <div className="mb-8">
        <h3 className="text-base font-medium text-gray-700 dark:text-gray-300 mb-4 pb-2 border-b border-gray-100 dark:border-zinc-800/80">Property Dimensions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-4">
          {/* Property Area in Square Meters */}
          <div>
            <label htmlFor="propertyAreaSqm" className="block text-gray-600 dark:text-gray-400 mb-1.5 text-sm font-medium">Property Area (sq. meters)</label>
            <div className="relative">
              <input
                type="number"
                id="propertyAreaSqm"
                name="propertyAreaSqm"
                value={formData.propertyAreaSqm}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                placeholder="e.g., 1000"
                className={`${isSubmitting ? inputFieldDisabledStyles : inputFieldStyles} focus:ring-blue-500 focus:border-blue-500`}
                disabled={isSubmitting}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400 dark:text-gray-500 text-sm">
                m²
              </div>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">Enter the total area of the property in square meters</p>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-base font-medium text-gray-700 dark:text-gray-300 mb-4 pb-2 border-b border-gray-100 dark:border-zinc-800/80">Coordinates</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Latitude */}
          <div>
            <label htmlFor="latitude" className="block text-gray-600 dark:text-gray-400 mb-1.5 text-sm font-medium">Latitude</label>
            <div className="relative">
              <input
                type="text" // Consider type="number" with step attribute later
                id="latitude"
                name="latitude"
                value={formData.latitude}
                onChange={handleInputChange}
                placeholder="e.g., 34.0522"
                className={`${isSubmitting ? inputFieldDisabledStyles : inputFieldStyles} focus:ring-blue-500 focus:border-blue-500`}
                disabled={isSubmitting}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400 dark:text-gray-500 text-sm">
                °N/S
              </div>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">Decimal format (e.g., 34.0522)</p>
          </div>
          {/* Longitude */}
          <div>
            <label htmlFor="longitude" className="block text-gray-600 dark:text-gray-400 mb-1.5 text-sm font-medium">Longitude</label>
            <div className="relative">
              <input
                type="text" // Consider type="number" with step attribute later
                id="longitude"
                name="longitude"
                value={formData.longitude}
                onChange={handleInputChange}
                placeholder="e.g., -118.2437"
                className={`${isSubmitting ? inputFieldDisabledStyles : inputFieldStyles} focus:ring-blue-500 focus:border-blue-500`}
                disabled={isSubmitting}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400 dark:text-gray-500 text-sm">
                °E/W
              </div>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">Decimal format (e.g., -118.2437)</p>
          </div>
          
          {/* GIS Data File Upload */}
          <FileInputField
            id="gisFile"
            label="GIS/Boundary Data File (Optional)"
            accept=".geojson,.kml,.shp,.zip"
            file={formData.gisFile}
            previewUrl={filePreviews.gisFile || null}
            onChange={handleFileChange}
            onDrop={(e) => handleDrop(e, 'gisFile')}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default GeospatialSection;
