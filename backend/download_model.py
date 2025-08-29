#!/usr/bin/env python3
"""
Download the MakeItColor model for image colorization
"""

import os
from huggingface_hub import snapshot_download

def download_model():
    MODEL_DIR = './makeitcolor'
    
    print("Downloading MakeItColor model...")
    print(f"Target directory: {os.path.abspath(MODEL_DIR)}")
    
    try:
        # Download model files
        snapshot_download(
            repo_id="muhammadnoman76/makeitcolor", 
            local_dir=MODEL_DIR, 
            repo_type="model"
        )
        print("✅ Model downloaded successfully!")
        
        # List downloaded files
        print("\nDownloaded files:")
        for root, dirs, files in os.walk(MODEL_DIR):
            for file in files:
                print(f"  {os.path.join(root, file)}")
                
    except Exception as e:
        print(f"❌ Download failed: {e}")
        return False
    
    return True

if __name__ == "__main__":
    download_model()