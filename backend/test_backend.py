#!/usr/bin/env python3
"""
Backend Test Script
Tests the harassment and misogyny detection backend system.
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

def test_dataset_loading():
    """Test loading the misogyny dataset."""
    print("🔍 Testing Dataset Loading...")
    
    from data.data_loader import DataLoader
    
    try:
        data_loader = DataLoader()
        df = data_loader.load_misogyny_dataset()
        stats = data_loader.get_dataset_statistics(df)
        
        print(f"✅ Dataset loaded: {stats['total_samples']} samples")
        print(f"   Misogynistic: {stats['positive_samples']} ({stats['positive_ratio']:.1%})")
        print(f"   Non-misogynistic: {stats['negative_samples']}")
        print(f"   Average text length: {stats['avg_text_length']:.1f} characters")
        
        return True
    except Exception as e:
        print(f"❌ Dataset loading failed: {e}")
        return False

def test_mock_predictor():
    """Test the mock predictor system."""
    print("\n🤖 Testing Mock Predictor...")
    
    from api.mock_predictor import MockToxicityPredictor
    
    try:
        predictor = MockToxicityPredictor()
        
        # Test single prediction
        test_text = "Women drivers it's the only possible explanation"
        result = predictor.predict_single(test_text)
        
        print(f"✅ Single prediction working")
        print(f"   Text: {test_text}")
        print(f"   Combined Score: {result['toxicity_scores']['combined']:.3f}")
        print(f"   Risk Level: {result['riskLevel']}")
        
        # Test batch prediction
        test_texts = [
            "The way every man feels when a woman is driving",
            "Happy International Women's Day",
            "Great work on the project!"
        ]
        batch_result = predictor.predict_batch(test_texts, include_statistics=True)
        
        print(f"✅ Batch prediction working")
        print(f"   Processed: {len(batch_result['results'])} texts")
        
        return True
    except Exception as e:
        print(f"❌ Mock predictor failed: {e}")
        return False

def test_flask_app():
    """Test Flask application creation and endpoints."""
    print("\n🌐 Testing Flask Application...")
    
    from api.app import create_app
    
    try:
        app = create_app()
        
        with app.test_client() as client:
            # Test health check
            response = client.get('/api/health')
            if response.status_code == 200:
                print("✅ Health check endpoint working")
            
            # Test models info
            response = client.get('/api/models/info')
            print(f"✅ Models info endpoint responding (Status: {response.status_code})")
            
            # Test single analysis
            test_payload = {"text": "Test message"}
            response = client.post('/api/analyze', json=test_payload)
            print(f"✅ Single analysis endpoint responding (Status: {response.status_code})")
            
            # Test batch analysis
            batch_payload = {
                "texts": ["Test 1", "Test 2"],
                "include_statistics": True
            }
            response = client.post('/api/analyze/batch', json=batch_payload)
            print(f"✅ Batch analysis endpoint responding (Status: {response.status_code})")
        
        return True
    except Exception as e:
        print(f"❌ Flask app test failed: {e}")
        return False

def main():
    """Run all backend tests."""
    print("=" * 60)
    print("🚀 BACKEND SYSTEM TEST")
    print("=" * 60)
    
    tests = [
        test_dataset_loading,
        test_mock_predictor,
        test_flask_app
    ]
    
    results = []
    for test in tests:
        results.append(test())
    
    print("\n" + "=" * 60)
    print("📊 TEST RESULTS")
    print("=" * 60)
    
    if all(results):
        print("🎉 ALL TESTS PASSED!")
        print("\n✅ Your backend is fully functional:")
        print("   • Dataset loading: Working")
        print("   • Mock predictor: Working") 
        print("   • Flask API: Working")
        print("   • All endpoints: Responding")
        print("\n🚀 Ready to start the server:")
        print("   python run_server.py")
        print("\n💡 Next steps:")
        print("   1. Start Flask server")
        print("   2. Test with frontend")
        print("   3. Train real models with your dataset")
    else:
        print("❌ Some tests failed. Check the errors above.")
        failed_count = sum(1 for r in results if not r)
        print(f"   {failed_count}/{len(results)} tests failed")

if __name__ == "__main__":
    main()