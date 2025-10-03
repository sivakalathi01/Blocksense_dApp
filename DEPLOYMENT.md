# Deploying Blocksense DApp to Vercel

This guide will help you deploy your Blocksense DApp frontend to Vercel.

## Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. Your project pushed to a Git repository (GitHub, GitLab, or Bitbucket)

## Deployment Steps

### Method 1: Vercel CLI (Recommended)

1. **Install Vercel CLI globally:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy from your project root:**
   ```bash
   cd c:\Work\Aurora\BlocksenseDapp
   vercel
   ```

4. **Follow the prompts:**
   - Set up and deploy? → Yes
   - Which scope? → Select your account
   - Link to existing project? → No (first time)
   - What's your project's name? → blocksense-dapp
   - In which directory is your code located? → `./` (current directory)

### Method 2: Vercel Dashboard

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Import project on Vercel:**
   - Go to https://vercel.com/dashboard
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect the configuration from `vercel.json`

## Environment Variables (Optional)

If your frontend needs environment variables:

1. **Create `.env.example` in frontend folder:**
   ```
   VITE_AURORA_TESTNET_RPC=https://testnet.aurora.dev
   VITE_AURORA_MAINNET_RPC=https://mainnet.aurora.dev
   VITE_CONTRACT_ADDRESS=your_deployed_contract_address
   ```

2. **Add environment variables in Vercel:**
   - Go to your project settings in Vercel
   - Navigate to "Environment Variables"
   - Add your variables with `VITE_` prefix

## Project Structure

The deployment is configured to:
- Build command: `cd frontend && npm run build`
- Output directory: `frontend/dist`
- Install command: `cd frontend && npm install`
- Framework: Vite (auto-detected)

## Files Created/Modified

- `frontend/package.json` - Frontend dependencies
- `vercel.json` - Vercel deployment configuration
- `frontend/vite.config.ts` - Updated for production optimization

## Post-Deployment

1. Your app will be available at `https://your-project-name.vercel.app`
2. Vercel provides automatic deployments on every push to your main branch
3. You can configure custom domains in Vercel dashboard

## Troubleshooting

- **Build fails**: Check that all dependencies are listed in `frontend/package.json`
- **404 on refresh**: The SPA routing is handled by the route configuration in `vercel.json`
- **Environment variables not working**: Ensure they have `VITE_` prefix for Vite apps

## Custom Domain (Optional)

1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your custom domain and follow the DNS setup instructions