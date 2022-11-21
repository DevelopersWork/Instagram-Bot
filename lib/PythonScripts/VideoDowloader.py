import os
import logging

from pytube import YouTube

class VideoDowloader:
    def __init__(self, dir: str) -> None:
        """
        Constructor

        :param str dir: directory to save the dowloaded videos
        :return: None
        """
        logging.debug("VideoDowloader.__init__():: {STARTED}")

        self.__dir = dir.rstrip('/') + "/VideoDowloader/"

    def youtube(self, videoId: str) -> None:
        """
        Downloads the YouTube video from the provided videoId

        :param str videoId: id of the video
        :return: None
        """
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