
- Got to https://www.kaggle.com/datasets/devtayyabsajjad/formula-1-live-tracker-2024-2026-dataset
- Import all data sets

import kagglehub

# Download latest version
path = kagglehub.dataset_download("devtayyabsajjad/formula-1-live-tracker-2024-2026-dataset")

print("Path to dataset files:", path)
