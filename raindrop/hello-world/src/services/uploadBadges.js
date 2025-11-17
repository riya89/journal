import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { s3 } from "../utils/vultrClient.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function uploadBadge(localFile, remoteKey) {
  const filePath = path.join(__dirname, "../../assets/badges", localFile);
  const fileContent = fs.readFileSync(filePath);

  return s3
    .upload({
      Bucket: "badges",
      Key: remoteKey,
      Body: fileContent,
      ContentType: "image/png",
      ACL: "public-read",
    })
    .promise();
}
