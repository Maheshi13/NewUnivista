// create_event.js



// Get all necessary elements from the HTML file
const eventPosterBox = document.getElementById('eventPosterBox');
const eventPosterUpload = document.getElementById('eventPosterUpload');
const eventPosterPreview = document.getElementById('eventPosterPreview');
const eventPosterPlaceholder = document.getElementById('eventPosterPlaceholder');
const financialYes = document.getElementById('financialYes');
const financialNo = document.getElementById('financialNo');
const ticketInfoSection = document.getElementById('ticketInfoSection');
const accountInfoSection = document.getElementById('accountInfoSection');
const ticketPriceSpecial = document.getElementById('ticketPriceSpecial');
const ticketPriceGeneral = document.getElementById('ticketPriceGeneral');
const availableTickets = document.getElementById('availableTickets');
const beneficiaryName = document.getElementById('beneficiaryName');
const accountNumber = document.getElementById('accountNumber');
const bankName = document.getElementById('bankName'); // Now a select element
const branchName = document.getElementById('branchName');
const eventCategorySelect = document.getElementById('eventCategory');
const facultySelect = document.getElementById('faculty');
const audienceUniversityCheckbox = document.getElementById('audienceUniversity');
const audienceGuestsCheckbox = document.getElementById('audienceGuests');
const audienceFacultyDropdownContainer = document.getElementById('audienceFacultyDropdownContainer');
const audienceFacultySelect = document.getElementById('audienceFacultySelect');
const eventPosterLogoOverlay = document.getElementById('eventPosterLogoOverlay');
const continueButton = document.getElementById('continueButton');
const validationMessageDiv = document.getElementById('validationMessage');
const contactNumber1 = document.getElementById('contactNumber1');
const contactNumber2 = document.getElementById('contactNumber2');
const eventNameInput = document.getElementById('eventName'); // Get the event name input


// --- Helper Functions ---

/**
 * Displays a validation message in the dedicated div.
 * @param {string} message The message to display.
 */
function showValidationMessage(message) {
    validationMessageDiv.textContent = message;
    validationMessageDiv.classList.remove('hidden');
}


/**
 * Hides the validation message div.
 */
function hideValidationMessage() {
    validationMessageDiv.classList.add('hidden');
    validationMessageDiv.textContent = '';
}

/**
 * Enables or disables an input element and handles its styling.
 * @param {HTMLElement} inputElement The input, select, or textarea element to modify.
 * @param {boolean} isEnabled True to enable, false to disable.
 */
function setInputEnabled(inputElement, isEnabled) {
    inputElement.disabled = !isEnabled;
    if (isEnabled) {
        inputElement.classList.remove('disabled-input');
    } else {
        inputElement.classList.add('disabled-input');
        // Clear value when disabled, but be careful with select
        if (inputElement.tagName !== 'SELECT') {
            inputElement.value = '';
        } else {
            // For select, reset to the first disabled option
            inputElement.value = "";
            handleSelectPlaceholder(inputElement);
        }
    }
}

/**
 * Handles the placeholder styling for select elements.
 * @param {HTMLSelectElement} selectElement The select element to style.
 */
function handleSelectPlaceholder(selectElement) {
    if (selectElement.value === "") {
        selectElement.classList.add('placeholder-text');
    } else {
        selectElement.classList.remove('placeholder-text');
    }
}

/**
 * Validates the contact number format for Sri Lankan numbers.
 * @param {string} number The number string to validate.
 * @returns {boolean} True if the number is valid, false otherwise.
 */
function isValidSriLankanNumber(number) {
    const srilankaPhoneRegex = /^07[0-9]{8}$/;
    const rawNumber = number.replace(/\s/g, '');
    return srilankaPhoneRegex.test(rawNumber);
}


// --- Event Handlers ---

/**
 * Handles the change event for the Financial Type radio buttons.
 * It toggles the visibility of financial-related sections and enables/disables inputs.
 */
function handleFinancialTypeChange() {
    const isFinancial = financialYes.checked;

    // Toggle visibility of sections
    ticketInfoSection.classList.toggle('hidden', !isFinancial);
    accountInfoSection.classList.toggle('hidden', !isFinancial);

    // Enable/disable inputs in Ticket Info section
    setInputEnabled(ticketPriceSpecial, isFinancial);
    setInputEnabled(availableTickets, isFinancial);
    setInputEnabled(ticketPriceGeneral, isFinancial);

    // Enable/disable inputs in Account Info section
    setInputEnabled(beneficiaryName, isFinancial);
    setInputEnabled(accountNumber, isFinancial);
    setInputEnabled(bankName, isFinancial);
    setInputEnabled(branchName, isFinancial);

    // Update the required status for the general price field
    updateGeneralPriceRequiredStatus();
}

/**
 * Updates the 'required' status of the `ticketPriceGeneral` field based on
 * whether the event is financial and if guests are allowed.
 */
function updateGeneralPriceRequiredStatus() {
    const isFinancialAndGuests = financialYes.checked && audienceGuestsCheckbox.checked;
    ticketPriceGeneral.required = isFinancialAndGuests;
    
    // Add/remove a visual cue (e.g., border color)
    if (isFinancialAndGuests) {
        ticketPriceGeneral.classList.add('border-indigo-500');
    } else {
        ticketPriceGeneral.classList.remove('border-indigo-500');
    }
}

/**
 * Handles the change event for the Audience "University Members" checkbox.
 * It toggles the visibility and 'required' status of the faculty dropdown.
 */
function handleAudienceUniversityChange() {
    const isUniversitySelected = audienceUniversityCheckbox.checked;
    audienceFacultyDropdownContainer.classList.toggle('hidden', !isUniversitySelected);
    audienceFacultySelect.required = isUniversitySelected;

    // Reset and style the dropdown
    if (!isUniversitySelected) {
        audienceFacultySelect.value = "";
    }
    handleSelectPlaceholder(audienceFacultySelect);
}

/**
 * Restricts input to letters and converts to uppercase.
 * @param {InputEvent} event The input event.
 */
function allowLettersAndUppercase(event) {
    event.target.value = event.target.value.replace(/[^a-zA-Z\s]/g, '').toUpperCase();
}

/**
 * Restricts input to numbers only.
 * @param {InputEvent} event The input event.
 */
function allowNumbersOnly(event) {
    event.target.value = event.target.value.replace(/[^0-9]/g, '');
}

/**
 * Formats a currency input to two decimal places on blur.
 * @param {FocusEvent} event The blur event.
 */
function formatCurrency(event) {
    let value = event.target.value.trim();
    if (value === '') return;

    value = value.replace(/[^0-9.]/g, '');
    value = value.replace(/(\..*)\./g, '$1');

    let numberValue = parseFloat(value);
    event.target.value = isNaN(numberValue) ? '' : numberValue.toFixed(2);
}

/**
 * Formats a phone number as "07X XXX XXXX" on keyup.
 * @param {KeyboardEvent} event The keyup event.
 */
function formatPhoneNumber(event) {
    let value = event.target.value.replace(/\D/g, ''); // Remove all non-digits
    let formattedValue = '';

    if (value.startsWith('07') && value.length > 2) {
        formattedValue += value.substring(0, 3);
        if (value.length > 3) {
            formattedValue += ' ' + value.substring(3, 6);
        }
        if (value.length > 6) {
            formattedValue += ' ' + value.substring(6, 10);
        }
    } else {
        formattedValue = value;
    }
    event.target.value = formattedValue;
}

/**
 * Capitalizes the first letter of each word in a string.
 * @param {InputEvent} event The input event.
 */
function capitalizeEachWord(event) {
    let value = event.target.value;
    value = value.replace(/\b\w/g, char => char.toUpperCase());
    event.target.value = value;
}

/**
 * Loads form data from sessionStorage on page load.
 */
function loadFormData() {
    const savedData = sessionStorage.getItem('eventFormData');
    if (savedData) {
        const data = JSON.parse(savedData);

        // Populate form fields from saved data
        eventNameInput.value = data.eventName || '';
        document.getElementById('eventDate').value = data.eventDate || '';
        document.getElementById('eventTime').value = data.eventTime || '';
        document.getElementById('eventLocation').value = data.eventLocation || '';
        document.getElementById('eventDescription').value = data.eventDescription || '';
        contactNumber1.value = data.contactNumber1 || '';
        contactNumber2.value = data.contactNumber2 || '';
        eventCategorySelect.value = data.eventCategory || '';
        facultySelect.value = data.faculty || '';
        audienceUniversityCheckbox.checked = data.audienceUniversity;
        audienceGuestsCheckbox.checked = data.audienceGuests;
        audienceFacultySelect.value = data.audienceFaculty || '';

        // Handle event poster
        if (data.eventPoster) {
            eventPosterPreview.src = data.eventPoster;
            eventPosterPreview.classList.remove('hidden');
            eventPosterPlaceholder.classList.add('hidden');
            eventPosterLogoOverlay.style.display = 'block';
        }

        // Handle financial details
        if (data.financialType === 'financial') {
            financialYes.checked = true;
            ticketPriceSpecial.value = data.ticketPriceSpecial || '';
            ticketPriceGeneral.value = data.ticketPriceGeneral || '';
            availableTickets.value = data.availableTickets || '';
            beneficiaryName.value = data.beneficiaryName || '';
            accountNumber.value = data.accountNumber || '';
            bankName.value = data.bankName || '';
            branchName.value = data.branchName || '';
        } else {
            financialNo.checked = true;
        }

        // Run initial handlers to set correct UI state
        handleFinancialTypeChange();
        handleAudienceUniversityChange();
        handleSelectPlaceholder(eventCategorySelect);
        handleSelectPlaceholder(facultySelect);
        handleSelectPlaceholder(audienceFacultySelect);
        handleSelectPlaceholder(bankName);
    }
}


// --- Main Validation Function ---

/**
 * Validates the entire form before saving data and redirecting.
 * @returns {boolean} True if the form is valid, false otherwise.
 */
function validateForm() {
    hideValidationMessage();

    // 1. Validate basic required fields
    const requiredFields = [eventNameInput, document.getElementById('eventDate'), document.getElementById('eventTime'),
        document.getElementById('eventLocation'), contactNumber1, eventCategorySelect, facultySelect];
    
    for (const field of requiredFields) {
        if (field.value.trim() === "") {
            showValidationMessage(`Please fill in the '${field.previousElementSibling.textContent.replace(':', '').trim()}' field.`);
            field.focus();
            return false;
        }
    }

    // 2. Validate Contact Numbers
    if (!isValidSriLankanNumber(contactNumber1.value)) {
        showValidationMessage("Contact Number 1 must be a valid Sri Lankan mobile number (e.g., 07XXXXXXXX).");
        contactNumber1.focus();
        return false;
    }
    if (contactNumber2.value.trim() !== "" && !isValidSriLankanNumber(contactNumber2.value)) {
        showValidationMessage("Contact Number 2 must be a valid Sri Lankan mobile number or left empty.");
        contactNumber2.focus();
        return false;
    }

    // 3. Validate Audience Category
    if (!audienceUniversityCheckbox.checked && !audienceGuestsCheckbox.checked) {
        showValidationMessage("Please select at least one Audience Category (University Members or Guests).");
        return false;
    }
    if (audienceUniversityCheckbox.checked && audienceFacultySelect.value === "") {
        showValidationMessage("Please select a Faculty for University Members or 'All Faculties'.");
        audienceFacultySelect.focus();
        return false;
    }

    // 4. Validate Event Poster
    if (!eventPosterPreview.src || eventPosterPreview.classList.contains('hidden')) {
        showValidationMessage('Please upload an event poster.');
        return false;
    }

    // 5. Validate Financial fields if selected
    if (financialYes.checked) {
        const financialRequiredFields = [ticketPriceSpecial, availableTickets, beneficiaryName, accountNumber, bankName, branchName];
        for (const field of financialRequiredFields) {
            if (field.value.trim() === "" || (field.tagName === 'SELECT' && field.value === "")) {
                showValidationMessage(`Please fill in the '${field.previousElementSibling.textContent.replace(':', '').trim()}' field under Financial Information.`);
                field.focus();
                return false;
            }
        }
        
        // Conditional validation for General Price
        if (audienceGuestsCheckbox.checked && (ticketPriceGeneral.value.trim() === "" || isNaN(parseFloat(ticketPriceGeneral.value)))) {
            showValidationMessage("General Price is required and must be a valid number if Guests are selected for a Financial event.");
            ticketPriceGeneral.focus();
            return false;
        }

        // Validate ticket counts
        if (isNaN(parseInt(availableTickets.value)) || parseInt(availableTickets.value) <= 0) {
            showValidationMessage("Available Tickets must be a positive number.");
            availableTickets.focus();
            return false;
        }
    }

    // All validations passed. Collect and store data.
    const formData = {
        eventName: eventNameInput.value.trim(),
        eventDate: document.getElementById('eventDate').value,
        eventTime: document.getElementById('eventTime').value,
        eventLocation: document.getElementById('eventLocation').value.trim(),
        eventCategory: eventCategorySelect.value,
        eventCategoryLabel: eventCategorySelect.options[eventCategorySelect.selectedIndex].text,
        faculty: facultySelect.value,
        facultyLabel: facultySelect.options[facultySelect.selectedIndex].text,
        eventDescription: document.getElementById('eventDescription').value.trim(),
        contactNumber1: contactNumber1.value.trim(),
        contactNumber2: contactNumber2.value.trim(),
        audienceUniversity: audienceUniversityCheckbox.checked,
        audienceGuests: audienceGuestsCheckbox.checked,
        audienceFaculty: audienceFacultySelect.value,
        audienceFacultyLabel: audienceFacultySelect.options[audienceFacultySelect.selectedIndex].text,
        eventPoster: eventPosterPreview.src || '',
        financialType: financialYes.checked ? 'financial' : 'non-financial'
    };

    if (formData.financialType === 'financial') {
        formData.ticketPriceSpecial = ticketPriceSpecial.value.trim();
        formData.ticketPriceGeneral = ticketPriceGeneral.value.trim();
        formData.availableTickets = availableTickets.value.trim();
        formData.beneficiaryName = beneficiaryName.value.trim();
        formData.accountNumber = accountNumber.value.trim();
        formData.bankName = bankName.value;
        formData.bankNameLabel = bankName.options[bankName.selectedIndex].text;
        formData.branchName = branchName.value.trim();
    }

    sessionStorage.setItem('eventFormData', JSON.stringify(formData));
    window.location.replace("details.html");
}


// --- Event Listeners Initialization ---

// Financial Type radio buttons
financialYes.addEventListener('change', handleFinancialTypeChange);
financialNo.addEventListener('change', handleFinancialTypeChange);

// Audience Checkboxes
audienceUniversityCheckbox.addEventListener('change', handleAudienceUniversityChange);
audienceGuestsCheckbox.addEventListener('change', updateGeneralPriceRequiredStatus);

// Dropdown placeholders
eventCategorySelect.addEventListener('change', () => handleSelectPlaceholder(eventCategorySelect));
facultySelect.addEventListener('change', () => handleSelectPlaceholder(facultySelect));
audienceFacultySelect.addEventListener('change', () => handleSelectPlaceholder(audienceFacultySelect));
bankName.addEventListener('change', () => handleSelectPlaceholder(bankName));

// Input validation and formatting
beneficiaryName.addEventListener('input', allowLettersAndUppercase);
branchName.addEventListener('input', allowLettersAndUppercase);
accountNumber.addEventListener('input', allowNumbersOnly);
ticketPriceSpecial.addEventListener('blur', formatCurrency);
ticketPriceGeneral.addEventListener('blur', formatCurrency);
contactNumber1.addEventListener('keyup', formatPhoneNumber);
contactNumber2.addEventListener('keyup', formatPhoneNumber);
eventNameInput.addEventListener('input', capitalizeEachWord);

// Continue button click handler
continueButton.addEventListener('click', validateForm);


// Event Poster upload and drag-and-drop
eventPosterBox.addEventListener('click', () => eventPosterUpload.click());
eventPosterBox.addEventListener('dragover', (event) => {
    event.preventDefault();
    eventPosterBox.classList.add('drag-over');
});
eventPosterBox.addEventListener('dragleave', () => eventPosterBox.classList.remove('drag-over'));
eventPosterBox.addEventListener('drop', (event) => {
    event.preventDefault();
    eventPosterBox.classList.remove('drag-over');
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            eventPosterPreview.src = e.target.result;
            eventPosterPreview.classList.remove('hidden');
            eventPosterPlaceholder.classList.add('hidden');
            eventPosterLogoOverlay.style.display = 'block';
        };
        reader.readAsDataURL(file);
    } else if (file) {
        console.log("Only image files are allowed.");
        // Clear UI if an invalid file was dropped
        eventPosterPreview.src = '';
        eventPosterPreview.classList.add('hidden');
        eventPosterPlaceholder.classList.remove('hidden');
        eventPosterLogoOverlay.style.display = 'none';
    }
});
eventPosterUpload.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            eventPosterPreview.src = e.target.result;
            eventPosterPreview.classList.remove('hidden');
            eventPosterPlaceholder.classList.add('hidden');
            eventPosterLogoOverlay.style.display = 'block';
        };
        reader.readAsDataURL(file);
    } else {
        // Clear UI if the file is invalid or no file is selected
        eventPosterPreview.src = '';
        eventPosterPreview.classList.add('hidden');
        eventPosterPlaceholder.classList.remove('hidden');
        eventPosterLogoOverlay.style.display = 'none';
    }
});


// Initial calls to set the correct state on page load
document.addEventListener('DOMContentLoaded', () => {
    loadFormData();
    handleFinancialTypeChange();
    handleSelectPlaceholder(eventCategorySelect);
    handleSelectPlaceholder(facultySelect);
    handleAudienceUniversityChange();
    handleSelectPlaceholder(bankName);
});
