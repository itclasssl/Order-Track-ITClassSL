<?php
// Customer management functions

function searchCustomers($conn) {
    $term = $_GET['q'] ?? '';
    $sql = "SELECT Cust_id, Cust_Name, Cust_Email, Cust_Company FROM tbl_customer WHERE Cust_Status = 'Active' AND (Cust_Name LIKE ? OR Cust_Email LIKE ?) LIMIT 10";
    $stmt = $conn->prepare($sql);
    $search = "%{$term}%";
    $stmt->bind_param('ss', $search, $search);
    $stmt->execute();
    $result = $stmt->get_result();
    $customers = [];
    while ($row = $result->fetch_assoc()) {
        $customers[] = $row;
    }
    sendJSON(['success' => true, 'data' => $customers]);
}

function getCustomer($conn) {
    $id = (int)($_GET['id'] ?? 0);
    if ($id <= 0) sendJSON(['success' => false, 'message' => 'Invalid customer ID']);

    $stmt = $conn->prepare("SELECT * FROM tbl_customer WHERE Cust_id = ?");
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        sendJSON(['success' => false, 'message' => 'Customer not found']);
    }
    
    $customer = $result->fetch_assoc();
    sendJSON(['success' => true, 'data' => $customer]);
}

function addCustomer($conn) {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data) sendJSON(['success' => false, 'message' => 'Invalid JSON']);

    $name = trim($data['Cust_Name'] ?? '');
    $email = trim($data['Cust_Email'] ?? '');
    if (!$name || !$email) sendJSON(['success' => false, 'message' => 'Name and Email are required']);

    $stmt = $conn->prepare("SELECT Cust_id FROM tbl_customer WHERE Cust_Email = ?");
    $stmt->bind_param('s', $email);
    $stmt->execute();
    if ($stmt->get_result()->num_rows > 0) {
        sendJSON(['success' => false, 'message' => 'Email already exists']);
    }

    $company = trim($data['Cust_Company'] ?? '');
    $phone = trim($data['Cust_No'] ?? '');
    $address = trim($data['Cust_Address'] ?? '');

    $stmt = $conn->prepare("INSERT INTO tbl_customer (Cust_Name, Cust_Company, Cust_No, Cust_Email, Cust_Address, Cust_Status) VALUES (?, ?, ?, ?, ?, 'Active')");
    $stmt->bind_param('sssss', $name, $company, $phone, $email, $address);

    if ($stmt->execute()) {
        sendJSON(['success' => true, 'id' => $conn->insert_id, 'message' => 'Customer added']);
    } else {
        sendJSON(['success' => false, 'message' => 'Database error: ' . $stmt->error]);
    }
}

function updateCustomer($conn) {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data || !isset($data['id'])) sendJSON(['success' => false, 'message' => 'Invalid input']);

    $id = (int)$data['id'];
    $name = trim($data['Cust_Name'] ?? '');
    $email = trim($data['Cust_Email'] ?? '');
    
    if (!$name || !$email) sendJSON(['success' => false, 'message' => 'Name and Email are required']);

    // Check if email exists for another customer
    $stmt = $conn->prepare("SELECT Cust_id FROM tbl_customer WHERE Cust_Email = ? AND Cust_id != ?");
    $stmt->bind_param('si', $email, $id);
    $stmt->execute();
    if ($stmt->get_result()->num_rows > 0) {
        sendJSON(['success' => false, 'message' => 'Email already exists']);
    }

    $company = trim($data['Cust_Company'] ?? '');
    $phone = trim($data['Cust_No'] ?? '');
    $address = trim($data['Cust_Address'] ?? '');

    $stmt = $conn->prepare("UPDATE tbl_customer SET Cust_Name=?, Cust_Company=?, Cust_No=?, Cust_Email=?, Cust_Address=? WHERE Cust_id=?");
    $stmt->bind_param('sssssi', $name, $company, $phone, $email, $address, $id);

    if ($stmt->execute()) {
        sendJSON(['success' => true, 'message' => 'Customer updated successfully']);
    } else {
        sendJSON(['success' => false, 'message' => 'Database error: ' . $stmt->error]);
    }
}

function deleteCustomer($conn) {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = (int)($data['id'] ?? 0);
    if ($id <= 0) sendJSON(['success' => false, 'message' => 'Invalid ID']);

    // Check if customer has orders
    $stmt = $conn->prepare("SELECT COUNT(*) as count FROM orders WHERE customer_id = ?");
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $count = $stmt->get_result()->fetch_assoc()['count'];
    
    if ($count > 0) {
        sendJSON(['success' => false, 'message' => "Cannot delete customer with {$count} existing order(s). Delete orders first."]);
    }

    $stmt = $conn->prepare("DELETE FROM tbl_customer WHERE Cust_id = ?");
    $stmt->bind_param('i', $id);

    if ($stmt->execute()) {
        sendJSON(['success' => true, 'message' => 'Customer deleted successfully']);
    } else {
        sendJSON(['success' => false, 'message' => 'Database error: ' . $stmt->error]);
    }
}
?>