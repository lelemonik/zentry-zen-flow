# Cloud Petal Color Palette 🌸

A delicate blend of blush hues and cozy warmth, like sunlight gently spilling through sheer curtains. This palette captures the softness of mornings, the comforting hush of a peaceful space, and the serene beginnings.

## Color Scheme

### Primary Colors

| Color Name | Hex Code | HSL | Usage |
|------------|----------|-----|-------|
| **White Blossom** | `#f9f7f4` | `0 0% 97%` | Main background, lightest tone |
| **Blush Cloud** | `#f5e0e2` | `350 39% 78%` | Cards, soft accents, secondary backgrounds |
| **Petal Dust** | `#e8cdc7` | `6 30% 78%` | Muted elements, borders, subtle highlights |
| **Muted Rosewood** | `#d7b3ad` | `6 25% 66%` | Accent colors, interactive elements |
| **Faded Mauve** | `#b9908d` | `340 18% 61%` | Primary actions, emphasis |
| **Dried Rose** | `#8b6a69` | `0 16% 47%` | Text, strong contrast, headings |

## Design Philosophy

This palette feels like **gentle light, soft sighs, and serene beginnings**. It's perfect for:
- Productivity apps that promote calm and focus
- Wellness and mood tracking interfaces
- Minimalist, neumorphic designs
- Cozy, welcoming user experiences

## Implementation in Zentry

### CSS Variables
All colors are available as CSS custom properties:
```css
--white-blossom: 0 0% 97%
--blush-cloud: 350 39% 78%
--petal-dust: 6 30% 78%
--muted-rosewood: 6 25% 66%
--faded-mauve: 340 18% 61%
--dried-rose: 0 16% 47%
```

### Tailwind Classes
Use these utility classes throughout your components:

**Background Colors:**
- `bg-white-blossom`
- `bg-blush-cloud`
- `bg-petal-dust`
- `bg-muted-rosewood`
- `bg-faded-mauve`
- `bg-dried-rose`

**Text Colors:**
- `text-white-blossom`
- `text-blush-cloud`
- `text-petal-dust`
- `text-muted-rosewood`
- `text-faded-mauve`
- `text-dried-rose`

**Border Colors:**
- `border-white-blossom`
- `border-blush-cloud`
- `border-petal-dust`
- `border-muted-rosewood`
- `border-faded-mauve`
- `border-dried-rose`

### Neumorphism Shadows
The palette includes custom neumorphic shadows that create soft, raised, and inset effects:

```css
.shadow-neumorphism        /* Default soft shadow */
.shadow-neumorphism-sm     /* Subtle shadow */
.shadow-neumorphism-lg     /* Pronounced shadow */
.shadow-neumorphism-inset  /* Inset/pressed effect */
.shadow-neumorphism-pressed /* Button pressed state */
.shadow-neumorphism-hover  /* Elevated hover state */
```

## Color Usage Guidelines

### Mood Tracker
Each mood is assigned a specific color from the palette:
- **Amazing**: Blush Cloud (joyful, positive)
- **Good**: Petal Dust (calm, content)
- **Okay**: Muted Rosewood (neutral, balanced)
- **Not Great**: Faded Mauve (subdued, reflective)
- **Awful**: Dried Rose (grounded, serious)

### UI Hierarchy
1. **Background**: White Blossom (base canvas)
2. **Cards/Containers**: Blush Cloud or White Blossom with neumorphic shadows
3. **Borders/Dividers**: Petal Dust at 30-50% opacity
4. **Interactive Elements**: Muted Rosewood or Faded Mauve
5. **Text**: Dried Rose (primary), Muted Foreground (secondary)
6. **Highlights/Gradients**: Blend from Blush Cloud through Petal Dust to Muted Rosewood

## Accessibility

- **Contrast Ratios**: Dried Rose on White Blossom provides WCAG AA compliant contrast
- **Readability**: Main body text uses darker tones (Dried Rose, Faded Mauve)
- **Interactive States**: Hover and focus states use slightly darker/saturated versions

## Examples

### Button States
- **Default**: White Blossom background with neumorphic shadow
- **Hover**: Petal Dust border, elevated shadow
- **Active**: Gradient from Blush Cloud to Petal Dust, pressed shadow
- **Selected**: Muted Rosewood or Faded Mauve with enhanced gradient

### Card Styling
```jsx
<Card className="glass animate-slide-up border-0 shadow-neumorphism">
  <CardHeader>
    <CardTitle className="bg-gradient-to-r from-blush-cloud via-petal-dust to-muted-rosewood bg-clip-text text-transparent">
      Title
    </CardTitle>
  </CardHeader>
</Card>
```

## Inspiration

Inspired by the Pinterest pin "Cloud Petal" palette, this color scheme evokes:
- Early morning light filtering through curtains
- Soft petals and delicate florals
- Cozy blankets and peaceful spaces
- Gentle warmth and serene beginnings

---

*"A delicate blend of blush hues and cozy warmth"* ✨
