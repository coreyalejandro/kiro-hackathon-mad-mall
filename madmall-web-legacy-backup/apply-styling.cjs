const fs = require('fs');
const path = require('path');

const pages = [
  'ComedyLounge.tsx',
  'Marketplace.tsx', 
  'ResourceHub.tsx',
  'StoryBooth.tsx'
];

const stylingUpdates = [
  // Add text-rich-umber class to h2 headers
  {
    find: /Header variant="h2"(?!.*className)/g,
    replace: 'Header variant="h2" className="text-rich-umber"'
  },
  // Wrap containers in gradient backgrounds
  {
    find: /<Container>\s*<Header/g,
    replace: '<Container>\n          <div className="kadir-nelson-gradient-sage" style={{ padding: "1.5rem", borderRadius: "12px" }}>\n            <Header'
  }
];

pages.forEach(pageFile => {
  const filePath = path.join(__dirname, 'src', 'pages', pageFile);
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    stylingUpdates.forEach(update => {
      content = content.replace(update.find, update.replace);
    });
    
    fs.writeFileSync(filePath, content);
    console.log(`Updated styling for ${pageFile}`);
  }
});

console.log('Styling updates complete!');