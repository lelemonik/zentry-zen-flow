import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Color Palette Preview Component
 * Displays the new pastel color palette for reference
 * Can be added to Settings or Dashboard for quick reference
 */
export function ColorPalettePreview() {
  const colors = [
    { name: 'Pastel Pink', hex: '#D6B1BB', hsl: '349 42% 77%', class: 'bg-pastel-pink' },
    { name: 'Pastel Blue', hex: '#CDDBE7', hsl: '197 44% 81%', class: 'bg-pastel-blue' },
    { name: 'Pastel Teal', hex: '#9EBDBE', hsl: '180 24% 67%', class: 'bg-pastel-teal' },
    { name: 'Pastel Yellow', hex: '#E0DABA', hsl: '48 43% 83%', class: 'bg-pastel-yellow' },
    { name: 'Pastel Purple', hex: '#C6C5DD', hsl: '243 27% 81%', class: 'bg-pastel-purple' },
    { name: 'Pastel Steel', hex: '#9CABC8', hsl: '211 29% 69%', class: 'bg-pastel-steel' },
  ];

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="text-lg">🎨 Color Palette</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-xs text-muted-foreground mb-4">
          Movie & song inspired pastel colors
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {colors.map((color) => (
            <div key={color.hex} className="space-y-2">
              <div
                className={`${color.class} h-16 rounded-xl border-2 border-border shadow-sm`}
                title={color.name}
              />
              <div className="text-xs space-y-0.5">
                <div className="font-medium">{color.name}</div>
                <div className="text-muted-foreground font-mono">{color.hex}</div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-4 italic">
          These colors are available throughout the app for consistent theming
        </p>
      </CardContent>
    </Card>
  );
}
