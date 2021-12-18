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
from selenium import webdriver
from webdriver_manager.chrome import ChromeDriverManager

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

if (os.getenv('env') == 'local'): driver = webdriver.Chrome(ChromeDriverManager().install())
else: driver = webdriver.Chrome(options=chrome_options)

@app.route('/', methods=['GET'])
def main():
  print ('Main Called')
  urls = pull_urls(os.getenv('acknowledge_messages'))
  data = np.array([])
  print('Pulling urls', urls)

  if (len(urls) > 0):
    for single_url in urls:
      single_data = parse_single_url(driver, single_url)
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

    upload_dataframe(dataframe)
  # dataframe.to_csv('test.csv')

  return 'Scraped!', 200

if __name__ == '__main__':
  app.run(host='0.0.0.0',port=int(os.environ.get('PORT',8080)))
  # main()