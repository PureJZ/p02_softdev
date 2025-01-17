import os
import sqlite3
from flask import Flask, request, session, redirect, url_for, render_template, flash,jsonify
from werkzeug.security import generate_password_hash, check_password_hash

from db_scripts.setup_db import init_db

def get_db_connection():
    conn = sqlite3.connect('app.db')
    conn.row_factory = sqlite3.Row
    return conn

app = Flask(__name__)
app.secret_key = os.urandom(16)

@app.before_request
def require_login():
    public_routes = ['login', 'signup', 'home', 'static']
    if request.endpoint not in public_routes and 'user_id' not in session:
        flash("Please log in to access this page.", "error")
        return redirect(url_for('login'))

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

@app.route('/snake')
def snake():
    return render_template('snake.html')

@app.route('/wordle')
def wordle():
    return render_template('wordle.html')

@app.route('/blockblast')
def blockblast():
    return render_template('blockblast.html')

@app.route('/save_snake_score', methods=['POST'])
def save_snake_score():
    """Save Snake game score."""
    if 'user_id' not in session:
        return {"error": "User not logged in"}, 401

    user_id = session['user_id']
    score = request.json.get('score')  # Score sent from frontend

    if score is None:
        return {"error": "Score is required"}, 400

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('INSERT INTO snake_scores (user_id, score) VALUES (?, ?)', (user_id, score))
    conn.commit()
    conn.close()

    return {"message": "Snake score saved successfully"}, 200


@app.route('/get_snake_leaderboard', methods=['GET'])
def get_snake_leaderboard():
    """Get the Snake game leaderboard."""
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('''
        SELECT u.username, MAX(s.score) AS high_score
        FROM snake_scores s
        JOIN users u ON s.user_id = u.id
        GROUP BY s.user_id
        ORDER BY high_score DESC
        LIMIT 10
    ''')
    leaderboard = cur.fetchall()
    conn.close()

    return {"leaderboard": [dict(row) for row in leaderboard]}, 200


@app.route('/save_minesweeper_time', methods=['POST'])
def save_minesweeper_time():
    if 'user_id' not in session:
        return {"error": "User not logged in"}, 401

    user_id = session['user_id']
    time = request.json.get('time')

    if time is None:
        return {"error": "Time is required"}, 400

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('INSERT INTO minesweeper_scores (user_id, time) VALUES (?, ?)', (user_id, time))
    conn.commit()
    conn.close()

    return {"message": "Minesweeper time saved successfully"}, 200


@app.route('/get_minesweeper_leaderboard', methods=['GET'])
def get_minesweeper_leaderboard():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('''
        SELECT u.username, MIN(m.time) AS best_time
        FROM minesweeper_scores m
        JOIN users u ON m.user_id = u.id
        GROUP BY m.user_id
        ORDER BY best_time ASC
        LIMIT 10
    ''')
    leaderboard = cur.fetchall()
    conn.close()

    return {"leaderboard": [dict(row) for row in leaderboard]}

@app.route('/save_wordhunt_score', methods=['POST'])
def save_wordhunt_score():
    if 'user_id' not in session:
        return {"error": "User not logged in"}, 401

    user_id = session['user_id']
    score = request.json.get('score')

    if score is None:
        return {"error": "Score is required"}, 400

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('INSERT INTO wordhunt_scores (user_id, score) VALUES (?, ?)', (user_id, score))
    conn.commit()
    conn.close()

    return {"message": "Word Hunt score saved successfully"}, 200


@app.route('/get_wordhunt_leaderboard', methods=['GET'])
def get_wordhunt_leaderboard():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('''
        SELECT u.username, MAX(w.score) AS max_score
        FROM wordhunt_scores w
        JOIN users u ON w.user_id = u.id
        GROUP BY w.user_id
        ORDER BY max_score DESC
        LIMIT 10
    ''')
    leaderboard = cur.fetchall()
    conn.close()

    return {"leaderboard": [dict(row) for row in leaderboard]}, 200

@app.route('/save_blockblast_score', methods=['POST'])
def save_blockblast_score():
    if 'user_id' not in session:
        return {"error": "User not logged in"}, 401

    user_id = session['user_id']
    score = request.json.get('score')

    if score is None:
        return {"error": "Score is required"}, 400

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('INSERT INTO blockblast_scores (user_id, score) VALUES (?, ?)', (user_id, score))
    conn.commit()
    conn.close()

    return {"message": "Block Blast score saved successfully"}, 200


@app.route('/get_blockblast_leaderboard', methods=['GET'])
def get_blockblast_leaderboard():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('''
        SELECT u.username, MAX(b.score) AS high_score
        FROM blockblast_scores b
        JOIN users u ON b.user_id = u.id
        GROUP BY b.user_id
        ORDER BY high_score DESC
        LIMIT 10
    ''')
    leaderboard = cur.fetchall()
    conn.close()

    return {"leaderboard": [dict(row) for row in leaderboard]}, 200


@app.route('/leaderboard')
def leaderboard():
    """Render the leaderboard selection page."""
    return render_template('leaderboard.html')

if __name__ == "__main__":
    init_db()
    app.debug = True
    app.run()
