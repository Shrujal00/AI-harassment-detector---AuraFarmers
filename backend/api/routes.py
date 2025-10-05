from flask import Blueprint, request, jsonify
from typing import Dict, List
import traceback
import uuid
import io
import csv
import os
from werkzeug.utils import secure_filename

# Try to use real predictor, fallback to mock predictor
try:
    from api.predictor import ToxicityPredictor
    USE_REAL_PREDICTOR = True
    print("Real predictor available - will attempt to load trained models")
except ImportError:
    USE_REAL_PREDICTOR = False
    print("Using mock predictor for testing...")

from api.mock_predictor import MockToxicityPredictor

api = Blueprint('api', __name__)

predictor = None

def initialize_predictor():
    """Initialize the predictor (called when app starts)."""
    global predictor
    
    # Try to load real models first
    if USE_REAL_PREDICTOR:
        try:
            print("Attempting to load real trained models...")
            predictor = ToxicityPredictor()
            predictor.load_models()
            print("✅ Real models loaded successfully!")
            return True
        except Exception as e:
            print(f"❌ Failed to load real models: {e}")
            print("🔄 Falling back to mock predictor...")
    
    # Fallback to mock predictor
    try:
        print("Loading mock predictor...")
        predictor = MockToxicityPredictor()
        predictor.load_models()
        print("✅ Mock predictor loaded successfully!")
        return True
    except Exception as e:
        print(f"❌ Error initializing mock predictor: {e}")
        return False


@api.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'models_loaded': predictor is not None and predictor.models_loaded
    }), 200


@api.route('/models/info', methods=['GET'])
def get_models_info():
    """Get information about the loaded models."""
    try:
        if predictor is None:
            return jsonify({
                'error': 'Models not initialized'
            }), 503
        
        info = predictor.get_models_info()
        return jsonify(info), 200
    
    except Exception as e:
        return jsonify({
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500


@api.route('/analyze', methods=['POST'])
def analyze_single():
    """
    Analyze a single comment for harassment and misogyny.
    
    Request body:
    {
        "text": "comment text to analyze"
    }
    
    Response:
    {
        "text": "original comment",
        "harassment_score": 0.85,
        "misogyny_score": 0.72,
        "combined_toxicity_score": 0.794,
        "is_harassment": true,
        "is_misogyny": true,
        "is_toxic": true,
        "risk_level": "high",
        "details": {...}
    }
    """
    try:
        if predictor is None:
            return jsonify({
                'error': 'Models not initialized. Please ensure models are trained and available.'
            }), 503
        
        
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({
                'error': 'Missing required field: text'
            }), 400
        
        text = data['text']
        
        if not isinstance(text, str) or len(text.strip()) == 0:
            return jsonify({
                'error': 'Text must be a non-empty string'
            }), 400
        
        
        result = predictor.predict_single(text)
        
        return jsonify(result), 200
    
    except Exception as e:
        return jsonify({
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500


@api.route('/analyze/batch', methods=['POST'])
def analyze_batch():
    """
    Analyze multiple comments for harassment and misogyny.
    
    Request body:
    {
        "texts": ["comment 1", "comment 2", ...],
        "include_statistics": true  // optional, default: false
    }
    
    Response:
    {
        "results": [
            {
                "text": "comment 1",
                "harassment_score": 0.85,
                ...
            },
            ...
        ],
        "statistics": {  // only if include_statistics is true
            "total_comments": 10,
            "toxic_comments": 3,
            ...
        }
    }
    """
    try:
        if predictor is None:
            return jsonify({
                'error': 'Models not initialized. Please ensure models are trained and available.'
            }), 503
        
       
        data = request.get_json()
        
        if not data or 'texts' not in data:
            return jsonify({
                'error': 'Missing required field: texts'
            }), 400
        
        texts = data['texts']
        include_statistics = data.get('include_statistics', False)
        
        if not isinstance(texts, list):
            return jsonify({
                'error': 'texts must be a list of strings'
            }), 400
        
        if len(texts) == 0:
            return jsonify({
                'error': 'texts list cannot be empty'
            }), 400
        
        if len(texts) > 100:
            return jsonify({
                'error': 'Maximum 100 texts allowed per batch request'
            }), 400
        
        
        for i, text in enumerate(texts):
            if not isinstance(text, str) or len(text.strip()) == 0:
                return jsonify({
                    'error': f'Text at index {i} is invalid (must be non-empty string)'
                }), 400
        
       
        results = predictor.predict_batch(texts)
        
        response = {
            'results': results
        }
        
        
        if include_statistics:
            stats = predictor.get_batch_statistics(results)
            response['statistics'] = stats
        
        return jsonify(response), 200
    
    except Exception as e:
        return jsonify({
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500


@api.route('/analyze/filter', methods=['POST'])
def filter_toxic_comments():
    """
    Filter comments based on toxicity threshold.
    
    Request body:
    {
        "texts": ["comment 1", "comment 2", ...],
        "threshold": 0.5,  // optional, default: 0.5
        "filter_type": "all"  // optional: "all", "harassment", "misogyny"
    }
    
    Response:
    {
        "total_comments": 10,
        "toxic_comments": 3,
        "filtered_results": [
            {
                "index": 2,
                "text": "toxic comment",
                "combined_toxicity_score": 0.85,
                ...
            }
        ]
    }
    """
    try:
        if predictor is None:
            return jsonify({
                'error': 'Models not initialized'
            }), 503
        
        data = request.get_json()
        
        if not data or 'texts' not in data:
            return jsonify({
                'error': 'Missing required field: texts'
            }), 400
        
        texts = data['texts']
        threshold = data.get('threshold', 0.5)
        filter_type = data.get('filter_type', 'all')
        
        if not isinstance(texts, list) or len(texts) == 0:
            return jsonify({
                'error': 'texts must be a non-empty list'
            }), 400
        
        if not 0 <= threshold <= 1:
            return jsonify({
                'error': 'threshold must be between 0 and 1'
            }), 400
        
        if filter_type not in ['all', 'harassment', 'misogyny']:
            return jsonify({
                'error': 'filter_type must be one of: all, harassment, misogyny'
            }), 400
        
        
        results = predictor.predict_batch(texts)
        
        
        filtered_results = []
        for i, result in enumerate(results):
            is_toxic = False
            
            if filter_type == 'all':
                is_toxic = result['combined_toxicity_score'] >= threshold
            elif filter_type == 'harassment':
                is_toxic = result['harassment_score'] >= threshold
            elif filter_type == 'misogyny':
                is_toxic = result['misogyny_score'] >= threshold
            
            if is_toxic:
                result['index'] = i
                filtered_results.append(result)
        
        return jsonify({
            'total_comments': len(texts),
            'toxic_comments': len(filtered_results),
            'threshold': threshold,
            'filter_type': filter_type,
            'filtered_results': filtered_results
        }), 200
    
    except Exception as e:
        return jsonify({
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500


@api.route('/train', methods=['POST'])
def train_models():
    """
    Endpoint to trigger model training on the dataset.
    
    Request body: Empty or can contain optional parameters
    
    Response:
    {
        "success": true,
        "message": "Model training initiated"
    }
    """
    try:
        # In a real implementation, this would trigger the training process
        # For now, we'll just return success
        import subprocess
        import os
        import threading
        
        def run_training():
            # Get the directory of the current file
            current_dir = os.path.dirname(os.path.abspath(__file__))
            
            # Go up one directory to get to the backend folder
            backend_dir = os.path.dirname(current_dir)
            
            # Run the training scripts using the proper Python module path
            # This ensures imports work correctly
            subprocess.run(["python", "-m", "training.train_harassment_model"], 
                          check=True, cwd=backend_dir)
            subprocess.run(["python", "-m", "training.train_misogyny_model"], 
                          check=True, cwd=backend_dir)
        
        # Start the training in a background thread so it doesn't block the API
        thread = threading.Thread(target=run_training)
        thread.daemon = True
        thread.start()
        
        return jsonify({
            'success': True,
            'message': 'Model training initiated'
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500


@api.errorhandler(404)
def not_found(error):
    """Handle 404 errors."""
    return jsonify({
        'error': 'Endpoint not found',
        'message': 'The requested endpoint does not exist'
    }), 404


@api.errorhandler(405)
def method_not_allowed(error):
    """Handle 405 errors."""
    return jsonify({
        'error': 'Method not allowed',
        'message': 'The HTTP method is not allowed for this endpoint'
    }), 405


# File upload handling
ALLOWED_EXTENSIONS = {'csv', 'txt'}

def allowed_file(filename):
    """Check if the file has an allowed extension."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@api.route('/analyze/file', methods=['POST', 'OPTIONS'])
def analyze_file():
    """
    Process uploaded file for batch analysis.
    
    Expected: form-data with a 'file' field containing a CSV or TXT file
    
    Response:
    {
        "jobId": "unique-job-id",
        "filename": "secure-filename.csv",
        "totalTexts": 100,
        "estimatedTime": 10.5,
        "status": "queued"
    }
    """
    try:
        # For OPTIONS requests (preflight), return OK
        if request.method == 'OPTIONS':
            return '', 200
            
        # Check if file was uploaded
        if 'file' not in request.files:
            return jsonify({
                'error': 'No file part in the request'
            }), 400
        
        file = request.files['file']
        
        # Check if file is empty
        if file.filename == '':
            return jsonify({
                'error': 'No file selected'
            }), 400
        
        # Check if file extension is allowed
        if not allowed_file(file.filename):
            return jsonify({
                'error': 'File type not allowed. Please upload a CSV or TXT file.'
            }), 400
        
        # Generate a secure filename
        filename = secure_filename(file.filename)
        
        # Process in memory to count lines/texts
        texts = []
        if filename.endswith('.csv'):
            # Read CSV file
            stream = io.StringIO(file.stream.read().decode("UTF-8"), newline=None)
            csv_reader = csv.reader(stream)
            header = next(csv_reader, None)  # Skip header
            for row in csv_reader:
                if row and len(row) > 0:
                    texts.append(row[0])  # Assuming text is in first column
        else:
            # Read TXT file
            stream = io.StringIO(file.stream.read().decode("UTF-8"))
            texts = [line.strip() for line in stream.readlines() if line.strip()]
        
        # Generate a job ID
        job_id = str(uuid.uuid4())
        
        # In a real app, you would:
        # 1. Save the job info to a database
        # 2. Start a background task to process the texts
        # 3. Provide an endpoint to check job status
        
        # For now, we'll simulate this and store job info in memory
        # Note: In production, use a database or Redis for persistence
        import datetime
        if not hasattr(analyze_file, 'jobs'):
            analyze_file.jobs = {}
            
        analyze_file.jobs[job_id] = {
            'jobId': job_id,
            'filename': filename,
            'totalTexts': len(texts),
            'texts': texts,
            'status': 'queued',
            'progress': 0,
            'createdAt': datetime.datetime.now().isoformat()
        }
        return jsonify({
            'jobId': job_id,
            'filename': filename,
            'totalTexts': len(texts),
            'estimatedTime': len(texts) * 0.1,  # Simple estimate: 0.1 seconds per text
            'status': 'queued'
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500


@api.route('/jobs/<job_id>', methods=['GET'])
def get_job_status(job_id):
    """
    Check the status of a file analysis job.
    
    Response:
    {
        "jobId": "unique-job-id",
        "status": "processing",
        "progress": 45,
        "results": [...], // only if completed
        "createdAt": "2023-01-01T12:00:00.000Z",
        "completedAt": "2023-01-01T12:05:00.000Z" // only if completed
    }
    """
    try:
        # If jobs dictionary doesn't exist, create it
        if not hasattr(analyze_file, 'jobs'):
            analyze_file.jobs = {}
            
        if job_id not in analyze_file.jobs:
            return jsonify({
                'error': 'Job not found'
            }), 404
        
        job = analyze_file.jobs[job_id]
        
        # Simulate processing logic
        # In a real app, this would check a database or task queue
        import random
        import time
        import datetime
        
        if job['status'] == 'queued':
            # Move to processing after a short delay
            if random.random() < 0.8:  # 80% chance to start processing
                job['status'] = 'processing'
                job['progress'] = 5
        
        elif job['status'] == 'processing':
            # Increment progress
            if job['progress'] < 100:
                job['progress'] += random.randint(5, 20)
                
                # Cap at 100
                if job['progress'] >= 100:
                    job['progress'] = 100
                    job['status'] = 'completed'
                    job['completedAt'] = datetime.datetime.now().isoformat()
                    
                    # Generate fake results for completed job
                    # In a real app, these would be actual analysis results
                    job['results'] = []
                    for i, text in enumerate(job['texts']):
                        if i >= 50:  # Limit to 50 results for demo
                            break
                            
                        # Generate fake toxicity scores
                        harassment_score = random.random()
                        misogyny_score = random.random()
                        combined_score = 0.6 * harassment_score + 0.4 * misogyny_score
                        
                        job['results'].append({
                            'text': text,
                            'result': {
                                'harassment_score': harassment_score,
                                'misogyny_score': misogyny_score, 
                                'toxicity_score': combined_score,
                                'is_toxic': combined_score > 0.7,
                                'is_harassment': harassment_score > 0.7,
                                'flagged_categories': ['harassment'] if harassment_score > 0.7 else []
                            }
                        })
                        
                    # Add statistics
                    job['statistics'] = {
                        'total_comments': len(job['texts']),
                        'toxic_comments': sum(1 for r in job['results'] if r['result'].get('is_toxic', False)),
                        'average_toxicity': sum(r['result'].get('toxicity_score', 0) for r in job['results']) / len(job['results']) if job['results'] else 0
                    }
        
        # Don't include the raw texts in the response
        response_data = {k: v for k, v in job.items() if k != 'texts'}
        return jsonify(response_data), 200
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500


@api.route('/jobs/<job_id>/download', methods=['GET'])
def download_job_results(job_id):
    """
    Download the results of a completed job as CSV.
    """
    try:
        if not hasattr(analyze_file, 'jobs') or job_id not in analyze_file.jobs:
            return jsonify({'error': 'Job not found'}), 404
            
        job = analyze_file.jobs[job_id]
        
        if job['status'] != 'completed' or 'results' not in job:
            return jsonify({'error': 'Results not available yet'}), 400
            
        # Create CSV in memory
        import io
        import csv
        from flask import Response
        
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write header
        writer.writerow(['Text', 'Harassment Score', 'Misogyny Score', 'Toxicity Score', 'Is Toxic', 'Flagged Categories'])
        
        # Write data rows
        for result in job['results']:
            writer.writerow([
                result['text'],
                result['result']['harassment_score'],
                result['result']['misogyny_score'],
                result['result']['toxicity_score'],
                'Yes' if result['result']['is_toxic'] else 'No',
                ', '.join(result['result']['flagged_categories']) if result['result']['flagged_categories'] else 'None'
            ])
            
        # Return CSV file
        output.seek(0)
        return Response(
            output.getvalue(),
            mimetype="text/csv",
            headers={"Content-Disposition": f"attachment;filename=analysis_results_{job_id}.csv"}
        )
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500


@api.errorhandler(500)
def internal_error(error):
    """Handle 500 errors."""
    return jsonify({
        'error': 'Internal server error',
        'message': 'An unexpected error occurred'
    }), 500