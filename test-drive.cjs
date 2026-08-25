const fs = require('fs');

const envFile = fs.readFileSync('.env', 'utf-8');
const env = {};
for (const line of envFile.split('\n')) {
  const [key, ...val] = line.split('=');
  if (key) {
    env[key.trim()] = val.join('=').trim();
  }
}

async function testDrive() {
  const apiKey = env.VITE_DRIVE_API_KEY;
  const rootId = env.VITE_GOOGLE_DRIVE_FOLDER_ID;
  
  const q = `'${rootId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name)&key=${apiKey}`;
  
  const res = await fetch(url);
  const data = await res.json();
  console.log("Root folders:", data);
  
  if (data.files && data.files.length > 0) {
    const folderId = data.files[0].id;
    const subQ = `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`;
    const subUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(subQ)}&fields=files(id,name,thumbnailLink,mimeType)&key=${apiKey}`;
    const subRes = await fetch(subUrl);
    const subData = await subRes.json();
    console.log("Images in first folder:", JSON.stringify(subData, null, 2));
  }
}

testDrive();
