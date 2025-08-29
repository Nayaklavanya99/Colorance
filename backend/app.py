import os
import cv2
import numpy as np
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import base64
from pymongo import MongoClient
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from dotenv import load_dotenv
from datetime import timedelta
import traceback

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# JWT Configuration
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'default_secret_key')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=1)
jwt = JWTManager(app)
bcrypt = Bcrypt(app)

# In-memory storage as fallback
users_db = {}
images_db = []

# MongoDB Connection
try:
    mongo_uri = os.getenv('MONGO_URI')
    print(f"Connecting to MongoDB...")
    
    # Simple connection without SSL config
    mongo_client = MongoClient(mongo_uri)
    
    # Test connection with shorter timeout
    mongo_client.admin.command('ping')
    db = mongo_client[os.getenv('DATABASE_NAME', 'colorance_db')]
    users_collection = db.users
    images_collection = db.images
    print("MongoDB connected successfully")
    USE_MONGODB = True
except Exception as e:
    print(f"MongoDB connection failed: {str(e)[:100]}...")
    print("Using in-memory storage instead")
    db = None
    users_collection = None
    images_collection = None
    USE_MONGODB = False

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
        traceback.print_exc()
        img_colorization = None

# Initialize model on startup
print("App starting...")
initialize_model()

# User Authentication Routes
@app.route('/api/register', methods=['POST'])
def register():
    try:
        print("Registration attempt...")
        data = request.get_json()
        print(f"Registration data received: {data}")
        
        # Check if required fields are present
        if not data or not data.get('email') or not data.get('password') or not data.get('name'):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Check if user already exists
        if USE_MONGODB:
            if users_collection.find_one({'email': data['email']}):
                return jsonify({'error': 'User already exists'}), 409
        else:
            if data['email'] in users_db:
                return jsonify({'error': 'User already exists'}), 409
        
        # Hash password
        hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
        
        # Create user document
        user = {
            'name': data['name'],
            'email': data['email'],
            'password': hashed_password,
            'created_at': np.datetime64('now').astype(str)
        }
        
        # Insert user into database
        if USE_MONGODB:
            users_collection.insert_one(user)
            print(f"User saved to MongoDB: {data['email']}")
        else:
            users_db[data['email']] = user
            print(f"User saved to in-memory storage: {data['email']}")
            print(f"Total users in memory: {len(users_db)}")
        
        # Create access token
        access_token = create_access_token(identity=data['email'])
        
        print(f"User registered successfully: {data['email']}")
        
        return jsonify({
            'message': 'User registered successfully',
            'token': access_token,
            'user': {
                'name': user['name'],
                'email': user['email']
            }
        }), 201
        
    except Exception as e:
        print(f"Registration error: {e}")
        traceback.print_exc()
        return jsonify({'error': 'Registration failed'}), 500

@app.route('/api/login', methods=['POST'])
def login():
    try:
        print("Login attempt...")
        data = request.get_json()
        print(f"Login data received: {data}")
        
        # Check if required fields are present
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Missing email or password'}), 400
        
        # Find user
        if USE_MONGODB:
            user = users_collection.find_one({'email': data['email']})
            print(f"MongoDB lookup for: {data['email']}")
        else:
            user = users_db.get(data['email'])
            print(f"In-memory lookup for: {data['email']}, found: {user is not None}")
            print(f"Available users: {list(users_db.keys())}")
        
        # Check if user exists and password is correct
        if not user:
            print(f"Login failed: User not found - {data['email']}")
            return jsonify({'error': 'Invalid email or password'}), 401
        
        if not bcrypt.check_password_hash(user['password'], data['password']):
            print(f"Login failed: Incorrect password for {data['email']}")
            return jsonify({'error': 'Invalid email or password'}), 401
        
        # Create access token
        access_token = create_access_token(identity=data['email'])
        
        print(f"User logged in successfully: {data['email']}")
        
        return jsonify({
            'message': 'Login successful',
            'token': access_token,
            'user': {
                'name': user['name'],
                'email': user['email']
            }
        }), 200
        
    except Exception as e:
        print(f"Login error: {e}")
        return jsonify({'error': 'Login failed'}), 500

@app.route('/api/user', methods=['GET'])
@jwt_required()
def get_user():
    try:
        # Get user email from token
        email = get_jwt_identity()
        print(f"User data requested for: {email}")
        
        # Find user
        if USE_MONGODB:
            user = users_collection.find_one({'email': email})
        else:
            user = users_db.get(email)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'user': {
                'name': user['name'],
                'email': user['email']
            }
        }), 200
        
    except Exception as e:
        print(f"Get user error: {e}")
        return jsonify({'error': 'Failed to get user data'}), 500

# Image Colorization Route
@app.route('/api/colorize', methods=['POST'])
def colorize_image():
    # Check if user is authenticated (optional)
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    user_email = None
    
    if token:
        try:
            from flask_jwt_extended import decode_token
            user_email = decode_token(token)['sub']
        except:
            pass
    
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
            
            # Save image record to database if user is authenticated
            if user_email:
                image_record = {
                    'user_email': user_email,
                    'original_filename': file.filename,
                    'colorized_filename': f"colored_{file.filename}",
                    'created_at': np.datetime64('now').astype(str)
                }
                
                if USE_MONGODB and db is not None:
                    images_collection.insert_one(image_record)
                else:
                    images_db.append(image_record)
            
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
        traceback.print_exc()
        return jsonify({'error': f'Processing failed: {str(e)}'}), 500

@app.route('/api/download/<filename>', methods=['GET'])
def download_file(filename):
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    if not os.path.exists(file_path):
        return jsonify({'error': 'File not found'}), 404
    return send_file(file_path, as_attachment=True)

# User's Image History
@app.route('/api/images/history', methods=['GET'])
@jwt_required()
def get_image_history():
    try:
        # Get user email from token
        email = get_jwt_identity()
        
        # Get user's images
        if USE_MONGODB:
            images = list(images_collection.find({'user_email': email}).sort('created_at', -1))
        else:
            images = [img for img in images_db if img.get('user_email') == email]
            images.sort(key=lambda x: x.get('created_at', ''), reverse=True)
        
        # Format images for response
        image_history = []
        for img in images:
            original_path = os.path.join(UPLOAD_FOLDER, img['original_filename'])
            colorized_path = os.path.join(UPLOAD_FOLDER, img['colorized_filename'])
            
            if os.path.exists(original_path) and os.path.exists(colorized_path):
                # Convert images to base64
                with open(original_path, "rb") as img_file:
                    original_data = base64.b64encode(img_file.read()).decode('utf-8')
                
                with open(colorized_path, "rb") as img_file:
                    colorized_data = base64.b64encode(img_file.read()).decode('utf-8')
                
                image_history.append({
                    'id': str(img['_id']) if USE_MONGODB else str(hash(f"{img['user_email']}{img['original_filename']}{img['created_at']}"))[1:9],
                    'original_image': original_data,
                    'colorized_image': colorized_data,
                    'original_filename': img['original_filename'],
                    'colorized_filename': img['colorized_filename'],
                    'created_at': img['created_at']
                })
        
        return jsonify({'images': image_history}), 200
        
    except Exception as e:
        print(f"Get image history error: {e}")
        return jsonify({'error': 'Failed to get image history'}), 500

@app.route('/api/images/<image_id>', methods=['DELETE'])
@jwt_required()
def delete_image(image_id):
    try:
        # Get user email from token
        email = get_jwt_identity()
        
        # Find and delete the image record
        if USE_MONGODB:
            from bson import ObjectId
            image = images_collection.find_one({'_id': ObjectId(image_id), 'user_email': email})
            if not image:
                return jsonify({'error': 'Image not found'}), 404
            
            # Delete files
            original_path = os.path.join(UPLOAD_FOLDER, image['original_filename'])
            colorized_path = os.path.join(UPLOAD_FOLDER, image['colorized_filename'])
            
            if os.path.exists(original_path):
                os.remove(original_path)
            if os.path.exists(colorized_path):
                os.remove(colorized_path)
            
            # Delete from database
            images_collection.delete_one({'_id': ObjectId(image_id), 'user_email': email})
        else:
            # Find image in memory storage
            image_to_delete = None
            for i, img in enumerate(images_db):
                img_id = str(hash(f"{img['user_email']}{img['original_filename']}{img['created_at']}"))[1:9]
                if img_id == image_id and img.get('user_email') == email:
                    image_to_delete = img
                    break
            
            if not image_to_delete:
                return jsonify({'error': 'Image not found'}), 404
            
            # Delete files
            original_path = os.path.join(UPLOAD_FOLDER, image_to_delete['original_filename'])
            colorized_path = os.path.join(UPLOAD_FOLDER, image_to_delete['colorized_filename'])
            
            if os.path.exists(original_path):
                os.remove(original_path)
            if os.path.exists(colorized_path):
                os.remove(colorized_path)
            
            # Remove from memory storage
            images_db.remove(image_to_delete)
        
        return jsonify({'message': 'Image deleted successfully'}), 200
        
    except Exception as e:
        print(f"Delete image error: {e}")
        return jsonify({'error': 'Failed to delete image'}), 500

@app.route('/api/debug/users', methods=['GET'])
def debug_users():
    return jsonify({
        'use_mongodb': USE_MONGODB,
        'users_in_memory': len(users_db),
        'user_emails': list(users_db.keys())
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)