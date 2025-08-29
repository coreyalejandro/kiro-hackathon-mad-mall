#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Automatically scan project and update component inventory
 */

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
  
  console.log('✅ Inventory updated successfully!');
  console.log(`📊 Components: ${inventory.metadata.totalComponents}`);
  console.log(`📄 Pages: ${inventory.metadata.totalPages}`);
  console.log(`🎨 Styles: ${inventory.metadata.totalStyles}`);
  console.log(`📝 Saved to: ${inventoryFile}`);
  
  return inventory;
}

// Run if called directly
if (require.main === module) {
  generateInventory();
}

module.exports = { generateInventory, scanDirectory, extractComponentInfo };