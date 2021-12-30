from logging import debug
import os
from re import sub
import sys
import time
import numpy as np
import cloudscraper
import json
import subprocess

from fractions import Fraction
from dateutil import parser
from bs4 import BeautifulSoup
from selenium import webdriver
from webdriver_manager import chrome
from webdriver_manager.chrome import ChromeDriverManager

identifiers_dictionary = {
  'B3': 'Bet365',
  'SK': 'Skybet',
  'PP': 'Paddy Power',
  'WH': 'William Hill',
  'EE': '888sport',
  'FB': 'Betfair Sportsbook',
  'VC': 'Bet Victor',
  'CE': 'Coral',
  'UN': 'Unibet',
  'MI': 'Mansion Bet',
  'FR': 'Betfred',
  'RK': 'Smarkets Sportsbook',
  'WA': 'Betway',
  'BY': 'Boyle Sports',
  'OE': '10Bet',
  'SA': 'Sport Nation',
  'NV': 'Novibet',
  'SI': 'Sporting Index',
  'SX': 'Spreadex',
  'QN': 'Quinnbet',
  'LD': 'Ladbrokes',
  'RM': 'Parimatch',
  'VT': 'VBet',
  'BF': 'Betfair',
  'MK': 'Smarkets',
  'MA': 'Matchbook'
}

def get_market_id(json):
  markets = json['bestOdds']['markets']
  entities = markets['entities']
  keys = entities.keys()
  for key in keys:
    current = entities[key]
    if (current['marketTypeName'] == 'Win Market'):
      return current['ocMarketId']

def get_bet_ids(market_id, json):
  bets = json['bestOdds']['bets']
  entities = bets['entities']
  keys = entities.keys()
  ids = {}
  for key in keys:
    current = entities[key]
    if (current['marketId'] == market_id):
      bet_name = current['betName']
      ids[bet_name] = current['ocBetId']

  return ids

def get_odds_dict(bet_ids, json):
  odds = json['bestOdds']['odds']
  odds_dict = {}
  keys = bet_ids.keys()
  for key in keys:
    id = bet_ids[key]
    odds_dict[key] = odds.get(str(id))

  return odds_dict

def get_game_details(header_json, data_json):
  game_name = header_json.get('subeventName')
  game_date = header_json.get('subeventStartTime')
  data = data_json.get('bestOdds')
  home = data.get('subeventConfig').get('homeTeamName')
  away = data.get('subeventConfig').get('awayTeamName')

  return home, away, game_date, game_name

def parse_single_url(chrome_options, url):
  if (os.getenv('env') == 'local'): driver = webdriver.Chrome(ChromeDriverManager().install(), options=chrome_options)
  else: driver = webdriver.Chrome(options=chrome_options)

  master_data = []
  try:
    # driver.set_window_size(2400, 800)
    driver.get(str(url))
    print(f'Scraping {url}')
    time.sleep(2)

    header = driver.find_element_by_xpath('//script[@data-hypernova-key="subeventheader"]')
    header_json_raw = header.get_attribute('innerText').replace('<!--', '').replace('-->', '')
    header_json = json.loads(str(header_json_raw))

    data = driver.find_element_by_xpath('//script[@data-hypernova-key="subeventmarkets"]')
    data_json_raw = data.get_attribute('innerText').replace('<!--', '').replace('-->', '')
    data_json = json.loads(str(data_json_raw))

    home, away, game_date, game_name = get_game_details(header_json, data_json)
    market_id = get_market_id(data_json)
    bet_ids = get_bet_ids(market_id, data_json)
    odds = get_odds_dict(bet_ids, data_json)

    odds_keys = list(odds.keys())
    bookies_ids_list = list(odds[odds_keys[0]].keys())

    for identifier in bookies_ids_list:
      bookie_id_home = odds.get(home).get(identifier)
      bookie_id_away = odds.get(away).get(identifier)
      bookie_id_draw = odds.get('Draw').get(identifier)
      bookie = identifiers_dictionary.get(identifier)
      home_odds = bookie_id_home.get('oddsDecimal')
      away_odds = bookie_id_away.get('oddsDecimal')
      draw_odds = bookie_id_draw.get('oddsDecimal')
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
      master_data.append(current_data_row)

  except Exception as e:
    exc_type, exc_obj, exc_tb = sys.exc_info()
    print(exc_type, exc_tb.tb_lineno)
    print(e)
    raise(e)
  finally:
    return np.asarray(master_data)