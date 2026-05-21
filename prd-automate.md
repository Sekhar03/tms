# Product Requirement Document (PRD)
## Automated Email Reports Module: User Flow and Operations Guide

---

## Table of Contents
1. [Objective](#objective)
2. [Operations Flow](#operations-flow)
   - [Accessing the Email Portal](#accessing-the-email-portal)
   - [Managing Recipients](#managing-recipients)
   - [Connecting the Email Delivery Service](#connecting-the-email-delivery-service)
   - [Simulating the Automated Process](#simulating-the-automated-process)
   - [Downloading Reports Directly](#downloading-reports-directly)
   - [Drafting Emails Manually](#drafting-emails-manually)
3. [Business Expectations](#business-expectations)

---

## Objective
The purpose of the Automated Email Reports Module is to allow operators to manage a list of email recipients for different banks and schedule automated deliveries. Instead of operators manually compiling data and emailing files every day, the system automatically collects uploaded files, saves them securely, and emails the download links to the designated recipients bank-by-bank.

---

## Operations Flow

### Accessing the Email Portal
1. The operator logs in and lands on the main dashboard.
2. The operator clicks on the **TMS** module in the sidebar, which opens the Terminal Management System dashboard.
3. The operator clicks on the **AUTOMATE** card to open the automated reports manager.

### Managing Recipients
1. **Adding a Recipient:**
   - The operator types a recipient's email address into the text field.
   - The operator selects which bank the recipient is associated with (e.g., `HDFC Bank`, `SBI Bank`, or `All Banks` if the recipient should get updates for every bank).
   - The operator clicks the "Add Recipient" button.
   - The system checks if the email address is correctly formatted and ensures the email is not already listed for that bank.
   - Once confirmed, the recipient is displayed as a color-coded badge (matching their bank's brand) with a small remove button.
2. **Deleting a Recipient:**
   - The operator can click the "X" on any recipient badge to remove them instantly from the list.

### Connecting the Email Delivery Service
1. The operator can toggle the automatic dispatch system **ON** or **OFF**.
2. When toggled **ON**, the operator selects their preferred email provider configuration.
3. The operator enters the connection keys/keys provided by their email provider and clicks "Save Configuration."
4. When toggled **OFF**, the system defaults to letting the operator draft emails manually.

### Simulating the Automated Process
The portal provides a visual simulator to let operators run a mock version of the automated process:
1. **The Automated Checklist (Timeline):**
   - **Step 1: Fetch & Compile Indent Files:** The system collects all indent files uploaded by operators between **12:00 PM and 11:59 PM** on the previous day.
   - **Step 2: Save Indents to Bucket:** The system organizes and stores the collected files under bank-specific, date-wise folders in cloud storage (e.g. `HDFC > 2026 > January > 17-Jan > indent_file.xlsx`).
   - **Step 3: Extract File & Resolve Emails:** At **9:00 AM** the next morning, the scheduler looks up the recipient list to determine who should receive emails for each bank.
   - **Step 4: Dispatch Automated Mail:** The system prepares and sends the emails containing the secure cloud links to the resolved recipients.
2. **Execution Logs:** As the simulation runs, a log console prints simple, readable status updates showing exactly what the scheduler is doing at each step.
3. **Inbox Simulation:** Once the simulation finishes, a mock email inbox opens. If multiple banks have dispatches, the operator can click on bank tabs to preview the exact email that will be received.

### Downloading Reports Directly
1. The automated emails contain a **Direct Download Link**.
2. When a recipient clicks this link, it opens the system dashboard and automatically starts a secure download of their bank's reports file within a few seconds, without requiring the recipient to sign in or download attachments manually.

### Drafting Emails Manually
If the automatic email delivery service is turned off, the operator can still send reports using their own email app:
1. When the simulation finishes, the operator opens the inbox preview.
2. The operator clicks the "Draft Real Email" button.
3. The system automatically launches the operator's default computer email application (such as Outlook or Mail) and pre-fills the recipients, subject line, and email body (including the direct download links).
4. The operator reviews the pre-filled email and clicks send inside their email app.

---

## Business Expectations

### Portal Navigation
* The email settings are easy to find and navigate to from the TMS menu.
* The operator can return to the main TMS screen at any time with a single click.

### Recipient List Accuracy
* The system prevents typos in email addresses by validating the input text.
* The recipient directory handles color coding cleanly so operators can see bank associations at a glance.
* Adding and removing recipients happens instantly.

### Dispatch Schedules
* The automation logs clearly show that files are gathered from the previous day's **12:00 PM to 11:59 PM** window.
* Emails are queued to send the next morning at **9:00 AM**.
* Emails contain direct, clickable storage folder links instead of attachments.
* Recipients only receive emails for their selected bank (or all banks if configured).
