# MADMall Documentation System

This directory contains the component inventory and documentation system for the MADMall Social Wellness Hub.

## Files Overview

### 📋 Inventory Files
- **`component-inventory.json`** - Machine-readable JSON inventory
- **`COMPONENT_INVENTORY.md`** - Human-readable markdown documentation  
- **`component-dashboard.html`** - Interactive filterable dashboard

### 🔧 Maintenance Scripts
- **`../scripts/update-inventory.js`** - Automated inventory scanner

## Quick Start

### View Component Inventory
```bash
# Open interactive dashboard
npm run inventory:view

# Or open manually
open docs/component-dashboard.html
```

### Update Inventory
```bash
# Automatically scan and update inventory
npm run inventory:update
```

### Manual Updates
Edit `component-inventory.json` directly and the changes will be reflected in all views.

## Usage Examples

### Finding Components
```bash
# Search for a specific component
grep -i "herosection" docs/COMPONENT_INVENTORY.md

# Find all components used on a specific page
grep -A 5 -B 5 "Concourse" docs/component-inventory.json
```

### Adding New Components
1. Create your component file
2. Run `npm run inventory:update` to auto-detect it
3. Manually edit the JSON to add descriptions, props, etc.
4. Update any issues or status as needed

### Tracking Issues
Add issues to the `issues` array in the JSON:
```json
{
  "issues": [
    {
      "type": "bug",
      "description": "Hero section not responsive on mobile",
      "priority": "high",
      "assignee": "developer-name"
    }
  ]
}
```

## Filtering Options

The dashboard supports filtering by:
- **Search**: Name, code name, description
- **Type**: Component, Page, Stylesheet
- **Status**: Active, Deprecated, Development
- **Usage**: Which pages use the component

## Best Practices

1. **Keep it Updated**: Run `npm run inventory:update` after major changes
2. **Document Issues**: Always add known issues to help with debugging
3. **Use Code Names**: Consistent naming makes referencing easier
4. **Track Dependencies**: Note which components depend on others
5. **Regular Reviews**: Monthly cleanup of deprecated items

## Integration with Development

### Git Hooks (Optional)
Add to `.git/hooks/pre-commit`:
```bash
#!/bin/sh
npm run inventory:update
git add docs/component-inventory.json
```

### VS Code Integration
Add to `.vscode/tasks.json`:
```json
{
  "label": "Update Component Inventory",
  "type": "shell", 
  "command": "npm run inventory:update",
  "group": "build"
}
```

## Customization

### Adding New Fields
Edit the JSON structure and update:
1. `update-inventory.js` script
2. `component-dashboard.html` display logic
3. `COMPONENT_INVENTORY.md` template

### Custom Filters
Modify the dashboard HTML to add new filter options based on your custom fields.

---

*This system helps maintain clarity and organization as the MADMall project grows. Keep it updated and it will save you significant time in debugging and refactoring!*