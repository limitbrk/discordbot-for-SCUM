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
FTP_CONFIG_HOST = os.getenv('FTP_HOST')
FTP_CONFIG_PORT = int(os.getenv('FTP_PORT'))
FTP_CONFIG_USERNAME = os.getenv('FTP_USERNAME')
FTP_CONFIG_PASSWORD = os.getenv('FTP_PASSWORD')
FTP_CONFIG_LOGSPATH = os.getenv('FTP_LOGS_FOLDER_PATH')
CH_KILL =os.getenv('CHANNEL_ID_KILL_LOGS'),
CH_MINES=os.getenv('CHANNEL_ID_MINES_LOGS'),
CH_ECO  =os.getenv('CHANNEL_ID_ECOMONY_LOGS'),
CH_CHAT =os.getenv('CHANNEL_ID_CHAT_LOGS')

logging.basicConfig(
  format='%(asctime)s %(levelname)-8s %(message)s',
  level=logging.INFO,
  datefmt='%Y-%m-%d %H:%M:%S')

intents = discord.Intents.default()
intents.message_content = True
bot = discord.Client(intents=intents)
log = log_notifier.LogJob(
  bot, 
  FTP_CONFIG_HOST,
  FTP_CONFIG_PORT,
  FTP_CONFIG_USERNAME,
  FTP_CONFIG_PASSWORD
)

@bot.event
async def on_ready():
  logging.debug(f'{bot.user} has connected to Discord!')
  logging.debug(f'Now tracked BattleMetrics ID "{SERVER_ID}"')
  update_slot.start()
  log.add_job(1018112696580845568,FTP_CONFIG_LOGSPATH,"kill")

@tasks.loop(minutes=1)
async def update_slot():
    await slot_tracking.run(bot, SERVER_ID)

# os.system("kill 1") # prevent cloudflare
route.keep_alive()
bot.run(TOKEN)
