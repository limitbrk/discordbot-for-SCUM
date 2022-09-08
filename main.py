import os
import discord
from discord.ext import tasks
from dotenv import load_dotenv
from job import slot_tracking
from server import route
import logging

load_dotenv()
TOKEN = os.getenv('DISCORD_TOKEN')
WELCOME_ID = os.getenv('WELCOME_CHANNEL_ID')
SERVER_ID = os.getenv('BATTLEMETRICS_SERVER_ID')

logging.basicConfig(
  format='%(asctime)s %(levelname)-8s %(message)s',
  level=logging.INFO,
  datefmt='%Y-%m-%d %H:%M:%S')

intents = discord.Intents.default()
intents.message_content = True
bot = discord.Client(intents=intents)
if WELCOME_ID != '':
    welcome = bot.get_channel(636399538650742795)


@bot.event
async def on_ready():
    logging.debug(f'{bot.user} has connected to Discord!')
    logging.debug(f'Now tracked BattleMetrics ID "{SERVER_ID}"')
    update_slot.start()


# TBD
# async def on_member_join(member):
#     if welcome :
#         await welcome.send(f" Welcome {member.mention} To HAPPY LAND PvE 100% No Mech [LOOT x2.5] 🎉\n🚩 กฎ-กติกาเซิร์ฟ กฎ-กติกาเซิร์ฟ\n📝 ลงทะเบียน #ลงทะเบียน")


@tasks.loop(minutes=1)
async def update_slot():
    await slot_tracking.run(logging, bot, SERVER_ID)

route.keep_alive()
bot.run(TOKEN)
