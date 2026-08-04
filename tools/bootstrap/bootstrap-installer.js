const fs = require("fs");
const path = require("path");

const workspace = path.resolve(__dirname);

const files = {
  "discover.js": `const fs = require("fs");
const path = require("path");

const workspace = path.resolve(__dirname, "../..");

console.log("==================================");
console.log("CGP Workspace Discovery");
console.log("==================================\\n");

console.log("Workspace:", workspace, "\\n");

const directories = fs.readdirSync(workspace, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name)
  .sort();

console.log("Directories:\\n");

directories.forEach(d => console.log("- " + d));

console.log("\\nDone.");
`,

  "manifest.js": `console.log("Manifest generator - pending.");`,

  "sync.js": `console.log("Workspace sync - pending.");`,

  "init.js": `console.log("Bootstrap initialized.");`
};

console.log("Installing Bootstrap...\\n");

for (const [file, content] of Object.entries(files)) {
  const destination = path.join(workspace, file);

  fs.writeFileSync(destination, content);

  console.log("Created:", destination);
}

console.log("\\nBootstrap installation completed.");
