import os
from dotenv import load_dotenv

class Config:
    def __init__(self):
        load_dotenv()
        self.discord_token = os.getenv('DISCORD_TOKEN') or ""
        self.steam_token = os.getenv('STEAM_TOKEN') or ""
        self.server_id = os.getenv('BATTLEMETRICS_SERVER_ID') or ""
        self.redis_conn = os.getenv('REDIS_CONNECTION') or ""
        self.ftp_config = {
        "host": os.getenv('FTP_HOST'),
        "port": os.getenv('FTP_PORT'),
        "username": os.getenv('FTP_USERNAME'),
        "password": os.getenv('FTP_PASSWORD'),
        "logs": {
            "path": os.getenv('FTP_LOGS_FOLDER_PATH'),
            "interval": os.getenv('FTP_LOGS_PULL_INTERVAL_MINUTES'),
        },
        "loot": {
            "logspath": os.getenv('FTP_LOGS_FOLDER_PATH'),
            "lootpath": os.getenv('FTP_LOOT_FOLDER_PATH'),
        },
        }
        self.channels = {
        "kill": os.getenv('CHANNEL_ID_KILL_LOGS'),
        "mines": os.getenv('CHANNEL_ID_MINES_LOGS'),
        "economy": os.getenv('CHANNEL_ID_ECOMONY_LOGS'),
        "chat": os.getenv('CHANNEL_ID_CHAT_LOGS'),
        "rules": {
            "th": os.getenv('CHANNEL_ID_RULES_TH',"").split(","),
            "en": os.getenv('CHANNEL_ID_RULES_EN',"").split(","),
        }
        }
        self.roles = {
        "member": os.getenv('ROLE_ID_MEMBER'),
        "lang": {
            "th": os.getenv('ROLE_ID_LANG_TH'),
            "en": os.getenv('ROLE_ID_LANG_EN'),
        }
        }