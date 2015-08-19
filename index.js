var AWS = require('aws-sdk');
var url = require('url');
var region = process.env.AWS_DEFAULT_REGION || 'us-east-1';
var sns = new AWS.SNS({ region: region });
var s3 = new AWS.S3({ region: region });

module.exports = {};
module.exports.usage = usage;
module.exports.touch = touch;
module.exports.createMessage = createMessage;
module.exports.list = list;

function usage() {
    return 'Usage: s3touch <s3 path> [--topic <ARN string>]';
}

function touch(s3path, cache, topic, callback) {
    var uri = url.parse(s3path);
    var bucket = uri.hostname;
    var objkey = (uri.pathname||'').substr(1);
    
    if (uri.protocol !== 's3:' || !bucket || !objkey) return callback(new Error('Invalid S3 path "' + s3path + '"'));

    createMessage(bucket, objkey, function(err, message) {
        if (err) return callback(err);
        
        if (topic) {
            publishEvent(topic, message, callback);
        } else if (cache[bucket]) {
            publishEvent(cache[bucket], message, callback);
        } else {
            s3.getBucketNotification({ Bucket: bucket }, function(err, data) {
                if (err) return callback(new Error('Could not get bucket SNS topic ("'+(err.message||err.statusCode)+'")'));
                cache[bucket] = data.TopicConfiguration.Topic;
                publishEvent(cache[bucket], message, callback);
            });
        }
    });
}

function createMessage(bucket, objkey, callback) {
    s3.headObject({ Bucket: bucket, Key: objkey }, function(err, data) {
        if (err) return callback(new Error('Could not HEAD object ("'+(err.message||err.statusCode)+'")'));
        var size = parseInt(data.ContentLength, 10);
        var etag = JSON.parse(data.ETag);
        var date = (new Date()).toISOString();
        callback(null, {
            "Records": [
                {
                    "eventVersion": "2.0",
                    "eventSource": "aws:s3",
                    "awsRegion": region,
                    "eventTime": date,
                    "eventName": "ObjectCreated:CompleteMultipartUpload",
                    "s3": {
                        "s3SchemaVersion": "1.0",
                        "bucket": {
                            "name": bucket,
                            "arn": "arn:aws:s3:::" + bucket
                        },
                        "object": {
                            "key": objkey,
                            "size": size,
                            "eTag": etag
                        }
                    }
                }
            ]
        });
    });
}

function publishEvent(topic, message, callback) {
    sns.publish({ TopicArn: topic, Message: JSON.stringify(message) }, function(err, data) {
        if (err) return callback(new Error('Could not send SNS message ("' + (err.message||err.statusCode) + '")'));
        return callback(null, data);
    });
}

function list(s3path, callback) {
    var uri = url.parse(s3path);
    var bucket = uri.hostname;
    var prefix = (uri.pathname||'').substr(1);

    if (uri.protocol !== 's3:' || !bucket || !prefix) return callback(new Error('Invalid S3 path "' + s3path + '"'));

    var marker = null;
    var result = [];
    function list() {
        s3.listObjects({
            Bucket: bucket,
            Prefix: prefix,
            Marker: marker
        }, function(err, data) {
            if (err) return callback(err);
            var i = data.Contents.length;
            while (i--) result.unshift('s3://' + bucket + '/' + data.Contents[i].Key);
            if (data.IsTruncated) {
                marker = data.Contents.pop().Key;
                list();
            } else {
                callback(null, result);
            }
        })
    }
    list();
}

