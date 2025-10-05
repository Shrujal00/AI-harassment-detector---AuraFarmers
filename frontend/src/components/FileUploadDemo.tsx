import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, Download, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/services/api-client-simple';
import type { BatchAnalysisResult } from '@/types/api';

interface FileUploadDemoProps {
  title?: string;
  description?: string;
}

export function FileUploadDemo({ 
  title = "File Upload Analysis", 
  description = "Upload CSV or text files for bulk harassment detection"
}: FileUploadDemoProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [jobStatus, setJobStatus] = useState<BatchAnalysisResult | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const allowedTypes = ['.txt', '.csv'];
      const fileExtension = '.' + selectedFile.name.split('.').pop()?.toLowerCase();
      
      if (!allowedTypes.includes(fileExtension)) {
        setError('Please select a .txt or .csv file');
        return;
      }
      
      // Validate file size (10MB limit)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);
    
    console.log('[FileUpload] Starting upload for file:', file.name, file.type, file.size);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      console.log('[FileUpload] Calling apiClient.uploadFile...');
      const uploadResult = await apiClient.uploadFile(file, (progress) => {
        setUploadProgress(progress);
      });
      console.log('[FileUpload] Upload result:', uploadResult);

      clearInterval(progressInterval);
      setUploadProgress(100);

      toast({
        title: 'File Uploaded Successfully',
        description: `Processing ${uploadResult.totalTexts} texts. Job ID: ${uploadResult.jobId}`,
      });

      // Start polling for job status
      setJobStatus({
        jobId: uploadResult.jobId,
        status: 'processing',
        progress: 0,
        createdAt: new Date().toISOString()
      });
      
      startPolling(uploadResult.jobId);

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to upload file. Please try again.';
      setError(errorMessage);
      toast({
        title: 'Upload Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const startPolling = (jobId: string) => {
    setIsPolling(true);
    console.log('[FileUpload] Started polling for job:', jobId);
    
    const pollInterval = setInterval(async () => {
      try {
        console.log('[FileUpload] Polling for job status:', jobId);
        const status = await apiClient.get(`/api/jobs/${jobId}`) as BatchAnalysisResult;
        console.log('[FileUpload] Received job status:', status);
        setJobStatus(status);
        
        if (status.status === 'completed' || status.status === 'failed') {
          clearInterval(pollInterval);
          setIsPolling(false);
          console.log('[FileUpload] Job completed with status:', status.status);
          
          if (status.status === 'completed') {
            console.log('[FileUpload] Job results:', status.results);
            console.log('[FileUpload] Job statistics:', status.statistics);
            toast({
              title: 'Analysis Complete',
              description: `Processed ${status.results?.length || 0} texts successfully`,
            });
          } else {
            console.error('[FileUpload] Job failed:', status.error);
            toast({
              title: 'Analysis Failed',
              description: status.error || 'Processing failed',
              variant: 'destructive',
            });
          }
        }
      } catch (err) {
        console.error('[FileUpload] Polling error:', err);
        clearInterval(pollInterval);
        setIsPolling(false);
      }
    }, 2000);
  };

  const downloadResults = async () => {
    if (!jobStatus?.jobId) return;
    
    console.log('[FileUpload] Attempting to download results for job:', jobStatus.jobId);

    try {
      const url = `http://localhost:5000/api/jobs/${jobStatus.jobId}/download`;
      console.log('[FileUpload] Downloading from URL:', url);
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${apiClient.getAccessToken()}`,
        },
      });
      
      console.log('[FileUpload] Download response status:', response.status);
      const blob = await response.blob();
      console.log('[FileUpload] Received blob size:', blob.size);
      const url2 = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url2;
      a.download = `analysis_results_${jobStatus.jobId}.csv`;
      a.click();
      URL.revokeObjectURL(url2);
      
      toast({
        title: 'Download Started',
        description: 'Results file is being downloaded',
      });
    } catch (err: any) {
      toast({
        title: 'Download Failed',
        description: err.message || 'Failed to download results',
        variant: 'destructive',
      });
    }
  };

  const createSampleFile = () => {
    const sampleData = [
      'text',
      'This is a normal comment about the weather',
      'You are so stupid and worthless',
      'Great job on the presentation!',
      'Women should not be allowed to work',
      'I love this community',
      'Go kill yourself you idiot',
      'Thanks for the helpful advice'
    ].join('\n');

    const blob = new Blob([sampleData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_data.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status: string) => {
    const iconSize = {width: '1.25rem', height: '1.25rem'};
    
    switch (status) {
      case 'completed':
        return <CheckCircle style={iconSize} className="text-success" />;
      case 'failed':
        return <AlertCircle style={iconSize} className="text-danger" />;
      case 'processing':
      case 'queued':
        return <Clock style={iconSize} className="text-primary" />;
      default:
        return <Clock style={iconSize} className="text-secondary" />;
    }
  };

  const getJobStats = () => {
    // First, try to use the statistics from the backend if available
    if (jobStatus?.statistics) {
      console.log('[FileUpload] Using backend statistics:', jobStatus.statistics);
      const stats = jobStatus.statistics;
      return {
        total: stats.total_comments || 0,
        toxic: stats.harassment_count || stats.toxic_comments || 0,
        safe: (stats.total_comments || 0) - (stats.harassment_count || 0),
        toxicPercentage: stats.harassment_percentage?.toFixed(1) || '0.0'
      };
    }
    
    // Fallback to calculating from results if statistics not available
    if (!jobStatus?.results) return null;
    
    console.log('[FileUpload] Calculating statistics from results');
    // Now the results structure should match AnalyzeTextResponse directly
    const harassmentCount = jobStatus.results.filter(item => item.is_harassment || item.is_toxic).length;
    const totalCount = jobStatus.results.length;
    
    return {
      total: totalCount,
      toxic: harassmentCount,
      safe: totalCount - harassmentCount,
      toxicPercentage: ((harassmentCount / totalCount) * 100).toFixed(1)
    };
  };

  const stats = getJobStats();

  return (
    <div className="card w-100 mx-auto" style={{maxWidth: '1000px'}}>
      <div className="card-header">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="card-title mb-0">{title}</h5>
          <button className="btn btn-outline-secondary btn-sm" onClick={createSampleFile}>
            <Download style={{width: '16px', height: '16px', marginRight: '4px'}} />
            Download Sample
          </button>
        </div>
        <p className="card-subtitle text-secondary mb-0">{description}</p>
      </div>
      
      <div className="card-body">
        {/* File Upload Section */}
        <div className="mb-4">
          <div
            className={`border-2 border-dashed rounded-4 p-5 text-center cursor-pointer ${
              file ? 'border-success' : 'border-secondary'
            } ios-section`}
            style={{transition: 'all 0.3s ease', minHeight: "220px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"}}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.csv"
              onChange={handleFileSelect}
              style={{display: 'none'}}
            />
            
            {file ? (
              <div className="mb-3">
                <FileText className="mx-auto text-success" style={{width: '3rem', height: '3rem'}} />
                <div className="fw-medium">{file.name}</div>
                <div className="text-muted small">
                  {(file.size / 1024).toFixed(1)} KB • {file.type || 'text/plain'}
                </div>
              </div>
            ) : (
              <div className="mb-3">
                <Upload className="mx-auto text-primary mb-3" style={{width: '3rem', height: '3rem'}} />
                <div className="fw-medium mb-2">Click to upload file</div>
                <div className="text-muted small">
                  Supports .txt and .csv files up to 10MB
                </div>
                <div className="mt-3">
                  <span className="ios-tag"><FileText style={{width: '14px', height: '14px', marginRight: '4px'}} /> .txt</span>
                  <span className="ios-tag"><FileText style={{width: '14px', height: '14px', marginRight: '4px'}} /> .csv</span>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="alert alert-danger d-flex align-items-center">
              <AlertCircle className="me-2" style={{width: '1.25rem', height: '1.25rem'}} />
              <span>{error}</span>
            </div>
          )}

          {file && (
            <div className="text-center">
              <button 
                onClick={handleUpload}
                disabled={isUploading}
                className="btn btn-primary btn-lg"
                style={{minWidth: '200px'}}
              >
                {isUploading ? (
                  <>
                    <div className="spinner-border spinner-border-sm me-2" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    Uploading... {uploadProgress}%
                  </>
                ) : (
                  <>
                    <Upload style={{width: '1.25rem', height: '1.25rem', marginRight: '0.5rem'}} />
                    Upload & Analyze
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-3"
          >
            <div className="d-flex justify-content-between mb-1 small">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="progress" style={{height: '8px'}}>
              <motion.div
                className="progress-bar"
                initial={{ width: 0 }}
                animate={{ width: `${uploadProgress}%` }}
                transition={{ duration: 0.3 }}
                style={{width: `${uploadProgress}%`}}
              />
            </div>
          </motion.div>
        )}

        {/* Job Status */}
        {jobStatus && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <div className="card bg-light">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex align-items-center">
                    {getStatusIcon(jobStatus.status)}
                    <span className="fw-medium ms-2 text-capitalize">{jobStatus.status}</span>
                  </div>
                  <div className="small text-muted">
                    Job ID: {jobStatus.jobId}
                  </div>
                </div>
              
                {(jobStatus.status === 'processing' || isPolling) && (
                  <div className="mb-3">
                    <div className="d-flex justify-content-between small mb-1">
                      <span>{isPolling ? "Updating status..." : "Processing..."}</span>
                      <span>{jobStatus.progress}%</span>
                    </div>
                    <div className="progress" style={{height: '8px'}}>
                      <motion.div
                        className="progress-bar bg-success"
                        initial={{ width: 0 }}
                        animate={{ width: `${jobStatus.progress}%` }}
                        transition={{ duration: 0.5 }}
                        style={{width: `${jobStatus.progress}%`}}
                      />
                    </div>
                  </div>
                )}
                
                {jobStatus.status === 'completed' && stats && (
                  <div className="mb-4">
                    <div className="row row-cols-4 text-center g-2 mb-3">
                      <div className="col">
                        <div className="fw-bold text-primary fs-5">{stats.total}</div>
                        <div className="small text-muted">Total</div>
                      </div>
                      <div className="col">
                        <div className="fw-bold text-danger fs-5">{stats.toxic}</div>
                        <div className="small text-muted">Harassment</div>
                      </div>
                      <div className="col">
                        <div className="fw-bold text-success fs-5">{stats.safe}</div>
                        <div className="small text-muted">Safe</div>
                      </div>
                      <div className="col">
                        <div className="fw-bold text-warning fs-5">{stats.toxicPercentage}%</div>
                        <div className="small text-muted">Harassment Rate</div>
                      </div>
                    </div>
                    
                    <button onClick={downloadResults} className="btn btn-primary w-100">
                      <Download style={{width: '1rem', height: '1rem', marginRight: '0.5rem'}} />
                      Download Harassment Results
                    </button>
                  </div>
                )}
                
                {jobStatus.error && (
                  <div className="alert alert-danger p-2 mt-2 mb-0">
                    Error: {jobStatus.error}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
