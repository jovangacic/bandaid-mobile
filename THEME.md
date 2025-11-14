# Theme System

This app uses a centralized theme configuration to maintain consistent styling across all pages.

## Color Scheme

Based on Tailwind CSS colors:
- **Background**: Stone-900 (`#1c1917`)
- **Primary**: Purple-500 (`#a855f7`)
- **Accent**: Orange-400 (`#fb923c`)

## Usage

### 1. Using the Layout Component

For new pages, simply wrap your content with the `Layout` component:

```tsx
import Layout from "./components/Layout";

export default function MyNewPage() {
  return (
    <Layout>
      {/* Your page content here */}
    </Layout>
  );
}
```

The Layout component automatically applies:
- Dark background color (stone-900)
- Safe area handling
- Consistent flex structure

### 2. Using Theme Colors Directly

Import the theme object to access colors and other design tokens:

```tsx
import { StyleSheet } from 'react-native';
import theme from './theme/colors';

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
  title: {
    color: theme.colors.text,
    fontSize: 20,
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
  },
  accentText: {
    color: theme.colors.accent,
  },
});
```

## Available Theme Values

### Colors
- `theme.colors.background` - Main background (stone-900)
- `theme.colors.backgroundLight` - Lighter background (stone-800)
- `theme.colors.primary` - Purple-500
- `theme.colors.primaryDark` - Purple-700
- `theme.colors.accent` - Orange-400
- `theme.colors.text` - White
- `theme.colors.textMuted` - Gray
- `theme.colors.border` - Purple-500
- `theme.colors.black` - Black
- `theme.colors.white` - White

### Spacing
- `theme.spacing.xs` - 4
- `theme.spacing.sm` - 8
- `theme.spacing.md` - 16
- `theme.spacing.lg` - 24
- `theme.spacing.xl` - 32

### Border Radius
- `theme.borderRadius.sm` - 8
- `theme.borderRadius.md` - 10
- `theme.borderRadius.lg` - 16

## Customizing the Theme

To change colors across the entire app, edit `app/theme/colors.ts`:

```typescript
export const theme = {
  colors: {
    background: '#1c1917', // Change this to update all backgrounds
    primary: '#a855f7',    // Change this to update all primary colors
    // ... etc
  },
};
```

Changes will automatically apply to all pages using the theme.
