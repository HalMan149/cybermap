from http.server import BaseHTTPRequestHandler, HTTPServer
import requests

class CORSProxy(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            target_url = self.path[1:]
            # Pasa cabeceras estándar de navegador real
            headers = {
                "User-Agent": self.headers.get('User-Agent', "Mozilla/5.0"),
                "Accept": self.headers.get('Accept', "application/json, text/plain, */*")
            }
            resp = requests.get(target_url, headers=headers)
            self.send_response(resp.status_code)
            content_type = resp.headers.get('content-type', '').lower()
            # Si la respuesta es JSON, fuerzamos application/json
            if "application/json" in content_type or target_url.endswith('.json'):
                self.send_header('Content-type', 'application/json')
            else:
                self.send_header('Content-type', content_type or 'application/octet-stream')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(resp.content)
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'text/plain')
            self.end_headers()
            self.wfile.write(b'Error: ' + str(e).encode())

def run(server_class=HTTPServer, handler_class=CORSProxy, port=8080):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f'CORS proxy running at http://localhost:{port}/')
    httpd.serve_forever()

if __name__ == '__main__':
    run()
