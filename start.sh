#!/bin/bash

# Activate virtual environment


# Start backend in background
cd backend   # change to your backend folder
echo "Starting backend server..."
echo "Activating virtual environment..."
source venv/Scripts/activate
python app.py --debug &

# Start frontend
cd ../frontend   # change to your frontend folder
echo "Starting frontend..."
cd frontend   # change to your frontend folder
npm start --debug
