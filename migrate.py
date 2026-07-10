import sqlite3
conn = sqlite3.connect('app.db')
conn.execute("ALTER TABLE 'order' ADD COLUMN notes TEXT")
conn.commit()
conn.close()
