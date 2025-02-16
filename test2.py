import pandas as pd
import itertools

# Load the CSV file
csv_path = 'animals.csv'
df = pd.read_csv(csv_path)

# Get the list of original columns
original_cols = df.columns.tolist()

# Compute unique values for each column
unique_values = {col: sorted(df[col].dropna().unique().tolist()) for col in original_cols}

# Check if both 'pet' and 'color' exist in the CSV
has_pet_color = ('pet' in original_cols) and ('color' in original_cols)

# If they exist, build a mapping: for each pet, list the valid colors seen in the CSV.
if has_pet_color:
    valid_colors = {}
    for pet in unique_values['pet']:
        valid_colors[pet] = sorted(df.loc[df['pet'] == pet, 'color'].dropna().unique().tolist())

# Prepare a list to hold the output rows.
output_rows = []

# Define the order of want_ columns.
# For the pet/color case, we assume the desired want_ order is: want_pet, want_sex, want_age, want_size, want_color.
# (This reorders the original columns if the CSV columns are in a different order.)
if has_pet_color and set(['pet', 'sex', 'age', 'size']).issubset(set(original_cols)):
    # We use these four columns for the main product; want_color will be appended based on want_pet.
    want_order = ['pet', 'sex', 'age', 'size']
    final_want_order = ['want_pet', 'want_sex', 'want_age', 'want_size', 'want_color']
else:
    # Fallback: for CSVs without the pet/color dependency, use all columns (in original order) with a "want_" prefix.
    want_order = original_cols
    final_want_order = ['want_' + col for col in original_cols]

# For each row in the original CSV, generate all possibilities for the want_ values.
for _, orig_row in df.iterrows():
    if has_pet_color and set(['pet', 'sex', 'age', 'size']).issubset(set(original_cols)):
        # For these columns, generate the Cartesian product of unique values.
        for combo in itertools.product(unique_values['pet'],
                                       unique_values['sex'],
                                       unique_values['age'],
                                       unique_values['size']):
            want_pet, want_sex, want_age, want_size = combo
            # For want_color, use only the colors valid for the chosen want_pet.
            for want_color in valid_colors.get(want_pet, []):
                # Build an output row that includes:
                #   1. The original row values.
                #   2. The want_ columns in the desired order.
                out_row = {}
                for col in original_cols:
                    out_row[col] = orig_row[col]
                out_row['want_pet'] = want_pet
                out_row['want_sex'] = want_sex
                out_row['want_age'] = want_age
                out_row['want_size'] = want_size
                out_row['want_color'] = want_color
                output_rows.append(out_row)
    else:
        # Fallback: generate the Cartesian product for every column (using unique values)
        for combo in itertools.product(*[unique_values[col] for col in original_cols]):
            out_row = {}
            # Add the original row values
            for col in original_cols:
                out_row[col] = orig_row[col]
            # Append the "want_" values (in the same order as the original columns)
            for col, value in zip(original_cols, combo):
                out_row["want_" + col] = value
            output_rows.append(out_row)

# Create a DataFrame from the output rows.
output_df = pd.DataFrame(output_rows)

# (Optional) Reorder columns so that the original columns come first, 
# followed by the want_ columns in the desired order.
if has_pet_color and set(['pet', 'sex', 'age', 'size']).issubset(set(original_cols)):
    final_order = original_cols + final_want_order
else:
    final_order = original_cols + ["want_" + col for col in original_cols]
output_df = output_df[final_order]

# Save the resulting DataFrame to a new CSV file.
output_csv_path = 'combined_possibilities.csv'
output_df.to_csv(output_csv_path, index=False)

print(f"CSV file with all possibilities created: {output_csv_path}")
