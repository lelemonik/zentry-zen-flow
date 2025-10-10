# 🎨 Movie & Song Inspired Color Palette

This app uses a beautiful pastel color palette inspired by movies and music aesthetics. The palette creates a soft, calming, and modern aesthetic throughout the application.

## Color Reference

### Primary Palette

| Color Name | Hex Code | HSL | Usage |
|------------|----------|-----|-------|
| **Pastel Pink** | `#D6B1BB` | `349 42% 77%` | Secondary elements, accents, destructive actions |
| **Pastel Blue** | `#CDDBE7` | `197 44% 81%` | Muted elements, borders, backgrounds |
| **Pastel Teal** | `#9EBDBE` | `180 24% 67%` | Accent highlights, info states |
| **Pastel Yellow** | `#E0DABA` | `48 43% 83%` | Primary background, warm accents |
| **Pastel Purple** | `#C6C5DD` | `243 27% 81%` | Accent elements, hover states |
| **Pastel Steel** | `#9CABC8` | `211 29% 69%` | Primary actions, focus states |

## Usage in Code

### CSS Custom Properties

All colors are available as CSS variables:

```css
var(--pastel-pink)    /* #D6B1BB */
var(--pastel-blue)    /* #CDDBE7 */
var(--pastel-teal)    /* #9EBDBE */
var(--pastel-yellow)  /* #E0DABA */
var(--pastel-purple)  /* #C6C5DD */
var(--pastel-steel)   /* #9CABC8 */
```

### Tailwind Utility Classes

Use these classes in your components:

```jsx
<div className="bg-pastel-pink">Pink Background</div>
<div className="text-pastel-steel">Steel Blue Text</div>
<div className="border-pastel-blue">Blue Border</div>
```

### Theme Colors

The palette is integrated into the theme system:

- **Background**: Soft yellow (`#E0DABA`)
- **Foreground**: Darker steel blue for text
- **Primary**: Steel blue (`#9CABC8`)
- **Secondary**: Soft pink (`#D6B1BB`)
- **Muted**: Soft blue (`#CHDBE7`)
- **Accent**: Soft purple (`#C6C5DD`)

## Schedule Event Colors

The Schedule page features quick-select color buttons for all palette colors, making it easy to color-code your calendar events with the beautiful pastel theme.

## Design Philosophy

This color palette is designed to:
- Create a calm, relaxing user experience
- Maintain excellent readability and accessibility
- Work harmoniously with neumorphism design elements
- Provide sufficient contrast for UI elements
- Evoke feelings of creativity and organization

## Dark Mode

The palette adapts beautifully to dark mode, with adjusted saturation and lightness values to maintain the aesthetic while ensuring readability.

---

*Color palette inspired by movie and song aesthetics by @liliamacarrot*
