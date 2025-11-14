# Order Tracking System

A comprehensive order tracking system with full CRUD operations, tree view, pagination, search, sort, and export functionality.

## Features

✅ **Insert/Add** - Add new orders and items  
✅ **Delete** - Remove orders and items with confirmation  
✅ **Edit** - Update orders and items via modal forms  
✅ **Sort** - Click column headers to sort (ascending/descending)  
✅ **Pagination** - Navigate through pages (10/25/50/100 per page)  
✅ **Duplicate Row** - Clone orders with all their items  
✅ **Search** - Real-time search across multiple fields  
✅ **Export** - Export all data to CSV file  
✅ **Tree View** - Expandable sub-rows for order items  

## Installation

### Requirements
- PHP 7.4 or higher
- MySQL 5.7 or higher
- Apache/Nginx web server
- mod_rewrite enabled (for Apache)

### Step 1: Database Setup

1. Create a new MySQL database:
```sql
CREATE DATABASE order_tracking;
```

2. Import the database schema:
```bash
mysql -u root -p order_tracking < database.sql
```

Or manually run the SQL from `database.sql` in phpMyAdmin or MySQL Workbench.

### Step 2: Configure Database Connection

Edit `config.php` and update these lines with your database credentials:

```php
define('DB_HOST', 'localhost');
define('DB_USER', 'your_username');
define('DB_PASS', 'your_password');
define('DB_NAME', 'order_tracking');
```

### Step 3: Upload Files

Upload all files to your web server:
- database.sql
- config.php
- api.php
- index.html
- README.md

### Step 4: Set Permissions

Make sure the web server has read permissions:
```bash
chmod 644 *.php *.html
```

### Step 5: Access the Application

Open your browser and navigate to:
```
http://localhost/order-tracking/
```
Or
```
http://yourdomain.com/order-tracking/
```

## File Structure

```
order-tracking/
├── database.sql      # Database schema and sample data
├── config.php        # Database configuration
├── api.php          # Backend API handler
├── index.html       # Frontend interface
└── README.md        # This file
```

your-project/
├── api.php (main router)
└── api/
    ├── helpers.php (shared utilities)
    ├── orders.php (order CRUD operations)
    ├── order_items.php (item CRUD operations)
    ├── production_steps.php (step CRUD operations)
    ├── customers.php (customer operations)
    ├── products.php (product operations)
    └── export.php (CSV export functionality)

/js
  ├── main.js                // Core logic: pagination, search, sort, loadOrders, utilities
  ├── orders.js              // Order-related: add/edit/delete/duplicate order, expand/collapse
  ├── orderItems.js          // Item (order_item)-related: add/edit/delete/duplicate item
  ├── products.js            // Product autocomplete, add new product
  ├── productionSteps.js     // Step-related: add/edit/delete/duplicate step
  ├── customers.js           // Customer autocomplete, add new customer


## Usage

### Adding Orders
1. Click "Add Order" button
2. Fill in the order details
3. Click "Save"

### Adding Items to Orders
1. Click the green plus icon on any order row
2. Fill in the item details
3. Click "Save"

### Expanding Order Items
- Click the chevron icon (▶) to expand/collapse order items

### Editing
- Click the pencil icon to edit orders or items

### Duplicating
- Click the files icon to duplicate an order with all its items

### Deleting
- Click the trash icon to delete orders or items

### Searching
- Type in the search box to filter orders in real-time

### Sorting
- Click any column header to sort by that column

### Exporting
- Click "Export CSV" to download all orders as a CSV file

### Pagination
- Use the page selector to choose how many records per page
- Navigate using Previous/Next or page numbers

## Troubleshooting

### Issue: "Connection failed"
**Solution:** Check your database credentials in `config.php`

### Issue: "Table doesn't exist"
**Solution:** Make sure you've imported `database.sql` into your database

### Issue: "Access denied"
**Solution:** Verify your MySQL user has proper permissions on the database

### Issue: "500 Internal Server Error"
**Solution:** Check PHP error logs and ensure PHP version is 7.4+

### Issue: JSON parsing errors
**Solution:** Make sure there are no PHP errors/warnings. Check that `api.php` doesn't have any output before the JSON response.

## Security Notes

- Uses prepared statements to prevent SQL injection
- Input validation on both frontend and backend
- CSRF protection should be added for production use
- Consider adding authentication for production environments

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Opera (latest)

## License

Free to use and modify for personal and commercial projects.

## Support

For issues or questions, please check:
1. Database connection is working
2. All files are uploaded correctly
3. PHP error logs for detailed error messages
4. Browser console for JavaScript errors

## Credits

Built with:
- PHP & MySQL
- Bootstrap 5
- Bootstrap Icons
- Vanilla JavaScript