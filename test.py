import pandas as pd

# Path to your CSV file
file_path = "combined_possibilities.csv"  # Replace with your actual file path

# Load the CSV file
df = pd.read_csv(file_path)

# Optionally, clean column names (remove extra spaces)
df.columns = df.columns.str.strip()

# Define feature columns and mandatory columns
features = ["pet", "sex", "age", "color", "size"]
mandatory = ["pet", "sex"]

def get_recommendation(row):
    # Mandatory check: if pet or sex don't match, return "no"
    for col in mandatory:
        if row[col] != row[f"want_{col}"]:
            return "no"
    
    # Count the number of matches for all feature columns
    total_features = len(features)
    matches = sum(row[col] == row[f"want_{col}"] for col in features)
    fraction = matches / total_features

    # Apply the new thresholds
    if fraction >= 0.8:
        return "yes"
    elif fraction >= 0.4:
        return "maybe"
    else:
        return "no"

# Apply the function row-wise
df["recommend"] = df.apply(get_recommendation, axis=1)

# Write the updated DataFrame back to the CSV file
df.to_csv(file_path, index=False)

print("CSV updated successfully!")
