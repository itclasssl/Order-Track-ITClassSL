<?php
// Products management functions

function searchProducts($conn) {
    $term = $_GET['q'] ?? '';
    $sql = "SELECT id, name, default_size, default_color, default_material FROM products WHERE name LIKE ? LIMIT 10";
    $stmt = $conn->prepare($sql);
    $search = "%{$term}%";
    $stmt->bind_param('s', $search);
    $stmt->execute();
    $result = $stmt->get_result();
    $products = [];
    while ($row = $result->fetch_assoc()) {
        $products[] = $row;
    }
    sendJSON(['success' => true, 'data' => $products]);
}

function addProduct($conn) {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data) sendJSON(['success' => false, 'message' => 'Invalid JSON']);
    
    $name = trim($data['name'] ?? '');
    if (!$name) sendJSON(['success' => false, 'message' => 'Product name is required']);
    
    // Check uniqueness
    $stmt = $conn->prepare("SELECT id FROM products WHERE name = ?");
    $stmt->bind_param('s', $name);
    $stmt->execute();
    if ($stmt->get_result()->num_rows > 0) {
        sendJSON(['success' => false, 'message' => 'Product already exists']);
    }
    
    $size = trim($data['default_size'] ?? '');
    $color = trim($data['default_color'] ?? '');
    $material = trim($data['default_material'] ?? '');
    
    $stmt = $conn->prepare("INSERT INTO products (name, default_size, default_color, default_material) VALUES (?, ?, ?, ?)");
    $stmt->bind_param('ssss', $name, $size, $color, $material);
    
    if ($stmt->execute()) {
        sendJSON(['success' => true, 'id' => $conn->insert_id, 'message' => 'Product added']);
    } else {
        sendJSON(['success' => false, 'message' => 'Database error: ' . $stmt->error]);
    }
}