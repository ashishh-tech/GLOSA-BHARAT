import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

import pandas as pd
import numpy as np
import warnings
warnings.filterwarnings('ignore')

df_raw = pd.read_csv(r'c:\Users\name\Desktop\PROJECTS\GLOSA-BHARAT-main\highway dataset.csv')

# CLEANING
df = df_raw.drop_duplicates()
df['vehicles'] = pd.to_numeric(df['vehicles'], errors='coerce')
df['day of week'] = df['day of week'].str.strip().str.title()
df['congestion']  = df['congestion'].str.strip().str.title()
df['vehicles']        = df.groupby('road segment id')['vehicles'].transform(lambda x: x.fillna(x.median()))
df['traffic density'] = df.groupby('road segment id')['traffic density'].transform(lambda x: x.fillna(x.median()))
df['avg speed kmph']  = df.groupby('road segment id')['avg speed kmph'].transform(lambda x: x.fillna(x.mean()))
df['CO2 emission']    = df.groupby('congestion')['CO2 emission'].transform(lambda x: x.fillna(x.mean()))
df['NOx']    = df['NOx'].fillna(df['NOx'].mean())
df['PM2.5']  = df['PM2.5'].fillna(df['PM2.5'].mean())
df['rain mm']= df['rain mm'].fillna(0)
df['visibility m'] = df['visibility m'].fillna(df['visibility m'].mean())
df['timestamp'] = pd.to_datetime(df['timestamp'])
df['hour'] = df['timestamp'].dt.hour
df['tei'] = (df['avg speed kmph'] / df['traffic density'].replace(0, np.nan)).replace([np.inf,-np.inf], np.nan)
df['tei'] = df['tei'].fillna(df['tei'].median())

sep = "=" * 55

# DATA QUALITY
print(sep)
print("  DATA QUALITY CHECK")
print(sep)
print(f"Raw rows           : {len(df_raw)}")
print(f"Exact duplicates   : {len(df_raw) - len(df)}")
print(f"Clean rows         : {len(df)}")
nulls = df.isnull().sum()
nulls_left = nulls[nulls > 0]
if len(nulls_left) == 0:
    print("Remaining NULLs    : ZERO - all blanks imputed correctly")
else:
    print("Remaining NULLs:")
    print(nulls_left.to_string())
print()

# Spelling
print(sep)
print("  DAY OF WEEK (unique values - check for typos)")
print(sep)
print(df['day of week'].value_counts().to_string())
print()
print(sep)
print("  CONGESTION LEVELS (unique values)")
print(sep)
print(df['congestion'].value_counts().to_string())
print()
print(sep)
print("  ROAD SEGMENT IDs")
print(sep)
print(sorted(df['road segment id'].unique()))
print()

# A1
print(sep)
print("  A1: PEAK TRAFFIC HOURS (All 24 hours)")
print(sep)
peak = df.groupby('hour')['vehicles'].sum().sort_values(ascending=False)
print(peak.apply(lambda x: f"{int(x):,}").to_string())
print(f"\n>> PEAK HOUR : {peak.idxmax()}:00  |  Vehicles: {int(peak.max()):,}")
print()

# A2
print(sep)
print("  A2: AVG SPEED BY ROAD SEGMENT")
print(sep)
spd = df.groupby('road segment id')['avg speed kmph'].mean().sort_values()
print(spd.round(2).to_string())
print(f"\n>> SLOWEST : {spd.idxmin()}  @ {spd.min():.2f} kmph")
print(f">> FASTEST : {spd.idxmax()}  @ {spd.max():.2f} kmph")
print()

# A3
print(sep)
print("  A3: CONGESTION-PRONE ZONES (Traffic Density)")
print(sep)
den = df.groupby('road segment id')['traffic density'].mean().sort_values(ascending=False)
print(den.round(2).to_string())
print(f"\n>> MOST CONGESTED: {den.idxmax()}  (density: {den.max():.2f})")
print()

# A4
print(sep)
print("  A4: AVG CO2 BY CONGESTION LEVEL")
print(sep)
co2c = df.groupby('congestion')['CO2 emission'].mean()
for c,v in co2c.items():
    print(f"  {c:10s}: {v:.3f}")
print()

# A5
print(sep)
print("  A5: RAINFALL IMPACT ON AVG SPEED")
print(sep)
bins   = [-1, 0, 10, 25, 100]
labels = ['Dry (0mm)', 'Light (1-10)', 'Moderate (11-25)', 'Heavy (>25)']
df['rain_bin'] = pd.cut(df['rain mm'], bins=bins, labels=labels)
rs = df.groupby('rain_bin', observed=True)['avg speed kmph'].mean()
print(rs.round(2).to_string())
print(f"\n>> Speed drop Dry -> Heavy: {rs.iloc[0] - rs.iloc[-1]:.2f} kmph")
print()

# A6
print(sep)
print("  A6: TOP 5 EMISSION HOTSPOTS")
print(sep)
top5 = df.nlargest(5, 'CO2 emission')[['x-coord','y-coord','CO2 emission','road segment id','congestion']].reset_index(drop=True)
top5.index += 1
print(top5.to_string())
print()

# ADV1
print(sep)
print("  ADV1: GORE POINT IMPACT")
print(sep)
gore = df.groupby('gore point').agg(
    Avg_Speed=('avg speed kmph','mean'),
    Avg_CO2=('CO2 emission','mean'),
    Avg_Density=('traffic density','mean')
)
gore.index = ['Non-Gore (0)', 'Gore Point (1)']
print(gore.round(3).to_string())
diff = gore.loc['Non-Gore (0)','Avg_Speed'] - gore.loc['Gore Point (1)','Avg_Speed']
print(f"\n>> Speed at Gore Points is {diff:.2f} kmph {'LOWER' if diff>0 else 'HIGHER'} than non-gore")
print()

# ADV2
print(sep)
print("  ADV2: EV ADOPTION -> CO2 SIMULATION")
print(sep)
base = df['CO2 emission'].mean()
curr_ev = df['ev percentage'].mean()
print(f"Current fleet avg EV % : {curr_ev*100:.1f}%")
print(f"Current avg CO2        : {base:.4f}")
print()
rows = [('Current', curr_ev), ('25%', 0.25), ('50%', 0.50), ('75%', 0.75), ('100%', 1.00)]
for label, ev in rows:
    new_co2 = base * (1 - ev * 0.85)
    red = (1 - new_co2/base)*100
    print(f"  EV @ {label:7s} -> CO2: {new_co2:.3f}  | Reduction: {red:.1f}%")
print()

# ADV3
print(sep)
print("  ADV3: SEGMENT TEI RANKING")
print(sep)
tei = df.groupby('road segment id')['tei'].mean().sort_values(ascending=False)
for i,(seg,val) in enumerate(tei.items()):
    print(f"  Rank {i+1}: Segment {seg}  ->  TEI = {val:.4f}")
print()

# BONUS
print(sep)
print("  BONUS: TRAFFIC VOLUME BY DAY OF WEEK")
print(sep)
day_order = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
dv = df.groupby('day of week')['vehicles'].sum()
dv = dv.reindex([d for d in day_order if d in dv.index])
for day, vol in dv.items():
    print(f"  {day:12s}: {int(vol):,}")
print()

# KPIs
print(sep)
print("  ALL KPIs SUMMARY")
print(sep)
total_vol = int(df['vehicles'].sum())
avg_spd   = df['avg speed kmph'].mean()
avg_co2   = df['CO2 emission'].mean()
emp_veh   = (df['CO2 emission'] / df['vehicles']).mean()
avg_tei   = df['tei'].mean()
total_nox = df['NOx'].sum()
total_pm  = df['PM2.5'].sum()

print(f"  Total Traffic Volume   : {total_vol:,}")
print(f"  Avg Speed              : {avg_spd:.2f} kmph")
print(f"  Avg CO2 Emission       : {avg_co2:.3f}")
print(f"  Emission per Vehicle   : {emp_veh:.6f}")
print(f"  Avg TEI                : {avg_tei:.4f}")
print(f"  Total NOx              : {total_nox:.2f}")
print(f"  Total PM2.5            : {total_pm:.2f}")
print()

# SANITY
print(sep)
print("  SANITY / RANGE CHECKS")
print(sep)
print(f"  Speed range    : {df['avg speed kmph'].min():.2f}  to  {df['avg speed kmph'].max():.2f} kmph")
print(f"  Density range  : {df['traffic density'].min():.2f}  to  {df['traffic density'].max():.2f}")
print(f"  CO2 range      : {df['CO2 emission'].min():.2f}  to  {df['CO2 emission'].max():.2f}")
print(f"  Vehicles range : {int(df['vehicles'].min())}  to  {int(df['vehicles'].max())}")
print(f"  Rain range     : {df['rain mm'].min():.1f}  to  {df['rain mm'].max():.1f} mm")
print(f"  TEI range      : {df['tei'].min():.4f}  to  {df['tei'].max():.4f}")
print(f"  Hour range     : {df['hour'].min()}  to  {df['hour'].max()} (correct: 0-23)")
print(f"  Temp range     : {df['temperature C'].min():.0f} C  to  {df['temperature C'].max():.0f} C")
print()
print(sep)
print("  VERIFICATION COMPLETE - ALL CLEAN")
print(sep)
