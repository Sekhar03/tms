# Product Requirement Document (PRD)
## Reports Management Module: User Flow and Operations Guide

---

## Table of Contents
1. [Objective](#objective)
2. [Operations Flow](#operations-flow)
   - [Accessing the Reports Portal](#accessing-the-reports-portal)
   - [Selecting Bank and Report Type](#selecting-bank-and-report-type)
   - [Dynamic Screen Adjustments](#dynamic-screen-adjustments)
   - [Selecting Files and Size Validations](#selecting-files-and-size-validations)
   - [Form Verification and Errors](#form-verification-and-errors)
   - [Success Screen and Automatic Return Redirects](#success-screen-and-automatic-return-redirects)
   - [Cloud Storage Organization and Path Copying](#cloud-storage-organization-and-path-copying)
   - [Downloading Sample Checklists](#downloading-sample-checklists)
3. [Business Expectations](#business-expectations)

---

## Objective
The purpose of the Reports Management Module is to provide operations teams with a single, responsive portal to upload, validate, and organize bank-specific terminal records. The screen dynamically adjusts its instructions and requirements depending on the report selected, ensuring operators upload the correct templates and automatically organize reports in cloud folders.

---

## Operations Flow

### Accessing the Reports Portal
1. The operator logs in and lands on the main dashboard.
2. The operator clicks on the **TMS** module in the sidebar, which opens the Terminal Management System dashboard.
3. The operator clicks on the **REPORTS** card to open the reports portal.

### Selecting Bank and Report Type
The reports page displays a form with three entry selections:
1. **Select Bank Code:** The operator chooses the bank from a list (e.g., `HDFC Bank`, `SBI`, `Kotak Bank`). This is required.
2. **Select Report Type:** The operator chooses which report they are uploading:
   - `Merchant Denied Report` (Default selection)
   - `Indent Path`
   - `Delivery Report`
3. **Upload File:** The operator browses their local computer files to attach a spreadsheet.

### Dynamic Screen Adjustments
To prevent operators from uploading files incorrectly, the screen adapts in real-time when the report type is changed:
* **Merchant Denied Report:**
  - Card title changes to: `Merchant Denied Report Upload`
  - Guidance text displays: `Note : File should contain merchant denied data only`
  - File upload area: **Visible and Mandatory**
  - Action button changes to: `Upload`
* **Delivery Report:**
  - Card title changes to: `Delivery Report Upload`
  - Guidance text displays: `Note : File should contain delivery report records only`
  - File upload area: **Visible and Mandatory**
  - Action button changes to: `Upload`
* **Indent Path:**
  - Card title changes to: `Indent Path Submission`
  - Guidance text displays: `Submit request to generate indent path records`
  - File upload area: **Hidden** (no file is needed to submit this request)
  - Action button changes to: `Submit`

### Selecting Files and Size Validations
For report types that require file attachments (*Merchant Denied Report* and *Delivery Report*):
1. The operator clicks the custom **Browse** button to choose a file from their local computer.
2. The system only accepts standard spreadsheet formats.
3. The system restricts file sizes to a maximum of **10 MB**.
4. If the selected file exceeds this limit or is not a spreadsheet, the system shows an error message, resets the file selector, and clears the selection.
5. If the file is valid, the system displays the name of the file next to the browse button.

### Form Verification and Errors
When the operator clicks the upload or submit button:
1. The system reviews the inputs before submitting.
2. If no bank is selected, the bank selection field is highlighted in red to show it is invalid.
3. If no report type is selected, the report type selection field is highlighted in red.
4. If a file is required but has not been attached, a message is revealed: `File is required. Please browse and select a file.`
5. If the report type is `Indent Path`, the file attachment requirement is skipped.

### Success Screen and Automatic Return Redirects
Upon successful validation and upload:
1. A full-page success screen overlay with a blurred background appears over the portal.
2. It displays a green checkmark icon, a success heading, and a description (e.g. `Merchant denied report uploaded successfully`).
3. The operator can click the **Okay** button to instantly return to the Terminal Management System dashboard.
4. If the operator does not click the button, the system automatically redirects them back to the dashboard:
   - Within **8 seconds** for `Indent Path` submissions.
   - Within **3 seconds** for `Merchant Denied` or `Delivery` reports.

### Cloud Storage Organization and Path Copying
When the operator submits an **Indent Path** request, the success screen displays a dedicated cloud storage path panel:
1. **Target Cloud Location:** Displays a clean folder path showing how the file is organized in cloud storage:
   - `Bank Name > Year > Month > Date > Filename`
   - *Example:* `HDFC > 2026 > January > 17-Jan > Indent File`
2. **Copy Button:** The operator can click a clipboard icon to copy the full cloud path location to their computer's clipboard. The icon changes to a checkmark for 2 seconds to confirm it was copied.
3. **Go to Folder Button:** A button that opens the cloud storage browser dashboard directly in a new tab, matching the specific bank and date folder.

### Downloading Sample Checklists
To ensure operators use the correct templates, they can click a **Download Sample Template** button. This downloads a template with the correct column headers based on their active report selection:
* **Merchant Denied Report:** Downloads a template with headers: `Merchant ID, Merchant Name, Bank, Denial Reason, Denied Date, Status`
* **Delivery Report:** Downloads a template with headers: `Delivery ID, Order ID, Bank, Courier Partner, AWB Number, Delivery Status, Estimated Delivery`
* **Indent Path:** Downloads a template with headers: `Indent ID, Bank, Device Type, Path Code, Terminal ID, Dispatch Date`

---

## Business Expectations

### Portal Structure
* The reports form is accessible from the main Terminal Management System menu.
* The operator can return to the dashboard easily using the back button in the header bar.

### Validation Rules
* The system actively blocks files that are too large or not standard spreadsheets.
* Verification flags clearly show empty fields in red to help the operator correct mistakes.

### Storage and Routing
* Success screens overlay correctly and blur the background to focus attention.
* Automatic countdown timers route the operator back to the main menu without manual clicks.
* The copy button correctly copies the path for easy sharing with bank audit teams.
