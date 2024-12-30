import { createClient } from '@supabase/supabase-js';

const url = 'https://zxdqxqrszkjxjwgkmcda.supabase.co';
const anonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4ZHF4cXJzemtqeGp3Z2ttY2RhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU1MjA0OTksImV4cCI6MjA1MTA5NjQ5OX0.k3PgQXPyx9hPBFj0iwf4RdvTk0VK48U0LmwO5TRqMWA';

export const supabase = createClient(url, anonKey);
