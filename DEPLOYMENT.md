# 🚀 Deployment Guide: Render Production Setup

This guide will walk you through deploying your Intern Job Scraper Bot to Render for 24/7 operation.

## 📋 Prerequisites

- [x] GitHub account with your code repository
- [x] Render account (free tier available)
- [x] Telegram Bot Token (from @BotFather)
- [x] n8n instance (for workflow automation)

## 🎯 Step-by-Step Deployment

### 1. Prepare Your Repository

First, ensure your code is pushed to GitHub:

```bash
cd intern-bot
git init
git add .
git commit -m "Initial commit - Ready for Render deployment"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 2. Create Render Web Service

1. **Visit [Render Dashboard](https://dashboard.render.com)**
2. **Click "New +"** → **"Web Service"**
3. **Select "Build and deploy from a Git repository"**
4. **Connect your GitHub account** and select your repository

### 3. Configure Service Settings

**Basic Configuration:**
- **Name**: `intern-job-scraper-bot`
- **Region**: `Oregon (US West)` - recommended for best performance
- **Branch**: `main`
- **Root Directory**: `intern-bot`

**Build & Deploy:**
- **Environment**: `Node`
- **Build Command**: 
  ```bash
  npm install && npm run build
  ```
- **Start Command**: 
  ```bash
  npm start
  ```

### 4. Environment Variables Setup

Add these environment variables in Render's Environment tab:

```bash
# Required Variables
NODE_ENV=production
PLAYWRIGHT_BROWSERS_PATH=/opt/render/.cache/ms-playwright

# Your App URL (will be provided after deployment)
BASE_URL=https://your-app-name.onrender.com

# Optional Performance Tuning
NODE_OPTIONS=--max-old-space-size=2048
```

### 5. Advanced Configuration

**Auto-Deploy:**
- ✅ Enable "Auto-Deploy" for automatic updates when you push to GitHub

**Health Check:**
- **Health Check Path**: `/`
- **Health Check Timeout**: `30 seconds`

**Scaling:**
- **Plan**: `Starter` (sufficient for this use case)
- **Instances**: `1` (single instance)

### 6. Deploy and Verify

1. **Click "Create Web Service"**
2. **Wait for deployment** (usually 3-5 minutes)
3. **Check deployment logs** for any errors
4. **Test your endpoints** once deployed

### 7. Test Your Deployment

Once deployed, test these endpoints:

```bash
# Replace with your actual Render URL
BASE_URL="https://your-app-name.onrender.com"

# Health check
curl $BASE_URL/

# Browser test
curl $BASE_URL/test

# Job scraping test
curl "$BASE_URL/internshala?category=web-development"
```

Expected responses:
- Health check: `{"status": "OK", "message": "..."}`
- Browser test: `{"success": true, "message": "Browser test successful"}`
- Job scraping: `{"success": true, "count": X, "jobs": [...]}`

## 🔧 Configure n8n Workflow

After your Render service is deployed:

### 1. Update n8n Workflow URLs

In your `final_workflow.json`, update these nodes:

**Fetch Internshala Jobs Node:**
```json
{
  "parameters": {
    "url": "https://your-app-name.onrender.com/internshala"
  }
}
```

**Fetch LinkedIn Jobs Node:**
```json
{
  "parameters": {
    "url": "https://your-app-name.onrender.com/linkedin"
  }
}
```

### 2. Import and Activate

1. **Import the workflow** into your n8n instance
2. **Update the URLs** with your Render deployment URL
3. **Test the workflow** manually first
4. **Activate the workflow** for daily automation

## 📊 Monitoring & Maintenance

### Logs and Debugging

**View logs in Render:**
1. Go to your service dashboard
2. Click on "Logs" tab
3. Monitor for:
   - Daily automation triggers
   - Scraping success/failures
   - Browser errors
   - Memory usage

**Common log messages to look for:**
```
✅ Browser launched successfully
📊 Scraping Internshala...
⏰ Daily 9 AM IST trigger activated
🤖 Telegram channel: @RemoteInternIndia
```

### Performance Monitoring

**Key metrics to watch:**
- **Response times**: Should be < 30 seconds for scraping
- **Memory usage**: Should stay under 512MB
- **Error rates**: Should be < 5%
- **Uptime**: Should be 99%+

### Troubleshooting Common Issues

**1. Browser Launch Failures**
```bash
# Check if Playwright is properly installed
curl https://your-app.onrender.com/test
```

**2. Scraping Returns Empty Results**
```bash
# Test individual scrapers
curl "https://your-app.onrender.com/internshala?category=web-development"
```

**3. Memory Issues**
- Monitor memory usage in Render dashboard
- Consider upgrading to Standard plan if needed

**4. n8n Workflow Errors**
- Check if URLs are correctly updated
- Verify authentication credentials
- Test workflow manually

## 🔄 Updates and Maintenance

### Deploying Updates

1. **Push changes to GitHub**:
   ```bash
   git add .
   git commit -m "Update: description of changes"
   git push
   ```

2. **Auto-deployment** will trigger automatically (if enabled)

3. **Monitor deployment** in Render dashboard

### Regular Maintenance

**Weekly Tasks:**
- [ ] Check application logs for errors
- [ ] Verify scraping is working correctly
- [ ] Monitor Telegram channel for job posts

**Monthly Tasks:**
- [ ] Review and update scraping selectors if needed
- [ ] Check for new job sources to add
- [ ] Optimize performance based on metrics

## 🚨 Emergency Procedures

### Service Down

1. **Check Render status**: [status.render.com](https://status.render.com)
2. **Review recent deployments** for issues
3. **Check logs** for error messages
4. **Manual restart** if needed

### Scraping Failures

1. **Test individual endpoints** to isolate issues
2. **Check target websites** for structure changes
3. **Update selectors** if needed
4. **Redeploy** with fixes

## 💡 Optimization Tips

### Performance
- **Enable HTTP/2** (automatically enabled on Render)
- **Use persistent connections** for browser instances
- **Implement request caching** for frequently accessed data

### Cost Optimization
- **Starter plan** is sufficient for this use case
- **Monitor usage** to avoid unnecessary upgrades
- **Optimize scraping frequency** if needed

### Security
- **Keep dependencies updated** regularly
- **Use environment variables** for all configuration
- **Monitor logs** for security issues

## 📞 Support Resources

- **Render Documentation**: [render.com/docs](https://render.com/docs)
- **Playwright Issues**: [github.com/microsoft/playwright](https://github.com/microsoft/playwright)
- **n8n Community**: [community.n8n.io](https://community.n8n.io)

---

**🎉 Congratulations!** Your automation is now running 24/7 on Render, providing daily job updates to your Telegram channel.

## 📋 Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Render web service created
- [ ] Environment variables configured
- [ ] Service deployed successfully
- [ ] Health checks passing
- [ ] Endpoints tested
- [ ] n8n workflow updated with new URLs
- [ ] n8n workflow activated
- [ ] Monitoring set up
- [ ] First automated run verified

**Your bot is now live and ready to help job seekers! 🚀** 