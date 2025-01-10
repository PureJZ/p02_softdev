import sqlite3
import os
from flask import Flask, render_template, request, session, redirect





app = Flask(__name__)

@app.route("/", methods = ['GET', 'POST'])
def landing():
    return render_template("main.html")

if __name__ == "__main__":
    app.debug = True
    app.run()


