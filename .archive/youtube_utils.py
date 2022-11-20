import os
import sys
import datetime
import json
import shutil

import requests

from dotenv import load_dotenv
from apiclient.discovery import build
from pytube import YouTube

class YouTubeUtils:
    def __init__(self, params={}):
        print("YouTubeUtils.__init__():: {STARTED}")
        self.__params = params
        self.__youtube_api = build('youtube', 'v3', developerKey = self.__params['YT_API_KEY'])
        # self.__timestamp = (datetime.datetime.now() + datetime.timedelta(-1)).strftime('%Y-%m-%dT00:00:00Z')
        self.__timestamp = datetime.datetime.now().strftime('%Y-%m-%dT00:00:00Z')
        self.exists = False

        self.__dir = "{0}/videos/".format(self.__params['DIR'])
        if os.path.exists(self.__dir):
            if os.path.exists("{0}{1}".format(self.__dir, self.__timestamp)):
                self.exists = True
            else:
                shutil.rmtree(self.__dir)
        else:
            os.makedirs(self.__dir, exist_ok=True)

        os.makedirs(self.__params['DIR'] + "/screenshots", exist_ok=True)
        self.query = self.__readQueryJSON()

    def __readQueryJSON(self):
        try:
            with open('query.json', 'r') as file:
                return json.load(file)
        except Exception as ex:
            print(ex)
        return {}

    def __writeQueryJSON(self):
        try:
            with open('query.json', 'w') as file:
                return json.dump(self.query, file)
        except Exception as ex:
            print(ex)
        return {}

    def __video_dowloader(self, videoId):
        print("YouTubeUtils.__video_dowloader({0}):: {1}".format(videoId, "STARTED"))
        link = "https://www.youtube.com/watch?v={0}".format(videoId)
        yt = YouTube(link)
        ys = yt.streams.get_highest_resolution()
        ys.download("{1}/videos/{2}/{0}".format(
            videoId,
            self.__params['DIR'],
            self.__timestamp
        ))

    def __fetch_videos(self, query):
        print("YouTubeUtils.__fetch_videos({0}):: {1}".format(query, "STARTED"))
        params = {
            'part': 'snippet',
            'order': 'date',
            'type': 'video',
            'maxResults': self.__params['YT_SEARCH_MAX_RESULTS'],
            'videoDuration': 'short'
        }
        if 'q' in query.keys() and query['q']:
            params['q'] = query['q']
        if 'channelId' in query.keys() and query['channelId']:
            params['channelId'] = query['channelId']
        if 'relatedToVideoId' in query.keys() and query['relatedToVideoId']:
            params['relatedToVideoId'] = query['relatedToVideoId']
        if 'publishedBefore' in query.keys() and query['publishedBefore']:
            params['publishedBefore'] = query['publishedBefore']
        if 'publishedAfter' in query.keys() and query['publishedAfter']:
            params['publishedAfter'] = query['publishedAfter']
        if 'maxResults' in query.keys() and query['maxResults']:
            params['maxResults'] = query['maxResults']

        request = self.__youtube_api.search().list(**params)
        response = request.execute()

        print("YouTubeUtils.__fetch_videos({0}):: {1}".format(query, len(response['items'])))

        return response

    def download(self):
        print("YouTubeUtils.download():: {STARTED}")
        if self.exists == True:
            return None

        items = []
        for query in self.query:
            videos = self.__fetch_videos(query)
            nitems = []

            dates = []
            for item in videos['items']:
                videoId = item['id']['videoId']
                # url = "https://yt.lemnoslife.com/videos?part=short&id={0}".format(videoId)
                url = "https://www.youtube.com/shorts/{0}".format(videoId)

                response = requests.get(url, allow_redirects=False)
                if response.status_code == 200:
                    nitems.append(item)
                    dates.append(item['snippet']['publishedAt'])
                else:
                    print("YouTubeUtils.download({0}):: {1}".format(videoId, response))
            items += nitems
            if len(nitems):
                query['publishedAfter'] = max(dates)
                print("YouTubeUtils.download():: {0}: {1}".format(query, len(nitems)))
            else:
                query['publishedAfter'] = "1999-01-01T00:00:00Z"

        for video in items:
            self.__video_dowloader(video['id']['videoId'])

        with open(
            "{0}/yt_videos_list.json".format(self.__params['DIR']), "w"
        ) as file:
            json.dump(items, file)

        self.__writeQueryJSON()

        print("{0} videos batch is dowloaded".format(self.__timestamp))
        
if __name__ == '__main__':
    load_dotenv()

    if len(sys.argv) < 2:
        print("Usage: Python {0} <TEMP_DIR>".format(sys.argv[0]))
        sys.exit(0)

    yt = YouTubeUtils({
        'DIR': sys.argv[1].rstrip('/'),
        'YT_API_KEY': os.getenv('YT_API_KEY') if os.getenv('YT_API_KEY') else '',
        'YT_SEARCH_MAX_RESULTS': os.getenv('YT_SEARCH_MAX_RESULTS') if os.getenv('YT_SEARCH_MAX_RESULTS') else '',
    })
    yt.download()

    sys.exit(1)