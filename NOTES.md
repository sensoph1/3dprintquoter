# TODO

## Pending Ideas for enhancements

### Events & Sales
- [ ] Sales tracker - Log actual sales (vs quotes), see revenue per event
- [ ] Event/venue management - Track events, booth fees, profit per event
- [ ] Quick POS mode - Simplified view for fast checkout at events
- [ ] Low stock alerts - Warnings when inventory drops below threshold

### Business Insights
- [ ] Dashboard/analytics - Total revenue, best sellers, profit margins over time
- [ ] Print failure tracking - Factor failed prints into true costs
- [ ] Time tracking - Log actual print time vs estimated to improve quotes

### Workflow
- [ ] Print queue - Track what's currently printing, what's queued
- [ ] Reorder suggestions - "Low on Phone Stands, event in 2 weeks"
- [ ] Label/tag generator - Print price tags with QR codes

### Customer Features
- [ ] Customer database - Track repeat customers, custom orders
- [ ] Order requests - Simple form for custom quote requests

### Export/Integration
- [ ] CSV export - For taxes/accounting
- [ ] PDF invoices - Generate professional quotes

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
