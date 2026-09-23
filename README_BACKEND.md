
# AICTE IDEA Lab Backend Integration

This backend is designed for Vercel Serverless deployment and PostgreSQL.

## Deployment Steps

1.  **Database**: Create a PostgreSQL instance (Neon, Supabase, or RDS).
2.  **Schema**: Execute the contents of `db/schema.sql` in your DB console.
3.  **Google Cloud**:
    *   Go to GCP Console -> APIs & Services -> Credentials.
    *   Create "OAuth 2.0 Client ID" for "Web application".
    *   Add your Vercel URL to "Authorized redirect URIs".
4.  **Vercel Configuration**:
    *   Add environment variables from `.env.example` to Vercel Project Settings.
5.  **Simultaneous Login Test**:
    *   Open User app in Chrome: Login via Google.
    *   Open Staff app in Firefox: Login via Google (ensure user email is marked as 'STAFF' in the DB `users` table).
    *   Upload an STL as a User; check for it appearing in the Staff dashboard immediately.

## Browser Support
The stateless JWT approach ensures compatibility across Chrome, Safari, Edge, and Firefox without issues related to third-party cookies.
