import os
import sys
import json
import threading

import logging

from YouTubeDataAPI import YouTubeDataAPI
from VideoDowloader import VideoDowloader

def main(key, dir):
    logging.info("main():: {STARTED}")
    if not os.path.exists(dir):
        os.makedirs(dir, exist_ok=True)

    youtube_data_api = YouTubeDataAPI(key, dir)
    video_dowloader = VideoDowloader(dir)

    try:
        queries = []
        with open('query.json', 'r') as fd:
            queries = json.load(fd)
    
        items = []
        for query in queries:
            
            result = youtube_data_api.search(query)
            date = query['publishedAfter'] if 'publishedAfter' in query.keys() else '1999-01-01T00:00:00Z'

            _items = []
            if 'items' in result.keys():
                for item in result['items']:
                    if youtube_data_api.isShort(item['id']['videoId']):
                        _items.append(item)
                        date = max(date, item['snippet']['publishedAt'])
            items.extend(_items)

            if 'publishedAfter' in query.keys():
                query['publishedAfter'] = date
        
        threads = []
        for item in items:
            t = threading.Thread(target=video_dowloader.youtube, args=(item['id']['videoId'],))
            t.start()
            threads.append(t)
            if len(threads)%5 == 0:
                for thread in threads:
                    thread.join()
                
        for t in threads:
            t.join()

        if queries:
            with open('query.json', 'w') as fd:
                json.dump(queries, fd)
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

    main(KEY, DIR)
