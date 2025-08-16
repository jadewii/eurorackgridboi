#!/usr/bin/env python3
"""
Simple HTTP server to test Supabase connection locally
Run: python3 test-server.py
Then open: http://localhost:8000/test-supabase.html
"""

import http.server
import socketserver
import os

PORT = 8000

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, apikey')
        super().end_headers()

os.chdir('/Users/jade/eurogrid/frontend')

with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
    print(f"Server running at http://localhost:{PORT}/")
    print(f"Open: http://localhost:{PORT}/test-supabase.html")
    print("Press Ctrl+C to stop")
    httpd.serve_forever()