import discord
import requests
import logging

clock_emoji   = '🕛🕐🕑🕒🕓🕔🕕🕖🕗🕘🕙🕚'
weather_emoji = '☀️🌙'

async def run(bot: discord.Client,server_id: str) :
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
      print(status_name)
      await bot.change_presence(status=status_flag, activity=discord.Activity(type=discord.ActivityType.playing, name=status_name))
      logging.info(
        "data updated! : {0} \"{1}\""
        .format(str(status_flag)
        .replace(str(discord.Status.dnd),"offline")
        .replace(str(discord.Status.idle),"sleep  ")
        ,status_name))