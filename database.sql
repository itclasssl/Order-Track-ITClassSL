-- Drop and recreate clean schema
DROP TABLE IF EXISTS production_steps, order_items, products, orders, tbl_customer;

-- Customer table (unchanged)
CREATE TABLE tbl_customer (
    Cust_id INT AUTO_INCREMENT PRIMARY KEY,
    Cust_Name VARCHAR(100) NOT NULL,
    Cust_Company VARCHAR(100),
    Cust_No VARCHAR(20),
    Cust_Email VARCHAR(100) UNIQUE NOT NULL,
    Cust_Address TEXT NOT NULL,
    Cust_Status ENUM('Active', 'Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table (unchanged)
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    customer_id INT NOT NULL,
    start_date DATE,
    end_date DATE,
    status VARCHAR(50) DEFAULT 'Pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES tbl_customer(Cust_id) ON DELETE RESTRICT
);

-- ✅ NEW: Master product catalog
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL UNIQUE,
    default_size VARCHAR(100),
    default_color VARCHAR(100),
    default_material VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order items (now link to products)
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NULL,
    product_name VARCHAR(200) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    item_status VARCHAR(50) DEFAULT 'Pending',
    notes TEXT,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- Production steps (unchanged)
CREATE TABLE production_steps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT NOT NULL,
    step_name VARCHAR(100) NOT NULL,
    step_order INT NOT NULL DEFAULT 1,
    status VARCHAR(50) DEFAULT 'Pending',
    assigned_to VARCHAR(100),
    start_date DATE,
    end_date DATE,
    notes TEXT,
    FOREIGN KEY (item_id) REFERENCES order_items(id) ON DELETE CASCADE
);



CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL UNIQUE,
    default_size VARCHAR(100),
    default_color VARCHAR(100),
    default_material VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

