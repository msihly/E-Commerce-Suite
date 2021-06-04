const AWS = require("aws-sdk");
const db = require("../db");
const { hash } = require("../utils");
const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_BUCKET, S3_REGION } = process.env;

AWS.config.update({
    region: S3_REGION,
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY
});

const s3 = new AWS.S3({ apiVersion: "2006-03-01" });

const extensions = ["jpg", "jpeg", "png"];
const maxImageSize = 2097152;

exports.uploadPhoto = async (photo) => {
    if (photo === undefined) return { photoId: null, photoUrl: null, photoName: null, photoSize: 0 };

    const { buffer, mimetype, originalname: originalName, size: photoSize } = photo;
    const ext = originalName.split(".").pop();

    if (!extensions.includes(ext)) throw new Error(`Image extension not allowed: ${mimetype}`);
    if (photoSize > maxImageSize) throw new Error(`Image size [${formatBytes(photoSize)}] cannot exceed ${formatBytes(maxImageSize)}`);

    const photoHash = hash("md5", buffer);

    const existingEntries = await db.getPhotos({ photoHash });
    if (existingEntries.length > 0) {
        const { photoId, photoUrl, originalName } = existingEntries[0];
        return { photoId, photoUrl, originalName };
    }

    const path = `uploads/${photoHash.substr(0, 2)}/${photoHash.substr(2, 2)}/${photoHash}.${ext}`;
    const photoUrl = `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${path}`;

    await s3.putObject({ Bucket: S3_BUCKET, Key: path, Body: buffer, ACL: "public-read" }).promise();
    const photoId = await db.uploadPhoto({ originalName, photoUrl, photoHash });

    return { photoId, photoUrl, originalName, photoSize };
};