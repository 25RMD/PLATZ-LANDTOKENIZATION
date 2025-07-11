# Cloudinary Setup for Vercel Deployment

## Problem
The application was trying to save uploaded files to the local filesystem using `fs.writeFileSync()` to `/public/uploads/`, which works in local development but fails on Vercel's serverless environment with the error:

```
EROFS: read-only file system, open '/var/task/public/uploads/...'
```

## Solution
Cloudinary has been integrated to handle file uploads in the cloud.

## Setup Instructions

### 1. Create a Cloudinary Account
1. Go to https://cloudinary.com
2. Sign up for a free account (generous free tier)
3. Note your credentials from the dashboard

### 2. Add Environment Variables
Add these to your Vercel environment variables:

```
CLOUDINARY_CLOUD_NAME=dcjic49j5
CLOUDINARY_API_KEY=328682575328568
CLOUDINARY_API_SECRET=SWcXTAHhf5v2lmkE1SK6aAfp0pg
CLOUDINARY_URL=cloudinary://328682575328568:SWcXTAHhf5v2lmkE1SK6aAfp0pg@dcjic49j5
```

### 3. Deploy
After adding the environment variables, redeploy your Vercel application.

## Files Modified
- `lib/cloudinary.ts` - New Cloudinary configuration
- `app/api/land-listings/route.ts` - Updated to use Cloudinary
- `app/api/collections/route.ts` - Updated to use Cloudinary  
- `app/api/nft/mint/route.ts` - Updated to use Cloudinary
- `app/api/nft/mint-json/route.ts` - Updated to use Cloudinary
- `app/api/nft/mint-collection/route.ts` - Updated to use Cloudinary

## Benefits
- ✅ Works on Vercel serverless environment
- ✅ Automatic image optimization
- ✅ CDN delivery
- ✅ Free tier supports up to 25 credits (very generous)
- ✅ No file size limits on Vercel functions