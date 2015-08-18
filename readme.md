s3touch
-------
Utility to simulate S3 events without actually re-PUTing objects to S3.

    Usage: s3touch <s3 path> [--topic <arn string>]

    # touch a single object
    s3touch s3://my-bucket/some-object

    # touch all objects under a prefix
    s3touch --recursive s3://my-bucket/some-prefix/

    # touch a single object with custom SNS topic
    s3touch s3://my-bucket/some-object --topic arn:aws:sns:us-east-1:1234:this-bucket-s3-events

- Looks up SNS topic that is subscribed to the given S3 bucket,
- Looks up information about `some-object` (size, etag),
- and sends a simulated S3 event message to the SNS topic already set within the bucket or to the SNS topic explictly sent via the `--topic` flag

### Install

    npm install -g s3touch
