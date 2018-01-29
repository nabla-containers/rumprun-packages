# flask_main.py
print('hello')

import logging
log = logging.getLogger('werkzeug')
# log.setLevel(logging.ERROR)
log.disabled = True

from flask import Flask
app = Flask(__name__)


@app.route("/")
def hello():
    return "Hello World!"


if __name__ == "__main__":
    app.run(host='0.0.0.0')
