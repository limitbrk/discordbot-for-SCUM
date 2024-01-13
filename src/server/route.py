from flask import Flask
from threading import Thread
import logging

app = Flask(__name__)

flask_log = logging.getLogger('werkzeug')
flask_log.setLevel(logging.ERROR)

@app.route('/', methods=['GET'])
def index():
    logging.info("Invocation!")
    greeting = """
    Hello this is a bot for a 1:1 server only<BR>
    
    """
    return greeting

@app.route('/health', methods=['GET'])
def health():
    return "OK"

# @app.route('/setting', methods=['GET'])
# def health():
#     return "Hello SCUMer! I'm online for now. Don't worry!"

def run():
    app.run(host='0.0.0.0', port=8080)

def start():
    t = Thread(target=run)
    t.start() 