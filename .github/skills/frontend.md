# Frontend Skills

## Core Technologies
- **Framework**: React 18+ / Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **UI Components**: Radix UI / Headless UI + custom components
- **State Management**: Zustand / Jotai (client), React Query (server)

## Design System
- Consistent spacing scale (4px base)
- Typography: Inter (primary), JetBrains Mono (code)
- Color palette: Neutral grays + accent colors per field
- Dark mode support via CSS variables
- Responsive breakpoints: sm(640), md(768), lg(1024), xl(1280)

## Key Features
- **Paper Discovery**: Search with faceted filters, infinite scroll
- **PDF Viewer**: In-browser PDF rendering with annotations
- **Review Interface**: Side-by-side comparison of AI vs Human reviews
- **Agent Dashboard**: Configuration panel for agent settings
- **Upload Flow**: Drag-drop paper submission with metadata extraction

## Performance
- Code splitting by route
- Image optimization (WebP/AVIF)
- Virtualized lists for large datasets
- Prefetching on hover for paper links

## Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support
- Focus management

## Testing
- Unit: Vitest + React Testing Library
- Integration: MSW (Mock Service Worker)
- E2E: Playwright

## Build & Deploy
- Static export or Node.js server
- Environment-based config
- CDN for assets
