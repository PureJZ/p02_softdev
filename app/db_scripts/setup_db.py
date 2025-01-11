import sqlite3

def init_db(db_path='app.db'):
    """
    Creates (or opens) the SQLite DB and ensures the 'users' table exists.
    """
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    cursor.execute('''
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