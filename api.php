<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
date_default_timezone_set('UTC');

require_once 'config.php';
require_once 'api/helpers.php';
require_once 'api/orders.php';
require_once 'api/order_items.php';
require_once 'api/production_steps.php';
require_once 'api/customers.php';
require_once 'api/products.php';
require_once 'api/export.php';

header('Content-Type: application/json');
ini_set('display_errors', 0);
ini_set('log_errors', 1);

$conn = getDBConnection();
if (!$conn) {
    sendJSON(['success' => false, 'message' => 'Database connection failed']);
}

$action = $_GET['action'] ?? $_POST['action'] ?? '';

// Export is special - doesn't return JSON
if ($action === 'export') {
    exportData($conn);
    exit;
}

// Route to appropriate handler
switch ($action) {
    // Orders
    case 'fetch':
        fetchOrders($conn);
        break;
    case 'add_order':
        addOrder($conn);
        break;
    case 'update_order':
        updateOrder($conn);
        break;
    case 'delete_order':
        deleteOrder($conn);
        break;
    case 'duplicate_order':
        duplicateOrder($conn);
        break;
    
    // Order Items
    case 'add_item':
        addItem($conn);
        break;
    case 'update_item':
        updateItem($conn);
        break;
    case 'delete_item':
        deleteItem($conn);
        break;
    case 'duplicate_item':
        duplicateItem($conn);
        break;
    
    // Production Steps
    case 'add_step':
        addStep($conn);
        break;
    case 'update_step':
        updateStep($conn);
        break;
    case 'delete_step':
        deleteStep($conn);
        break;
    case 'duplicate_step':
        duplicateStep($conn);
        break;
    
    // Customers
    case 'search_customers':
        searchCustomers($conn);
        break;
    case 'get_customer':
        getCustomer($conn);
        break;
    case 'add_customer':
        addCustomer($conn);
        break;
    case 'update_customer':
        updateCustomer($conn);
        break;
    case 'delete_customer':
        deleteCustomer($conn);
        break;
    
    // Products
    case 'search_products':
        searchProducts($conn);
        break;
    case 'add_product':
        addProduct($conn);
        break;
    
    
    default:
        sendJSON(['success' => false, 'message' => 'Invalid action']);
}

$conn->close();