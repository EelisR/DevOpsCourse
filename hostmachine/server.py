#Just a very basic web server to keep container running
import os
from http.server import BaseHTTPRequestHandler, HTTPServer

hostName = os.environ.get("HOSTNAME", "localhost")
serverPort = os.environ.get("PORT", 8080)

class BasicServer(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-type", "text/plain")
        self.end_headers()
        self.wfile.write(bytes("Hello from Ansible exercise!", "utf-8"))

if __name__ == "__main__":        
    webServer = HTTPServer((hostName, int(serverPort)), BasicServer)
    print("Server started http://%s:%s" % (hostName, serverPort))

    try:
        webServer.serve_forever()
    except KeyboardInterrupt:
        pass

    webServer.server_close()
    print("Server stopped.")
