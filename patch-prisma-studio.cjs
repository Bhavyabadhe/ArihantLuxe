const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'node_modules', 'prisma', 'build', 'index.js');

if (fs.existsSync(targetFile)) {
  let content = fs.readFileSync(targetFile, 'utf8');
  if (content.includes('r.limit||"100kb"')) {
    content = content.replace(/r\.limit\|\|"100kb"/g, 'r.limit||"100mb"');
    fs.writeFileSync(targetFile, content, 'utf8');
    console.log('Successfully patched Prisma Studio body-parser limit to 100mb.');
  } else if (content.includes('r.limit||"100mb"')) {
    console.log('Prisma Studio is already patched (limit is 100mb).');
  } else {
    console.log('Could not find r.limit||"100kb" in Prisma build.');
  }
} else {
  console.log('Target file not found:', targetFile);
}
