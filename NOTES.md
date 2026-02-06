# TODO

## Pending Ideas for enhancements

### Events & Sales
- [ ] Sales tracker - Log actual sales (vs quotes), see revenue per event
  - Add "Log Sale" button in Inventory tab or quick action
  - Track: item sold, quantity, price sold at, payment method, customer (optional)
  - Separate from Quote History (quotes = estimates, sales = actual transactions)
  - Daily/weekly/monthly sales summaries
  - Link sales to events for profit tracking
  - Supabase table: `sales` with date, item_id, qty, price, event_id, customer_id

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

### Customer Features
- [ ] Customer database - Track repeat customers, custom orders
  - New Customers tab or section
  - Fields: name, email, phone, address, notes, tags
  - Link customers to orders/sales
  - View customer history: past orders, total spent, favorite items
  - Search/filter customers
  - Supabase table: `customers` with user_id foreign key

### Export/Integration
- [ ] Square POS integration - Automatic sales data sync
  - OAuth2 flow ("Connect to Square" button)
  - Sync Square catalog with app inventory
  - Pull transaction/sales history
  - Auto-link sales to events, decrement inventory
  - Supabase Edge Functions for backend
  - Docs: https://developer.squareup.com/

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

### Supabase + Square Setup — COMPLETE

**All phases tested and working:**
- [x] Cloud data sync — `user_data` table with JSONB library/history, verified cross-session
- [x] Square OAuth — full flow: connect → authorize → callback → tokens stored
- [x] Square sync sales (pull) — tested with 3 sandbox transactions, all imported successfully
- [x] Square push inventory — pushes items to Square catalog (verified in Square dashboard)
- [x] Quote requests — public form submits, shows in Requests tab
- [x] Auth gate re-enabled, TEST_USER_ID removed, auth check restored

**Infrastructure:**
- Supabase project: `tsylcoomfgbkxvrqinnj`
- 4 edge functions deployed with `--no-verify-jwt`
- 3 migrations: `square_connections`, `quote_requests`, `user_data` (all idempotent)
- Secrets: `SQUARE_APP_ID`, `SQUARE_APP_SECRET`, `SQUARE_ENVIRONMENT=sandbox`, `APP_URL`
- Square sandbox redirect URL: `https://tsylcoomfgbkxvrqinnj.supabase.co/functions/v1/square-callback`

**Switching to Production Square (when ready):**
No code changes needed — config only:
1. `supabase secrets set SQUARE_ENVIRONMENT="production"`
2. `supabase secrets set SQUARE_APP_ID="your-production-app-id"`
3. `supabase secrets set SQUARE_APP_SECRET="your-production-secret"`
4. `supabase secrets set APP_URL="https://your-real-domain.com"`
5. Set redirect URL in Square Developer Dashboard under **Production** OAuth settings
6. Redeploy all 4 edge functions with `--no-verify-jwt`

**Still TODO (Phase 4):**
1. Implement "Update inventory quantities from Square" sync option
2. Sales tracking table
3. Customer database table
4. Webhooks for real-time Square updates
5. Add user-facing error messages for sync failures

### Low Priority
(empty for now)

### Maybe Later
- [ ] Quick POS mode - Simplified checkout view for events
  - Redundant if Square integration is implemented
  - Square handles payments better; just sync sales back to app

- [ ] 3D file tracker - Catalog and browse local STL/3MF files
  - Search/filter by filename, link files to inventory/estimates
  - Track metadata: size, date modified, print count
  - Not feasible as webapp due to browser filesystem restrictions
  - Would need Electron app or local companion server

## Completed

### Recent
- [x] Fixed Material Multiplier pricing strategy
  - Was hardcoded to multiply by 3 instead of using the multiplier field
  - Now correctly calculates: (materialCost * multiplier) / quantity
- [x] Improved Hardware Fleet section in Settings
  - Active Hardware list moved to top, shows price and lifespan in view mode
  - Add Machine form is collapsible below the list
  - Two-line add form: Machine Name + Make/Model, then Wattage/Price/Lifespan/Add
  - Removed "Online" status badge, show actual specs instead
- [x] Estimates tab (renamed from Quote History) with status workflow
  - Status flow: Draft → Quoted → Accepted → Printed → Sold → Declined
  - Only "sold" items count toward event profit calculations
  - Status badge and dropdown in table
  - Clarifies distinction between estimates and actual sales
- [x] Tightened calculator form layout
  - Project Name on own line, Category/Print Time/Quantity on same row
  - Printer/Labor/Extras on same row, pricing fields on same row
  - Removed responsive breakpoints for consistent desktop layout
- [x] Wider site layout (max-w-5xl → max-w-6xl)
- [x] Stacked +/- buttons in Inventory tab
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
