import sys
sys.path.append('..')

from typing import List, Dict
import time
import random
from config.config import TOXICITY_WEIGHTS

class MockToxicityPredictor:
    """
    Mock predictor for testing API endpoints without trained models.
    Provides realistic but fake predictions for demonstration.
    """
    
    def __init__(self):
        self.models_loaded = True
        
    def load_models(self):
        """Mock loading - always succeeds."""
        print("Mock models loaded successfully!")
        self.models_loaded = True
        
    def get_models_info(self) -> Dict:
        """Get mock information about the loaded models."""
        return {
            "status": "loaded",
            "harassment_model": {
                "model_name": "mock-roberta-base",
                "max_length": 256,
                "device": "cpu",
                "vocab_size": 50265,
                "model_loaded": True,
                "using_mock": True
            },
            "misogyny_model": {
                "model_name": "mock-roberta-base",
                "max_length": 256,
                "device": "cpu",
                "vocab_size": 50265,
                "model_loaded": True,
                "using_mock": True
            },
            "using_mock": True
        }
        
    def predict_single(self, text: str, threshold: float = 0.5, include_details: bool = True) -> Dict:
        """
        Mock prediction for a single text.
        Returns realistic-looking results based on keywords.
        """
        time.sleep(0.1)  # Simulate processing time
        
        # Simple keyword-based mock logic
        harassment_keywords = ['hate', 'stupid', 'idiot', 'kill', 'die', 'ugly', 'loser', 'fuck', 'shit', 'damn', 'asshole', 'bitch', 'cunt', 'bastard', 'moron', 'retard', 'scum', 'trash', 'worthless', 'rape', 'nigga', 'nigger', 'fag', 'faggot', 'suck', 'dick', 'cock', 'pussy', 'tits']
        misogyny_keywords = ['woman', 'girl', 'female', 'kitchen', 'sandwich', 'weak', 'slut', 'whore', 'feminazi', 'emotional', 'hysterical', 'bitch', 'cunt', 'tits', 'pussy', 'rape']
        
        text_lower = text.lower()
        
        # Calculate mock scores based on keywords with better weighting
        harassment_score = 0
        misogyny_score = 0
        
        # More aggressive scoring for severe content
        severe_harassment = ['rape', 'kill', 'die', 'nigga', 'nigger', 'cunt', 'fag', 'faggot']
        severe_misogyny = ['rape', 'cunt', 'slut', 'whore', 'bitch']
        
        for word in harassment_keywords:
            if word in text_lower:
                if word in severe_harassment:
                    harassment_score += 0.7  # Very high weight
                elif word in ['fuck', 'shit', 'asshole', 'bastard']:
                    harassment_score += 0.5  # High weight
                else:
                    harassment_score += 0.3  # Medium weight
        
        for word in misogyny_keywords:
            if word in text_lower:
                if word in severe_misogyny:
                    misogyny_score += 0.7  # Very high weight
                elif word in ['tits', 'pussy']:
                    misogyny_score += 0.5  # High weight
                else:
                    misogyny_score += 0.3  # Medium weight
        
        # Special pattern detection for violent threats
        if 'rape' in text_lower or ('fuck' in text_lower and 'you' in text_lower):
            harassment_score = max(harassment_score, 0.85)
            
        if 'rape' in text_lower and any(x in text_lower for x in ['you', 'woman', 'girl']):
            misogyny_score = max(misogyny_score, 0.9)
        
        # Ensure scores are between 0 and 1
        harassment_score = max(0, min(1, harassment_score))
        misogyny_score = max(0, min(1, misogyny_score))
        
        # Calculate combined score
        combined_score = max(harassment_score, misogyny_score)
        
        # Determine labels
        harassment_label = 'toxic' if harassment_score > threshold else 'non-toxic'
        misogyny_label = 'toxic' if misogyny_score > threshold else 'non-toxic'
        is_toxic = harassment_score > threshold or misogyny_score > threshold
        
        # Determine risk level
        if combined_score < 0.3:
            risk_level = 'low'
        elif combined_score < 0.6:
            risk_level = 'medium'
        elif combined_score < 0.8:
            risk_level = 'high'
        else:
            risk_level = 'critical'
            
        # Determine flagged categories
        flagged_categories = []
        if harassment_score > threshold:
            flagged_categories.append('harassment')
        if misogyny_score > threshold:
            flagged_categories.append('misogyny')
            
        result = {
            'text': text,
            'predictions': {
                'harassment': {
                    'label': harassment_label,
                    'confidence': harassment_score,
                    'threshold': threshold
                },
                'misogyny': {
                    'label': misogyny_label,
                    'confidence': misogyny_score,
                    'threshold': threshold
                }
            },
            'toxicity_scores': {
                'harassment': harassment_score,
                'misogyny': misogyny_score,
                'combined': combined_score
            },
            'is_toxic': is_toxic,
            'riskLevel': risk_level,
            'flagged_categories': flagged_categories
        }
        
        if include_details:
            result['explanation'] = f"Mock analysis detected {len(flagged_categories)} potential issues"
            
        return result
        
    def predict_batch(self, texts: List[str], threshold: float = 0.5, include_statistics: bool = True) -> Dict:
        """Mock batch prediction."""
        results = []
        processing_start = time.time()
        
        for text in texts:
            # Get direct result format (no wrapper)
            result_data = self.predict_single(text, threshold, include_details=True)
            results.append(result_data)
            
        processing_time = (time.time() - processing_start) * 1000
        
        response = {'results': results}
        
        if include_statistics:
            toxic_count = sum(1 for r in results if r['is_toxic'])
            risk_counts = {}
            for r in results:
                risk = r['riskLevel']
                risk_counts[risk] = risk_counts.get(risk, 0) + 1
                
            response['statistics'] = {
                'total_comments': len(results),
                'toxic_comments': toxic_count,
                'average_toxicity': sum(r['toxicity_scores']['combined'] for r in results) / len(results),
                'risk_distribution': risk_counts,
                'processing_time': processing_time
            }
            
        return response
        
    def get_batch_statistics(self, results: List[Dict]) -> Dict:
        """Generate statistics for batch analysis results."""
        if not results:
            return {
                'total_comments': 0,
                'toxic_comments': 0,
                'safe_comments': 0,
                'toxicity_rate': 0.0,
                'average_harassment_score': 0.0,
                'average_misogyny_score': 0.0,
                'risk_distribution': {'low': 0, 'medium': 0, 'high': 0, 'critical': 0}
            }
        
        total = len(results)
        toxic_count = sum(1 for r in results if r['is_toxic'])
        safe_count = total - toxic_count
        
        avg_harassment = sum(r['toxicity_scores']['harassment'] for r in results) / total
        avg_misogyny = sum(r['toxicity_scores']['misogyny'] for r in results) / total
        
        risk_counts = {'low': 0, 'medium': 0, 'high': 0, 'critical': 0}
        for r in results:
            risk_counts[r['riskLevel']] += 1
        
        return {
            'total_comments': total,
            'toxic_comments': toxic_count,
            'safe_comments': safe_count,
            'toxicity_rate': toxic_count / total if total > 0 else 0.0,
            'average_harassment_score': round(avg_harassment, 3),
            'average_misogyny_score': round(avg_misogyny, 3),
            'risk_distribution': risk_counts
        }
        
    def filter_toxic_comments(self, texts: List[str], threshold: float = 0.5, filter_type: str = 'all') -> Dict:
        """Mock toxic comment filtering."""
        batch_result = self.predict_batch(texts, threshold, include_statistics=True)
        
        filtered_results = []
        for result in batch_result['results']:
            if filter_type == 'all' and result['is_toxic']:
                filtered_results.append(result)
            elif filter_type == 'harassment' and 'harassment' in result['flagged_categories']:
                filtered_results.append(result)
            elif filter_type == 'misogyny' and 'misogyny' in result['flagged_categories']:
                filtered_results.append(result)
                
        return {
            'total_comments': len(texts),
            'toxic_comments': len(filtered_results),
            'filtered_results': filtered_results,
            'statistics': batch_result['statistics']
        }
        
    def get_models_info(self) -> Dict:
        """Return mock model information."""
        return {
            'harassment_model': {
                'name': 'mock-roberta-harassment-v1.0',
                'version': '1.0.0',
                'accuracy': 0.94,
                'last_trained': '2024-01-15'
            },
            'misogyny_model': {
                'name': 'mock-roberta-misogyny-v1.0', 
                'version': '1.0.0',
                'accuracy': 0.91,
                'last_trained': '2024-01-20'
            },
            'toxicity_weights': {
                'harassment': TOXICITY_WEIGHTS['harassment_weight'],
                'misogyny': TOXICITY_WEIGHTS['misogyny_weight']
            },
            'models_loaded': self.models_loaded,
            'mock_mode': True
        }


# Global predictor instance for testing
_mock_predictor = None

def get_predictor():
    """Get the mock predictor instance."""
    global _mock_predictor
    if _mock_predictor is None:
        _mock_predictor = MockToxicityPredictor()
        _mock_predictor.load_models()
    return _mock_predictor
