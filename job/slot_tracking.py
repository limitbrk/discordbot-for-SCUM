import discord
import requests
import logging

async def run(bot: discord.Client,server_id: str) :
    server_url = "https://api.battlemetrics.com/servers/{0}".format(server_id)

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

      status_name = "🏃{0}/{1}".format(online,max)
      await bot.change_presence(status=status_flag, activity=discord.Activity(type=discord.ActivityType.playing, name=status_name))
      logging.info(
        "data updated! : {0} \"{1}\""
        .format(str(status_flag)
        .replace(str(discord.Status.dnd),"offline")
        .replace(str(discord.Status.idle),"sleep  ")
        ,status_name))