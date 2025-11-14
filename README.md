# Web Accessibility Checker

A comprehensive web accessibility scanner that analyzes websites for WCAG compliance issues. Built with React, Express, and Puppeteer, featuring real-time progress tracking and Kontent.ai integration.

## Quick Deploy

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/github/butcher-07/accessibility-checker)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/butcher-07/accessibility-checker)

Click a button above to deploy with one click! Both platforms auto-detect the configuration and deploy automatically.

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## Features

- 🔍 **Automated Accessibility Scanning** - Crawls websites and analyzes pages using Axe-core
- 📊 **WCAG Compliance Reporting** - Identifies violations categorized by severity (critical, serious, moderate, minor)
- 🌐 **Multi-page Analysis** - Automatically discovers and analyzes internal links
- 📈 **Real-time Progress Tracking** - WebSocket-based live updates during analysis
- 🎯 **Kontent.ai Integration** - Select and analyze spaces directly from your Kontent.ai environment
- 💾 **Export Results** - Download reports as CSV or JSON
- 🎨 **Modern UI** - Clean, responsive interface built with Tailwind CSS and shadcn/ui
- ⚡ **Batch Processing** - Efficiently processes URLs in parallel batches

## How It Works

### Architecture

The application consists of three main components:

1. **Client (React)** - Single-page application with:
   - URL input or Kontent.ai space selector
   - Real-time progress display
   - Results visualization with filtering by severity
   - Export functionality

2. **Server (Express)** - Backend API with:
   - WebSocket server for real-time updates
   - Puppeteer-based web crawler
   - Axe-core accessibility analysis
   - SQLite database for URL tracking

3. **Database (SQLite)** - Local database storing:
   - Discovered URLs and their processing status
   - Domain tracking for crawl management

### Analysis Flow

1. **URL Submission** - User enters a URL or selects a Kontent.ai space
2. **Initial Crawl** - The server launches a Puppeteer browser and navigates to the URL
3. **Link Discovery** - Extracts all internal links from the page
4. **Batch Processing** - Processes URLs in batches of 5 simultaneously
5. **Accessibility Analysis** - Runs Axe-core on each page to detect WCAG violations
6. **Real-time Updates** - Sends progress updates via WebSocket
7. **Results Aggregation** - Combines all issues and displays them categorized by severity

## Prerequisites

- Node.js 20.x or higher
- npm 10.x or higher
- Git

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/butcher-07/accessibility-checker.git
   cd accessibility-checker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables** (Optional)

   Create a `.env` file in the root directory (see `.env.example`):
   ```env
   # Optional: Enable verbose logging for debugging
   VITE_VERBOSE_LOGGING=false
   ```

   **Note:** When using as a Kontent.ai custom app, the Management API key must be configured in the app settings with the key `KONTENT_AI_MANAGEMENT_API_KEY` (see Kontent.ai Custom App section below).

## Running the Application

### Development Mode

Start the development server with hot reload:

```bash
npm run dev
```

The application will be available at `http://localhost:5000`

### Production Build

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm start
   ```

### Development with Tunnel (for Kontent.ai testing)

To test the Kontent.ai integration, you'll need to expose your local server:

```bash
npm run dev:tunnel
```

This will start the dev server and create an ngrok tunnel.

## Usage

### Standalone Mode

1. Open the application in your browser
2. Enter a URL in the input field
3. Click "Analyze" to start the scan
4. View real-time progress as pages are processed
5. Review results categorized by severity
6. Export results as CSV or JSON if needed

### Kontent.ai Custom App Mode

1. Configure the custom app in Kontent.ai:
   - Add the Management API key to the app configuration
   - Set the app URL to your deployment URL

2. Open the app within Kontent.ai
3. Select a space from the dropdown
4. Click "Analyze" to scan the space's preview domain
5. View and export results

## Key Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run check` - Run TypeScript type checking
- `npm run db:push` - Push database schema changes
- `npm run dev:tunnel` - Start dev server with ngrok tunnel

## Project Structure

```
accessibility-checker/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── lib/         # Utilities and helpers
│   │   └── pages/       # Page components
├── server/              # Express backend
│   ├── index.ts         # Server entry point
│   ├── routes.ts        # API routes and WebSocket
│   └── utils.ts         # Server utilities
├── db/                  # Database schema and connection
│   ├── schema.ts        # Drizzle ORM schema
│   └── index.ts         # Database instance
└── package.json         # Dependencies and scripts
```

## Technology Stack

### Frontend
- React 18
- TypeScript
- TanStack Query (React Query)
- Wouter (routing)
- Tailwind CSS + shadcn/ui
- Vite

### Backend
- Express.js
- TypeScript
- Puppeteer (browser automation)
- Axe-core (accessibility testing)
- WebSocket (real-time updates)
- Drizzle ORM + SQLite

## Features in Detail

### Accessibility Analysis

The scanner uses Axe-core to detect WCAG violations including:
- Color contrast issues
- Missing alt text
- Form label problems
- ARIA attribute errors
- Keyboard navigation issues
- And many more...

### Real-time Progress

During analysis, you'll see:
- Currently processing URL
- Number of URLs completed
- Number of URLs remaining
- Total issues found so far

### Results Display

Results are organized by severity:
- **Critical** - Must fix immediately
- **Serious** - Important to fix
- **Moderate** - Should fix
- **Minor** - Nice to fix

Each issue includes:
- WCAG criteria violated
- Affected element (selector and HTML)
- Description and remediation suggestion
- Link to detailed documentation

### Element Highlighting

Use the bookmarklet feature to:
1. Copy the highlight tool bookmarklet
2. Create a browser bookmark with the code
3. Click the location icon on any issue
4. Use the bookmark to highlight the element on the page

## Configuration

### Environment Variables

#### Verbose Logging

To enable detailed debug logs for Kontent.ai integration and spaces loading:

```env
VITE_VERBOSE_LOGGING=true
```

When enabled, you'll see detailed logs in the browser console about:
- Kontent.ai context initialization
- Configuration parsing
- Spaces API requests and responses

**Default:** `false` (only shows warnings and errors)

### Kontent.ai Custom App

To use as a Kontent.ai custom app:

1. Create a custom app in Kontent.ai
2. Add a configuration parameter:
   - Name: `KONTENT_AI_MANAGEMENT_API_KEY`
   - Type: Text
   - Description: Management API key for fetching spaces

3. Set the app URL to your deployment

For detailed setup instructions, see [KONTENT_AI_SETUP.md](./KONTENT_AI_SETUP.md)

### Database

The application uses SQLite for local development. The database file (`accessibility.db`) is created automatically on first run and stores:
- URLs discovered during crawling
- Processing status for each URL
- Domain information for organizing scans

## Troubleshooting

### Port Already in Use

If port 5000 is already in use:
```bash
# On Windows
netstat -ano | findstr :5000
wmic process where processid=<PID> delete

# On Mac/Linux
lsof -ti:5000 | xargs kill -9
```

### Puppeteer Issues

If Puppeteer fails to launch:
- Ensure you have the required system dependencies
- On Linux, you may need to install additional packages
- Check that you have sufficient permissions

### WebSocket Connection Failed

If WebSocket connection fails:
- Check that the server is running
- Verify firewall settings
- Ensure the WebSocket endpoint is accessible

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Acknowledgments

- Built with [Axe-core](https://github.com/dequelabs/axe-core) by Deque Systems
- Uses [Puppeteer](https://pptr.dev/) for browser automation
- UI components from [shadcn/ui](https://ui.shadcn.com/)
