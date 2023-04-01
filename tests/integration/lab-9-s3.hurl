# Lab 9 s3 Test

# Authenticated POST to /v1/fragments
POST http://localhost:8080/v1/fragments
# We're sending a plain text fragment
Content-Type: text/plain
# Include HTTP Basic Auth credentials; must place after any header
[BasicAuth]
user1@email.com:password1
# Body of the request goes in `...` when it's a string
`Hello S3!`

#1. We expect to get back an HTTP 201
HTTP/1.1 201
[Captures]
url: header "Location"

# 2. Try to GET the fragment we just posted by its URL
GET {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: text/plain
[Asserts]
body == "Hello S3!"

# 3. Try to DELETE the fragment we just get by its URL
DELETE {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200

# 4. Try to GET the fragment we just delete by its URL
GET {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 404
