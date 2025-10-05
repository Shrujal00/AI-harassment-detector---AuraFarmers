import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Textarea } from './ui/textarea';
import { useToast } from '../hooks/use-toast';

interface PlatformResult {
  platform: string;
  text: string;
  result: {
    harassment_score: number;
    misogyny_score: number;
    toxicity_score: number;
    is_harassment: boolean;
    is_toxic: boolean;
  };
  isFlagged: boolean;
}

export function HarassmentDetectionDemo() {
  const [text, setText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<PlatformResult[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState('twitter');
  const { toast } = useToast();

  const platforms = [
    { id: 'twitter', name: 'Twitter' },
    { id: 'reddit', name: 'Reddit' },
    { id: 'facebook', name: 'Facebook' },
    { id: 'instagram', name: 'Instagram' },
    { id: 'discord', name: 'Discord' },
  ];

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const analyzeText = async () => {
    if (!text.trim()) {
      toast({
        title: 'Empty Text',
        description: 'Please enter some text to analyze.',
        variant: 'destructive',
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Call your harassment detection API
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze text');
      }

      const data = await response.json();
      
      // Create a simulated result for demo purposes
      // In production, you would use the actual API response
      const simulatedResult = {
        harassment_score: Math.random() * (text.toLowerCase().includes('bitch') ? 0.7 : 0.4) + 
                           (text.toLowerCase().includes('hate') ? 0.3 : 0),
        misogyny_score: Math.random() * (text.toLowerCase().includes('woman') || 
                          text.toLowerCase().includes('girl') ? 0.6 : 0.2),
        toxicity_score: Math.random() * (text.toLowerCase().includes('stupid') || 
                         text.toLowerCase().includes('idiot') ? 0.5 : 0.3),
      };
      
      simulatedResult.harassment_score = Math.min(simulatedResult.harassment_score, 1);
      simulatedResult.misogyny_score = Math.min(simulatedResult.misogyny_score, 1);
      simulatedResult.toxicity_score = Math.min(simulatedResult.toxicity_score, 1);
      
      const threshold = 0.7;
      const isFlagged = 
        simulatedResult.harassment_score >= threshold ||
        simulatedResult.misogyny_score >= threshold ||
        simulatedResult.toxicity_score >= threshold;

      const newResult: PlatformResult = {
        platform: selectedPlatform,
        text,
        result: {
          ...simulatedResult,
          is_harassment: simulatedResult.harassment_score >= threshold,
          is_toxic: simulatedResult.toxicity_score >= threshold,
        },
        isFlagged,
      };

      setResults([newResult, ...results]);
      
      if (isFlagged) {
        toast({
          title: 'Content Flagged',
          description: 'This content contains potentially harmful language.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Content Analyzed',
          description: 'No harmful content detected.',
          variant: 'default',
        });
      }
    } catch (error) {
      console.error('Error analyzing text:', error);
      toast({
        title: 'Analysis Failed',
        description: 'Could not analyze the content. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="platform-demo-container">
      <h2>
        Cross-Platform Content Analysis
      </h2>
      
      <div className="platform-selection">
        <label>Select Platform</label>
        <div className="platform-buttons-wrapper">
          {platforms.map(platform => (
            <button
              key={platform.id}
              className={`rounded-md platform-button ${
                selectedPlatform === platform.id
                  ? 'active'
                  : ''
              }`}
              onClick={() => setSelectedPlatform(platform.id)}
            >
              {platform.name}
            </button>
          ))}
        </div>
      </div>
      
      <div className="input-container">
        <Textarea
          placeholder="Enter text to analyze for harassment or harmful content..."
          value={text}
          onChange={handleTextChange}
          className="analysis-textarea"
        />
        <Button 
          onClick={analyzeText} 
          disabled={isAnalyzing || !text.trim()} 
          className="analyze-button"
          style={{ width: '100%' }}
        >
          {isAnalyzing ? 'ANALYZING...' : 'ANALYZE CONTENT'}
        </Button>
      </div>

      {results.length > 0 && (
        <div className="results-container">
          <h3 className="results-heading">Analysis Results</h3>
          
          {results.map((result, index) => (
            <Card 
              key={index} 
              className={`p-4 result-card ${result.isFlagged ? 'flagged-card' : ''}`}
            >
              <div className="result-header">
                <div className="platform-indicator">
                  <div className={`status-dot ${
                    result.isFlagged ? 'flag-pulse status-red' : 'status-green'
                  }`}></div>
                  <span className="platform-name">{result.platform}</span>
                </div>
                {result.isFlagged && (
                  <div className="flag-indicator">
                    Flagged Content
                  </div>
                )}
              </div>
              
              <p className="text-sm mb-3 break-words result-text-sample">
                {result.text}
              </p>
              
              <div className="score-grid">
                <div className="score-item">
                  <p className="score-label">Harassment</p>
                  <div className="score-bar-bg">
                    <div 
                      className="score-bar-fill harassment-bar" 
                      style={{ width: `${result.result.harassment_score * 100}%` }}
                    ></div>
                  </div>
                  <p className="score-value">{(result.result.harassment_score * 100).toFixed(1)}%</p>
                </div>
                
                <div className="score-item">
                  <p className="score-label">Misogyny</p>
                  <div className="score-bar-bg">
                    <div 
                      className="score-bar-fill misogyny-bar" 
                      style={{ width: `${result.result.misogyny_score * 100}%` }}
                    ></div>
                  </div>
                  <p className="score-value">{(result.result.misogyny_score * 100).toFixed(1)}%</p>
                </div>
                
                <div className="score-item">
                  <p className="score-label">Toxicity</p>
                  <div className="score-bar-bg">
                    <div 
                      className="score-bar-fill toxicity-bar" 
                      style={{ width: `${result.result.toxicity_score * 100}%` }}
                    ></div>
                  </div>
                  <p className="score-value">{(result.result.toxicity_score * 100).toFixed(1)}%</p>
                </div>
              </div>
              
              {result.isFlagged && (
                <div className="flagged-content-message">
                  <p className="flagged-title">AI would block this content</p>
                  <p className="flagged-description">
                    This content contains potentially {result.result.is_harassment && 'harassing'} 
                    {result.result.is_harassment && result.result.is_toxic && ' and '} 
                    {result.result.is_toxic && 'toxic'} language that would be blocked or flagged by our AI system.
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <div className="demo-footer">
        <p>This demo showcases how HumanI filters and blocks harmful content across different social media platforms.</p>
        <p>For testing purposes, try including words like "hate", "bitch", or "stupid" to see different detection levels.</p>
      </div>
    </div>
  );
}

export default HarassmentDetectionDemo;