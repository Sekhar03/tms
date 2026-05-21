# Product Requirement Document (PRD)
## Internal Portal TMS Module: Report Management, Automation, and Dispatch Suite

### Document Control

| Version | Completed Date | Function Name | Review Frequency | Author Name | Process Owner | Approved By | Approval Date |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **v3.0** | 2026-05-21 | TMS Module - Report Upload, Generation & Dispatch Suite | 6 Months | Antigravity AI | Common Admin | Basudev Behera | 2026-05-21 |

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
   - [Select Bank and Report Type Form (Reports Screen)](#select-bank-and-report-type-form-reports-screen)
   - [Dynamic UI Adaptation (Reports Screen)](#dynamic-ui-adaptation-reports-screen)
   - [File Selection & Validation Rules (Reports Screen)](#file-selection--validation-rules-reports-screen)
   - [Form Submission & Custom Validations (Reports Screen)](#form-submission--custom-validations-reports-screen)
   - [Success Modal Popup & Redirection Logic (Reports Screen)](#success-modal-popup--redirection-logic-reports-screen)
   - [Secure Cloud Storage Bucket Integration (Reports Screen)](#secure-cloud-storage-bucket-integration-reports-screen)
   - [Dynamic Sample Template Download (Reports Screen)](#dynamic-sample-template-download-reports-screen)
   - [Email Recipient Management (Automate Screen)](#email-recipient-management-automate-screen)
   - [Background Dispatch Service Integration (Automate Screen)](#background-dispatch-service-integration-automate-screen)
   - [Scheduler Simulator Control Panel (Automate Screen)](#scheduler-simulator-control-panel-automate-screen)
   - [Automated Dispatch & Auto-Download Workaround Flow (Automate Screen)](#automated-dispatch--auto-download-workaround-flow-automate-screen)
   - [Manual Email Client Drafting Flow (Automate Screen)](#manual-email-client-drafting-flow-automate-screen)
8. [Acceptance Criteria](#acceptance-criteria)
9. [Conclusion](#conclusion)

---

## Problem Statement
The internal operations and administrative teams manage logistics, delivery statuses, terminal rollouts, and merchant onboarding validations across various partner banks. Currently, terminal dispatches, courier tracking, and merchant denials are handled via disjointed processes. Without centralized tools, operations teams must manually coordinate reports, track uploads, map files to cloud storage locations, and manually email reports to bank auditors and stakeholders.

This leads to operational inefficiencies, a lack of standardized file format checks, delays in dispatching terminal items, and manual communication bottlenecks. An automated, dynamically adapting reports portal and background mailing scheduler are required to centralize upload validations, cloud mapping, and report deliveries.

---

## Objective
The goal is to implement a unified, responsive Report Management, Automation, and Dispatch Suite under the Terminal Management System (TMS) module. The suite consists of two integrated components:
1. **Reports Portal (`pages/reports.html`):** Supports multiple banking partners and report categories, automatically adjusting UI parameters and generating cloud storage target paths based on bank selection.
2. **Automate Mail Portal (`pages/automate.html`):** Manages active notification recipient directories, configures background email dispatch credentials, and dry-runs the compilation and dispatch pipelines using a visual simulation console.

Additionally, because standard email dispatch API integrations on basic tiers restrict binary file attachments, the system supports a seamless URL-based automatic download workaround, allowing recipients to download generated reports directly from their inbox.

---

## What We Are Looking to Solve
The TMS Module Report & Automation suite addresses several operational challenges:

1. **Disjointed Upload Workflows:** Centralizing the upload of Merchant Denied Reports, Delivery Reports, and Indent Requests in a single responsive form container.
2. **Lack of Dynamic Context:** The UI dynamically adapts titles, instructions, upload requirements, and buttons so operators do not upload the wrong file type for a selected report.
3. **Manual Cloud Storage Mappings:** Operations staff struggle to match upload batches to the correct cloud bucket paths. The system automatically maps and generates paths based on bank slug and timestamps.
4. **Lack of Clipboard Copy Capabilities:** Operators copy cloud bucket paths manually, which is error-prone. Simple one-click clipboard copying is required.
5. **No Redirection Visual Cues:** Transitioning from a successful upload back to the TMS menu should be smooth and automated using custom countdown timers.
6. **Manual Email Dispatch Overhead:** Automating the delivery of report data to configured bank and operations teams without requiring manual email drafting.
7. **Lack of Pipeline Visibility:** Operators cannot easily inspect scheduler operations (compiling data, archiving to cloud storage, triggering email queues). The simulator provides a step-by-step visual queue.
8. **Email Attachment Barriers on Standard API Tiers:** Free/basic email transmission channels restrict direct file attachments. We resolve this by embedding report data inline and providing a parameter-driven direct download link.
9. **Manual Recipient Lists:** Operations needs a local persistent checklist to add, review, and delete active email addresses.

---

## Scope of Solution

### Reports Component (`pages/reports.html`)
* **Dynamic Multi-Report Form:** A single, clean upload form that alters behavior depending on the selected report type: *Merchant Denied Report*, *Indent Path*, and *Delivery Report*.
* **Validation & Constraints:** Enforces file formats (.xls, .xlsx, .csv) and size checks (maximum 10 MB).
* **Cloud Storage Path Generation Engine:** Dynamically formulates and displays target cloud bucket paths for Indent generation.
* **Animated Feedback Overlay:** A blurred success modal that shows confirmation messages, copy buttons, direct console redirection links, and a countdown timer.
* **Sample Excel Sheet Repository:** Dynamically serves appropriate headers and pre-filled structures based on the selected report type.

### Automation Component (`pages/automate.html`)
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
* **Reduced Manual Errors:** Dynamic notes and layout changes prevent operators from submitting the wrong report template.
* **Automated Cloud Directory Mapping:** Automated bucket path mapping minimizes file misplacements in cloud storage.
* **Operational Autonomy:** Reports compile and dispatch automatically without operational intervention.
* **Bypassing Paid Service Barriers:** The portal enables zero-cost report distribution with actual file downloads, bypassing paid attachment paywalls.

---

## Value to Bank Partners
* **Prompt Terminal Rollouts:** Automated indent paths ensure device delivery orders are created and uploaded to courier logs quickly.
* **Accurate Delivery Audits:** Reliable log collection enables tracking transit statuses for terminal dispatches transparently.
* **Direct Access to Reports:** Automated background emails deliver logs and clickable download links directly to stakeholders' inboxes.

---

## Feature Flow Description

### Navigation and Access
* Authorized internal portal administrators log in and land on the **Dashboard** (`index.html`).
* Clicking the **TMS** link in the sidebar navigates to the TMS Dashboard (`pages/tms.html`).
* Selecting the **REPORTS** module card redirects the user to the report management screen (`pages/reports.html`).
* Selecting the **AUTOMATE** module card redirects the user to the automated dispatch configuration screen (`pages/automate.html`).

### Select Bank and Report Type Form (Reports Screen)
The reports page presents a form (`#tmsInventoryForm`) with three primary input widgets:
1. **Select Bank Code (Dropdown):** Mandatory. Options include:
   - `HDFC Bank`, `ICICI Bank`, `Axis Bank`, `SBI`, `Yes Bank`, `Kotak Bank`.
2. **Select Report Type (Dropdown):** Mandatory. Options include:
   - `Merchant Denied Report` (default), `Indent Path`, `Delivery Report`.
3. **Upload Block:** File input component (`#fileInput`) triggered by a custom **Browse** button.

### Dynamic UI Adaptation (Reports Screen)
The interface adjusts in real-time when the **Select Report Type** dropdown is modified:
* **Merchant Denied Report:**
  - Card Header Title: `Merchant Denied Report Upload`
  - Red Note Text: `Note : File should contain merchant denied data only`
  - File Upload Block: **Visible** (mandatory)
  - Submit Button Label: `Upload`
* **Delivery Report:**
  - Card Header Title: `Delivery Report Upload`
  - Red Note Text: `Note : File should contain delivery report records only`
  - File Upload Block: **Visible** (mandatory)
  - Submit Button Label: `Upload`
* **Indent Path:**
  - Card Header Title: `Indent Path Submission`
  - Red Note Text: `Submit request to generate indent path records`
  - File Upload Block: **Hidden** (not required for request submission)
  - Submit Button Label: `Submit`

### File Selection & Validation Rules (Reports Screen)
For uploads (*Merchant Denied Report* and *Delivery Report*):
* Selecting the custom **Browse** button triggers the hidden native file input.
* Allowed file extensions: `.xls`, `.xlsx`, `.csv` (checked case-insensitively).
* Maximum file size limit: **10 MB** (10,485,760 bytes).
* If validation fails, an error message appears, and the file value is reset and cleared.
* If validation passes, the filename is written into the `#fileNameDisplay` read-only field.

### Form Submission & Custom Validations (Reports Screen)
On submitting `#tmsInventoryForm`:
* The standard browser default validations are bypassed to implement custom styling and error messaging.
* **Field Checks:**
  - If no Bank is selected, the Select Bank Code border highlights in red (`is-invalid`).
  - If no Report Type is selected, the Select Report Type border highlights in red (`is-invalid`).
  - For *Merchant Denied Report* and *Delivery Report*, if no valid file has been selected, an error message (`File is required. Please browse and select a file.`) is revealed.
  - For *Indent Path*, the file requirement is ignored.

### Success Modal Popup & Redirection Logic (Reports Screen)
Upon passing all validations, a modal overlay (`#successModalOverlay`) is rendered as a flex container over the page, styled with a blur backdrop filter (`backdrop-filter: blur(4px)`).
* It displays an emerald green circular check icon, a "Success" title, and a customized message:
  - *Merchant Denied Report*: `Merchant denied report uploaded successfully`
  - *Delivery Report*: `Delivery report uploaded successfully`
  - *Indent Path*: `Indent path report generated successfully`
* The modal includes an **Okay** button to immediately redirect back to `tms.html`.
* **Auto-Redirect Timer:**
  - For *Indent Path*: The user is automatically redirected to `tms.html` after **8 seconds**.
  - For *Merchant Denied Report* & *Delivery Report*: The user is automatically redirected to `tms.html` after **3 seconds**.
  - Clicking **Okay** clears the timer and redirects instantly.

### Secure Cloud Storage Bucket Integration (Reports Screen)
*Only applicable when the report type is **Indent Path**.*
The success modal generates and presents a dedicated cloud storage bucket panel containing:
1. **Bucket Path (Read-only Code Block):**
   - Format: `gs://tms-indent-bucket/uploads/<bank_slug>/indent_path/<timestamp>/<filename>`
   - `<bank_slug>`: The selected bank code converted to lowercase with spaces replaced by underscores (e.g., `HDFC Bank` -> `hdfc_bank`).
   - `<timestamp>`: Date format `YYYYMMDD` formatted based on the execution date.
   - `<filename>`: The name of the uploaded file if present, otherwise defaults to `indent_path_records.xlsx`.
2. **Copy Button:**
   - Tapping the clipboard icon copies the bucket string to the device clipboard.
   - On success, the icon toggles to a checkmark for 2 seconds before reverting back.
3. **Go to Bucket Button:**
   - An external anchor link that opens the Cloud Console storage browser in a new tab:
   - Format: `https://console.cloud.google.com/storage/browser/tms-indent-bucket/uploads/<bank_slug>/indent_path/<timestamp>`

### Dynamic Sample Template Download (Reports Screen)
Clicking the **Download Sample Excel Sheet** button fetches a dynamically built CSV template based on the current selection:
* **Merchant Denied Report:**
  - Filename: `merchant_denied_sample.xlsx`
  - Headers: `Merchant ID,Merchant Name,Bank,Denial Reason,Denied Date,Status`
* **Delivery Report:**
  - Filename: `delivery_report_sample.xlsx`
  - Headers: `Delivery ID,Order ID,Bank,Courier Partner,AWB Number,Delivery Status,Estimated Delivery`
* **Indent Path:**
  - Filename: `indent_path_sample.xlsx`
  - Headers: `Indent ID,Bank,Device Type,Path Code,Terminal ID,Dispatch Date`

#### Email Recipient Management (Automate Screen)
* The **Email Recipients** card displays a form with a text input (`#emailInput`), a bank selector dropdown (`#emailBankSelect`), and an "Add Recipient" button.
* On submission:
  - The input is validated against standard email regex format.
  - Duplicate email checks are performed per email and bank code pair.
  - Valid recipients are appended to the directory list, automatically synchronizing with the Vercel serverless backend if available.
  - Recipients are rendered as interactive chips with color-coded badges matching the bank's brand (e.g. green for "All Banks", blue for "HDFC Bank", red for "SBI", purple for "Kotak Bank"), containing a delete button (`.email-remove-btn`).
  - Actions (add/remove) synchronize dynamically with the backend API `/api/emails` (using POST/DELETE requests) and write logs to the console terminal.

### Background Dispatch Service Integration (Automate Screen)
* The **Email Service Integration** card contains an ON/OFF toggle switch (`#enableRealEmails`).
* If toggled ON:
  - Users select the integration method from a dropdown: *Web3Forms* or *EmailJS*.
  - *Web3Forms* reveals a single credential input field (Access Key).
  - *EmailJS* reveals Public Key, Service ID, and Template ID fields.
  - Clicking "Save Configuration" commits the settings to persistent local storage.
  - Automatic mailing credentials and settings are synchronized and secured by routing through the serverless backend function during simulation runs.

### Scheduler Simulator Control Panel (Automate Screen)
* The right-hand column features a **Scheduler Simulator** containing:
  1. **Timeline:** Visual stages that highlight in sequence:
     - *Generate Delivery Report* (Compiles daily records bank-wise).
     - *Save Report to Bucket* (Archives compiled reports to cloud storage bucket `tms-delivery-bucket` with bank-specific filenames).
     - *Extract File & Resolve Emails* (Extracts reports and maps recipients: direct bank mappings + "All Banks").
     - *Dispatch Automated Mail* (Sends emails to resolved recipients).
  2. **Trigger Button:** Initiates the simulation flow, sending a POST request containing configured recipients and keys to the Vercel serverless `/api/simulate` endpoint.
  3. **Terminal Console:** Renders raw execution rows containing timestamped logs. It progressively pulls and prints logs from the server response (or falls back to client execution logs) over a premium 9.5-second ticking sequence to preserve the simulated scheduler timeline.
  4. **Email Inbox Modal:** Opens upon completion of the dispatch stage to simulate the received email. Contains dynamic tabbed navigation buttons (`#emailModalTabs`) if multiple bank dispatches are generated. Clicking tabs dynamically updates preview headers and bodies.

### Automated Dispatch & Auto-Download Workaround Flow (Automate Screen)
If background integration is enabled:
1. The Vercel serverless function (`api/simulate.js`) or client-side fallback compiles separate reports in CSV format per active bank.
2. It generates direct download URLs containing bank slugs and date parameters (e.g. `?download=hdfc_bank-YYYY-MM-DD`).
3. It builds the email message body containing:
   - Google Cloud Storage archive paths.
   - Inline report data printed as a formatted text block.
   - A direct download hyperlink containing the parameter.
4. The message payload is sent directly from the serverless backend (bypassing browser CORS restrictions and protecting access keys) to the selected background dispatch endpoint.
5. On success, the simulator triggers a browser download of the primary report and opens the incoming email simulation modal.
6. When the recipient clicks the **Direct Download Link** in their email:
   - The browser opens the dashboard.
   - On load, the page parses the query string for `download`.
   - The dashboard automatically resolves the bank slug and triggers a local download of the CSV report file (`hdfc_bank-YYYY-MM-DD.csv`).

### Manual Email Client Drafting Flow (Automate Screen)
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
* [ ] The reports form is accessible at `pages/reports.html` and links back to `tms.html` via the back button in the header bar.
* [ ] The automation portal is accessible at `pages/automate.html` and links back to `tms.html` via the back button in the header bar.
* [ ] The sidebar highlights "TMS" as the active menu item when accessing the reports or automation screens.

### 2. Reports Portal Form validations
* [ ] Form rejects files with extensions other than `.xls`, `.xlsx`, and `.csv`.
* [ ] Form rejects files larger than 10 MB and resets the field.
* [ ] Form submission is prevented if Bank Code or Report Type is not selected, showing red invalid styles.
* [ ] Form submission is allowed **without** a file selection when Indent Path is selected.

### 3. Success Modal & Cloud Buckets
* [ ] Form submission triggers a full-page backdrop blur modal showing an emerald circle checkmark.
* [ ] The Cloud Bucket Path is displayed in a styled container only when Indent Path is submitted.
* [ ] The Cloud Bucket URL matches the structure: `gs://tms-indent-bucket/uploads/<bank_slug>/indent_path/<timestamp>/<filename>`.
* [ ] Copy Button copies the bucket URL string to the clipboard and displays a clipboard-check visual cue for 2 seconds.
* [ ] Go to Bucket button opens the correct Cloud Console browser URL in a new tab.

#### 4. Recipient Manager
* [ ] The email input rejects invalid syntax formats, displaying red invalid indicators.
* [ ] The recipient directory supports associating each email with a specific bank or "All Banks" via a dropdown.
* [ ] The recipient list renders chips color-coded according to the selected bank badge.
* [ ] Adding or removing a recipient triggers immediate POST/DELETE synchronization with the backend API `/api/emails` (falling back to localStorage if offline).
* [ ] Clicking the "X" button on any chip removes it with a fade transition.

### 5. Provider Options & Settings
* [ ] Toggle switch successfully hides or shows the integration settings.
* [ ] Dropdown selection toggles the display between Web3Forms and EmailJS input fields.
* [ ] "Save Configuration" persists entries in local storage and logs configuration updates to the terminal.

### 6. Simulation Timeline & Background Email Dispatch
* [ ] Clicking "Trigger Simulation Flow" disables the button, calls the Vercel backend `/api/simulate` serverless function, and plays the timeline steps sequentially over a 9.5-second sequence.
* [ ] Active stages exhibit a pulsing animation, and completed stages show a checkmark status.
* [ ] Email inbox modal opens on completion and renders dynamic nav tabs for each compiled bank.
* [ ] Background dispatch sends the message payload (subject, message body containing the inline CSV block and the parameter-driven direct download URL) via the serverless function to the configured API endpoint.

### 7. Auto-Download Workaround
* [ ] Launching the portal URL with `?download=hdfc_bank-YYYY-MM-DD` parses the bank slug and date successfully.
* [ ] The page initiates an automatic CSV download of `hdfc_bank-YYYY-MM-DD.csv` within 1 second of loading.
* [ ] Auto-download events are appended to the system log terminal.

### 8. Manual Draft Fallback
* [ ] Clicking "Draft Real Email" on a specific bank tab in the inbox modal launches the system mail client.
* [ ] Pre-populated body contains the inline CSV block and the direct download URL for that specific bank's recipients.

### 9. Vercel Backend & Offline Fallbacks
* [ ] Serverless endpoints in `/api` successfully handle requests.
* [ ] The application remains fully functional in client-only fallback mode if `/api/*` endpoints are timed out or unreachable.

---

## Conclusion
The Reports Management, Automation, and Dispatch Suite of the Terminal Management System (TMS) provides administrators and operations teams with a robust, automated workflow for managing bank-specific records and rollout assets. By utilizing client-side validation, context-sensitive layout adjustments, automatic cloud-bucket path calculations, and clipboard copy facilities, the portal reduces manual data entry errors. The integrated automation simulator and auto-download workaround ensure that report spreadsheets reach recipient inboxes reliably and at no operational cost, bypassing subscription-based file attachment limitations.
