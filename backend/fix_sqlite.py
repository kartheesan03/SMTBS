import sqlite3
import re

db_path = r'c:\Users\Admin\Documents\project\backend\database.sqlite'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    cursor.execute("SELECT id, message FROM Notification WHERE module = 'Attendance'")
    rows = cursor.fetchall()
    updated = 0

    for row in rows:
        id, msg = row
        if msg:
            if 'checked in at' in msg:
                new_msg = re.sub(r'checked in at .*?\. Status:', 'checked in. Status:', msg)
                cursor.execute("UPDATE Notification SET message = ? WHERE id = ?", (new_msg, id))
                updated += 1
            elif 'checked out at' in msg:
                new_msg = re.sub(r'checked out at .*\.', 'checked out.', msg)
                cursor.execute("UPDATE Notification SET message = ? WHERE id = ?", (new_msg, id))
                updated += 1

    conn.commit()
    print(f"Updated {updated} notifications in sqlite database.")
except Exception as e:
    print(f"Error: {e}")
finally:
    conn.close()
