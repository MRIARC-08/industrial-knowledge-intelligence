const os = require('os');
const fs = require('fs');
const path = require('path');

function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      // Skip internal and non-IPv4 addresses
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return '127.0.0.1';
}

const localIp = getLocalIp();
const apiUrl = `http://${localIp}:8000`;
console.log(`Detected Local IP: ${localIp}`);

// Write admin/.env.local
const adminEnvPath = path.join(__dirname, '../admin/.env.local');
fs.writeFileSync(adminEnvPath, `NEXT_PUBLIC_API_URL=${apiUrl}\nNEXT_PUBLIC_API_KEY=dev_key\n`);
console.log(`Wrote ${adminEnvPath}`);

// Write mobile/.env
const mobileEnvPath = path.join(__dirname, '../mobile/.env');
fs.writeFileSync(mobileEnvPath, `EXPO_PUBLIC_API_URL=${apiUrl}\nEXPO_PUBLIC_API_KEY=dev_key\n`);
console.log(`Wrote ${mobileEnvPath}`);
