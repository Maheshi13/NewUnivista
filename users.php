<?php
// 1. දෝෂ වාර්තා කිරීම සක්‍රිය කිරීම (Enable Error Reporting)
// මෙය PHP දෝෂයන් browser එකේ පෙන්වීමට සලස්වයි.
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// echo "<h3>ලියාපදිංචි කිරීමේ ක්‍රියාවලිය ආරම්භ විය.</h3>"; // Debugging message - ලියාපදිංචිය සාර්ථක වූ පසු redirect වන බැවින් මෙය අවශ්‍ය නොවේ

// 2. දත්ත ගබඩා සම්බන්ධතා තොරතුරු (Database Connection Details)
$servername = "localhost";
$username = "root";     // XAMPP හි පෙරනිමි MySQL පරිශීලක නාමය
$password = "";         // XAMPP හි පෙරනිමි MySQL මුරපදය (හිස්)
$dbname = "univista_db"; // ඔබ phpMyAdmin හි සාදාගත් දත්ත ගබඩාවේ නම

// 3. දත්ත ගබඩාවට සම්බන්ධ වීම (Create Connection)
$conn = new mysqli($servername, $username, $password, $dbname);

// 4. සම්බන්ධතාවය පරීක්ෂා කිරීම (Check Connection)
if ($conn->connect_error) {
    die("දත්ත ගබඩා සම්බන්ධතාවය අසාර්ථකයි: " . $conn->connect_error); // දෝෂය පෙන්වා පිටවීම
}
// else {
//     echo "<p>දත්ත ගබඩා සම්බන්ධතාවය සාර්ථකයි.</p>"; // Debugging message - redirect වන බැවින් මෙය අවශ්‍ය නොවේ
// }

// 5. HTTP POST ඉල්ලීමක්දැයි පරීක්ෂා කිරීම (Check if the request method is POST)
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // echo "<p>POST ඉල්ලීමක් ලැබී ඇත.</p>"; // Debugging message - redirect වන බැවින් මෙය අවශ්‍ය නොවේ

    // 6. form දත්ත ලබා ගැනීම (Get form data)
    $name = $_POST['name'] ?? ''; // ?? '' දත්ත නැතිනම් හිස් string එකක් දීමට
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';
    $confirm_password = $_POST['confirm_password'] ?? '';

    // ලැබුණු POST දත්ත පරීක්ෂා කිරීම (Debugging $_POST data)
    // echo "<p>ලැබුණු දත්ත:</p><pre>"; // Debugging message - redirect වන බැවින් මෙය අවශ්‍ය නොවේ
    // print_r($_POST); // Debugging message - redirect වන බැවින් මෙය අවශ්‍ය නොවේ
    // echo "</pre>"; // Debugging message - redirect වන බැවින් මෙය අවශ්‍ය නොවේ

    // 7. මූලික දත්ත වලංගු කිරීම (Basic Validation)
    if (empty($name) || empty($email) || empty($password) || empty($confirm_password)) {
        echo "<p style='color:red;'>සියලුම ක්ෂේත්‍ර පිරවිය යුතුය.</p>";
        $conn->close();
        exit();
    }

    if ($password !== $confirm_password) {
        echo "<p style='color:red;'>මුරපද නොගැලපේ.</p>";
        $conn->close();
        exit();
    }

    // 8. මුරපදය හැෂ් කිරීම (Hash the password before storing)
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);
    // echo "<p>මුරපදය හැෂ් කරන ලදී.</p>"; // Debugging message - redirect වන බැවින් මෙය අවශ්‍ය නොවේ

    // 9. ඊමේල් ලිපිනය දැනටමත් ලියාපදිංචි වී ඇත්දැයි පරීක්ෂා කිරීම (Check if email already exists)
    // 'email' යනු ඔබේ primary key වන බැවින්, 'email' column එකම select කරන්න.
    $check_stmt = $conn->prepare("SELECT email FROM registered_users WHERE email = ?");
    if ($check_stmt === false) {
        echo "<p style='color:red;'>ඊමේල් පරීක්ෂා කිරීමේ Prepared Statement එක සෑදීමේ දෝෂයක්: " . $conn->error . "</p>";
        $conn->close();
        exit();
    }
    $check_stmt->bind_param("s", $email);
    $check_stmt->execute();
    $check_stmt->store_result();

    if ($check_stmt->num_rows > 0) {
        echo "<p style='color:red;'>මෙම ඊමේල් ලිපිනය දැනටමත් ලියාපදිංචි වී ඇත.</p>";
    } else {
        // 10. පරිශීලකයා දත්ත ගබඩාවට ඇතුළු කිරීම (Insert user into database)
        // 'registered_users' යනු ඔබේ වගුවේ නමයි.
        $insert_stmt = $conn->prepare("INSERT INTO registered_users (name, email, password) VALUES (?, ?, ?)");
        if ($insert_stmt === false) {
            echo "<p style='color:red;'>දත්ත ඇතුළු කිරීමේ Prepared Statement එක සෑදීමේ දෝෂයක්: " . $conn->error . "</p>";
            $conn->close();
            exit();
        }
        $insert_stmt->bind_param("sss", $name, $email, $hashed_password);

        if ($insert_stmt->execute()) {
            // echo "<p style='color:green;'>ලියාපදිංචිය සාර්ථකයි! දැන් ඔබට පිවිසිය හැක.</p>"; // මෙම පේළිය ඉවත් කර redirect කරන්න

            // සාර්ථක ලියාපදිංචියෙන් පසු login.html පිටුවට redirect කරන්න.
            header("Location: login.html");
            exit(); // redirect කිරීමෙන් පසු script එක නවත්වන්න
        } else {
            echo "<p style='color:red;'>දත්ත ඇතුළු කිරීමේ දෝෂයක්: " . $insert_stmt->error . "</p>";
        }
        $insert_stmt->close(); // Prepared statement එක වසා දමයි.
    }
    $check_stmt->close(); // Prepared statement එක වසා දමයි.
} else {
    echo "<p style='color:orange;'>මෙම පිටුවට POST ඉල්ලීමක් හරහා පිවිසිය යුතුය.</p>";
}
$conn->close(); // දත්ත ගබඩා සම්බන්ධතාවය වසා දමයි.
// echo "<h3>ලියාපදිංචි කිරීමේ ක්‍රියාවලිය අවසන් විය.</h3>"; // Debugging message - redirect වන බැවින් මෙයද අවශ්‍ය නොවේ
?>
