#!/bin/bash

echo "Starting DocBrain first run setup..."

# Load models based on hardware capabilities
python3 /app/hardware_check.py

# Pull required models
MODELS=$(cat /config/models.json | jq -r '.models[]')
for model in $MODELS; do
    echo "Pulling model: $model"
    ollama pull $model
done

echo "First run setup complete!"
