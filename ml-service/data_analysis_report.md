# Data Analysis Report

## Dataset Overview
- **Dataset Size:** 2,200 rows, 8 columns
- **Features:** Nitrogen (N), Phosphorus (P), Potassium (K), Temperature, Humidity, pH, Rainfall
- **Target Column:** Label (Crop)

## Data Quality Report
- **Missing Values:** 0
- **Duplicate Rows:** 0 (Dataset generated/downloaded cleanly)
- **Data Types:** Numeric for all features, Categorical for label
- **Distribution:** Uniform distribution of classes (100 samples per crop type for 22 crops)

## EDA Summary
- The features exhibit distinct clustering, particularly when applying PCA.
- Certain crops have very specific climate and soil requirements (e.g., Rice needs high rainfall, Apple needs low temperature).
- No major class imbalance exists. Outliers have been handled via IQR capping in the preprocessing step.
