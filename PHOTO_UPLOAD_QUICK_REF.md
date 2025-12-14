# Photo Upload System - Quick Reference

## What Works Now ✅

### Upload Photo

1. Click "Create Post" button
2. Click "Upload a photo"
3. Select JPG, PNG, GIF, or WebP image (max 10MB)
4. See preview in dialog
5. Write post content (optional with image)
6. Click "Post now"

### Photo in Feed

1. Post appears with text + image
2. Image displays below content
3. Responsive on mobile
4. Cached by browser

## How It Works

```
User Upload → Frontend Validation → Server Upload → Save File
                  ↓
              Image Preview ← Return URL → Store in Database
                  ↓
          Create Post with URL → Display in Feed
```

## Backend Endpoints

| Method | Endpoint               | Purpose                |
| ------ | ---------------------- | ---------------------- |
| POST   | `/api/upload/image`    | Upload image, get URL  |
| POST   | `/api/post`            | Create post with image |
| GET    | `/api/posts/feed`      | Get feed with images   |
| GET    | `/api/uploads/posts/*` | Serve image file       |

## Frontend Flow

### CreatePost.tsx

- `handleImageUpload()` - Validate & preview
- Upload to `/api/upload/image` - Get URL
- `handlePost()` - Send with URL
- `setUploadedImageUrl()` - Store URL for post

### Home.tsx / PostCard.tsx

- Fetch from `/api/posts/feed`
- PostCard displays `image` field
- Images render as `<img>` tags

## File Locations

| File                                  | Purpose         |
| ------------------------------------- | --------------- |
| `backend/src/Routes/UploadRoutes.php` | Upload handler  |
| `backend/uploads/posts/`              | Image storage   |
| `src/pages/CreatePost.tsx`            | Upload UI       |
| `src/pages/Home.tsx`                  | Feed display    |
| `src/components/post/PostCard.tsx`    | Image rendering |

## Database

**Posts Table Fields:**

- `content` - Post text
- `image_url` - Path like `/uploads/posts/post_1702476543_a1b2c3d4.jpg`
- `user_id` - Author
- `created_at` - Timestamp

## Image Limits

- **Size:** Maximum 10MB per image
- **Types:** JPEG, PNG, GIF, WebP
- **Per Post:** 1 image (can be enhanced to multiple)
- **Storage:** `/backend/uploads/posts/`

## Security

✓ File type validation (images only)
✓ File size limits (10MB)
✓ Authentication required
✓ Directory traversal prevention
✓ Random filenames with timestamps
✓ Proper cache headers

## Testing

### Quick Test

1. Open create post
2. Upload a photo
3. Write "Test post"
4. Post
5. See image in feed

### Check Database

```sql
SELECT id, content, image_url, user_id, created_at FROM posts
WHERE image_url IS NOT NULL
ORDER BY created_at DESC;
```

### Check Files

```bash
ls -la backend/uploads/posts/
# Should see: post_TIMESTAMP_RANDOM.jpg files
```

## Troubleshooting

| Issue              | Solution                                   |
| ------------------ | ------------------------------------------ |
| Upload fails       | Check file size < 10MB, type is image      |
| Image doesn't show | Verify path in DB, check upload dir exists |
| 404 on image       | Check `/api/uploads/posts/` endpoint       |
| Upload slow        | Normal for large files, max is 10MB        |

## What's Next

Optional future features:

- Multiple images per post (gallery grid)
- Image compression
- Video uploads
- Thumbnail generation
- CDN integration

## Notes

- Images upload before post creation
- Image URL returned and stored
- Images served with long-lived cache headers
- Can view all images in `/backend/uploads/posts/`
- System is production-ready
