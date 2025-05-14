import React, { useState, useRef } from 'react';
import { Upload, X, CheckCircle, FileText, Headphones, Music, File } from 'lucide-react';

const FileUploader = ({ onFileChange, acceptedTypes = '.mp3,.wav,.m4a', showPreview = true }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadState, setUploadState] = useState('idle'); // idle, uploading, success, error
  const fileInputRef = useRef(null);
  
  // Handle drag events
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };
  
  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setDragOver(true);
  };
  
  const handleDragLeave = () => {
    setDragOver(false);
    setIsDragging(false);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    setDragOver(false);
    
    // Process files
    handleFiles(e.dataTransfer.files);
  };
  
  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };
  
  const handleFiles = (fileList) => {
    // Convert FileList to Array and filter by accepted types
    const newFiles = Array.from(fileList).filter(file => {
      // Check if file type is in acceptedTypes
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
      return acceptedTypes.includes(fileExtension);
    });
    
    // If we have valid files
    if (newFiles.length > 0) {
      setFiles(newFiles);
      
      // Start mock upload progress
      simulateUpload(newFiles);
      
      // Pass files to parent component
      if (onFileChange) {
        onFileChange(newFiles);
      }
    }
  };
  
  // Simulate upload progress
  const simulateUpload = (files) => {
    setUploadState('uploading');
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        const nextProgress = prev + 5;
        if (nextProgress >= 100) {
          clearInterval(interval);
          setUploadState('success');
          return 100;
        }
        return nextProgress;
      });
    }, 100);
  };
  
  // Get appropriate icon for file type
  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    
    switch (extension) {
      case 'mp3':
        return <Music className="w-6 h-6 text-blue-500" />;
      case 'wav':
        return <Headphones className="w-6 h-6 text-purple-500" />;
      case 'm4a':
        return <Headphones className="w-6 h-6 text-pink-500" />;
      default:
        return <File className="w-6 h-6 text-gray-500" />;
    }
  };
  
  // Remove a file from the list
  const removeFile = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
    
    if (newFiles.length === 0) {
      setUploadState('idle');
      setUploadProgress(0);
    }
    
    // Pass updated files to parent component
    if (onFileChange) {
      onFileChange(newFiles);
    }
  };
  
  return (
    <div className="w-full">
      {/* Drop Zone */}
      <div 
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all transform duration-300 ${
          dragOver 
            ? 'border-[#92C7CF] bg-[#f0f9fa] scale-102 shadow-md' 
            : 'border-[#AAD7D9] hover:border-[#92C7CF] hover:bg-[#f7fafc] hover:scale-101 hover:shadow-sm'
        }`}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current.click()}
      >
        <div className={`transition-all duration-500 transform ${isDragging ? 'scale-110' : ''}`}>
          <Upload className={`w-16 h-16 mx-auto ${isDragging ? 'text-[#92C7CF]' : 'text-[#AAD7D9]'}`} />
        </div>
        
        <p className={`mt-4 text-base font-medium transition-all duration-300 ${isDragging ? 'text-[#92C7CF]' : 'text-[#92C7CF] text-opacity-80'}`}>
          {isDragging ? 'Drop your audio file here' : 'Drag and drop your audio file here'}
        </p>
        <p className="mt-1 text-sm text-gray-500">
          or <span className="text-[#92C7CF] font-medium">browse</span> to upload
        </p>
        <p className="mt-2 text-xs text-gray-400">
          Supported file types: {acceptedTypes.replace(/\./g, '')}
        </p>
        
        <input 
          type="file" 
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileInputChange}
          accept={acceptedTypes}
        />
      </div>
      
      {/* File Preview */}
      {showPreview && files.length > 0 && (
        <div className="mt-4 space-y-3">
          {files.map((file, index) => (
            <div 
              key={`${file.name}-${index}`}
              className="bg-white rounded-lg border border-gray-200 p-3 flex items-center"
            >
              {/* File Icon */}
              <div className="mr-3 flex-shrink-0">
                {getFileIcon(file.name)}
              </div>
              
              {/* File Details */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                
                {/* Progress Bar */}
                {uploadState === 'uploading' && (
                  <div className="w-full h-1.5 bg-gray-200 rounded-full mt-2">
                    <div 
                      className="h-1.5 bg-[#92C7CF] rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                )}
                
                {/* Upload Status */}
                {uploadState === 'success' && (
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Ready to process
                  </p>
                )}
              </div>
              
              {/* Remove Button */}
              <button 
                className="ml-2 p-1 text-gray-400 hover:text-gray-600 rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  boxShadow: 'none'
                }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUploader;