# Delete Test

# Unauthenticated DELETE to /v1/fragments
DELETE http://localhost:8080/v1/fragments

HTTP/1.1 401


# Authenticated DELETE to /v1/fragments
DELETE http://localhost:8080/v1/fragments/1223
[BasicAuth]
user1@email.com:password1

# Unsuccessful delete of nonexistent fragment
HTTP/1.1 404

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

# Authenticated DELETE to /v1/fragments
DELETE {{url}}
Content-Type: text/plain
# Include HTTP Basic Auth credentials; must place after any header
[BasicAuth]
user1@email.com:password1

# Successful delete
HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"

# Unsuccessful GET
GET {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 404


