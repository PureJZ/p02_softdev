import sqlite3

def init_db(db_path='app.db'):
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    cur.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL
        );
    ''')

    conn.commit()
    conn.close()
    print(f"Database initialized: {db_path}")

if __name__ == '__main__':
    init_db()