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
        let titleText = "Merchant Denied Report Upload";
        let noteText = "Note : File should contain merchant denied data only";
        let successMsg = "Merchant denied report uploaded successfully";

        $('#fileUploadContainer').show();
        $('.btn-upload-submit').text('Upload');

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

        const bank       = $('#bankSelect').val();
        const reportType = $('#reportTypeSelect').val();
        const fileErrorMsg = $('#file-error-message');

        let isValid = true;

        // Reset inline errors
        fileErrorMsg.addClass('d-none');
        $('#bankSelect').removeClass('is-invalid');
        $('#reportTypeSelect').removeClass('is-invalid');

        // Manual validation — do NOT use form.checkValidity()
        if (!bank)       { $('#bankSelect').addClass('is-invalid');       isValid = false; }
        if (!reportType) { $('#reportTypeSelect').addClass('is-invalid'); isValid = false; }
        if (!selectedFile) {
            fileErrorMsg.text('File is required. Please browse and select a file.').removeClass('d-none');
            isValid = false;
        }

        if (!isValid) return;

        console.log("Form submission validation passed:", { bank, reportType, fileName: selectedFile ? selectedFile.name : null });

        // Build success message
        let successMsg = 'Merchant denied report uploaded successfully';

        // Inject full modal HTML into overlay
        const overlay = $('#successModalOverlay');
        overlay.html(`
            <div style="background:white; width:100%; max-width:480px; border-radius:20px; box-shadow:0 10px 30px rgba(0,0,0,0.15); padding:32px; animation:scaleInCard 0.3s cubic-bezier(0.34,1.56,0.64,1); margin:16px;">
                <div style="text-align:center; margin-bottom:20px;">
                    <div style="width:80px; height:80px; border-radius:50%; border:3.5px solid #10b981; display:flex; align-items:center; justify-content:center; margin:0 auto 16px;">
                        <i class="bi bi-check-lg" style="font-size:3rem; color:#10b981;"></i>
                    </div>
                    <h4 style="font-weight:700; color:#1e293b; margin-bottom:8px;">Success</h4>
                    <p style="color:#64748b; font-size:0.88rem; margin-bottom:0;">${successMsg}</p>
                </div>
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

        // Auto-redirect: 3s
        let redirectTimer = setTimeout(() => { window.location.href = 'tms.html'; }, 3000);

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
        
        // Match sample file names: merchant_denied_sample.xlsx, indent_path_sample.xlsx, delivery_report_sample.xlsx
        let filename = `merchant_denied_sample.xlsx`;

        if (reportType === 'Merchant Denied Report') {
            csvContent += "Merchant ID,Merchant Name,Bank,Denial Reason,Denied Date,Status\n";
            csvContent += `M1001,ABC Store,${bank},Low Credit Score,2026-05-19,Rejected\n`;
            csvContent += `M1002,XYZ Retail,${bank},Invalid KYC Documents,2026-05-18,Rejected\n`;
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
