# Deploying to Vercel

This guide will help you deploy your Next.js portfolio to Vercel for free.

## Prerequisites

1. A GitHub account
2. Your code pushed to a GitHub repository
3. A GitHub Personal Access Token (for GitHub stats features)

## Step-by-Step Deployment

### 1. Prepare Your GitHub Repository

If you haven't already, push your code to GitHub:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit changes
git commit -m "Prepare for Vercel deployment"

# Add remote repository (replace with your GitHub repo URL)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to GitHub
git push -u origin main
```

### 2. Create a GitHub Personal Access Token

Your portfolio uses GitHub API for displaying statistics and repositories.

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
   - URL: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Give it a name: "Portfolio GitHub Stats"
4. Select scopes:
   - ✅ `public_repo` (for public repository access)
   - ✅ `read:user` (for user profile information)
5. Click "Generate token"
6. **IMPORTANT**: Copy the token immediately (you won't see it again!)

### 3. Sign Up / Login to Vercel

1. Go to https://vercel.com
2. Click "Sign Up" or "Login"
3. Choose "Continue with GitHub" (recommended for easier integration)
4. Authorize Vercel to access your GitHub repositories

### 4. Import Your Project

1. From your Vercel dashboard, click "Add New..." → "Project"
2. Find your portfolio repository in the list
3. Click "Import"

### 5. Configure Environment Variables

Before deploying, add these environment variables:

**Required:**
- `NEXT_PUBLIC_GITHUB_TOKEN`: Your GitHub Personal Access Token (from Step 2)
- `GITHUB_USERNAME`: Your GitHub username (e.g., `medevs`)

**How to add them:**
1. In the "Configure Project" screen, expand "Environment Variables"
2. Add each variable:
   - Key: `NEXT_PUBLIC_GITHUB_TOKEN`
   - Value: `ghp_your_token_here`
   - Click "Add"
3. Add the second variable:
   - Key: `GITHUB_USERNAME`
   - Value: `your_github_username`
   - Click "Add"

### 6. Deploy

1. Leave other settings as default (Vercel auto-detects Next.js)
2. Click "Deploy"
3. Wait 2-3 minutes for the build to complete
4. 🎉 Your site is live!

## Post-Deployment

### Your Live URL

Vercel will provide you with a URL like:
- `https://your-project-name.vercel.app`

### Custom Domain (Optional)

To use your own domain:

1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your custom domain
4. Follow the DNS configuration instructions

### Automatic Deployments

Every time you push to your GitHub repository:
- Main branch → Automatic production deployment
- Other branches → Preview deployments

### Update Environment Variables

If you need to update environment variables:

1. Go to your project in Vercel dashboard
2. Settings → Environment Variables
3. Edit or add new variables
4. Redeploy to apply changes

## Monitoring

Vercel provides:
- **Analytics**: Free basic analytics
- **Logs**: View deployment and runtime logs
- **Performance**: Speed insights

Access these from your project dashboard.

## Troubleshooting

### Build Fails

1. Check the build logs in Vercel
2. Ensure all dependencies are in `package.json`
3. Test locally: `npm run build`

### GitHub Stats Not Loading

1. Verify `NEXT_PUBLIC_GITHUB_TOKEN` is set correctly
2. Ensure token has correct permissions
3. Check Vercel logs for API errors

### Environment Variables Not Working

- `NEXT_PUBLIC_*` variables are exposed to the browser
- Other variables are server-side only
- Remember to redeploy after changing variables

## Cost

Your portfolio should stay within Vercel's free tier limits:
- ✅ 100GB bandwidth per month
- ✅ Unlimited projects
- ✅ Automatic HTTPS
- ✅ Serverless Functions (API routes)

For a personal portfolio, you'll likely use < 1GB/month.

## Support

- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- Vercel Community: https://github.com/vercel/vercel/discussions
