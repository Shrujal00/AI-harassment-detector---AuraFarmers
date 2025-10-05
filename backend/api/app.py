import sys
sys.path.append('..')

from flask import Flask, jsonify
from flask_cors import CORS
import logging

# Use simple config for testing
API_CONFIG = {
    "host": "0.0.0.0",
    "port": 5000,
    "debug": True
}

from api.routes import api, initialize_predictor


logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Configure more detailed logging for errors
logging.getLogger('transformers').setLevel(logging.INFO)
logging.getLogger('torch').setLevel(logging.INFO)


def create_app():
    """Create and configure the Flask application."""
    app = Flask(__name__)
    
    
    # Configure CORS to allow requests from frontend
    CORS(app, resources={
        r"/*": {
            "origins": ["http://localhost:5173", "http://127.0.0.1:5173"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization", "X-Requested-With"]
        }
    })
    
    
    app.register_blueprint(api, url_prefix='/api')
    
    
    @app.route('/')
    def index():
        return jsonify({
            'name': 'AI-Powered Harassment & Misogyny Detector API',
            'version': '1.0.0',
            'description': 'Detect harassment and misogyny in social media comments using RoBERTa models',
            'endpoints': {
                'health': 'GET /api/health',
                'models_info': 'GET /api/models/info',
                'analyze_single': 'POST /api/analyze',
                'analyze_batch': 'POST /api/analyze/batch',
                'filter_toxic': 'POST /api/analyze/filter'
            },
            'documentation': 'See README.md for detailed API documentation'
        }), 200
    
    return app


def main():
    """Main function to run the API server."""
    print("="*70)
    print("AI-POWERED HARASSMENT & MISOGYNY DETECTOR API")
    print("="*70)
    
    
    # Initialize models with fallback
    print("\nInitializing models...")
    if not initialize_predictor():
        print("\n⚠️  WARNING: Failed to initialize any predictor!")
        print("⚠️  Server will not start properly!")
        print("\nPlease check your setup:")
        print("  1. Train models: python training/train_harassment_model.py")
        print("  2. Train models: python training/train_misogyny_model.py")
        print("  3. Or ensure mock predictor is working")
        return
    
    print("✅ Predictor initialized successfully!")
    
    
    app = create_app()
    
    
    print("\n" + "="*70)
    print("STARTING API SERVER")
    print("="*70)
    print(f"\nServer running at: http://{API_CONFIG['host']}:{API_CONFIG['port']}")
    print("\nAvailable endpoints:")
    print("  GET  /                      - API information")
    print("  GET  /api/health            - Health check")
    print("  GET  /api/models/info       - Model information")
    print("  POST /api/analyze           - Analyze single comment")
    print("  POST /api/analyze/batch     - Analyze multiple comments")
    print("  POST /api/analyze/filter    - Filter toxic comments")
    print("\nPress CTRL+C to stop the server")
    print("="*70 + "\n")
    
    
    app.run(
        host=API_CONFIG['host'],
        port=API_CONFIG['port'],
        debug=API_CONFIG['debug']
    )


if __name__ == '__main__':
    main()