# Product Management Admin Dashboard

A fully responsive, feature-rich SaaS-style Product Management Admin Dashboard built using React 18, TypeScript, Vite, and Zustand, styled with TailwindCSS. It fetches from the DummyJSON API and implements client-side state overlays for mock live updates, product visibilities, and custom columns preferences.

## Tech Stack

- **Core**: React 18 (Functional Components, Hooks)
- **Language**: TypeScript (Strong typings)
- **Bundler/Build**: Vite
- **Styling**: TailwindCSS (Utility-first responsive styles)
- **Routing**: React Router DOM v6 (Lazy loaded views, Protected routes)
- **State Management**: Zustand v4 (Persisted client-side preferences)
- **Visualizations**: Recharts (Responsive bar and pie graphs)
- **API client**: Axios

---

## Getting Started

### 1. Installation
Install project dependencies:
```bash
npm install
```

### 2. Running Locally
Launch the Vite development server:
```bash
npm run dev
```

### 3. Production Compilation
Verify TypeScript and compile static assets to `/dist`:
```bash
npm run build
```

---

## App Features List

### 1. Fake Dual-Role Authentication
- Single-click authentication triggers for both `user` and `admin` accounts.
- Persistent session storage in `localStorage`.
- Automatic routing redirects and query persistence upon logins.

### 2. Protected & Role-Based Routes
- `/login`: Public auth portal.
- `/dashboard`: Shared general metrics console.
- `/products`: Common catalog listing.
- `/products/:id`: Interactive details and carousel specs.
- `/analytics`: **Admin-Only** visual reporting.
- Standard users attempting to open `/analytics` or navigate to hidden product details are redirected back with warning toast alerts.

### 3. Advanced Catalog Filtering (Client-side)
- **Real-Time Search**: Debounced search filters matches characters case-insensitively.
- **Multi-Category Filter**: Scrollable checklist filters by matching categories simultaneously.
- **Dual Sorting**: Controls sort key (Price, Rating, Name) and toggles directions (Ascending vs Descending).
- **Pagination**: Slices products in sets of 10 items.
- **URL Synchronization**: All search keywords, categories list, sort states, and page indexes are serialized and synchronized with the browser address bar query strings using `useSearchParams`.

### 4. Custom Listing Views
- **Responsive Layouts**: Responsive table view on desktops and card listing on mobile viewports.
- **Column Selector**: Popover checklist allows toggling specific columns (`image`, `name`, `category`, `price`, `rating`, `stock`) and persists choices in `localStorage`.
- **Visibility Toggles (Admin-only)**: Admins can toggle products between published and hidden. Hidden products are filtered out for standard users.

### 5. Detailed Metrics & Charts
- KPI summaries calculating total products count, average rating values, and overall inventory value ($).
- **Bar Chart**: Total inventory values broken down by individual categories.
- **Pie Chart**: Product count distribution across category groups.

### 6. Simulated Background Feeds
- Spawns an automatic polling interval every 15 seconds.
- Modifies stock values, ratings, and prices randomly, pushing floating notifications to the toast center.
- Feeds update charts, grids, tables, and details views in real-time.

---

## Implemented Performance Optimizations

1. **Lazy Loading**: Router routes `/dashboard`, `/products`, `/products/:id`, `/analytics`, and `/404` are loaded lazily via `React.lazy` and structured with a loading spinner fallback inside `<Suspense>`.
2. **Debounced Search**: Restricts update triggers of listing searches to 300ms using a custom debouncer.
3. **React.memo**: Applied memoization structures to listing `ProductTable` and `ProductCard` items to restrict unnecessary re-renders.
4. **useMemo & useCallback**: Utilized to prevent recalculations of filtered product subsets, categories counts, and custom click handler references.
