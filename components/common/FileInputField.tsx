import React from 'react';
import { FaUpload } from 'react-icons/fa';

interface FileInputFieldProps {
  id: string;
  label: string;
  accept: string;
  file: File | File[] | null;
  previewUrl: string | string[] | null;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDrop?: (event: React.DragEvent<HTMLDivElement>) => void;
  multiple?: boolean;
  disabled?: boolean;
}

const FileInputField: React.FC<FileInputFieldProps> = ({
  id,
  label,
  accept,
  file,
  previewUrl,
  onChange,
  onDrop,
  multiple = false,
  disabled = false,
}) => {
  const fileCount = Array.isArray(file) ? file.length : (file ? 1 : 0);
  const fileNameDisplay = fileCount > 1 ? `${fileCount} files selected` : (file && !Array.isArray(file) ? file.name : null);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (
    <div>
      <label htmlFor={id} className="block text-text-light dark:text-text-dark opacity-80 mb-1 text-sm font-medium">
        {label}
      </label>
      <div
        className={`border-2 border-dashed border-black/20 dark:border-white/20 text-center rounded-lg p-4 cursor-pointer hover:border-black/50 dark:hover:border-white/50 transition-colors ${
          file ? 'border-solid border-green-500 dark:border-green-400' : ''
        }`}
        onClick={!disabled ? () => document.getElementById(id)?.click() : undefined}
        onDragOver={!disabled ? handleDragOver : undefined}
        onDrop={!disabled ? onDrop : undefined}
      >
        <input
          type="file"
          id={id}
          name={id}
          className="hidden"
          onChange={!disabled ? onChange : undefined}
          accept={accept}
          multiple={multiple}
          disabled={disabled}
        />
        {file ? (
          <div className="text-sm text-green-700 dark:text-green-300">
            <p className="font-semibold">File Selected:</p>
            {Array.isArray(file) ? (
              file.map((file, index) => (
                <div key={index}>
                  <p>{file.name}</p>
                  <p className="text-xs opacity-70">({(file.size / 1024).toFixed(1)} KB)</p>
                </div>
              ))
            ) : (
              <>
                <p>{file.name}</p>
                <p className="text-xs opacity-70">({(file.size / 1024).toFixed(1)} KB)</p>
              </>
            )}
            <p className={`mt-1 text-xs text-text-light dark:text-text-dark opacity-60 ${!disabled ? 'hover:underline' : 'cursor-not-allowed'}`}>
              {disabled ? 'Cannot replace during submission' : 'Click or drag to replace'}
            </p>
            {previewUrl && (
              <div className="flex flex-wrap justify-center items-center gap-2">
                {Array.isArray(previewUrl) ? (
                  previewUrl.map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="max-h-24 mx-auto rounded mt-2"
                    />
                  ))
                ) : (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-h-24 mx-auto rounded mt-2"
                  />
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-1">
            <FaUpload className="mx-auto h-8 w-8 text-text-light dark:text-text-dark opacity-40" />
            <p className="text-sm font-medium text-text-light dark:text-text-dark">
              {disabled ? 'Upload disabled' : 'Drag & drop or click to browse'}
            </p>
            <p className="text-xs text-text-light dark:text-text-dark opacity-60">{accept}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileInputField;
