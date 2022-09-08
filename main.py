import os
import discord
from discord.ext import tasks
from dotenv import load_dotenv
from job import slot_tracking

load_dotenv()
TOKEN = os.getenv('DISCORD_TOKEN')
WELCOME_ID = os.getenv('WELCOME_CHANNEL_ID')
SERVER_ID = os.getenv('BATTLEMETRICS_SERVER_ID')

intents = discord.Intents.default()
intents.message_content = True
bot = discord.Client(intents=intents)
if WELCOME_ID != '' :
    welcome = bot.get_channel(636399538650742795)

@bot.event
async def on_ready():
    print(f'{bot.user} has connected to Discord!')
    update_slot.start()
async def on_member_join(member):
    if welcome :
        await welcome.send(f" Welcome {member.mention} To HAPPY LAND PvE 100% No Mech [LOOT x2.5] 🎉\n🚩 กฎ-กติกาเซิร์ฟ กฎ-กติกาเซิร์ฟ\n📝 ลงทะเบียน #ลงทะเบียน")

@tasks.loop(minutes=1)
async def update_slot():
    await slot_tracking.run(bot,SERVER_ID)

bot.run(TOKEN)