s3touch
-------
Utility to simulate S3 events without actually re-PUTing objects to S3.

    Usage: s3touch <s3 path>

    s3touch s3://my-bucket/some-object

- Looks up SNS topic that is subscribed to the given S3 bucket,
- Looks up information about `some-object` (size, etag),
- and sends a simulated S3 event message to the SNS topic.

