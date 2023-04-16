# Conversion Test

# Unauthenticated GET to /v1/fragments/:id.ext
GET http://localhost:8080/v1/fragments/123.html

HTTP/1.1 401


# Authenticated DELETE to /v1/fragments/:id.ext
DELETE http://localhost:8080/v1/fragments/123.html
[BasicAuth]
user1@email.com:password1

# Unsuccessful get of nonexistent fragment
HTTP/1.1 404

#1. Same data type conversion
# Authenticated POST to /v1/fragments
POST http://localhost:8080/v1/fragments
# We're sending a plain text fragment
Content-Type: text/plain
# Include HTTP Basic Auth credentials; must place after any header
[BasicAuth]
user1@email.com:password1
# Body of the request goes in `...` when it's a string
`This is a fragment!`

HTTP/1.1 201
[Captures]
url: header "Location"

# Authenticated GET to /v1/fragments/:id.ext
GET {{url}}.txt
# Include HTTP Basic Auth credentials; must place after any header
[BasicAuth]
user1@email.com:password1

# Successful get of same data type
HTTP/1.1 200
Content-Type: text/plain
[Asserts]
body == "This is a fragment!"


#2. MD to TXT
# Authenticated POST to /v1/fragments
POST http://localhost:8080/v1/fragments
# We're sending a fragment
Content-Type: text/markdown
# Include HTTP Basic Auth credentials; must place after any header
[BasicAuth]
user1@email.com:password1
# Body of the request
"# This is a fragment"

HTTP/1.1 201
[Captures]
url: header "Location"

# Authenticated GET to /v1/fragments/:id.ext
GET {{url}}.txt
# Include HTTP Basic Auth credentials; must place after any header
[BasicAuth]
user1@email.com:password1

# Successful get of same data type
HTTP/1.1 200
Content-Type: text/plain; charset=utf-8
[Asserts]
body == "\"# This is a fragment\""

#3. HTML to TXT
# Authenticated POST to /v1/fragments
POST http://localhost:8080/v1/fragments
# We're sending a fragment
Content-Type: text/html
# Include HTTP Basic Auth credentials; must place after any header
[BasicAuth]
user1@email.com:password1
# Body of the request
"<h1>title<h1>"

HTTP/1.1 201
[Captures]
url: header "Location"

# Authenticated GET to /v1/fragments/:id.ext
GET {{url}}.txt
# Include HTTP Basic Auth credentials; must place after any header
[BasicAuth]
user1@email.com:password1

# Successful get of same data type
HTTP/1.1 200
Content-Type: text/plain; charset=utf-8
[Asserts]
body == "\"<h1>title<h1>\""


#4. JSON to TXT
# Authenticated POST to /v1/fragments
POST http://localhost:8080/v1/fragments
# We're sending a JSON fragment
Content-Type: application/json
# Include HTTP Basic Auth credentials; must place after any header
[BasicAuth]
user1@email.com:password1
# Body of the request
{ "content": "This is a fragment!" }

HTTP/1.1 201
[Captures]
url: header "Location"

# Authenticated GET to /v1/fragments/:id.ext
GET {{url}}.txt
# Include HTTP Basic Auth credentials; must place after any header
[BasicAuth]
user1@email.com:password1

# Successful get of same data type
HTTP/1.1 200
Content-Type: text/plain; charset=utf-8
[Asserts]
body == "{content:This is a fragment!}"


#5. PNG to JPEG
# Authenticated POST to /v1/fragments
POST http://localhost:8080/v1/fragments
# We're sending a fragment
Content-Type: image/png
# Include HTTP Basic Auth credentials; must place after any header
[BasicAuth]
user1@email.com:password1
# Body of the request
file,test_png.png;

HTTP/1.1 201
[Captures]
url: header "Location"
size: header "Content-Length"

# Authenticated GET to /v1/fragments/:id.ext
GET {{url}}.jpg
# Include HTTP Basic Auth credentials; must place after any header
[BasicAuth]
user1@email.com:password1

# Successful GET
HTTP/1.1 200
Content-Type: image/jpeg
[Asserts]
header "Content-Length" not equals {{size}}


#6. JPEG to WEBP
# Authenticated POST to /v1/fragments
POST http://localhost:8080/v1/fragments
# We're sending a fragment
Content-Type: image/jpeg
# Include HTTP Basic Auth credentials; must place after any header
[BasicAuth]
user1@email.com:password1
# Body of the request
file,test_jpeg.jpg;

HTTP/1.1 201
[Captures]
url: header "Location"
size: header "Content-Length"

# Authenticated GET to /v1/fragments/:id.ext
GET {{url}}.webp
# Include HTTP Basic Auth credentials; must place after any header
[BasicAuth]
user1@email.com:password1

# Successful GET
HTTP/1.1 200
Content-Type: image/webp
[Asserts]
header "Content-Length" not equals {{size}}


#7. WEBP to GIF
# Authenticated POST to /v1/fragments
POST http://localhost:8080/v1/fragments
# We're sending a fragment
Content-Type: image/webp
# Include HTTP Basic Auth credentials; must place after any header
[BasicAuth]
user1@email.com:password1
# Body of the request
file,test_webp.webp;

HTTP/1.1 201
[Captures]
url: header "Location"
size: header "Content-Length"

# Authenticated GET to /v1/fragments/:id.ext
GET {{url}}.gif
# Include HTTP Basic Auth credentials; must place after any header
[BasicAuth]
user1@email.com:password1

# Successful GET
HTTP/1.1 200
Content-Type: image/gif
[Asserts]
header "Content-Length" not equals {{size}}


#8. GIF to PNG
# Authenticated POST to /v1/fragments
POST http://localhost:8080/v1/fragments
# We're sending a fragment
Content-Type: image/gif
# Include HTTP Basic Auth credentials; must place after any header
[BasicAuth]
user1@email.com:password1
# Body of the request
file,test_gif.gif;

HTTP/1.1 201
[Captures]
url: header "Location"
size: header "Content-Length"

# Authenticated GET to /v1/fragments/:id.ext
GET {{url}}.png
# Include HTTP Basic Auth credentials; must place after any header
[BasicAuth]
user1@email.com:password1

# Successful GET
HTTP/1.1 200
Content-Type: image/png
[Asserts]
header "Content-Length" not equals {{size}}


#9. Invaldi conversion
# Authenticated POST to /v1/fragments
POST http://localhost:8080/v1/fragments
# We're sending a fragment
Content-Type: image/gif
# Include HTTP Basic Auth credentials; must place after any header
[BasicAuth]
user1@email.com:password1
# Body of the request
file,test_gif.gif;

HTTP/1.1 201
[Captures]
url: header "Location"
size: header "Content-Length"

# Authenticated GET to /v1/fragments/:id.ext
GET {{url}}.txt
# Include HTTP Basic Auth credentials; must place after any header
[BasicAuth]
user1@email.com:password1

# Unsuccessful GET
HTTP/1.1 415
