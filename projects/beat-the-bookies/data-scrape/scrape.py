import os
import time
import numpy as np
from datetime import datetime
from fractions import Fraction
from bs4 import BeautifulSoup
from selenium.webdriver.support.ui import WebDriverWait

"""
def fraction_to_float(frac_str):
    try:
        return float(frac_str)
    except ValueError:
        num, denom = frac_str.split('/')
        try:
            leading, num = num.split(' ')
            whole = float(leading)
        except ValueError:
            whole = 0
        frac = float(num) / float(denom)
        return whole - frac if whole < 0 else whole + frac
"""

def fraction_to_float(string):
  return float(sum(Fraction(s) for s in string.split()))

def get_teams_get_date(master_content):
  game_name = str(master_content.find('h1').get_text())
  home = game_name.split('-')[0].strip()
  away = game_name.split('-')[1].strip()
  game_date = str(master_content.find('p').get_text())
  game_date = game_date.replace('Yesterday, ', '')
  
  return home, away, game_date, game_name

def get_winner(master_content):
  try:
    if str(master_content.find(class_='_result').find('strong').get_text()):
      result_string = str(master_content.find(class_='_result').find('strong').get_text())
      home_score = int(result_string.split(':')[0])
      
      if ('penalties' in result_string.split(':')[1]):
        away_score = result_string.split(':')[1]
        away_score = int(away_score.split('penalties')[0])
      else:
        away_score = int(result_string.split(':')[1])
      
      if home_score > away_score:
        winner = 'home'
      elif away_score > home_score:
        winner = 'away'
      else:
        winner = 'draw'
    else:
      winner = None

  except Exception as e:
    winner = None

  return winner

def get_odds(odds_child):
  tr_child = list(odds_child.children)

  if (len(tr_child) > 4):
    # bookie = str(tr_child[0].find(class_='name').get_text())
    bookie = str(tr_child[0].findAll('a')[1].get_text())
    
    try:
      home_odds_string = str(tr_child[1].find('div').get_text())
    except Exception:
      home_odds_string = str(tr_child[1].find('a').get_text())
    home_odds = (fraction_to_float(home_odds_string) / 100.0)
    print(home_odds_string)
    print(home_odds)

    try:
      draw_odds_string = str(tr_child[2].find('div').get_text())
    except Exception:
      draw_odds_string = str(tr_child[2].find('a').get_text())
    draw_odds = (fraction_to_float(draw_odds_string) / 100.0)

    try:
      away_odds_string = str(tr_child[3].find('div').get_text())
    except Exception:
      away_odds_string = str(tr_child[3].find('a').get_text())
    away_odds = (fraction_to_float(away_odds_string) / 100.0)

    return bookie, home_odds, away_odds, draw_odds
  else:
    return None, None, None, None

def parse_single_url(driver, url):
  """
  Takes a single OddsPortal game URL and scrapes all data about the game, score if
  applicable and bookies odds
  """
  data = []
  try:
    driver.set_window_size(800, 600)
    # driver.implicitly_wait(5)
    driver.get(str(url))
    print(f'Scraping {url}')
    soup = BeautifulSoup(driver.page_source, 'html.parser')
    time.sleep(2)

    master_content = soup.find(id='col-content')
    odds_table = master_content.find(class_='table-main').find('tbody')

    home, away, game_date, game_name = get_teams_get_date(master_content)
    winner = get_winner(master_content)
  
    for odds_child in odds_table:
      bookie, home_odds, away_odds, draw_odds = get_odds(odds_child)
      if (bookie and home_odds and away_odds and draw_odds):
        # date = datetime.now().date().isoformat()
        current_data_row = [
          game_date,
          game_name,
          home,
          away,
          bookie,
          home_odds,
          away_odds,
          draw_odds,
          winner,
        ]
        data.append(current_data_row)
  except Exception as e:
    print('Error', e)
    raise(e)
  finally:
    return np.asarray(data)
