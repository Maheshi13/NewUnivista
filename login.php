<?php
// දෝෂ වාර්තා කිරීම සක්‍රිය කිරීම (Enable Error Reporting)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// දත්ත ගබඩා සම්බන්ධතා තොරතුරු (Database Connection Details)
$servername = "localhost";
$username = "root";     // XAMPP හි පෙරනිමි MySQL පරිශීලක නාමය
$password = "";         // XAMPP හි පෙරනිමි MySQL මුරපදය (හිස්)
$dbname = "univista_db"; // ඔබ phpMyAdmin හි සාදාගත් දත්ත ගබඩාවේ නම

// දත්ත ගබඩාවට සම්බන්ධ වීම (Create Connection)
$conn = new mysqli($servername, $username, $password, $dbname);

// සම්බන්ධතාවය පරීක්ෂා කිරීම (Check Connection)
if ($conn->connect_error) {
    die("දත්ත ගබඩා සම්බන්ධතාවය අසාර්ථකයි: " . $conn->connect_error);
}

// HTTP POST ඉල්ලීමක්දැයි පරීක්ෂා කිරීම (Check if the request method is POST)
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = $_POST['email'] ?? '';    // Login form එකෙන් එන email
    $input_password = $_POST['password'] ?? ''; // Login form එකෙන් එන password

    // මූලික දත්ත වලංගු කිරීම (Basic Validation)
    if (empty($email) || empty($input_password)) {
        echo "සියලුම ක්ෂේත්‍ර පිරවිය යුතුය.";
        $conn->close();
        exit();
    }

    // දත්ත ගබඩාවෙන් පරිශීලකයාගේ හැෂ් කළ මුරපදය ලබා ගැනීම
    // SQL Injection ප්‍රහාර වළක්වා ගැනීම සඳහා Prepared Statements භාවිතා කරයි.
    $stmt = $conn->prepare("SELECT password FROM registered_users WHERE email = ?");
    if ($stmt === false) {
        echo "Prepared Statement එක සෑදීමේ දෝෂයක්: " . $conn->error;
        $conn->close();
        exit();
    }
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows == 1) { // ඊමේල් ලිපිනයක් හමු වුවහොත්
        $stmt->bind_result($hashed_password_from_db); // දත්ත ගබඩාවෙන් හැෂ් කළ මුරපදය ලබා ගනී
        $stmt->fetch();

        // මුරපදය තහවුරු කිරීම (Password Verification)
        // පරිශීලකයා ඇතුළත් කළ මුරපදය (input_password) දත්ත ගබඩාවේ ඇති හැෂ් කළ මුරපදය (hashed_password_from_db) සමඟ ගැලපේදැයි පරීක්ෂා කරයි.
        if (password_verify($input_password, $hashed_password_from_db)) {
            // ලොග් වීම සාර්ථකයි!
            // මෙතනින් ඉදිරියට session එකක් ආරම්භ කර user login වූ බව සටහන් කරන්න පුළුවන්.
            // session_start();
            // $_SESSION['user_email'] = $email;

            echo "ලොග් වීම සාර්ථකයි! සාදරයෙන් පිළිගනිමු.";
            // සාර්ථක ලොග් වීමෙන් පසු mypage.html වෙත redirect කරන්න.
            header("Location: mypage.html");
            exit(); // redirect කිරීමෙන් පසු script එක නවත්වන්න
        } else {
            echo "වැරදි ඊමේල් හෝ මුරපදය."; // Invalid credentials
        }
    } else {
        echo "වැරදි ඊමේල් හෝ මුරපදය."; // Invalid credentials (email not found)
    }
    $stmt->close();
} else {
    echo "මෙම පිටුවට POST ඉල්ලීමක් හරහා පිවිසිය යුතුය.";
}
$conn->close(); // දත්ත ගබඩා සම්බන්ධතාවය වසා දමයි.
?>