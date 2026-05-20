# Product Requirement Document (PRD)
## Internal Portal TMS Module: New Report Upload and Generation Feature

### Document Control

| Version | Completed Date | Function Name | Review Frequency | Author Name | Process Owner | Approved By | Approval Date |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **v1.0** | 2026-05-20 | TMS Module - Report Upload & Generation | 6 Months | Antigravity AI | Common Admin | Basudev Behera | 2026-05-20 |

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
   - [Google Cloud Storage (GCS) Bucket Integration](#google-cloud-storage-gcs-bucket-integration)
   - [Dynamic Sample Template Download](#dynamic-sample-template-download)
8. [Acceptance Criteria](#acceptance-criteria)
9. [Conclusion](#conclusion)

---

## Problem Statement
The internal operations and administrative teams at Iserveu manage logistics, delivery statuses, terminal rollouts, and merchant onboarding validations across various partner banks. Currently, terminal-related dispatches, courier delivery tracking, and merchant denials are handled via disjointed processes. Without a centralized tool, operations teams must manually coordinate reports, track uploads, and map files to backend storage buckets.

This leads to operational inefficiencies, a lack of standardized file format checks, and delays in dispatching terminal items (e.g. Soundbox units) due to manual file parsing. An automated, user-friendly, and dynamically adapting portal within the internal Terminal Management System (TMS) is required to streamline the uploading and generation of these reports.

## Objective
The goal is to implement a unified, responsive Reports Upload and Generation feature under the TMS module in the Iserveu Internal Portal (`pages/reports.html`). The module will support multiple banking partners and report categories, automatically adjust fields and instructions based on user selections, enforce strict size and extension validation, integrate with Google Cloud Storage bucket path generation for Indent requests, and provide an interactive, animated user feedback interface.

---

## What We Are Looking to Solve
The TMS Module Report feature addresses several operations challenges:

1. **Disjointed Upload Workflows**: Centralizing the upload of Merchant Denied Reports, Delivery Reports, and Indent Requests in a single responsive form container.
2. **Lack of Dynamic Context**: The UI must dynamically adapt titles, instructions, upload requirements, and buttons so operators do not upload the wrong file type for a selected report.
3. **Manual Cloud Storage Mappings**: Operations staff struggle to match upload batches to the correct GCS bucket paths. The system must automatically map and generate paths based on bank slug and timestamp.
4. **Lack of Clipboard Copy Capabilities**: Operators copy cloud bucket paths manually, which is error-prone. Simple one-click clipboard copying is required.
5. **No Redirection Visual Cues**: Transitioning from a successful upload back to the TMS menu should be smooth and automated using custom countdown timers.

---

## Scope of Solution

* **Dynamic Multi-Report Form**:
  - Implement a single, clean upload form that alters behavior depending on the selected report type: *Merchant Denied Report*, *Indent Path*, and *Delivery Report*.
* **Validation & Security**:
  - Enforce file constraints (.xls, .xlsx, .csv) and file size checks (maximum 10 MB).
* **GCS Path Generation Engine**:
  - Dynamically formulate and display GCS paths for Indent generation.
* **Animated Feedback Overlay**:
  - Incorporate a blurred-backdrop success modal overlay that shows a confirmation message, copy buttons, a GCS console redirection link, and a live timer-driven redirect back to the main TMS screen.
* **Sample Excel Sheet Repository**:
  - Provide a dynamic sample download link that serves appropriate headers and pre-filled structures based on the selected report type.

---

## Value to Internal Operations
* **Reduced Manual Errors**: Dynamic notes and layout changes prevent operators from submitting the wrong report template.
* **Automated Cloud Directory Mapping**: Automated bucket path mapping minimizes file misplacements in GCS.
* **Increased Task Velocity**: Integrated countdown redirects, inline browse triggers, and success feedback speeds up batch processing.

## Value to Bank Partners
* **Prompt Terminal Rollouts**: Automated indent paths ensure device delivery orders are created and uploaded to courier logs quickly.
* **Accurate Delivery Audits**: Reliable log collection enables tracking transit statuses for terminal dispatches (Soundboxes) transparently.

---

## Feature Flow Description

### Navigation and Access
* Authorized internal portal administrators log in and land on the **ISU Admin Dashboard** (`index.html`).
* Clicking the **TMS** link in the sidebar navigates to the TMS Dashboard (`pages/tms.html`).
* Selecting the **REPORTS** module card on either dashboard redirects the user to the report management screen (`pages/reports.html`).

### Select Bank and Report Type Form
The user is presented with a card container headed by a dark teal brand bar containing a back button to `tms.html`. The page presents a form (`#tmsInventoryForm`) with three primary input widgets:
1. **Select Bank Code (Dropdown)**: Mandatory. Options include:
   - `HDFC Bank`
   - `ICICI Bank`
   - `Axis Bank`
   - `SBI`
   - `Yes Bank`
   - `Kotak Bank`
2. **Select Report Type (Dropdown)**: Mandatory. Options include:
   - `Merchant Denied Report` (default)
   - `Indent Path`
   - `Delivery Report`
3. **Upload Block**: File input component (`#fileInput`) triggered by a custom **Browse** button.

### Dynamic UI Adaptation
The interface adjusts in real-time when the **Select Report Type** dropdown is modified:
* **Merchant Denied Report**:
  - Card Header Title: `Merchant Denied Report Upload`
  - Red Note Text: `Note : File should contain merchant denied data only`
  - File Upload Block: **Visible** (mandatory)
  - Submit Button Label: `Upload`
* **Delivery Report**:
  - Card Header Title: `Delivery Report Upload`
  - Red Note Text: `Note : File should contain delivery report records only`
  - File Upload Block: **Visible** (mandatory)
  - Submit Button Label: `Upload`
* **Indent Path**:
  - Card Header Title: `Indent Path Submission`
  - Red Note Text: `Submit request to generate indent path records`
  - File Upload Block: **Hidden** (not required for request submission)
  - Submit Button Label: `Submit`

### File Selection & Validation Rules
For uploads (*Merchant Denied Report* and *Delivery Report*):
* Selecting the custom **Browse** button triggers the hidden native file input.
* Allowed file extensions: `.xls`, `.xlsx`, `.csv` (checked case-insensitively).
* Maximum file size limit: **10 MB** (10,485,760 bytes).
* If validation fails:
  - An error message appears underneath the upload container.
  - The file value is reset and cleared.
* If validation passes, the filename is written into the `#fileNameDisplay` read-only field.

### Form Submission & Custom Validations
On submitting `#tmsInventoryForm`:
* The standard browser default validations are bypassed to implement custom styling and error messaging.
* **Field Checks**:
  - If no Bank is selected, the Select Bank Code border highlights in red (`is-invalid`).
  - If no Report Type is selected, the Select Report Type border highlights in red (`is-invalid`).
  - For *Merchant Denied Report* and *Delivery Report*, if no valid file has been selected, an error message (`File is required. Please browse and select a file.`) is revealed.
  - For *Indent Path*, the file requirement is ignored.

### Success Modal Popup & Redirection Logic
Upon passing all validations, a modal overlay (`#successModalOverlay`) is rendered as a flex container over the page, styled with a blur backdrop filter (`backdrop-filter: blur(4px)`).
* The modal card pops in using a scale animation (`scaleInCard`).
* It displays an emerald green circular check icon, a "Success" title, and a customized message:
  - *Merchant Denied Report*: `Merchant denied report uploaded successfully`
  - *Delivery Report*: `Delivery report uploaded successfully`
  - *Indent Path*: `Indent path report generated successfully`
* The modal includes an **Okay** button to immediately redirect back to `tms.html`.
* **Auto-Redirect Timer**:
  - For *Indent Path*: The user is automatically redirected to `tms.html` after **8 seconds**.
  - For *Merchant Denied Report* & *Delivery Report*: The user is automatically redirected to `tms.html` after **3 seconds**.
  - Clicking **Okay** clears the timer and redirects instantly.

### Google Cloud Storage (GCS) Bucket Integration
*Only applicable when the report type is **Indent Path**.*
The success modal generates and presents a dedicated Google Cloud Storage bucket panel containing:
1. **Bucket Path (Read-only Code Block)**:
   - Format: `gs://tms-indent-bucket/uploads/<bank_slug>/indent_path/<timestamp>/<filename>`
   - `<bank_slug>`: The selected bank code converted to lowercase with spaces replaced by underscores (e.g., `SBI` -> `sbi`, `HDFC Bank` -> `hdfc_bank`).
   - `<timestamp>`: Date format `YYYYMMDD` formatted based on the execution date.
   - `<filename>`: The name of the uploaded file if present, otherwise defaults to `indent_path_records.xlsx`.
2. **Copy Button**:
   - Tapping the clipboard icon copies the bucket string to the device clipboard.
   - On success, the icon toggles to a checkmark for 2 seconds before reverting back.
3. **Go to Bucket Button**:
   - An external anchor link that opens the Google Cloud Console storage browser in a new tab:
   - Format: `https://console.cloud.google.com/storage/browser/tms-indent-bucket/uploads/<bank_slug>/indent_path/<timestamp>`

### Dynamic Sample Template Download
Clicking the **Download Sample Excel Sheet** button fetches a dynamically built CSV template based on the current selection:
* **Merchant Denied Report**:
  - Filename: `merchant_denied_sample.xlsx`
  - Headers: `Merchant ID,Merchant Name,Bank,Denial Reason,Denied Date,Status`
  - Pre-filled mock values use the selected bank name.
* **Delivery Report**:
  - Filename: `delivery_report_sample.xlsx`
  - Headers: `Delivery ID,Order ID,Bank,Courier Partner,AWB Number,Delivery Status,Estimated Delivery`
  - Pre-filled mock values use the selected bank name.
* **Indent Path**:
  - Filename: `indent_path_sample.xlsx`
  - Headers: `Indent ID,Bank,Device Type,Path Code,Terminal ID,Dispatch Date`
  - Pre-filled mock values use the selected bank name.

---

## Acceptance Criteria

### 1. Navigation & UI Structure
* [ ] The reports form is accessible at `pages/reports.html` and links back to `tms.html` via the back button in the header bar.
* [ ] The sidebar highlights "TMS" as the active menu item when accessing the reports screen.
* [ ] The page layout features a central card with a dark teal header containing a back button and a centered title.

### 2. Select Fields
* [ ] Select Bank Code dropdown contains options for HDFC Bank, ICICI Bank, Axis Bank, SBI, Yes Bank, and Kotak Bank.
* [ ] Select Report Type dropdown contains options for Merchant Denied Report, Indent Path, and Delivery Report.

### 3. Dynamic UI Transformation
* [ ] Selecting **Merchant Denied Report** sets the title to "Merchant Denied Report Upload", note to "Note : File should contain merchant denied data only", submit button to "Upload", and shows the upload input.
* [ ] Selecting **Delivery Report** sets the title to "Delivery Report Upload", note to "Note : File should contain delivery report records only", submit button to "Upload", and shows the upload input.
* [ ] Selecting **Indent Path** sets the title to "Indent Path Submission", note to "Submit request to generate indent path records", submit button to "Submit", and **hides** the upload input container.

### 4. File Input & Validation
* [ ] Browse button triggers the hidden file selection window.
* [ ] Form rejects files with extensions other than `.xls`, `.xlsx`, and `.csv` (e.g. `.pdf`, `.png` triggers an inline validation error).
* [ ] Form rejects files larger than 10 MB and resets the field.
* [ ] Valid files show the file name inside the text field placeholder.

### 5. Form Validation
* [ ] Form submission is prevented if Select Bank Code is not selected, showing red invalid styles.
* [ ] Form submission is prevented if Select Report Type is not selected, showing red invalid styles.
* [ ] Form submission is prevented if no file is selected for Merchant Denied and Delivery Reports.
* [ ] Form submission is allowed **without** a file selection when Indent Path is selected.

### 6. Success Modal Popup
* [ ] Form submission triggers a full-page backdrop blur modal showing an emerald circle checkmark.
* [ ] The modal title displays "Success".
* [ ] The modal text matches the specific report action (e.g., "...uploaded successfully" or "...generated successfully").
* [ ] The Okay button redirects the user immediately to `tms.html`.

### 7. Auto-Redirection Timer
* [ ] For Merchant Denied and Delivery Reports, the modal auto-redirects to `tms.html` after exactly 3 seconds.
* [ ] For Indent Path, the modal auto-redirects to `tms.html` after exactly 8 seconds.
* [ ] Manual redirection via the Okay button overrides and clears the timers.

### 8. GCS Bucket Information (Indent Path Only)
* [ ] The GCS Bucket Path is displayed in a styled container only when Indent Path is submitted.
* [ ] The GCS Bucket URL matches the structure: `gs://tms-indent-bucket/uploads/<bank_slug>/indent_path/<timestamp>/<filename>`.
* [ ] Bank slug is lowercased and spaces are replaced by underscores (e.g. "HDFC Bank" -> "hdfc_bank").
* [ ] Timestamp is formatted as `YYYYMMDD`.
* [ ] Copy Button copies the bucket URL string to the clipboard and displays a clipboard-check visual cue for 2 seconds.
* [ ] Go to Bucket button opens the correct Google Cloud Console browser URL in a new tab.

### 9. Sample Download Templates
* [ ] Clicking the download button generates a sample file corresponding to the active selection.
* [ ] Merchant Denied sample downloads as `merchant_denied_sample.xlsx` with columns: `Merchant ID, Merchant Name, Bank, Denial Reason, Denied Date, Status`.
* [ ] Delivery Report sample downloads as `delivery_report_sample.xlsx` with columns: `Delivery ID, Order ID, Bank, Courier Partner, AWB Number, Delivery Status, Estimated Delivery`.
* [ ] Indent Path sample downloads as `indent_path_sample.xlsx` with columns: `Indent ID, Bank, Device Type, Path Code, Terminal ID, Dispatch Date`.

---

## Conclusion
The Reports module of the Terminal Management System (TMS) provides Iserveu administrators and ops teams with a robust, automated workflow for managing bank-specific records and rollout assets. By utilizing client-side validation, context-sensitive layout adjustments, automatic cloud-bucket path calculations, and clipboard copy facilities, the portal reduces manual data entry errors and expedites log submission for our partner banks.
