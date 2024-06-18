import asyncio
from datetime import datetime
import json
import logging
import typing
import re
import secrets
import discord
import pytz
import redis
from discord import app_commands
from discord.ext import commands
from asset import embed
from config import Config

config = Config()
TZ = pytz.timezone('Asia/Bangkok')
_lotto_digit=2
_lotto_pattern=re.compile('^([\\d]{%d})$' % (_lotto_digit))
_lotto_ranges="".ljust(_lotto_digit,'0') + " - " + "".ljust(_lotto_digit,'9')
_mockdata=[]
for _number in range(0, int("".ljust(_lotto_digit,'9'))+1, 1):
    _mockdata.append(str(_number).zfill(_lotto_digit))

class Lotto(commands.Cog) :
    def __init__(self, bot: commands.Bot):
        self.db = redis.from_url(config.redis_conn)
        self.bot = bot

    def _dbget(self):
        data = self.db.get('lotto')
        if data is None:
            return {}
        return json.loads(data)

    def _dbset(self, value: typing.Any):
        self.db.set('lotto', json.dumps(value))

    def _prefix(self, obj: typing.Any, prefix: str):
      return [key for key in obj if key.startswith(prefix)]

    async def _reset_lottos(self, user_id: str, user_info, drawtime: str, result: str):
        insert = {
            user_id: {
                **user_info,
                "history": {
                    "drawtime": drawtime,
                    "win": result in user_info["lottos"],
                    "amount": len(user_info["lottos"]),
                    "lottos": ", ".join(user_info["lottos"]).replace(result,f"__{result}__")
                },
                "lottos": []
            }
        }
        self._dbset(insert)

    @commands.Cog.listener()
    async def on_ready(self) : 
        logging.info('Lotto Command Ready')

    # GIVE
    @app_commands.command(description="[เฉพาะ ADMIN] ให้จำนวนการซื้อหวยแก่ผู้เล่น สำหรับเล่น Lotto")
    @app_commands.checks.has_any_role("ADMIN","👮เจ้าหน้าที่พัสดี")
    @app_commands.describe(
        user="ผู้เล่นที่จะให้",
        amount="จำนวนเครดิตที่จะให้",
    )
    async def give(self, interaction: discord.Interaction, user: discord.User, amount: int):
        # del db[f'user_{interaction.user.id}']
        lotto = self._dbget()
        target_user = f'user_{user.id}'
        user_info = lotto.get(target_user, None)
        if not user_info :
            logging.info(f'creating user_{user.id}')
            user_info = {
                "credit" : 0,
                "lottos" : []
            }
        lotto[target_user] = {
            **user_info,
            "credit": user_info["credit"]+amount
        }
        self._dbset(lotto)
        logging.info(f'gived {amount} credit(s) to {user.name}#{user.discriminator}')
        await interaction.response.send_message(embed=embed.info(f'ได้เพิ่ม `{amount}` จำนวนการซื้อหวย ให้แก่ <@{user.id}> เรียบร้อยแล้ว\nขณะนี้มีเครดิตทั้งหมด `{user_info["credit"]+amount}`'))

    # LOTTO
    @app_commands.command(description="[เฉพาะ ADMIN] เริ่มทำการเสี่ยงดวงกับ Lotto")
    @app_commands.checks.has_any_role("ADMIN","👮เจ้าหน้าที่พัสดี")
    async def lotto(self, interaction: discord.Interaction):
        drawtime = datetime.now(TZ).strftime("%d-%m-%y %H:%M:%S")
        result = str(secrets.randbelow(int("".ljust(_lotto_digit,'9'))+1)).zfill(_lotto_digit)
        content = f'@here\nสลากกินไม่แบ่งใครเลย \nงวด {drawtime}\nเลขที่ออกคือ...\n\n'
        await interaction.response.send_message(embed=embed.info(content))
        content = content+"`"
        for char in result :
            await asyncio.sleep(1)
            content = content+char
            await interaction.edit_original_response(embed=embed.info(content+'`'))
        content = content+"`"
        
        # Get Winner
        lotto = self._dbget()
        all_user = self._prefix(lotto, 'user_')
        winners = []
        for user in all_user:
            user_info = lotto.get(user)
            if result in user_info.get("lottos"):
                winners.append(f'<@{user.replace("user_","")}>')
            await self._reset_lottos(user,user_info,drawtime,result)
        if len(winners) > 0:
            content = content+"\n\nยินดีด้วยกับผู้ชนะ!"
            await interaction.edit_original_response(embed=embed.info(content))
            content = content+"\nโดยมีรายชื่อต่อไปนี้..."
            for win in winners:
                content = content+f'\n{win}'
            await interaction.edit_original_response(embed=embed.info(content))
        else:
            content = content+"`\n\nไม่มีผู้ชนะ"
            await interaction.edit_original_response(embed=embed.info(content))


    # BUY
    @app_commands.command(description="ซื้อหวยเลขที่ต้องการ เพื่อลุ้นโชค")
    @app_commands.describe(
        number=f"กรุณากรอกเลขหวยที่จะซื้อ {_lotto_ranges}",
    )
    async def buy(self, interaction: discord.Interaction, number: app_commands.Range[str, _lotto_digit, _lotto_digit]):
        if not _lotto_pattern.match(number):
            await interaction.response.send_message(embed=embed.info(f'หวย `{number}` ไม่ถูกต้อง กรุณากรอกตัวเลข {_lotto_digit} หลัก!'), ephemeral=True)
            return
        lotto = self._dbget()
        user_target = f'user_{interaction.user.id}'
        user_info = lotto.get(user_target)
        if not user_info or user_info['credit'] < 1:
            await interaction.response.send_message(embed=embed.info(f'จำนวนการซื้อหวยไม่เพียงพอ กรุณาติดต่อแอดมินเพื่อซื้อเพิ่ม'), ephemeral=True)
            return
        if number in user_info['lottos'] :
            await interaction.response.send_message(embed=embed.info(f'หวยหมายเลข `{number}` เคยซื้อไปแล้ว กรุณาซื้อเลขอื่น\n__รายการที่ซื้อไป ({len(user_info["lottos"])}):__\n{user_info["lottos"].value}'), ephemeral=True)
            return
        logging.info(f'{interaction.user.name}#{interaction.user.discriminator} buy lotto {number}')
        user_info['credit'] = user_info['credit']-1
        user_info['lottos'].append(number) 
        lotto[user_target] = user_info
        self._dbset(lotto)
        await interaction.response.send_message(embed=embed.info(f'ซื้อหวยหมายเลข `{number}` สำเร็จ!!\nจำนวนการซื้อหวยคงเหลือ `{user_info["credit"]}`'), ephemeral=True)

    @app_commands.command(description="ซื้อหวยทุกเลข (กรณีที่งวดนี้ยังไม่ซื้ออะไร)")
    async def buy_all(self, interaction: discord.Interaction):
        lotto = self._dbget()
        user_target = f'user_{interaction.user.id}'
        user_info = lotto.get(user_target)
        if not user_info or user_info['credit'] < len(_mockdata):
            credit = 0
            if user_info:
                credit = user_info['credit']
            await interaction.response.send_message(embed=embed.info(f'จำนวนการซื้อหวยไม่เพียงพอ ต้องซื้อเพิ่มอีก `{len(_mockdata) - credit}` จำนวน กรุณาติดต่อแอดมินเพื่อซื้อเพิ่ม'), ephemeral=True)
            return
        if len(user_info['lottos']) > 0 :
            await interaction.response.send_message(embed=embed.info(f'รอบนี้มีเลขที่ซื้อแล้ว กรุณาใช้คำสั่ง `\buy` เพื่อซื้อเลขอื่น\n__รายการที่ซื้อไป ({len(user_info["lottos"])}):__\n{user_info["lottos"]}'), ephemeral=True)
            return
        user_info['credit'] = user_info['credit'] - len(_mockdata)
        user_info['lottos'] = _mockdata 
        lotto[user_target] = user_info
        self._dbset(lotto)
        await interaction.response.send_message(embed=embed.info(f'ซื้อหวยหมายเลขทั้งหมดสำเร็จ!!\nจำนวนการซื้อหวยคงเหลือ `{user_info["credit"]}`'), ephemeral=True)

    # CHECK
    @app_commands.command(description="ตรวจสอบรายการหวยที่ซื้อไป")
    async def check(self, interaction: discord.Interaction):
        lotto = self._dbget()
        user_target = f'user_{interaction.user.id}'
        user_info = lotto.get(user_target, None)
        if not user_info :
            logging.info(f'creating {user_target}')
            user_info = {
                "credit" : 0,
                "lottos" : []
            }
        await interaction.response.send_message(embed=embed.info(f'จำนวนการซื้อหวยคงเหลือ `{user_info["credit"]}`\n__รายการที่ซื้อไป ({len(user_info["lottos"])}):__\n{", ".join(user_info["lottos"])}'), ephemeral=True)

    # HISTORY
    @app_commands.command(description="ตรวจสอบประวัติการซื้อหวยย้อนหลัง 1 งวด")
    async def history(self, interaction: discord.Interaction):
        lotto = self._dbget()
        user_target = f'user_{interaction.user.id}'
        user_info = lotto.get(user_target, None)
        if user_info and "history" in user_info :
            await interaction.response.send_message(embed=embed.info(f'__ประวัติการซื้อหวยรอบที่ผ่านมา ของงวด {user_info["history"]["drawtime"]}__ \n {"ถูกรางวัล" if user_info["history"]["win"] else "พลาดรางวัล"} จากจำนวน {user_info["history"]["amount"]} ใบ: \n{user_info["history"]["lottos"]}'), ephemeral=True)
        else :
            await interaction.response.send_message(embed=embed.info(f'ไม่มีประวัติการซื้อหวยรอบที่ผ่านมา'), ephemeral=True)
    

async def setup(bot: commands.Bot):
    await bot.add_cog(Lotto(bot))
