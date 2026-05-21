$(document).ready(function () {
    // Sidebar toggler for mobile responsiveness
    $('.sidebar-toggle-btn').on('click', function () {
        $('.isu-sidebar').toggleClass('show');
    });

    // 1. EMAIL MANAGEMENT
    let emails = [];
    const defaultEmails = ['ops-lead@iserveu.in', 'bank-audit@firstbank.com'];

    // Load emails from LocalStorage
    function loadEmails() {
        const stored = localStorage.getItem('tms_automate_emails');
        if (stored) {
            emails = JSON.parse(stored);
        } else {
            emails = [...defaultEmails];
            localStorage.setItem('tms_automate_emails', JSON.stringify(emails));
        }
    }

    // Render Emails chips
    function renderEmails() {
        const container = $('#emailsContainer');
        container.empty();

        if (emails.length === 0) {
            container.append('<div class="w-100 text-muted text-center py-3 fs-7 border rounded bg-light" style="border-style: dashed !important;">No email recipients configured. Add email IDs above.</div>');
            return;
        }

        emails.forEach((email, index) => {
            const chip = $(`
                <div class="email-item" data-index="${index}">
                    <i class="bi bi-envelope text-teal"></i>
                    <span>${email}</span>
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
        const emailVal = input.val().trim();
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

        if (emails.includes(emailVal)) {
            input.addClass('is-invalid');
            errorMsg.text('This email ID is already configured.').removeClass('d-none');
            return;
        }

        // Add email
        emails.push(emailVal);
        localStorage.setItem('tms_automate_emails', JSON.stringify(emails));
        input.val('');
        renderEmails();

        // Write log
        addLog('SYSTEM', `Added recipient email ID: ${emailVal}`);
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
            addLog('SYSTEM', `Removed recipient email ID: ${emailDeleted}`);
        }, 200);
    });

    // 2. SIMULATION & LOGGING TERMINAL
    let logs = [];
    const defaultLogs = [
        { time: '2026-05-20 00:00:01', tag: 'SUCCESS', msg: 'Daily delivery report saved at gs://tms-delivery-bucket/reports/firstbank-2026-05-20.xlsx' },
        { time: '2026-05-20 09:00:05', tag: 'EMAIL', msg: 'Dispatched automated email with firstbank-2026-05-20.xlsx to ops-lead@iserveu.in, bank-audit@firstbank.com' }
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

    $('#btnStartSim').on('click', function () {
        const btn = $(this);
        btn.prop('disabled', true);
        
        // Reset timeline UI
        $('.sim-step').removeClass('active completed');
        
        const now = new Date();
        const dateStr = now.getFullYear() + '-' + 
            String(now.getMonth() + 1).padStart(2, '0') + '-' + 
            String(now.getDate()).padStart(2, '0');
        
        const filename = `firstbank-${dateStr}.xlsx`;
        const bucketPath = `gs://tms-delivery-bucket/reports/${filename}`;

        // Get recipients list string
        const recipientListStr = emails.length > 0 ? emails.join(', ') : 'No configured email recipients';

        // Clear existing timeouts if any
        simTimeoutIds.forEach(clearTimeout);
        simTimeoutIds = [];

        // --- Step 1: Report Generation (12:00 AM Simulation) ---
        addLog('SYSTEM', 'Initiating scheduled delivery report compilation (Simulated 12:00 AM Cron)...');
        $('#step-generation').addClass('active');

        // Step 1 Details
        let id = setTimeout(() => {
            addLog('SYSTEM', `Gathered Courier Dispatch logs, Terminal AWB logs, and Delivery logs.`);
            addLog('SUCCESS', `Successfully compiled daily delivery report sheet. Filename: ${filename}`);
            $('#step-generation').removeClass('active').addClass('completed');
            
            // --- Step 2: Save to Bucket (GCS Upload Simulation) ---
            addLog('SYSTEM', `Initiating Google Cloud Storage bucket upload...`);
            $('#step-bucket').addClass('active');
        }, 2000);
        simTimeoutIds.push(id);

        // Step 2 Details
        id = setTimeout(() => {
            addLog('GCS', `Authenticating with GCS bucket tms-delivery-bucket.`);
            addLog('GCS', `Uploading directory files: [reports/${filename}]`);
            addLog('SUCCESS', `Delivery report uploaded & archived at: ${bucketPath}`);
            $('#step-bucket').removeClass('active').addClass('completed');

            // --- Step 3: Extract from Bucket (Simulated 9:00 AM Cron) ---
            addLog('SYSTEM', `Initiating automated email dispatch queue (Simulated 9:00 AM Cron)...`);
            $('#step-extraction').addClass('active');
        }, 4500);
        simTimeoutIds.push(id);

        // Step 3 Details
        id = setTimeout(() => {
            addLog('EMAIL', `Resolving configured email recipient IDs...`);
            addLog('EMAIL', `Recipients configured: [${recipientListStr}]`);
            
            if (emails.length === 0) {
                addLog('SYSTEM', `WARNING: No emails configured! Aborting email dispatch.`);
                $('#step-extraction').removeClass('active');
                $('#step-email').removeClass('active');
                btn.prop('disabled', false);
                return;
            }

            addLog('EMAIL', `Connecting to GCS bucket endpoint, pulling file: ${bucketPath}`);
            addLog('EMAIL', `Successfully fetched and compiled attachment content (firstbank-${dateStr}.xlsx).`);
            $('#step-extraction').removeClass('active').addClass('completed');

            // --- Step 4: Dispatch Email ---
            addLog('EMAIL', `Sending automated message containing delivery report data to ${emails.length} recipients...`);
            $('#step-email').addClass('active');
        }, 7000);
        simTimeoutIds.push(id);

        // Step 4 Details & Final Success
        id = setTimeout(() => {
            if (emailConfig.enabled) {
                if (emailConfig.provider === 'web3forms' && emailConfig.web3FormsKey) {
                    addLog('EMAIL', `Attempting background email transmission via Web3Forms...`);
                    
                    const emailSubject = `Daily Delivery Report: firstbank-${dateStr}`;
                    const emailMessage = `Dear Operations Team,\n\n` +
                        `The daily scheduled Terminal Delivery Status report has been compiled and archived in our Google Cloud Storage bucket.\n\n` +
                        `Bucket Location:\n${bucketPath}\n\n` +
                        `Recipients: ${recipientListStr}\n\n` +
                        `Best Regards,\n` +
                        `iSupayX Terminal Automator`;

                    fetch('https://api.web3forms.com/submit', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify({
                            access_key: emailConfig.web3FormsKey,
                            subject: emailSubject,
                            from_name: 'iSupayX Terminal Automator',
                            message: emailMessage
                        })
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            addLog('SUCCESS', `Email sent successfully in background via Web3Forms!`);
                            completeDispatch(true, 'Web3Forms');
                        } else {
                            addLog('SYSTEM', `ERROR: Web3Forms background transmission failed: ${data.message || 'Unknown error'}`);
                            addLog('SYSTEM', `Falling back to manual modal draft simulation.`);
                            completeDispatch(false);
                        }
                    })
                    .catch(error => {
                        addLog('SYSTEM', `ERROR: Web3Forms API fetch request failed: ${error.message || error}`);
                        addLog('SYSTEM', `Falling back to manual modal draft simulation.`);
                        completeDispatch(false);
                    });

                } else if (emailConfig.provider === 'emailjs' && emailConfig.emailJSPublicKey && emailConfig.emailJSServiceID && emailConfig.emailJSTemplateID) {
                    addLog('EMAIL', `Attempting background email transmission via EmailJS...`);
                    
                    emailjs.send(emailConfig.emailJSServiceID, emailConfig.emailJSTemplateID, {
                        to_email: recipientListStr,
                        subject: `Daily Delivery Report: firstbank-${dateStr}`,
                        bucket_path: bucketPath,
                        date: dateStr
                    })
                    .then(function(response) {
                        addLog('SUCCESS', `Email sent successfully in background via EmailJS! (Response Status: ${response.status})`);
                        completeDispatch(true, 'EmailJS');
                    }, function(error) {
                        addLog('SYSTEM', `ERROR: EmailJS background transmission failed: ${JSON.stringify(error)}`);
                        addLog('SYSTEM', `Falling back to manual modal draft simulation.`);
                        completeDispatch(false);
                    });
                } else {
                    addLog('EMAIL', `MIME email successfully generated and queued for SMTP transport.`);
                    addLog('SUCCESS', `Automated email dispatched successfully to: ${recipientListStr}`);
                    completeDispatch(false);
                }
            } else {
                addLog('EMAIL', `MIME email successfully generated and queued for SMTP transport.`);
                addLog('SUCCESS', `Automated email dispatched successfully to: ${recipientListStr}`);
                completeDispatch(false);
            }

            function completeDispatch(isSentInBackground, providerName) {
                $('#step-email').removeClass('active').addClass('completed');
                addLog('SYSTEM', `Daily scheduler process completed successfully.`);
                
                // Show Success Toast
                const toast = $('#simToast');
                toast.addClass('show');
                setTimeout(() => {
                    toast.removeClass('show');
                }, 4000);

                // Populate and Show Mock Email Modal
                $('#emailToDisplay').text(recipientListStr);
                $('#emailSubjectDisplay').text(`Daily Delivery Report: firstbank-${dateStr}`);
                $('#emailBucketPathDisplay').text(`gs://tms-delivery-bucket/reports/firstbank-${dateStr}.xlsx`);
                $('#emailAttachmentNameDisplay').text(`firstbank-${dateStr}.csv`);
                
                // Trigger automatic demofile download for verification
                downloadDemoFile(dateStr);
                addLog('SYSTEM', `Auto-downloaded demo file [firstbank-${dateStr}.csv] locally to simulate mail attachment.`);

                // Show modal (with visual state based on whether real background send occurred)
                if (isSentInBackground) {
                    // Update header text to signify it actually sent
                    $('#mockEmailModalOverlay').find('.fs-6').text('Background Email Dispatched (Success)');
                    $('#mockEmailModalOverlay').find('.alert-info').removeClass('alert-info').addClass('alert-success').html(
                        `<i class="bi bi-check-circle-fill text-success fs-5 mt-0.5"></i>
                         <div>
                             <strong>Automated Dispatch Successful:</strong> The email has been sent successfully in the background to the configured recipients via ${providerName}. No additional manual steps are needed.
                         </div>`
                    );
                    $('#btnSendRealMail').hide(); // Hide draft button since it's already sent
                } else {
                    $('#mockEmailModalOverlay').find('.fs-6').text('Incoming Email Simulation');
                    // Reset modal styles/alert
                    $('#mockEmailModalOverlay').find('.alert-success').removeClass('alert-success').addClass('alert-info').html(
                        `<i class="bi bi-info-circle-fill text-primary fs-5 mt-0.5"></i>
                         <div>
                             <strong>Simulation Sandbox:</strong> Since this is a frontend portal, automated background emails cannot be sent. You can download the generated report below, or click <strong>Draft Real Email</strong> to open your local mail client with the recipients pre-filled.
                         </div>`
                    );
                    $('#btnSendRealMail').show();
                }

                $('#mockEmailModalOverlay').css('display', 'flex');
                btn.prop('disabled', false);
            }
        }, 9500);
        simTimeoutIds.push(id);
    });

    // Helper: Generate and download demo CSV file
    function downloadDemoFile(dateStr) {
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Delivery ID,Order ID,Bank,Courier Partner,AWB Number,Delivery Status,Estimated Delivery\n";
        csvContent += `DEL90021,ORD77309,FirstBank,BlueDart,AWB998822,Delivered,2026-05-19\n`;
        csvContent += `DEL90022,ORD77310,FirstBank,Delhivery,AWB998823,In Transit,2026-05-21\n`;
        csvContent += `DEL90023,ORD77311,FirstBank,Delhivery,AWB998824,Delivered,2026-05-20\n`;
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `firstbank-${dateStr}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Modal click bindings
    $('#btnCloseEmailModal, #btnDismissEmailModal').on('click', function () {
        $('#mockEmailModalOverlay').hide();
    });

    $('#btnDownloadEmailAttachment').on('click', function () {
        const now = new Date();
        const dateStr = now.getFullYear() + '-' + 
            String(now.getMonth() + 1).padStart(2, '0') + '-' + 
            String(now.getDate()).padStart(2, '0');
        downloadDemoFile(dateStr);
    });

    $('#btnSendRealMail').on('click', function () {
        if (emails.length === 0) {
            alert('No recipients configured to draft email.');
            return;
        }
        const recipientList = emails.join(',');
        const now = new Date();
        const dateStr = now.getFullYear() + '-' + 
            String(now.getMonth() + 1).padStart(2, '0') + '-' + 
            String(now.getDate()).padStart(2, '0');
        const subject = encodeURIComponent(`Daily Delivery Report: firstbank-${dateStr}`);
        const body = encodeURIComponent(
            `Dear Operations Team,\n\n` +
            `The daily scheduled Terminal Delivery Status report has been compiled and archived in our Google Cloud Storage bucket.\n\n` +
            `Bucket Location:\n` +
            `gs://tms-delivery-bucket/reports/firstbank-${dateStr}.xlsx\n\n` +
            `Please download the attached delivery report file generated from the dashboard.\n\n` +
            `Best Regards,\n` +
            `iSupayX Terminal Automator`
        );
        window.location.href = `mailto:${recipientList}?subject=${subject}&body=${body}`;
        addLog('EMAIL', `Opened local mail client to draft email to: [${emails.join(', ')}]`);
    });

    // Initialize Page
    loadEmails();
    renderEmails();
    loadEmailConfig();
    loadLogs();
    renderLogs();
});
