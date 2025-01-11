import sqlite3
import os
from flask import Flask, render_template, request, session, redirect



app = Flask(__name__)

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/minesweeper')
def minesweeper():
    return render_template('minesweeper.html')


if __name__ == "__main__":
    app.debug = True
    app.run()


