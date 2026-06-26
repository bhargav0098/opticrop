# ============================================================
# OptiCrop - Epic 2: Data Collection & Analysis
# Download Kaggle dataset + Full EDA (Univariate, Bivariate, Multivariate)
# All plots saved to: ml-service/images/
# ============================================================
# Run: python eda_analysis.py

import sys
import io
# Force UTF-8 output to avoid Windows cp1252 UnicodeEncodeError
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

import os
import warnings
warnings.filterwarnings("ignore")

import pandas as pd
import numpy as np
import matplotlib
matplotlib.use("Agg")  # non-interactive / no GUI needed
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans

# ────────────────────────────────────────────────────────────
# 0. Setup
# ────────────────────────────────────────────────────────────
IMAGES_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "images")
os.makedirs(IMAGES_DIR, exist_ok=True)

def save(name):
    path = os.path.join(IMAGES_DIR, name)
    plt.tight_layout()
    plt.savefig(path, dpi=150, bbox_inches="tight")
    plt.close()
    print(f"  [OK] Saved: images/{name}")

sns.set_theme(style="whitegrid", palette="Set2")

# ────────────────────────────────────────────────────────────
# 1. DOWNLOAD THE DATASET
# ────────────────────────────────────────────────────────────
print("\n=== Epic 2 - Task 1: Download the Dataset ===")
print("Trying Kaggle download ...")

df = None

# -- Try kagglehub with the known CSV filename --
try:
    import kagglehub
    from kagglehub import KaggleDatasetAdapter
    df = kagglehub.load_dataset(
        KaggleDatasetAdapter.PANDAS,
        "chitrakumari25/smart-agricultural-production-optimizing-engine",
        "Crop_recommendation.csv",
    )
    print(f"[OK] Downloaded from Kaggle. Shape: {df.shape}")
except Exception as e:
    print(f"[WARN] Kaggle download failed: {e}")
    print("[INFO] Falling back to synthetic dataset for EDA demo.")

# -- Fallback: synthetic data matching the Kaggle schema --
if df is None:
    np.random.seed(42)
    crop_profiles = {
        "rice":        dict(N=(60,100),  P=(30,60),   K=(30,60),   temp=(20,28), hum=(75,90), ph=(5.5,7.0), rain=(150,250)),
        "wheat":       dict(N=(80,120),  P=(35,65),   K=(35,65),   temp=(10,22), hum=(40,65), ph=(6.0,7.5), rain=(60,120)),
        "maize":       dict(N=(70,110),  P=(35,65),   K=(35,65),   temp=(18,28), hum=(55,75), ph=(5.8,7.5), rain=(80,160)),
        "chickpea":    dict(N=(20,50),   P=(50,90),   K=(60,100),  temp=(15,25), hum=(25,55), ph=(6.0,8.0), rain=(40,100)),
        "kidneybeans": dict(N=(15,40),   P=(60,100),  K=(15,40),   temp=(18,26), hum=(55,75), ph=(5.5,7.5), rain=(100,180)),
        "pigeonpeas":  dict(N=(15,40),   P=(50,90),   K=(15,40),   temp=(20,30), hum=(45,65), ph=(6.0,7.5), rain=(60,130)),
        "mothbeans":   dict(N=(15,40),   P=(40,80),   K=(15,40),   temp=(24,34), hum=(25,50), ph=(6.0,7.5), rain=(30,80)),
        "mungbean":    dict(N=(15,40),   P=(40,80),   K=(15,40),   temp=(25,35), hum=(55,80), ph=(6.0,7.5), rain=(50,100)),
        "blackgram":   dict(N=(30,60),   P=(50,90),   K=(15,40),   temp=(22,32), hum=(60,80), ph=(6.0,7.5), rain=(80,150)),
        "lentil":      dict(N=(15,40),   P=(50,90),   K=(15,40),   temp=(14,24), hum=(40,65), ph=(5.5,7.5), rain=(40,100)),
        "pomegranate": dict(N=(15,40),   P=(10,30),   K=(30,70),   temp=(22,32), hum=(40,65), ph=(5.5,7.5), rain=(30,90)),
        "banana":      dict(N=(80,120),  P=(60,100),  K=(40,80),   temp=(22,30), hum=(70,90), ph=(5.5,7.0), rain=(100,200)),
        "mango":       dict(N=(15,40),   P=(10,30),   K=(20,50),   temp=(24,34), hum=(40,70), ph=(5.5,7.5), rain=(50,150)),
        "grapes":      dict(N=(15,40),   P=(10,30),   K=(30,70),   temp=(16,28), hum=(55,80), ph=(6.0,7.5), rain=(50,120)),
        "watermelon":  dict(N=(80,120),  P=(30,60),   K=(40,80),   temp=(25,35), hum=(70,85), ph=(6.0,7.5), rain=(60,120)),
        "muskmelon":   dict(N=(80,120),  P=(30,60),   K=(50,90),   temp=(28,36), hum=(65,80), ph=(6.0,7.5), rain=(40,90)),
        "apple":       dict(N=(15,40),   P=(10,30),   K=(30,70),   temp=(6,14),  hum=(55,75), ph=(5.5,7.0), rain=(80,160)),
        "orange":      dict(N=(15,40),   P=(10,30),   K=(20,50),   temp=(18,28), hum=(55,75), ph=(6.0,7.5), rain=(80,160)),
        "papaya":      dict(N=(40,80),   P=(10,30),   K=(40,80),   temp=(25,35), hum=(70,85), ph=(5.5,7.0), rain=(100,200)),
        "coconut":     dict(N=(15,40),   P=(10,30),   K=(30,70),   temp=(22,32), hum=(70,90), ph=(5.5,8.0), rain=(120,250)),
        "cotton":      dict(N=(100,140), P=(35,65),   K=(15,40),   temp=(22,32), hum=(55,75), ph=(6.0,8.0), rain=(60,130)),
        "jute":        dict(N=(70,110),  P=(40,80),   K=(35,65),   temp=(22,32), hum=(70,90), ph=(6.0,7.5), rain=(150,250)),
    }
    rows = []
    for crop, p in crop_profiles.items():
        for _ in range(100):
            rows.append({
                "N":           np.random.randint(*p["N"]),
                "P":           np.random.randint(*p["P"]),
                "K":           np.random.randint(*p["K"]),
                "temperature": round(np.random.uniform(*p["temp"]), 2),
                "humidity":    round(np.random.uniform(*p["hum"]), 2),
                "ph":          round(np.random.uniform(*p["ph"]), 2),
                "rainfall":    round(np.random.uniform(*p["rain"]), 2),
                "label":       crop,
            })
    df = pd.DataFrame(rows)
    print(f"[OK] Synthetic dataset created. Shape: {df.shape}")

# ────────────────────────────────────────────────────────────
# 2. IMPORTING THE LIBRARIES (already done above)
# ────────────────────────────────────────────────────────────
print("\n=== Epic 2 - Task 2: Importing the Libraries ===")
print("Libraries: pandas, numpy, matplotlib, seaborn, scikit-learn -- all loaded.")

# ────────────────────────────────────────────────────────────
# 3. READ THE DATASET
# ────────────────────────────────────────────────────────────
print("\n=== Epic 2 - Task 3: Read the Dataset ===")

# Standardise label column
if "label" not in df.columns and "crop" in df.columns:
    df = df.rename(columns={"crop": "label"})

FEATURES = [c for c in ["N","P","K","temperature","humidity","ph","rainfall"] if c in df.columns]

print("First 5 records:")
print(df.head())
print(f"\nShape      : {df.shape}")
print(f"Columns    : {list(df.columns)}")
print(f"\nData Types :\n{df.dtypes}")
print(f"\nStatistical Summary:\n{df.describe()}")
print(f"\nNull Values:\n{df.isnull().sum()}")

# ────────────────────────────────────────────────────────────
# 4. UNIVARIATE ANALYSIS
# ────────────────────────────────────────────────────────────
print("\n=== Epic 2 - Task 4: Univariate Analysis ===")

# 4a. Histograms
fig, axes = plt.subplots(2, 4, figsize=(18, 8))
axes = axes.flatten()
for i, feat in enumerate(FEATURES):
    axes[i].hist(df[feat], bins=30, color="#4CAF50", edgecolor="white", alpha=0.85)
    axes[i].set_title(f"Distribution of {feat}", fontweight="bold")
    axes[i].set_xlabel(feat)
    axes[i].set_ylabel("Frequency")
for j in range(len(FEATURES), len(axes)):
    axes[j].set_visible(False)
fig.suptitle("Univariate Analysis - Feature Distributions", fontsize=14, fontweight="bold")
save("01_univariate_histograms.png")

# 4b. Crop label counts
fig, ax = plt.subplots(figsize=(14, 5))
counts = df["label"].value_counts()
counts.plot(kind="bar", color=sns.color_palette("Set2", len(counts)), ax=ax, edgecolor="white")
ax.set_title("Crop Label Distribution", fontweight="bold", fontsize=13)
ax.set_xlabel("Crop")
ax.set_ylabel("Count")
ax.set_xticklabels(counts.index, rotation=45, ha="right")
save("02_univariate_crop_counts.png")

# 4c. Box plots
fig, axes = plt.subplots(2, 4, figsize=(18, 8))
axes = axes.flatten()
for i, feat in enumerate(FEATURES):
    axes[i].boxplot(df[feat].dropna(), patch_artist=True,
                    boxprops=dict(facecolor="#81C784", color="#388E3C"),
                    medianprops=dict(color="#1B5E20", linewidth=2))
    axes[i].set_title(f"Box Plot - {feat}", fontweight="bold")
    axes[i].set_ylabel(feat)
for j in range(len(FEATURES), len(axes)):
    axes[j].set_visible(False)
fig.suptitle("Univariate Analysis - Box Plots", fontsize=14, fontweight="bold")
save("03_univariate_boxplots.png")

print("  Univariate: 3 plots saved.")

# ────────────────────────────────────────────────────────────
# 5. BIVARIATE ANALYSIS
# ────────────────────────────────────────────────────────────
print("\n=== Epic 2 - Task 5: Bivariate Analysis ===")

# 5a. Violin plots - feature vs crop (top 10)
top_crops = df["label"].value_counts().head(10).index.tolist()
sub10 = df[df["label"].isin(top_crops)]

fig, axes = plt.subplots(2, 4, figsize=(20, 10))
axes = axes.flatten()
for i, feat in enumerate(FEATURES):
    data_by_crop = [sub10[sub10["label"] == c][feat].dropna().values for c in top_crops]
    axes[i].violinplot(data_by_crop, positions=range(len(top_crops)), showmedians=True)
    axes[i].set_xticks(range(len(top_crops)))
    axes[i].set_xticklabels(top_crops, rotation=45, ha="right", fontsize=7)
    axes[i].set_title(f"{feat} by Crop", fontweight="bold")
    axes[i].set_ylabel(feat)
for j in range(len(FEATURES), len(axes)):
    axes[j].set_visible(False)
fig.suptitle("Bivariate Analysis - Feature vs Crop (Violin Plots)", fontsize=14, fontweight="bold")
save("04_bivariate_violin.png")

# 5b. Scatter: temperature vs rainfall
fig, ax = plt.subplots(figsize=(12, 7))
palette = sns.color_palette("tab20", len(df["label"].unique()))
for idx, crop in enumerate(df["label"].unique()):
    sub = df[df["label"] == crop]
    ax.scatter(sub["temperature"], sub["rainfall"], label=crop,
               alpha=0.6, s=18, color=palette[idx])
ax.set_xlabel("Temperature (C)")
ax.set_ylabel("Rainfall (mm)")
ax.set_title("Bivariate - Temperature vs Rainfall (by Crop)", fontweight="bold")
ax.legend(bbox_to_anchor=(1.01, 1), loc="upper left", fontsize=7, ncol=2)
save("05_bivariate_scatter_temp_rain.png")

# 5c. N vs K scatter
fig, ax = plt.subplots(figsize=(10, 6))
for idx, crop in enumerate(df["label"].unique()):
    sub = df[df["label"] == crop]
    ax.scatter(sub["N"], sub["K"], label=crop, alpha=0.6, s=18, color=palette[idx])
ax.set_xlabel("Nitrogen (N)")
ax.set_ylabel("Potassium (K)")
ax.set_title("Bivariate - N vs K by Crop", fontweight="bold")
ax.legend(bbox_to_anchor=(1.01, 1), loc="upper left", fontsize=7, ncol=2)
save("06_bivariate_scatter_N_K.png")

# 5d. Mean N,P,K,Temperature per crop
fig, ax = plt.subplots(figsize=(16, 6))
grouped = df.groupby("label")[FEATURES[:4]].mean()
grouped.plot(kind="bar", ax=ax, colormap="Set2", edgecolor="white")
ax.set_title("Mean N, P, K, Temperature per Crop", fontweight="bold")
ax.set_xlabel("Crop")
ax.set_ylabel("Mean Value")
ax.set_xticklabels(grouped.index, rotation=45, ha="right")
ax.legend(loc="upper right")
save("07_bivariate_mean_features.png")

print("  Bivariate: 4 plots saved.")

# ────────────────────────────────────────────────────────────
# 6. MULTIVARIATE ANALYSIS
# ────────────────────────────────────────────────────────────
print("\n=== Epic 2 - Task 6: Multivariate Analysis ===")

# 6a. Correlation heatmap
fig, ax = plt.subplots(figsize=(9, 7))
corr = df[FEATURES].corr()
sns.heatmap(corr, annot=True, fmt=".2f", cmap="RdYlGn", ax=ax,
            linewidths=0.5, square=True, cbar_kws={"shrink": 0.8})
ax.set_title("Multivariate - Correlation Heatmap", fontweight="bold")
save("08_multivariate_correlation.png")

# 6b. Pair plot (top 5 crops)
top5 = df["label"].value_counts().head(5).index.tolist()
sub5 = df[df["label"].isin(top5)]
g = sns.pairplot(sub5[FEATURES[:4] + ["label"]], hue="label",
                 palette="Set2", plot_kws={"alpha": 0.5, "s": 15},
                 diag_kind="kde", corner=True)
g.figure.suptitle("Multivariate - Pair Plot (Top 5 Crops)", y=1.01, fontweight="bold")
save("09_multivariate_pairplot.png")

# 6c. PCA 2D projection
le_obj = LabelEncoder()
y_enc = le_obj.fit_transform(df["label"])
X_scaled = StandardScaler().fit_transform(df[FEATURES])
pca = PCA(n_components=2, random_state=42)
components = pca.fit_transform(X_scaled)

fig, ax = plt.subplots(figsize=(12, 7))
scatter = ax.scatter(components[:, 0], components[:, 1], c=y_enc,
                     cmap="tab20", alpha=0.7, s=20)
ax.set_xlabel(f"PC1 ({pca.explained_variance_ratio_[0]*100:.1f}% var)")
ax.set_ylabel(f"PC2 ({pca.explained_variance_ratio_[1]*100:.1f}% var)")
ax.set_title("Multivariate - PCA 2D Projection", fontweight="bold")
legend_handles = [
    plt.Line2D([0],[0], marker='o', color='w',
               markerfacecolor=plt.cm.tab20(i / max(len(le_obj.classes_)-1, 1)),
               markersize=7, label=c)
    for i, c in enumerate(le_obj.classes_)
]
ax.legend(handles=legend_handles, bbox_to_anchor=(1.01, 1), loc="upper left",
          fontsize=7, ncol=2)
save("10_multivariate_pca.png")

# 6d. KMeans clustering on PCA space
km = KMeans(n_clusters=5, random_state=42, n_init=10)
cluster_labels = km.fit_predict(X_scaled)
centroids_pca = pca.transform(km.cluster_centers_)

fig, ax = plt.subplots(figsize=(10, 6))
ax.scatter(components[:,0], components[:,1], c=cluster_labels,
           cmap="Set1", alpha=0.6, s=20)
ax.scatter(centroids_pca[:,0], centroids_pca[:,1], s=200, c="black",
           marker="X", zorder=5, label="Centroids")
ax.set_xlabel("PC1")
ax.set_ylabel("PC2")
ax.set_title("Multivariate - KMeans Clustering (k=5) on PCA Space", fontweight="bold")
ax.legend()
save("11_multivariate_kmeans.png")

# 6e. Radar charts for selected crops
def radar_chart(ax, categories, values, color, label):
    N = len(categories)
    angles = [n / float(N) * 2 * np.pi for n in range(N)]
    angles += angles[:1]
    v = list(values) + [values[0]]
    ax.plot(angles, v, color=color, linewidth=2, label=label)
    ax.fill(angles, v, color=color, alpha=0.2)
    ax.set_xticks(angles[:-1])
    ax.set_xticklabels(categories, fontsize=7)

selected_crops = ["rice", "wheat", "maize", "cotton", "apple"]
scaler_r = StandardScaler()
df_norm = pd.DataFrame(scaler_r.fit_transform(df[FEATURES]), columns=FEATURES)
df_norm["label"] = df["label"].values

colors = ["#e6194b","#3cb44b","#4363d8","#f58231","#911eb4"]
fig = plt.figure(figsize=(15, 5))
for idx, crop in enumerate(selected_crops):
    ax = fig.add_subplot(1, 5, idx+1, polar=True)
    crop_data = df_norm[df_norm["label"] == crop]
    if len(crop_data) == 0:
        continue
    vals = crop_data[FEATURES].mean().values
    radar_chart(ax, FEATURES, vals, colors[idx], crop)
    ax.set_title(crop, fontweight="bold", pad=14)
fig.suptitle("Multivariate - Radar Charts (Normalised Feature Profiles)", fontweight="bold", fontsize=13)
save("12_multivariate_radar.png")

print("  Multivariate: 5 plots saved.")

# ────────────────────────────────────────────────────────────
# Summary
# ────────────────────────────────────────────────────────────
print("\n" + "="*55)
print("[DONE] All EDA images saved to: ml-service/images/")
print("="*55)
all_imgs = sorted(os.listdir(IMAGES_DIR))
print(f"\n{len(all_imgs)} images created:")
for f in all_imgs:
    print(f"  - {f}")
