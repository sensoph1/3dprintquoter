# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A React SPA for 3D printing studio cost calculation and inventory management. Calculates pricing using multiple strategies (profit margin, hourly rate, material multiplier) with features for material ledger, quote history, and inventory tracking.

## Commands

- `npm run dev` - Start Vite dev server with HMR
- `npm run build` - Build for production (outputs to dist/)
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build locally

## Tech Stack

- React 19 + Vite + Tailwind CSS
- Lucide React for icons
- localStorage for persistence (keys: `studio_db`, `studio_history`)
- Optional Supabase integration (credentials in `.env`)

## Architecture

**State Management:** App.jsx is the central state hub, using prop drilling to child components. The `saveToDisk()` function handles both setState and localStorage persistence in one call.

**Tab Structure:**
- CalculatorTab - Job pricing calculator with multi-material support
- QuoteHistoryTab - Historical quotes with edit/recall functionality
- FilamentTab - Material/spool inventory ledger
- InventoryTab - Finished products and consumables tracking
- SettingsTab - Studio config, rates, hardware fleet

**Shared Components:** ComboBox (searchable dropdown), Tooltip (positioned context help), Accordion (collapsible sections)

## Pricing Logic

Three parallel pricing strategies are calculated from a base cost:

```
baseCost = materialCost + energyCost + laborCost + extraCosts + depreciationCost
```

- **Profit Margin:** `baseCost / (1 - margin%)`
- **Hourly Rate:** `hours * hourlyRate`
- **Material Multiplier:** `baseCost * multiplier`

All prices apply configurable rounding (`ceil(price / rounding) * rounding`).

## Conventions

- Functional components with hooks
- camelCase for variables/functions, PascalCase for components
- `update()` helper functions for single-field state changes
- `window.confirm()` for destructive action confirmation
- Tailwind utilities with custom CSS classes (`.rounded-studio`, `.studio-cockpit`) in index.css
