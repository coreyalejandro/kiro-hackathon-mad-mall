# Kiro Hooks - Component Inventory Auto-Update

This directory contains Kiro hooks that automatically maintain the component inventory documentation for the AIme platform.

## Available Hooks

### 1. Component Inventory Auto-Updater
**File**: `component-inventory-updater.json`
**Trigger**: File save events on component/page files
**Action**: Automatically updates component inventory when you save `.tsx` or `.ts` files

- **Patterns Watched**: 
  - `src/components/**/*.tsx`
  - `src/components/**/*.ts`
  - `src/pages/**/*.tsx`
  - `src/pages/**/*.ts`
- **Debounce**: 2 seconds (prevents excessive updates)
- **Background**: Runs silently without interrupting your workflow

### 2. Manual Inventory Update
**File**: `manual-inventory-update.json`
**Trigger**: Manual button click
**Action**: Full component inventory update with detailed output

- **Button**: "🔄 Update Component Inventory" in the Agent Hooks panel
- **Output**: Shows detailed progress and statistics
- **Use Case**: When you want to force a complete refresh

## Generated Documentation

The hooks automatically maintain these files:

1. **`docs/component-inventory.json`** - Machine-readable inventory data
2. **`docs/COMPONENT_INVENTORY.md`** - Human-readable markdown report
3. **`docs/component-dashboard.html`** - Interactive HTML dashboard

## How It Works

### Auto-Update Flow
1. You save a component file (e.g., `HeroSection.tsx`)
2. Hook detects the file change
3. Script scans all components and pages
4. Updates inventory files automatically
5. Logs minimal output to avoid noise

### Manual Update Flow
1. Click "🔄 Update Component Inventory" button
2. Script runs with full verbose output
3. Shows detailed statistics and file paths
4. Regenerates all documentation files

## Script Features

### Component Analysis
- **Component Name**: Extracted from export statements
- **Dependencies**: Tracks imported local components
- **Usage**: Finds which pages use each component
- **File Metadata**: Last modified dates, file paths
- **Component Relationships**: Maps component usage patterns

### Performance
- **Fast Scanning**: Only processes relevant file types
- **Debounced Updates**: Prevents excessive runs during rapid saves
- **Background Processing**: Doesn't interrupt your workflow
- **Error Handling**: Graceful failure with helpful error messages

## Manual Commands

You can also run the inventory update manually:

```bash
# Full update with detailed output
npm run inventory:update

# Auto-update mode (minimal output)
node scripts/update-inventory.js --auto

# View the HTML dashboard
npm run inventory:view
```

## Configuration

### Hook Settings
- **Debounce**: 2000ms (adjustable in hook config)
- **Background**: true (runs without blocking UI)
- **Enabled**: true (can be disabled if needed)

### File Patterns
The hooks watch these patterns:
- `src/components/**/*.tsx` - React components
- `src/components/**/*.ts` - TypeScript utilities
- `src/pages/**/*.tsx` - Page components
- `src/pages/**/*.ts` - Page utilities

## Troubleshooting

### Hook Not Triggering
1. Check if hooks are enabled in Kiro settings
2. Verify file patterns match your saved files
3. Check the Agent Hooks panel for status

### Script Errors
1. Ensure Node.js is available
2. Check that `madmall-web` directory exists
3. Verify file permissions for docs directory

### Missing Documentation
1. Run manual update to regenerate all files
2. Check console output for specific errors
3. Ensure docs directory is writable

## Benefits

### For Developers
- **Always Up-to-Date**: Documentation stays current automatically
- **Zero Maintenance**: No manual documentation updates needed
- **Component Insights**: See usage patterns and dependencies
- **Quick Reference**: HTML dashboard for visual overview

### For Teams
- **Onboarding**: New developers can quickly understand component structure
- **Architecture**: Visual component relationships and usage
- **Maintenance**: Identify unused or over-used components
- **Documentation**: Always-current component inventory

## Future Enhancements

Potential improvements for the hook system:

1. **Dependency Graph**: Visual component dependency mapping
2. **Usage Analytics**: Track component usage frequency
3. **Breaking Changes**: Detect when component interfaces change
4. **Performance Metrics**: Component bundle size tracking
5. **Test Coverage**: Integration with test coverage reports

The hook system provides a foundation for expanding automated documentation and analysis capabilities as the project grows.