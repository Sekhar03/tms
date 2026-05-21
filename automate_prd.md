# Product Requirement Document (PRD)
## Internal Portal TMS Module: Automated Report Dispatch and Scheduler Simulator

### Document Control

| Version | Completed Date | Function Name | Review Frequency | Author Name | Process Owner | Approved By | Approval Date |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **v1.0** | 2026-05-21 | TMS Module - Automated Report Dispatch | 6 Months | Antigravity AI | Common Admin | Basudev Behera | 2026-05-21 |

---

## Table of Contents
1. [Problem Statement](#problem-statement)
2. [Objective](#objective)
3. [What We Are Looking to Solve](#what-we-are-looking-to-solve)
4. [Scope of Solution](#scope-of-solution)
5. [Value to Internal Operations](#value-to-internal-operations)
6. [Feature Flow Description](#feature-flow-description)
   - [Navigation and Access](#navigation-and-access)
   - [Email Recipient Management](#email-recipient-management)
   - [Background Dispatch Service Integration](#background-dispatch-service-integration)
   - [Scheduler Simulator Control Panel](#scheduler-simulator-control-panel)
   - [Automated Dispatch & Auto-Download Workaround Flow](#automated-dispatch--auto-download-workaround-flow)
   - [Manual Email Client Drafting Flow](#manual-email-client-drafting-flow)
7. [Acceptance Criteria](#acceptance-criteria)
8. [Conclusion](#conclusion)

---

## Problem Statement
The internal operations team regularly compiles and archives daily delivery status sheets. Manually extracting these reports from cloud storage buckets and sending them via personal email accounts to bank auditors and internal stakeholders is time-consuming and error-prone. 

To increase efficiency, operations needs a centralized dashboard to manage recipient notification lists, enable automatic background email deliveries at scheduled hours, dry-run the daily report pipeline through a visual simulation console, and download files directly from dispatch logs.

---

## Objective
The objective is to implement a responsive **Automate Mail** module (`pages/automate.html`) under the Terminal Management System (TMS). This dashboard will manage active recipient directories, support background email dispatch systems, and simulate a two-stage daily cron pipeline (report compilation at 12:00 AM, and email dispatch at 9:00 AM). 

Additionally, because standard email dispatch API integrations on basic tiers often block binary file attachments, the system will support a seamless URL-based automatic download workaround, allowing recipients to download generated reports directly from their inbox.

---

## What We Are Looking to Solve
The Automated Report Dispatch feature addresses several operational challenges:
1. **Manual Email Dispatch Overhead:** Automating the delivery of report data to configured bank and operations teams without requiring manual email drafting.
2. **Lack of Pipeline Visibility:** Operators cannot easily inspect scheduler operations (compiling data, archiving to cloud storage, triggering email queues). The simulator provides a step-by-step visual queue.
3. **Email Attachment Barriers on Standard API Tiers:** Free/basic email transmission channels restrict direct file attachments. We resolve this by embedding report data inline and providing a parameter-driven direct download link.
4. **Manual Recipient Lists:** Operations needs a local persistent checklist to add, review, and delete active emails.

---

## Scope of Solution
* **Active Recipient Manager:** A simple interface to add, validate (by syntax), and delete recipient email addresses, persisted locally.
* **Dual-Provider Background Integration:** Configurable switch to enable automatic background mailings using either:
  - *Token-Based API Service:* Uses a single authentication token to route automated alerts to a pre-defined mailbox.
  - *Template-Based API Service:* Links template variables to dispatch personalized reports to multiple mail accounts.
* **Scheduler Simulator & Visual Logs:** A real-time timeline visualizer showing compilation, storage archive uploads, recipient resolution, and dispatch success. A logging terminal outputs verbose logs.
* **Auto-Download System (Free-Tier Workaround):** 
  - Embeds the CSV data directly inside the email body.
  - Includes a unique page link in the email that, when clicked, triggers an instant browser download of the CSV report.

---

## Value to Internal Operations
* **Operational Autonomy:** Reports compile and dispatch autonomously without operational intervention.
* **End-to-End Inspection:** The simulator allows auditing execution logs and output reports locally before scheduled execution.
* **Bypassing Paid Service Barriers:** The portal enables zero-cost report distribution with actual file downloads, bypassing paid attachment paywalls.

---

## Feature Flow Description

### Navigation and Access
* Authenticated admin users navigate to the **TMS** dashboard (`pages/tms.html`).
* Clicking the **Automate Mail** card redirects the user to the configuration panel (`pages/automate.html`).

### Email Recipient Management
* The **Email Recipients** card displays a form with a text input (`#emailInput`) and an "Add Recipient" button.
* On submission:
  - The input is validated against standard email regex format (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`).
  - Duplicate email checks are performed.
  - Valid emails are appended to local storage and rendered as interactive chips with removal buttons (`.email-remove-btn`).
  - Actions (add/remove) append timestamps to the terminal logs.

### Background Dispatch Service Integration
* The **Email Service Integration** card contains an ON/OFF toggle switch (`#enableRealEmails`).
* If toggled ON:
  - Users select the integration method from a dropdown: *Simple Token-Based* or *Advanced Template-Based*.
  - *Simple Token-Based* reveals a single credential input field (Key/Token).
  - *Advanced Template-Based* reveals Public Key, Service ID, and Template ID fields.
  - Clicking "Save Configuration" commits the settings to persistent local storage.

### Scheduler Simulator Control Panel
* The right-hand column features a **Scheduler Simulator** containing:
  1. **Timeline:** Visual stages that highlight in sequence:
     - *Generate Delivery Report* (Compiles local dispatch and audit records).
     - *Save Report to Bucket* (Archives report to cloud storage).
     - *Extract File & Resolve Emails* (Checks active notifications).
     - *Dispatch Automated Mail* (Triggers background email transfer).
  2. **Trigger Button:** Initiates the simulation flow, turning steps to "Active" and "Completed" over timed delays.
  3. **Terminal Console:** Renders raw execution rows containing timestamped logs tagged with `[SYSTEM]`, `[STORAGE]`, `[EMAIL]`, or `[SUCCESS]`.
  4. **Email Inbox Modal:** Opens upon completion of the dispatch stage to simulate the received email.

### Automated Dispatch & Auto-Download Workaround Flow
If background integration is enabled:
1. The simulator compiles the report into CSV format.
2. It fetches the host URL path and appends a query parameter: `?download=firstbank-YYYY-MM-DD`.
3. It builds the email message body containing:
   - Archive cloud storage bucket URL.
   - Inline report data printed as a formatted text block.
   - A direct download hyperlink containing the query parameter.
4. The message payload is sent to the selected background dispatch endpoint.
5. On success, the simulator triggers a browser download of the report and opens the incoming email simulation modal.
6. When the recipient receives the email and clicks the **Direct Download Link**:
   - The browser opens the dashboard.
   - On load, the page parses the query string for `download`.
   - The dashboard automatically triggers a local download of the CSV report file (`firstbank-YYYY-MM-DD.csv`).

### Manual Email Client Drafting Flow
If background integration is disabled:
1. Upon completing the simulation timeline, the simulator opens the incoming email simulation modal.
2. The modal features a **Draft Real Email** button.
3. Clicking this button compiles the recipient list, subject line, and the formatted body (containing the inline CSV data and direct download URL).
4. The system launches the user's default local mail client (`mailto:`) with all parameters pre-populated, allowing them to send the email with one click.

---

## Acceptance Criteria

### 1. Recipient Manager
* [ ] The email input rejects invalid syntax formats, displaying red invalid indicators.
* [ ] The email list renders chips dynamically from local storage.
* [ ] Clicking the "X" button on any chip removes it from local storage with a fade transition.

### 2. Provider Options & Settings
* [ ] Toggle switch successfully hides or shows the integration settings.
* [ ] Dropdown selection toggles the display between Token-Based and Template-Based input fields.
* [ ] "Save Configuration" persists entries in local storage and logs configuration updates to the terminal.

### 3. Simulation Timeline
* [ ] Clicking "Trigger Simulation Flow" disables the button and steps through the timeline stages sequentially.
* [ ] Active stages exhibit a pulsing animation, and completed stages show a checkmark status.
* [ ] Logging terminal outputs correct tags (`[SYSTEM]`, `[STORAGE]`, `[EMAIL]`, `[SUCCESS]`) corresponding to each step.

### 4. Background Email Dispatch
* [ ] Background dispatch sends the message payload to the configured API endpoint.
* [ ] The email subject line dynamically reflects the execution date.
* [ ] The email body contains the inline CSV block and the URL containing `?download=firstbank-YYYY-MM-DD`.

### 5. Auto-Download Workaround
* [ ] Launching the portal URL with `?download=firstbank-YYYY-MM-DD` parses the date successfully.
* [ ] The page initiates an automatic CSV download of `firstbank-YYYY-MM-DD.csv` within 1 second of loading.
* [ ] Auto-download events are appended to the system log terminal.

### 6. Manual Draft Fallback
* [ ] Clicking "Draft Real Email" launches the system mail client.
* [ ] Pre-populated body contains the inline CSV block and the direct download URL.

---

## Conclusion
The automated report dispatch and scheduler simulator module provides a self-contained environment to test and manage daily report flows. By leveraging dynamic query parameter intercepts, it provides automated report deliveries and file downloads, bypassing paid binary attachment limitations of standard APIs. This guarantees that audit sheets reach recipient inboxes reliably and at no operational cost.
