import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Trash2, Play, FileText, AlertCircle } from 'lucide-react';
// Using Bootstrap instead of shadcn components
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/services/api-client-simple';
import { formatConfidence } from '@/lib/utils';
import type { AnalyzeTextResponse } from '@/types/api';

interface BatchAnalysisDemoProps {
  title?: string;
  description?: string;
}

export function BatchAnalysisDemo({ 
  title = "Batch Text Analysis", 
  description = "Analyze multiple texts at once for harassment and toxic content"
}: BatchAnalysisDemoProps) {
  const [texts, setTexts] = useState(['']);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalyzeTextResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const addTextBox = () => {
    if (texts.length < 10) {
      setTexts([...texts, '']);
    }
  };

  const removeTextBox = (index: number) => {
    if (texts.length > 1) {
      setTexts(texts.filter((_, i) => i !== index));
    }
  };

  const updateText = (index: number, value: string) => {
    const newTexts = [...texts];
    newTexts[index] = value;
    setTexts(newTexts);
  };

  const handleBatchAnalysis = async () => {
    const validTexts = texts.filter(text => text.trim().length > 0);
    
    if (validTexts.length === 0) {
      setError('Please enter at least one text to analyze');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResults([]);

    try {
      const batchResponse = await apiClient.post('/api/analyze/batch', {
        texts: validTexts,
        include_statistics: true
      }) as { results: AnalyzeTextResponse[] };
      
      setResults(batchResponse.results);
      
      const toxicCount = batchResponse.results.filter(result => 
        result.riskLevel === 'high' || result.riskLevel === 'critical'
      ).length;
      
      if (toxicCount > 0) {
        toast({
          title: 'Toxic Content Detected',
          description: `Found ${toxicCount} potentially toxic items out of ${batchResponse.results.length}`,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Analysis Complete',
          description: `All ${batchResponse.results.length} texts appear safe`,
        });
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to analyze texts. Please try again.';
      setError(errorMessage);
      toast({
        title: 'Batch Analysis Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const loadSampleData = () => {
    setTexts([
      "This is a normal, friendly comment.",
      "You're such an idiot, you should just disappear.",
      "Great work on this project!",
      "Women don't belong in tech, go back to the kitchen.",
      "I love this community, everyone is so helpful."
    ]);
  };

  const clearAll = () => {
    setTexts(['']);
    setResults([]);
    setError(null);
  };

  const exportResults = () => {
    if (results.length === 0) return;
    
    const exportData = results.map(result => ({
      text: result.text,
      risk_level: result.riskLevel,
      is_toxic: result.is_toxic,
      harassment_score: result.toxicity_scores.harassment,
      misogyny_score: result.toxicity_scores.misogyny,
      flagged_categories: result.flagged_categories.join(', ')
    }));
    
    const csv = [
      'Text,Risk Level,Is Toxic,Harassment Score,Misogyny Score,Flagged Categories',
      ...exportData.map(row => 
        `"${row.text}","${row.risk_level}","${row.is_toxic}","${row.harassment_score}","${row.misogyny_score}","${row.flagged_categories}"`
      )
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'batch_analysis_results.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getOverallStats = () => {
    if (!results || results.length === 0) return null;
    
    const toxicCount = results.filter(r => r.is_toxic).length;
    const avgHarassment = results.reduce((sum, r) => sum + r.toxicity_scores.harassment, 0) / results.length;
    const avgMisogyny = results.reduce((sum, r) => sum + r.toxicity_scores.misogyny, 0) / results.length;
    
    return {
      total: results.length,
      toxic: toxicCount,
      safe: results.length - toxicCount,
      avgHarassment: avgHarassment.toFixed(3),
      avgMisogyny: avgMisogyny.toFixed(3)
    };
  };

  const stats = getOverallStats();

  return (
    <div className="card w-100 mx-auto">
      <div className="card-header">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <h5 className="card-title mb-0">{title}</h5>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary btn-sm" onClick={loadSampleData}>
              <FileText style={{ width: "1rem", height: "1rem", marginRight: "0.25rem" }} />
              Load Samples
            </button>
            <button className="btn btn-outline-secondary btn-sm" onClick={clearAll}>
              <Trash2 style={{ width: "1rem", height: "1rem", marginRight: "0.25rem" }} />
              Clear All
            </button>
          </div>
        </div>
        <p className="card-subtitle text-secondary mb-0">{description}</p>
      </div>
      
      <div className="card-body">
        {/* Input Section */}
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="fw-bold mb-0">Input Texts ({texts.length}/10)</h6>
            <button 
              className="btn btn-outline-primary btn-sm" 
              onClick={addTextBox}
              disabled={texts.length >= 10}
            >
              Add Text Box
            </button>
          </div>
          
          {texts.map((text, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="d-flex gap-2 mb-3"
            >
              <div className="flex-grow-1">
                <textarea
                  placeholder={`Text ${index + 1}...`}
                  value={text}
                  onChange={(e) => updateText(index, e.target.value)}
                  className="form-control"
                  style={{ minHeight: "80px" }}
                  maxLength={500}
                />
                <div className="small text-secondary mt-1">
                  {text.length}/500 characters
                </div>
              </div>
              {texts.length > 1 && (
                <button
                  className="btn btn-outline-secondary btn-sm align-self-start mt-2"
                  onClick={() => removeTextBox(index)}
                >
                  <Trash2 style={{ width: "1rem", height: "1rem" }} />
                </button>
              )}
            </motion.div>
          ))}
        </div>

        {error && (
          <div className="alert alert-danger d-flex align-items-center">
            <AlertCircle style={{ width: "1.25rem", height: "1.25rem", marginRight: "0.5rem" }} />
            <span>{error}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="text-center mb-4">
          <button 
            className="btn btn-primary btn-lg"
            onClick={handleBatchAnalysis}
            disabled={isAnalyzing || texts.every(t => !t.trim())}
          >
            {isAnalyzing ? (
              <>
                <div className="spinner-border spinner-border-sm me-2" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                Analyzing {texts.filter(t => t.trim()).length} texts...
              </>
            ) : (
              <>
                <Play className="me-2" style={{ width: "1.25rem", height: "1.25rem" }} />
                Analyze Batch
              </>
            )}
          </button>
        </div>

        {/* Results Section */}
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Overall Statistics */}
            {stats && (
              <div className="bg-light p-4 rounded mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold mb-0">Batch Analysis Results</h6>
                  <button className="btn btn-outline-primary btn-sm" onClick={exportResults}>
                    <Download style={{ width: "1rem", height: "1rem", marginRight: "0.25rem" }} />
                    Export CSV
                  </button>
                </div>
                <div className="row row-cols-2 row-cols-md-5 g-3 text-center">
                  <div className="col">
                    <div className="fw-bold text-primary fs-4">{stats.total}</div>
                    <div className="small text-secondary">Total Texts</div>
                  </div>
                  <div className="col">
                    <div className="fw-bold text-danger fs-4">{stats.toxic}</div>
                    <div className="small text-secondary">Toxic</div>
                  </div>
                  <div className="col">
                    <div className="fw-bold text-success fs-4">{stats.safe}</div>
                    <div className="small text-secondary">Safe</div>
                  </div>
                  <div className="col">
                    <div className="fw-bold text-warning fs-5">{formatConfidence(parseFloat(stats.avgHarassment))}</div>
                    <div className="small text-secondary">Avg Harassment</div>
                  </div>
                  <div className="col">
                    <div className="fw-bold text-info fs-5">{formatConfidence(parseFloat(stats.avgMisogyny))}</div>
                    <div className="small text-secondary">Avg Misogyny</div>
                  </div>
                </div>
              </div>
            )}

            {/* Individual Results */}
            <div className="mb-3">
              <h6 className="fw-bold mb-3">Individual Results</h6>
              {results.map((result, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-3 rounded mb-3 border-start border-4 ${
                    result.riskLevel === 'low' ? 'border-success bg-success bg-opacity-10' : 
                    result.riskLevel === 'medium' ? 'border-warning bg-warning bg-opacity-10' : 
                    'border-danger bg-danger bg-opacity-10'
                  }`}
                >
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div className="small font-monospace text-secondary">Text #{index + 1}</div>
                    <div className="d-flex align-items-center gap-2">
                      <span className={`badge ${
                        result.riskLevel === 'low' ? 'bg-success' : 
                        result.riskLevel === 'medium' ? 'bg-warning' : 
                        'bg-danger'
                      }`}>
                        {result.riskLevel.toUpperCase()}
                      </span>
                      <span className="small text-secondary">
                        Toxicity: {formatConfidence(result.toxicity_scores.combined)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="small mb-3 bg-white p-2 rounded border text-dark">
                    "{result.text}"
                  </div>
                  
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="small text-white mb-1">Harassment: {formatConfidence(result.predictions.harassment.confidence)}</div>
                      <div className="progress" style={{ height: "8px" }}>
                        <div 
                          className="progress-bar bg-primary" 
                          style={{ width: `${result.predictions.harassment.confidence * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="small text-white mb-1">Misogyny: {formatConfidence(result.predictions.misogyny.confidence)}</div>
                      <div className="progress" style={{ height: "8px" }}>
                        <div 
                          className="progress-bar" 
                          style={{ width: `${result.predictions.misogyny.confidence * 100}%`, backgroundColor: "#7209b7" }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
