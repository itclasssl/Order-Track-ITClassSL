// orders.js – Order CRUD
function showAddOrderModal() {
  document.getElementById('orderModalTitle').innerHTML = '<i class="bi bi-box-seam me-2"></i>Add Order';
  document.getElementById('orderForm').reset();
  resetValidation('orderForm');
  document.getElementById('orderId').value = '';
  document.getElementById('orderNumberContainer').style.display = 'none';
  document.getElementById('orderNumber').value = '';
  document.getElementById('orderNumber').removeAttribute('required');
  document.getElementById('customerSearch').value = '';
  document.getElementById('selectedCustomerId').value = '';
  document.getElementById('startDate').value = new Date().toISOString().split('T')[0];
  new bootstrap.Modal(document.getElementById('orderModal')).show();
}

function editOrder(id) {
  const order = window.AppState.ordersData.find(o => o.id == id);
  if (order) {
    document.getElementById('orderModalTitle').innerHTML = '<i class="bi bi-pencil me-2"></i>Edit Order';
    resetValidation('orderForm');
    document.getElementById('orderId').value = order.id;
    document.getElementById('orderNumberContainer').style.display = 'block';
    const orderNumberField = document.getElementById('orderNumber');
    orderNumberField.value = order.order_number;
    orderNumberField.removeAttribute('readonly');
    orderNumberField.setAttribute('required', 'required');
    document.getElementById('customerSearch').value = order.customer_name;
    document.getElementById('selectedCustomerId').value = order.customer_id;
    document.getElementById('startDate').value = order.start_date;
    document.getElementById('endDate').value = order.end_date || '';
    document.getElementById('orderStatus').value = order.status;
    document.getElementById('orderNotes').value = order.notes || '';
    new bootstrap.Modal(document.getElementById('orderModal')).show();
  }
}

async function saveOrder() {
  if (!validateForm('orderForm')) return;
  const customerId = document.getElementById('selectedCustomerId').value;
  if (!customerId) {
    document.getElementById('customerSearch').classList.add('is-invalid');
    return;
  }
  const id = document.getElementById('orderId').value;
  const orderNumber = document.getElementById('orderNumber').value.trim();
  const data = {
    id: id || undefined,
    customer_id: customerId,
    order_number: id ? orderNumber : undefined,
    start_date: document.getElementById('startDate').value,
    end_date: document.getElementById('endDate').value || null,
    status: document.getElementById('orderStatus').value,
    notes: document.getElementById('orderNotes').value.trim()
  };

  try {
    const response = await fetch(`api.php?action=${id ? 'update_order' : 'add_order'}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await response.json();
    if (result.success) {
      bootstrap.Modal.getInstance(document.getElementById('orderModal')).hide();
      loadOrders();
      showNotification('✅ Order saved successfully!');
    } else {
      alert('❌ ' + result.message);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('❌ Failed to save order');
  }
}

async function deleteOrder(id) {
  if (!confirm('⚠️ Delete this order and all products/steps?')) return;
  try {
    const response = await fetch('api.php?action=delete_order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    const result = await response.json();
    if (result.success) {
      window.AppState.expandedOrders.delete(id);
      loadOrders();
      showNotification('✅ Order deleted successfully!');
    } else {
      alert('❌ ' + result.message);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('❌ Failed to delete order');
  }
}

async function duplicateOrder(id) {
  if (!confirm('📋 Duplicate this order?')) return;
  try {
    const response = await fetch('api.php?action=duplicate_order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    const result = await response.json();
    if (result.success) {
      loadOrders();
      showNotification('✅ Order duplicated!');
    } else {
      alert('❌ ' + result.message);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('❌ Failed to duplicate');
  }
}

// Make functions globally accessible for inline onclick handlers
window.editOrder = editOrder;
window.deleteOrder = deleteOrder;
window.duplicateOrder = duplicateOrder;
window.showAddOrderModal = showAddOrderModal;