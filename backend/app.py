import os
import cv2
import numpy as np
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import base64

app = Flask(__name__)
CORS(app)

# Create uploads directory if it doesn't exist
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Initialize ModelScope pipeline
img_colorization = None

def initialize_model():
    global img_colorization
    try:
        print("Starting model initialization...")
        
        from modelscope.pipelines import pipeline
        from modelscope.utils.constant import Tasks
        from huggingface_hub import snapshot_download
        
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
        
        # Initialize pipeline
        print("Initializing pipeline...")
        img_colorization = pipeline(Tasks.image_colorization, model=MODEL_DIR)
        print("Model loaded successfully!")
        
    except Exception as e:
        print(f"Model initialization failed: {e}")
        print(f"Error type: {type(e)}")
        import traceback
        traceback.print_exc()
        img_colorization = None

# Initialize model on startup
print("App starting...")
initialize_model()

@app.route('/api/colorize', methods=['POST'])
def colorize_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No image selected'}), 400
    
    # Save uploaded image
    img_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(img_path)
    
    try:
        if img_colorization is not None:
            print(f"Processing image: {img_path}")
            # Use ModelScope colorization
            result = img_colorization(img_path)
            
            # Save colorized image
            colored_path = os.path.join(UPLOAD_FOLDER, f"colored_{file.filename}")
            cv2.imwrite(colored_path, result['output_img'])
            print(f"Saved colorized image: {colored_path}")
            
        else:
            print("Model not loaded, cannot process image")
            return jsonify({'error': 'Model not loaded'}), 500
        
        # Convert to base64
        with open(colored_path, "rb") as img_file:
            img_data = base64.b64encode(img_file.read()).decode('utf-8')
        
        return jsonify({
            'colorized_image': img_data,
            'filename': f"colored_{file.filename}"
        })
        
    except Exception as e:
        print(f"Processing failed: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Processing failed: {str(e)}'}), 500

@app.route('/api/download/<filename>', methods=['GET'])
def download_file(filename):
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    if not os.path.exists(file_path):
        return jsonify({'error': 'File not found'}), 404
    return send_file(file_path, as_attachment=True)

if __name__ == '__main__':
    app.run(debug=True, port=5000)