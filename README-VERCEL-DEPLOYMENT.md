# Next.js + FastAPI Vercel Deployment

This project demonstrates how to deploy a full-stack application with Next.js frontend and FastAPI backend to Vercel.

## 🚀 Quick Start

### Local Development

1. **Install dependencies**:
   ```bash
   pnpm install
   pip install -r requirements.txt
   ```

2. **Run both frontend and backend**:
   ```bash
   pnpm dev:all
   ```

   Or run them separately:
   ```bash
   # Terminal 1 - Frontend
   pnpm dev

   # Terminal 2 - Backend
   pnpm dev:api
   ```

3. **Visit the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3000/api/v1/hello (or http://localhost:8000/api/hello directly)
   - API Documentation: http://localhost:8000/docs

## 📁 Project Structure

```
.
├── api/                    # FastAPI backend
│   └── index.py           # Main FastAPI application
├── src/app/               # Next.js frontend
│   ├── hello/            # Hello world demo page
│   │   └── page.tsx      # React component that calls API
│   └── page.tsx          # Home page
├── scripts/
│   └── dev.py            # Development server script
├── requirements.txt       # Python dependencies
├── vercel.json           # Vercel deployment configuration
├── next.config.ts        # Next.js configuration with API rewrites
└── package.json          # Node.js dependencies and scripts
```

## 🛠 Key Files Explained

### `api/index.py`
Simple FastAPI application with CORS middleware and hello world endpoints:
- `/api/hello` - Returns a hello world message
- `/api/` - Root endpoint for health checks

### `vercel.json`
Configures Vercel to handle both Next.js and Python functions:
```json
{
  "functions": {
    "api/**": {
      "excludeFiles": "{.next,.git,node_modules}/**"
    }
  }
}
```

### `next.config.ts`
Configures API routing to proxy requests to FastAPI during development:
- Development: Routes `/api/*` to `http://127.0.0.1:8000/api/*`
- Production: Routes `/api/*` to Vercel serverless functions

### `requirements.txt`
Minimal Python dependencies:
```
fastapi==0.111.1
uvicorn==0.30.3
```

## 🚀 Vercel Deployment

### 1. Prepare Your Repository

1. **Commit all changes**:
   ```bash
   git add .
   git commit -m "feat: add Next.js + FastAPI hello world setup"
   git push origin main
   ```

### 2. Deploy to Vercel

**Option A: Vercel CLI**
```bash
npm i -g vercel
vercel --prod
```

**Option B: Vercel Dashboard**
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will automatically detect Next.js and configure the build
5. Click "Deploy"

### 3. Verify Deployment

After deployment, your application will be available at:
- `https://your-project.vercel.app` - Frontend
- `https://your-project.vercel.app/api/hello` - Backend API

## 🔧 How It Works

### Development vs Production

**Development Mode:**
- Next.js runs on port 3000
- FastAPI runs on port 8000
- `next.config.ts` proxies API requests from Next.js to FastAPI

**Production Mode (Vercel):**
- Next.js is served as static/server-side rendered pages
- FastAPI code in `/api` becomes Vercel serverless functions
- All routing is handled automatically by Vercel

### API Request Flow

1. Frontend makes request to `/api/hello`
2. **Development**: Next.js proxies to `http://127.0.0.1:8000/api/hello`
3. **Production**: Vercel routes to serverless function at `/api/index.py`
4. FastAPI processes the request and returns JSON response
5. Frontend receives and displays the data

## 🧪 Testing the Setup

Visit `/hello` page to see:
- ✅ Next.js frontend loading
- ✅ Successful API call to FastAPI backend
- ✅ Real-time data flow between frontend and backend

## 📝 Development Scripts

- `pnpm dev` - Start Next.js frontend only
- `pnpm dev:api` - Start FastAPI backend only  
- `pnpm dev:all` - Start both frontend and backend concurrently
- `pnpm build` - Build Next.js for production
- `pnpm start` - Start Next.js in production mode

## 🔍 Troubleshooting

### Local Development Issues

**API not responding:**
- Check if Python 3 is installed: `python3 --version`
- Install dependencies: `pip install -r requirements.txt`
- Check if port 8000 is available

**CORS errors:**
- FastAPI includes CORS middleware with `allow_origins=["*"]`
- In production, update this to your specific domain

### Vercel Deployment Issues

**Build failures:**
- Ensure `requirements.txt` is in the root directory
- Check Vercel logs in the dashboard
- Verify all files are committed to git

**API routes not working:**
- Check `vercel.json` configuration
- Ensure API files are in `/api` directory
- Verify Python runtime compatibility

## 🎯 Next Steps

This setup provides a foundation for:
- Adding database connections (PostgreSQL, MongoDB, etc.)
- Implementing authentication
- Adding more complex API endpoints
- Integrating with external services
- Adding environment variables for configuration

## 🤝 Contributing

Feel free to submit issues and enhancement requests! 