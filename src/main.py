import asyncio
from datetime import datetime
import os
import traceback
import discord
from discord.ext import tasks, commands
import pytz
from job import slot_tracking, log_notifier
from asset import embed
from server import route
import logging
from config import Config
import pkgutil
import cogs

config = Config()
TZ = pytz.timezone('Asia/Bangkok')

logging.Formatter.converter = lambda *args: datetime.now(TZ).timetuple()
logging.basicConfig(
  format='%(asctime)s %(levelname)-8s %(message)s',
  level=logging.INFO,
  datefmt='%Y-%m-%d %H:%M:%S')

intents = discord.Intents.default()
intents.message_content = True
bot = commands.Bot(command_prefix="$", intents=intents)
log = log_notifier.LogNotifier(bot, config.ftp_config)

@tasks.loop(minutes=1)
async def update_slot():
  await slot_tracking.run(bot, config.server_id)

@bot.event
async def on_ready():
  logging.debug(f'{bot.user} has connected to Discord!')
  update_slot.start()

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
  async with bot:
    route.start()
    for _, name, ispkg in pkgutil.iter_modules(cogs.__path__):
      await bot.load_extension(f'cogs.{name}')
    await bot.start(config.discord_token)

try:
    asyncio.run(main())
except KeyboardInterrupt:
    logging.info("KeyboardInterrupt: Exiting the program")
    os._exit(1)
# except Exception as e:
#     logging.error(f"Bot Error! Kill yourself now!: {e}")
#     os.system("kill 1") # prevent cloudflare