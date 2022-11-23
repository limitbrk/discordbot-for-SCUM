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
    
  # def _thread_keep_alive():
  #   while self.quitThread == 0:
  #       logging.debug("FTP keepalive")
  #       self.conn.keep_alive()
  #       sleep(300)
    
  async def run(self):
    channel = self.bot.get_channel(1018112696580845568)
    await channel.send("TEST")
