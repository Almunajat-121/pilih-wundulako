# Design System & UI Architecture
**Project:** PilihPilih Wundulako
**Stack:** React, Inertia.js, Tailwind CSS

---

## 1. DESIGN SYSTEM

### Colors
The application uses the default Tailwind CSS color palette with a strong emphasis on blue for primary actions and semantic colors for statuses.

* **Primary Colors:**
  * Base: Blue-600 (`#2563eb`) - Used for primary buttons, active links, and highlights.
  * Hover: Blue-700 (`#1d4ed8`)
  * Light Backgrounds: Blue-50 (`#eff6ff`)
* **Neutral/Background Colors:**
  * Background: Gray-50 (`#f9fafb`) - Main app background.
  * Card/Surface: White (`#ffffff`) - Used for cards, modals, and tables.
  * Borders: Gray-200 (`#e5e7eb`) and Gray-300 (`#d1d5db`).
* **Text Colors:**
  * Main Text: Gray-900 (`#111827`) and Gray-800 (`#1f2937`) for headings.
  * Secondary Text: Gray-500 (`#6b7280`) for subtitles and placeholders.
* **Semantic/Status Colors (used heavily in StatusBadge):**
  * **Success/Done:** Green-600 (`#16a34a`) / Green-100 background.
  * **Warning/Not Found:** Yellow-600 (`#ca8a04`) / Yellow-100 background.
  * **Danger/Void/Refuse:** Red-600 (`#dc2626`) / Red-100 background.

### Typography
* **Font Family:** `Figtree`, sans-serif (Default Laravel 11 font stack).
* **Hierarchy:**
  * `h1` / Page Titles: `text-2xl font-bold` (24px)
  * `h2` / Card Titles: `text-xl font-bold` (20px)
  * `h3` / List Headers: `text-lg font-bold` (18px)
  * Body Text: `text-sm` (14px) and `text-base` (16px)
  * Helper Text/Badges: `text-xs` (12px)

### Core Reusable Components
* **Toast (`Toast.tsx`):** Auto-dismissing flash notifications fixed at the top right/center. Slides in, displays semantic colors based on success/error/warning, features a shrinking progress bar.
* **Empty State (`EmptyState.tsx`):** Centered visual component showing an emoji, a title, and a description when tables or lists have no data.
* **Confirm Dialog (`ConfirmDialog.tsx`):** Modal overlay with a white centered card, smooth zoom-in animation, featuring title, message, cancel, and confirm action buttons.
* **Status Badge (`StatusBadge.tsx`):** Rounded pill-shaped badges (`rounded-full`) that visually categorize citizen statuses (Belum, Sudah, Tidak Ketemu, Menolak).
* **Loading Button (`LoadingButton.tsx`):** Button that replaces text with a spinner and disables itself during form submissions.
* **Search Input (`SearchInput.tsx`):** Debounced text input with an internal search icon (emoji/SVG) and soft focus rings.
* **Pagination (`Pagination.tsx`):** Horizontal list of bordered page numbers, highlighting the active page in primary blue.
* **Stat Card (`StatCard.tsx`):** Dashboard card displaying a large metric number, a label, and an optional visual icon.
* **Progress Bar (`ProgressBar.tsx`):** Horizontal animated bar showing voting progress, filled with primary blue.

---

## 2. UI MAP (PAGE STRUCTURE & FLOW)

### A. Layouts
1. **PetugasLayout (Mobile-First):**
   - *Structure:* Top fixed header (App name + Logout), main scrollable content area, bottom fixed navigation bar (Dashboard & Profile/Settings icons). Constrained to `max-w-lg` for mobile feel on desktop.
2. **AdminLayout (Desktop):**
   - *Structure:* Left fixed sidebar (dark theme `bg-gray-900`) for navigation, top header for user info/mobile hamburger menu, main fluid content area for data tables.
3. **PublicLayout:**
   - *Structure:* Minimalist centered layout focusing entirely on the main content card.
4. **AuthLayout:**
   - *Structure:* Centered card layout on a gray background for login forms.

### B. Authentication Pages
* **Login (`/login`):**
  - *Structure:* AuthLayout.
  - *Elements:* Input fields for Username and Password, Primary Login Button.
  - *Flow:* Redirects to Admin or Petugas dashboard based on role.

### C. Admin Module Pages (Desktop UI)
* **Admin Dashboard (`/admin/dashboard`):**
  - *Structure:* AdminLayout, grid layout.
  - *Elements:* 4 Stat Cards at the top, a data table showing progress per RW, and progress bars/charts showing live candidate votes.
* **Wilayah (`/admin/wilayah`):**
  - *Structure:* AdminLayout, vertical list.
  - *Elements:* Expandable lists of RWs containing RTs, inline forms to add new areas, edit/delete action buttons triggering ConfirmDialogs.
* **Kandidat (`/admin/kandidat`):**
  - *Structure:* AdminLayout.
  - *Elements:* Filter dropdowns, paginated data table showing candidate photos and details, floating "Add" button opening a modal form.
* **Pengguna (`/admin/pengguna`):**
  - *Structure:* AdminLayout.
  - *Elements:* Data table of users, action buttons for toggle active/unlock/reset password, assign area modal.
* **Data Warga (`/admin/warga`):**
  - *Structure:* AdminLayout.
  - *Elements:* SearchInput, Status filter chips, paginated table of citizens. Highlights problematic rows (red background). Button to view KTP photo modal.
* **Audit Log (`/admin/audit`):**
  - *Structure:* AdminLayout, tabbed interface.
  - *Elements:* Tabs for "Log Suara" and "Log Status". Table showing voting history. Button to "Void" a vote triggering a modal requiring a text reason.
* **Pengaturan Voting (`/admin/voting-config`):**
  - *Structure:* AdminLayout.
  - *Elements:* Global toggle switches for Voting and Live Count. List of RTs with individual toggle buttons to open/close voting.
* **Laporan (`/admin/laporan`):**
  - *Structure:* AdminLayout.
  - *Elements:* Summary metric cards, two large prominent buttons to download Excel and PDF reports.

### D. Petugas Module Pages (Mobile UI)
* **Petugas Dashboard (`/petugas/dashboard`):**
  - *Structure:* PetugasLayout.
  - *Elements:* Welcome text, list of assigned RT cards. Each card shows active/closed badge and a progress bar of voted citizens.
  - *Flow:* Clicking an RT card opens the Warga List.
* **Daftar Warga (`/petugas/wilayah/{rt}`):**
  - *Structure:* PetugasLayout.
  - *Elements:* SearchInput at top, horizontal scrollable filter chips (Semua, Belum, Sudah), list of citizen cards with StatusBadges. Floating Action Button (FAB) at bottom right to add new citizen.
  - *Flow:* Clicking "Vote" on a citizen card goes to FormVote. Clicking the FAB goes to Tambah Warga.
* **Tambah Warga (`/petugas/wilayah/{rt}/warga/baru`):**
  - *Structure:* PetugasLayout.
  - *Elements:* Form with text inputs (Nama, Alamat), HTML5 camera capture button for KTP, LoadingButton for submission.
* **Form Pemilihan (`/petugas/warga/{id}/vote`):**
  - *Structure:* PetugasLayout.
  - *Elements:* Citizen info card, Verification checkbox (must be checked to proceed), Radio button lists for RT candidates and RW candidates (including "Abstain" options).
  - *Flow:* Submitting triggers the ConfirmDialog overlay showing the selected choices before finalizing.
* **Update Status Kunjungan (`/petugas/warga/{id}/status`):**
  - *Structure:* PetugasLayout.
  - *Elements:* Two large action buttons with emojis: "Tidak Ditemukan" and "Menolak". Warning banners if visit count is high.

### E. Public Module
* **Live Count (`/publik`):**
  - *Structure:* PublicLayout.
  - *Elements:* Header with auto-refresh indicator, horizontal tabs to filter by RW, animated progress bars for each candidate showing live vote percentages. Displays empty state if disabled by admin.
