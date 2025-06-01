import React from 'react';
import FileInputField from '@/components/common/FileInputField';
import { motion } from 'framer-motion';
import { getAfricanCountries, getStatesForCountry, getLocalGovernmentAreas } from '@/lib/utils/locationData';
// import { FaMapMarkerAlt } from 'react-icons/fa'; // Icon for map picker button later

// Define the specific file field names used in this component
export type GeospatialFileFieldNames = 'gisFile';

// Define the structure of the expected formData subset
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
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
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
  const [availableStates, setAvailableStates] = React.useState<string[]>([]);
  
  // Get local government areas for selected state
  const [availableLGAs, setAvailableLGAs] = React.useState<string[]>([]);
  
  // Update states when country changes
  React.useEffect(() => {
    if (formData.country) {
      setAvailableStates(getStatesForCountry(formData.country));
    } else {
      setAvailableStates([]);
    }
  }, [formData.country]);
  
  // Update local government areas when state changes
  React.useEffect(() => {
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
      transition={{ delay: 0.6 }}
      className="pt-12 px-12 pb-8 border-t-2 border-black/20 dark:border-white/20 relative"
    >
      {/* Cyber section background effects */}
      <motion.div
        className="absolute inset-0 opacity-[0.01] dark:opacity-[0.02] pointer-events-none"
        animate={{
          background: [
            "linear-gradient(270deg, transparent 49%, rgba(0,0,0,0.05) 50%, transparent 51%)",
            "linear-gradient(90deg, transparent 49%, rgba(0,0,0,0.05) 50%, transparent 51%)",
            "linear-gradient(270deg, transparent 49%, rgba(0,0,0,0.05) 50%, transparent 51%)",
          ],
        }}
        transition={{ duration: 10, repeat: Infinity }}
      />
      
      <motion.h2 
        className="text-2xl font-mono uppercase tracking-wider text-black dark:text-white mb-8 flex items-center"
        whileHover={{ textShadow: "0 0 20px rgba(0, 0, 0, 0.5)" }}
      >
        <motion.span 
          className="w-10 h-10 bg-black dark:bg-white text-white dark:text-black mr-4 flex items-center justify-center text-lg font-bold font-mono border border-black/30 dark:border-white/30"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          3
        </motion.span>
        GEOSPATIAL & BOUNDARY DATA
      </motion.h2>
      
      {/* Location Information */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
          <label htmlFor="country" className="block text-black dark:text-white mb-3 text-sm font-mono uppercase tracking-wider">Country *</label>
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
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
          <label htmlFor="state" className="block text-black dark:text-white mb-3 text-sm font-mono uppercase tracking-wider">State / Province *</label>
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
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
          <label htmlFor="localGovernmentArea" className="block text-black dark:text-white mb-3 text-sm font-mono uppercase tracking-wider">Local Government Area</label>
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
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
          <label htmlFor="propertyAreaSqm" className="block text-black dark:text-white mb-3 text-sm font-mono uppercase tracking-wider">Property Area (SQM) *</label>
          <input
            type="number"
            id="propertyAreaSqm"
            name="propertyAreaSqm"
            value={formData.propertyAreaSqm}
            onChange={handleInputChange}
            className={isSubmitting ? inputFieldDisabledStyles : inputFieldStyles}
            placeholder="e.g., 1000"
            disabled={isSubmitting}
          />
        </motion.div>
      </motion.div>

      {/* Coordinates Section */}
      <motion.div
        className="border-t-2 border-black/20 dark:border-white/20 pt-8 mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
      >
        <motion.h3 
          className="text-lg font-mono uppercase tracking-wider text-black dark:text-white mb-6"
          whileHover={{ textShadow: "0 0 15px rgba(0, 0, 0, 0.3)" }}
        >
          GPS COORDINATES
        </motion.h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
            <label htmlFor="latitude" className="block text-black dark:text-white mb-3 text-sm font-mono uppercase tracking-wider">Latitude *</label>
            <input
              type="text"
              id="latitude"
              name="latitude"
              value={formData.latitude}
              onChange={handleInputChange}
              className={isSubmitting ? inputFieldDisabledStyles : inputFieldStyles}
              placeholder="e.g., 34.0522"
              disabled={isSubmitting}
            />
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
            <label htmlFor="longitude" className="block text-black dark:text-white mb-3 text-sm font-mono uppercase tracking-wider">Longitude *</label>
            <input
              type="text"
              id="longitude"
              name="longitude"
              value={formData.longitude}
              onChange={handleInputChange}
              className={isSubmitting ? inputFieldDisabledStyles : inputFieldStyles}
              placeholder="e.g., -118.2437"
              disabled={isSubmitting}
            />
          </motion.div>
        </div>
      </motion.div>

      {/* GIS Data Section */}
      <motion.div
        className="border-t-2 border-black/20 dark:border-white/20 pt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
      >
        <motion.h3 
          className="text-lg font-mono uppercase tracking-wider text-black dark:text-white mb-6"
          whileHover={{ textShadow: "0 0 15px rgba(0, 0, 0, 0.3)" }}
        >
          GIS DATA
        </motion.h3>
        <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
          <label htmlFor="gisFile" className="block text-black dark:text-white mb-3 text-sm font-mono uppercase tracking-wider">
            GIS / Mapping Data Upload
          </label>
          <FileInputField
            id="gisFile"
            label=""
            accept=".kml,.kmz,.shp,.geojson,.gpx"
            file={formData.gisFile}
            previewUrl={filePreviews.gisFile || null}
            onChange={handleFileChange}
            onDrop={(e) => handleDrop(e, 'gisFile')}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default GeospatialSection;
