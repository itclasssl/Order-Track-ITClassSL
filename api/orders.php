<?php
// Orders management functions

function fetchOrders($conn) {
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
    $search = $_GET['search'] ?? '';
    $sortBy = $_GET['sortBy'] ?? 'id';
    $sortOrder = $_GET['sortOrder'] ?? 'DESC';

    $offset = ($page - 1) * $limit;
    $allowedColumns = ['id', 'order_number', 'customer_name', 'start_date', 'end_date', 'status'];
    if (!in_array($sortBy, $allowedColumns)) $sortBy = 'id';
    if ($sortBy === 'customer_name') $sortBy = 'c.Cust_Name';
    else $sortBy = "o.{$sortBy}";
    if (!in_array(strtoupper($sortOrder), ['ASC', 'DESC'])) $sortOrder = 'DESC';
    $sortOrder = strtoupper($sortOrder);

    $whereClause = '';
    $params = [];
    $types = '';

    if ($search !== '') {
        $whereClause = "WHERE (o.order_number LIKE ? OR c.Cust_Name LIKE ? OR c.Cust_Email LIKE ? OR o.status LIKE ?)";
        $term = "%$search%";
        $params = [$term, $term, $term, $term];
        $types = 'ssss';
    }

    // Total count
    $countSql = "SELECT COUNT(*) as total FROM orders o INNER JOIN tbl_customer c ON o.customer_id = c.Cust_id $whereClause";
    $stmt = $conn->prepare($countSql);
    if ($search !== '') $stmt->bind_param($types, ...$params);
    $stmt->execute();
    $total = $stmt->get_result()->fetch_assoc()['total'];

    // Fetch orders
    $sql = "SELECT o.*, c.Cust_Name as customer_name, c.Cust_Email as customer_email
            FROM orders o
            INNER JOIN tbl_customer c ON o.customer_id = c.Cust_id
            $whereClause
            ORDER BY $sortBy $sortOrder
            LIMIT ? OFFSET ?";
    $stmt = $conn->prepare($sql);
    if ($search !== '') {
        $stmt->bind_param($types . 'ii', ...array_merge($params, [$limit, $offset]));
    } else {
        $stmt->bind_param('ii', $limit, $offset);
    }
    $stmt->execute();
    
    $result = $stmt->get_result();
    $orders = [];
    while ($row = $result->fetch_assoc()) {
        $orders[] = $row;
    }

    // Fetch nested items and steps
    foreach ($orders as &$order) {
        $itemStmt = $conn->prepare("
            SELECT 
                oi.id,
                oi.order_id,
                oi.product_id,
                oi.product_name,
                oi.quantity,
                p.default_size AS size,
                p.default_color AS color,
                p.default_material AS material,
                oi.item_status,
                oi.notes
            FROM order_items oi
            LEFT JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?
            ORDER BY oi.id
        ");
        $itemStmt->bind_param('i', $order['id']);
        $itemStmt->execute();
        $itemResult = $itemStmt->get_result();
        $order['items'] = [];
        while ($item = $itemResult->fetch_assoc()) {
            // Fetch steps
            $stepStmt = $conn->prepare("SELECT * FROM production_steps WHERE item_id = ? ORDER BY step_order, id");
            $stepStmt->bind_param('i', $item['id']);
            $stepStmt->execute();
            $stepResult = $stepStmt->get_result();
            $steps = [];
            while ($step = $stepResult->fetch_assoc()) {
                $steps[] = $step;
            }
            $item['steps'] = $steps;
            $order['items'][] = $item;
        }
    }
    unset($order);

    sendJSON([
        'success' => true,
        'data' => $orders,
        'total' => $total,
        'page' => $page,
        'totalPages' => ceil($total / $limit)
    ]);
}

function addOrder($conn) {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data) sendJSON(['success' => false, 'message' => 'Invalid JSON']);

    $customer_id = (int)($data['customer_id'] ?? 0);
    if (!$customer_id) sendJSON(['success' => false, 'message' => 'Customer is required']);

    $order_number = generateOrderNumber($conn);
    $start_date = !empty($data['start_date']) ? $data['start_date'] : null;
    $end_date = !empty($data['end_date']) ? $data['end_date'] : null;
    $status = $data['status'] ?? 'Pending';
    $notes = trim($data['notes'] ?? '');

    $stmt = $conn->prepare("INSERT INTO orders (order_number, customer_id, start_date, end_date, status, notes) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->bind_param('sissss', $order_number, $customer_id, $start_date, $end_date, $status, $notes);

    if ($stmt->execute()) {
        sendJSON(['success' => true, 'id' => $conn->insert_id, 'message' => 'Order added successfully', 'order_number' => $order_number]);
    } else {
        sendJSON(['success' => false, 'message' => 'Database error: ' . $stmt->error]);
    }
}

function updateOrder($conn) {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data || !isset($data['id'])) sendJSON(['success' => false, 'message' => 'Invalid input']);

    $id = (int)$data['id'];
    $customer_id = (int)($data['customer_id'] ?? 0);
    if (!$customer_id) sendJSON(['success' => false, 'message' => 'Customer is required']);

    $order_number = trim($data['order_number'] ?? '');
    if (!$order_number) sendJSON(['success' => false, 'message' => 'Order number is required']);

    // Check if order_number is unique (excluding current order)
    $stmt = $conn->prepare("SELECT id FROM orders WHERE order_number = ? AND id != ?");
    $stmt->bind_param('si', $order_number, $id);
    $stmt->execute();
    if ($stmt->get_result()->num_rows > 0) {
        sendJSON(['success' => false, 'message' => 'Order number already exists']);
    }

    $start_date = !empty($data['start_date']) ? $data['start_date'] : null;
    $end_date = !empty($data['end_date']) ? $data['end_date'] : null;
    $status = $data['status'] ?? 'Pending';
    $notes = trim($data['notes'] ?? '');

    $stmt = $conn->prepare("UPDATE orders SET order_number=?, customer_id=?, start_date=?, end_date=?, status=?, notes=? WHERE id=?");
    $stmt->bind_param('sissssi', $order_number, $customer_id, $start_date, $end_date, $status, $notes, $id);

    if ($stmt->execute()) {
        sendJSON(['success' => true, 'message' => 'Order updated successfully']);
    } else {
        sendJSON(['success' => false, 'message' => 'Database error: ' . $stmt->error]);
    }
}

function deleteOrder($conn) {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = (int)($data['id'] ?? 0);
    if ($id <= 0) sendJSON(['success' => false, 'message' => 'Invalid ID']);

    $stmt = $conn->prepare("DELETE FROM orders WHERE id = ?");
    $stmt->bind_param('i', $id);

    if ($stmt->execute()) {
        sendJSON(['success' => true, 'message' => 'Order deleted successfully']);
    } else {
        sendJSON(['success' => false, 'message' => 'Database error: ' . $stmt->error]);
    }
}

function duplicateOrder($conn) {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = (int)($data['id'] ?? 0);
    if ($id <= 0) sendJSON(['success' => false, 'message' => 'Invalid ID']);

    $conn->begin_transaction();
    try {
        $stmt = $conn->prepare("SELECT * FROM orders WHERE id = ?");
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $order = $stmt->get_result()->fetch_assoc();
        if (!$order) throw new Exception('Order not found');

        $newOrderNumber = $order['order_number'] . '-COPY-' . time();
        $stmt = $conn->prepare("INSERT INTO orders (order_number, customer_id, start_date, end_date, status, notes) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->bind_param('sissss', $newOrderNumber, $order['customer_id'], $order['start_date'], $order['end_date'], $order['status'], $order['notes']);
        $stmt->execute();
        $newOrderId = $conn->insert_id;

        // Duplicate items
        $stmt = $conn->prepare("SELECT * FROM order_items WHERE order_id = ?");
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $itemResult = $stmt->get_result();
        $items = [];
        while ($row = $itemResult->fetch_assoc()) {
            $items[] = $row;
        }

        foreach ($items as $item) {
            $stmt = $conn->prepare("INSERT INTO order_items (order_id, product_id, product_name, quantity, item_status, notes) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->bind_param('iisiss', $newOrderId, $item['product_id'], $item['product_name'], $item['quantity'], $item['item_status'], $item['notes']);
            $stmt->execute();
            $newItemId = $conn->insert_id;

            // Duplicate steps
            $stepStmt = $conn->prepare("SELECT * FROM production_steps WHERE item_id = ?");
            $stepStmt->bind_param('i', $item['id']);
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
        }

        $conn->commit();
        sendJSON(['success' => true, 'id' => $newOrderId, 'message' => 'Order duplicated successfully']);
    } catch (Exception $e) {
        $conn->rollback();
        sendJSON(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
    }
}