const fs = require('fs');

// Only generate if config.js doesn't exist or we're in CI (like Vercel)
const isCI = process.env.CI || process.env.VERCEL;
const configExists = fs.existsSync('config.js');

if (!configExists || isCI) {
  const SUPABASE_URL = process.env.SUPABASE_URL || 'https://allqxyilumurluzfgvlz.supabase.co';
  const SUPABASE_KEY = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsbHF4eWlsdW11cmx1emZndmx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MzIyMDcsImV4cCI6MjA3NzUwODIwN30.qI_b_asnUtqcoRYzTy0H86okwEcA2vjJra3cdtuyNn8';
  const ADMIN_PASS = process.env.ADMIN_PASS || '2025911';

  const CITIES = ['Riyadh','Jeddah','Mecca','Medina','Dammam','Khobar','Dhahran','Taif','Abha','Tabuk','Buraidah','Khamis Mushait','Hail','Al Jubail','Najran','Al Bahah','Yanbu','Al Kharj','Arar','Sakaka','Jizan','Al Qatif','Unayzah','Al Hofuf','Al Mubarraz','Turaif','Al Qunfudhah','Al Majma\'ah','Al Zulfi','Al Shaqra'];

  const configContent = `const SUPABASE_URL = '${SUPABASE_URL}'
const SUPABASE_KEY = '${SUPABASE_KEY}'

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY)

const CITIES = ${JSON.stringify(CITIES)}

const ADMIN_PASS = '${ADMIN_PASS}'
`;

  fs.writeFileSync('config.js', configContent);
  console.log('config.js generated successfully');
} else {
  console.log('config.js already exists, skipping generation');
}

