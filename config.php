<?php
if (in_array($_SERVER['HTTP_HOST'], ['localhost', '127.0.0.1', '::1'], true)) {
    define('ENVIRONMENT', 'local');
    define('DB_HOST', '127.0.0.1');
    define('DB_PORT', 3306);
    define('DB_NAME', 'order_tracking');
    define('DB_USER', 'root');
    define('DB_PASS', '');
    define('BASE_URL', 'http://localhost/your_project_folder/');
    define('site_title', 'Target Pack | Dashboard | Local TP');
} else {
    define('ENVIRONMENT', 'production');
    define('DB_HOST', '127.0.0.1'); // ðŸ‘ˆ Prefer IP over 'localhost'
    define('DB_PORT', 3306);
    define('DB_NAME', 'targetp2_db_tp');
    define('DB_USER', 'targetp2_db_tp_usr');
    define('DB_PASS', 'aXtMX4{#DoXS62Jt');
    define('BASE_URL', 'https://targetpack.lk/whm.targetpack.net/');
    define('site_title', 'Target Pack | Dashboard | TP');
}

function getDBConnection() {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT);
    if ($conn->connect_error) {
        error_log("DB Connect Error: " . $conn->connect_error);
        http_response_code(500);
        die(json_encode(['success' => false, 'message' => 'Server error']));
    }
    $conn->set_charset("utf8mb4");
    return $conn;
}