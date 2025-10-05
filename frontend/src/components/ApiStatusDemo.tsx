import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Server, CheckCircle, AlertCircle, Clock, Cpu, Database } from 'lucide-react';
// Using Bootstrap instead of shadcn components
import { apiClient } from '@/services/api-client-simple';
import type { SystemHealth, ModelInfo } from '@/types/api';

interface ApiStatusDemoProps {
  title?: string;
  description?: string;
}

export function ApiStatusDemo({ 
  title = "API Status & Model Information", 
  description = "Real-time status of our harassment detection API and AI models"
}: ApiStatusDemoProps) {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkStatus = async () => {
    setIsLoading(true);
    try {
      const [healthResponse, modelsResponse] = await Promise.all([
        apiClient.get('/api/health'),
        apiClient.get('/api/models/info')
      ]);
      
      setHealth(healthResponse as SystemHealth);
      setModelInfo(modelsResponse as ModelInfo);
      setLastChecked(new Date());
    } catch (error) {
      console.error('Failed to fetch API status:', error);
      setHealth({
        status: 'unhealthy',
        models_loaded: false,
        api_version: 'unknown',
        uptime: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-success border-success bg-success bg-opacity-10';
      case 'degraded':
        return 'text-warning border-warning bg-warning bg-opacity-10';
      case 'unhealthy':
        return 'text-danger border-danger bg-danger bg-opacity-10';
      default:
        return 'text-secondary border-secondary bg-light';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle style={{ width: "1.25rem", height: "1.25rem" }} className="text-success" />;
      case 'degraded':
        return <AlertCircle style={{ width: "1.25rem", height: "1.25rem" }} className="text-warning" />;
      case 'unhealthy':
        return <AlertCircle style={{ width: "1.25rem", height: "1.25rem" }} className="text-danger" />;
      default:
        return <Clock style={{ width: "1.25rem", height: "1.25rem" }} className="text-secondary" />;
    }
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="card w-100 mx-auto">
      <div className="card-header">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <div className="d-flex align-items-center">
            <Server className="me-2 text-primary" style={{ width: "1.5rem", height: "1.5rem" }} />
            <h5 className="card-title mb-0">{title}</h5>
          </div>
          <button 
            className="btn btn-outline-secondary btn-sm" 
            onClick={checkStatus}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="spinner-border spinner-border-sm me-1" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            ) : (
              'Refresh'
            )}
          </button>
        </div>
        <p className="card-subtitle text-secondary mb-0">{description}</p>
      </div>
      
      <div className="card-body">
        {/* API Health Status */}
        {health && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <div className={`p-4 rounded border ${getStatusColor(health.status)}`}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="d-flex align-items-center">
                  {getStatusIcon(health.status)}
                  <span className="fw-medium text-capitalize ms-2">{health.status}</span>
                </div>
                <div className="small">
                  API Version: {health.api_version}
                </div>
              </div>
              
              <div className="row row-cols-2 row-cols-md-4 g-3 small">
                <div className="col">
                  <div className="fw-medium">Models Loaded</div>
                  <div className={health.models_loaded ? 'text-success' : 'text-danger'}>
                    {health.models_loaded ? 'Yes' : 'No'}
                  </div>
                </div>
                
                <div className="col">
                  <div className="fw-medium">Uptime</div>
                  <div>{formatUptime(health.uptime)}</div>
                </div>
                
                {health.memory_usage && (
                  <div className="col">
                    <div className="fw-medium">Memory Usage</div>
                    <div>{health.memory_usage.toFixed(1)}%</div>
                  </div>
                )}
                
                {health.request_count && (
                  <div className="col">
                    <div className="fw-medium">Requests</div>
                    <div>{health.request_count.toLocaleString()}</div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Model Information */}
        {modelInfo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-4"
          >
            <div className="d-flex align-items-center mb-3">
              <Database style={{ width: "1.25rem", height: "1.25rem" }} className="me-2" />
              <h6 className="fw-bold mb-0">AI Models</h6>
            </div>
            
            <div className="row g-3 mb-3">
              {/* Harassment Model */}
              <div className="col-md-6">
                <div className="card h-100 bg-primary bg-opacity-10 border-primary">
                  <div className="card-body">
                    <div className="d-flex align-items-center mb-3">
                      <Cpu style={{ width: "1.25rem", height: "1.25rem" }} className="text-primary me-2" />
                      <div className="fw-medium">Harassment Detection</div>
                    </div>
                    
                    <div className="small mb-0">
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-secondary">Model:</span>
                        <span className="font-monospace">{modelInfo.harassment_model.name}</span>
                      </div>
                      
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-secondary">Version:</span>
                        <span>{modelInfo.harassment_model.version}</span>
                      </div>
                      
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-secondary">Accuracy:</span>
                        <span className="fw-bold text-success">
                          {(modelInfo.harassment_model.accuracy * 100).toFixed(1)}%
                        </span>
                      </div>
                      
                      <div className="d-flex justify-content-between">
                        <span className="text-secondary">Last Trained:</span>
                        <span>{new Date(modelInfo.harassment_model.last_trained).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Misogyny Model */}
              <div className="col-md-6">
                <div className="card h-100" style={{ backgroundColor: "rgba(114, 9, 183, 0.1)", borderColor: "#7209b7" }}>
                  <div className="card-body">
                    <div className="d-flex align-items-center mb-3">
                      <Cpu style={{ width: "1.25rem", height: "1.25rem", color: "#7209b7" }} className="me-2" />
                      <div className="fw-medium" style={{ color: "#7209b7" }}>Misogyny Detection</div>
                    </div>
                    
                    <div className="small mb-0">
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-secondary">Model:</span>
                        <span className="font-monospace">{modelInfo.misogyny_model.name}</span>
                      </div>
                      
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-secondary">Version:</span>
                        <span>{modelInfo.misogyny_model.version}</span>
                      </div>
                      
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-secondary">Accuracy:</span>
                        <span className="fw-bold text-success">
                          {(modelInfo.misogyny_model.accuracy * 100).toFixed(1)}%
                        </span>
                      </div>
                      
                      <div className="d-flex justify-content-between">
                        <span className="text-secondary">Last Trained:</span>
                        <span>{new Date(modelInfo.misogyny_model.last_trained).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Model Weights */}
            <div className="bg-light p-3 rounded">
              <h6 className="fw-medium mb-2">Toxicity Score Weighting</h6>
              <div className="d-flex flex-wrap gap-4 small">
                <div>
                  <span className="text-secondary">Harassment Weight:</span>
                  <span className="ms-2 fw-medium">{(modelInfo.toxicity_weights.harassment * 100)}%</span>
                </div>
                <div>
                  <span className="text-secondary">Misogyny Weight:</span>
                  <span className="ms-2 fw-medium">{(modelInfo.toxicity_weights.misogyny * 100)}%</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Last Updated */}
        {lastChecked && (
          <div className="text-center small text-secondary">
            Last updated: {lastChecked.toLocaleTimeString()}
          </div>
        )}

        {/* Connection Error */}
        {!health && !isLoading && (
          <div className="text-center py-4">
            <AlertCircle className="text-danger mx-auto mb-3" style={{ width: "3rem", height: "3rem" }} />
            <div className="text-secondary">Unable to connect to API</div>
            <div className="small text-secondary mt-1">
              Make sure the backend server is running on localhost:5000
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
