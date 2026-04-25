import sqlite3
import os

def init_database():
    """Initialize SQLite database with schema"""

    db_path = 'database/causalcare.db'

    # Create database directory if it doesn't exist
    os.makedirs('database', exist_ok=True)

    # Connect to database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Create predictions table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS predictions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            disease TEXT NOT NULL,
            base_probability REAL NOT NULL,
            adjusted_risk REAL NOT NULL,
            lifestyle_factors TEXT,
            timestamp TEXT NOT NULL
        )
    ''')

    # Create simulations table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS simulations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            disease TEXT NOT NULL,
            before_risk REAL NOT NULL,
            after_risk REAL NOT NULL,
            interventions TEXT,
            timestamp TEXT NOT NULL
        )
    ''')

    # Create index for faster queries
    cursor.execute('''
        CREATE INDEX IF NOT EXISTS idx_predictions_timestamp
        ON predictions(timestamp DESC)
    ''')

    cursor.execute('''
        CREATE INDEX IF NOT EXISTS idx_simulations_timestamp
        ON simulations(timestamp DESC)
    ''')

    conn.commit()
    conn.close()

    print(f"Database initialized at {db_path}")

if __name__ == "__main__":
    init_database()
