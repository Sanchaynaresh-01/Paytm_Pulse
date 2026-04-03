from random import sample

import pandas as pd
df = pd.read_csv("../data/processed/final_dataset.csv")
print(df['store_id'].unique())
sample_input = sample.drop(columns=["sales"])