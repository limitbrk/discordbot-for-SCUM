import logging
import discord
import requests
import logging
from discord.ext import tasks,commands
from config import Config

config = Config()
clock_emoji   = '🕛🕐🕑🕒🕓🕔🕕🕖🕗🕘🕙🕚'
weather_emoji = '☀️🌙'

class SlotTracking(commands.Cog) :
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    def cog_unload(self):
        self.update_slot.cancel()

    @tasks.loop(minutes=1)
    async def update_slot(self):
        await self.track(config.server_id)

    @commands.Cog.listener()
    async def on_ready(self) : 
        logging.info('Slot Tracking Ready')
        self.update_slot.start()

    async def track(self, server_id: str) :
        server_url = 'https://api.battlemetrics.com/servers/{0}'.format(server_id)

        info_response = requests.get(server_url)
        if info_response.status_code == 200:
            info = info_response.json()['data']['attributes']
            
            online        = info['players']
            max           = info['maxPlayers']

            status_flag   = discord.Status.dnd
            if online < 1 :
                status_flag = discord.Status.idle
            elif info['status'] == 'online' :
                status_flag = discord.Status.online
            hour          = int(info['details']['time'].split(':')[0])
            status_time   = f"{clock_emoji[hour%12]}{hour}"
            
            status_weather = '🌙'
            if 5 < hour < 23 :
                status_weather = '☀️'
            
            status_name = f"🏃{online}/{max} {status_time}{status_weather}"

            await self.bot.change_presence(status=status_flag, activity=discord.Activity(type=discord.ActivityType.playing, name=status_name))
            logging.info(
                "status updated! : {0} \"{1}\""
                .format(str(status_flag)
                .replace(str(discord.Status.dnd),"offline")
                .replace(str(discord.Status.idle),"sleep  ")
                ,status_name))

async def setup(bot: commands.Bot):
	await bot.add_cog(SlotTracking(bot))