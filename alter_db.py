import sqlite3
conn = sqlite3.connect('app.db')
cursor = conn.cursor()
try:
    cursor.execute('ALTER TABLE "order" ADD COLUMN tracking_code VARCHAR(50)')
    cursor.execute('ALTER TABLE "order" ADD COLUMN guest_name VARCHAR(100)')
    cursor.execute('ALTER TABLE "order" ADD COLUMN guest_phone VARCHAR(20)')
    cursor.execute('ALTER TABLE "order" ADD COLUMN guest_email VARCHAR(120)')
except Exception as e:
    print(e)
conn.commit()
conn.close()
print('DB Updated')
