import discord

def info(body: str):
    embed=discord.Embed(color=0xfe9ab8)
    embed.set_thumbnail(url="https://cdn.pixabay.com/photo/2013/07/12/12/49/lottery-146318_640.png")
    embed.add_field(name="หวย Happy Land", value=body, inline=False)
    embed.set_footer(text="/check สำหรับดูข้อมูลหวยที่มีสำหรับงวดที่กำลังมาถึง")
    return embed

def steam_info(title: str, steam_info: dict[str, str]):
  embed=discord.Embed(title=title, color=0x2a475e)
  embed.set_thumbnail(url=steam_info["avatar"])
  embed.add_field(name="Profile", value=f"[{steam_info['name']}]({steam_info['url']})", inline=False)
  embed.add_field(name="SteamID64 (Dec)", value=steam_info["id"], inline=False)
  return embed

def register_info(title: str, discord_user: discord.User, steam_info: dict[str, str]):
  embed=discord.Embed(title=title, color=0xffac1c)
  embed.set_thumbnail(url=discord_user.display_avatar.url)
  embed.add_field(name="Discord Name", value=discord_user.mention, inline=False)
  embed.add_field(name="Steam Profile", value=f"[{steam_info['name']}]({steam_info['url']})", inline=False)
  embed.add_field(name="SteamID64 (Dec)", value=steam_info["id"], inline=False)
  return embed

def error(err: str):
    embed=discord.Embed(color=0xfe9ab8)
    embed.set_thumbnail(url="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Error.svg/1200px-Error.svg.png")
    embed.add_field(name="หวย Happy Land", value=err, inline=False)
    embed.set_footer(text="กรุณาติดต่อแอดมิน กรณีที่ทำรายการไม่ถูกต้อง")
    return embed