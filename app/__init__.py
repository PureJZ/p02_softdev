import os
import sqlite3
from flask import Flask, request, session, redirect, url_for, render_template, flash
from werkzeug.security import generate_password_hash, check_password_hash

from db_scripts.setup_db import init_db

def get_db_connection():
    conn = sqlite3.connect('app.db')
    conn.row_factory = sqlite3.Row  
    return conn

app = Flask(__name__)
app.secret_key = os.urandom(16)

@app.route("/")
def home():
    return render_template("home.html")

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'GET':
        return render_template('login.html')
    else:
        username = request.form.get('username')
        password = request.form.get('password')
        if not username or not password:

            flash("Missing username or password.", "error")
            return redirect(url_for('login'))

        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT id, username, password_hash FROM users WHERE username = ?", (username,))
        user = cur.fetchone()
        conn.close()

        if user is None:

            flash("Invalid username or password.", "error")
            return redirect(url_for('login'))

        stored_hash = user['password_hash']
        if not check_password_hash(stored_hash, password):
            flash("Invalid username or password.", "error")
            return redirect(url_for('login'))

        session['user_id'] = user['id']
        session['username'] = user['username']
        flash(f"Welcome back, {username}!", "success")
        return redirect(url_for('home'))

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'GET':

        return render_template('signup.html')
    else:

        username = request.form.get('username')
        password = request.form.get('password')


        if not username or not password:
            flash("Missing username or password.", "error")
            return redirect(url_for('signup'))

        hashed_pw = generate_password_hash(password)

        conn = get_db_connection()
        cur = conn.cursor()
        try:
            cur.execute("INSERT INTO users (username, password_hash) VALUES (?, ?)",
                        (username, hashed_pw))
            conn.commit()
        except sqlite3.IntegrityError:
            conn.close()
            flash("User already exists. Please choose a different username.", "error")
            return redirect(url_for('signup'))

        conn.close()
        flash("Registration successful! Please log in.", "success")
        return redirect(url_for('login'))
    
@app.route('/logout')
def logout():
    session.clear()
    flash("You have been logged out.", "info")
    return redirect(url_for('home'))


@app.route('/minesweeper')
def minesweeper():
    return render_template('minesweeper.html')

@app.route('/wordhunt')
def wordhunt():
    return render_template('wordhunt.html')

if __name__ == "__main__":
    init_db()
    app.debug = True
    app.run()


