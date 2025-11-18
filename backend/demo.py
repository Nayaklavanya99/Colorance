import os
from huggingface_hub import snapshot_download

def download_model():
    MODEL_DIR = './makeitcolor'
    
    # Download model if not exists
    if not os.path.exists(MODEL_DIR):
        print("Downloading model...")
        snapshot_download(
            repo_id="muhammadnoman76/makeitcolor", 
            local_dir=MODEL_DIR, 
            repo_type="model"
        )
        print("Model downloaded successfully")
    else:
        print("Model directory exists")

if __name__ == "__main__":
    download_model()