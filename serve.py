"""Dev server with correct MIME types (Windows registry maps .js to text/plain)."""
import http.server
import functools
import sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8123
DIR = sys.argv[2] if len(sys.argv) > 2 else "."


class Handler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {
        ".html": "text/html",
        ".js": "text/javascript",
        ".mjs": "text/javascript",
        ".css": "text/css",
        ".png": "image/png",
        ".webmanifest": "application/manifest+json",
        ".json": "application/json",
        ".svg": "image/svg+xml",
        "": "application/octet-stream",
    }

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def do_POST(self):
        """POST /shot?name=xyz (data-URL body -> shots/xyz.jpg|png) or
        POST /upload?name=xyz.webm (raw binary body -> shots/xyz.webm)."""
        import base64
        import os
        import re
        from urllib.parse import urlparse, parse_qs

        parsed = urlparse(self.path)
        if parsed.path == "/upload":
            name = parse_qs(parsed.query).get("name", ["upload.bin"])[0]
            name = re.sub(r"[^a-zA-Z0-9_.-]", "", name)[:80] or "upload.bin"
            if not name.endswith((".webm", ".mp4", ".png", ".jpg")):
                self.send_error(400)
                return
            length = int(self.headers.get("Content-Length", 0))
            if length > 300_000_000:
                self.send_error(413)
                return
            shots = os.path.join(os.path.dirname(os.path.abspath(__file__)), "shots")
            os.makedirs(shots, exist_ok=True)
            path = os.path.join(shots, name)
            remaining = length
            with open(path, "wb") as f:
                while remaining > 0:
                    chunk = self.rfile.read(min(remaining, 1 << 20))
                    if not chunk:
                        break
                    f.write(chunk)
                    remaining -= len(chunk)
            self.send_response(200)
            self.send_header("Content-Type", "text/plain")
            self.end_headers()
            self.wfile.write(path.encode())
            return
        if parsed.path != "/shot":
            self.send_error(404)
            return
        name = parse_qs(parsed.query).get("name", ["shot"])[0]
        name = re.sub(r"[^a-zA-Z0-9_-]", "", name)[:60] or "shot"
        length = int(self.headers.get("Content-Length", 0))
        if length > 8_000_000:
            self.send_error(413)
            return
        body = self.rfile.read(length).decode("utf-8", "ignore")
        m = re.match(r"data:image/(jpeg|png);base64,(.+)", body)
        if not m:
            self.send_error(400)
            return
        ext = "jpg" if m.group(1) == "jpeg" else "png"
        shots = os.path.join(os.path.dirname(os.path.abspath(__file__)), "shots")
        os.makedirs(shots, exist_ok=True)
        path = os.path.join(shots, f"{name}.{ext}")
        with open(path, "wb") as f:
            f.write(base64.b64decode(m.group(2)))
        self.send_response(200)
        self.send_header("Content-Type", "text/plain")
        self.end_headers()
        self.wfile.write(path.encode())

    def log_message(self, *args):
        pass


if __name__ == "__main__":
    handler = functools.partial(Handler, directory=DIR)
    with http.server.ThreadingHTTPServer(("127.0.0.1", PORT), handler) as httpd:
        print(f"serving {DIR} on {PORT}")
        httpd.serve_forever()
