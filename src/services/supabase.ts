import { createClient } from "@supabase/supabase-js";

// We use the available keys to set up the connection. 
// Using the service role key for student project demo purposes if no ANON is available.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://hbfelcsjdyzijxvmgvqf.supabase.co";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhiZmVsY3NqZHl6aWp4dm1ndnFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0NzIyNTIsImV4cCI6MjA4OTA0ODI1Mn0.nt2t-ekcFUKfeVRDJqo7UnYun2F-IdcBqS0HPzQflMU";

export const supabase = createClient(supabaseUrl, supabaseKey);
