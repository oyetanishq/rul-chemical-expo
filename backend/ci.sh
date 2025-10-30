#!/bin/bash
# Usage: ./deploy.sh <version> [--deploy]

VERSION=$1
DEPLOY_FLAG=$2

if [ -z "$VERSION" ]; then
  echo "Usage: ./deploy.sh <version> [--deploy]"
  exit 1
fi

IMAGE_NAME="oyetanu/rul-prediction"
PLATFORM="linux/amd64"
PORT=3000

# Build image
echo "Building image ${IMAGE_NAME}:v${VERSION}"
docker buildx build -t ${IMAGE_NAME}:v${VERSION} --platform ${PLATFORM} .

# If deploy flag is provided, run container
if [ "$DEPLOY_FLAG" == "--deploy" ]; then
  echo "Deploying container"
  docker push ${IMAGE_NAME}:v${VERSION}
else
  echo "Build complete. Use --deploy to run the container."
fi
