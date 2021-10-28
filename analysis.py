import pandas as pd

#Load DataFrame from CSV file
dfgames = pd.read_csv('2021_10_27_ttsarmada_cloud.csv')

#Explore!
print("\nNumber of Fleets:",
    len(dfgames))
print("\nNumber of Games per commander:\n",
    dfgames['commander'].value_counts())
print("\nAvg Score per objective as 2nd Player:\n",
    dfgames.query('first == False').groupby('objective').agg({'MoV':['count','mean']}))
#Requires FULL NAME (COST)! 
print("\nAvg MoV or Romodi and Onager Fleets:\n",
    dfgames.groupby(['General Romodi (20)','Onager-class Testbed (96)','Onager-class Star Destroyer (110)']).agg({'MoV':['count','mean'],'name':[pd.Series.nunique]}))
#Read Across, blanks are filled in by rows above.
#No Romodi, 1 Testbed has 134 games Averaging 46.9 MoV from 36 distinct players
#Romodi, 2 Testbed has 49 games averaging 131 MoV from 11 distinct players. 
