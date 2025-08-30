#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Automatically scan project and update component inventory
 * Supports both manual and auto-update modes
 */

// Check if running in auto-update mode (triggered by hook)
const isAutoUpdate = process.argv.includes('--auto');
const timestamp = new Date().toLocaleTimeString();

if (isAutoUpdate) {
  console.log(`🔄 [${timestamp}] Auto-updating component inventory...`);
} else {
  console.log(`📊 [${timestamp}] Manual component inventory update...`);
}

const srcDir = path.join(__dirname, '../src');
const docsDir = path.join(__dirname, '../docs');
const inventoryFile = path.join(docsDir, 'component-inventory.json');

function scanDirectory(dir, extensions = ['.tsx', '.ts', '.css']) {
  const files = [];
  
  function scan(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scan(fullPath);
      } else if (extensions.some(ext => item.endsWith(ext))) {
        files.push({
          name: item,
          path: fullPath,
          relativePath: path.relative(srcDir, fullPath),
          type: getFileType(fullPath),
          lastModified: stat.mtime.toISOString().split('T')[0]
        });
      }
    }
  }
  
  scan(dir);
  return files;
}

function getFileType(filePath) {
  if (filePath.includes('/components/')) return 'component';
  if (filePath.includes('/pages/')) return 'page';
  if (filePath.includes('/styles/')) return 'stylesheet';
  return 'other';
}

function extractComponentInfo(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath, path.extname(filePath));
    
    // Extract component name from export
    const exportMatch = content.match(/export default (?:function )?(\w+)/);
    const componentName = exportMatch ? exportMatch[1] : fileName;
    
    // Extract imports to find dependencies
    const importMatches = content.match(/import.*from ['"]([^'"]+)['"]/g) || [];
    const dependencies = importMatches
      .map(imp => imp.match(/from ['"]([^'"]+)['"]/)?.[1])
      .filter(dep => dep && (dep.startsWith('./') || dep.startsWith('../')))
      .map(dep => path.basename(dep));
    
    // Find usage of other components
    const usedComponents = [];
    const componentMatches = content.match(/<(\w+)/g) || [];
    componentMatches.forEach(match => {
      const comp = match.replace('<', '');
      if (comp !== 'div' && comp !== 'span' && !comp.startsWith('html')) {
        usedComponents.push(comp);
      }
    });
    
    return {
      componentName,
      dependencies,
      usedComponents: [...new Set(usedComponents)]
    };
  } catch (error) {
    console.warn(`Could not analyze ${filePath}:`, error.message);
    return {
      componentName: path.basename(filePath, path.extname(filePath)),
      dependencies: [],
      usedComponents: []
    };
  }
}

function findComponentUsage(componentName, files) {
  const usedOn = [];
  
  files.forEach(file => {
    if (file.type === 'page') {
      try {
        const content = fs.readFileSync(file.path, 'utf8');
        if (content.includes(componentName)) {
          usedOn.push(path.basename(file.name, '.tsx'));
        }
      } catch (error) {
        console.warn(`Could not read ${file.path}:`, error.message);
      }
    }
  });
  
  return usedOn;
}

function generateInventory() {
  console.log('🔍 Scanning project files...');
  
  const files = scanDirectory(srcDir);
  const inventory = {
    components: [],
    pages: [],
    styles: [],
    metadata: {
      lastUpdated: new Date().toISOString().split('T')[0],
      version: '1.0.0',
      totalComponents: 0,
      totalPages: 0,
      totalStyles: 0
    }
  };
  
  console.log(`📁 Found ${files.length} files`);
  
  files.forEach(file => {
    const info = extractComponentInfo(file.path);
    const usedOn = findComponentUsage(info.componentName, files);
    
    const item = {
      id: info.componentName.toLowerCase().replace(/([A-Z])/g, '-$1').substring(1),
      name: info.componentName,
      codeName: info.componentName,
      type: file.type,
      filePath: file.relativePath,
      description: `Auto-generated entry for ${info.componentName}`,
      status: 'active',
      lastModified: file.lastModified,
      issues: [],
      dependencies: info.dependencies,
      usedComponents: info.usedComponents
    };
    
    if (file.type === 'component') {
      item.usedOn = usedOn;
      item.props = []; // Would need more sophisticated parsing
      inventory.components.push(item);
      inventory.metadata.totalComponents++;
    } else if (file.type === 'page') {
      item.route = `/${info.componentName.toLowerCase()}`;
      item.components = info.usedComponents;
      inventory.pages.push(item);
      inventory.metadata.totalPages++;
    } else if (file.type === 'stylesheet') {
      item.usedBy = usedOn;
      inventory.styles.push(item);
      inventory.metadata.totalStyles++;
    }
  });
  
  // Ensure docs directory exists
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }
  
  // Write inventory file
  fs.writeFileSync(inventoryFile, JSON.stringify(inventory, null, 2));
  
  if (isAutoUpdate) {
    console.log(`✅ [${timestamp}] Auto-update complete - ${inventory.metadata.totalComponents} components, ${inventory.metadata.totalPages} pages`);
  } else {
    console.log('✅ Inventory updated successfully!');
    console.log(`📊 Components: ${inventory.metadata.totalComponents}`);
    console.log(`📄 Pages: ${inventory.metadata.totalPages}`);
    console.log(`🎨 Styles: ${inventory.metadata.totalStyles}`);
    console.log(`📝 Saved to: ${inventoryFile}`);
  }
  
  // Auto-generate markdown and HTML if not in auto mode or if files don't exist
  if (!isAutoUpdate || !fs.existsSync(path.join(docsDir, 'COMPONENT_INVENTORY.md'))) {
    generateMarkdownReport(inventory);
    generateHTMLDashboard(inventory);
  }
  
  return inventory;
}

function generateMarkdownReport(inventory) {
  const markdownPath = path.join(docsDir, 'COMPONENT_INVENTORY.md');
  
  let markdown = `# Component Inventory Report

*Last updated: ${inventory.metadata.lastUpdated}*

## Summary
- **Components**: ${inventory.metadata.totalComponents}
- **Pages**: ${inventory.metadata.totalPages}  
- **Stylesheets**: ${inventory.metadata.totalStyles}

## Components

| Name | File | Used On | Dependencies |
|------|------|---------|--------------|
`;

  inventory.components.forEach(comp => {
    const usedOn = comp.usedOn?.join(', ') || 'None';
    const deps = comp.dependencies?.join(', ') || 'None';
    markdown += `| ${comp.name} | \`${comp.filePath}\` | ${usedOn} | ${deps} |\n`;
  });

  markdown += `\n## Pages

| Name | Route | File | Components Used |
|------|-------|------|-----------------|
`;

  inventory.pages.forEach(page => {
    const components = page.components?.join(', ') || 'None';
    markdown += `| ${page.name} | ${page.route} | \`${page.filePath}\` | ${components} |\n`;
  });

  fs.writeFileSync(markdownPath, markdown);
  
  if (!isAutoUpdate) {
    console.log(`📄 Markdown report saved to: ${markdownPath}`);
  }
}

function generateHTMLDashboard(inventory) {
  const htmlPath = path.join(docsDir, 'component-dashboard.html');
  
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Component Dashboard - AIme Platform</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 12px; padding: 30px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 40px; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 40px; }
        .stat-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; }
        .stat-number { font-size: 2em; font-weight: bold; margin-bottom: 5px; }
        .stat-label { opacity: 0.9; }
        .section { margin-bottom: 40px; }
        .section h2 { color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
        .card { background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; transition: transform 0.2s; }
        .card:hover { transform: translateY(-2px); box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
        .card-title { font-weight: bold; color: #333; margin-bottom: 10px; }
        .card-meta { color: #666; font-size: 0.9em; margin-bottom: 10px; }
        .tag { display: inline-block; background: #e3f2fd; color: #1976d2; padding: 2px 8px; border-radius: 4px; font-size: 0.8em; margin: 2px; }
        .last-updated { text-align: center; color: #666; margin-top: 30px; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 Component Dashboard</h1>
            <p>AIme Platform - Social Wellness Hub</p>
        </div>
        
        <div class="stats">
            <div class="stat-card">
                <div class="stat-number">${inventory.metadata.totalComponents}</div>
                <div class="stat-label">Components</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${inventory.metadata.totalPages}</div>
                <div class="stat-label">Pages</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${inventory.metadata.totalStyles}</div>
                <div class="stat-label">Stylesheets</div>
            </div>
        </div>
        
        <div class="section">
            <h2>📦 Components</h2>
            <div class="grid">
                ${inventory.components.map(comp => `
                    <div class="card">
                        <div class="card-title">${comp.name}</div>
                        <div class="card-meta">📁 ${comp.filePath}</div>
                        <div class="card-meta">📅 Modified: ${comp.lastModified}</div>
                        ${comp.usedOn?.length ? `<div><strong>Used on:</strong> ${comp.usedOn.map(page => `<span class="tag">${page}</span>`).join('')}</div>` : ''}
                        ${comp.usedComponents?.length ? `<div><strong>Uses:</strong> ${comp.usedComponents.map(c => `<span class="tag">${c}</span>`).join('')}</div>` : ''}
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="section">
            <h2>📄 Pages</h2>
            <div class="grid">
                ${inventory.pages.map(page => `
                    <div class="card">
                        <div class="card-title">${page.name}</div>
                        <div class="card-meta">🔗 ${page.route}</div>
                        <div class="card-meta">📁 ${page.filePath}</div>
                        <div class="card-meta">📅 Modified: ${page.lastModified}</div>
                        ${page.components?.length ? `<div><strong>Components:</strong> ${page.components.map(c => `<span class="tag">${c}</span>`).join('')}</div>` : ''}
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="last-updated">
            Last updated: ${inventory.metadata.lastUpdated} | Auto-generated by Component Inventory System
        </div>
    </div>
</body>
</html>`;

  fs.writeFileSync(htmlPath, html);
  
  if (!isAutoUpdate) {
    console.log(`🌐 HTML dashboard saved to: ${htmlPath}`);
  }
}

// Run the inventory generation
try {
  generateInventory();
} catch (error) {
  console.error('❌ Error updating inventory:', error.message);
  process.exit(1);
}

export { generateInventory, scanDirectory, extractComponentInfo, generateMarkdownReport, generateHTMLDashboard };