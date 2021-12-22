import os
import time
import numpy as np
import pandas as pd
from dotenv import load_dotenv
from selenium.webdriver.chrome.options import Options
from io_handler import pull_urls
from io_handler import upload_dataframe
from scrape import parse_single_url
from flask import Flask

load_dotenv()
app = Flask(__name__)

def set_chrome_options():
  """
  Sets chrome options for Selenium.
  Chrome options for headless browser is enabled.
  """
  chrome_options = Options()
  chrome_options.add_argument("--headless")
  chrome_options.add_argument("--no-sandbox")
  chrome_options.add_argument("--disable-gpu")
  chrome_options.add_argument("window-size=1024,768")
  #chrome_options.add_argument("--disable-dev-shm-usage")
  chrome_prefs = {}
  chrome_options.experimental_options["prefs"] = chrome_prefs
  chrome_prefs["profile.default_content_settings"] = { "images": 2 }
  return chrome_options

chrome_options = set_chrome_options()

@app.route('/', methods=['GET'])
def main():
  print ('Main Called')
  urls = pull_urls(os.getenv('acknowledge_messages'))
  data = np.array([])
  print('Pulling urls', urls)

  if (len(urls) > 0):
    for single_url in urls:
      single_data = parse_single_url(chrome_options, single_url)
      print(single_data)
      time.sleep(1)
      
      if data.size != 0: data = np.concatenate((data, single_data))
      else: data = single_data

      print(f'Scraped {single_url}')

    dataframe = pd.DataFrame(
      data = data,
      columns = [
        'game_date', 'game_name', 'home', 'away', \
          'bookie', 'home_odds', 'away_odds', 'draw_odds', 'winner'
      ]  
    )

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
      a = i
      b = frame
      x = frame['bookie'][(frame['home_odds'] == frame['home_odds_max'])].to_string(index = False)
      y = frame['bookie'][(frame['away_odds'] == frame['away_odds_max'])].to_string(index = False)
      z = frame['bookie'][(frame['draw_odds'] == frame['draw_odds_max'])].to_string(index = False)

      dataframe_max.loc[dataframe_max['game_name'] == a, 'max_home_bookie'] = x
      dataframe_max.loc[dataframe_max['game_name'] == a, 'max_away_bookie'] = y
      dataframe_max.loc[dataframe_max['game_name'] == a, 'max_draw_bookie'] = z
  
    dataframe_consensus = dataframe_max.groupby(by=['game_date', 'game_name', 'max_draw_bookie',	'max_away_bookie',	'max_home_bookie'], as_index=False).mean()

    upload_dataframe(dataframe_consensus)
  # dataframe.to_csv('test.csv')

  return 'Scraped!', 200

if __name__ == '__main__':
  app.run(host='0.0.0.0',port=int(os.environ.get('PORT',8080)))
  # main()
