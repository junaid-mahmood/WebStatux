const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

function checkWebsite(url) {
  return new Promise((resolve, reject) => {
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }

    const options = new URL(url);
    options.headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
    };

    const protocol = url.startsWith('https') ? https : http;

    const req = protocol.get(options, (res) => {
      const { statusCode } = res;
      
      // Handle redirects
      if (statusCode >= 300 && statusCode < 400 && res.headers.location) {
        return checkWebsite(res.headers.location).then(resolve).catch(reject);
      }

      if (statusCode >= 200 && statusCode < 400) {
        resolve({ status: 'up', statusCode });
      } else {
        resolve({ status: 'down', statusCode });
      }
    });

    req.on('error', (err) => {
      if (err.code === 'ENOTFOUND') {
        resolve({ status: 'down', error: 'Website does not exist' });
      } else {
        resolve({ status: 'down', error: err.message });
      }
    });

    // Set a timeout of 10 seconds
    req.setTimeout(10000, () => {
      req.abort();
      resolve({ status: 'down', error: 'Request timed out' });
    });
  });
}

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    fs.readFile(path.join(__dirname, 'index.html'), (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading index.html');
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(content);
      }
    });
  } else if (req.method === 'POST' && req.url === '/check') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', async () => {
      try {
        const { url } = JSON.parse(body);
        const result = await checkWebsite(url);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid request' }));
      }
    });
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
