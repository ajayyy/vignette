# Client and Sever API

## User identities

Each user is identified by (the hashes of) their public key, but also users may provide a human-readaple nick name. Every record in the database is individually cryptographicaly signed (by the author of the record). For more detailed overview of the system refer to [Cryptography](./Crypography.md).

## Endpoints

All API endpoints are indempotent by design and update the whole data in a single transaction so that there are never "dirty" records.

### Contents

| Method |       Path                      | What it does                                                         |
|--------|---------------------------------|----------------------------------------------------------------------|
| `GET`  | `/info`                         | Returns information about server                                     |
| `GET`  | `/v0/segments/youtube/:videoID` | Returns segment information for the YouTube video with specific ID.  |
| `POST` | `/v0/segments`                  | Save new segment information for a video.                            |
| `POST` | `/v0/options`                   | Update options on the server.                                        |
| `POST` | `/v0/feedback`                  | Cast feedback about skipped segment.                                 |

#### Retreive server information
Method: `GET`
Path: `/info`

##### Response

|  Code | Explanation                     |
|-------|---------------------------------|
| `200` | Server information.             |

##### Response body

JSON with `apiVersions` that is an array of one or more strings identifying supported API versions.
```
{
  "apiVersions": ['v0', 'v1b']
}
```

#### Retreive video segments
Method: `GET`
Path: `/v0/segments/:platform/:videoID`

URL arameters:
 - `platform` -- has to be `youtube` (for now)
 - `videoID` -- video id, retreived from video URL

##### Response

|  Code | Explanation                     |
|-------|---------------------------------|
| `200` | Data found, returned as object. |
| `400` | Bad Request.                    |
| `404` | No data was submitted.          |

##### Response body

TODO

#### Submit video segments
Method: `POST`
Path: `/v0/segments`

Parameters:
 None

##### Request Body

JSON of the form:

 - `platform` -- has to be YouTube (for now)
 - `videoID` -- video id, retreived from video URL
 - `segments` -- an array of segment objects

##### Response

|  Code | Explanation                   |
|-------|-------------------------------|
| `200` | Data found, returned as object|
| `400` | No data was submitted.        |

#### Save options to the server
Method: `POST`
Path: `/v0/options`

##### Request Body

JSON of the form:

- userID - your userID
 - userName - your desired user name to be displayed everywhere
 - auth - authorization token, generated previously

##### Response
|  Code | Explanation                   |
|-------|-------------------------------|
| `...` | Data found, returned as object|
| `...` | No data was submitted.        |


#### Submit feedback (WIP)
Method: `POST`
Path: `/v0/feedback`

Parameters:
 - `platform` -- has to be YouTube (for now)
 - `videoID` -- video id, retreived from video URL
 - `segments` -- an array of segment objects

##### Request body

```
  "platform": "YouTube",
  "videoID": ...,
  "segmentID": ...,
```

##### Response
|  Code | Explanation                   |
|-------|-------------------------------|
| `...` | Data found, returned as object|
| `...` | No data was submitted.        |


{
  "cutOut":{
    "category": [string]
    "video": {
      "start": number,
      "end": number
    },
    "audio": {
      "start": number,
      "end": number
    }
  }
}
`
