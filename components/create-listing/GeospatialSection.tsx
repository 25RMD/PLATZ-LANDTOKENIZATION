import React from 'react';
import FileInputField from '@/components/common/FileInputField';
import { motion } from 'framer-motion';
// import { FaMapMarkerAlt } from 'react-icons/fa'; // Icon for map picker button later

// Define the specific file field name(s) used in this component
export type GeospatialFileFieldNames = 'gisFile';

export interface GeospatialFormData {
  latitude: string;
  longitude: string;
  gisFile: File | null;
}

interface GeospatialProps {
  formData: GeospatialFormData;
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleDrop: (event: React.DragEvent<HTMLDivElement>, fieldName: GeospatialFileFieldNames) => void;
  filePreviews: Record<string, string>;
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
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }} // Adjust delay
      className="space-y-6 bg-primary-light dark:bg-primary-dark p-6 rounded-lg shadow-md"
    >
      <h2 className="text-xl font-semibold text-text-light dark:text-text-dark border-b border-gray-300 dark:border-zinc-700 pb-2 mb-4">Geospatial & Boundary Data</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Latitude */}
        <div>
          <label htmlFor="latitude" className="block text-text-light dark:text-text-dark opacity-80 mb-1 text-sm font-medium">Latitude {<span className="text-red-500">*</span>}</label>
          {/* TODO: Replace with Map Picker component/button */}
          <input
            type="text" // Consider type="number" with step attribute later
            id="latitude"
            name="latitude"
            value={formData.latitude}
            onChange={handleInputChange}
            required
            placeholder="e.g., 34.0522"
            className={isSubmitting ? inputFieldDisabledStyles : inputFieldStyles}
            disabled={isSubmitting}
          />
           {/* <button 
            type="button" 
            onClick={onOpenMapPicker} 
            className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
            disabled={isSubmitting}
            >
              <FaMapMarkerAlt />
              <span>Pick on Map</span>
          </button> */}          
        </div>
        {/* Longitude */}
        <div>
          <label htmlFor="longitude" className="block text-text-light dark:text-text-dark opacity-80 mb-1 text-sm font-medium">Longitude {<span className="text-red-500">*</span>}</label>
          {/* TODO: Replace with Map Picker component/button */}
          <input
            type="text" // Consider type="number" with step attribute later
            id="longitude"
            name="longitude"
            value={formData.longitude}
            onChange={handleInputChange}
            required
            placeholder="e.g., -118.2437"
            className={isSubmitting ? inputFieldDisabledStyles : inputFieldStyles}
            disabled={isSubmitting}
          />
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
    </motion.div>
  );
};

export default GeospatialSection;
