import discord
def info(body: str):
    embed=discord.Embed(color=0xfe9ab8)
    embed.set_thumbnail(url="https://cdn.pixabay.com/photo/2013/07/12/12/49/lottery-146318_640.png")
    embed.add_field(name="หวย Happy Land", value=body, inline=False)
    embed.set_footer(text="/check สำหรับดูข้อมูลหวยที่มีสำหรับงวดที่กำลังมาถึง")
    return embed

def error(err: str):
    embed=discord.Embed(color=0xfe9ab8)
    embed.set_thumbnail(url="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Error.svg/1200px-Error.svg.png")
    embed.add_field(name="หวย Happy Land", value=err, inline=False)
    embed.set_footer(text="กรุณาติดต่อแอดมิน กรณีที่ทำรายการไม่ถูกต้อง")
    return embed