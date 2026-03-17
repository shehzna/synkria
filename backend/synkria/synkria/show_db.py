import sqlite3
import os

# Connect to database
db_path = 'db.sqlite3'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Get all table names
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = cursor.fetchall()

print('=== DATABASE TABLES ===')
for table in tables:
    table_name = table[0]
    print(f'\n📋 Table: {table_name}')

    # Get row count
    cursor.execute(f'SELECT COUNT(*) FROM {table_name}')
    count = cursor.fetchone()[0]
    print(f'   Rows: {count}')

    # Get column names
    cursor.execute(f'PRAGMA table_info({table_name})')
    columns = cursor.fetchall()
    print(f'   Columns: {[col[1] for col in columns]}')

    # Show first few rows if table has data
    if count > 0:
        cursor.execute(f'SELECT * FROM {table_name} LIMIT 3')
        rows = cursor.fetchall()
        print('   Sample data:')
        for row in rows:
            print(f'     {row}')

conn.close()