const https = require('https');
const fs = require('fs');

const env = fs.readFileSync('.env', 'utf8');
const API_KEY = env.match(/VITE_DRIVE_API_KEY=(.*)/)[1].trim();
const FOLDER_ID = env.match(/VITE_GOOGLE_DRIVE_FOLDER_ID=(.*)/)[1].trim();

async function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function checkUrl(name, url) {
  console.log(`\nTesting: ${name}`);
  console.log(`URL: ${url}`);
  
  return new Promise((resolve) => {
    https.get(url, (res) => {
      console.log(`HTTP Status: ${res.statusCode}`);
      console.log(`Content-Type: ${res.headers['content-type']}`);
      console.log(`Content-Length: ${res.headers['content-length']}`);
      
      let size = 0;
      res.on('data', chunk => size += chunk.length);
      res.on('end', () => {
        console.log(`Actual bytes received: ${size}`);
        console.log(`Can be rendered by <img>: ${res.statusCode === 200 && res.headers['content-type']?.startsWith('image/') ? 'Yes' : 'No'}`);
        resolve();
      });
    }).on('error', (err) => {
      console.error(`Error: ${err.message}`);
      resolve();
    });
  });
}

async function run() {
  console.log('Fetching event folders from Drive...');
  const listUrl = `https://www.googleapis.com/drive/v3/files?q='${FOLDER_ID}'+in+parents+and+mimeType='application/vnd.google-apps.folder'&fields=files(id,name)&key=${API_KEY}`;
  
  const foldersData = await fetchJson(listUrl);
  if (!foldersData.files || foldersData.files.length === 0) {
    console.log('No folders found in the root.');
    return;
  }
  
  const eventFolder = foldersData.files[0];
  console.log(`Checking folder: ${eventFolder.name} (${eventFolder.id})`);
  
  const imgUrl = `https://www.googleapis.com/drive/v3/files?q='${eventFolder.id}'+in+parents+and+mimeType+contains+'image/'&fields=files(id,name,mimeType,thumbnailLink,webContentLink,webViewLink)&key=${API_KEY}`;
  const imgData = await fetchJson(imgUrl);
  
  if (!imgData.files || imgData.files.length === 0) {
    console.log('No images found in the event folder.');
    return;
  }
  
  const file = imgData.files[0];
  console.log(`Found image: ${file.name} (${file.id})`);
  
  // Strategy 1: thumbnailLink
  if (file.thumbnailLink) {
    await checkUrl('Strategy 1: thumbnailLink', file.thumbnailLink.replace(/=s\d+$/, '=s800'));
  } else {
    console.log('\nStrategy 1: thumbnailLink not returned by API.');
  }
  
  // Strategy 2: Manual URL
  const manualUrl = `https://drive.google.com/thumbnail?id=${file.id}&sz=w800`;
  await checkUrl('Strategy 2: Manual URL (drive.google.com/thumbnail)', manualUrl);
  
  // Strategy 3: alt=media
  const altMediaUrl = `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media&key=${API_KEY}`;
  await checkUrl('Strategy 3: alt=media (Drive API)', altMediaUrl);
}

run();
