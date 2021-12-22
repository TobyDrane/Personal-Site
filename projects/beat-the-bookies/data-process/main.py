from numpy.lib.shape_base import split
import pandas as pd
from datetime import datetime
from google.cloud import storage

def check_and_split(string):
  splits = string.split('\n')
  if (len(splits) > 1):
    # The list of valid bookies that we can place Bets on
    valid_bookies = [
      'bet-at-home', 'William Hill', 'bwin', 'Coolbet', 'GGBET', \
        'Marathonbet', 'Pinnacle', 'Unibet'
    ]
    common = list(set(splits).intersection(valid_bookies))
    if (len(common) > 0): return common[0]
    else: return splits[0]
  else:
    return string

def function_trigger(event, context):
  try:
    if (event):
      bucket = event['bucket']
      file = event['name']

      if (file and (file.split('/')[0] == 'odds-portal-raw')):
        file_name = file.split('/')[1]
        parts = file_name.split('-', 3)

        dataframe = pd.read_json(f'gs://{bucket}/{file}', orient = 'records')
        # dataframe = pd.read_csv('odds-portal-raw_odds-portal-raw-2021-12-13T19_30_06.479603.csv')
        if (not dataframe.empty):
          print(dataframe.info())
          print(dataframe)
          dataframe['bookie'] = dataframe['bookie'].astype('str')
          dataframe_copy = dataframe.copy()
          dataframe_copy['game_date'] = pd.to_datetime(dataframe_copy['game_date'])
          dataframe_copy['home_odds'] = pd.to_numeric(dataframe_copy['home_odds'])
          dataframe_copy['away_odds'] = pd.to_numeric(dataframe_copy['away_odds'])
          dataframe_copy['draw_odds'] = pd.to_numeric(dataframe_copy['draw_odds'])

          # Calculate the consensus odds across different bookies for given games on given days
          dataframe_consensus = dataframe_copy.groupby(by=['game_date', 'game_name']).mean()

          # Calculate the max odds for different outcomes across bookies for given games on given days
          dataframe_max = dataframe_copy.join(
            dataframe_copy.groupby(by=['game_date', 'game_name'])[['home_odds', 'away_odds', 'draw_odds']].max(),
            on=['game_date', 'game_name'],
            rsuffix='_max'
          )

          for i, frame in dataframe_max.groupby(by=['game_name']):
            x = frame['bookie'][(frame['home_odds'] == frame['home_odds_max'])].to_string(index = False)
            y = frame['bookie'][(frame['away_odds'] == frame['away_odds_max'])].to_string(index = False)
            z = frame['bookie'][(frame['draw_odds'] == frame['draw_odds_max'])].to_string(index = False)
            x = check_and_split(x)
            y = check_and_split(y)
            z = check_and_split(z)

            dataframe_max.loc[dataframe_max['game_name'] == i, 'max_home_bookie'] = x
            dataframe_max.loc[dataframe_max['game_name'] == i, 'max_away_bookie'] = y
            dataframe_max.loc[dataframe_max['game_name'] == i, 'max_draw_bookie'] = z
        
          dataframe_consensus = dataframe_max.groupby(by=['game_date', 'game_name', 'max_draw_bookie',	'max_away_bookie',	'max_home_bookie'], as_index=False).mean()

          print(dataframe_consensus)
          print(dataframe_consensus)
          print(dataframe_consensus['max_home_bookie'])
          print(dataframe_consensus['max_away_bookie'])
          print(dataframe_consensus['max_draw_bookie'])

          # Save processed dataframe now back to Google Cloud Storage
          client = storage.Client()
          storage_bucket = client.get_bucket(bucket)
          storage_bucket.blob(f'odds-portal-processed/odds-portal-processed-{parts[-1]}') \
            .upload_from_string(dataframe_consensus.to_json(orient = 'records'), 'text/json')
          # dataframe.to_csv(f'gs://betting-algorithms/odds-portal-processed/odds-portal-processed-{parts[-1]}')

  except Exception as e:
    raise(e)