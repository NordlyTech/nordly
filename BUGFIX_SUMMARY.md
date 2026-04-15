# PowerPoint Generation Bug Fix

## Issue
The PowerPoint generation feature was failing with the error: "Failed to generate PowerPoint. Please try again"

## Root Cause
The code was using incorrect pptxgenjs API syntax. Specifically:

1. **Incorrect API usage for numbered circles**: The code tried to pass `shape` and `fill` parameters to `addText()`, but these parameters don't exist on that method.
2. **TypeScript type issue**: The `pptxData` blob type wasn't properly asserted for the file system API.

## Fixes Applied

### 1. Fixed numbered circle generation (3 instances in "How It Works" slide)

**Before:**
```typescript
newSlide.addText('1', {
  x: 1.0,
  y: 2.0,
  w: 0.6,
  h: 0.6,
  fontSize: 32,
  bold: true,
  color: 'FFFFFF',
  align: 'center',
  fill: { color: nordlyBlue },      // ❌ Invalid parameter
  shape: pptx.ShapeType.ellipse     // ❌ Invalid parameter
})
```

**After:**
```typescript
newSlide.addShape(pptx.ShapeType.ellipse, {
  x: 1.0,
  y: 2.0,
  w: 0.6,
  h: 0.6,
  fill: { color: nordlyBlue }
})
newSlide.addText('1', {
  x: 1.0,
  y: 2.0,
  w: 0.6,
  h: 0.6,
  fontSize: 32,
  bold: true,
  color: 'FFFFFF',
  align: 'center',
  valign: 'middle'
})
```

### 2. Fixed TypeScript type assertion

**Before:**
```typescript
const pptxData = await pptx.write({ outputType: 'blob' })
// ... later ...
const url = URL.createObjectURL(pptxData as Blob)
```

**After:**
```typescript
const pptxData = await pptx.write({ outputType: 'blob' }) as Blob
// ... later ...
const url = URL.createObjectURL(pptxData)
```

## Result
The PowerPoint generation now works correctly. The "How It Works" slide properly displays numbered circles with the numbers 1, 2, and 3 centered inside them, and the file downloads successfully.

## Files Modified
- `/workspaces/spark-template/src/pages/PresentationPage.tsx`
