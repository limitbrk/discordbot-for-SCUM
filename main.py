import os
import discord
from discord.ext import tasks
from dotenv import load_dotenv
from job import slot_tracking, log_notifier
from server import route
import logging

load_dotenv()
TOKEN = os.getenv('DISCORD_TOKEN')
SERVER_ID = os.getenv('BATTLEMETRICS_SERVER_ID')
FTP_CONFIG = {
  "host": os.getenv('FTP_HOST'),
  "port": os.getenv('FTP_PORT'),
  "username": os.getenv('FTP_USERNAME'),
  "password": os.getenv('FTP_PASSWORD'),
  "logspath": os.getenv('FTP_LOGS_FOLDER_PATH'),
  "channel": {
    "kill":    os.getenv('CHANNEL_ID_KILL_LOGS'),
    "mines":   os.getenv('CHANNEL_ID_MINES_LOGS'),
    "economy": os.getenv('CHANNEL_ID_ECOMONY_LOGS'),
    "chat":    os.getenv('CHANNEL_ID_CHAT_LOGS')
  }
}

logging.basicConfig(
  format='%(asctime)s %(levelname)-8s %(message)s',
  level=logging.INFO,
  datefmt='%Y-%m-%d %H:%M:%S')

intents = discord.Intents.default()
intents.message_content = True
bot = discord.Client(intents=intents)
log = log_notifier.LogNotifier(bot, FTP_CONFIG)

@bot.event
async def on_ready():
  logging.debug(f'{bot.user} has connected to Discord!')
  logging.debug(f'Now tracked BattleMetrics ID "{SERVER_ID}"')
  update_slot.start()
  # LogNotifier.run()

@tasks.loop(minutes=1)
async def update_slot():
    await slot_tracking.run(bot, SERVER_ID)

# os.system("kill 1") # prevent cloudflare
route.keep_alive()
bot.run(TOKEN)
