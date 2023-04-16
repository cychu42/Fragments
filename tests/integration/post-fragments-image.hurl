# POST Test for image types

# PNG
# Authenticated POST to /v1/fragments
POST http://localhost:8080/v1/fragments
# We're sending a plain text fragment
Content-Type: image/png
# Include HTTP Basic Auth credentials; must place after any header
[BasicAuth]
user1@email.com:password1
# Upload image
file,test_png.png;

# We expect to get back an HTTP 201
HTTP/1.1 201
# We have various assertions about the response that we want to check
[Asserts]
# The Location header should look like what we expect (including the fragment id)
header "Location" matches "^http:\/\/localhost:8080\/v1\/fragments\/[A-Za-z0-9_-]+$"
jsonpath "$.status" == "ok"
# Our fragment ids use UUIDs, see https://ihateregex.io/expr/uuid/
jsonpath "$.fragment.id" matches "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
# Our ownerId hash is a hex encoded string
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
# Basic check for the presence of created and updated date strings.
# You could also write a regex for this and use matches
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString
jsonpath "$.fragment.type" == "image/png"
# 1015 is the length of our fragment data: 'This is a fragment!'
jsonpath "$.fragment.size" == 1015
# Capture the Location URL into a variable named `url`
[Captures]
url: header "Location"

#Try to GET the fragment we just posted by its URL
GET {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: image/png
Content-Length: 1015
[Asserts]
file,test_png.png;

# JPEG
# Authenticated POST to /v1/fragments
POST http://localhost:8080/v1/fragments
# We're sending a plain text fragment
Content-Type: image/jpeg
# Include HTTP Basic Auth credentials; must place after any header
[BasicAuth]
user1@email.com:password1
# Upload image
file,test_jpeg.jpg;

# We expect to get back an HTTP 201
HTTP/1.1 201

[Asserts]
jsonpath "$.fragment.type" == "image/jpeg"
jsonpath "$.fragment.size" == 3018
# Capture the Location URL into a variable named `url`
[Captures]
url: header "Location"

#Try to GET the fragment we just posted by its URL
GET {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: image/jpeg
Content-Length: 3018
[Asserts]
file,test_jpeg.jpg;


# JPEG
# Authenticated POST to /v1/fragments
POST http://localhost:8080/v1/fragments
# We're sending a plain text fragment
Content-Type: image/jpeg
# Include HTTP Basic Auth credentials; must place after any header
[BasicAuth]
user1@email.com:password1
# Upload image
file,test_jpeg.jpg;

# We expect to get back an HTTP 201
HTTP/1.1 201

[Asserts]
jsonpath "$.fragment.type" == "image/jpeg"
jsonpath "$.fragment.size" == 3018
# Capture the Location URL into a variable named `url`
[Captures]
url: header "Location"

#Try to GET the fragment we just posted by its URL
GET {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: image/jpeg
Content-Length: 3018
[Asserts]
file,test_jpeg.jpg;


# WEBP
# Authenticated POST to /v1/fragments
POST http://localhost:8080/v1/fragments
# We're sending a plain text fragment
Content-Type: image/webp
# Include HTTP Basic Auth credentials; must place after any header
[BasicAuth]
user1@email.com:password1
# Upload image
file,test_webp.webp;

# We expect to get back an HTTP 201
HTTP/1.1 201

[Asserts]
jsonpath "$.fragment.type" == "image/webp"
jsonpath "$.fragment.size" == 780
# Capture the Location URL into a variable named `url`
[Captures]
url: header "Location"

#Try to GET the fragment we just posted by its URL
GET {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: image/webp
Content-Length: 780
[Asserts]
file,test_webp.webp;


# GIF
# Authenticated POST to /v1/fragments
POST http://localhost:8080/v1/fragments
# We're sending a plain text fragment
Content-Type: image/gif
# Include HTTP Basic Auth credentials; must place after any header
[BasicAuth]
user1@email.com:password1
# Upload image
file,test_gif.gif;

# We expect to get back an HTTP 201
HTTP/1.1 201

[Asserts]
jsonpath "$.fragment.type" == "image/gif"
jsonpath "$.fragment.size" == 5009
# Capture the Location URL into a variable named `url`
[Captures]
url: header "Location"

#Try to GET the fragment we just posted by its URL
GET {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: image/gif
Content-Length: 5009
[Asserts]
file,test_gif.gif;
