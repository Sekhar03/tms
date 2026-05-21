# Product Requirement Document (PRD)
## TMS Reports Portal Module: Upload, Validation, and Storage Suite

### Document Control

| Version | Completed Date | Function Name | Review Frequency | Author Name | Process Owner | Approved By | Approval Date |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **v3.0** | 2026-05-21 | TMS Reports Module - Upload & GCS Integration | 6 Months | Antigravity AI | Common Admin | Basudev Behera | 2026-05-21 |

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
   - [Select Bank and Report Type Form](#select-bank-and-report-type-form)
   - [Dynamic UI Adaptation](#dynamic-ui-adaptation)
   - [File Selection & Validation Rules](#file-selection--validation-rules)
   - [Form Submission & Custom Validations](#form-submission--custom-validations)
   - [Success Modal Popup & Redirection Logic](#success-modal-popup--redirection-logic)
   - [Secure Cloud Storage Bucket Integration](#secure-cloud-storage-bucket-integration)
   - [Dynamic Sample Template Download](#dynamic-sample-template-download)
8. [Acceptance Criteria](#acceptance-criteria)
9. [Conclusion](#conclusion)

---

## Problem Statement
The internal operations and administrative teams manage logistics, delivery statuses, terminal rollouts, and merchant onboarding validations across various partner banks. Currently, terminal dispatches, courier tracking, and merchant denials are handled via disjointed processes. Without centralized tools, operations teams must manually coordinate reports, track uploads, and map files to cloud storage locations.

This leads to operational inefficiencies, a lack of standardized file format checks, and manual processing bottlenecks. An automated, dynamically adapting reports portal is required to centralize upload validations and cloud bucket path mappings.

---

## Objective
The goal is to implement a responsive, user-friendly **Reports Portal** (`pages/reports.html`) under the Terminal Management System (TMS) module. The portal supports multiple banking partners and report categories, automatically adjusting UI parameters, providing downloadable Excel/CSV templates, and generating cloud storage target paths based on bank and date parameters.

---

## What We Are Looking to Solve
The Reports Portal addresses several operational challenges:

1. **Disjointed Upload Workflows:** Centralizing the upload of Merchant Denied Reports, Delivery Reports, and Indent Requests in a single responsive form container.
2. **Lack of Dynamic Context:** The UI dynamically adapts titles, instructions, upload requirements, and buttons so operators do not upload the wrong file type for a selected report.
3. **Manual Cloud Storage Mappings:** Operations staff struggle to match upload batches to the correct cloud bucket paths. The system automatically maps and generates paths based on bank selection, year, month, and date.
4. **Lack of Clipboard Copy Capabilities:** Operators copy cloud bucket paths manually, which is error-prone. Simple one-click clipboard copying is required.
5. **No Redirection Visual Cues:** Transitioning from a successful upload back to the TMS menu should be smooth and automated using custom countdown timers.

---

## Scope of Solution
* **Dynamic Multi-Report Form:** A single, clean upload form that alters behavior depending on the selected report type: *Merchant Denied Report*, *Indent Path*, and *Delivery Report*.
* **Validation & Constraints:** Enforces file formats (.xls, .xlsx, .csv) and size checks (maximum 10 MB).
* **Cloud Storage Path Generation Engine:** Dynamically formulates and displays target cloud bucket paths for Indent generation.
* **Animated Feedback Overlay:** A blurred success modal that shows confirmation messages, copy buttons, direct console redirection links, and a countdown timer.
* **Sample Excel Sheet Repository:** Dynamically serves appropriate headers and pre-filled structures based on the selected report type.

---

## Value to Internal Operations
* **Reduced Manual Errors:** Dynamic notes and layout changes prevent operators from submitting the wrong report template.
* **Automated Cloud Directory Mapping:** Automated bucket path mapping minimizes file misplacements in cloud storage.
* **Clear Feedback Loops:** Instant modal popups and automatic page routing improve operators' productivity.

---

## Value to Bank Partners
* **Prompt Terminal Rollouts:** Automated indent paths ensure device delivery orders are created and uploaded to GCS buckets cleanly.
* **Standardized Log Archival:** GCS files are mapped under organized folders making audits straightforward.

---

## Feature Flow Description

### Navigation and Access
* Authorized internal portal administrators log in and land on the **Dashboard** (`index.html`).
* Clicking the **TMS** link in the sidebar navigates to the TMS Dashboard (`pages/tms.html`).
* Selecting the **REPORTS** module card redirects the user to the report management screen (`pages/reports.html`).

### Select Bank and Report Type Form
The reports page presents a form (`#tmsInventoryForm`) with three primary input widgets:
1. **Select Bank Code (Dropdown):** Mandatory. Options include:
   - `HDFC Bank`, `ICICI Bank`, `Axis Bank`, `SBI`, `Yes Bank`, `Kotak Bank`.
2. **Select Report Type (Dropdown):** Mandatory. Options include:
   - `Merchant Denied Report` (default), `Indent Path`, `Delivery Report`.
3. **Upload Block:** File input component (`#fileInput`) triggered by a custom **Browse** button.

### Dynamic UI Adaptation
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

### File Selection & Validation Rules
For uploads (*Merchant Denied Report* and *Delivery Report*):
* Selecting the custom **Browse** button triggers the hidden native file input.
* Allowed file extensions: `.xls`, `.xlsx`, `.csv` (checked case-insensitively).
* Maximum file size limit: **10 MB** (10,485,760 bytes).
* If validation fails, an error message appears, and the file value is reset and cleared.
* If validation passes, the filename is written into the `#fileNameDisplay` read-only field.

### Form Submission & Custom Validations
On submitting `#tmsInventoryForm`:
* The standard browser default validations are bypassed to implement custom styling and error messaging.
* **Field Checks:**
  - If no Bank is selected, the Select Bank Code border highlights in red (`is-invalid`).
  - If no Report Type is selected, the Select Report Type border highlights in red (`is-invalid`).
  - For *Merchant Denied Report* and *Delivery Report*, if no valid file has been selected, an error message (`File is required. Please browse and select a file.`) is revealed.
  - For *Indent Path*, the file requirement is ignored.

### Success Modal Popup & Redirection Logic
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

### Secure Cloud Storage Bucket Integration
*Only applicable when the report type is **Indent Path**.*
The success modal generates and presents a dedicated cloud storage bucket panel containing:
1. **Bucket Path (Read-only Code Block):**
   - Format: `gs://tms-indent-bucket/<Bank>/<Year>/<Month>/<Date>/<filename>`
   - `<Bank>`: The uppercase bank code (e.g., `HDFC`, `SBI`, `KOTAK`).
   - `<Year>`: 4-digit year format (e.g., `2026`).
   - `<Month>`: Full month name capitalized (e.g., `January`, `May`).
   - `<Date>`: Day number followed by the abbreviated month name (e.g., `17-Jan`, `21-May`).
   - `<filename>`: The name of the uploaded file if present, otherwise defaults to `indent_path_records.xlsx`.
2. **Copy Button:**
   - Tapping the clipboard icon copies the bucket string to the device clipboard.
   - On success, the icon toggles to a checkmark for 2 seconds before reverting back.
3. **Go to Bucket Button:**
   - An external anchor link that opens the Cloud Console storage browser in a new tab:
   - Format: `https://console.cloud.google.com/storage/browser/tms-indent-bucket/<Bank>/<Year>/<Month>/<Date>`

### Dynamic Sample Template Download
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

---

## Acceptance Criteria

### 1. Navigation & UI Structure
* [ ] The reports form is accessible at `pages/reports.html` and links back to `tms.html` via the back button in the header bar.
* [ ] The sidebar highlights "TMS" as the active menu item when accessing the reports screen.

### 2. Reports Portal Form Validations
* [ ] Form rejects files with extensions other than `.xls`, `.xlsx`, and `.csv`.
* [ ] Form rejects files larger than 10 MB and resets the field.
* [ ] Form submission is prevented if Bank Code or Report Type is not selected, showing red invalid styles.
* [ ] Form submission is allowed **without** a file selection when Indent Path is selected.

### 3. Success Modal & Cloud Buckets
* [ ] Form submission triggers a full-page backdrop blur modal showing an emerald circle checkmark.
* [ ] The Cloud Bucket Path is displayed in a styled container only when Indent Path is submitted.
* [ ] The Cloud Bucket URL matches the structure: `gs://tms-indent-bucket/<Bank>/<Year>/<Month>/<Date>/<filename>`.
* [ ] Copy Button copies the bucket URL string to the clipboard and displays a clipboard-check visual cue for 2 seconds.
* [ ] Go to Bucket button opens the correct Cloud Console browser URL in a new tab.

---

## Conclusion
The Reports Portal Module of the Terminal Management System (TMS) provides administrators and operations teams with a robust, automated workflow for managing bank-specific records and rollout assets. By utilizing client-side validation, context-sensitive layout adjustments, automatic cloud-bucket path calculations, and clipboard copy facilities, the portal reduces manual data entry errors.
