<?php
// සියලුම දෝෂ දර්ශනය කරමු.
error_reporting(E_ALL);
ini_set('display_errors', 1);

// HTTP header එකක් සකස් කරමු.
header('Content-Type: text/html');

// HTML පිටුවේ සිට ලැබෙන සියලුම POST දත්ත නිවැරදිදැයි පරීක්ෂා කරමු.
// ඔබගේ මුල් PHP ගොනුවේ මේ හා සමාන තර්කනයක් තිබිය යුතුයි.
// මෙහිදී අපි `isset()` භාවිතා කරමින් field එකක් තිබේදැයි පමණක් පරීක්ෂා කරනවා.
// `financialType` 'financial' නම් පමණක් අදාළ fields පරීක්ෂා කළ යුතුයි.

$required_fields = ['eventName', 'eventDate', 'eventTime', 'eventLocation', 'facultyLabel', 'eventDescription', 'contactNumber1', 'audienceUniversity', 'financialType'];
$missing_fields = [];

foreach ($required_fields as $field) {
    if (!isset($_POST[$field]) || empty($_POST[$field])) {
        $missing_fields[] = $field;
    }
}

// Financial event එකක් නම්, අමතර fields පරීක්ෂා කරමු.
if (isset($_POST['financialType']) && $_POST['financialType'] === 'financial') {
    $financial_fields = ['ticketPriceSpecial', 'ticketPriceGeneral', 'availableTickets', 'beneficiaryName', 'accountNumber', 'bankNameLabel', 'branchName'];
    foreach ($financial_fields as $field) {
        if (!isset($_POST[$field]) || empty($_POST[$field])) {
            $missing_fields[] = $field;
        }
    }
}

// Event poster එක සඳහාද පරීක්ෂා කරමු.
if (!isset($_FILES['eventPosterUpload']) || $_FILES['eventPosterUpload']['error'] !== UPLOAD_ERR_OK) {
    // ගොනුවක් උඩුගත කර නොමැති විට හෝ දෝෂයක් ඇති විට
    // මෙය අත්‍යවශ්‍ය නොවේ නම්, ඔබට මෙම පරීක්ෂාව ඉවත් කළ හැකිය.
    // කෙසේ වෙතත්, ඔබේ මුල් කේතයේ මෙය අත්‍යවශ්‍ය විය හැකියි.
    // $missing_fields[] = 'eventPosterUpload';
}


// අතුරුදහන් වූ fields තිබේදැයි බලමු.
if (!empty($missing_fields)) {
    http_response_code(400); // Bad Request
    $missing_fields_str = implode(', ', $missing_fields);
    echo "<p style='color:red;'>අතුරුදහන් වූ අත්‍යවශ්‍ය ක්ෂේත්‍ර තිබේ: " . htmlspecialchars($missing_fields_str) . "</p>";
    exit();
}

// සියලුම දත්ත නිවැරදිව ලැබී ඇත්නම්, සාර්ථක පණිවිඩයක් ලබා දෙමු.
http_response_code(200);
echo "<p style='color:green;'>සියලුම දත්ත නිවැරදිව ලැබුණි. ඔබගේ PHP ගොනුවේ තර්කනය පරීක්ෂා කරන්න.</p>";
?>
