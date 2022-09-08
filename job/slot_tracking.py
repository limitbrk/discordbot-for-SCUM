import discord
import datetime
import requests
import urllib.parse
import flag

async def run(bot: discord.Client,server_id: str) :
    server_url = "https://api.battlemetrics.com/servers/{0}".format(server_id)

    info_response = requests.get(server_url)
    if info_response.status_code == 200:
        info = info_response.json()['data']['attributes']
        status  = "🟢" if info['status'] == 'online' else  "🔴"
        online  = info['players']
        max     = info['maxPlayers']

        await bot.change_presence(activity=discord.Activity(type=discord.ActivityType.watching, name="🙋{0}/{1} {2}".format(online,max,status)))

def encode_time(datetime: datetime.datetime) : 
    return urllib.parse.quote(datetime.strftime("%Y-%m-%dT%H:%M:%S.000Z"))