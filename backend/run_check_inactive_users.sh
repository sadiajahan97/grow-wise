#!/bin/bash

# Change to the backend directory
cd /Users/sadiaiffatjahan/Desktop/ACI/grow-wise/backend

# Activate virtual environment
source venv/bin/activate

# Run the management command
python manage.py check_inactive_users

# Deactivate virtual environment
deactivate

