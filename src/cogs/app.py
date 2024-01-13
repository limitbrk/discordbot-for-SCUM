import logging
from discord.ext import commands

class App(commands.Cog) :
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.Cog.listener()
    async def on_ready(self) : 
        logging.info('App Command Ready')

    @commands.command()
    async def sync(self, ctx) -> None :
        fmt = await ctx.bot.tree.sync()
        await ctx.send(f"Synced {len(fmt)} commands to this world!")
        return

async def setup(bot: commands.Bot):
    await bot.add_cog(App(bot))
