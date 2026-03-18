const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'src', 'pages');

const files = fs.readdirSync(dir).filter(f => f.endsWith('.styles.js'));

files.forEach(f => {
    const filePath = path.join(dir, f);
    let content = fs.readFileSync(filePath, 'utf8');

    // Replace the specific block the user added for large numbers
    content = content.replace(/\s*max-width: 100%;\s*display: inline-block;\s*overflow-wrap: anywhere;\s*word-break: break-word;/g, '\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;');

    // Replace all other instances of overflow-wrap: anywhere
    content = content.replace(/\s*overflow-wrap: anywhere;\s*word-break: break-word;/g, '\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;');

    // Specifically for Dashboard.styles.js where the user-name mobile rule was broken
    if (f === 'Dashboard.styles.js') {
        content = content.replace(/\s*\.user-name\s*\{\s*white-space:\s*normal;\s*overflow:\s*visible;\s*text-overflow:\s*clip;\s*\}/g, '');
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
});

console.log("Replaced overflow properties with text-ellipsis and removed broken user-name overrides.");
