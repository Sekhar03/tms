$(document).ready(function () {
    let selectedFile = null;

    // Sidebar toggler for mobile responsiveness
    $('.sidebar-toggle-btn').on('click', function () {
        $('.isu-sidebar').toggleClass('show');
    });

    // Link custom browse button to native file input
    $('#browseBtn').on('click', function () {
        $('#fileInput').click();
    });

    // Handle native file input selection
    $('#fileInput').on('change', function () {
        if (this.files.length > 0) {
            handleFileSelection(this.files[0]);
        }
    });

    function handleFileSelection(file) {
        const allowedExtensions = /(\.xls|\.xlsx|\.csv)$/i;
        if (!allowedExtensions.exec(file.name)) {
            showFileError('Invalid file format. Please upload XLS, XLSX, or CSV.');
            return;
        }

        const maxSize = 10 * 1024 * 1024; // 10 MB
        if (file.size > maxSize) {
            showFileError('File exceeds maximum size of 10 MB.');
            return;
        }

        selectedFile = file;
        $('#fileNameDisplay').val(file.name);
        $('#file-error-message').addClass('d-none');
    }

    function showFileError(msg) {
        selectedFile = null;
        $('#fileNameDisplay').val('');
        $('#file-error-message').text(msg).removeClass('d-none');
        $('#fileInput').val('');
    }

    // Dynamic UI updates based on Select Report Type selection
    function updateReportTypeUI() {
        const reportType = $('#reportTypeSelect').val();
        let titleText = "Indent Path Submission";
        let noteText = "Submit request to generate indent path records";
        let successMsg = "Indent path report generated successfully";

        if (reportType === "Indent Path") {
            $('#fileUploadContainer').hide();
            $('.btn-upload-submit').text('Submit');
        } else {
            $('#fileUploadContainer').show();
            $('.btn-upload-submit').text('Upload');
            if (reportType === "Delivery Report") {
                titleText = "Delivery Report Upload";
                noteText = "Note : File should contain delivery report records only";
                successMsg = "Delivery report uploaded successfully";
            }
        }

        // Apply changes
        $('#dynamicCardTitle').text(titleText);
        $('#dynamicNote').text(noteText);
        $('#successPopupMsg').text(successMsg);
    }

    // Bind UI change handler
    $('#reportTypeSelect').on('change', updateReportTypeUI);
    updateReportTypeUI(); // Run once on load

    // Form Submission & Success Popup Trigger
    $('#tmsInventoryForm').on('submit', function (e) {
        e.preventDefault();

        const bank       = localStorage.getItem('selectedBank') || 'Bank of Baroda';
        const reportType = $('#reportTypeSelect').val();
        const fileErrorMsg = $('#file-error-message');

        let isValid = true;

        // Reset inline errors
        fileErrorMsg.addClass('d-none');
        $('#reportTypeSelect').removeClass('is-invalid');

        // Manual validation — do NOT use form.checkValidity()
        if (!reportType) { $('#reportTypeSelect').addClass('is-invalid'); isValid = false; }
        if (!selectedFile && reportType !== 'Indent Path') {
            fileErrorMsg.text('File is required. Please browse and select a file.').removeClass('d-none');
            isValid = false;
        }

        if (!isValid) return;

        console.log("Form submission validation passed:", { bank, reportType, fileName: selectedFile ? selectedFile.name : null });

        // Build success message
        let successMsg = '';
        if (reportType === 'Indent Path')   successMsg = 'Indent path report generated successfully';
        if (reportType === 'Delivery Report') successMsg = 'Delivery report uploaded successfully';

        // Build bucket section HTML only for Indent Path
        let bucketHtml = '';
        let consoleBucketUrl = '#';

        if (reportType === 'Indent Path') {
            const dateObj = new Date();
            const yearStr = dateObj.getFullYear();
            const MONTHS_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const monthStr = MONTHS_LONG[dateObj.getMonth()];
            const dayStr = dateObj.getDate() + '-' + MONTHS_SHORT[dateObj.getMonth()];
            const bankFolder = bank.split(' ')[0].toUpperCase();

            const fileName  = selectedFile ? selectedFile.name : 'indent_path_records.xlsx';
            const bucketUrl = `gs://tms-indent-bucket/${bankFolder}/${yearStr}/${monthStr}/${dayStr}/${fileName}`;
            consoleBucketUrl = `https://console.cloud.google.com/storage/browser/tms-indent-bucket/${bankFolder}/${yearStr}/${monthStr}/${dayStr}`;

            bucketHtml = `
                <div style="background:#f0faf9; border:1px solid #b2dfdb; border-radius:10px; padding:12px 14px; margin-bottom:16px;">
                    <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
                        <i class="bi bi-folder2-open" style="color:#229a92; font-size:1.1rem;"></i>
                        <span style="font-weight:600; font-size:0.88rem; color:#1e293b;">Bucket Path</span>
                    </div>
                    <div style="background:#e8f5f4; border:1px solid #b2dfdb; border-radius:6px; padding:6px 10px; display:flex; align-items:center; justify-content:space-between; gap:8px;">
                        <code id="bucketUrlText" style="font-size:0.78rem; color:#00695c; word-break:break-all; background:transparent; border:none; padding:0; flex:1;">${bucketUrl}</code>
                        <button type="button" id="btnCopyBucketUrl" title="Copy path" style="background:transparent; border:none; color:#229a92; padding:2px 6px; cursor:pointer; font-size:0.9rem; flex-shrink:0;">
                            <i class="bi bi-clipboard"></i>
                        </button>
                    </div>
                </div>
                <a href="${consoleBucketUrl}" id="btnGotoBucket" target="_blank"
                   style="display:flex; align-items:center; justify-content:center; width:100%; padding:10px 20px; background:#229a92; color:white; border:none; border-radius:8px; font-weight:600; font-size:0.92rem; text-decoration:none; margin-bottom:16px; transition:background 0.2s;"
                   onmouseover="this.style.background='#1c827b'" onmouseout="this.style.background='#229a92'">
                    <i class="bi bi-box-arrow-up-right" style="margin-right:8px;"></i>Go to Bucket
                </a>`;
        }

        // Inject full modal HTML into overlay
        const overlay = $('#successModalOverlay');
        overlay.html(`
            <div style="background:white; width:100%; max-width:480px; border-radius:20px; box-shadow:0 10px 30px rgba(0,0,0,0.15); padding:32px; animation:scaleInCard 0.3s cubic-bezier(0.34,1.56,0.64,1); margin:16px;">
                <div style="text-align:center; margin-bottom:20px;">
                    <div style="width:80px; height:80px; border-radius:50%; border:3.5px solid #10b981; display:flex; align-items:center; justify-content:center; margin:0 auto 16px;">
                        <i class="bi bi-check-lg" style="font-size:3rem; color:#10b981;"></i>
                    </div>
                    <h4 style="font-weight:700; color:#1e293b; margin-bottom:8px;">Success</h4>
                    <p style="color:#64748b; font-size:0.88rem; margin-bottom:${bucketHtml ? '20px' : '0'};">${successMsg}</p>
                </div>
                ${bucketHtml}
                <div style="text-align:right;">
                    <button type="button" id="btnSuccessOkay"
                        style="background:#10b981; color:white; border:none; border-radius:8px; padding:8px 30px; font-weight:600; font-size:0.95rem; cursor:pointer;"
                        onmouseover="this.style.background='#059669'" onmouseout="this.style.background='#10b981'">
                        Okay
                    </button>
                </div>
            </div>
        `);

        // Show the overlay as flex
        overlay.css('display', 'flex');

        // Auto-redirect: 8s for Indent Path, 3s for others
        const redirectDelay = (reportType === 'Indent Path') ? 8000 : 3000;
        let redirectTimer = setTimeout(() => { window.location.href = 'tms.html'; }, redirectDelay);

        // Okay button
        $(document).off('click', '#btnSuccessOkay').on('click', '#btnSuccessOkay', function () {
            clearTimeout(redirectTimer);
            window.location.href = 'tms.html';
        });

        // Copy bucket URL — delegated since button is injected
        $(document).off('click', '#btnCopyBucketUrl').on('click', '#btnCopyBucketUrl', function () {
            const urlToCopy = $('#bucketUrlText').text();
            const btn = $(this);
            const done = () => {
                btn.html('<i class="bi bi-clipboard-check" style="color:#10b981;"></i>');
                setTimeout(() => btn.html('<i class="bi bi-clipboard"></i>'), 2000);
            };
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(urlToCopy).then(done).catch(() => {
                    document.execCommand('copy'); done();
                });
            } else {
                const el = document.createElement('textarea');
                el.value = urlToCopy;
                document.body.appendChild(el); el.select();
                document.execCommand('copy');
                document.body.removeChild(el); done();
            }
        });
    });

    // Dynamic Sample template download based on selected Report Type
    $('#download-sample-btn').on('click', function (e) {
        e.preventDefault();
        
        const bank = $('#bankSelect').val() || 'Bank_of_Baroda';
        const reportType = $('#reportTypeSelect').val();

        if (!reportType) {
            alert('Please select a Report Type first to download its matching template.');
            return;
        }

        let csvContent = "data:text/csv;charset=utf-8,";
        
        // Match sample file names: indent_path_sample.xlsx, delivery_report_sample.xlsx
        let filename = `indent_path_sample.xlsx`;
        if (reportType === 'Delivery Report') {
            filename = `delivery_report_sample.xlsx`;
        }

        if (reportType === 'Indent Path') {
            csvContent += "Indent ID,Bank,Device Type,Path Code,Terminal ID,Dispatch Date\n";
            csvContent += `IND88392,${bank},Soundbox,PATH_MUM_01,T44890,2026-05-19\n`;
            csvContent += `IND88393,${bank},Soundbox,PATH_BLR_02,T44891,2026-05-18\n`;
        } else if (reportType === 'Delivery Report') {
            csvContent += "Delivery ID,Order ID,Bank,Courier Partner,AWB Number,Delivery Status,Estimated Delivery\n";
            csvContent += `DEL90021,ORD77309,${bank},BlueDart,AWB998822,Delivered,2026-05-19\n`;
            csvContent += `DEL90022,ORD77310,${bank},Delhivery,AWB998823,In Transit,2026-05-21\n`;
        }

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
});
