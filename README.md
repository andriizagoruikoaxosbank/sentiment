# Exit Interview Sentiment Analysis

A web application for analyzing sentiment in exit interview comments using OpenAI. This application allows you to upload Excel or CSV files with exit interview data, analyze the sentiment of comments, and identify negative comments or specific keywords that may require attention.

## Features

- Upload Excel (.xlsx, .xls) or CSV files with exit interview data
- Flexible column mapping for different data formats
- OpenAI sentiment analysis (0-10 scale)
- Highlighting for negative comments (scores < 3)
- Filter for specific keywords like "abuse" with priority highlighting
- Interactive data visualizations and charts
- Local storage for persistence
- Fallback sentiment analysis if OpenAI API fails

## Environment Setup

The application uses environment variables to store sensitive information like API keys. Before deploying or running the app:

1. Create a `.env.local` file in the root directory
2. Add your OpenAI API key:
```
OPENAI_API_KEY=your_api_key_here
```

**Note:** The `.env.local` file is excluded from Git in the `.gitignore` file to prevent accidentally committing your API key.

## Deployment Options

### 1. Deploy to Vercel (Recommended)

The fastest way to deploy this application is with Vercel:

#### Option A: Deploy from GitHub
1. Push this repository to your GitHub account
2. Go to [Vercel](https://vercel.com) and sign up or log in
3. Click "New Project" and import your GitHub repository
4. Add your environment variables (OPENAI_API_KEY) in the Vercel project settings
5. Keep all default settings and click "Deploy"
6. Your app will be live in minutes!

#### Option B: Deploy using Vercel CLI
If you prefer to deploy directly from your local machine:

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy the application:
```bash
vercel
```

4. For production deployment:
```bash
vercel --prod
```

### 2. Run Locally

To run the application on your local network:

```bash
# Install dependencies
npm install

# Create .env.local file with your OpenAI API key
echo "OPENAI_API_KEY=your_api_key_here" > .env.local

# Run on your local network
npm run dev:network
```

The application will be available at `http://your-local-ip:3000`

## Usage

1. Upload an Excel or CSV file containing exit interview data
2. Verify the extracted data in the preview screen
3. View the sentiment analysis results and charts
4. Use the word filter to highlight specific concerns

## Development

This project is built with:

- Next.js 15
- TypeScript
- Tailwind CSS
- OpenAI API
- Chart.js for visualizations

## License

MIT

## Version

Current version: 0.15
