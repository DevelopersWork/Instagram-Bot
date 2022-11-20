import os

import datetime
import json
import requests
import logging

from apiclient.discovery import build

class YouTubeDataAPI:
    def __init__(self, api_key, dir):
        logging.debug("YouTubeDataAPI.__init__():: {STARTED}")

        self.__api = build('youtube', 'v3', developerKey = api_key)
        self.__dir = dir.rstrip('/') + "/YouTubeDataAPI/"

        logging.info("YouTubeDataAPI.__init__():: {0}".format(self.__dir))

        self.defaults = {}
        try:
            with open('lib/defaults.json', 'r') as fd:
                data = json.load(fd)
                if 'YouTubeDataAPI' in data.keys():
                    self.defaults = data['YouTubeDataAPI']
        except Exception as ex:
            logging.error("YouTubeDataAPI.__init__():: {0}".format(ex))

    def search(self, query):
        logging.debug("YouTubeDataAPI.search():: {STARTED}")
        try:
            dir = self.__setup()
            
            params = {}
            if 'search' in  self.defaults:
                params = self.defaults['search'].copy()
            params.update(query)

            logging.info("YouTubeDataAPI.search():: {0}".format(params))

            request = self.__api.search().list(**params)
            response = request.execute()
            
            with open(
                "{0}/{1}.json".format(dir.rstrip("/"), response['etag']), 
                'w'
            ) as fd:
                json.dump(response, fd)

            return response
        except Exception as ex:
            logging.error("YouTubeDataAPI.search():: {0}".format(ex))

        return {}

    def isShort(self, videoId):
        logging.debug("YouTubeDataAPI.isShort():: {STARTED}")

        try:        
            url = "https://www.youtube.com/shorts/{0}".format(videoId)
            logging.debug("YouTubeDataAPI.isShort():: {0}".format(url))

            response = requests.get(url, allow_redirects=False)
            if response.status_code == 200:
                return True

            logging.debug("YouTubeDataAPI.isShort():: {0}".format(response.text))
        except Exception as ex:
            logging.error("YouTubeDataAPI.isShort():: {0}".format(ex))

        return False

    def __setup(self):
        logging.debug("YouTubeDataAPI.__setup():: {STARTED}")
        self.__timestamp = datetime.datetime.now().strftime('%Y-%m-%dT00:00:00Z')
        self.__dir_exists = False

        dir = self.__dir.rstrip('/') + "/" + self.__timestamp
        if not os.path.exists(dir):
            os.makedirs(dir, exist_ok=True)
        else:
            self.__dir_exists = True

        logging.debug("YouTubeDataAPI.__setup():: {0}".format(dir))

        return dir