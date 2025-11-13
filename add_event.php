<?php
// සියලුම දෝෂ දර්ශනය කරමු. මෙය debugging සඳහා වැදගත් වේ.
error_reporting(E_ALL);
ini_set('display_errors', 1);

// JSON ප්‍රතිචාරයක් යැවීම සඳහා header එකක් සකස් කරමු.
header('Content-Type: application/json');

// Database සම්බන්ධතා තොරතුරු
$servername = "localhost";
$username = "root"; // ඔබගේ database user name එක
$password = "";     // ඔබගේ database password එක
$dbname = "event_management"; // ඔබගේ database නම

// Database සම්බන්ධතාවය සාදමු
$conn = new mysqli($servername, $username, $password, $dbname);

// සම්බන්ධතාවය පරීක්ෂා කරමු
if ($conn->connect_error) {
    echo json_encode(['success' => false, 'message' => "Database සම්බන්ධතාවය අසාර්ථක විය: " . $conn->connect_error]);
    exit();
}

// POST request එකක්දැයි පරීක්ෂා කරමු.
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // අවශ්‍ය සියලුම fields තිබේදැයි පරීක්ෂා කරමු.
    $required_fields = ['eventName', 'eventDate', 'eventTime', 'eventLocation', 'facultyLabel', 'eventDescription', 'contactNumber1', 'audienceUniversity', 'financialType'];
    $missing_fields = [];
    foreach ($required_fields as $field) {
        if (!isset($_POST[$field]) || empty($_POST[$field])) {
            $missing_fields[] = $field;
        }
    }

    // poster එක උඩුගත කර තිබේදැයි පරීක්ෂා කරමු
    if (!isset($_FILES['eventPosterUpload']) || $_FILES['eventPosterUpload']['error'] !== UPLOAD_ERR_OK) {
        $missing_fields[] = 'eventPosterUpload';
    }

    if (!empty($missing_fields)) {
        echo json_encode(['success' => false, 'message' => "සියලුම අත්‍යවශ්‍ය සිදුවීම් විස්තර ක්ෂේත්‍ර පිරවිය යුතුය. අතුරුදහන් වූ ක්ෂේත්‍ර: " . implode(', ', $missing_fields)]);
        $conn->close();
        exit();
    }

    // ලැබෙන දත්ත ආරක්ෂිතව ලබා ගනිමු.
    $eventName = $conn->real_escape_string($_POST['eventName']);
    $eventDate = $conn->real_escape_string($_POST['eventDate']);
    $eventTime = $conn->real_escape_string($_POST['eventTime']);
    $eventLocation = $conn->real_escape_string($_POST['eventLocation']);
    $facultyLabel = $conn->real_escape_string($_POST['facultyLabel']);
    $eventDescription = $conn->real_escape_string($_POST['eventDescription']);
    $contactNumber1 = $conn->real_escape_string($_POST['contactNumber1']);
    $audienceUniversity = $_POST['audienceUniversity'] == 'on' ? 1 : 0; // Checkbox value to boolean
    $financialType = $_POST['financialType'];
    
    // financialType 'financial' නම්, අමතර fields පරීක්ෂා කරමු.
    $ticketPriceSpecial = null;
    $ticketPriceGeneral = null;
    $availableTickets = null;
    $beneficiaryName = null;
    $accountNumber = null;
    $bankNameLabel = null;
    $branchName = null;
    
    if ($financialType === 'financial') {
        $financial_fields = ['ticketPriceSpecial', 'ticketPriceGeneral', 'availableTickets', 'beneficiaryName', 'accountNumber', 'bankNameLabel', 'branchName'];
        foreach ($financial_fields as $field) {
            if (!isset($_POST[$field]) || empty($_POST[$field])) {
                echo json_encode(['success' => false, 'message' => "මුදල් සිදුවීමකට අත්‍යවශ්‍ය ක්ෂේත්‍ර පිරවිය යුතුය: " . $field]);
                $conn->close();
                exit();
            }
        }
        $ticketPriceSpecial = $conn->real_escape_string($_POST['ticketPriceSpecial']);
        $ticketPriceGeneral = $conn->real_escape_string($_POST['ticketPriceGeneral']);
        $availableTickets = $conn->real_escape_string($_POST['availableTickets']);
        $beneficiaryName = $conn->real_escape_string($_POST['beneficiaryName']);
        $accountNumber = $conn->real_escape_string($_POST['accountNumber']);
        $bankNameLabel = $conn->real_escape_string($_POST['bankNameLabel']);
        $branchName = $conn->real_escape_string($_POST['branchName']);
    }

    // poster image එක ගබඩා කරමු
    $target_dir = "uploads/";
    $timestamp = time(); // Unique timestamp
    $imageFileType = strtolower(pathinfo($_FILES["eventPosterUpload"]["name"], PATHINFO_EXTENSION));
    $target_file = $target_dir . "poster_" . $timestamp . "." . $imageFileType;

    // uploads folder එක නොමැති නම් සාදමු
    if (!is_dir($target_dir)) {
        mkdir($target_dir, 0777, true);
    }

    // ගොනුව server එකේ ගබඩා කරමු
    if (!move_uploaded_file($_FILES["eventPosterUpload"]["tmp_name"], $target_file)) {
        echo json_encode(['success' => false, 'message' => "පෝස්ටර් ගොනුව උඩුගත කිරීමේ දෝෂයක්."]);
        $conn->close();
        exit();
    }

    // SQL query එක සකස් කරමු (Prepared statement භාවිතා කරමින් SQL injection වලක්වමු)
    $sql = "INSERT INTO events (
        eventName, eventDate, eventTime, eventLocation, facultyLabel, eventDescription, 
        contactNumber1, audienceUniversity, financialType, ticketPriceSpecial, 
        ticketPriceGeneral, availableTickets, beneficiaryName, accountNumber, bankNameLabel, 
        branchName, eventPoster
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = $conn->prepare($sql);
    if ($stmt === false) {
        echo json_encode(['success' => false, 'message' => "Prepared statement සකස් කිරීම අසාර්ථක විය: " . $conn->error]);
        $conn->close();
        exit();
    }

    // Parameters bind කරමු
    $stmt->bind_param("sssssssiissssssss", 
        $eventName, $eventDate, $eventTime, $eventLocation, $facultyLabel, $eventDescription, 
        $contactNumber1, $audienceUniversity, $financialType, $ticketPriceSpecial, 
        $ticketPriceGeneral, $availableTickets, $beneficiaryName, $accountNumber, $bankNameLabel, 
        $branchName, $target_file
    );

    // SQL query එක ක්‍රියාත්මක කරමු
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => "සිදුවීම සාර්ථකව එකතු කරන ලදි."]);
    } else {
        echo json_encode(['success' => false, 'message' => "දත්ත එකතු කිරීමේ දෝෂයක්: " . $stmt->error]);
    }

    // Statement එක වසා දමමු
    $stmt->close();
} else {
    // POST request එකක් නොවේ නම්
    echo json_encode(['success' => false, 'message' => "වලංගු POST request එකක් නොවේ."]);
}

// Database සම්බන්ධතාවය වසා දමමු
$conn->close();
?>
