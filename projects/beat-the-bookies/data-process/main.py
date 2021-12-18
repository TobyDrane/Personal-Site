import pandas as pd
from datetime import datetime
from google.cloud import storage

def function_trigger(event, context):
  try:
    if (event):
      bucket = event['bucket']
      file = event['name']

      if (file and (file.split('/')[0] == 'odds-portal-raw')):
        file_name = file.split('/')[1]
        parts = file_name.split('-', 3)

        # dataframe = pd.read_csv(f'gs://{bucket}/{file}')
        dataframe = pd.read_csv('odds-portal-raw_odds-portal-raw-2021-12-13T19_30_06.479603.csv')
        if (not dataframe.empty):
          dataframe_copy = dataframe.copy()
          dataframe_copy['game_date'] = pd.to_datetime(dataframe_copy['game_date'])
          dataframe_copy['home_odds'] = pd.to_numeric(dataframe_copy['home_odds'])
          dataframe_copy['away_odds'] = pd.to_numeric(dataframe_copy['away_odds'])
          dataframe_copy['draw_odds'] = pd.to_numeric(dataframe_copy['draw_odds'])

          # Calculate the consensus odds across different bookies for given games on given days
          dataframe_consensus = dataframe_copy.groupby(by=['game_date', 'game_name']).mean().reset_index()
          
          # Calculate the max odds for different outcomes across bookies for given games on given days
          dataframe_max = dataframe_copy.join(
            dataframe_copy.groupby(by=['game_date', 'game_name'])['home_odds', 'away_odds', 'draw_odds'].max(),
            on=['game_date', 'game_name'],
            rsuffix='_max'
          )

          dataframe_max['max_home_bookie'] = None
          dataframe_max['max_away_bookie'] = None
          dataframe_max['max_draw_bookie'] = None

          for i in dataframe_max.groupby(by=['game_date', 'game_name']):
            (a, b) = i
            (c, d) = a

            dataframe_max.loc[(dataframe_max.date == c) & (dataframe_max.game_name == d), 'max_home_bookie'] = b['bookie'][(b['home_odds'] == b['home_odds_max'])].any()
            dataframe_max.loc[(dataframe_max.date == c) & (dataframe_max.game_name == d), 'max_draw_bookie'] = b['bookie'][(b['draw_odds'] == b['draw_odds_max'])].any()
            dataframe_max.loc[(dataframe_max.date == c) & (dataframe_max.game_name == d), 'max_away_bookie'] = b['bookie'][(b['away_odds'] == b['away_odds_max'])].any()

          dataframe_consensus = dataframe_max.groupby(by=['game_date', 'game_name', 'max_draw_bookie',	'max_away_bookie',	'max_home_bookie'], as_index=False).mean().reset_index()
          dataframe_consensus = dataframe_consensus.sort_values(by='game_date', ascending=True).reset_index()
          dataframe = dataframe_consensus[
            [
              'game_date', 'game_name', 'home_odds', 'away_odds', 'draw_odds', 'max_home_bookie', 'max_away_bookie', 'max_draw_bookie', 
              'home_odds_max', 'away_odds_max', 'draw_odds_max', 'winner'
            ]
          ]

          # Save processed dataframe now back to Google Cloud Storage
          client = storage.Client()
          storage_bucket = client.get_bucket(bucket)
          storage_bucket.blob(f'odds-portal-processed/odds-portal-processed-{parts[-1]}') \
            .upload_from_string(dataframe.to_csv(), 'text/csv')

  except Exception as e:
    raise(e)