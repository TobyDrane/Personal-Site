from datetime import datetime
import os
from typing import List
from google.cloud import pubsub_v1
from google.cloud import storage

def pull_urls(urls, acknowledge: bool = False):
  urls = []
  project_id = os.getenv('project_id')
  subscription_id = os.getenv('url_sub_id')

  def callback(message: pubsub_v1.subscriber.message.Message):
    urls.append(message.data.decode())
    if (acknowledge):
      message.ack()

  subscriber = pubsub_v1.SubscriberClient()
  subscription_path = subscriber.subscription_path(project_id, subscription_id)
  streaming_pull_future = subscriber.subscribe(subscription_path, callback = callback)
  
  with subscriber:
    try:
      streaming_pull_future.result(timeout = 5)
    except Exception as e:
      print(e)
    finally:
      streaming_pull_future.cancel()
      streaming_pull_future.result()

  """
  # Wrap subscriber in a 'with' block to automatically call the close() to the channel
  # when request has finished
  with subscriber:
    response = subscriber.pull(
      request = {
        'subscription': subscription_path,
        'max_messages': 50
      }
    )

    # Used to keep track of all the message ids
    ack_ids = []
    if (response):
      for message in response.received_messages:
        urls.append(message.message.data)
        ack_ids.append(message.ack_id)

      # When we select the 'acknowledge' flag, we remove messages from system
      if (len(ack_ids) > 0 and (acknowledge == True)):
        subscriber.acknowledge(
          request = {
            'subscription': subscription_path,
            'ack_ids': ack_ids
          }
        )
  """

  return urls

def upload_dataframe(dataframe):
  try:
    client = storage.Client()
    bucket = client.get_bucket(os.getenv('bucket'))
    time = datetime.now().isoformat()
    bucket.blob(f'odds-portal-raw/odds-portal-raw-{time}.json') \
      .upload_from_string(dataframe.to_json(orient = 'records'), 'text/json')
  except Exception as e:
    raise(e)