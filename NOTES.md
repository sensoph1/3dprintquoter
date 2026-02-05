# TODO

## Needs Investigation
- [ ] Fix Quote History logic - Currently being used as a sales tracker somehow
  - Investigate current usage patterns
  - Clarify distinction between quotes (estimates) vs sales (actual transactions)
  - May need to separate into distinct features or rename for clarity

## Pending Ideas for enhancements

### Events & Sales
- [ ] Sales tracker - Log actual sales (vs quotes), see revenue per event
  - Add "Log Sale" button in Inventory tab or quick action
  - Track: item sold, quantity, price sold at, payment method, customer (optional)
  - Separate from Quote History (quotes = estimates, sales = actual transactions)
  - Daily/weekly/monthly sales summaries
  - Link sales to events for profit tracking
  - Supabase table: `sales` with date, item_id, qty, price, event_id, customer_id

- [ ] Quick POS mode - Simplified view for fast checkout at events
  - Toggle in Events tab or standalone mode
  - Grid of inventory items with big tap targets
  - Tap item → increment quantity → running total
  - Simple checkout: cash/card toggle, complete sale
  - Auto-deduct from inventory, auto-link to current event
  - Receipt view (shareable or printable)
  - Works offline, syncs when back online

- [ ] Low stock alerts - Warnings when inventory drops below threshold
  - Already have `lowStockThreshold` field on consumables
  - Add threshold field to printedParts (finished products)
  - Dashboard widget or notification badge showing low stock items
  - Optional: color-code items in inventory (red = critical, yellow = low)
  - Future: email alerts via Supabase Edge Functions

### Business Insights
- [ ] Dashboard/analytics - Total revenue, best sellers, profit margins over time
  - New Dashboard tab or section on Calculator tab
  - Cards: Total Revenue, Total Profit, Jobs This Month, Avg Margin
  - Charts: Revenue over time (line), Top sellers (bar), Profit by category (pie)
  - Date range picker: This week, This month, This year, Custom
  - Use existing history data, calculate aggregates client-side
  - Library: recharts or chart.js for visualizations

- [ ] Print failure tracking - Factor failed prints into true costs
  - Option A: Simple failure rate % per printer, auto-factor into cost calculations
  - Option B: Log individual failures with reasons (bed adhesion, jam, etc.)
  - Option C: Both - default rate + refine with actual logged failures
  - Show stats: "Bambu X1C: 3% failure rate (2/67 prints)"
  - Cost calculation: `baseCost * (1 + failureRate)`
  - Add `failureRate` field to printers in Settings
  - Optional: failure log with date, printer, material, reason, grams wasted

- [ ] Time tracking - Log actual print time vs estimated to improve quotes
  - After completing a job, prompt: "Actual print time?"
  - Compare estimated vs actual, show accuracy %
  - Over time, suggest calibration: "Your estimates are 15% low on average"
  - Per-printer time accuracy stats
  - Could integrate with OctoPrint/Bambu API for automatic tracking (advanced)

### Workflow
- [ ] Print queue - Track what's currently printing, what's queued
  - New section or tab: Print Queue
  - Add jobs from Calculator: "Add to Queue" button
  - Status: Queued → Printing → Completed/Failed
  - Drag to reorder queue
  - Assign to specific printer
  - Timer/progress indicator (manual update or API integration)
  - Mark complete → auto-log to Quote History

- [ ] Reorder suggestions - "Low on Phone Stands, event in 2 weeks"
  - Analyze: upcoming events + current inventory + historical sales
  - Suggest: "You sold 5 Phone Stands at last craft fair, you have 2 in stock"
  - Show on Dashboard or Events tab
  - Factor in print time: "Need to start printing by [date] to have ready"
  - Requires sales history per event per item

- [ ] Label/tag generator - Print price tags with QR codes
  - Select items from inventory
  - Generate printable labels: name, price, QR code (links to product info?)
  - Configurable: size (small/medium/large), info shown
  - QR could link to: product page, reorder form, or just encode price
  - Export as PDF for printing
  - Library: qrcode.react for QR, jspdf or react-to-print for PDF

### File Management
- [ ] 3D file tracker - Catalog and browse local STL/3MF files
  - User configures local folder path(s) to scan
  - Display file list with thumbnails (if possible)
  - Search/filter by filename
  - Link files to inventory items or quote history entries
  - Track file metadata: size, date modified, print count
  - Note: Browser security limits direct filesystem access
    - Option A: Desktop app (Electron) for full filesystem access
    - Option B: Manual file upload/indexing via drag-and-drop
    - Option C: Local server companion app that serves file list to web app

### Customer Features
- [ ] Customer database - Track repeat customers, custom orders
  - New Customers tab or section
  - Fields: name, email, phone, address, notes, tags
  - Link customers to orders/sales
  - View customer history: past orders, total spent, favorite items
  - Search/filter customers
  - Supabase table: `customers` with user_id foreign key

### Export/Integration
- [ ] CSV export - For taxes/accounting
  - Export buttons in relevant tabs
  - Quote History → CSV (date, item, qty, price, cost, profit)
  - Sales → CSV (for tax reporting)
  - Inventory → CSV (current stock, values)
  - Events → CSV (event, revenue, costs, profit)
  - Date range filter for exports
  - Library: papaparse or native Blob/download

- [ ] PDF invoices - Generate professional quotes
  - From Quote History or Calculator, click "Generate Invoice"
  - Template: Studio name/logo, customer info, line items, totals
  - Customizable: add terms, notes, payment info
  - Download as PDF or share link
  - Library: jspdf, react-pdf, or html2pdf
  - Store generated invoices? Or generate on-demand

### Low Priority
- [ ] Integrate Square POS for automatic sales data sync
  - OAuth2 flow for users to connect Square account
  - Sync Square catalog with app inventory
  - Pull transaction/sales history
  - Match Square transactions to printed parts
  - Needs backend (Supabase Edge Functions or serverless)
  - Docs: https://developer.squareup.com/

## Completed

### Recent
- [x] Order requests - Shareable public form for custom quote requests
  - Shareable link: `yoursite.com?request=USER_ID`
  - Public form (no login): Name, email, phone (optional), description
  - Supabase table: `quote_requests` with RLS policies
  - Requests tab to view/manage incoming requests with status updates
  - Status flow: New → Quoted → Accepted → Completed → Declined
  - Link requests to Calculator jobs (auto-updates status to "quoted")
- [x] Events tab - Track events/venues with booth fees, other costs, and profit per event
  - Link/unlink sales from Quote History to events
  - Upcoming vs past events with automatic sorting
  - Compare view for side-by-side event metrics
  - Event badges shown in Quote History
- [x] Sample data for new users - Filaments, printers, inventory, consumables, subscriptions, and quote history pre-populated
- [x] Fix tab width inconsistency - Scrollbar gutter and standardized padding across all tabs
- [x] Consistent tab layouts - Headers outside cards, matching styles

### Core Features
- [x] Job pricing calculator with three pricing strategies (profit margin, hourly rate, material multiplier)
- [x] Multi-material support per job
- [x] Quote history with edit/recall functionality
- [x] Filament/spool inventory tracking
- [x] Finished products inventory with stock quantities
- [x] Consumables tracking (magnets, boxes, bubble wrap, etc.)
- [x] Subscriptions tracking (monthly/yearly costs)
- [x] Printer fleet management with depreciation
- [x] Project categories system
- [x] Studio settings (hourly rate, labor rate, energy costs)

### UI/UX
- [x] Mobile-friendly hamburger menu and responsive layout
- [x] Renamed Materials tab to Costs for clarity
- [x] Accordion sections for organized content
- [x] Tooltips for field explanations
- [x] Consistent header styling across all tabs

### Infrastructure
- [x] Supabase authentication (optional)
- [x] Cloud data sync when logged in
- [x] localStorage persistence for offline use
- [x] Works without account (auth bypass)
