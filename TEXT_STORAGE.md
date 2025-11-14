# Text Management System

This documents the text storage and management system for the Bandaid mobile app.

## Architecture

### Models
**`app/models/Text.ts`**
- Defines the `Text` type with all required properties
- Includes `createText()` helper function for creating new texts with defaults

### Storage Layer
**`app/services/textStorage.ts`**
- Uses AsyncStorage for local persistence
- Provides CRUD operations:
  - `getTexts()` - Load all texts
  - `saveTexts()` - Save all texts
  - `addText()` - Add a new text
  - `updateText()` - Update existing text
  - `deleteText()` - Remove a text
  - `reorderTexts()` - Change text order
  - `clearTexts()` - Clear all (for dev/testing)

### State Management
**`app/context/TextContext.tsx`**
- React Context for global text state
- Provides `useTexts()` hook for components
- Automatically loads texts on app start
- Handles all text operations with state updates

### Components
**`app/components/TextList.tsx`**
- Displays list of texts in styled cards
- Shows: title, content preview, date modified, scroll speed
- Empty state when no texts exist
- Uses gradient backgrounds on cards

**`app/components/FloatingActionButton.tsx`**
- Floating action button for adding new texts
- Positioned bottom-right
- Uses theme colors

### Home Page
**`app/home.tsx`**
- Main screen showing all texts
- Gradient title "My Texts"
- Text count display
- TextList component
- FAB for adding texts
- Currently creates sample texts (TODO: add proper text editor)

## Usage

### Getting texts in a component:
```typescript
import { useTexts } from './context/TextContext';

function MyComponent() {
  const { texts, loading, addText, updateText, deleteText } = useTexts();
  
  // Use texts, loading state, and operations
}
```

### Adding a new text:
```typescript
import { createText } from './models/Text';
import { useTexts } from './context/TextContext';

const { addText } = useTexts();

const newText = createText({
  title: 'My Title',
  content: 'My content...',
  order: texts.length,
});

await addText(newText);
```

### Updating a text:
```typescript
const { updateText } = useTexts();

await updateText(textId, {
  title: 'Updated Title',
  content: 'Updated content',
});
```

## Data Persistence

All texts are automatically saved to AsyncStorage and persist between app sessions.
- Storage key: `@bandaid_texts`
- Data format: JSON array of Text objects
- Dates are serialized as ISO strings and converted back to Date objects on load

## TODO

- [ ] Create text detail/edit screen
- [ ] Create add/edit text form
- [ ] Add swipe-to-delete functionality
- [ ] Add drag-to-reorder functionality
- [ ] Add search/filter functionality
- [ ] Add text categories/tags
