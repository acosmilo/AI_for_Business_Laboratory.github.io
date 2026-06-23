# DAE 01 Workshop: Exploratory Data Analysis with Pokemon Data

This workshop version intentionally removes all completed answers, rendered tables, and rendered graphs. Students must run the Python code and write their own interpretations.

Important rule: missing `Type 2` does not mean the row is bad. It means the Pokemon has only one type. Do not delete these rows.

## 1. Setup and Dataset Loading

Objective: Prepare the Python environment and load the CSV file.

Activities:

- Import pandas, numpy, matplotlib, seaborn, and scipy.
- Load 01-All_Pokemon.csv.
- Confirm that the object was loaded as a DataFrame.

```python
# Workshop setup
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from scipy import stats

file_path = "01-All_Pokemon.csv"
pokemon = pd.read_csv(file_path)

# Recommended display options for a classroom notebook
pd.set_option("display.max_columns", None)
pd.set_option("display.width", 120)
```

Questions to answer after running the code:

- Did the file load correctly?
- What error would appear if the file path were wrong?

## 2. Initial Inspection

Objective: Understand the dataset structure before making analytical decisions.

Activities:

- Inspect first and last rows.
- Check dimensions, columns, data types, and summary statistics.
- Separate numeric and categorical variables.

```python
# Initial inspection
pokemon.head()
pokemon.tail()
pokemon.shape
pokemon.columns
pokemon.dtypes
pokemon.info()
pokemon.describe(include="all")

numeric_variables = pokemon.select_dtypes(include=np.number).columns.tolist()
categorical_variables = pokemon.select_dtypes(exclude=np.number).columns.tolist()

print("Numeric variables:", numeric_variables)
print("Categorical variables:", categorical_variables)
```

Questions to answer after running the code:

- What is the unit of analysis?
- Which columns are numeric but should be interpreted as categorical indicators?
- Which variables would you prioritize for analysis?

## 3. Data Cleaning

Objective: Identify missing values, duplicates, unique values, and useful derived columns.

Activities:

- Check missing values and percentages.
- Check duplicates.
- Create type_2_filled and type_complexity.
- Explain why missing Type 2 rows must not be deleted.

```python
# Data cleaning and quality checks
pokemon_clean = pokemon.copy()

pokemon_clean.columns = (
    pokemon_clean.columns
    .str.strip()
    .str.lower()
    .str.replace(" ", "_", regex=False)
)

# Type 2 is missing when a Pokemon has only one type.
# Do NOT delete these rows. Convert the missing value into a meaningful category.
pokemon_clean["type_2_filled"] = pokemon_clean["type_2"].fillna("Single Type")
pokemon_clean["type_complexity"] = np.where(
    pokemon_clean["type_2"].isna(),
    "Single Type",
    "Dual Type"
)

pokemon_clean["legendary_label"] = np.where(
    pokemon_clean["legendary"] == 1,
    "Legendary",
    "Non-Legendary"
)

pokemon_clean["final_evolution_label"] = np.where(
    pokemon_clean["final_evolution"] == 1,
    "Final Evolution",
    "Not Final"
)

missing_table = pokemon.isna().sum().to_frame("missing_count")
missing_table["missing_percent"] = pokemon.isna().mean() * 100

duplicate_rows = pokemon.duplicated().sum()
unique_values = pokemon.nunique(dropna=False)

missing_table
duplicate_rows
unique_values
```

Questions to answer after running the code:

- Why does missing Type 2 mean Single Type?
- How would deleting these rows bias the dataset?
- Which variables need recoding before analysis?

## 4. Descriptive Statistics

Objective: Calculate focused numerical summaries without relying on pre-made answers.

Activities:

- Compute mean, median, mode, variance, standard deviation, CV, quartiles, percentiles, skewness, and kurtosis.
- Compare center and spread across main numerical variables.

```python
# Focused descriptive statistics
main_numeric = ["HP", "Att", "Def", "Spa", "Spd", "Spe", "BST", "Height", "Weight", "BMI", "Catch Rate"]

descriptive_rows = []
for column in main_numeric:
    s = pokemon[column].dropna()
    descriptive_rows.append({
        "variable": column,
        "count": s.count(),
        "mean": s.mean(),
        "median": s.median(),
        "mode": s.mode().iloc[0] if not s.mode().empty else np.nan,
        "min": s.min(),
        "max": s.max(),
        "range": s.max() - s.min(),
        "variance": s.var(ddof=1),
        "std_dev": s.std(ddof=1),
        "coefficient_of_variation": s.std(ddof=1) / s.mean(),
        "Q1": s.quantile(0.25),
        "Q2": s.quantile(0.50),
        "Q3": s.quantile(0.75),
        "IQR": s.quantile(0.75) - s.quantile(0.25),
        "P5": s.quantile(0.05),
        "P10": s.quantile(0.10),
        "P25": s.quantile(0.25),
        "P50": s.quantile(0.50),
        "P75": s.quantile(0.75),
        "P90": s.quantile(0.90),
        "P95": s.quantile(0.95),
        "skewness": s.skew(),
        "kurtosis": s.kurt()
    })

descriptive_statistics = pd.DataFrame(descriptive_rows).set_index("variable")
descriptive_statistics
```

Questions to answer after running the code:

- Which variable has the largest relative variability?
- Which variables are skewed?
- When is the median more useful than the mean?

## 5. Likelihood and Probability Benchmarks

Objective: Estimate baseline probabilities for numerical segments and categorical groups.

Activities:

- Create BST tiers.
- Compute probabilities for dichotomous variables.
- Compute probabilities for nominal and ordinal-like variables.

```python
# Likelihood / probability benchmarks
pokemon_clean["bst_tier"] = pd.cut(
    pokemon_clean["bst"],
    bins=[-np.inf, 330, 459, 515, np.inf],
    labels=["Low BST", "Middle BST", "High BST", "Elite BST"]
)

binary_likelihood = pd.concat([
    pokemon_clean["type_complexity"].value_counts().rename_axis("category").to_frame("count").assign(variable="Type Complexity"),
    pokemon_clean["legendary_label"].value_counts().rename_axis("category").to_frame("count").assign(variable="Legendary Status"),
    pokemon_clean["final_evolution_label"].value_counts().rename_axis("category").to_frame("count").assign(variable="Evolution Status")
]).reset_index().set_index(["variable", "category"])

binary_likelihood["probability"] = binary_likelihood["count"] / len(pokemon_clean)
binary_likelihood

categorical_likelihood = pd.concat([
    pokemon_clean["type_1"].value_counts().rename_axis("category").to_frame("count").assign(variable="Type 1"),
    pokemon_clean["type_2_filled"].value_counts().rename_axis("category").to_frame("count").assign(variable="Type 2 Filled"),
    pokemon_clean["experience_type"].value_counts().rename_axis("category").to_frame("count").assign(variable="Experience type"),
    pokemon_clean["bst_tier"].value_counts().rename_axis("category").to_frame("count").assign(variable="BST tier")
]).reset_index().set_index(["variable", "category"])

categorical_likelihood["probability"] = categorical_likelihood["count"] / len(pokemon_clean)
categorical_likelihood
```

Questions to answer after running the code:

- What is the baseline probability of a Legendary Pokemon?
- What is the baseline probability of a Single Type Pokemon?
- Why are these baselines important before predictive modeling?

## 6. Groupby Benchmarks

Objective: Compare numerical outcomes across nominal, ordinal, and dichotomous segments.

Activities:

- Benchmark by Type 1.
- Benchmark Single Type vs Dual Type.
- Benchmark by Generation.
- Benchmark by Experience type.

```python
# Groupby benchmarks for nominal and ordinal variables
type_benchmark = pokemon_clean.groupby("type_1").agg(
    count=("name", "count"),
    mean_BST=("bst", "mean"),
    median_BST=("bst", "median"),
    mean_HP=("hp", "mean"),
    mean_Att=("att", "mean"),
    mean_Def=("def", "mean"),
    mean_Spe=("spe", "mean"),
    legendary_rate=("legendary", "mean"),
    dual_type_rate=("type_2", lambda s: s.notna().mean()),
    final_evolution_rate=("final_evolution", "mean")
).sort_values("mean_BST", ascending=False)

type_complexity_benchmark = pokemon_clean.groupby("type_complexity").agg(
    count=("name", "count"),
    mean_BST=("bst", "mean"),
    median_BST=("bst", "median"),
    legendary_rate=("legendary", "mean"),
    final_evolution_rate=("final_evolution", "mean")
)

generation_benchmark = pokemon_clean.groupby("generation").agg(
    count=("name", "count"),
    mean_BST=("bst", "mean"),
    median_BST=("bst", "median"),
    legendary_rate=("legendary", "mean"),
    dual_type_rate=("type_2", lambda s: s.notna().mean()),
    final_evolution_rate=("final_evolution", "mean"),
    mean_catch_rate=("catch_rate", "mean")
)

experience_benchmark = pokemon_clean.groupby("experience_type").agg(
    count=("name", "count"),
    mean_BST=("bst", "mean"),
    median_BST=("bst", "median"),
    mean_catch_rate=("catch_rate", "mean"),
    legendary_rate=("legendary", "mean")
)

type_benchmark
type_complexity_benchmark
generation_benchmark
experience_benchmark
```

Questions to answer after running the code:

- Which type has the highest average BST?
- Do dual-type Pokemon appear different from single-type Pokemon?
- Which generation has the highest Legendary rate?

## 7. Required Visualizations

Objective: Create the core EDA plots, but interpret them manually after execution.

Activities:

- Build histograms, KDE plots, boxplots, violin plots, countplots, and bar charts.
- Write an interpretation after every graph.

```python
# Required visualizations
main_numeric = ["HP", "Att", "Def", "Spa", "Spd", "Spe", "BST", "Height", "Weight", "BMI", "Catch Rate"]

# Histograms and KDE plots
for column in main_numeric:
    plt.figure(figsize=(8, 4))
    sns.histplot(data=pokemon, x=column, bins=25, kde=True)
    plt.title(f"Histogram and KDE: {column}")
    plt.show()

# Boxplots for numerical variables
for column in main_numeric:
    plt.figure(figsize=(6, 4))
    sns.boxplot(data=pokemon, y=column)
    plt.title(f"Boxplot: {column}")
    plt.show()

# Violin plots by important categories
for column in ["BST", "HP", "Att", "Def", "Spe"]:
    plt.figure(figsize=(7, 4))
    sns.violinplot(data=pokemon_clean, x="legendary_label", y=column.lower() if column != "BST" else "bst", inner="quartile")
    plt.title(f"{column} by Legendary Status")
    plt.show()

# Countplots and bar charts
sns.countplot(data=pokemon, y="Type 1", order=pokemon["Type 1"].value_counts().index)
plt.title("Primary Type Frequency")
plt.show()

sns.countplot(data=pokemon_clean, x="type_complexity")
plt.title("Single Type vs Dual Type")
plt.show()

sns.countplot(data=pokemon_clean, x="legendary_label")
plt.title("Legendary vs Non-Legendary")
plt.show()
```

Questions to answer after running the code:

- What does each chart show?
- What pattern is visible?
- What question or hypothesis comes from that pattern?

## 8. Pie Charts and Pareto Chart

Objective: Use pie charts for dichotomous variables and Pareto logic for type frequency.

Activities:

- Create pie charts for type complexity, Legendary status, and final evolution.
- Create a Pareto chart for Type 1.

```python
# Pie charts and Pareto chart
pokemon_clean["type_complexity"].value_counts().plot(
    kind="pie",
    autopct="%1.1f%%",
    title="Single Type vs Dual Type"
)
plt.ylabel("")
plt.show()

pokemon_clean["legendary_label"].value_counts().plot(
    kind="pie",
    autopct="%1.1f%%",
    title="Legendary vs Non-Legendary"
)
plt.ylabel("")
plt.show()

pokemon_clean["final_evolution_label"].value_counts().plot(
    kind="pie",
    autopct="%1.1f%%",
    title="Final Evolution vs Not Final"
)
plt.ylabel("")
plt.show()

type_counts = pokemon["Type 1"].value_counts()
cumulative_percentage = type_counts.cumsum() / type_counts.sum() * 100

fig, ax1 = plt.subplots(figsize=(10, 5))
type_counts.plot(kind="bar", ax=ax1, color="steelblue")
ax1.set_ylabel("Count")
ax1.set_title("Pareto Chart of Primary Type")

ax2 = ax1.twinx()
cumulative_percentage.plot(ax=ax2, color="red", marker="o")
ax2.set_ylabel("Cumulative percentage")
plt.show()
```

Questions to answer after running the code:

- Which dichotomous category dominates?
- Which primary types explain most of the dataset?
- How does the Pareto chart help prioritize categories?

## 9. Outliers and Confidence Intervals

Objective: Detect extreme values and estimate confidence intervals for means.

Activities:

- Apply the IQR method.
- Apply z-scores.
- Calculate 95% confidence intervals with scipy.stats.
- Do not remove outliers without justification.

```python
# Outlier detection and confidence intervals
main_numeric = ["HP", "Att", "Def", "Spa", "Spd", "Spe", "BST", "Height", "Weight", "BMI", "Catch Rate"]

outlier_summary = []
for column in main_numeric:
    s = pokemon[column].dropna()
    q1 = s.quantile(0.25)
    q3 = s.quantile(0.75)
    iqr = q3 - q1
    lower_fence = q1 - 1.5 * iqr
    upper_fence = q3 + 1.5 * iqr
    iqr_mask = (pokemon[column] < lower_fence) | (pokemon[column] > upper_fence)
    z_scores = np.abs(stats.zscore(pokemon[column], nan_policy="omit"))

    outlier_summary.append({
        "variable": column,
        "lower_fence": lower_fence,
        "upper_fence": upper_fence,
        "IQR_outliers": int(iqr_mask.sum()),
        "z_score_outliers": int((z_scores > 3).sum())
    })

outlier_summary = pd.DataFrame(outlier_summary)
outlier_summary

ci_rows = []
for column in main_numeric:
    s = pokemon[column].dropna()
    n = len(s)
    mean = s.mean()
    standard_error = stats.sem(s)
    margin_error = stats.t.ppf(0.975, n - 1) * standard_error
    ci_rows.append({
        "variable": column,
        "n": n,
        "mean": mean,
        "lower_95": mean - margin_error,
        "upper_95": mean + margin_error
    })

confidence_intervals = pd.DataFrame(ci_rows).set_index("variable")
confidence_intervals
```

Questions to answer after running the code:

- Which outliers look like real Pokemon design values?
- What does each confidence interval mean?
- Would you remove any row? Why or why not?

## 10. Correlation and Normality

Objective: Analyze relationships and distribution assumptions.

Activities:

- Create Pearson, Spearman, and Kendall correlation heatmaps.
- Create Q-Q plots.
- Run Shapiro-Wilk and D'Agostino normality tests.

```python
# Correlations and normality
main_numeric = ["HP", "Att", "Def", "Spa", "Spd", "Spe", "BST", "Height", "Weight", "BMI", "Catch Rate"]

pearson_corr = pokemon[main_numeric].corr(method="pearson")
spearman_corr = pokemon[main_numeric].corr(method="spearman")
kendall_corr = pokemon[main_numeric].corr(method="kendall")

plt.figure(figsize=(10, 8))
sns.heatmap(pearson_corr, annot=True, cmap="coolwarm", center=0)
plt.title("Pearson Correlation")
plt.show()

plt.figure(figsize=(10, 8))
sns.heatmap(spearman_corr, annot=True, cmap="coolwarm", center=0)
plt.title("Spearman Correlation")
plt.show()

plt.figure(figsize=(10, 8))
sns.heatmap(kendall_corr, annot=True, cmap="coolwarm", center=0)
plt.title("Kendall Correlation")
plt.show()

for column in ["BST", "Weight", "Height", "Catch Rate"]:
    values = pokemon[column].dropna()
    stats.probplot(values, dist="norm", plot=plt)
    plt.title(f"Q-Q Plot: {column}")
    plt.show()

    sample = values.sample(min(500, len(values)), random_state=4)
    print(column, stats.shapiro(sample), stats.normaltest(values))
```

Questions to answer after running the code:

- Which relationships are linear?
- Which relationships are monotonic?
- Which variables do not look normal?

## 11. Evolution Heatmap and Cross-tabs

Objective: Map categorical relationships across generation, type, and evolution status.

Activities:

- Create a heatmap for final evolution share by generation.
- Create cross-tabulations by Type 1 and key categorical variables.

```python
# Evolution heatmap and categorical cross-tabulations
evolution_map = pd.crosstab(
    pokemon_clean["generation"],
    pokemon_clean["final_evolution_label"],
    normalize="index"
) * 100

plt.figure(figsize=(8, 5))
sns.heatmap(evolution_map, annot=True, cmap="Blues", fmt=".1f")
plt.title("Final Evolution Share by Generation")
plt.show()

type_legendary = pd.crosstab(pokemon_clean["type_1"], pokemon_clean["legendary_label"])
type_complexity = pd.crosstab(pokemon_clean["type_1"], pokemon_clean["type_complexity"])
type_evolution = pd.crosstab(pokemon_clean["type_1"], pokemon_clean["final_evolution_label"])

type_legendary
type_complexity
type_evolution
```

Questions to answer after running the code:

- Which generations have higher final-evolution share?
- How does Type 1 relate to Legendary status?
- How does Type 1 relate to single-type or dual-type status?
