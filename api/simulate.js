// Serverless simulation flow
module.exports = async (req, res) => {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({ error: `Method ${req.method} not allowed` });
        return;
    }

    try {
        const { emails = [], emailConfig = {}, origin = 'http://localhost:8080' } = req.body || {};
        const dateStr = new Date().toISOString().split('T')[0];

        // Parse yesterday's date for GCS directories
        const dateObj = new Date();
        dateObj.setDate(dateObj.getDate() - 1);
        const yearStr = dateObj.getFullYear();
        const MONTHS_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthStr = MONTHS_LONG[dateObj.getMonth()];
        const dayStr = dateObj.getDate() + '-' + MONTHS_SHORT[dateObj.getMonth()];

        // 1. Determine active banks
        let activeBanks = [];
        if (emails.length > 0) {
            const directBanks = [...new Set(emails.map(item => item.bank))].filter(b => b !== 'Master');
            if (directBanks.length > 0) {
                activeBanks = directBanks;
            }
            if (emails.some(item => item.bank === 'Master') || activeBanks.length === 0) {
                if (!activeBanks.includes('HDFC Bank')) activeBanks.push('HDFC Bank');
                if (!activeBanks.includes('SBI')) activeBanks.push('SBI');
            }
        } else {
            activeBanks = ['HDFC Bank', 'SBI'];
        }

        const logEntries = [];
        const addServerLog = (tag, msg) => {
            const now = new Date();
            const timeStr = now.getFullYear() + '-' + 
                String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                String(now.getDate()).padStart(2, '0') + ' ' + 
                String(now.getHours()).padStart(2, '0') + ':' + 
                String(now.getMinutes()).padStart(2, '0') + ':' + 
                String(now.getSeconds()).padStart(2, '0');
            logEntries.push({ time: timeStr, tag, msg });
        };

        // --- Step 1: Fetch & Compile Indents ---
        addServerLog('SYSTEM', 'Initiating scheduled daily indent check (12:00 PM - 11:59 PM window)...');
        addServerLog('SYSTEM', `Fetched all daily indent files uploaded between 12:00 PM and 11:59 PM yesterday (${dayStr}).`);
        
        activeBanks.forEach(bank => {
            const bankFolder = bank.split(' ')[0].toUpperCase();
            addServerLog('SUCCESS', `Found indent files for bank [${bank}]. Filename: indent_records_${bankFolder.toLowerCase()}.xlsx`);
        });

        // --- Step 2: GCS Upload ---
        addServerLog('SYSTEM', `Initiating Google Cloud Storage bucket upload...`);
        addServerLog('GCS', `Authenticating with GCS bucket tms-indent-bucket.`);
        
        activeBanks.forEach(bank => {
            const bankFolder = bank.split(' ')[0].toUpperCase();
            addServerLog('GCS', `Uploading report file: [${bankFolder}/${yearStr}/${monthStr}/${dayStr}/indent_records_${bankFolder.toLowerCase()}.xlsx]`);
        });
        addServerLog('SUCCESS', `All compiled reports uploaded and archived successfully.`);

        // --- Step 3: Extract & Resolve ---
        addServerLog('SYSTEM', `Triggering automated email dispatch queue next day at 9:00 AM...`);
        addServerLog('EMAIL', `Resolving configured email recipient IDs bank-wise...`);

        if (emails.length === 0) {
            addServerLog('SYSTEM', `WARNING: No emails configured! Aborting email dispatch.`);
            res.status(200).json({ logs: logEntries, dispatches: [] });
            return;
        }

        let resolvedCount = 0;
        activeBanks.forEach(bank => {
            const bankRecipients = [...new Set(emails.filter(item => item.bank === bank || item.bank === 'Master').map(item => item.email))];
            if (bankRecipients.length > 0) {
                addServerLog('EMAIL', `Resolved recipients for [${bank}]: [${bankRecipients.join(', ')}]`);
                resolvedCount++;
            } else {
                addServerLog('EMAIL', `No recipients resolved for [${bank}]. Skipping report email.`);
            }
        });

        if (resolvedCount === 0) {
            addServerLog('SYSTEM', `WARNING: No active recipients resolved for compiled banks! Aborting email dispatch.`);
            res.status(200).json({ logs: logEntries, dispatches: [] });
            return;
        }

        addServerLog('EMAIL', `Connecting to GCS bucket endpoint, pulling active reports.`);
        addServerLog('EMAIL', `Sending automated bank-wise messages to resolved recipients...`);

        // Helper to compile CSV content by bank
        const generateCSVText = (bankName) => {
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
        };

        const dispatches = [];

        // Build dispatch items
        activeBanks.forEach(bank => {
            const bankRecipients = [...new Set(emails.filter(item => item.bank === bank || item.bank === 'Master').map(item => item.email))];
            if (bankRecipients.length === 0) return;

            const recipientListStr = bankRecipients.join(', ');
            const bankFolder = bank.split(' ')[0].toUpperCase();
            const filename = `indent_records_${bankFolder.toLowerCase()}.xlsx`;
            const bucketPath = `gs://tms-indent-bucket/${bankFolder}/${yearStr}/${monthStr}/${dayStr}/${filename}`;
            const downloadUrl = origin.split('?')[0] + '?download=' + bankFolder.toLowerCase() + '-' + dateStr;
            const csvData = generateCSVText(bank);
            const emailSubject = `Automated Indent Files Dispatch: ${bank} - ${dayStr} ${yearStr}`;

            dispatches.push({
                bank: bank,
                recipients: bankRecipients,
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
                    `Direct Download Link (Click to automatically download the indent file):\n` +
                    `${downloadUrl}\n\n` +
                    `Recipients: ${recipientListStr}\n\n` +
                    `Best Regards,\n` +
                    `iSupayX Terminal Automator`
            });
        });

        // Send dispatches
        for (let i = 0; i < dispatches.length; i++) {
            const dispatchObj = dispatches[i];
            addServerLog('EMAIL', `[${dispatchObj.bank}] Dispatching automated email to: ${dispatchObj.recipientListStr}...`);

            if (emailConfig.enabled) {
                if (emailConfig.provider === 'web3forms' && emailConfig.web3FormsKey) {
                    addServerLog('EMAIL', `[${dispatchObj.bank}] Attempting background email transmission via Web3Forms...`);

                    try {
                        let success = false;
                        let errMsg = '';
                        
                        // Fallback to JSON payload if FormData/Blob is unsupported in Vercel Node runtime
                        const response = await fetch('https://api.web3forms.com/submit', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Accept': 'application/json'
                            },
                            body: JSON.stringify({
                                access_key: emailConfig.web3FormsKey,
                                subject: dispatchObj.subject,
                                from_name: 'iSupayX Terminal Automator',
                                message: dispatchObj.message
                            })
                        });
                        
                        const data = await response.json();
                        success = data.success;
                        errMsg = data.message || 'Unknown Web3Forms Error';

                        if (success) {
                            addServerLog('SUCCESS', `[${dispatchObj.bank}] Email sent successfully via Web3Forms API!`);
                            dispatchObj.sentInBackground = true;
                            dispatchObj.provider = 'Web3Forms';
                        } else {
                            addServerLog('SYSTEM', `[${dispatchObj.bank}] WARNING: Web3Forms failed: ${errMsg}`);
                            dispatchObj.sentInBackground = false;
                        }
                    } catch (error) {
                        addServerLog('SYSTEM', `[${dispatchObj.bank}] ERROR: Web3Forms API request failed: ${error.message}`);
                        dispatchObj.sentInBackground = false;
                    }
                } else if (emailConfig.provider === 'emailjs') {
                    addServerLog('EMAIL', `[${dispatchObj.bank}] EmailJS configured. Dispatching from backend to EmailJS API...`);
                    try {
                        const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                service_id: emailConfig.emailJSServiceID,
                                template_id: emailConfig.emailJSTemplateID,
                                user_id: emailConfig.emailJSPublicKey,
                                template_params: {
                                    to_email: dispatchObj.recipientListStr,
                                    subject: dispatchObj.subject,
                                    bucket_path: dispatchObj.bucketPath,
                                    date: dateStr
                                }
                            })
                        });

                        if (response.ok) {
                            addServerLog('SUCCESS', `[${dispatchObj.bank}] Email sent successfully via EmailJS REST API!`);
                            dispatchObj.sentInBackground = true;
                            dispatchObj.provider = 'EmailJS';
                        } else {
                            const errText = await response.text();
                            addServerLog('SYSTEM', `[${dispatchObj.bank}] WARNING: EmailJS failed: ${errText}`);
                            dispatchObj.sentInBackground = false;
                        }
                    } catch (error) {
                        addServerLog('SYSTEM', `[${dispatchObj.bank}] ERROR: EmailJS REST API failed: ${error.message}`);
                        dispatchObj.sentInBackground = false;
                    }
                } else {
                    addServerLog('EMAIL', `[${dispatchObj.bank}] SMTP transport mock initiated. Email queued.`);
                    addServerLog('SUCCESS', `[${dispatchObj.bank}] Mock email dispatched successfully.`);
                    dispatchObj.sentInBackground = false;
                }
            } else {
                addServerLog('EMAIL', `[${dispatchObj.bank}] SMTP transport mock initiated. Email queued.`);
                addServerLog('SUCCESS', `[${dispatchObj.bank}] Mock email dispatched successfully.`);
                dispatchObj.sentInBackground = false;
            }
        }

        addServerLog('SYSTEM', `Daily scheduler process completed successfully for Master.`);
        res.status(200).json({ logs: logEntries, dispatches });

    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
};
