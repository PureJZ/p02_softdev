import sqlite3
import os
from flask import Flask, render_template, request, session, redirect, Blueprint






app = Flask(__name__)

@app.route("/", methods = ['GET', 'POST'])
def landing():
    return render_template("main.html")

@app.route('/minesweeper')
def minesweeper():
    return render_template('minesweeper.html')

if __name__ == "__main__":
    app.debug = True
    app.run()


