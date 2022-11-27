import os
import sys
import json
import datetime

from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor

import logging

from YouTubeDataAPI import YouTubeDataAPI
from VideoDowloader import VideoDowloader

global youtube_data_api, video_dowloader
global KEY, DIR

def downloadShortsOnly(item):
    
    if youtube_data_api.isShort(item):
        return video_dowloader.youtube(item['id']['videoId'])

    return False

def main():
    logging.info("main():: {STARTED}")

    try:
        queries = []
        with open('query.json', 'r') as fd:
            queries = json.load(fd)

        with ProcessPoolExecutor(max_workers = 4) as processPool:
            processPool.map(youtube_data_api.search, queries)
            
        timestamp = datetime.datetime.now().strftime('%Y-%m-%dT00:00:00Z')
        dir = "{0}/{1}/{2}".format(
            DIR.rstrip('/'),
            "YouTubeDataAPI",
            timestamp
        )
        
        items = []
        for file in os.listdir(dir):
            with open("{0}/{1}".format(dir, file), 'r') as fd:
                data = json.load(fd)
                items.extend(data['items'])

        with ThreadPoolExecutor(max_workers = 8) as threadPool:
            threadPool.map(downloadShortsOnly, items)
            
        logging.info("main():: {COMPLETED}")
        sys.exit(1)
    except Exception as ex:
        logging.error("main():: {0}".format(ex))
        

if __name__ == '__main__':
    # Usage: Python <script.py> <youtube api key> <temporary directory>
    if len(sys.argv) < 3:
        print("Usage: Python {0} <YT_API_KEY> <TEMP_DIR>".format(sys.argv[0]))
        sys.exit(0)

    logging.basicConfig(format='%(levelname)s:%(message)s', level=logging.INFO)

    # youtube api key to access youtube data api
    KEY = sys.argv[1].rstrip(' ')

    # temporary directory to store indermediates
    DIR = os.path.abspath(sys.argv[2].rstrip('/') + "/pythonScripts/")
    if not os.path.exists(DIR):
        os.makedirs(DIR, exist_ok=True)

    youtube_data_api = YouTubeDataAPI(KEY, DIR)
    video_dowloader = VideoDowloader(DIR)

    main()
