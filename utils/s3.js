const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');

const s3 = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });

exports.s3Available = () => !!(process.env.AWS_S3_BUCKET && process.env.AWS_REGION);

exports.uploadToS3 = (buffer, key, contentType = 'image/jpeg') =>
  s3.send(new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  }));

exports.streamFromS3 = async (key, res) => {
  const data = await s3.send(new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
  }));
  res.setHeader('Content-Type', data.ContentType || 'image/jpeg');
  res.setHeader('Cache-Control', 'public, max-age=31536000');
  data.Body.pipe(res);
};
