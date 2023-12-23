import logging
import discord
import requests
import re
import gettext
from discord import app_commands, ButtonStyle
from discord.ext import commands
from asset import embed
from config import Config

config = Config()
th = gettext.translation('register', localedir='locales', languages=['th_TH'])
en = gettext.translation('register', localedir='locales', languages=['en_US'])


def _(msg: str, lang: str = "th") -> str:
  if lang == "en":
    return en.gettext(msg)
  else:
    return th.gettext(msg)


def getSteamProfile(steam_id: str) -> dict[str, str] | None:
  if not re.match(r"^\d{17}$", str(steam_id)):
    return None

  value = dict()
  response = requests.get(
      f"https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key={config.steam_token}&steamids={steam_id}"
  )
  if response.status_code == 200:
    response_json = response.json()
    if len(response_json["response"]["players"]) > 0:
      profile = response_json["response"]["players"][0]
      value["id"] = profile["steamid"]
      value["url"] = f'https://steamcommunity.com/profiles/{profile["steamid"]}'
      value["name"] = profile["personaname"]
      value["avatar"] = profile["avatarfull"]
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
    await interaction.response.send_message(
        embed=embed.register_desc("กรุณาเลือกภาษา / Plese select language."),
        view=Register.Step1View(),
        ephemeral=True)

  class Step1View(discord.ui.View):

    def __init__(self):
      super().__init__()
      th = discord.ui.Button(label="ไทย",
                             style=ButtonStyle.blurple,
                             emoji="🇹🇭")
      th.callback = self.th_callback
      self.add_item(th)
      en = discord.ui.Button(label="English",
                             style=ButtonStyle.blurple,
                             emoji="🔤")
      en.callback = self.en_callback
      self.add_item(en)

    async def th_callback(self, interaction: discord.Interaction):
      await self.goto_step2(interaction, "th")

    async def en_callback(self, interaction: discord.Interaction):
      await self.goto_step2(interaction, "en")

    async def assign_lang_roles(self, interaction: discord.Interaction,
                                lang: str):
      id = config.roles["lang"][lang]
      if id is not None:
        roles = discord.utils.get(interaction.guild.roles, id=int(id))
        await interaction.user.add_roles(roles, reason="Lang Set")

    async def goto_step2(self, interaction: discord.Interaction, lang: str):
      await self.assign_lang_roles(interaction, lang)

      desc = ""
      for ch in config.channels["rules"][lang]:
        desc += f"<#{ch}>\n"
      desc += "\n"
      desc += _(
          "When you click **⏩{next}** button that mean you have read and accepted these rules",
          lang).format(next=_("Next", lang))

      await interaction.response.defer()
      await interaction.edit_original_response(embed=embed.register_desc(
          _("Please read these rule before continue...", lang), desc),
                                               view=Register.Step2View(lang))

  class Step2View(discord.ui.View):

    def __init__(self, lang: str):
      super().__init__()
      self.lang = lang
      next = discord.ui.Button(custom_id="rule_next",
                               label=_("Next", self.lang),
                               row=1,
                               style=ButtonStyle.green,
                               emoji="⏩")
      next.callback = self.next_callback
      self.add_item(next)

    async def next_callback(self, interaction: discord.Interaction):
      await interaction.response.send_modal(Register.Step3Modal(self.lang))

  class Step3Modal(discord.ui.Modal):

    def __init__(self, lang: str):
      super().__init__(title=_('Fill Information', lang))
      self.lang = lang
      self.steam_id = discord.ui.TextInput(
          label=_("SteamID64 (Can be find in - steamid.xyz)", self.lang),
          placeholder=_("17 digits of number"),
          min_length=17,
          max_length=17,
      )
      self.add_item(self.steam_id)

    async def on_submit(self, interaction: discord.Interaction):
      profile = getSteamProfile(self.steam_id.value)
      if profile is None:
        await interaction.response.defer()
        await interaction.edit_original_response(
            content=None,
            embed=embed.error(_("Invalid SteamID Please try again",
                                self.lang)),
            view=None)
        return
      steam_embed = embed.steam_info(_("This is your Steam?", self.lang),
                                     profile)
      await interaction.response.defer()
      await interaction.edit_original_response(content=None,
                                               embed=steam_embed,
                                               view=Register.Step4View(
                                                   self.lang, profile))

  class Step4View(discord.ui.View):

    def __init__(self, lang: str, steam_profile: dict[str, str]):
      super().__init__()
      self.lang = lang
      self.steam_profile = steam_profile
      no = discord.ui.Button(label=_("No", self.lang), style=ButtonStyle.red)
      no.callback = self.no_callback
      self.add_item(no)

      yes = discord.ui.Button(label=_("Yes", self.lang),
                              style=ButtonStyle.green)
      yes.callback = self.yes_callback
      self.add_item(yes)

    async def no_callback(self, interaction: discord.Interaction):
      await interaction.response.send_modal(Register.Step3Modal(self.lang))

    async def yes_callback(self, interaction: discord.Interaction):
      title = _("Can join our server here {channel}",self.lang).format(channel="<#1016360910656389150>")
      title += "\n" + _("Welcome pack is ready {channel}", self.lang).format(channel="<#1016608862780002344>")
      
      register_embed = embed.register_info(
          _("Register Success", self.lang),
          title,
          interaction.user, self.steam_profile)

      roles = discord.utils.get(interaction.guild.roles,
                                id=int(config.roles["member"]))
      await interaction.user.add_roles(roles, reason="Register Done")

      await interaction.response.defer()
      await interaction.channel.send(
          _("┌ {mention} used command `/register`",
            self.lang).format(mention=interaction.user.mention),
          embed=register_embed)
      await interaction.delete_original_response()


async def setup(bot: commands.Bot):
  await bot.add_cog(Register(bot))
