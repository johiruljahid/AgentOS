/**
 * Google Workspace client services utilizing the user's OAuth Bearer Token.
 * Strict client-side / token-based security adhering to Workspace skill directives.
 */

export interface GoogleFileItem {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  modifiedTime?: string;
  size?: string;
}

export const googleWorkspace = {
  // 1. Google Drive
  async listFiles(token: string, searchQuery?: string): Promise<GoogleFileItem[]> {
    if (!token) return [];
    try {
      const q = searchQuery
        ? `name contains '${searchQuery.replace(/'/g, "\\'")}' and trashed = false`
        : 'trashed = false';
      const url = `https://www.googleapis.com/drive/v3/files?pageSize=25&fields=files(id,name,mimeType,webViewLink,modifiedTime,size)&q=${encodeURIComponent(
        q
      )}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error(`Drive API error: ${res.statusText}`);
      }
      const data = await res.json();
      return data.files || [];
    } catch (err) {
      console.warn('Google Drive list error:', err);
      return [];
    }
  },

  async readFileContent(token: string, fileId: string): Promise<string> {
    if (!token) return '';
    try {
      const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        // If it's a Google Doc, export it as plain text
        const exportRes = await fetch(
          `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/plain`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (exportRes.ok) return await exportRes.text();
        return `[File content could not be converted to text: ${res.statusText}]`;
      }
      return await res.text();
    } catch (err) {
      console.warn('Google Drive read error:', err);
      return '';
    }
  },

  async createAgentOSFolder(token: string): Promise<string | null> {
    if (!token) return null;
    try {
      // Check if AgentOS folder already exists
      const existing = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=name='AgentOS' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await existing.json();
      if (data.files && data.files.length > 0) {
        return data.files[0].id;
      }
      // Create folder
      const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'AgentOS',
          mimeType: 'application/vnd.google-apps.folder',
        }),
      });
      const created = await createRes.json();
      return created.id || null;
    } catch (err) {
      console.warn('Failed to ensure AgentOS folder:', err);
      return null;
    }
  },

  // 2. Gmail
  async sendEmail(
    token: string,
    params: { to: string; subject: string; body: string; attachments?: string[] }
  ): Promise<boolean> {
    if (!token) return false;
    try {
      const message = [
        `To: ${params.to}`,
        'Content-Type: text/plain; charset=utf-8',
        'MIME-Version: 1.0',
        `Subject: =?utf-8?B?${btoa(unescape(encodeURIComponent(params.subject)))}?=`,
        '',
        params.body,
      ].join('\r\n');

      const raw = btoa(unescape(encodeURIComponent(message)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ raw }),
      });
      return res.ok;
    } catch (err) {
      console.warn('Gmail send error:', err);
      return false;
    }
  },

  async searchEmails(token: string, query: string): Promise<any[]> {
    if (!token) return [];
    try {
      const res = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=5`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) return [];
      const data = await res.json();
      return data.messages || [];
    } catch (err) {
      console.warn('Gmail search error:', err);
      return [];
    }
  },

  // 3. Google Calendar
  async createCalendarEvent(
    token: string,
    params: {
      summary: string;
      description?: string;
      startIso: string;
      endIso: string;
      attendees?: string[];
    }
  ): Promise<any> {
    if (!token) return null;
    try {
      const body = {
        summary: params.summary,
        description: params.description || 'Created autonomously by AgentOS',
        start: { dateTime: params.startIso },
        end: { dateTime: params.endIso },
        attendees: params.attendees?.map((email) => ({ email })),
      };
      const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      return res.ok ? await res.json() : null;
    } catch (err) {
      console.warn('Calendar create error:', err);
      return null;
    }
  },

  async listCalendarEvents(token: string, daysAhead = 7): Promise<any[]> {
    if (!token) return [];
    try {
      const now = new Date();
      const future = new Date();
      future.setDate(now.getDate() + daysAhead);

      const res = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(
          now.toISOString()
        )}&timeMax=${encodeURIComponent(future.toISOString())}&singleEvents=true&orderBy=startTime`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) return [];
      const data = await res.json();
      return data.items || [];
    } catch (err) {
      console.warn('Calendar list error:', err);
      return [];
    }
  },

  // 4. Google Sheets
  async createSpreadsheet(token: string, title: string, headers: string[]): Promise<string | null> {
    if (!token) return null;
    try {
      const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          properties: { title },
          sheets: [
            {
              data: [
                {
                  startRow: 0,
                  startColumn: 0,
                  rowData: [
                    {
                      values: headers.map((h) => ({
                        userEnteredValue: { stringValue: h },
                      })),
                    },
                  ],
                },
              ],
            },
          ],
        }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.spreadsheetId || null;
    } catch (err) {
      console.warn('Sheets create error:', err);
      return null;
    }
  },

  async appendSheetRow(
    token: string,
    spreadsheetId: string,
    range: string,
    rowValues: any[]
  ): Promise<boolean> {
    if (!token) return false;
    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
        range
      )}:append?valueInputOption=USER_ENTERED`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [rowValues],
        }),
      });
      return res.ok;
    } catch (err) {
      console.warn('Sheets append error:', err);
      return false;
    }
  },

  // 5. Google Docs
  async createDocReport(token: string, title: string, bodyText: string): Promise<string | null> {
    if (!token) return null;
    try {
      // Create blank doc
      const createRes = await fetch('https://docs.googleapis.com/v1/documents', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
      });
      if (!createRes.ok) return null;
      const docData = await createRes.json();
      const docId = docData.documentId;

      // Insert body text
      await fetch(`https://docs.googleapis.com/v1/documents/${docId}:batchUpdate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              insertText: {
                location: { index: 1 },
                text: `${title}\nGenerated autonomously by AgentOS on ${new Date().toLocaleDateString()}\n\n${bodyText}`,
              },
            },
          ],
        }),
      });
      return docId;
    } catch (err) {
      console.warn('Docs create error:', err);
      return null;
    }
  },

  // 6. Google Tasks
  async createTask(token: string, title: string, notes?: string, dueIso?: string): Promise<any> {
    if (!token) return null;
    try {
      const res = await fetch('https://tasks.googleapis.com/tasks/v1/lists/@default/tasks', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          notes: notes || 'Created by AgentOS autonomous task runner',
          due: dueIso,
        }),
      });
      return res.ok ? await res.json() : null;
    } catch (err) {
      console.warn('Tasks create error:', err);
      return null;
    }
  },

  // 7. Google Contacts
  async searchContacts(token: string, queryStr: string): Promise<any[]> {
    if (!token) return [];
    try {
      const res = await fetch(
        `https://people.googleapis.com/v1/people:searchContacts?query=${encodeURIComponent(
          queryStr
        )}&readMask=names,emailAddresses,phoneNumbers`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) return [];
      const data = await res.json();
      return data.results || [];
    } catch (err) {
      console.warn('Contacts search error:', err);
      return [];
    }
  },
};
