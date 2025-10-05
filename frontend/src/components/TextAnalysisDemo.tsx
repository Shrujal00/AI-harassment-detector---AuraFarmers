import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Loader2, Send } from 'lucide-react';

import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/services/api-client-simple';
import { formatConfidence, validateTextInput } from '@/lib/utils';
import type { AnalyzeTextResponse } from '@/types/api';

interface TextAnalysisDemoProps {
  title?: string;
  description?: string;
  placeholder?: string;
}

export function TextAnalysisDemo({ 
  title = "Try Text Analysis", 
  description = "Enter any text to see our AI harassment detection in action",
  placeholder = "Type or paste text here to analyze for harassment and toxic content..."
}: TextAnalysisDemoProps) {
  const [text, setText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalyzeTextResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    const validation = validateTextInput(text);
    if (!validation.isValid) {
      setError(validation.error || 'Invalid input');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const response = await apiClient.post('/api/analyze', {
        text: text.trim(),
        include_details: true
      }) as AnalyzeTextResponse;
      
      setResult(response);
      
      if (response.riskLevel === 'high' || response.riskLevel === 'critical') {
        toast({
          title: 'High Risk Content Detected',
          description: `Risk level: ${response.riskLevel.toUpperCase()}`,
          variant: 'destructive',
        });
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to analyze text. Please try again.';
      setError(errorMessage);
      toast({
        title: 'Analysis Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return <CheckCircle style={{ width: "1.25rem", height: "1.25rem", color: "#4ade80" }} />; // Brighter green
      case 'medium':
        return <AlertTriangle style={{ width: "1.25rem", height: "1.25rem", color: "#fcd34d" }} />; // Brighter yellow
      case 'high':
      case 'critical':
        return <AlertTriangle style={{ width: "1.25rem", height: "1.25rem", color: "#f87171" }} />; // Brighter red
      default:
        return <CheckCircle style={{ width: "1.25rem", height: "1.25rem", color: "#ffffff" }} />; // White for better visibility
    }
  };

  return (
    <div className="card w-100 mx-auto">
      <div className="card-header">
        <h5 className="card-title mb-1 d-flex align-items-center">
          <span>{title}</span>
        </h5>
        <p className="card-subtitle text-secondary mb-0 small">{description}</p>
      </div>
      <div className="card-body">
        <div className="mb-4">
          <textarea
            placeholder={placeholder}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="form-control mb-2"
            style={{ minHeight: "120px", fontSize: "1rem", lineHeight: "1.5" }}
            maxLength={500}
          />
          <div className="d-flex justify-content-between align-items-center small text-secondary">
            <span>{text.length}/500 characters</span>
            {error && (
              <span className="text-danger">{error}</span>
            )}
          </div>
        </div>

        <button 
          onClick={handleAnalyze} 
          disabled={!text.trim() || isAnalyzing}
          className="btn btn-primary w-100"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="me-2" style={{ width: "1rem", height: "1rem" }} />
              Analyzing...
            </>
          ) : (
            <>
              <Send className="me-2" style={{ width: "1rem", height: "1rem" }} />
              Analyze Text
            </>
          )}
        </button>

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4"
          >
            {/* Overall Result */}
            <div className={`p-4 rounded border ${
              result.riskLevel === 'low' ? 'border-success bg-success bg-opacity-25' : 
              result.riskLevel === 'medium' ? 'border-warning bg-warning bg-opacity-25' : 
              'border-danger bg-danger bg-opacity-25'
            } mb-4`} style={{ color: 'white' }}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div className="d-flex align-items-center">
                  {getRiskIcon(result.riskLevel)}
                  <span className="fw-semibold text-capitalize ms-2 text-white">
                    {result.riskLevel} Risk
                  </span>
                </div>
                <span className="small fw-medium text-white">
                  Overall Toxicity: {formatConfidence(result.toxicity_scores.combined)}
                </span>
              </div>
              
              {result.is_toxic && (
                <div className="mt-2 py-1 px-2 rounded text-white" style={{ backgroundColor: "rgba(255, 255, 255, 0.15)" }}>
                  <strong>Flagged Categories:</strong> {result.flagged_categories.join(', ')}
                </div>
              )}
            </div>

            {/* Detailed Scores */}
            <div className="row g-4 mb-4">
              {/* Harassment Score */}
              <div className="col-md-6">
                <div className="p-4 ios-section" style={{ backgroundColor: 'rgba(30, 41, 59, 0.8)', borderRadius: '10px' }}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-medium text-white">Harassment Detection</span>
                    <span className="small font-monospace text-white">
                      {formatConfidence(result.predictions.harassment.confidence)}
                    </span>
                  </div>
                  <div className="progress" style={{ height: "8px" }}>
                    <motion.div
                      className="progress-bar bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${result.predictions.harassment.confidence * 100}%` }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                    />
                  </div>
                  <div className="mt-2 small text-white fw-medium">
                    {result.predictions.harassment.label === 'toxic' ? 'Toxic' : 'Safe'}
                  </div>
                </div>
              </div>

              {/* Misogyny Score */}
              <div className="col-md-6">
                <div className="p-4 ios-section" style={{ backgroundColor: 'rgba(30, 41, 59, 0.8)', borderRadius: '10px' }}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-medium text-white">Misogyny Detection</span>
                    <span className="small font-monospace text-white">
                      {formatConfidence(result.predictions.misogyny.confidence)}
                    </span>
                  </div>
                  <div className="progress" style={{ height: "8px" }}>
                    <motion.div
                      className="progress-bar"
                      style={{ backgroundColor: "#5E5CE6" }}
                      initial={{ width: 0 }}
                      animate={{ width: `${result.predictions.misogyny.confidence * 100}%` }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                    />
                  </div>
                  <div className="mt-2 small text-white fw-medium">
                    {result.predictions.misogyny.label === 'toxic' ? 'Toxic' : 'Safe'}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
