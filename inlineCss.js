const fs = require('fs');
const path = require('path');

const uiHtmlPath = path.resolve(__dirname, 'dist', 'ui.html');
const cssFilePath = path.resolve(__dirname, 'dist', 'assets', 'figma-plugin-ds.min.css');

if (!fs.existsSync(uiHtmlPath)) {
    console.error('ui.html not found in dist folder.');
    process.exit(1);
}

if (!fs.existsSync(cssFilePath)) {
    console.error('CSS file not found in dist/assets.');
    process.exit(1);
}

const uiHtml = fs.readFileSync(uiHtmlPath, 'utf8');
const cssContent = fs.readFileSync(cssFilePath, 'utf8');

// Replace the <link> tag that includes the CSS with inline CSS.
// Adjust the regex if your <link> tag is formatted differently.
const updatedUiHtml = uiHtml.replace(
    /<link\s+rel=["']stylesheet["']\s+href=["'].*figma-plugin-ds\.min\.css["']\s*\/?>/i,
    `<style>\n${cssContent}\n</style>`
);

fs.writeFileSync(uiHtmlPath, updatedUiHtml, 'utf8');
console.log('CSS inlined successfully into ui.html.');