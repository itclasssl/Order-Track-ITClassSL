<?php
// Export functionality

function exportData($conn) {
    $sql = "SELECT o.*, 
        GROUP_CONCAT(
            CONCAT(oi.product_name, ' (Qty: ', oi.quantity, 
                IF(p.default_size != '', CONCAT(', Size: ', p.default_size), ''),
                IF(p.default_color != '', CONCAT(', Color: ', p.default_color), ''),
                IF(p.default_material != '', CONCAT(', Material: ', p.default_material), ''),
            ')') SEPARATOR '; '
        ) as items,
        c.Cust_Name as customer_name,
        c.Cust_Email as customer_email
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        LEFT JOIN products p ON oi.product_id = p.id
        LEFT JOIN tbl_customer c ON o.customer_id = c.Cust_id
        GROUP BY o.id
        ORDER BY o.id DESC";

    $result = $conn->query($sql);
    if (!$result) {
        error_log('Export SQL Error: ' . $conn->error);
        http_response_code(500);
        exit('Export failed: ' . $conn->error);
    }

    header('Content-Type: text/csv');
    header('Content-Disposition: attachment; filename="orders_export_' . date('Y-m-d') . '.csv"');

    $output = fopen('php://output', 'w');
    fputcsv($output, ['Order Number', 'Customer', 'Email', 'Start Date', 'End Date', 'Status', 'Products', 'Notes']);

    while ($row = $result->fetch_assoc()) {
        fputcsv($output, [
            $row['order_number'],
            $row['customer_name'] ?? '',
            $row['customer_email'] ?? '',
            $row['start_date'] ?? '',
            $row['end_date'] ?? '',
            $row['status'],
            $row['items'] ?? '',
            $row['notes'] ?? ''
        ]);
    }

    fclose($output);
    exit;
}