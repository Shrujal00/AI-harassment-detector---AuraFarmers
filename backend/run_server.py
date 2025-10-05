#!/usr/bin/env python3
"""
Entry point for the Harassment Detection API server.
This script sets up the Python path and starts the Flask server.
"""

import sys
import os
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

# Now we can import our modules
from api.app import create_app, main

if __name__ == '__main__':
    print("Starting Harassment Detection API Server...")
    print(f"Backend directory: {backend_dir}")
    print(f"Python path: {sys.path[0]}")
    
    try:
        main()
    except Exception as e:
        print(f"Error starting server: {e}")
        import traceback
        traceback.print_exc()
