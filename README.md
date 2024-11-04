# WebStatix

WebStatix is a simple and efficient Node.js application that checks the status of websites to determine if they are up or down. You can use WebStatix to quickly test the availability of any website by entering its URL. The project is deployed on Vercel and accessible via the following link:

[WebStatix - Check if a Website is Up or Down](https://webstatux.onrender.com/)


## How it Works

The `checkWebsite` function in WebStatix takes a URL and attempts to establish a connection using either HTTP or HTTPS protocols. The URL is parsed, and a request is made with a custom User-Agent header to simulate a standard browser request. Here’s how the process works:

1. **Protocol Selection:**  
   Based on the URL provided (whether HTTP or HTTPS), the appropriate protocol (`http` or `https`) is selected.

2. **HTTP Status Code Handling:**  
   - The application checks for HTTP response status codes.
   - If the status code is between `200-399`, the website is considered "up".
   - If the status code is `400` or higher, the website is considered "down".

3. **Redirects:**  
   - If a redirect (status codes 300-399) is encountered, the function follows the redirection and re-evaluates the new location.

4. **Timeout and Errors:**  
   - If the server takes too long to respond, the request times out after 10 seconds and marks the website as "down".
   - In case of network issues, such as the website not existing (`ENOTFOUND` error), the function gracefully handles the error and returns a "down" status.

## Error Codes

WebStatix provides detailed error reporting when a website is marked as "down":

- **200-399:** Website is up.
- **400 and above:** The website returned an error, and it's considered "down".
- **ENOTFOUND:** The website does not exist or the domain name cannot be resolved.
- **Request Timed Out:** The website took too long to respond, likely indicating that it is down or unresponsive.

## Technologies Used

- **Node.js**: The backend server is built using Node.js, which handles the website checks and responds to HTTP requests.
- **HTTP/HTTPS modules**: Depending on the URL, the appropriate protocol is used to establish the connection.
- **JavaScript**: All logic, including error handling and redirect handling, is implemented using JavaScript.

