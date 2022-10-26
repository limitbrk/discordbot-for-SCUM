import asyncio
import os
import traceback
import discord
from discord.ext import tasks, commands
from dotenv import load_dotenv
from job import slot_tracking, log_notifier
from asset import embed
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
bot = commands.Bot(command_prefix="$", intents=intents)
log = log_notifier.LogNotifier(bot, FTP_CONFIG)

async def load():
  for filename in os.listdir('./cogs'):
    if filename.endswith('.py'):
      await bot.load_extension(f'cogs.{filename[:-3]}')

@tasks.loop(minutes=1)
async def update_slot():
  await slot_tracking.run(bot, SERVER_ID)

@bot.event
async def on_ready():
  logging.debug(f'{bot.user} has connected to Discord!')
  logging.debug(f'Now tracked BattleMetrics ID "{SERVER_ID}"')
  update_slot.start()
  # LogNotifier.run()

@bot.tree.error
async def on_app_command_error(interaction: discord.Interaction, error: discord.app_commands.AppCommandError) -> None:
  logging.error(f"{interaction.user.name}#{interaction.user.discriminator} have ERROR when called \"/{interaction.command.name}\" : {error}")
  if isinstance(error, discord.app_commands.errors.MissingAnyRole):
    await interaction.response.send_message(embed=embed.error(f'คุณใช้ไม่มีสิทธิ์ให้ใช้คำสั่งนี้'), ephemeral=True)
    return
  else:
    traceback.print_exc()
    await interaction.response.send_message(embed=embed.error(f'คำสั่งมีปัญหา ติดต่อแอดมินด่วน!'), ephemeral=True)

async def main():
  await load()
  route.keep_alive()
  await bot.start(TOKEN)


try:
  asyncio.run(main())
except Exception as e:
  logging.error(f"Token Error! Kill yourself now!: {e}")
  os.system("kill 1") # prevent cloudflare