<?php
// Production Steps management functions

function addStep($conn) {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data) sendJSON(['success' => false, 'message' => 'Invalid JSON']);

    $item_id = (int)($data['item_id'] ?? 0);
    $step_name = trim($data['step_name'] ?? '');
    if ($item_id <= 0 || !$step_name) sendJSON(['success' => false, 'message' => 'Item ID and step name are required']);

    $step_order = (int)($data['step_order'] ?? 1);
    $status = $data['status'] ?? 'Pending';
    $assigned_to = trim($data['assigned_to'] ?? '');
    $start_date = !empty($data['start_date']) ? $data['start_date'] : null;
    $end_date = !empty($data['end_date']) ? $data['end_date'] : null;
    $notes = trim($data['notes'] ?? '');

    $stmt = $conn->prepare("INSERT INTO production_steps (item_id, step_name, step_order, status, assigned_to, start_date, end_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param('isisssss', $item_id, $step_name, $step_order, $status, $assigned_to, $start_date, $end_date, $notes);

    if ($stmt->execute()) {
        sendJSON(['success' => true, 'id' => $conn->insert_id, 'message' => 'Step added successfully']);
    } else {
        sendJSON(['success' => false, 'message' => 'Database error: ' . $stmt->error]);
    }
}

function updateStep($conn) {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data || !isset($data['id'])) sendJSON(['success' => false, 'message' => 'Invalid input']);

    $id = (int)$data['id'];
    $step_name = trim($data['step_name'] ?? '');
    $step_order = (int)($data['step_order'] ?? 1);
    $status = $data['status'] ?? 'Pending';
    $assigned_to = trim($data['assigned_to'] ?? '');
    $start_date = !empty($data['start_date']) ? $data['start_date'] : null;
    $end_date = !empty($data['end_date']) ? $data['end_date'] : null;
    $notes = trim($data['notes'] ?? '');

    $stmt = $conn->prepare("UPDATE production_steps SET step_name=?, step_order=?, status=?, assigned_to=?, start_date=?, end_date=?, notes=? WHERE id=?");
    $stmt->bind_param('sisssssi', $step_name, $step_order, $status, $assigned_to, $start_date, $end_date, $notes, $id);

    if ($stmt->execute()) {
        sendJSON(['success' => true, 'message' => 'Step updated successfully']);
    } else {
        sendJSON(['success' => false, 'message' => 'Database error: ' . $stmt->error]);
    }
}

function deleteStep($conn) {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = (int)($data['id'] ?? 0);
    if ($id <= 0) sendJSON(['success' => false, 'message' => 'Invalid ID']);

    $stmt = $conn->prepare("DELETE FROM production_steps WHERE id = ?");
    $stmt->bind_param('i', $id);

    if ($stmt->execute()) {
        sendJSON(['success' => true, 'message' => 'Step deleted successfully']);
    } else {
        sendJSON(['success' => false, 'message' => 'Database error: ' . $stmt->error]);
    }
}

function duplicateStep($conn) {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = (int)($data['id'] ?? 0);
    if ($id <= 0) sendJSON(['success' => false, 'message' => 'Invalid ID']);

    $stmt = $conn->prepare("SELECT * FROM production_steps WHERE id = ?");
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $step = $stmt->get_result()->fetch_assoc();
    if (!$step) sendJSON(['success' => false, 'message' => 'Step not found']);

    $stmt = $conn->prepare("INSERT INTO production_steps (item_id, step_name, step_order, status, assigned_to, start_date, end_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param('isisssss', $step['item_id'], $step['step_name'], $step['step_order'], $step['status'], $step['assigned_to'], $step['start_date'], $step['end_date'], $step['notes']);

    if ($stmt->execute()) {
        sendJSON(['success' => true, 'id' => $conn->insert_id, 'message' => 'Step duplicated successfully']);
    } else {
        sendJSON(['success' => false, 'message' => 'Database error: ' . $stmt->error]);
    }
}