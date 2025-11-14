<?php
// Shared helper functions

function sendJSON($data) {
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function getStatusClass($status) {
    $classes = [
        'Pending' => 'bg-warning text-dark',
        'Material' => 'bg-secondary',
        'Processing' => 'bg-info text-dark',
        'In Production' => 'bg-primary',
        'In Progress' => 'bg-primary',
        'Completed' => 'bg-success',
        'Cancelled' => 'bg-danger',
        'On Hold' => 'bg-secondary'
    ];
    return $classes[$status] ?? 'bg-secondary';
}

function generateOrderNumber($conn) {
    $year = date('Y');
    $stmt = $conn->prepare("SELECT COUNT(*) as count FROM orders WHERE YEAR(created_at) = ?");
    $stmt->bind_param('i', $year);
    $stmt->execute();
    $count = $stmt->get_result()->fetch_assoc()['count'] + 1;
    return "ORD-{$year}-" . str_pad($count, 4, '0', STR_PAD_LEFT);
}