import discord
import logging
from ftplib import FTP

class LogNotifier :
  def __init__ (self, bot: discord.Client, config: dict):
    self.logging = logging
    self.bot = bot

    host = config['host']
    port = config['port']

    # self.conn = FTP(host, port)
    # self.conn.login()
    # self.quitThread = 0

    # thread = Thread(target = _thread_keep_alive)
    # thread.start()
    
  def _thread_keep_alive():
    while self.quitThread == 0:
        logging.debug("FTP keepalive")
        self.conn.keep_alive()
        sleep(300)
    
  async def run(self):
    channel = self.bot.get_channel(1018112696580845568)
    await channel.send("TEST")
