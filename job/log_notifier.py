import asyncio
import re
import discord
import logging
from ftplib import FTP
from dateutil import parser

class LogJob :
  def __init__ (self, bot: discord.Client, host: str, port: int, user: str, pwd: str):
    self._conn = FTP()
    self._conn.connect(host,port)
    self._conn.login(user,pwd)
    
    self._bot = bot

    logging.info('FTP connection succeed')
    
  def add_job(self, channel_id: int, path: str, type: str):
    noti = logNotifier(self._bot.get_channel(channel_id), self._conn, path, type)

class logNotifier :
  def __init__(self, channel, conn: FTP, path: str, type: str) :
    self._channel  = channel
    self._conn = conn
    self._path = path
    self._type = type


    self._conn.cwd(path)
    entries = list(self._conn.nlst())
    print(entries)
    file_re = re.compile(rf"^{type}_\d{{14}}.log$")
    filtered_entries = [ x for x in entries if file_re.match(x)]
    print(filtered_entries)
    latest_name = sorted(filtered_entries, key=lambda x: self._conn.voidcmd(f"MDTM {x}"))[-1]
    logging.info("latest filename " + latest_name)

    task = asyncio.create_task(channel.send("file is "+latest_name))
    asyncio.get_running_loop().run_until_complete(task)
    self._last_filename = latest_name
    self._last_timestamp = ""

