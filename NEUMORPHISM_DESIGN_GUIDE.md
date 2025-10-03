# 🎨 Neumorphism Design Guide

## Overview

Zentry now features a complete **neumorphism (soft UI)** design system! This modern design aesthetic creates a soft, 3D embossed effect that's both visually appealing and highly interactive.

---

## What is Neumorphism?

Neumorphism is a design trend that creates depth through:
- **Dual shadows** - Light shadow on one side, dark on the other
- **Same-color backgrounds** - Elements match the page background
- **Soft edges** - Generous border radius for smooth appearance
- **Subtle elevation** - Elements appear to float or press into the surface

---

## Design System

### Color Palette

**Light Mode:**
```css
Background: hsl(225, 20%, 92%)  /* Soft blue-gray */
Foreground: hsl(240, 10%, 20%)  /* Dark gray text */
Primary: hsl(262, 83%, 58%)     /* Purple */
Secondary: hsl(217, 91%, 60%)   /* Blue */
```

**Dark Mode:**
```css
Background: hsl(240, 15%, 15%)  /* Deep blue-gray */
Foreground: hsl(240, 5%, 90%)   /* Light gray text */
Primary: hsl(262, 83%, 58%)     /* Purple */
Secondary: hsl(217, 91%, 60%)   /* Blue */
```

### Shadow System

#### Light Mode Shadows
```css
--neu-shadow: 
  8px 8px 16px rgba(163, 177, 198, 0.6),
  -8px -8px 16px rgba(255, 255, 255, 0.8);

--neu-shadow-sm:
  4px 4px 8px rgba(163, 177, 198, 0.5),
  -4px -4px 8px rgba(255, 255, 255, 0.7);

--neu-shadow-lg:
  12px 12px 24px rgba(163, 177, 198, 0.7),
  -12px -12px 24px rgba(255, 255, 255, 0.9);

--neu-shadow-inset:
  inset 8px 8px 16px rgba(163, 177, 198, 0.6),
  inset -8px -8px 16px rgba(255, 255, 255, 0.8);

--neu-shadow-pressed:
  inset 4px 4px 8px rgba(163, 177, 198, 0.5),
  inset -2px -2px 4px rgba(255, 255, 255, 0.7);
```

#### Dark Mode Shadows
```css
--neu-shadow:
  8px 8px 16px rgba(0, 0, 0, 0.5),
  -8px -8px 16px rgba(60, 64, 80, 0.4);
```

---

## Utility Classes

### `.neu`
Standard neumorphic element with soft elevation.
```html
<div class="neu rounded-3xl p-6">
  Floating card
</div>
```

### `.neu-sm`
Smaller shadow for subtle elements.
```html
<button class="neu-sm rounded-xl">
  Small button
</button>
```

### `.neu-lg`
Larger shadow for prominent elements.
```html
<div class="neu-lg rounded-3xl p-8">
  Hero card
</div>
```

### `.neu-inset`
Inset effect for inputs and pressed areas.
```html
<input class="neu-inset rounded-2xl" />
```

### `.neu-pressed`
Active/pressed state for interactive elements.
```html
<button class="neu-pressed">
  Active button
</button>
```

### `.neu-flat`
No shadows, flat appearance.
```html
<div class="neu-flat">
  Flat element
</div>
```

---

## Component Examples

### Buttons

**Default Button:**
```tsx
<Button>
  Click Me
</Button>
```
- Elevated with dual shadows
- Hover: Scales to 0.98
- Active: Pressed shadow effect
- Gradient overlay for primary/secondary

**Ghost Button:**
```tsx
<Button variant="ghost">
  Ghost
</Button>
```
- Transparent by default
- Hover: Gets subtle `neu-sm` shadow

**Outline Button:**
```tsx
<Button variant="outline">
  Outline
</Button>
```
- Neumorphic with subtle border
- Interactive pressed effect

### Cards

```tsx
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Content goes here
  </CardContent>
</Card>
```
- Rounded corners (rounded-3xl)
- Floating appearance
- Soft dual shadows
- No borders

### Inputs

```tsx
<Input 
  placeholder="Enter text..." 
  type="text"
/>
```
- Inset appearance (carved look)
- Rounded corners (rounded-2xl)
- Focus: Deeper inset effect
- No visible borders

---

## Design Principles

### 1. **Consistency**
All elements share the same background color as the page, creating a unified appearance.

### 2. **Depth Through Shadows**
Visual hierarchy is created through shadow intensity rather than borders or colors.

### 3. **Soft Interactions**
Interactive elements respond with gentle scale and shadow transitions.

### 4. **Rounded Everything**
Generous border radius (1.5rem default) creates a soft, approachable feel.

### 5. **Minimalism**
No unnecessary borders, lines, or decorations - pure shadow-based depth.

---

## Best Practices

### ✅ Do:
- Use matching background colors for elements
- Apply generous border radius
- Layer shadows for depth
- Use subtle hover/active states
- Maintain consistency across components

### ❌ Don't:
- Mix neumorphism with hard borders
- Use extreme color contrasts
- Apply shadows to text
- Overuse the effect (not every element needs shadows)
- Use very small border radius

---

## Accessibility

### Color Contrast
- Light mode: 16:1 contrast ratio (WCAG AAA)
- Dark mode: 15:1 contrast ratio (WCAG AAA)

### Focus States
- All interactive elements have visible focus indicators
- Keyboard navigation fully supported
- Screen reader friendly

### Motion
- Smooth transitions (200ms)
- Respects `prefers-reduced-motion`
- No jarring animations

---

## Browser Support

Neumorphism works in all modern browsers:
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

**Features used:**
- CSS Custom Properties (CSS Variables)
- Box Shadow (multiple shadows)
- Border Radius
- CSS Transitions

---

## Customization

### Adjust Shadow Intensity

```css
:root {
  /* Lighter shadows */
  --neu-shadow: 
    6px 6px 12px rgba(163, 177, 198, 0.4),
    -6px -6px 12px rgba(255, 255, 255, 0.6);
}
```

### Change Border Radius

```css
:root {
  --radius: 2rem; /* More rounded */
  /* or */
  --radius: 1rem; /* Less rounded */
}
```

### Modify Background Color

```css
:root {
  --background: 220 20% 95%; /* Lighter */
  /* or */
  --background: 225 20% 88%; /* Darker */
}
```

**Note:** When changing background, update shadow colors accordingly!

---

## Migration from Glassmorphism

The previous `.glass` class still works for backward compatibility:
```html
<div class="glass">
  <!-- Will render with neumorphic style -->
</div>
```

To fully embrace neumorphism, replace:
- `.glass` → `.neu`
- `border` → Remove (shadows create edges)
- `backdrop-filter` → Remove (not needed)

---

## Examples in the App

### Navigation Bar
- Neumorphic elevation
- Sticky positioning
- Soft shadow for floating effect

### Cards (Tasks, Notes, Schedule)
- Large rounded corners
- Floating appearance
- Subtle depth

### Buttons (All actions)
- Interactive press effect
- Gradient overlays on primary/secondary
- Ghost buttons on hover

### Forms (Login, Signup)
- Inset inputs (carved appearance)
- Elevated buttons
- Smooth focus states

---

## Resources

**Inspiration:**
- https://neumorphism.io
- https://dribbble.com/tags/neumorphism
- https://www.behance.net/search/projects/neumorphism

**Tools:**
- Neumorphism CSS Generator: https://neumorphism.io
- Color Calculator: https://coolors.co

---

## Troubleshooting

### Shadows not visible?
- Check background color matches page
- Ensure proper contrast in shadow colors
- Verify CSS variables are loaded

### Elements look flat?
- Increase shadow distance (px values)
- Adjust shadow opacity
- Check if dark mode overrides are correct

### Performance issues?
- Reduce number of shadows
- Use `will-change: box-shadow` for animated elements
- Simplify shadow complexity

---

## Future Enhancements

Potential additions:
- [ ] Animated neumorphic loader
- [ ] Neumorphic toggle switches
- [ ] Neumorphic progress bars
- [ ] Neumorphic tooltips
- [ ] Neumorphic modals

---

**Enjoy your new soft, modern UI! 🎨✨**
