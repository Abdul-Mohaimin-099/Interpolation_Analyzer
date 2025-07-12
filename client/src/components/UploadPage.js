import React, { useState, useRef } from 'react';
import { toast } from 'react-toastify';

function UploadPage({ setPlotData, setShowResult }) {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    if (selectedFile.type !== 'text/csv') {
      toast.error('Please upload a valid CSV file.', { position: 'top-center' });
      return;
    }
    setFile(selectedFile);
    toast.success('File selected successfully!', { position: 'top-center' });
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  };

  const handleAnalyze = () => {
    if (!file) {
      toast.error('Please select a CSV file first.', { position: 'top-center' });
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append('csvFile', file);

    fetch(`${API_URL}/api/interpolate`, {
      method: 'POST',
      body: formData,
    })
      .then((response) => {
        if (!response.ok) throw new Error('Failed to process CSV.');
        return response.json();
      })
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setPlotData(data);
        setShowResult(true);
        toast.success('Analysis completed successfully!', { position: 'top-center' });
      })
      .catch((error) => {
        console.error('Error:', error);
        toast.error(error.message || 'Failed to process CSV. Please try again.', { position: 'top-center' });
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-2xl p-8 border border-[#ADD8E6]/30">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-[#333333] mb-3">Upload Data</h2>
          <p className="text-[#333333]/70">Upload your CSV file to start the interpolation analysis</p>
        </div>

        {/* File Upload Area */}
        <div 
          className={`relative mb-8 ${
            isDragging ? 'border-[#ADD8E6]' : 'border-dashed'
          } border-2 rounded-xl p-8 text-center transition-all duration-300 hover:border-[#ADD8E6] cursor-pointer`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
          
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 bg-[#ADD8E6]/20 rounded-full flex items-center justify-center">
              <svg 
                className="w-8 h-8 text-[#ADD8E6]" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
                />
              </svg>
            </div>
            
            <div className="text-center">
              <p className="text-lg font-medium text-[#333333] mb-1">
                {file ? file.name : 'Drop your CSV file here'}
              </p>
              <p className="text-sm text-[#333333]/60">
                {file ? 'File selected' : 'or click to browse'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-center">
          <button
            onClick={handleAnalyze}
            disabled={!file || isLoading}
            className={`
              w-full max-w-xs py-4 rounded-lg font-medium text-center
              transition-all duration-300 shadow-md
              ${!file || isLoading 
                ? 'bg-[#ADD8E6]/50 cursor-not-allowed text-[#333333]/50' 
                : 'bg-[#ADD8E6] hover:bg-[#87CEEB] text-[#333333] hover:shadow-lg'
              }
            `}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle 
                    className="opacity-25" 
                    cx="12" 
                    cy="12" 
                    r="10" 
                    stroke="currentColor" 
                    strokeWidth="4" 
                    fill="none" 
                  />
                  <path 
                    className="opacity-75" 
                    fill="currentColor" 
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Processing...
              </div>
            ) : (
              'Analyze Data'
            )}
          </button>
        </div>

        {/* File Requirements */}
        <div className="mt-8 text-center">
          <h3 className="text-sm font-medium text-[#333333] mb-2">File Requirements:</h3>
          <ul className="text-xs text-[#333333]/70 space-y-1">
            <li>• File format must be CSV</li>
            <li>• Must contain 'x' and 'y' columns</li>
            <li>• Maximum file size: 5MB</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default UploadPage;