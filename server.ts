import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { google } from 'googleapis';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());
  app.use(session({
    secret: process.env.SESSION_SECRET || 'doctor-scheduler-secret',
    resave: false,
    saveUninitialized: true,
    cookie: { 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 3600000 * 24 // 24 hours
    }
  }));

  // Helper to get OAuth client lazily
  const getOAuthClient = () => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const appUrl = process.env.APP_URL;

    if (!clientId || !clientSecret || !appUrl) {
      throw new Error('Missing Google OAuth credentials or APP_URL in environment');
    }

    return new google.auth.OAuth2(
      clientId,
      clientSecret,
      `${appUrl}/auth/callback`
    );
  };

  // API Routes
  app.get('/api/auth/url', (req, res) => {
    try {
      const oauth2Client = getOAuthClient();
      const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/spreadsheets'],
        prompt: 'consent'
      });
      res.json({ url });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get(['/auth/callback', '/auth/callback/'], async (req, res) => {
    const { code } = req.query;
    try {
      const oauth2Client = getOAuthClient();
      const { tokens } = await oauth2Client.getToken(code as string);
      (req.session as any).tokens = tokens;
      
      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
            <p>Authentication successful. You can close this window.</p>
          </body>
        </html>
      `);
    } catch (error) {
      console.error('Error exchanging code for tokens:', error);
      res.status(500).send('Authentication failed');
    }
  });

  app.get('/api/auth/status', (req, res) => {
    res.json({ isAuthenticated: !!(req.session as any).tokens });
  });

  app.post('/api/gsheets/save', async (req, res) => {
    const tokens = (req.session as any).tokens;
    if (!tokens) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { doctors, centers } = req.body;
    
    try {
      const oauth2Client = getOAuthClient();
      oauth2Client.setCredentials(tokens);
      const sheets = google.sheets({ version: 'v4', auth: oauth2Client });

      // 1. Create a new spreadsheet
      const spreadsheet = await sheets.spreadsheets.create({
        requestBody: {
          properties: {
            title: `Doctor Schedule - ${new Date().toLocaleDateString()}`
          },
          sheets: [
            { properties: { title: 'Doctors Directory' } },
            { properties: { title: 'Assignments Summary' } }
          ]
        }
      });

      const spreadsheetId = spreadsheet.data.spreadsheetId;

      // 2. Prepare Directory Data
      const directoryRows = [
        ['Doctor ID', 'Name', 'Specialty', 'Assigned Center', 'Shift Start', 'Shift End'],
        ...doctors.map((doc: any) => [
          doc.id,
          doc.name,
          doc.specialty,
          centers.find((c: any) => c.id === doc.currentCenterId)?.name || 'Unassigned',
          doc.currentShift?.startTime || '-',
          doc.currentShift?.endTime || '-'
        ])
      ];

      // 3. Prepare Summary Data
      const centerStats = centers.map((center: any) => {
        const docCount = doctors.filter((d: any) => d.currentCenterId === center.id).length;
        return [center.name, docCount];
      });

      const summaryRows = [
        ['Medical Center', 'Physician Count'],
        ...centerStats
      ];

      // 4. Update the sheets
      await sheets.spreadsheets.values.update({
        spreadsheetId: spreadsheetId!,
        range: "'Doctors Directory'!A1",
        valueInputOption: 'RAW',
        requestBody: { values: directoryRows }
      });

      await sheets.spreadsheets.values.update({
        spreadsheetId: spreadsheetId!,
        range: "'Assignments Summary'!A1",
        valueInputOption: 'RAW',
        requestBody: { values: summaryRows }
      });

      res.json({ 
        success: true, 
        spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit` 
      });
    } catch (error: any) {
      console.error('Error saving to Google Sheets:', error);
      res.status(500).json({ error: error.message || 'Failed to save to Google Sheets' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
