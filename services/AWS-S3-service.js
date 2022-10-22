/* helps to connect with Amazon S3 for donwloading the generated report */
const AWS = require('aws-sdk');

// uploading data to Amazon S3 using 'aws-sdk'
exports.uploadToS3 = (data, fileName) => {
    const BUCKET_NAME = process.env.BUCKET_NAME;
    const IAM_USER_KEY = process.env.IAM_USER_KEY;
    const IAM_USER_SECRET = process.env.IAM_USER_SECRET;

    let S3_Bucket = new AWS.S3({
        Bucket : BUCKET_NAME,
        accessKeyId : IAM_USER_KEY,
        secretAccessKey : IAM_USER_SECRET
    });

    let params = {
        Bucket : BUCKET_NAME,
        Key : fileName,
        Body : data,
        ACL : 'public-read'
    };

    return new Promise((resolve, reject) => {
        S3_Bucket.upload(params, (err, S3_Response) => {
            if(err) reject(err);
            else {
                console.log('Successfully uploaded!', S3_Response);
                resolve(S3_Response.Location);
            }
        });
    })
}