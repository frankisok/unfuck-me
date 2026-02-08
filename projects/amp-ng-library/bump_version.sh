#!/bin/bash

# Extract current version number
current_version=$(grep -o '"version": *"[^"]*"' package.json | cut -d '"' -f 4)

# Parse the version components
major=$(echo $current_version | cut -d '.' -f 1)
minor=$(echo $current_version | cut -d '.' -f 2)
patch=$(echo $current_version | cut -d '.' -f 3)

# Increment the patch version
patch=$((patch + 1))

# Construct the new version number
new_version="$major.$minor.$patch"

# Update the version number in package.json
sed -i '' '/"version":/ s/"version": "[^"]*"/"version": "'"$new_version"'"/' package.json

echo "Version number bumped to $new_version"
