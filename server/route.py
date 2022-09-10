from flask import Flask
from threading import Thread

app = Flask('')

@app.route('/', methods=['GET'])
def health():
  greeting = """
  Hello this is a bot for a 1:1 server only<BR>
  
  """
  return greeting

# @app.route('/setting', methods=['GET'])
# def health():
#   return "Hello SCUMer! I'm online for now. Don't worry!"

def run():
  app.run(host='0.0.0.0', port=8080)

def keep_alive():
  t = Thread(target=run)
  t.start() 