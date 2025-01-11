import sqlite3
import os
from flask import Flask, render_template, request, session, redirect, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from db_scripts.setup_db import init_db

def get_db_connection():
    """
    Returns a connection to the SQLite database.
    """
    conn = sqlite3.connect('app.db')
    conn.row_factory = sqlite3.Row  
    return conn


app = Flask(__name__)

@app.route('/')
def home():
    return render_template('home.html') 

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data or 'username' not in data or 'password' not in data:
        return jsonify({"error": "Invalid request data"}), 400

    username = data['username']
    password = data['password']
    password_hash = generate_password_hash(password) 

    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("INSERT INTO users (username, password_hash) VALUES (?, ?)",
                    (username, password_hash))
        conn.commit()
        conn.close()
    except sqlite3.IntegrityError:
        return jsonify({"error": "User already exists"}), 400

    return jsonify({"message": "User registered successfully"}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or 'username' not in data or 'password' not in data:
        return jsonify({"error": "Invalid request data"}), 400

    username = data['username']
    password = data['password']

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, username, password_hash FROM users WHERE username = ?", (username,))
    user = cur.fetchone()
    conn.close()

    if user is None:
        return jsonify({"error": "Invalid username or password"}), 400

    stored_hash = user['password_hash']
    if not check_password_hash(stored_hash, password):
        return jsonify({"error": "Invalid username or password"}), 400

    session['user_id'] = user['id']
    session['username'] = user['username']
    return jsonify({"message": "Logged in successfully"}), 200

@app.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({"message": "Logged out successfully"}), 200



@app.route('/minesweeper')
def minesweeper():
    return render_template('minesweeper.html')


if __name__ == "__main__":
    app.debug = True
    app.run()


