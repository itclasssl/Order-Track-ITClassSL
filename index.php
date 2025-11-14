<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Tracking System</title>
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Bootstrap Icons -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css" rel="stylesheet">
    <!-- Custom CSS -->
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container-fluid">
        <div class="header-container">
            <h1>
                <i class="bi bi-boxes"></i>
                Production Order Tracking System
            </h1>
        </div>
        <div class="table-container">
            <div class="toolbar">
                <button class="btn btn-primary" onclick="showAddOrderModal()">
                    <i class="bi bi-plus-circle"></i> New Order
                </button>
                <button class="btn btn-success" id="exportBtn">
                    <i class="bi bi-download"></i> Export CSV
                </button>
                <input type="text" class="form-control" id="searchInput" placeholder="🔍 Search..." style="max-width: 300px;">
                <select class="form-select" id="limitSelect" style="max-width: 150px;">
                    <option value="10">10 per page</option>
                    <option value="25">25 per page</option>
                    <option value="50">50 per page</option>
                    <option value="100">100 per page</option>
                </select>
                <span class="ms-auto" id="recordCount"></span>
            </div>
            <div class="table-responsive">
                <table class="table table-hover align-middle table-sm">
                    <thead>
                        <tr>
                            <th style="width: 30px;"></th>
                            <th style="width: 100px;">Order ID</th>
                            <th style="width: 150px;">Customer</th>
                            <th>Product</th>
                            <th style="width: 100px;">Start Date</th>
                            <th style="width: 100px;">End Date</th>
                            <th style="width: 100px;">Status</th>
                            <th style="width: 350px;">Production Steps</th>
                            <th style="width: 150px;">Notes</th>
                            <th style="width: 150px;">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="ordersTable"></tbody>
                </table>
            </div>
            <nav>
                <ul class="pagination justify-content-center mt-3" id="pagination"></ul>
            </nav>
        </div>
    </div>

    <!-- Include modals -->
    <?php include 'modals/order.html'; ?>    
    <?php include 'modals/customer.html'; ?>
    <?php include 'modals/product.html'; ?>
    <?php include 'modals/add-product.html'; ?>
    <?php include 'modals/step.html'; ?>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>

    <!-- Custom Modular JS -->
    <script src="js/main.js" defer></script>
    <script src="js/customers.js" defer></script>
    <script src="js/products.js" defer></script>
    <script src="js/orders.js" defer></script>
    <script src="js/orderItems.js" defer></script>
    <script src="js/productionSteps.js" defer></script>
</body>
</html>