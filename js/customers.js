// customers.js – Customer-related logic with Edit/Delete

let customerSearchTimeout;

// Customer search with debounce
document.getElementById('customerSearch')?.addEventListener('input', function(e) {
  clearTimeout(customerSearchTimeout);
  const term = e.target.value.trim();
  const dropdown = document.getElementById('customerDropdown');
  
  if (term.length < 2) {
    dropdown.style.display = 'none';
    return;
  }
  
  customerSearchTimeout = setTimeout(() => searchCustomersDropdown(term), 300);
});

// Show dropdown on focus if value exists
document.getElementById('customerSearch')?.addEventListener('focus', function() {
  const term = this.value.trim();
  if (term.length >= 2) {
    searchCustomersDropdown(term);
  }
});

// Search customers API call
async function searchCustomersDropdown(term) {
  const dropdown = document.getElementById('customerDropdown');
  
  try {
    const response = await fetch(`api.php?action=search_customers&q=${encodeURIComponent(term)}`);
    const data = await response.json();
    
    if (data.success) {
      window.AppState.customerCache = data.data;
      renderCustomerDropdown(data.data);
    }
  } catch (err) {
    console.error('Error searching customers:', err);
    dropdown.style.display = 'none';
  }
}

// Render customer dropdown with Edit/Delete icons
function renderCustomerDropdown(customers) {
  const dropdown = document.getElementById('customerDropdown');
  
  if (customers.length === 0) {
    dropdown.innerHTML = '<div class="list-group-item text-muted">No customers found. Click "+" to add.</div>';
    dropdown.style.display = 'block';
    return;
  }
  
  dropdown.innerHTML = customers.map(c => `
    <div class="customer-dropdown-item">
      <div class="customer-info" onclick="selectCustomer(${c.Cust_id}, '${escapeHtml(c.Cust_Name)}')">
        <div class="customer-name">${escapeHtml(c.Cust_Name)}</div>
        <div class="customer-details">${escapeHtml(c.Cust_Email)}${c.Cust_Company ? ' · ' + escapeHtml(c.Cust_Company) : ''}</div>
      </div>
      <div class="customer-actions">
        <i class="bi bi-pencil text-primary" onclick="editCustomerFromDropdown(${c.Cust_id}); event.stopPropagation();" title="Edit Customer"></i>
        <i class="bi bi-trash text-danger" onclick="deleteCustomerFromDropdown(${c.Cust_id}, '${escapeHtml(c.Cust_Name)}'); event.stopPropagation();" title="Delete Customer"></i>
      </div>
    </div>
  `).join('');
  
  dropdown.style.display = 'block';
}

// Select customer from dropdown
function selectCustomer(id, name) {
  document.getElementById('customerSearch').value = name;
  document.getElementById('selectedCustomerId').value = id;
  document.getElementById('customerDropdown').style.display = 'none';
  document.getElementById('customerSearch').classList.remove('is-invalid');
}

// Close dropdown when clicking outside
document.addEventListener('click', function(e) {
  if (!e.target.closest('#customerSearch') && !e.target.closest('#customerDropdown')) {
    const dropdown = document.getElementById('customerDropdown');
    if (dropdown) dropdown.style.display = 'none';
  }
});

// Show Add Customer Modal
function showCustomerModal() {
  const modal = new bootstrap.Modal(document.getElementById('customerModal'));
  const form = document.getElementById('customerForm');
  
  // Reset form
  form.reset();
  form.classList.remove('was-validated');
  
  // Clear hidden ID field (for add mode)
  document.getElementById('customerIdField').value = '';
  
  // Set modal title
  document.getElementById('customerModalLabel').innerHTML = '<i class="bi bi-person-plus me-2"></i>Add New Customer';
  document.getElementById('customerFormSubmitBtn').innerHTML = '<i class="bi bi-person-plus me-1"></i> Add Customer';
  
  modal.show();
}

// Edit Customer - Load data from dropdown
async function editCustomerFromDropdown(customerId) {
  try {
    const response = await fetch(`api.php?action=get_customer&id=${customerId}`);
    const data = await response.json();
    
    if (data.success) {
      const customer = data.data;
      const modal = new bootstrap.Modal(document.getElementById('customerModal'));
      const form = document.getElementById('customerForm');
      
      // Clear validation
      form.classList.remove('was-validated');
      
      // Set modal to edit mode
      document.getElementById('customerModalLabel').innerHTML = '<i class="bi bi-pencil me-2"></i>Edit Customer';
      document.getElementById('customerFormSubmitBtn').innerHTML = '<i class="bi bi-check-circle me-1"></i> Update Customer';
      
      // Populate form fields
      document.getElementById('customerIdField').value = customer.Cust_id;
      document.getElementById('Cust_Name').value = customer.Cust_Name;
      document.getElementById('Cust_Email').value = customer.Cust_Email;
      document.getElementById('Cust_Company').value = customer.Cust_Company || '';
      document.getElementById('Cust_No').value = customer.Cust_No || '';
      document.getElementById('Cust_Address').value = customer.Cust_Address || '';
      
      modal.show();
    } else {
      alert('Failed to load customer: ' + data.message);
    }
  } catch (error) {
    console.error('Error loading customer:', error);
    alert('Failed to load customer details');
  }
}

// Delete Customer from dropdown
async function deleteCustomerFromDropdown(customerId, customerName) {
  if (!confirm(`Are you sure you want to delete "${customerName}"?\n\nNote: Customers with existing orders cannot be deleted.`)) {
    return;
  }
  
  try {
    const response = await fetch('api.php?action=delete_customer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: customerId })
    });
    
    const data = await response.json();
    
    if (data.success) {
      showNotification('✅ Customer deleted successfully');
      
      // Clear dropdown and search
      document.getElementById('customerDropdown').style.display = 'none';
      document.getElementById('customerSearch').value = '';
      document.getElementById('selectedCustomerId').value = '';
      
      // Refresh orders if on orders page
      if (typeof loadOrders === 'function') {
        loadOrders();
      }
    } else {
      alert('❌ ' + data.message);
    }
  } catch (error) {
    console.error('Error deleting customer:', error);
    alert('Failed to delete customer');
  }
}

// Save Customer (Add or Update)
async function saveCustomer(event) {
  if (event) event.preventDefault();
  
  const form = document.getElementById('customerForm');
  
  // Validate form
  if (!form.checkValidity()) {
    form.classList.add('was-validated');
    return;
  }
  
  const customerId = document.getElementById('customerIdField').value;
  const isEdit = customerId !== '';
  
  const data = {
    Cust_Name: document.getElementById('Cust_Name').value,
    Cust_Email: document.getElementById('Cust_Email').value,
    Cust_No: document.getElementById('Cust_No').value,
    Cust_Company: document.getElementById('Cust_Company').value,
    Cust_Address: document.getElementById('Cust_Address').value
  };
  
  if (isEdit) {
    data.id = customerId;
  }
  
  try {
    const action = isEdit ? 'update_customer' : 'add_customer';
    const response = await fetch(`api.php?action=${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Close modal
      bootstrap.Modal.getInstance(document.getElementById('customerModal')).hide();
      
      // Show success message
      showNotification(isEdit ? '✅ Customer updated!' : '✅ Customer added!');
      
      // If adding new customer, select it in the order form
      if (!isEdit && result.id) {
        selectCustomer(result.id, data.Cust_Name);
      } else if (isEdit) {
        // Update the search field if it's the same customer
        const currentId = document.getElementById('selectedCustomerId').value;
        if (currentId == customerId) {
          document.getElementById('customerSearch').value = data.Cust_Name;
        }
      }
      
      // Refresh orders if on orders page
      if (typeof loadOrders === 'function') {
        loadOrders();
      }
    } else {
      alert('❌ ' + result.message);
    }
  } catch (error) {
    console.error('Error saving customer:', error);
    alert('❌ Failed to save customer');
  }
}

// Make functions globally accessible
window.showCustomerModal = showCustomerModal;
window.editCustomerFromDropdown = editCustomerFromDropdown;
window.deleteCustomerFromDropdown = deleteCustomerFromDropdown;
window.selectCustomer = selectCustomer;
window.saveCustomer = saveCustomer;