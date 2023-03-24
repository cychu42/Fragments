# POST Test for unsupported Content-Type

# Authenticated POST to /v1/fragments
POST http://localhost:8080/v1/fragments
# We're sending a plain text fragment
Content-Type: application/java-archive
# Include HTTP Basic Auth credentials; must place after any header
[BasicAuth]
user1@email.com:password1
# Body of the request goes in `...` when it's a string
`This is a fragment!`

#1. We expect to get back an HTTP 415
HTTP 415
