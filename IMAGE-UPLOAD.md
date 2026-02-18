# Image (Avatar) Upload

This guide covers how the avatar upload flow works and how to test it locally or from GitHub (e.g., after cloning the repo).

## Flow

1. **Presign** – Client requests a presigned URL (valid for 60 seconds).
2. **Upload** – Client uploads the file directly to R2 using the presigned URL.
3. **Confirm** – Client confirms the upload and the avatar URL is saved to the user's profile.

## Required Environment Variables

Add these to `.env`:

```env
R2_ACCOUNT_ID=your-cloudflare-account-id
R2_ACCESS_KEY_ID=your-r2-access-key
R2_SECRET_ACCESS_KEY=your-r2-secret-key
R2_PUBLIC_URL=https://your-bucket.r2.dev
# Optional: use if avatar bucket differs from default
# R2_AVATAR_BUCKET=avatar
# R2_AVATAR_PUBLIC_URL=https://your-avatar-bucket.r2.dev
```

`R2_PUBLIC_URL` must be the **public URL** of your R2 bucket (e.g. `https://pub-xxx.r2.dev` or a custom domain). It is **not** the S3 API endpoint (`r2.cloudflarestorage.com`).

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST   | `/avatar/me/avatar/presign` | Get presigned upload URL (JWT required) |
| POST   | `/avatar/me/avatar/confirm` | Save avatar URL to profile (JWT required) |

---

## How to Check It (Local or After Cloning from GitHub)

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/Dating-App-Api.git
cd Dating-App-Api
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your R2 credentials and R2_PUBLIC_URL
```

Ensure `.env` includes:

- `JWT_SECRET` (for login)
- `MONGODB_URI` (for database)
- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`
- `R2_PUBLIC_URL` (public URL of your R2 bucket)

### 3. Start the server

```bash
npm run dev
# or
npx tsx index.ts
```

### 4. Get a JWT token

```bash
# Login (or register first)
TOKEN=$(curl -s -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","password":"yourpassword"}' \
  | jq -r '.token')
```

### 5. Step 1: Get presigned URL

```bash
curl -X POST http://localhost:3000/avatar/me/avatar/presign \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"mime":"image/jpeg"}'
```

Example response:

```json
{
  "uploadUrl": "https://xxx.r2.cloudflarestorage.com/avatar/users/.../avatar/xxx.jpeg?X-Amz-...",
  "key": "users/xxx/avatar/xxx.jpeg",
  "url": "https://your-bucket.r2.dev/users/xxx/avatar/xxx.jpeg"
}
```

### 6. Step 2: Upload file to presigned URL

```bash
UPLOAD_URL="<paste uploadUrl from previous response>"

curl -X PUT "$UPLOAD_URL" \
  -H "Content-Type: image/jpeg" \
  --data-binary @path/to/your/image.jpg
```

Use the exact `uploadUrl` returned in step 5. If using a file:

```bash
curl -X PUT "$UPLOAD_URL" \
  -H "Content-Type: image/jpeg" \
  -T ./avatar.jpg
```

### 7. Step 3: Confirm avatar

```bash
KEY="<paste key from step 5>"
PUBLIC_URL="<paste url from step 5>"

curl -X POST http://localhost:3000/avatar/me/avatar/confirm \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"key\":\"$KEY\",\"url\":\"$PUBLIC_URL\"}"
```

Response should include `{ "message": "Avatar saved", "profile": { ... } }`.

---

## Allowed MIME Types

- `image/jpeg`
- `image/jpg`
- `image/png`
- `image/webp`

---

## Quick Test Script (bash)

Save as `test-avatar-upload.sh` and run:

```bash
#!/bin/bash
BASE_URL="${BASE_URL:-http://localhost:3000}"
EMAIL="${1:-test@example.com}"
PASSWORD="${2:-password123}"
IMAGE_FILE="${3:-./test-avatar.jpg}"

# Login
RESP=$(curl -s -X POST "$BASE_URL/users/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")
TOKEN=$(echo "$RESP" | jq -r '.token')
[[ "$TOKEN" == "null" || -z "$TOKEN" ]] && { echo "Login failed"; exit 1; }

# Presign
PRESIGN=$(curl -s -X POST "$BASE_URL/avatar/me/avatar/presign" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"mime":"image/jpeg"}')
UPLOAD_URL=$(echo "$PRESIGN" | jq -r '.uploadUrl')
KEY=$(echo "$PRESIGN" | jq -r '.key')
URL=$(echo "$PRESIGN" | jq -r '.url')
[[ "$UPLOAD_URL" == "null" ]] && { echo "Presign failed"; exit 1; }

# Upload
curl -s -X PUT "$UPLOAD_URL" -H "Content-Type: image/jpeg" -T "$IMAGE_FILE"

# Confirm
curl -s -X POST "$BASE_URL/avatar/me/avatar/confirm" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"key\":\"$KEY\",\"url\":\"$URL\"}" | jq .
```

Usage:

```bash
chmod +x test-avatar-upload.sh
./test-avatar-upload.sh your@email.com yourpassword ./avatar.jpg
```

---

## Troubleshooting

| Issue | Check |
|-------|-------|
| `R2_PUBLIC_URL must be set` | Add `R2_PUBLIC_URL` or `R2_AVATAR_PUBLIC_URL` to `.env` |
| Presign returns 500 | Verify R2 credentials and bucket name |
| Upload returns 403 | Presigned URL expires in 60s – presign again and retry |
| Confirm returns 403 | Ensure `key` starts with `users/{yourUserId}/avatar/` |
| Confirm returns 404 | Create a profile first via `POST /profile` |
| Avatar not visible | Ensure `R2_PUBLIC_URL` points to your bucket's public URL and the bucket allows public access |
