# Update Test

# Unauthenticated PUT to /v1/fragments
PUT http://localhost:8080/v1/fragments

HTTP/1.1 401

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

# Authenticated PUT to /v1/fragments
PUT {{url}}
Content-Type: text/plain
[BasicAuth]
user1@email.com:password1
`There are two fragments!`

# Successful PUT
HTTP/1.1 200

# Authenticated PUT to /v1/fragments
PUT {{url}}
Content-Type: text/html
[BasicAuth]
user1@email.com:password1
`This is a fragment!`

# Unsuccessful PUT due to wrogn type
HTTP/1.1 400

