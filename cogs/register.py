import logging
import discord
import requests
from lxml import etree
from discord import TextStyle, app_commands, ButtonStyle
from discord.ext import commands
from discord.utils import get
from asset import embed

def getSteamProfile(steam_id: str) -> dict[str,str]|None :
  value = dict()
  value["id"] = steam_id
  value["url"] = f"https://steamcommunity.com/profiles/{steam_id}"
  profile_xml = requests.get(value["url"]+"?xml=1")

  if profile_xml.status_code == 200:
    profile = etree.fromstring(profile_xml.content)
    value["name"] = profile.xpath('//profile/steamID')[0].text
    value["avatar"]  = profile.xpath('//profile/avatarFull')[0].text
    return value
  return None

class Register(commands.Cog):

  def __init__(self, bot: commands.Bot):
    self.bot = bot

  @commands.Cog.listener()
  async def on_ready(self):
    logging.info('Register Command Ready')

  # REGISTER
  @app_commands.command(description="ลงทะเบียนผู้เล่น / Register Prisoner.")
  async def register(self, interaction: discord.Interaction):
    await interaction.response.send_message("Select Language for Register",
                                            view=Register.Step1View(), ephemeral=True)


  class Step1View(discord.ui.View):
    @discord.ui.button(custom_id="lang_th", 
                       label="ไทย", 
                       style=ButtonStyle.blurple, 
                       emoji="🇹🇭")
    async def register_th(self, interaction: discord.Interaction,
                          button: discord.ui.Button):
      await interaction.response.send_modal(Register.Step2Modal())
  
    @discord.ui.button(custom_id="lang_en",
                       label="English",
                       style=ButtonStyle.blurple,
                       emoji="🔤")
    async def register_en(self, interaction: discord.Interaction,
                          button: discord.ui.Button):
      await interaction.response.send_modal(Register.Step2Modal())
  
  class Step2Modal(discord.ui.Modal, title='Fill Information'):
    steam_id = discord.ui.TextInput(
      label="SteamID64 (Can be find in - steamid.xyz)",
      placeholder="17 digits of number",
      min_length=17,
      max_length=17,
    )
    async def on_submit(self, interaction: discord.Interaction):
      profile = getSteamProfile(self.steam_id)
      steam_embed = embed.steam_info(
        "This is your Steam?",
        profile
      )
      await interaction.response.defer()
      await interaction.edit_original_response(embed=steam_embed, view=Register.Step3View(profile))
  
  class Step3View(discord.ui.View):
    def __init__(self, steam_profile: dict[str, str]):
      super().__init__()
      self.steam_profile = steam_profile
  
    @discord.ui.button(label="No", 
                       style=ButtonStyle.red)
    async def no(self, interaction: discord.Interaction,
                          button: discord.ui.Button):
      await interaction.response.send_modal(Register.Step2Modal())
    
    @discord.ui.button(label="Yes",
                       style=ButtonStyle.green)
    async def yes(self, interaction: discord.Interaction,
                        button: discord.ui.Button):
      register_embed = embed.register_info(
        "Register Success",
        interaction.user,
        self.steam_profile
      )
      
      roles = discord.utils.get(interaction.guild.roles, id=1016350933296349227)
      await interaction.user.add_roles(roles, reason="Register Done")
      
      await interaction.response.defer()
      await interaction.delete_original_response()
      await interaction.channel.send(f"┌ {interaction.user.mention} used command `/register`",embed=register_embed)
  
async def setup(bot: commands.Bot):
  await bot.add_cog(Register(bot))
