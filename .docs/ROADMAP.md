# FairTradeWorker OS: The 10x Expansion Roadmap

This roadmap outlines the transformation of "Invoice Gen" into **FairTradeWorker OS**, a comprehensive, enterprise-grade operating system for independent workers.

## **Phase 1: The Core 2.0 (Visual Identity & Architecture)**
**Goal:** Establish a premium "Operating System" feel with robust navigation and theming.

- [ ] **Advanced Theme Engine**
    - [ ] Implement `themes.css` with CSS variables for glassmorphism (`--glass-blur`, `--glass-opacity`, `--glass-border`).
    - [ ] Add noise texture overlays for "premium" feel.
    - [ ] Create presets: `Monochrome` (Pro), `Glass` (Modern), `Cyber` (Dark), `Aurora` (Colorful).
- [ ] **Navigation Overhaul**
    - [ ] **Sidebar (SideNav):** Collapsible, multi-level navigation (Finance, CRM, Productivity).
    - [ ] **Command Palette (Ctrl+K):** Global search for Clients, Invoices, and Actions.
    - [ ] **Keyboard Shortcuts:** `g i` (Go Invoice), `g c` (Go Client), `c n` (Create New).
- [ ] **Layout Architecture**
    - [ ] Refactor `App.tsx` to support a persistent Shell layout.
    - [ ] Implement "Focus Mode" toggle (hides sidebar/chrome).

## **Phase 2: Finance Engine "Deep Dive"**
**Goal:** Full-cycle financial management, not just invoice generation.

- [ ] **Advanced Invoicing**
    - [ ] **Recurring Profiles:** Auto-generate invoices on a schedule (Monthly/Weekly).
    - [ ] **Quotes/Estimates:** Create quotes and convert to invoices with one click.
    - [ ] **Multi-Currency Support:** Manual rate entry or static defaults.
- [ ] **Expense Command Center**
    - [ ] **Receipt Management:** Drag-and-drop upload zone.
    - [ ] **Expense Categories:** Tax-deductible flagging.
    - [ ] **Profit/Loss Widget:** Real-time dashboard calculation.

## **Phase 3: CRM & Relationship Intelligence**
**Goal:** Turn static contacts into a living business network.

- [ ] **Pipeline Management**
    - [ ] **Kanban Board:** Drag-and-drop leads (`New` -> `Proposal` -> `Won`).
    - [ ] **Interaction Log:** Timeline of calls, emails, and notes per client.
- [ ] **Client Portal (Static)**
    - [ ] **Portal Generator:** Generate a static HTML file for a client containing their invoice history.
    - [ ] **Payment Integration:** Embedded Stripe/PayPal links.

## **Phase 4: Productivity & Intelligence**
**Goal:** Tools for the *worker*, not just the *business*.

- [ ] **Deep Work Tools**
    - [ ] **Pomodoro Timer:** Integrated into the status bar, linked to specific tasks.
    - [ ] **Task Manager:** "Quick Add" from anywhere in the app.
- [ ] **Local Intelligence**
    - [ ] **"Ask My Data":** Chat interface to query local data (e.g., "How much did I make in Q1?").
    - [ ] **Smart Templates:** AI-generated proposal text based on client industry.

## **Phase 5: Ecosystem & Customization**
**Goal:** Infinite extensibility.

- [ ] **Plugin System:** Basic hook points for custom React components.
- [ ] **Data Sovereignty:** Full JSON export/import (already started, need refinement).
- [ ] **Self-Hosting:** Docker container for the Supabase sync engine (optional).
