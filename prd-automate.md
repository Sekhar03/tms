# Product Requirement Document (PRD)
## TMS Automate Mail Module: Recipient Directory, Scheduler Simulator, and Dispatch Suite

### Document Control

| Version | Completed Date | Function Name | Review Frequency | Author Name | Process Owner | Approved By | Approval Date |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **v3.0** | 2026-05-21 | TMS Automate Module - Recipient Management & Email Dispatch | 6 Months | Antigravity AI | Common Admin | Basudev Behera | 2026-05-21 |

---

## Table of Contents
1. [Problem Statement](#problem-statement)
2. [Objective](#objective)
3. [What We Are Looking to Solve](#what-we-are-looking-to-solve)
4. [Scope of Solution](#scope-of-solution)
5. [Value to Internal Operations](#value-to-internal-operations)
6. [Value to Bank Partners](#value-to-bank-partners)
7. [Feature Flow Description](#feature-flow-description)
   - [Navigation and Access](#navigation-and-access)
   - [Email Recipient Management](#email-recipient-management)
   - [Background Dispatch Service Integration](#background-dispatch-service-integration)
   - [Scheduler Simulator Control Panel](#scheduler-simulator-control-panel)
   - [Automated Dispatch & Auto-Download Workaround Flow](#automated-dispatch--auto-download-workaround-flow)
   - [Manual Email Client Drafting Flow](#manual-email-client-drafting-flow)
   - [Fullstack Architecture & Offline Fallbacks](#fullstack-architecture--offline-fallbacks)
8. [Acceptance Criteria](#acceptance-criteria)
9. [Conclusion](#conclusion)

---

## Problem Statement
The internal operations and administrative teams manage logistics, delivery statuses, terminal rollouts, and merchant onboarding validations across various partner banks. Without centralized tools, operations teams must manually email reports to bank auditors and stakeholders.

This leads to operational inefficiencies, delays in dispatching report links, and manual communication bottlenecks. An automated background mailing scheduler is required to resolve bank-wise recipients, fetch daily uploads, and automate dispatch processes.

---

## Objective
The goal is to implement a robust, responsive **Automate Mail Portal** (`pages/automate.html`) under the Terminal Management System (TMS) module. The portal manages active notification recipient directories, configures background email dispatch credentials, and dry-runs the compilation and dispatch pipelines using a visual simulation console.

Additionally, because standard email dispatch API integrations on basic tiers restrict binary file attachments, the system supports a seamless URL-based automatic download workaround, allowing recipients to download generated reports directly from their inbox.

---

## What We Are Looking to Solve
The Automate Mail Module addresses several operational challenges:

1. **Manual Email Dispatch Overhead:** Automating the delivery of report data to configured bank and operations teams without requiring manual email drafting.
2. **Lack of Pipeline Visibility:** Operators cannot easily inspect scheduler operations (compiling data, archiving to cloud storage, triggering email queues). The simulator provides a step-by-step visual timeline.
3. **Email Attachment Barriers on Standard API Tiers:** Free/basic email transmission channels restrict direct file attachments. We resolve this by embedding report data inline and providing a parameter-driven direct download link.
4. **Manual Recipient Lists:** Operations needs a local persistent checklist to add, review, and delete active email addresses.

---

## Scope of Solution
* **Active Recipient Directory:** An interface to add, syntax-validate, and delete recipient email addresses, persisted locally.
* **Dual-Provider Background Integration:** Configurable switch to enable automatic background mailings using either:
  - *Token-Based API Service:* Uses a single authentication token to route automated alerts to a pre-defined mailbox.
  - *Template-Based API Service:* Links template variables to dispatch personalized reports to multiple mail accounts.
* **Scheduler Simulator & Visual Logs:** A real-time timeline visualizer showing compilation, storage archive uploads, recipient resolution, and dispatch success. A logging terminal outputs verbose logs.
* **Auto-Download System (Free-Tier Workaround):** 
  - Embeds the CSV data directly inside the email body.
  - Includes a unique page link in the email that, when clicked, triggers an instant browser download of the CSV report.

---

## Value to Internal Operations
* **Operational Autonomy:** Reports compile and dispatch automatically without operational intervention.
* **Bypassing Paid Service Barriers:** The portal enables zero-cost report distribution with actual file downloads, bypassing paid attachment paywalls.
* **Local and Server Synchronization:** Recipient lists sync with the backend database or gracefully degrade to local storage if offline.

---

## Value to Bank Partners
* **Direct Access to Reports:** Automated background emails deliver logs and clickable download links directly to stakeholders' inboxes.
* **Accurate Dispatch Schedules:** Recipient lists are cleanly mapped bank-wise, ensuring stakeholders only receive relevant records.

---

## Feature Flow Description

### Navigation and Access
* Authorized internal portal administrators log in and land on the **Dashboard** (`index.html`).
* Clicking the **TMS** link in the sidebar navigates to the TMS Dashboard (`pages/tms.html`).
* Selecting the **AUTOMATE** module card redirects the user to the automated dispatch configuration screen (`pages/automate.html`).

### Email Recipient Management
* The **Email Recipients** card displays a form with a text input (`#emailInput`), a bank selector dropdown (`#emailBankSelect`), and an "Add Recipient" button.
* On submission:
  - The input is validated against standard email regex format.
  - Duplicate email checks are performed per email and bank code pair.
  - Valid recipients are appended to the directory list, automatically synchronizing with the Vercel serverless backend if available.
  - Recipients are rendered as interactive chips with color-coded badges matching the bank's brand (e.g. green for "All Banks", blue for "HDFC Bank", red for "SBI", purple for "Kotak Bank"), containing a delete button (`.email-remove-btn`).
  - Actions (add/remove) synchronize dynamically with the backend API `/api/emails` (using POST/DELETE requests) and write logs to the console terminal.

### Background Dispatch Service Integration
* The **Email Service Integration** card contains an ON/OFF toggle switch (`#enableRealEmails`).
* If toggled ON:
  - Users select the integration method from a dropdown: *Web3Forms* or *EmailJS*.
  - *Web3Forms* reveals a single credential input field (Access Key).
  - *EmailJS* reveals Public Key, Service ID, and Template ID fields.
  - Clicking "Save Configuration" commits the settings to persistent local storage.
  - Automatic mailing credentials and settings are synchronized and secured by routing through the serverless backend function during simulation runs.

### Scheduler Simulator Control Panel
* The right-hand column features a **Scheduler Simulator** containing:
  1. **Timeline:** Visual stages that highlight in sequence:
     - *Fetch & Compile Indent Files* (Fetches all daily indent files uploaded between 12:00 PM and 11:59 PM bank-wise).
     - *Save Indents to Bucket* (Saves reports to cloud storage bucket `tms-indent-bucket` under chronological folders `Bank > Year > Month > Date`).
     - *Extract File & Resolve Emails* (Triggered next day at 9:00 AM, resolving configured recipients bank-wise).
     - *Dispatch Automated Mail* (Dispatches automated emails containing the direct cloud bucket file links to resolved bank recipients).
  2. **Trigger Button:** Initiates the simulation flow, sending a POST request containing configured recipients and keys to the Vercel serverless `/api/simulate` endpoint.
  3. **Terminal Console:** Renders raw execution rows containing timestamped logs. It progressively pulls and prints logs from the server response (or falls back to client execution logs) over a premium 9.5-second ticking sequence to preserve the simulated scheduler timeline.
  4. **Email Inbox Modal:** Opens upon completion of the dispatch stage to simulate the received email. Contains dynamic tabbed navigation buttons (`#emailModalTabs`) if multiple bank dispatches are generated. Clicking tabs dynamically updates preview headers and bodies.

### Automated Dispatch & Auto-Download Workaround Flow
If background integration is enabled:
1. The Vercel serverless function (`api/simulate.js`) or client-side fallback compiles separate reports in CSV format per active bank.
2. It generates direct download URLs containing bank folders and date parameters (e.g. `?download=hdfc-YYYY-MM-DD`).
3. It builds the email message body containing:
   - Google Cloud Storage archive paths following the structure `gs://tms-indent-bucket/<Bank>/<Year>/<Month>/<Date>/<filename>`.
   - Inline report data printed as a formatted text block.
   - A direct download hyperlink containing the parameter.
4. The message payload is sent directly from the serverless backend (bypassing browser CORS restrictions and protecting access keys) to the selected background dispatch endpoint.
5. On success, the simulator triggers a browser download of the primary report and opens the incoming email simulation modal.
6. When the recipient clicks the **Direct Download Link** in their email:
   - The browser opens the dashboard.
   - On load, the page parses the query string for `download`.
   - The dashboard automatically resolves the bank slug and triggers a local download of the CSV report file (`hdfc_indent-YYYY-MM-DD.csv`).

### Manual Email Client Drafting Flow
If background integration is disabled:
1. Upon completing the simulation timeline, the simulator opens the incoming email simulation modal.
2. The modal features a **Draft Real Email** button, which dynamically acts on the currently selected bank tab.
3. Clicking this button compiles the resolved recipient list, subject line, and formatted body (containing the inline CSV data and direct download URL) for the active bank tab.
4. The system launches the user's default local mail client (`mailto:`) with all parameters pre-populated, allowing them to send the email with one click.

### Fullstack Architecture & Offline Fallbacks
* **Vercel Serverless Functions**: Located inside the `api/` folder:
  - `api/emails.js`: Manages CRUD operations on recipients in server memory (retaining state across warm starts).
  - `api/simulate.js`: Performs the compilation, bucket uploading, and background emailing workflows on the backend.
* **Graceful Degradation**: On startup, adding, or deleting recipients, the frontend queries the `/api/emails` endpoint. If the backend is offline or the dashboard is served statically, it logs the unavailability and gracefully falls back to client-only localStorage and runtime execution modes.

---

## Acceptance Criteria

### 1. Navigation & UI Structure
* [ ] The automation portal is accessible at `pages/automate.html` and links back to `tms.html` via the back button in the header bar.
* [ ] The sidebar highlights "TMS" as the active menu item when accessing the automation screen.

### 2. Recipient Manager
* [ ] The email input rejects invalid syntax formats, displaying red invalid indicators.
* [ ] The recipient directory supports associating each email with a specific bank or "All Banks" via a dropdown.
* [ ] The recipient list renders chips color-coded according to the selected bank badge.
* [ ] Adding or removing a recipient triggers immediate POST/DELETE synchronization with the backend API `/api/emails` (falling back to localStorage if offline).
* [ ] Clicking the "X" button on any chip removes it with a fade transition.

### 3. Provider Options & Settings
* [ ] Toggle switch successfully hides or shows the integration settings.
* [ ] Dropdown selection toggles the display between Web3Forms and EmailJS input fields.
* [ ] "Save Configuration" persists entries in local storage and logs configuration updates to the terminal.

### 4. Simulation Timeline & Background Email Dispatch
* [ ] Clicking "Trigger Simulation Flow" disables the button, calls the Vercel backend `/api/simulate` serverless function, and plays the timeline steps sequentially over a 9.5-second sequence.
* [ ] Active stages exhibit a pulsing animation, and completed stages show a checkmark status.
* [ ] Email inbox modal opens on completion and renders dynamic nav tabs for each compiled bank.
* [ ] Background dispatch sends the message payload (subject, message body containing the inline CSV block and the parameter-driven direct download URL) via the serverless function to the configured API endpoint.

### 5. Auto-Download Workaround
* [ ] Launching the portal URL with `?download=hdfc_bank-YYYY-MM-DD` parses the bank slug and date successfully.
* [ ] The page initiates an automatic CSV download of `hdfc_bank-YYYY-MM-DD.csv` within 1 second of loading.
* [ ] Auto-download events are appended to the system log terminal.

### 6. Manual Draft Fallback
* [ ] Clicking "Draft Real Email" on a specific bank tab in the inbox modal launches the system mail client.
* [ ] Pre-populated body contains the inline CSV block and the direct download URL for that specific bank's recipients.

### 7. Vercel Backend & Offline Fallbacks
* [ ] Serverless endpoints in `/api` successfully handle requests.
* [ ] The application remains fully functional in client-only fallback mode if `/api/*` endpoints are timed out or unreachable.

---

## Conclusion
The Automation and Dispatch Suite of the Terminal Management System (TMS) provides administrators and operations teams with a robust, automated workflow for managing bank-specific records and rollout assets. The integrated automation simulator and auto-download workaround ensure that report spreadsheets reach recipient inboxes reliably and at no operational cost, bypassing subscription-based file attachment limitations.
