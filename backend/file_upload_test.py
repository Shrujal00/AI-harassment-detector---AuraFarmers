#!/usr/bin/env python3
"""
Test file to demonstrate the upload functionality in the API.
"""

import sys
import os
import csv
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import uuid
import io

app = Flask(__name__)

ALLOWED_EXTENSIONS = {'csv', 'txt'}

def allowed_file(filename):
    """Check if the file has an allowed extension."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/api/analyze/file', methods=['POST'])
def analyze_file():
    """
    Test endpoint to simulate file upload and processing.
    
    Returns a job ID and basic file info to simulate the real process.
    """
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
    
    # Instead of saving, we'll process in memory to count lines/texts
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
    
    # In a real app, you'd start processing the file asynchronously here
    # and store the job state in a database or cache
    
    return jsonify({
        'jobId': job_id,
        'filename': filename,
        'totalTexts': len(texts),
        'estimatedTime': len(texts) * 0.1,  # Simple estimate: 0.1 seconds per text
        'status': 'queued'
    }), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)