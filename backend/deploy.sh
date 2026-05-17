#!/bin/bash
# ─────────────────────────────────────────────────────────────
# LexGuard — GCP Cloud Run Deploy Script
# Run: chmod +x deploy.sh && ./deploy.sh
# ─────────────────────────────────────────────────────────────

PROJECT_ID=$(gcloud config get-value project)
SERVICE_NAME="lexguard-backend"
REGION="us-central1"
IMAGE="gcr.io/$PROJECT_ID/$SERVICE_NAME"

echo "🚀 Deploying LexGuard to GCP Cloud Run..."
echo "Project: $PROJECT_ID | Region: $REGION"

# Build & push image
gcloud builds submit --tag $IMAGE .

# Deploy to Cloud Run
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=$GEMINI_API_KEY \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 3 \
  --port 8080

echo ""
echo "✅ Deployed! Your backend URL:"
gcloud run services describe $SERVICE_NAME --region=$REGION --format='value(status.url)'
