# Multiclass Astronomical Object Classification (SVM vs. PyTorch MLP)

Final project for a graduate Machine Learning course (Master's in Biochemistry, UNAM) — classifying astronomical objects from the **Sloan Digital Sky Survey (SDSS) DR14** into three mutually exclusive classes: **Galaxy, Quasar (QSO), and Star**.

## 📌 Overview

This project compares two supervised learning approaches on a 10,000-record photometric dataset:

1. **Support Vector Machine (SVM)** — scikit-learn, with grid search over kernel and regularization hyperparameters
2. **Multilayer Perceptron (MLP)** — a custom neural network built and trained from scratch in **PyTorch**, including a custom `Dataset`/`DataLoader` pipeline, GPU training, model checkpointing, and an inference function

## 📊 Dataset

- **Source:** [Sloan Digital Sky Survey DR14](https://www.sdss.org/dr14/) (`Skyserver_SQL2_27_2018`)
- **Size:** 10,000 records
- **Target classes:** `GALAXY = 0`, `QSO = 1`, `STAR = 2` (standard, mutually exclusive multiclass)
- **Features:** photometric magnitudes (u, g, r, i, z), positional and observational metadata (ra, dec, run, rerun, camcol, field, redshift, plate, mjd, fiberid)

## 🔧 Methods

### 1. Preprocessing
- Label encoding of the target variable (`LabelEncoder`)
- Feature scaling (`StandardScaler`)
- Train/test split with stratification

### 2. SVM (scikit-learn)
- Hyperparameter grid search over `kernel` (`linear`, `rbf`) and `C` (`[1, 10, 30, 50]`) using `GridSearchCV`
- Best configuration: **linear kernel, C = 50**

### 3. MLP (PyTorch)
- Custom neural network class trained with GPU acceleration (CUDA/T4)
- Hyperparameter exploration across learning rate, epochs, optimizer (SGD vs. Adam), and batch size
- Trained model weights saved and reloaded for inference (`torch.save` / `load_state_dict`)

### 4. Evaluation
Both models were evaluated with:
- Classification report (precision, recall, F1-score per class)
- Confusion matrix
- ROC curves (multiclass, one-vs-rest)

## 📈 Results

| Model | Weighted F1-score | Precision | Recall |
|---|---|---|---|
| **SVM (linear, C=50)** | **0.99** | 0.99 | 0.99 |
| MLP (PyTorch, best config) | 0.93 | 0.93 | 0.93 |

The SVM outperformed the MLP on this task. With feature scaling applied, the classes appear to be largely linearly separable in feature space, which favors a linear-kernel SVM. The MLP was more sensitive to hyperparameter choice — high learning rates with few epochs performed best, while longer training with Adam tended to underperform, suggesting a need for further tuning (learning rate scheduling, regularization) to fully exploit the neural network's capacity.

No significant overfitting was observed for the final SVM model: the cross-validation F1-score (0.9907) and test-set F1-score (0.99) were consistent.

## 🛠️ Tech Stack

`Python` · `PyTorch` · `scikit-learn` · `pandas` · `NumPy` · `Matplotlib` · Google Colab (GPU runtime)

## 📁 Repository Structure

```
├── Proyecto_final_TAFV.ipynb   # Full notebook: preprocessing, SVM, MLP, evaluation
├── README.md
```

## 👩‍💻 Author

**Abigail Flores Villeda** — Master's student in Biochemistry (Bioinformatics & Data Analysis focus), UNAM
[LinkedIn](https://www.linkedin.com/in/abigail-floresvilleda/) · [GitHub](https://github.com/abivilleda28)
