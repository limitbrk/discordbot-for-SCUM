import asyncio
from datetime import datetime
import re
from typing import Iterator
import discord
import logging
from ftplib import FTP
from dateutil import parser
from replit import db

class LogJob :
  def __init__ (self, bot: discord.Client, cfg: dict):
    self._list = ["chat"]

    self._bot = bot
    self._config = cfg

    self._interval = self._config.get("interval")

    self._conn = FTP()
    self._conn.connect(self._config.get("host"),self._config.get("port"))
    self._conn.login(self._config.get("username"),self._config.get("password"))
    self._conn.cwd(self._config.get("logspath"))
    logging.info("FTP server login succeed!")

  def trigger (self) :
    for type in self._list :
      # previous = db.get(f"logs_{type}")
      # if(not previous):
        logging.info(f"This is a first time for \"{type}\"")

        self._getFileList(type)

  
  # def _getFileList (self, type: str) -> Iterator[tuple[str,dict[str,str]]] :
  def _getFileList (self, type: str) :
    result = self._conn.mlsd()
    for file_data in result:
        # extract returning data
        file_name, meta = file_data
        modify_date = meta.get("modify")
        print(f"{file_name:30} {modify_date}")


def get_size_format(n, suffix="B"):
  # converts bytes to scaled format (e.g KB, MB, etc.)
  for unit in ["", "K", "M", "G", "T", "P"]:
      if n < 1024:
          return f"{n:.2f}{unit}{suffix}"
      n /= 1024

def get_datetime_format(date_time):
    # convert to datetime object
    date_time = datetime.strptime(date_time, "%Y%m%d%H%M%S")
    # convert to human readable date time string
    return date_time.strftime("%Y/%m/%d %H:%M:%S")
