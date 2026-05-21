$(document).ready(function () {
    // Sidebar toggler for mobile responsiveness
    $('.sidebar-toggle-btn').on('click', function () {
        $('.isu-sidebar').toggleClass('show');
    });

    // 1. EMAIL MANAGEMENT
    let emails = [];
    const defaultEmails = [
        { email: 'ops-lead@iserveu.in', bank: 'All Banks' },
        { email: 'bank-audit@firstbank.com', bank: 'SBI' }
    ];

    // Load emails from LocalStorage
    function loadEmails() {
        const stored = localStorage.getItem('tms_automate_emails');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                    emails = parsed.map(item => {
                        if (typeof item === 'string') {
                            return { email: item, bank: 'All Banks' };
                        }
                        return item;
                    });
                } else {
                    emails = [...defaultEmails];
                }
            } catch (err) {
                emails = [...defaultEmails];
            }
        } else {
            emails = [...defaultEmails];
            localStorage.setItem('tms_automate_emails', JSON.stringify(emails));
        }

        // Synchronize with backend if available
        $.ajax({
            url: '/api/emails',
            type: 'GET',
            timeout: 2000,
            success: function (data) {
                if (Array.isArray(data) && data.length > 0) {
                    emails = data;
                    localStorage.setItem('tms_automate_emails', JSON.stringify(emails));
                    renderEmails();
                } else {
                    // Sync our local state to backend if backend returns empty but we have local emails
                    if (emails.length > 0) {
                        emails.forEach(item => {
                            $.ajax({
                                url: '/api/emails',
                                type: 'POST',
                                contentType: 'application/json',
                                data: JSON.stringify(item)
                            });
                        });
                    }
                }
            },
            error: function () {
                console.log('Backend API /api/emails not available or timed out. Running in client-only mode.');
            }
        });
    }

    // Render Emails chips
    function renderEmails() {
        const container = $('#emailsContainer');
        container.empty();

        if (emails.length === 0) {
            container.append('<div class="w-100 text-muted text-center py-3 fs-7 border rounded bg-light" style="border-style: dashed !important;">No email recipients configured. Add email IDs above.</div>');
            return;
        }

        emails.forEach((emailObj, index) => {
            let badgeClass = 'bg-secondary';
            if (emailObj.bank === 'All Banks') {
                badgeClass = 'bg-success';
            } else if (emailObj.bank === 'HDFC Bank') {
                badgeClass = 'bg-primary';
            } else if (emailObj.bank === 'ICICI Bank') {
                badgeClass = 'bg-info text-dark';
            } else if (emailObj.bank === 'SBI') {
                badgeClass = 'bg-danger';
            } else if (emailObj.bank === 'Axis Bank') {
                badgeClass = 'bg-warning text-dark';
            } else if (emailObj.bank === 'Yes Bank') {
                badgeClass = 'bg-dark';
            } else if (emailObj.bank === 'Kotak Bank') {
                badgeClass = 'bg-purple text-white'; // Bootstrap/custom purple badge
            }
            
            const chip = $(`
                <div class="email-item" data-index="${index}">
                    <i class="bi bi-envelope text-teal"></i>
                    <span>${emailObj.email}</span>
                    <span class="badge ${badgeClass} fs-8 ms-1" style="font-size: 0.7rem; padding: 2px 6px;">${emailObj.bank}</span>
                    <button class="email-remove-btn" title="Remove recipient" aria-label="Remove recipient">
                        <i class="bi bi-x"></i>
                    </button>
                </div>
            `);
            container.append(chip);
        });
    }

    // 1b. EMAIL INTEGRATION SERVICE CONFIGURATION
    let emailConfig = {
        enabled: true,
        provider: 'web3forms',
        web3FormsKey: '1cb10e5c-cf81-487e-a2b1-52acda767bbc',
        emailJSPublicKey: '',
        emailJSServiceID: '',
        emailJSTemplateID: ''
    };

    function loadEmailConfig() {
        const stored = localStorage.getItem('tms_email_integration_config');
        const legacyStored = localStorage.getItem('tms_emailjs_config');
        
        if (stored) {
            emailConfig = JSON.parse(stored);
            // Overwrite key or enable if it was not previously configured to ensure immediate usage of their key
            if (!emailConfig.web3FormsKey) {
                emailConfig.web3FormsKey = '1cb10e5c-cf81-487e-a2b1-52acda767bbc';
                emailConfig.enabled = true;
                localStorage.setItem('tms_email_integration_config', JSON.stringify(emailConfig));
            }
        } else {
            localStorage.setItem('tms_email_integration_config', JSON.stringify(emailConfig));
        }
        
        // Populate inputs
        $('#enableRealEmails').prop('checked', emailConfig.enabled);
        $('#emailProvider').val(emailConfig.provider || 'web3forms');
        $('#web3FormsAccessKey').val(emailConfig.web3FormsKey || '');
        $('#emailJSPublicKey').val(emailConfig.emailJSPublicKey || '');
        $('#emailJSServiceID').val(emailConfig.emailJSServiceID || '');
        $('#emailJSTemplateID').val(emailConfig.emailJSTemplateID || '');

        // Show/hide fields
        toggleFieldsVisibility();

        // Init EmailJS if needed
        initEmailJS();
    }

    function toggleFieldsVisibility() {
        const enabled = $('#enableRealEmails').is(':checked');
        if (enabled) {
            $('#emailProviderFields').show();
            const provider = $('#emailProvider').val();
            if (provider === 'web3forms') {
                $('#web3FormsFields').show();
                $('#emailJSFields').hide();
            } else {
                $('#web3FormsFields').hide();
                $('#emailJSFields').show();
            }
        } else {
            $('#emailProviderFields').hide();
        }
    }

    function initEmailJS() {
        if (emailConfig.enabled && emailConfig.provider === 'emailjs' && emailConfig.emailJSPublicKey) {
            try {
                emailjs.init(emailConfig.emailJSPublicKey);
            } catch (err) {
                console.error("Failed to initialize EmailJS SDK:", err);
            }
        }
    }

    // Toggle switch handler
    $('#enableRealEmails').on('change', function () {
        const isChecked = $(this).is(':checked');
        if (isChecked) {
            $('#emailProviderFields').slideDown(200, function() {
                toggleFieldsVisibility();
            });
        } else {
            $('#emailProviderFields').slideUp(200);
            emailConfig.enabled = false;
            localStorage.setItem('tms_email_integration_config', JSON.stringify(emailConfig));
            addLog('SYSTEM', 'Automatic background mailing disabled.');
        }
    });

    // Provider select change handler
    $('#emailProvider').on('change', function () {
        toggleFieldsVisibility();
    });

    // Save Configuration handler
    $('#btnSaveConfig').on('click', function () {
        const enabled = $('#enableRealEmails').is(':checked');
        const provider = $('#emailProvider').val();
        const web3FormsKey = $('#web3FormsAccessKey').val().trim();
        const emailJSPublicKey = $('#emailJSPublicKey').val().trim();
        const emailJSServiceID = $('#emailJSServiceID').val().trim();
        const emailJSTemplateID = $('#emailJSTemplateID').val().trim();

        if (enabled) {
            if (provider === 'web3forms' && !web3FormsKey) {
                alert('Please enter your Web3Forms Access Key.');
                return;
            }
            if (provider === 'emailjs' && (!emailJSPublicKey || !emailJSServiceID || !emailJSTemplateID)) {
                alert('Please fill out all EmailJS configuration fields.');
                return;
            }
        }

        emailConfig = {
            enabled,
            provider,
            web3FormsKey,
            emailJSPublicKey,
            emailJSServiceID,
            emailJSTemplateID
        };
        localStorage.setItem('tms_email_integration_config', JSON.stringify(emailConfig));

        // Re-initialize SDK if using emailjs
        if (enabled && provider === 'emailjs') {
            initEmailJS();
        }

        const successMsg = $('#configSuccessMsg');
        successMsg.removeClass('d-none');
        setTimeout(() => {
            successMsg.addClass('d-none');
        }, 3000);

        addLog('SYSTEM', `Saved config. Provider: ${provider.toUpperCase()}, Auto Background Mailing: ${enabled ? 'ENABLED' : 'DISABLED'}`);
    });

    // Add Email ID handler
    $('#emailAddForm').on('submit', function (e) {
        e.preventDefault();
        const input = $('#emailInput');
        const bankSelect = $('#emailBankSelect');
        const emailVal = input.val().trim();
        const bankVal = bankSelect.val();
        const errorMsg = $('#emailError');

        input.removeClass('is-invalid');
        errorMsg.addClass('d-none');

        // Regex Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailVal) {
            input.addClass('is-invalid');
            errorMsg.text('Email address is required.').removeClass('d-none');
            return;
        }

        if (!emailRegex.test(emailVal)) {
            input.addClass('is-invalid');
            errorMsg.text('Please enter a valid email address.').removeClass('d-none');
            return;
        }

        const isDuplicate = emails.some(item => item.email.toLowerCase() === emailVal.toLowerCase() && item.bank === bankVal);
        if (isDuplicate) {
            input.addClass('is-invalid');
            errorMsg.text(`This email ID is already configured for ${bankVal}.`).removeClass('d-none');
            return;
        }

        // Add email
        const newRecipient = { email: emailVal, bank: bankVal };
        emails.push(newRecipient);
        localStorage.setItem('tms_automate_emails', JSON.stringify(emails));
        input.val('');
        renderEmails();

        // Write log
        addLog('SYSTEM', `Added recipient: ${emailVal} for [${bankVal}]`);

        // Post to backend
        $.ajax({
            url: '/api/emails',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(newRecipient),
            success: function(updatedList) {
                if (Array.isArray(updatedList)) {
                    emails = updatedList;
                    localStorage.setItem('tms_automate_emails', JSON.stringify(emails));
                    renderEmails();
                }
            },
            error: function(xhr) {
                console.warn('Backend add failed, fallback to local storage:', xhr.responseJSON || xhr.statusText);
            }
        });
    });

    // Delete Email ID handler (delegated)
    $(document).on('click', '.email-remove-btn', function () {
        const item = $(this).closest('.email-item');
        const index = item.data('index');
        const emailDeleted = emails[index];

        item.addClass('removing');
        setTimeout(() => {
            emails.splice(index, 1);
            localStorage.setItem('tms_automate_emails', JSON.stringify(emails));
            renderEmails();
            addLog('SYSTEM', `Removed recipient: ${emailDeleted.email} for [${emailDeleted.bank}]`);

            // Send delete request to backend
            $.ajax({
                url: '/api/emails',
                type: 'DELETE',
                contentType: 'application/json',
                data: JSON.stringify(emailDeleted),
                success: function(updatedList) {
                    if (Array.isArray(updatedList)) {
                        emails = updatedList;
                        localStorage.setItem('tms_automate_emails', JSON.stringify(emails));
                        renderEmails();
                    }
                },
                error: function(xhr) {
                    console.warn('Backend delete failed, fallback to local storage:', xhr.responseJSON || xhr.statusText);
                }
            });
        }, 200);
    });

    // 2. SIMULATION & LOGGING TERMINAL
    let logs = [];
    const defaultLogs = [
        { time: '2026-05-20 00:00:01', tag: 'SUCCESS', msg: 'Fetched indent files uploaded between 12:00 PM and 11:59 PM (20-May). Saved at gs://tms-indent-bucket/SBI/2026/May/20-May/indent_records_sbi.xlsx' },
        { time: '2026-05-21 09:00:05', tag: 'EMAIL', msg: 'Dispatched automated email containing indent file link (gs://tms-indent-bucket/SBI/2026/May/20-May/indent_records_sbi.xlsx) to bank-audit@firstbank.com' }
    ];

    function loadLogs() {
        const stored = localStorage.getItem('tms_automate_logs');
        if (stored) {
            logs = JSON.parse(stored);
        } else {
            logs = [...defaultLogs];
            localStorage.setItem('tms_automate_logs', JSON.stringify(logs));
        }
    }

    function renderLogs() {
        const box = $('#terminalLogs');
        box.empty();
        logs.forEach(log => {
            box.append(createLogHtml(log.time, log.tag, log.msg));
        });
        // Scroll terminal to bottom
        box.scrollTop(box[0].scrollHeight);
    }

    function createLogHtml(time, tag, msg) {
        let tagClass = 'log-tag-system';
        if (tag === 'GCS') tagClass = 'log-tag-gcs';
        if (tag === 'EMAIL') tagClass = 'log-tag-email';
        if (tag === 'SUCCESS') tagClass = 'log-tag-success';

        return `<div class="terminal-log-row"><span class="log-time">[${time}]</span> <span class="${tagClass}">[${tag}]</span> ${msg}</div>`;
    }

    function addLog(tag, msg) {
        const now = new Date();
        const timeStr = now.getFullYear() + '-' + 
            String(now.getMonth() + 1).padStart(2, '0') + '-' + 
            String(now.getDate()).padStart(2, '0') + ' ' + 
            String(now.getHours()).padStart(2, '0') + ':' + 
            String(now.getMinutes()).padStart(2, '0') + ':' + 
            String(now.getSeconds()).padStart(2, '0');

        const newLog = { time: timeStr, tag, msg };
        logs.push(newLog);
        
        // Keep last 100 logs
        if (logs.length > 100) logs.shift();

        localStorage.setItem('tms_automate_logs', JSON.stringify(logs));

        // Append and scroll
        const box = $('#terminalLogs');
        box.append(createLogHtml(timeStr, tag, msg));
        box.scrollTop(box[0].scrollHeight);
    }

    // Clear Logs
    $('#clearLogsBtn').on('click', function () {
        logs = [];
        localStorage.setItem('tms_automate_logs', JSON.stringify(logs));
        renderLogs();
    });

    // 3. RUN SIMULATION FLOW
    let simTimeoutIds = [];
    let currentModalDispatches = [];
    let activeModalTabIndex = 0;

    // Helper to compile CSV content by bank
    function generateCSVText(bankName) {
        let csv = "Delivery ID,Order ID,Bank,Courier Partner,AWB Number,Delivery Status,Estimated Delivery\n";
        const cleanBank = bankName || "General";
        if (cleanBank === "HDFC Bank") {
            csv += "DEL90021,ORD77309,HDFC Bank,BlueDart,AWB998822,Delivered,2026-05-19\n";
            csv += "DEL90022,ORD77310,HDFC Bank,Delhivery,AWB998823,In Transit,2026-05-21\n";
        } else if (cleanBank === "SBI") {
            csv += "DEL90023,ORD77311,SBI,Delhivery,AWB998824,Delivered,2026-05-20\n";
            csv += "DEL90024,ORD77312,SBI,BlueDart,AWB998825,Delivered,2026-05-21\n";
        } else if (cleanBank === "ICICI Bank") {
            csv += "DEL90025,ORD77313,ICICI Bank,BlueDart,AWB998826,Delivered,2026-05-19\n";
        } else {
            csv += `DEL90026,ORD77314,${cleanBank},Delhivery,AWB998827,Delivered,2026-05-20\n`;
        }
        return csv;
    }

    // Helper: Generate and download demo CSV file
    function downloadDemoFile(bankName, dateStr) {
        const csvContent = generateCSVText(bankName);
        const encodedUri = "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent);
        const link = document.createElement("a");
        const bankFileSlug = bankName.toLowerCase().replace(/\s+/g, '_');
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${bankFileSlug}-${dateStr}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Render the active index content in mock email modal
    function renderMockEmailContent(index) {
        if (!currentModalDispatches || currentModalDispatches.length === 0 || !currentModalDispatches[index]) return;
        
        activeModalTabIndex = index;
        const disp = currentModalDispatches[index];

        $('#emailToDisplay').text(disp.recipientListStr);
        $('#emailSubjectDisplay').text(disp.subject);
        $('#emailBucketPathDisplay').text(disp.bucketPath);
        $('#emailAttachmentNameDisplay').text(disp.csvFilename);
        
        const alertBox = $('#mockEmailModalOverlay').find('.alert');
        
        if (disp.sentInBackground) {
            $('#mockEmailModalOverlay').find('.fs-6').text(`Background Email Dispatched (${disp.bank})`);
            alertBox.removeClass('alert-info').addClass('alert-success').html(
                `<i class="bi bi-check-circle-fill text-success fs-5 mt-0.5"></i>
                 <div>
                     <strong>Automated Dispatch Successful:</strong> The email has been sent successfully in the background to the configured recipients for <strong>${disp.bank}</strong> via ${disp.provider}.
                     <br><span style="font-size: 0.78rem; opacity: 0.9;" class="d-block mt-1"><i class="bi bi-info-circle-fill"></i> <strong>Note:</strong> Free email endpoints (like Web3Forms/EmailJS free tier) do not support true file attachments. We have embedded the CSV report data as plain text and included a <strong>Direct Download Link</strong> in the email body so you can download the file directly from your email.</span>
                 </div>`
            );
            $('#btnSendRealMail').hide();
        } else {
            $('#mockEmailModalOverlay').find('.fs-6').text(`Incoming Email Simulation (${disp.bank})`);
            alertBox.removeClass('alert-success').addClass('alert-info').html(
                `<i class="bi bi-info-circle-fill text-primary fs-5 mt-0.5"></i>
                 <div>
                     <strong>Simulation Sandbox:</strong> Since this is a frontend portal, automated background emails cannot be sent. You can download the generated report below, or click <strong>Draft Real Email</strong> to open your local mail client with the recipients pre-filled for <strong>${disp.bank}</strong>.
                 </div>`
            );
            $('#btnSendRealMail').show();
        }
    }

    // Set up mock tabs
    function setupMockEmailTabs(dispatchesList) {
        currentModalDispatches = dispatchesList;
        activeModalTabIndex = 0;

        const tabsContainer = $('#emailModalTabs');
        tabsContainer.empty();

        if (dispatchesList.length > 1) {
            dispatchesList.forEach((disp, idx) => {
                const isActive = idx === 0 ? 'active' : '';
                const tabBtn = $(`
                    <li class="nav-item">
                        <button class="nav-link ${isActive}" data-index="${idx}">
                            ${disp.bank}
                        </button>
                    </li>
                `);
                tabsContainer.append(tabBtn);
            });
            tabsContainer.show();
        } else {
            tabsContainer.hide();
        }

        renderMockEmailContent(0);
        $('#mockEmailModalOverlay').css('display', 'flex');
    }

    function runClientOnlySimulation(btn, dateStr) {
        addLog('SYSTEM', 'Running local client-only fallback simulation.');
        // Get active banks from recipients list
        let activeBanks = [];
        if (emails.length > 0) {
            const directBanks = [...new Set(emails.map(item => item.bank))].filter(b => b !== 'All Banks');
            if (directBanks.length > 0) {
                activeBanks = directBanks;
            }
            if (emails.some(item => item.bank === 'All Banks') || activeBanks.length === 0) {
                if (!activeBanks.includes('HDFC Bank')) activeBanks.push('HDFC Bank');
                if (!activeBanks.includes('SBI')) activeBanks.push('SBI');
            }
        } else {
            activeBanks = ['HDFC Bank', 'SBI'];
        }

        // Clear existing timeouts if any
        simTimeoutIds.forEach(clearTimeout);
        simTimeoutIds = [];

        // Parse dateStr (Day X+1, run time) to resolve yesterday's date (Day X, upload time)
        const parts = dateStr.split('-');
        const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
        dateObj.setDate(dateObj.getDate() - 1);
        const yearStr = dateObj.getFullYear();
        const MONTHS_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthStr = MONTHS_LONG[dateObj.getMonth()];
        const dayStr = dateObj.getDate() + '-' + MONTHS_SHORT[dateObj.getMonth()];

        // --- Step 1: Fetch & Compile Indents ---
        addLog('SYSTEM', 'Initiating scheduled daily indent check (12:00 PM - 11:59 PM window)...');
        $('#step-generation').addClass('active');

        let id = setTimeout(() => {
            addLog('SYSTEM', `Fetched all daily indent files uploaded between 12:00 PM and 11:59 PM yesterday (${dayStr}).`);
            activeBanks.forEach(bank => {
                const bankFolder = bank.split(' ')[0].toUpperCase();
                addLog('SUCCESS', `Found indent files for bank [${bank}]. Filename: indent_records_${bankFolder.toLowerCase()}.xlsx`);
            });
            $('#step-generation').removeClass('active').addClass('completed');
            
            // --- Step 2: Save Indents to Bucket ---
            addLog('SYSTEM', `Initiating Google Cloud Storage bucket upload...`);
            $('#step-bucket').addClass('active');
        }, 2000);
        simTimeoutIds.push(id);

        // Step 2 Details
        id = setTimeout(() => {
            addLog('GCS', `Authenticating with GCS bucket tms-indent-bucket.`);
            activeBanks.forEach(bank => {
                const bankFolder = bank.split(' ')[0].toUpperCase();
                addLog('GCS', `Uploading report file: [${bankFolder}/${yearStr}/${monthStr}/${dayStr}/indent_records_${bankFolder.toLowerCase()}.xlsx]`);
            });
            addLog('SUCCESS', `All compiled reports uploaded and archived successfully.`);
            $('#step-bucket').removeClass('active').addClass('completed');

            // --- Step 3: Extract & Resolve ---
            addLog('SYSTEM', `Triggering automated email dispatch queue next day at 9:00 AM...`);
            $('#step-extraction').addClass('active');
        }, 4500);
        simTimeoutIds.push(id);

        // Step 3 Details
        id = setTimeout(() => {
            addLog('EMAIL', `Resolving configured email recipient IDs bank-wise...`);
            
            if (emails.length === 0) {
                addLog('SYSTEM', `WARNING: No emails configured! Aborting email dispatch.`);
                $('#step-extraction').removeClass('active');
                $('#step-email').removeClass('active');
                btn.prop('disabled', false);
                return;
            }

            let resolvedCount = 0;
            activeBanks.forEach(bank => {
                const bankRecipients = [...new Set(emails.filter(item => item.bank === bank || item.bank === 'All Banks').map(item => item.email))];
                if (bankRecipients.length > 0) {
                    addLog('EMAIL', `Resolved recipients for [${bank}]: [${bankRecipients.join(', ')}]`);
                    resolvedCount++;
                } else {
                    addLog('EMAIL', `No recipients resolved for [${bank}]. Skipping report email.`);
                }
            });

            if (resolvedCount === 0) {
                addLog('SYSTEM', `WARNING: No active recipients resolved for compiled banks! Aborting email dispatch.`);
                $('#step-extraction').removeClass('active');
                $('#step-email').removeClass('active');
                btn.prop('disabled', false);
                return;
            }

            addLog('EMAIL', `Connecting to GCS bucket endpoint, pulling active reports.`);
            $('#step-extraction').removeClass('active').addClass('completed');

            // --- Step 4: Dispatch Email ---
            addLog('EMAIL', `Sending automated bank-wise messages to resolved recipients...`);
            $('#step-email').addClass('active');
        }, 7000);
        simTimeoutIds.push(id);

        // Step 4 Details & Final Success
        id = setTimeout(() => {
            const dispatches = [];

            // Compile dispatch info for each active bank
            activeBanks.forEach(bank => {
                const bankRecipients = emails.filter(item => item.bank === bank || item.bank === 'All Banks');
                if (bankRecipients.length === 0) return;

                const recipientEmails = [...new Set(bankRecipients.map(item => item.email))];
                const recipientListStr = recipientEmails.join(', ');
                const bankFolder = bank.split(' ')[0].toUpperCase();
                const filename = `indent_records_${bankFolder.toLowerCase()}.xlsx`;
                const bucketPath = `gs://tms-indent-bucket/${bankFolder}/${yearStr}/${monthStr}/${dayStr}/${filename}`;
                const downloadUrl = window.location.href.split('?')[0] + '?download=' + bankFolder.toLowerCase() + '-' + dateStr;
                const csvData = generateCSVText(bank);
                const emailSubject = `Automated Indent Files Dispatch: ${bank} - ${dayStr} ${yearStr}`;
                
                dispatches.push({
                    bank: bank,
                    recipients: recipientEmails,
                    recipientListStr: recipientListStr,
                    subject: emailSubject,
                    filename: filename,
                    csvFilename: `${bankFolder.toLowerCase()}_indent-${dateStr}.csv`,
                    bucketPath: bucketPath,
                    downloadUrl: downloadUrl,
                    csvData: csvData,
                    message: `Dear Operations Team,\n\n` +
                        `The daily scheduled Indent Report for ${bank} (uploaded yesterday between 12:00 PM and 11:59 PM) has been compiled and saved under the corresponding date folder in Google Cloud Storage.\n\n` +
                        `Bucket Location:\n${bucketPath}\n\n` +
                        `-----------------------------------------\n` +
                        `INLINE CSV EXCERPT:\n` +
                        `-----------------------------------------\n` +
                        `${csvData}\n` +
                        `-----------------------------------------\n\n` +
                        `Direct Download Link (Click to automatically download the indent file):\n` +
                        `${downloadUrl}\n\n` +
                        `Recipients: ${recipientListStr}\n\n` +
                        `Best Regards,\n` +
                        `iSupayX Terminal Automator`
                });
            });

            if (dispatches.length === 0) {
                addLog('SYSTEM', 'No dispatches were generated.');
                $('#step-email').removeClass('active');
                btn.prop('disabled', false);
                return;
            }

            let currentDispatchIndex = 0;

            function sendNext() {
                if (currentDispatchIndex >= dispatches.length) {
                    completeAllDispatches(dispatches);
                    return;
                }

                const dispatchObj = dispatches[currentDispatchIndex];
                addLog('EMAIL', `[${dispatchObj.bank}] Dispatching automated email to: ${dispatchObj.recipientListStr}...`);

                if (emailConfig.enabled) {
                    if (emailConfig.provider === 'web3forms' && emailConfig.web3FormsKey) {
                        addLog('EMAIL', `[${dispatchObj.bank}] Attempting background email transmission via Web3Forms...`);
                        
                        const blob = new Blob([dispatchObj.csvData], { type: 'text/csv' });
                        const file = new File([blob], dispatchObj.csvFilename, { type: 'text/csv' });

                        const formData = new FormData();
                        formData.append('access_key', emailConfig.web3FormsKey);
                        formData.append('subject', dispatchObj.subject);
                        formData.append('from_name', 'iSupayX Terminal Automator');
                        formData.append('message', dispatchObj.message);
                        formData.append('attachment', file);

                        fetch('https://api.web3forms.com/submit', {
                            method: 'POST',
                            headers: {
                                'Accept': 'application/json'
                            },
                            body: formData
                        })
                        .then(response => response.json())
                        .then(data => {
                            if (data.success) {
                                addLog('SUCCESS', `[${dispatchObj.bank}] Email sent successfully via Web3Forms (with attachment)!`);
                                dispatchObj.sentInBackground = true;
                                dispatchObj.provider = 'Web3Forms';
                            } else {
                                addLog('SYSTEM', `[${dispatchObj.bank}] WARNING: Web3Forms failed: ${data.message || 'Unknown error'}`);
                                dispatchObj.sentInBackground = false;
                            }
                            currentDispatchIndex++;
                            setTimeout(sendNext, 1000);
                        })
                        .catch(error => {
                            addLog('SYSTEM', `[${dispatchObj.bank}] ERROR: Web3Forms API failed: ${error.message || error}`);
                            dispatchObj.sentInBackground = false;
                            currentDispatchIndex++;
                            setTimeout(sendNext, 1000);
                        });

                    } else if (emailConfig.provider === 'emailjs' && emailConfig.emailJSPublicKey && emailConfig.emailJSServiceID && emailConfig.emailJSTemplateID) {
                        addLog('EMAIL', `[${dispatchObj.bank}] Attempting background email transmission via EmailJS...`);
                        
                        emailjs.send(emailConfig.emailJSServiceID, emailConfig.emailJSTemplateID, {
                            to_email: dispatchObj.recipientListStr,
                            subject: dispatchObj.subject,
                            bucket_path: dispatchObj.bucketPath,
                            date: dateStr
                        })
                        .then(function(response) {
                            addLog('SUCCESS', `[${dispatchObj.bank}] Email sent successfully via EmailJS!`);
                            dispatchObj.sentInBackground = true;
                            dispatchObj.provider = 'EmailJS';
                            currentDispatchIndex++;
                            setTimeout(sendNext, 1000);
                        }, function(error) {
                            addLog('SYSTEM', `[${dispatchObj.bank}] ERROR: EmailJS failed: ${JSON.stringify(error)}`);
                            dispatchObj.sentInBackground = false;
                            currentDispatchIndex++;
                            setTimeout(sendNext, 1000);
                        });
                    } else {
                        addLog('EMAIL', `[${dispatchObj.bank}] MIME email successfully generated and queued for SMTP transport.`);
                        addLog('SUCCESS', `[${dispatchObj.bank}] Automated email dispatched successfully to: ${dispatchObj.recipientListStr}`);
                        dispatchObj.sentInBackground = false;
                        currentDispatchIndex++;
                        setTimeout(sendNext, 500);
                    }
                } else {
                    addLog('EMAIL', `[${dispatchObj.bank}] MIME email successfully generated and queued for SMTP transport.`);
                    addLog('SUCCESS', `[${dispatchObj.bank}] Automated email dispatched successfully to: ${dispatchObj.recipientListStr}`);
                    dispatchObj.sentInBackground = false;
                    currentDispatchIndex++;
                    setTimeout(sendNext, 500);
                }
            }

            sendNext();

            function completeAllDispatches(dispatchesList) {
                $('#step-email').removeClass('active').addClass('completed');
                addLog('SYSTEM', `Daily scheduler process completed successfully for all banks.`);
                
                const toast = $('#simToast');
                toast.addClass('show');
                setTimeout(() => {
                    toast.removeClass('show');
                }, 4000);

                if (dispatchesList.length > 0) {
                    downloadDemoFile(dispatchesList[0].bank, dateStr);
                    addLog('SYSTEM', `Auto-downloaded demo file [${dispatchesList[0].csvFilename}] locally to simulate mail attachment.`);
                }

                setupMockEmailTabs(dispatchesList);
                btn.prop('disabled', false);
            }
        }, 9500);
        simTimeoutIds.push(id);
    }

    function runServerSimulation(btn, response, dateStr) {
        const logsList = response.logs || [];
        const dispatchesList = response.dispatches || [];

        // Clear existing timeouts if any
        simTimeoutIds.forEach(clearTimeout);
        simTimeoutIds = [];

        // Reset timeline UI
        $('.sim-step').removeClass('active completed');

        // Group logs into the four main timeline phases
        const phase1Logs = [];
        const phase2Logs = [];
        const phase3Logs = [];
        const phase4Logs = [];

        let currentPhase = 1;
        logsList.forEach(log => {
            const msg = log.msg;
            if (msg.includes('Initiating Google Cloud Storage')) {
                currentPhase = 2;
            } else if (msg.includes('Initiating automated email dispatch')) {
                currentPhase = 3;
            } else if (msg.includes('[') && (msg.includes('Dispatching') || msg.includes('Attempting') || msg.includes('EmailJS') || msg.includes('SMTP') || msg.includes('Email sent') || msg.includes('Mock email') || msg.includes('WARNING') || msg.includes('ERROR'))) {
                currentPhase = 4;
            }

            if (currentPhase === 1) phase1Logs.push(log);
            else if (currentPhase === 2) phase2Logs.push(log);
            else if (currentPhase === 3) phase3Logs.push(log);
            else phase4Logs.push(log);
        });

        // --- Step 1: Report Generation (0s) ---
        addLog('SYSTEM', 'Running server-side automated scheduler simulation.');
        $('#step-generation').addClass('active');
        phase1Logs.forEach(log => {
            addLog(log.tag, log.msg);
        });

        // --- Step 2: Save to Bucket (2.0s) ---
        let id = setTimeout(() => {
            $('#step-generation').removeClass('active').addClass('completed');
            $('#step-bucket').addClass('active');
            phase2Logs.forEach(log => {
                addLog(log.tag, log.msg);
            });
        }, 2000);
        simTimeoutIds.push(id);

        // --- Step 3: Extract from Bucket (4.5s) ---
        id = setTimeout(() => {
            $('#step-bucket').removeClass('active').addClass('completed');
            $('#step-extraction').addClass('active');
            phase3Logs.forEach(log => {
                addLog(log.tag, log.msg);
            });
        }, 4500);
        simTimeoutIds.push(id);

        // --- Step 4: Dispatch Email (7.0s) ---
        id = setTimeout(() => {
            $('#step-extraction').removeClass('active').addClass('completed');
            $('#step-email').addClass('active');
            addLog('EMAIL', `Sending automated bank-wise messages to resolved recipients...`);
        }, 7000);
        simTimeoutIds.push(id);

        // Stagger phase 4 logs starting from 7.5s
        const dispatchLogs = phase4Logs.filter(log => !log.msg.includes('Sending automated bank-wise messages'));
        if (dispatchLogs.length > 0) {
            dispatchLogs.forEach((log, index) => {
                id = setTimeout(() => {
                    addLog(log.tag, log.msg);
                }, 7500 + index * 500); // 500ms stagger between each log
                simTimeoutIds.push(id);
            });

            // Completion timeout
            const totalDuration = Math.max(9500, 7500 + dispatchLogs.length * 500 + 500);
            id = setTimeout(() => {
                completeAllDispatches(dispatchesList);
            }, totalDuration);
            simTimeoutIds.push(id);
        } else {
            id = setTimeout(() => {
                completeAllDispatches(dispatchesList);
            }, 9500);
            simTimeoutIds.push(id);
        }

        function completeAllDispatches(dispatchesList) {
            $('#step-email').removeClass('active').addClass('completed');
            addLog('SYSTEM', `Daily scheduler process completed successfully for all banks.`);
            
            const toast = $('#simToast');
            toast.addClass('show');
            setTimeout(() => {
                toast.removeClass('show');
            }, 4000);

            if (dispatchesList.length > 0) {
                downloadDemoFile(dispatchesList[0].bank, dateStr);
                addLog('SYSTEM', `Auto-downloaded demo file [${dispatchesList[0].csvFilename}] locally to simulate mail attachment.`);
            }

            setupMockEmailTabs(dispatchesList);
            btn.prop('disabled', false);
        }
    }

    $('#btnStartSim').on('click', function () {
        const btn = $(this);
        btn.prop('disabled', true);
        
        // Reset timeline UI
        $('.sim-step').removeClass('active completed');
        
        const now = new Date();
        const dateStr = now.getFullYear() + '-' + 
            String(now.getMonth() + 1).padStart(2, '0') + '-' + 
            String(now.getDate()).padStart(2, '0');

        // Clear existing timeouts if any
        simTimeoutIds.forEach(clearTimeout);
        simTimeoutIds = [];

        addLog('SYSTEM', 'Connecting to Vercel backend simulation API...');
        
        $.ajax({
            url: '/api/simulate',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                emails: emails,
                emailConfig: emailConfig,
                origin: window.location.origin
            }),
            timeout: 10000,
            success: function(response) {
                runServerSimulation(btn, response, dateStr);
            },
            error: function(xhr, status, err) {
                console.warn('Backend simulation failed, running client fallback:', err || status);
                runClientOnlySimulation(btn, dateStr);
            }
        });
    });

    // Modal click bindings
    $('#btnCloseEmailModal, #btnDismissEmailModal').on('click', function () {
        $('#mockEmailModalOverlay').hide();
    });

    // Tab switcher handler
    $(document).on('click', '#emailModalTabs .nav-link', function () {
        $('#emailModalTabs .nav-link').removeClass('active');
        $(this).addClass('active');
        const index = $(this).data('index');
        renderMockEmailContent(index);
    });

    $(document).on('click', '#btnDownloadEmailAttachment', function () {
        const now = new Date();
        const dateStr = now.getFullYear() + '-' + 
            String(now.getMonth() + 1).padStart(2, '0') + '-' + 
            String(now.getDate()).padStart(2, '0');
        if (currentModalDispatches && currentModalDispatches[activeModalTabIndex]) {
            const disp = currentModalDispatches[activeModalTabIndex];
            downloadDemoFile(disp.bank, dateStr);
        } else {
            downloadDemoFile('HDFC Bank', dateStr);
        }
    });

    $('#btnSendRealMail').on('click', function () {
        if (!currentModalDispatches || currentModalDispatches.length === 0 || !currentModalDispatches[activeModalTabIndex]) {
            alert('No active email loaded to draft.');
            return;
        }
        const disp = currentModalDispatches[activeModalTabIndex];
        const recipientList = disp.recipients.join(',');
        const subject = encodeURIComponent(disp.subject);
        const body = encodeURIComponent(disp.message);
        
        window.location.href = `mailto:${recipientList}?subject=${subject}&body=${body}`;
        addLog('EMAIL', `Opened local mail client to draft email for [${disp.bank}] to: [${recipientList}]`);
    });

    // Initialize Page
    loadEmails();
    renderEmails();
    loadEmailConfig();
    loadLogs();
    renderLogs();

    // Check for auto-download parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const downloadParam = urlParams.get('download');
    if (downloadParam) {
        const lastHyphenIndex = downloadParam.lastIndexOf('-');
        if (lastHyphenIndex !== -1) {
            const dateStr = downloadParam.substring(lastHyphenIndex + 1);
            const bankSlug = downloadParam.substring(0, lastHyphenIndex);
            
            let bankName = "All Banks";
            if (bankSlug === "hdfc_bank") bankName = "HDFC Bank";
            else if (bankSlug === "icici_bank") bankName = "ICICI Bank";
            else if (bankSlug === "axis_bank") bankName = "Axis Bank";
            else if (bankSlug === "sbi") bankName = "SBI";
            else if (bankSlug === "yes_bank") bankName = "Yes Bank";
            else if (bankSlug === "kotak_bank") bankName = "Kotak Bank";
            else bankName = bankSlug; // fallback
            
            if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
                setTimeout(() => {
                    downloadDemoFile(bankName, dateStr);
                    addLog('SYSTEM', `Auto-downloaded report file for ${bankName} date: ${dateStr} (triggered via email download link)`);
                }, 1000);
            }
        }
    }
});
