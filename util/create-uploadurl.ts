import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";
import { r2 } from "../connection/r2client";

export async function createUploadUrl(userId: string, mime: any) {
  const ext = mime.split("/")[1]; // jpeg, png, webp
  const key = `users/${userId}/${crypto.randomUUID()}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    ContentType: mime,
    CacheControl: "public, max-age=31536000",
  });

  const uploadUrl = await getSignedUrl(r2, command, {
    expiresIn: 60, // seconds
  });

  return {
    uploadUrl,
    key,
    publicUrl: `${process.env.R2_PUBLIC_URL}/${key}`,
  };
}
