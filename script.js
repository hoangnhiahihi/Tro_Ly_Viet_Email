// ============================================
// AI Customer Email Assistant
// ============================================

// API KEY (chỉ dùng cho mục đích học tập)
const API_KEY = "AIzaSyBqJNi5T1nv6NLKb66n1So3mWXBHdAPIkM";


// ============================================
// Kiểm tra tên khách hàng chỉ chứa chữ
// ============================================

function isValidName(name) {
    const nameRegex = /^[a-zA-Zà-ỹÀ-Ỹ\s]+$/;
    return nameRegex.test(name.trim());
}

// Kiểm tra có chứa số hay không
function containsNumbers(str) {
    return /\d/.test(str);
}


// ============================================
// Xử lý khi trang load
// ============================================

document.addEventListener('DOMContentLoaded', function () {

    const customerNameInput = document.getElementById('customerName');

    if (customerNameInput) {

        // Kiểm tra realtime khi nhập
        customerNameInput.addEventListener('input', function () {

            const nameValue = this.value;
            const errorDiv = document.getElementById('nameError');

            // Nếu có số
            if (containsNumbers(nameValue)) {

                showErrorModal('❌ Lỗi: Tên khách hàng không được chứa ký tự số!\n\nVui lòng nhập lại.');

                this.value = nameValue.replace(/\d/g, '');
                this.focus();
                return;
            }

            // Kiểm tra ký tự hợp lệ
            if (nameValue && !isValidName(nameValue)) {

                errorDiv.style.display = 'block';
                this.style.borderColor = '#d32f2f';
                this.style.backgroundColor = '#ffebee';

            } else {

                errorDiv.style.display = 'none';
                this.style.borderColor = '#d4c5b9';
                this.style.backgroundColor = '#faf6f1';

            }
        });


        // Kiểm tra khi mất focus
        customerNameInput.addEventListener('blur', function () {

            const nameValue = this.value.trim();
            const errorDiv = document.getElementById('nameError');

            if (nameValue && !isValidName(nameValue)) {

                errorDiv.style.display = 'block';
                this.style.borderColor = '#d32f2f';
                this.style.backgroundColor = '#ffebee';

            } else {

                errorDiv.style.display = 'none';
                this.style.borderColor = '#d4c5b9';
                this.style.backgroundColor = '#faf6f1';

            }
        });
    }

    // Xử lý khi chọn loại nội dung email
    const emailTypeSelect = document.getElementById('emailType');
    if (emailTypeSelect) {
        emailTypeSelect.addEventListener('change', function () {
            const customEmailDiv = document.getElementById('customEmailDiv');
            const customEmailInput = document.getElementById('customEmailContent');
            
            if (this.value === 'custom') {
                customEmailDiv.style.display = 'block';
                customEmailInput.required = true;
            } else {
                customEmailDiv.style.display = 'none';
                customEmailInput.required = false;
                customEmailInput.value = '';
            }
        });
    }

    // Hiệu ứng click nút tạo email
    const createDraftBtn = document.getElementById('createDraftBtn');

    if (createDraftBtn) {

        createDraftBtn.addEventListener('click', function () {

            this.style.animation = 'none';

            setTimeout(() => {
                this.style.animation = '';
            }, 10);

        });

    }

});


// ============================================
// Tạo Email bằng AI
// ============================================

async function generateEmail() {

    // Lấy dữ liệu form
    const customerName = document.getElementById("customerName").value.trim();
    const productService = document.getElementById("productService").value.trim();
    const emailType = document.getElementById("emailType").value;
    const customEmailContent = document.getElementById("customEmailContent").value.trim();
    const detailInfo = document.getElementById("detailInfo").value.trim();


    // ============================================
    // VALIDATION
    // ============================================

    if (!customerName) {
        showErrorModal('Vui lòng nhập tên khách hàng!');
        return;
    }

    if (!isValidName(customerName) || containsNumbers(customerName)) {

        showErrorModal('❌ Lỗi: Tên khách hàng chỉ được chứa ký tự chữ!');

        document.getElementById('customerName').focus();
        return;
    }

    if (!productService) {
        showErrorModal('Vui lòng nhập tên sản phẩm/dịch vụ!');
        return;
    }

    if (!emailType) {
        showErrorModal('Vui lòng chọn loại nội dung email!');
        return;
    }

    if (emailType === 'custom' && !customEmailContent) {
        showErrorModal('Vui lòng nhập nội dung email tùy chỉnh!');
        document.getElementById('customEmailContent').focus();
        return;
    }

    if (!detailInfo) {
        showErrorModal('Vui lòng nhập thông tin cụ thể!');
        return;
    }


    // ============================================
    // PROMPT AI
    // ============================================

    const emailTypeDisplay = emailType === 'custom' ? customEmailContent : emailType;

    const prompt = `
You are a professional sales and customer service email writer.

Write an email using the following information:

Customer Name: ${customerName}
Product/Service: ${productService}
Email Type: ${emailTypeDisplay}
Detail Information: ${detailInfo}

Requirements:
1. Create an engaging email subject.
2. Write a professional email body.
3. Include a call-to-action (CTA).

Return format:

Subject:
<subject>

Email:
<email body>
`;


    try {

        // Hiển thị loading
        document.getElementById('emailContent').textContent = "Đang tạo email bằng AI...";
        document.getElementById('emailPreview').style.display = 'block';


        const response = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + API_KEY,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [{ text: prompt }]
                        }
                    ]
                })
            }
        );


        if (!response.ok) {
            throw new Error("API request failed");
        }

        const data = await response.json();

        const aiText = data.candidates[0].content.parts[0].text;


        // ============================================
        // TÁCH SUBJECT & EMAIL
        // ============================================

        let subject = "";
        let emailBody = "";

        if (aiText.includes("Email:")) {

            const parts = aiText.split("Email:");

            subject = parts[0].replace("Subject:", "").trim();
            emailBody = parts[1].trim();

        } else {

            emailBody = aiText;

        }


        // ============================================
        // HIỂN THỊ KẾT QUẢ
        // ============================================

        document.getElementById('emailContent').textContent =
            "Subject: " + subject + "\n\n" + emailBody;

        document.getElementById('emailPreview').style.display = 'block';


        // Thông báo thành công
        const successMsg = document.getElementById('successMessage');

        successMsg.classList.add('show');

        setTimeout(() => {
            successMsg.classList.remove('show');
        }, 4000);


        // Scroll xuống kết quả
        setTimeout(() => {

            document
                .getElementById('emailPreview')
                .scrollIntoView({ behavior: 'smooth' });

        }, 300);

    }

    catch (error) {

        console.error(error);

        showErrorModal("❌ Không thể tạo email. Vui lòng thử lại.");

    }

}


// ============================================
// Sao chép nội dung email
// ============================================

function copyToClipboard() {

    const emailContent = document.getElementById('emailContent').textContent;

    navigator.clipboard.writeText(emailContent)

        .then(() => {
            alert('✅ Nội dung email đã được sao chép!');
        })

        .catch(() => {
            alert('❌ Không thể sao chép. Vui lòng thử lại.');
        });

}


// ============================================
// Reset form
// ============================================

function resetForm() {

    document.getElementById('emailForm').reset();

    document.getElementById('emailPreview').style.display = 'none';

    document.getElementById('nameError').style.display = 'none';

    // Ẩn input tùy chỉnh
    const customEmailDiv = document.getElementById('customEmailDiv');
    if (customEmailDiv) {
        customEmailDiv.style.display = 'none';
    }

    const nameInput = document.getElementById('customerName');

    nameInput.style.borderColor = '#d4c5b9';
    nameInput.style.backgroundColor = '#faf6f1';

}


// ============================================
// Modal lỗi
// ============================================

function showErrorModal(message) {

    document.getElementById('errorMessage').textContent = message;

    document.getElementById('errorModal').style.display = 'block';

}


// Đóng modal
function closeErrorModal() {

    document.getElementById('errorModal').style.display = 'none';

}


// Click ngoài modal để đóng
window.onclick = function (event) {

    const modal = document.getElementById('errorModal');

    if (event.target == modal) {

        modal.style.display = 'none';

    }

}