import torch
import torch.nn as nn
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from typing import List, Dict
import numpy as np

class RoBERTaToxicityClassifier:
    """
    Base RoBERTa model for toxicity classification (harassment/misogyny detection).
    """
    
    def __init__(self, model_name: str = "roberta-base", max_length: int = 256):
        """
        Initialize RoBERTa classifier.
        
        Args:
            model_name: HuggingFace model name or path
            max_length: Maximum sequence length
        """
        self.model_name = model_name
        self.max_length = max_length
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        
        print(f"Using device: {self.device}")
        print(f"Loading model: {model_name}")
        
        
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = None  # Will be initialized during training or loading
        
    def create_model(self, num_labels: int = 2):
        """Create or reset the model for training."""
        self.model = AutoModelForSequenceClassification.from_pretrained(
            self.model_name,
            num_labels=num_labels,
            problem_type="single_label_classification"
        )
        self.model.to(self.device)
        return self.model
    
    def tokenize_texts(self, texts: List[str], padding: bool = True, truncation: bool = True):
        """
        Tokenize input texts.
        
        Args:
            texts: List of text strings
            padding: Whether to pad sequences
            truncation: Whether to truncate sequences
            
        Returns:
            Tokenized inputs ready for model
        """
        return self.tokenizer(
            texts,
            padding=padding,
            truncation=truncation,
            max_length=self.max_length,
            return_tensors="pt"
        )
    
    def predict(self, texts: List[str], batch_size: int = 16) -> Dict:
        """
        Make predictions on texts.
        
        Args:
            texts: List of text strings
            batch_size: Batch size for inference
            
        Returns:
            Dictionary with predictions, probabilities, and toxicity scores
        """
        if self.model is None:
            raise ValueError("Model not loaded. Call load_model() first.")
        
        self.model.eval()
        all_predictions = []
        all_probabilities = []
        
        with torch.no_grad():
            for i in range(0, len(texts), batch_size):
                batch_texts = texts[i:i + batch_size]
                
                
                inputs = self.tokenize_texts(batch_texts)
                inputs = {k: v.to(self.device) for k, v in inputs.items()}
                
                
                outputs = self.model(**inputs)
                logits = outputs.logits
                
               
                probabilities = torch.softmax(logits, dim=-1)
                predictions = torch.argmax(probabilities, dim=-1)
                
                all_predictions.extend(predictions.cpu().numpy())
                all_probabilities.extend(probabilities.cpu().numpy())
        
        all_predictions = np.array(all_predictions)
        all_probabilities = np.array(all_probabilities)
        
        
        toxicity_scores = all_probabilities[:, 1]
        
        results = {
            "predictions": all_predictions.tolist(),
            "probabilities": all_probabilities.tolist(),
            "toxicity_scores": toxicity_scores.tolist()
        }
        
        return results
    
    def predict_single(self, text: str) -> Dict:
        """
        Predict on a single text.
        
        Args:
            text: Input text string
            
        Returns:
            Dictionary with prediction, probability, and toxicity score
        """
        results = self.predict([text])
        
        return {
            "prediction": results["predictions"][0],
            "probability": results["probabilities"][0],
            "toxicity_score": results["toxicity_scores"][0]
        }
    
    def save_model(self, save_path: str):
        """Save model and tokenizer."""
        if self.model is None:
            raise ValueError("No model to save.")
        
        print(f"Saving model to {save_path}")
        self.model.save_pretrained(save_path)
        self.tokenizer.save_pretrained(save_path)
        
        
        config = {
            "model_name": self.model_name,
            "max_length": self.max_length,
            "model_type": "roberta" if "roberta" in self.model_name else "bert"
        }
        
        import json
        with open(f"{save_path}/model_config.json", "w") as f:
            json.dump(config, f)
        
        print("Model saved successfully")
    
    def load_model(self, load_path: str):
        """Load model and tokenizer from path."""
        print(f"Loading model from {load_path}")
        
        if load_path is None:
            raise ValueError("Model load_path cannot be None")
        
        import json
        import os
        
        # First check for our custom config
        try:
            config_path = os.path.join(load_path, "model_config.json")
            if os.path.exists(config_path):
                with open(config_path, "r") as f:
                    config = json.load(f)
                self.model_name = config.get("model_name", self.model_name)
                self.max_length = config.get("max_length", self.max_length)
                print(f"Loaded custom config: {config}")
            else:
                print(f"No custom config file found at {config_path}, using defaults")
        except Exception as e:
            print(f"Warning: Could not load custom config: {e}")
        
        # Check and fix the HuggingFace config.json if needed
        try:
            hf_config_path = os.path.join(load_path, "config.json")
            if os.path.exists(hf_config_path):
                with open(hf_config_path, "r") as f:
                    hf_config = json.load(f)
                
                # Add model_type if missing
                if "model_type" not in hf_config:
                    print("Adding missing model_type to config.json")
                    model_type = "roberta" if "roberta" in self.model_name else "bert"
                    hf_config["model_type"] = model_type
                    with open(hf_config_path, "w") as f:
                        json.dump(hf_config, f, indent=2)
                print(f"HuggingFace config has model_type: {hf_config.get('model_type')}")
            else:
                raise FileNotFoundError(f"HuggingFace config.json not found at {hf_config_path}")
        except Exception as e:
            print(f"Warning: Could not process HuggingFace config: {e}")
            raise
        
        print("Loading tokenizer...")
        try:
            # Create empty added_tokens.json if it doesn't exist
            added_tokens_path = os.path.join(load_path, "added_tokens.json")
            if not os.path.exists(added_tokens_path):
                print(f"Creating empty added_tokens.json file at {added_tokens_path}")
                with open(added_tokens_path, "w") as f:
                    f.write("{}")
            
            # Try loading with ignore_mismatched_sizes in case the vocab size doesn't match
            self.tokenizer = AutoTokenizer.from_pretrained(
                load_path, 
                use_fast=True
            )
        except Exception as e:
            print(f"Error loading tokenizer: {e}")
            print("Falling back to base model tokenizer")
            try:
                self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
            except Exception as e2:
                print(f"Error loading fallback tokenizer: {e2}")
                raise
            
        print("Loading model...")
        try:
            self.model = AutoModelForSequenceClassification.from_pretrained(
                load_path,
                ignore_mismatched_sizes=True,
                num_labels=2
            )
            self.model.to(self.device)
            self.model.eval()
        except Exception as e:
            print(f"Error loading model: {e}")
            raise
        
        print("Model loaded successfully")
    
    def get_model_info(self) -> Dict:
        """Get information about the model."""
        info = {
            "model_name": self.model_name,
            "max_length": self.max_length,
            "device": str(self.device),
            "vocab_size": len(self.tokenizer),
            "model_loaded": self.model is not None
        }
        
        if self.model is not None:
            info["num_parameters"] = sum(p.numel() for p in self.model.parameters())
            info["trainable_parameters"] = sum(
                p.numel() for p in self.model.parameters() if p.requires_grad
            )
        
        return info


class ToxicityDataset(torch.utils.data.Dataset):
    """Custom dataset for toxicity classification."""
    
    def __init__(self, texts: List[str], labels: List[int], tokenizer, max_length: int):
        self.texts = texts
        self.labels = labels
        self.tokenizer = tokenizer
        self.max_length = max_length
    
    def __len__(self):
        return len(self.texts)
    
    def __getitem__(self, idx):
        text = str(self.texts[idx])
        label = self.labels[idx]
        
        encoding = self.tokenizer(
            text,
            padding='max_length',
            truncation=True,
            max_length=self.max_length,
            return_tensors='pt'
        )
        
        return {
            'input_ids': encoding['input_ids'].flatten(),
            'attention_mask': encoding['attention_mask'].flatten(),
            'labels': torch.tensor(label, dtype=torch.long)
        }


if __name__ == "__main__":
    
    print("Testing RoBERTa Toxicity Classifier...")
    
    classifier = RoBERTaToxicityClassifier()
    print("\nModel Info:")
    info = classifier.get_model_info()
    for key, value in info.items():
        print(f"{key}: {value}")
    
    #  tokenization
    texts = ["This is a test comment", "Another test"]
    tokens = classifier.tokenize_texts(texts)
    print(f"\nTokenized {len(texts)} texts")
    print(f"Input IDs shape: {tokens['input_ids'].shape}")