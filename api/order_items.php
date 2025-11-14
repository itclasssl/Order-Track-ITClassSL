<?php
// Order Items management functions

function addItem($conn) {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data) {
        sendJSON(['success' => false, 'message' => 'Invalid JSON']);
    }

    $order_id = (int)($data['order_id'] ?? 0);
    $product_name = trim($data['product_name'] ?? '');
    if ($order_id <= 0 || !$product_name) {
        sendJSON(['success' => false, 'message' => 'Order ID and product name are required']);
    }

    $quantity = (int)($data['quantity'] ?? 1);
    $item_status = trim($data['item_status'] ?? 'Pending');
    $notes = trim($data['notes'] ?? '');
    $product_id = !empty($data['product_id']) ? (int)$data['product_id'] : null;

    $stmt = $conn->prepare("
        INSERT INTO order_items (order_id, product_id, product_name, quantity, item_status, notes)
        VALUES (?, ?, ?, ?, ?, ?)
    ");

    if (!$stmt) {
        sendJSON(['success' => false, 'message' => 'Prepare failed: ' . $conn->error]);
    }

    $stmt->bind_param('iisiss', $order_id, $product_id, $product_name, $quantity, $item_status, $notes);

    if ($stmt->execute()) {
        sendJSON(['success' => true, 'id' => $conn->insert_id, 'message' => 'Product added successfully']);
    } else {
        sendJSON(['success' => false, 'message' => 'Database error: ' . $stmt->error]);
    }
}

function updateItem($conn) {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data || !isset($data['id'])) {
        sendJSON(['success' => false, 'message' => 'Invalid input']);
    }

    $id = (int)$data['id'];
    $product_name = trim($data['product_name'] ?? '');
    $quantity = (int)($data['quantity'] ?? 1);
    $item_status = trim($data['item_status'] ?? 'Pending');
    $notes = trim($data['notes'] ?? '');
    $product_id = !empty($data['product_id']) ? (int)$data['product_id'] : null;

    $stmt = $conn->prepare("
        UPDATE order_items
        SET product_id = ?, product_name = ?, quantity = ?, item_status = ?, notes = ?
        WHERE id = ?
    ");

    if (!$stmt) {
        sendJSON(['success' => false, 'message' => 'Prepare failed: ' . $conn->error]);
    }

    $stmt->bind_param('isissi', $product_id, $product_name, $quantity, $item_status, $notes, $id);

    if ($stmt->execute()) {
        sendJSON(['success' => true, 'message' => 'Product updated successfully']);
    } else {
        sendJSON(['success' => false, 'message' => 'Database error: ' . $stmt->error]);
    }
}

function deleteItem($conn) {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data || !isset($data['id'])) {
        sendJSON(['success' => false, 'message' => 'Invalid input']);
    }

    $id = (int)$data['id'];
    $stmt = $conn->prepare("DELETE FROM order_items WHERE id = ?");
    if (!$stmt) {
        sendJSON(['success' => false, 'message' => 'Prepare failed: ' . $conn->error]);
    }

    $stmt->bind_param('i', $id);
    if ($stmt->execute()) {
        sendJSON(['success' => true, 'message' => 'Item deleted successfully']);
    } else {
        sendJSON(['success' => false, 'message' => 'Database error: ' . $stmt->error]);
    }
}

function duplicateItem($conn) {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = (int)($data['id'] ?? 0);
    if ($id <= 0) sendJSON(['success' => false, 'message' => 'Invalid ID']);

    $conn->begin_transaction();
    try {
        $stmt = $conn->prepare("SELECT * FROM order_items WHERE id = ?");
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $item = $stmt->get_result()->fetch_assoc();
        if (!$item) throw new Exception('Product not found');

        $stmt = $conn->prepare("INSERT INTO order_items (order_id, product_id, product_name, quantity, item_status, notes) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->bind_param('iisiss', $item['order_id'], $item['product_id'], $item['product_name'], $item['quantity'], $item['item_status'], $item['notes']);
        $stmt->execute();
        $newItemId = $conn->insert_id;

        $stepStmt = $conn->prepare("SELECT * FROM production_steps WHERE item_id = ?");
        $stepStmt->bind_param('i', $id);
        $stepStmt->execute();
        $stepResult = $stepStmt->get_result();
        $steps = [];
        while ($step = $stepResult->fetch_assoc()) {
            $steps[] = $step;
        }

        foreach ($steps as $step) {
            $s = $conn->prepare("INSERT INTO production_steps (item_id, step_name, step_order, status, assigned_to, start_date, end_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            $s->bind_param('isisssss', $newItemId, $step['step_name'], $step['step_order'], $step['status'], $step['assigned_to'], $step['start_date'], $step['end_date'], $step['notes']);
            $s->execute();
        }

        $conn->commit();
        sendJSON(['success' => true, 'id' => $newItemId, 'message' => 'Product duplicated successfully']);
    } catch (Exception $e) {
        $conn->rollback();
        sendJSON(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
    }
}