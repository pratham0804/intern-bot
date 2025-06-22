# Intern Job Scraper Bot 🤖

An automated job scraping system that collects internship opportunities from multiple platforms and posts them to a Telegram channel. The system runs daily at 9:00 AM IST and integrates with n8n for workflow automation.

## 🌟 Features

- **Multi-platform scraping**: Internshala, LetsIntern, and LinkedIn
- **Telegram integration**: Automated posting to @RemoteInternIndia channel
- **Daily automation**: Scheduled runs at 9:00 AM IST
- **n8n workflow**: Complete automation pipeline
- **Production ready**: Optimized for Render deployment

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Job Sources   │    │  Scraper API    │    │   n8n Workflow  │
│                 │    │                 │    │                 │
│ • Internshala   │───▶│ • Express.js    │───▶│ • Data Processing│
│ • LetsIntern    │    │ • Playwright    │    │ • Message Format │
│ • LinkedIn      │    │ • Node.js       │    │ • Telegram Send  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Local Development

1. **Clone and install dependencies**
   ```bash
   cd intern-bot
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Install Playwright browsers**
   ```bash
   npx playwright install chromium --with-deps
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

### Testing Endpoints

```bash
# Health check
curl http://localhost:3000/

# Test browser functionality
curl http://localhost:3000/test

# Scrape Internshala jobs
curl "http://localhost:3000/internshala?category=web-development"

# Scrape LinkedIn jobs
curl "http://localhost:3000/linkedin?keywords=internship&location=India"
```

## 📦 Deployment on Render

### Step 1: Prepare Your Repository

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Ready for Render deployment"
   git push origin main
   ```

### Step 2: Create Render Web Service

1. **Go to [Render Dashboard](https://dashboard.render.com)**
2. **Click "New +"** → **"Web Service"**
3. **Connect your GitHub repository**
4. **Configure the service:**
   - **Name**: `intern-job-scraper-bot`
   - **Region**: `Oregon (US West)` (recommended)
   - **Branch**: `main`
   - **Root Directory**: `intern-bot`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

### Step 3: Configure Environment Variables

Add these environment variables in Render:

```
NODE_ENV=production
PLAYWRIGHT_BROWSERS_PATH=/opt/render/project/.playwright
PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=false
BASE_URL=https://your-app-name.onrender.com
```

### Step 4: Deploy

Click **"Create Web Service"** and wait for deployment to complete.

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port (auto-set by Render) | No |
| `NODE_ENV` | Environment mode | Yes |
| `BASE_URL` | Your deployed URL | Yes |
| `PLAYWRIGHT_BROWSERS_PATH` | Browser cache path | Yes |

### Scraping Configuration

The scraper supports these endpoints:

- **`/internshala`**: Scrapes Internshala internships
  - Query params: `category`, `location`
- **`/linkedin`**: Scrapes LinkedIn jobs
  - Query params: `keywords`, `location`
- **`/letsintern`**: Scrapes LetsIntern opportunities
  - Query params: `category`

## 🤖 n8n Integration

### Workflow Features

- **Daily trigger**: Runs at 9:00 AM IST
- **Multi-source scraping**: Parallel data collection
- **Data processing**: Deduplication and formatting
- **Telegram posting**: Automated channel updates
- **Error handling**: Graceful failure management

### Using the n8n Workflow

1. **Import the workflow**: Use `final_workflow.json`
2. **Update URLs**: Change the API endpoints to your Render URL
3. **Configure Telegram**: Set up your bot credentials
4. **Activate**: Enable the workflow in n8n

## 📊 Monitoring

### Health Checks

- **`GET /`**: Basic health check
- **`GET /test`**: Browser functionality test

### Logs

Monitor your application logs in Render dashboard for:
- Scraping results
- Browser status
- Error reports
- Daily automation triggers

## 🛠️ Troubleshooting

### Common Issues

1. **Browser launch fails**
   - Check Playwright installation
   - Verify environment variables
   - Review memory limits

2. **Scraping returns no results**
   - Test individual endpoints
   - Check target website changes
   - Verify selectors

3. **n8n workflow errors**
   - Update API URLs
   - Check authentication
   - Verify data format

### Debug Commands

```bash
# Test browser functionality
curl https://your-app.onrender.com/test

# Check specific scraper
curl "https://your-app.onrender.com/internshala?category=web-development"
```

## 🔒 Security

- **No sensitive data logging**: Credentials are not logged
- **Rate limiting**: Built-in delays between requests
- **Error handling**: Graceful failure without exposure
- **Environment variables**: Secure configuration management

## 📈 Performance

- **Optimized for Render**: Configured for cloud deployment
- **Memory efficient**: Browser optimization for containers
- **Caching**: Persistent browser data storage
- **Concurrent scraping**: Parallel processing support

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section
2. Review Render logs
3. Test individual components
4. Create an issue with detailed logs

---

**Made with ❤️ for the internship community** 