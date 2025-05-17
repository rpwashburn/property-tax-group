#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# URLs for the data files
URL1="https://download.hcad.org/data/CAMA/2025/Real_acct_owner.zip"
URL2="https://download.hcad.org/data/CAMA/2025/Real_building_land.zip"

# Base directory for storing the data
BASE_DATA_DIR="src/lib/property-analysis/data"

# Create a timestamped folder name (e.g., 2024-07-29_15-30-00)
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
TARGET_DIR="$BASE_DATA_DIR/$TIMESTAMP"

# Create the base and target directories if they don't exist
mkdir -p "$TARGET_DIR"

echo "Created directory: $TARGET_DIR"

# Change to the target directory
cd "$TARGET_DIR"

echo "Downloading files..."

# Download the files
curl -O "$URL1"
curl -O "$URL2"

echo "Downloads complete."

echo "Extracting files..."

# Extract the zip files
# Assuming the zip files contain .txt files or similar that can be extracted directly
# If they contain folders, the extraction might need adjustment, but `unzip` usually handles it well.
unzip Real_acct_owner.zip
unzip Real_building_land.zip

echo "Extraction complete."

echo "Cleaning up zip files..."
rm Real_acct_owner.zip
rm Real_building_land.zip

echo "Cleanup complete."
echo "Data downloaded and extracted to $TARGET_DIR"

# Go back to the original directory
cd - > /dev/null

echo "Script finished successfully." 