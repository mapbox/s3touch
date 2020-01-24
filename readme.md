🌇 As of January 2020, this module is deprecated. It is provided as-is, with no warranty. We are not accepting new bugfixes or feature requests at this time.

s3touch
-------

![s3touch](https://cloud.githubusercontent.com/assets/515424/9432169/1165077e-49d3-11e5-93ca-5398fd3b018e.jpg)

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
