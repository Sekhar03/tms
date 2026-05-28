$(document).ready(function () {
    let selectedFile = null;

    // Sidebar toggler for mobile responsiveness
    $('.sidebar-toggle-btn').on('click', function () {
        $('.isu-sidebar').toggleClass('show');
    });

    // Helper: Get URL query parameters
    function getUrlParameter(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name) || '';
    }

    /* 1. REPORTS SELECTION PAGE (reports.html) */
    if ($('#reportsSelectForm').length) {
        // Pre-fill fields if returning back from upload step
        const urlBank = getUrlParameter('bank');
        const urlReport = getUrlParameter('reportType');
        if (urlBank) $('#bankSelect').val(urlBank);
        if (urlReport) $('#reportTypeSelect').val(urlReport);

        $('#reportsSelectForm').on('submit', function (e) {
            e.preventDefault();
            const form = this;
            const bankSelect = $('#bankSelect');
            const reportTypeSelect = $('#reportTypeSelect');

            if (!form.checkValidity()) {
                e.stopPropagation();
                $(form).addClass('was-validated');
                return;
            }

            const bank = bankSelect.val();
            const reportType = reportTypeSelect.val();

            // Redirect to upload page with selection params
            window.location.href = `upload.html?bank=${encodeURIComponent(bank)}&reportType=${encodeURIComponent(reportType)}`;
        });
    }

    /* 2. UPLOAD PAGE (upload.html) */
    if ($('#reportsUploadForm').length) {
        const bank = getUrlParameter('bank');
        const reportType = getUrlParameter('reportType');

        // Redirect back to select if parameters are missing
        if (!bank || !reportType) {
            window.location.href = 'reports.html';
            return;
        }

        // Display selected information
        $('#display-selected-bank').text(bank);
        $('#display-selected-report-type').text(reportType);

        // Back button handler (preserve state)
        $('#btn-upload-back').on('click', function () {
            window.location.href = `reports.html?bank=${encodeURIComponent(bank)}&reportType=${encodeURIComponent(reportType)}`;
        });

        // Drag & drop file selection
        const dropZone = $('#drop-zone');
        const fileInput = $('#fileInput');
        const fileErrorMessage = $('#file-error-message');

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.on(eventName, function (e) {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.on(eventName, function () {
                dropZone.addClass('dragover');
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.on(eventName, function () {
                dropZone.removeClass('dragover');
            });
        });

        dropZone.on('drop', function (e) {
            const dt = e.originalEvent.dataTransfer;
            const files = dt.files;
            if (files.length > 0) {
                handleFileSelection(files[0]);
            }
        });

        fileInput.on('change', function () {
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
            fileErrorMessage.addClass('d-none');
            $('.upload-prompt').addClass('d-none');
            $('.file-name-display').text(file.name);
            $('.file-size-display').text(formatBytes(file.size));
            $('.file-info').removeClass('d-none');
        }

        function showFileError(msg) {
            selectedFile = null;
            fileErrorMessage.text(msg).removeClass('d-none');
            $('.file-info').addClass('d-none');
            $('.upload-prompt').removeClass('d-none');
            fileInput.val('');
        }

        function formatBytes(bytes, decimals = 2) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const dm = decimals < 0 ? 0 : decimals;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
        }

        $('#remove-file-btn').on('click', function (e) {
            e.stopPropagation();
            resetFileUpload();
        });

        function resetFileUpload() {
            selectedFile = null;
            fileInput.val('');
            $('.file-info').addClass('d-none');
            $('.upload-prompt').removeClass('d-none');
            fileErrorMessage.addClass('d-none');
        }

        // Form Submit
        $('#reportsUploadForm').on('submit', function (e) {
            e.preventDefault();

            if (!selectedFile) {
                fileErrorMessage.text('File is required.').removeClass('d-none');
                return;
            }

            console.log("Submitting file and redirecting:", { bank, reportType, fileName: selectedFile.name });
            
            // Navigate directly to success page, passing the parameters
            const fileName = selectedFile.name;
            window.location.href = `success.html?bank=${encodeURIComponent(bank)}&reportType=${encodeURIComponent(reportType)}&fileName=${encodeURIComponent(fileName)}`;
        });
    }

    /* 3. SUCCESS PAGE COUNTDOWN (success.html) */
    if ($('#reports-success-step').length) {
        const bank = getUrlParameter('bank');
        const reportType = getUrlParameter('reportType');
        const fileName = getUrlParameter('fileName');

        console.log("Success page loaded with parameters:", { bank, reportType, fileName });

        let seconds = 3;

        // Dynamic success content setup
        if (reportType) {
            let msg = 'Merchant denied report uploaded successfully.';
            $('#reports-success-step .alert-success').html(`<i class="bi bi-check-circle-fill me-2"></i> ${msg}`);
        }

        $('#success-countdown').text(seconds);

        let successCountdownInterval = setInterval(function () {
            seconds--;
            $('#success-countdown').text(seconds);
            if (seconds <= 0) {
                clearInterval(successCountdownInterval);
                window.location.href = 'index.html';
            }
        }, 1000);

        // Copy bucket URL
        $(document).on('click', '#btnCopyBucketUrl', function () {
            const urlToCopy = $('#bucketUrlText').text();
            const btn = $(this);
            const done = () => {
                btn.html('<i class="bi bi-clipboard-check" style="color: #0b7570;"></i>');
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
    }

    /* 4. DYNAMIC TEMPLATE DOWNLOAD */
    $(document).on('click', '#download-sample-btn', function (e) {
        e.preventDefault();
        e.stopPropagation();

        const bank = getUrlParameter('bank') || 'General';
        const reportType = getUrlParameter('reportType') || 'Sample_Report';
        let csvContent = "data:text/csv;charset=utf-8,";
        let filename = `${bank.replace(/\s+/g, '_')}_${reportType.replace(/\s+/g, '_')}_template.csv`;

        if (reportType === 'Merchant Denial Report' || reportType === 'Merchant Denied Report') {
            csvContent += "Merchant ID,Merchant Name,Bank,Denial Reason,Denied Date,Status\n";
            csvContent += `M1001,ABC Store,${bank},Low Credit Score,2026-05-19,Rejected\n`;
            csvContent += `M1002,XYZ Retail,${bank},Invalid KYC Documents,2026-05-18,Rejected\n`;
        } else {
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
