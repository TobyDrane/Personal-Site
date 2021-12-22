import pandas as pd
import numpy as np
from google.cloud import storage

def expected_payout(df, result):
  alpha = 0.05
  p_consensus = (1 / df[f'{result}_odds'])
  return (p_consensus - alpha) * df[f'{result}_odds_max'] - 1

def function_trigger(event, context):
  try:
    if (event):
      bucket = event['bucket']
      file = event['name']

      if (file and (file.split('/')[0] == 'odds-portal-processed')):
        file_name = file.split('/')[1]
        parts = file_name.split('-', 3)

        dataframe = pd.read_json(f'gs://{bucket}/{file}', orient = 'records')
        if (not dataframe.empty):
          home_expected_payout = expected_payout(dataframe, 'home')
          away_expected_payout = expected_payout(dataframe, 'away')
          draw_expected_payout = expected_payout(dataframe, 'draw')

          dataframe['home_expected_payout'] = home_expected_payout
          dataframe['away_expected_payout'] = away_expected_payout
          dataframe['draw_expected_payout'] = draw_expected_payout

          expected_payouts = pd.DataFrame({
            'payout0': home_expected_payout,
            'payout1': away_expected_payout,
            'payout2': draw_expected_payout
          })

          # Highest payout per match
          highest_expected_payout = np.max(expected_payouts, axis = 1)
          # Index of the highest payout
          highest_index = 1 + np.argmax(np.array(expected_payouts), axis = 1)

          matcher = {
            1: 'max_home_bookie', 2: 'max_away_bookie', 3: 'max_draw_bookie'
          }
    
          # The list of valid bookies that we can place Bets on
          valid_bookies = [
            'bet-at-home', 'William Hill', 'bwin', 'Coolbet', 'GGBET', \
              'Marathonbet', 'Pinnacle', 'Unibet'
          ]

          bets = []
          for ix, i in enumerate(highest_index):
            if highest_expected_payout.values[ix] > 0:
              if i > 0:
                bookies_to_bet_with = dataframe.iloc[[ix]][matcher[i]].values[0]
                # Check if this bookie is valid
                if (any(ext in bookies_to_bet_with for ext in valid_bookies)):
                  pass
                else:
                  # Do not bet with this Bookmaker
                  i = 0
                bets.append(i)
            else:
              bets.append(0)

          dataframe['bet_result'] = bets

          # Save processed dataframe now back to Google Cloud Storage
          client = storage.Client()
          storage_bucket = client.get_bucket(bucket)
          storage_bucket.blob(f'odds-portal-strategy/odds-portal-strategy-{parts[-1]}') \
            .upload_from_string(dataframe.to_json(orient = 'records'), content_type='text/json')

  except Exception as e:
    raise(e)