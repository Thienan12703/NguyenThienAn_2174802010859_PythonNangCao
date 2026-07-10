"""
wsgi.py - Entry point cho PythonAnywhere deployment.
PythonAnywhere sẽ import biến 'application' từ file này.
"""
import sys
import os

# Đảm bảo thư mục gốc dự án nằm trong Python path
project_dir = os.path.dirname(os.path.abspath(__file__))
if project_dir not in sys.path:
    sys.path.insert(0, project_dir)

from app import create_app

application = create_app()

if __name__ == '__main__':
    application.run()
