import os
import sqlite3
from flask import Flask, request, session, redirect, url_for, render_template
from werkzeug.security import generate_password_hash, check_password_hash

from db_scripts.setup_db import init_db 

def get_db_connection():
    conn = sqlite3.connect('app.db')
    conn.row_factory = sqlite3.Row
    return conn

app = Flask(__name__)

app.secret_key = "DEV_ONLY__change_me_in_production"

@app.route('/')
def home():
    """
    If the user is logged in, show a welcome message and a logout link.
    Otherwise, show links to sign up or log in.
    """
    return render_template('home.html')

# -------------------------
# SIGNUP
# -------------------------
@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'GET':
        return render_template('signup.html')
    else:
        username = request.form.get('username')
        password = request.form.get('password')
        if not username or not password:
            return "Missing username or password", 400
        hashed_pw = generate_password_hash(password)
        conn = get_db_connection()
        cur = conn.cursor()
        try:
            cur.execute("INSERT INTO users (username, password_hash) VALUES (?, ?)", 
                        (username, hashed_pw))
            conn.commit()
        except sqlite3.IntegrityError:
            conn.close()
            return "User already exists. Please choose a different username.", 400

        conn.close()
        return redirect(url_for('login'))

# -------------------------
# LOGIN
# -------------------------
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'GET':
        return render_template('login.html')
    else:
        username = request.form.get('username')
        password = request.form.get('password')
        if not username or not password:
            return "Missing username or password", 400

        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT id, username, password_hash FROM users WHERE username = ?", (username,))
        user = cur.fetchone()
        conn.close()

        if user is None:
            return "Invalid username or password", 400

        stored_hash = user['password_hash']
        if not check_password_hash(stored_hash, password):
            return "Invalid username or password", 400
        session['user_id'] = user['id']
        session['username'] = user['username']
        return redirect(url_for('home'))

# -------------------------
# LOGOUT
# -------------------------
@app.route('/logout')
def logout():
    """
    Clear the session and redirect to home.
    """
    session.clear()
    return redirect(url_for('home'))



@app.route('/minesweeper')
def minesweeper():
    return render_template('minesweeper.html')


if __name__ == "__main__":
    init_db()
    app.debug = True
    app.run()


