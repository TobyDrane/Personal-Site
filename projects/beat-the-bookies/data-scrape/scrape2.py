import os
import time
import numpy as np

from fractions import Fraction
from dateutil import parser
from bs4 import BeautifulSoup
from selenium import webdriver
from webdriver_manager.chrome import ChromeDriverManager

def get_teams_get_date(header_content):
  header_content_inner = header_content.find_all('div')[0]
  game_name = header_content_inner.find_all('h1')[0].get_text()
  game_name = game_name.replace('Betting Odds', '')
  home = game_name.split('vs')[0].strip()
  away = game_name.split('vs')[1].strip()
  game_date = header_content_inner.find_all('span')[-1].get_text()
  game_date = parser.parse(game_date.split('(')[0].strip())

  return home, away, game_date, game_name

def get_odds(item):
  bookie, home_odds, draw_odds, away_odds = item
  bookie_name = bookie.get('title', None)

  home_odds_string = str(home_odds.get_text())
  draw_odds_string = str(draw_odds.get_text())
  away_odds_string = str(away_odds.get_text())

  home_odds_float = 1 + round(float(Fraction(home_odds_string)), 2)
  draw_odds_float = 1 + round(float(Fraction(draw_odds_string)), 2)
  away_odds_float = 1 + round(float(Fraction(away_odds_string)), 2)

  return bookie_name, home_odds_float, draw_odds_float, away_odds_float

def parse_single_url(chrome_options, url):
  if (os.getenv('env') == 'local'): driver = webdriver.Chrome(ChromeDriverManager().install())
  else: driver = webdriver.Chrome(options=chrome_options)

  data = []
  try:
    driver.set_window_size(2400, 800)
    driver.get(str(url))
    print(f'Scraping {url}')

    soup = BeautifulSoup(driver.page_source, 'html.parser')
    time.sleep(4)

    header_content = soup.find(id='subevent-header')

    home, away, game_date, game_name = get_teams_get_date(header_content)

    bookies_content = soup.select('div[class*="BookmakersRowOuterWrapper_"]')
    odds_content = soup.select('div[class*="oddsAreaWrapper_"]')
    if (len(bookies_content) == 1 and len(odds_content) == 3):
      home_odds_list = list(odds_content[0].find_all('button'))
      draw_odds_list = list(odds_content[1].find_all('button'))
      away_odds_list = list(odds_content[2].find_all('button'))

      bookies_content = list(bookies_content[0].children)[0]
      bookies_list = list(bookies_content.find_all('a'))

      if ((len(bookies_list) / 2) == len(home_odds_list)):
        if (len(home_odds_list) == len(draw_odds_list) == len(away_odds_list)):
          bookies_list = bookies_list[1::2]
          odds_table = zip(bookies_list, home_odds_list, draw_odds_list, away_odds_list)

          for item in odds_table:
            bookie, home_odds, draw_odds, away_odds = get_odds(item)
            current_data_row = [
              game_date,
              game_name,
              home,
              away,
              bookie,
              home_odds,
              away_odds,
              draw_odds,
              None
            ]
            data.append(current_data_row)

        else:
          print('Odds list mismatched error')
      else:
        print('Bookies list mismatched error')

  except Exception as e:
    print('Error', e)
    raise(e)
  finally:
    return np.asarray(data)