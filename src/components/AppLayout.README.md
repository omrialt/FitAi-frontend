# AppLayout Component

A modern, responsive application layout built with **Mantine UI** and **Radix UI**.

## Features

- ✨ **Fixed Top Header** with app branding and user menu
- 🎨 **Collapsible Sidebar** with smooth transitions
- 📱 **Fully Responsive** - adapts to mobile, tablet, and desktop
- 🌓 **Dark/Light Mode Toggle** with smooth animations
- 🎯 **Active Navigation States** with gradient highlighting
- 📜 **Independent Scrolling** for sidebar and main content
- 🎭 **Clean Footer** with copyright information
- ⚡ **Smooth Hover Effects** throughout

## Components Used

### Mantine UI
- `AppShell` - Main layout structure
- `Header`, `Navbar`, `Footer` - Layout sections
- `Burger` - Mobile menu toggle
- `Avatar`, `ActionIcon`, `Tooltip` - UI elements
- `Text`, `Group`, `Stack` - Layout utilities
- `ScrollArea` - Custom scrollbars

### Radix UI
- `DropdownMenu` - User menu with accessibility

### Tabler Icons
- Navigation and UI icons

## Usage

```tsx
import { AppLayout } from './components/AppLayout';

function MyPage() {
  return (
    <AppLayout>
      <h1>Your Page Content Here</h1>
      {/* Your content */}
    </AppLayout>
  );
}
```

## Navigation Items

The layout includes three default navigation items:
- **Dashboard** - Overview and stats
- **AI Tools** - AI-powered features
- **Settings** - App configuration

## Customization

### Changing Navigation Items
Edit the `navigationItems` array in `AppLayout.tsx`:

```tsx
const navigationItems: NavItem[] = [
  {
    icon: <IconYourIcon size={20} stroke={1.5} />,
    label: 'Your Label',
    active: activeTab === 'Your Label',
    onClick: () => setActiveTab('Your Label'),
  },
];
```

### Theming
The component uses Mantine's color scheme system. Toggle between light/dark modes using the sun/moon icon in the header.

### Styling
Customize the appearance by editing `AppLayout.css`:
- `.nav-item` - Navigation button styles
- `.nav-item-active` - Active state with gradient
- `.dropdown-content` - User menu dropdown
- `.theme-toggle` - Dark mode toggle button

## Responsive Breakpoints

- **Mobile** (< 768px): Collapsed sidebar with burger menu
- **Tablet** (768px - 1024px): Full sidebar
- **Desktop** (> 1024px): Full sidebar with expanded content

## Color Scheme

The layout uses a modern gradient color scheme:
- Primary: Indigo to Cyan gradient
- Active states: Gradient background
- Hover effects: Subtle background changes
- Smooth transitions: 0.2s ease timing

## Example Pages

See `DashboardPage.tsx` for a complete example of using the layout with content.

## Dependencies

```json
{
  "@mantine/core": "^7.x",
  "@mantine/hooks": "^7.x",
  "@radix-ui/react-dropdown-menu": "^2.x",
  "@tabler/icons-react": "^3.x"
}
```

## License

Part of the FitAI project © 2025
