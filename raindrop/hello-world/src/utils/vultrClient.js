import AWS from "aws-sdk";
import dotenv from "dotenv";
dotenv.config();

export const s3 = new AWS.S3({
  endpoint: "https://blr1.vultrobjects.com",
  accessKeyId: process.env.VULTR_ACCESS_KEY,
  secretAccessKey: process.env.VULTR_SECRET_KEY,
  s3ForcePathStyle: true,
  signatureVersion: "v4",
});
