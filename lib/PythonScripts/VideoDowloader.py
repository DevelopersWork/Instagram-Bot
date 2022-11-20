import os
import logging

from pytube import YouTube

class VideoDowloader:
    def __init__(self, dir) -> None:
        logging.debug("VideoDowloader.__init__():: {STARTED}")

        self.__dir = dir.rstrip('/') + "/VideoDowloader/"
        pass

    def youtube(self, videoId):
        logging.debug("VideoDowloader.youtube():: {STARTED}")
        try:
            dir = "{0}/{1}".format(self.__dir.rstrip('/'), videoId.strip('/'))
            if os.path.exists(dir):
                return None

            logging.info("VideoDowloader.youtube():: {0}".format(videoId))

            link = "https://www.youtube.com/watch?v={0}".format(videoId)
            
            yt = YouTube(link)
            ys = yt.streams.get_highest_resolution()
            ys.download(dir)
            
        except Exception as ex:
            logging.error("VideoDowloader.youtube():: {0}".format(ex))