# API Documentation

* [Authentication](#authentication)
  * [Login](#login)
  * [Authorizing requests](#authorizing-requests)
* [Servers](#servers)
  * [Get all servers](#get-list-of-servers)
  * [Search for server](#search-for-server)
  * [Create new server](#create-new-server)
  * [Delete server](#delete-server)
  * [Update server](#update-server)
* [Locations](#locations)
  * [Get locations](#get-locations)
  * [Delete Location](#delete-location)
  * [Update location](#update-location)
* [Purposes](#purposes)
  * [Get purposes](#get-purposes)
  * [Delete purpose](#delete-purpose)
  * [Update purpose](#update-purpose)
* [Settings](#settings)
  * [Get current settings](#get-current-settings)
  * [Update selected headers](#update-selected-headers)
  * [Remove DNS suffix](#remove-dns-suffix)
  * [Update DNS suffix](#update-dns-suffix)

## Authentication

### Login

Authenticate against AD and return an authorization token

URL

`/api/post`

Method

`POST`

Data Params

| Field | Type | Description | Required |
| --- | --- | --- | --- |
| `username` | `String` | sAMAccountName of user to login | **yes** |
| `password` | `String` | Password of user | **yes** |

Success Response 

```http
Status: 200 OK
X-Auth-Token: {authtoken}
```

Error Response

```http
Status: 401 Unauthorized
Content-Type: application/json

{
  "error": [
    "Username or password is incorrect"
  ]
}
```

```http
Status: 403 Forbidden
Content-Type: application/json

{
  "error": [
    "You do not have permission to access this page."
  ]
}
```

### Authorizing requests

All requests with the exception of `/api/post` must contain a valid authorization header

Request Headers

| Field | Description | Value |
| --- | --- | --- |
| `Authorization` | Authorization token received from the login call | `Bearer {authtoken}`

Error Responses

```http
Status: 401 Unauthorized
Content-Type: application/json

{
  "error": [
    "Invalid Token. Please login."
  ]
}
```

```http
Status: 403 Forbidden
Content-Type: application/json

{
  "error": [
    "You do not have permission to modify the requested resource."
  ]
}
```

## Servers

### Get list of servers

Return a list of all servers and server data

URL

`/api/servers`

Method

`GET`

Success Response

```http
Status: 200 OK
Content-Type: application/json

[
  {
    "id": "5b6ccaef3824a90d1b901718",
    "serverName": "DCA21001",
    "applications": [
      "DNS",
      "Domain Controller"
    ]
  },
  {
    "id": "7da13ab313824a90d1b901718",
    "serverName": "DCA21002",
    "virtualization": "cloud"
  }
]
```

### Search for server

Searches for all servers with a specified name

URL

`/api/servers/:name`

METHOD

`GET`

URL Params

| Name | Description |
| --- | --- |
| `name` | Name of server to search using pattern `%name%` |

Success Response

```http
Status: 200 OK
Content-Type: application/json

[
  {
    "serverName": "DCA21001"
  },
  {
    "serverName": "DCA21002"
  }
]
```

### Create new server

Add new server to database

URL

`/api/servers`

Method

`POST`

Data Params

| Field | Type | Description | Required |
| --- | --- | --- | --- |
| `applicationOwner` | String | Owner of the application running on the server | no |
| `applications` | Array[String] | Array of all applications running on the server | no |
| `backupDate` | String | Last date of backup | no |
| `cpu` | String | Description of CPU installed on server | no |
| `disks` | String | Description of disk installed on server | no |
| `dnsName` | String | Domain name of server | no |
| `location` | String | 3 character location code | **yes** |
| `maintWin` | String | Beginning time of maintenance window | no |
| `maintWinTo` | String | Ending time of maintenance window | no |
| `memory` | String | Description of memory installed on server | no |
| `monitoring` | Boolean | Whether or not monitoring is enabled | no |
| `notes` | String | Notes of server | no |
| `os` | String | Operating system installed on server | no |
| `patchDate` | String | Date of the last time the server was updated | no |
| `purpose` | Integar | 2 number purpose code | no |
| `serverName` | String | Name of the server | no |
| `serverSmes` | Array[String] | Array of server SME's | no |
| `serverType` | String[`appliance`, `server`] | Type of server | no |
| `retired` | Boolean | Server is retired | no |
| `updatedBy` | String | Last person to update the server | no |
| `url` | String | URL of the application running on the server | no |
| `virtualization` | String[`physical`, `virtual`, `cloud`] | Virtualization type of server | no |
| `vlan` | String | VLAN server is running on | no |
 
Success Response
```http
Status: 201 Created
Content-Type: application/json

{
  "id": "7da13ab313824a90d1b901718",
  "serverName": "DCA20013",
}
 ```

Error Responses
```http
Status: 409 Conflict
Content-Type: application/json

{
  "error": [
    "An item with that name already exists"
  ]
}
```

### Delete server

Delete a given server

URL

`/api/servers/:id`

Method

`DELETE`

URL Params

| Name | Description |
| --- | --- |
| `id` | ID of the server to delete |

Success Response

```http
Status: 200 OK
```

Error Responses

```http
Status: 404 Not Found
Content-Type: application/json

{
  "error": [
    "Server ID not found."
  ]
}
```

### Update server

Update server details

URL

`/api/servers/:id`

Method

`PUT`

URL Params

| Name | Description |
| --- | --- |
| `id` | ID of the server to update |

Data Params

| Field | Type | Description | Required |
| --- | --- | --- | --- |
| `applicationOwner` | String | Owner of the application running on the server | no |
| `applications` | Array[String] | Array of all applications running on the server | no |
| `backupDate` | String | Last date of backup | no |
| `cpu` | String | Description of CPU installed on server | no |
| `disks` | String | Description of disk installed on server | no |
| `dnsName` | String | Domain name of server | no |
| `location` | String | 3 character location code | no |
| `maintWin` | String | Beginning time of maintenance window | no |
| `maintWinTo` | String | Ending time of maintenance window | no |
| `memory` | String | Description of memory installed on server | no |
| `monitoring` | Boolean | Whether or not monitoring is enabled | no |
| `notes` | String | Notes of server | no |
| `os` | String | Operating system installed on server | no |
| `patchDate` | String | Date of the last time the server was updated | no |
| `purpose` | Integar | 2 number purpose code | no |
| `serverName` | String | Name of the server | no |
| `serverSmes` | Array[String] | Array of server SME's | no |
| `serverType` | String[`appliance`, `server`] | Type of server | no |
| `retired` | Boolean | Server is retired | no |
| `updatedBy` | String | Last person to update the server | no |
| `url` | String | URL of the application running on the server | no |
| `virtualization` | String[`physical`, `virtual`, `cloud`] | Virtualization type of server | no |
| `vlan` | String | VLAN server is running on | no |

Success Response

```http
Status: 200 OK
Content-Type: application/json

{
  "id": "7da13ab313824a90d1b901718",
  "serverName": "DCA20013",
}
```

Error Responses

```http
Status: 404 Not Found
Content-Type: application/json

{
  "error": [
    "Server ID not found."
  ]
}
```

```http
Status: 409 Conflict
Content-Type: application/json

{
  "error": [
    "An item with that name already exists"
  ]
}
```

## Locations

### Get locations

Get list of all location codes

URL

`/api/locations`

METHOD

`GET`

Success Response

```http
Status: 200 OK
Content-Type: application/json

[
  {
    "id": "7da13ab313824a90d1b901718",
    "code": "DCA",
    "description": "Seattle"
  },
  {
    "id": "7da13a7813824a90d1b901718",
    "code": "DEN",
    "description": "Denver"
  }
]
```

### Create location

Create a new location

URL

`/api/locations`

Method

`POST`

Data Params

| Name | Type | Description | Required |
| --- | --- | --- | --- |
| `code` | String | 3 character code of location | **yes** |
| `description` | String | Description of location code | **yes** |

Success Response

```http
Status: 201 Created
Content-Type: application/json

{
  "id": "7da13ab313824a90d1b901718",
  "code": "DCA",
  "description": "Seattle"
}
```

Error Responses

```http
Status: 409 Conflict
Content-Type: application/json

{
  "error": [
    "An item with that name already exists"
  ]
}
```

### Delete location

Delete a given location

URL

`/api/locations/:id`

Method

`DELETE`

URL Params

| Name | Description |
| --- | --- |
| `id` | ID of location to delete |

Success Response

```http
Status: 200 OK
```

Error Responses

```http
Status: 404 Not Found
Content-Type: application/json

{
  "error": [
    "Location ID not found."
  ]
}
```

### Update location

Update description of location

URL

`/api/locations/:id`

Method

`PUT`

URL Params

| Name | Description |
| --- | --- |
| `id` | ID of location to delete |

Data Params

| Name | Type | Description | Required |
| --- | --- | --- | --- |
| `code` | String | 3 character code of location | no |
| `description` | String | Description of location code | no |

Success Response

```http
Status: 200 OK
Content-Type: application/json

{
  "id": "7da13ab313824a90d1b901718",
  "code": "DCA",
  "description": "Portland"
}
```

Error Responses

```http
Status: 404 Not Found
Content-Type: application/json

{
  "error": [
    "Location ID not found."
  ]
}
```

## Purposes

### Get purposes

Get list of all purpose codes

URL

`/api/purposes`

METHOD

`GET`

Success Response

```http
Status: 200 OK
Content-Type: application/json

[
  {
    "id": "7da13ab313824a90d1b901718",
    "code": "20",
    "description": "Domain Controller"
  },
  {
    "id": "7da13ab313824a90d1b901718",
    "code": "21",
    "description": "DCHP"
  }
]
```

### Create purpose

Create a new purpose

URL

`/api/purposes`

Method

`POST`

Data Params

| Name | Type | Description | Required |
| --- | --- | --- | --- |
| `code` | String | 2 character code of purpose | **yes** |
| `description` | String | Description of purpose code | **yes** |

Success Response

```http
Status: 201 Created
Content-Type: application/json

{
  "code": "20",
  "description": "Domain Controller"
}
```

Error Responses

```http
Status: 409 Conflict
Content-Type: application/json

{
  "error": [
    "An item with that name already exists"
  ]
}
```

### Delete purpose

Delete a given purpose

URL

`/api/purpose/:id`

Method

`DELETE`

URL Params

| Name | Description |
| --- | --- |
| `id` | ID of purpose to delete |

Success Response

```http
Status: 200 OK
```

Error Responses

```http
Status: 404 Not Found
Content-Type: application/json

{
  "error": [
    "Purpose ID not found."
  ]
}
```

### Update purpose

Update description of purpose

URL

`/api/purposes/:id`

Method

`PUT`

URL Params

| Name | Description |
| --- | --- |
| `id` | ID of purpose to delete |

Data Params

| Name | Type | Description | Required |
| --- | --- | --- | --- |
| `code` | String | 2 character code of purpose | yes |
| `description` | String | Description of purpose code | no |

Success Response

```http
Status: 200 OK
Content-Type: application/json

{
  "id": "7da13ab313824a90d1b901718",
  "code": "21",
  "description": "Jump Box"
}
```

Error Responses

```http
Status: 404 Not Found
Content-Type: application/json

{
  "error": [
    "Purpose ID not found."
  ]
}
```

## Settings

### Get current settings

Get settings of current logged in use

URL

`/api/settings`

Method

`GET`

Success Response

```http
Status: 200 OK
Content-Type: application/json

{
  "dns": "mysite.com",
  "headers": [
    "applications",
    "serverName",
    "virtualization"
  ]
}
```

### Update selected headers

Toggles a header's visible state for the logged in user

URL

`/api/settings/headers/:header`

Method

`PATCH`

URL Params

| Name | Description |
| --- | --- |
| `header` | Header to toggle (see [server data params](#create-new-server) for list of valid headers) |

Success Response

```http
Status: 200 OK
Content-Type: application/json

[
  "serverName",
  "memory",
  "virtualization"
]
```

Error Responses

```http
Status: 422 Unprocessable Entity
Content-Type: application/json

{
  "error": [
    "incorrectHeader is not a valid header."
  ]
}
```

### Remove DNS suffix

Remove the current DNS for the logged in user

URL

`/api/settings/dns`

Method

`DELETE`

Success Response

```http
Status: 200 OK
Content-Type: application/json

{
  "dns": "",
  "headers": [
    "applications",
    "serverName",
    "virtualization"
  ]
}
```

### Update DNS suffix

Update the default DNS suffix for the logged in user

URL

`/api/settings/dns/:dns`

Method

`PATCH`

URL Params

| Name | Description |
| --- | --- |
| `dns` | DNS name to be set |

Success Response

```http
Status: 200 OK
Content-Type: application/json

{
  "dns": "mysite.com",
  "headers": [
    "applications",
    "serverName",
    "virtualization"
  ]
}
```