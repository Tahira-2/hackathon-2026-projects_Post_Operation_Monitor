# 🩺 AI-Powered Chest X-ray Analysis

## 👥 Team Members
- @https://github.com/A-RR3
- @https://github.com/hubcraftjv

## ❗ Problem Statement
Medical imaging datasets, such as chest X-rays, are large and complex, making diagnosis time-consuming and computationally expensive. Traditional supervised learning methods require extensive labeled data, which is costly and time-intensive to obtain.

## 💡 Solution
Medical image datasets are huge. Training models on all the images takes time, storage, and computing power. Data distillation is a strategy where you compress the large dataset into a much smaller, smarter version that still preserves the essential patterns. Our solution leverages unsupervised training and data distillation to improve medical image classification on large-scale datasets.

By reducing redundancy in the data and learning compact representations, the model achieves efficient performance while minimizing diagnostic time, storage requirements, and computational cost.



## ⚙️ Tech Stack
- **Programming Language:** Python  
- **Libraries/Frameworks:** TensorFlow / PyTorch, NumPy, Pandas, OpenCV  
- **Tools:** Jupyter Notebook, Google Colab, Git, GitHub  
- **Dataset:** [Chest X-ray dataset](https://www.kaggle.com/datasets/nih-chest-xrays/data)

## 🚀 Setup Instructions

### Option 1: Run on Google Colab (Recommended)

[![Open in Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/drive/1E-iwE81Fcxo-KFYYJwLgDCzVHmaY68wZ?usp=sharing)

### Option 2: Run Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/project-name.git
   ```
2. Open the project in VS Code.

3. Create and activate a virtual environment (recommended)
   ```bash
   python -m venv venv
   venv\Scripts\activate --> on Windows
   source venv/bin/activate --> on macOS/Linux
   ```
4. Install dependencies:

   ```bash
    pip install numpy pandas matplotlib seaborn opencv-python scikit-learn tensorflow
   ```
5. Run the project

   ```bash
   python main.py
   ```


## Failure Points:

1. Limitations of Raw Pixels: As seen with the earlier 'Raw PCA' and 'Raw NMF' methods, directly applying dimensionality reduction and classification on raw pixel values (16384 features for a 128x128 image) was ineffective. These methods struggled to capture the complex, high-level patterns necessary to distinguish medical conditions like 'Cardiomegaly', resulting in very low sensitivity.