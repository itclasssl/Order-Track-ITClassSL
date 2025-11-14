// orderItems.js – Item (product in order) CRUD
function showAddItemModal(orderId) {
  document.getElementById('itemModalTitle').innerHTML = '<i class="bi bi-box me-2"></i>Add Product';
  document.getElementById('itemForm').reset();
  resetValidation('itemForm');
  document.getElementById('itemId').value = '';
  document.getElementById('itemOrderId').value = orderId;
  document.getElementById('quantity').value = 1;
  new bootstrap.Modal(document.getElementById('itemModal')).show();
}

function editItem(id) {
  let item = null;
  for (const order of window.AppState.ordersData) {
    item = order.items.find(i => i.id == id);
    if (item) break;
  }
  if (item) {
    document.getElementById('itemModalTitle').innerHTML = '<i class="bi bi-pencil me-2"></i>Edit Product';
    resetValidation('itemForm');
    document.getElementById('itemId').value = item.id;
    document.getElementById('itemOrderId').value = item.order_id;
    document.getElementById('productName').value = item.product_name;
    document.getElementById('quantity').value = item.quantity;
    document.getElementById('itemStatus').value = item.item_status;
    document.getElementById('itemNotes').value = item.notes || '';
    document.getElementById('selectedProductId').value = item.product_id || '';
    new bootstrap.Modal(document.getElementById('itemModal')).show();
  }
}

async function saveItem() {
  if (!validateForm('itemForm')) return;
  const id = document.getElementById('itemId').value;
  const productId = document.getElementById('selectedProductId').value || null;
  const data = {
    id: id || undefined,
    order_id: document.getElementById('itemOrderId').value,
    product_id: productId ? parseInt(productId) : null,
    product_name: document.getElementById('productName').value.trim(),
    quantity: parseInt(document.getElementById('quantity').value),
    item_status: document.getElementById('itemStatus').value,
    notes: document.getElementById('itemNotes').value.trim()
  };
  try {
    const response = await fetch(`api.php?action=${id ? 'update_item' : 'add_item'}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await response.json();
    if (result.success) {
      bootstrap.Modal.getInstance(document.getElementById('itemModal')).hide();
      if (!id) {
        window.AppState.expandedOrders.add(parseInt(data.order_id));
      }
      loadOrders();
      showNotification('✅ Product saved!');
    } else {
      alert('❌ ' + result.message);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('❌ Failed to save');
  }
}

async function deleteItem(id) {
  if (!confirm('⚠️ Delete this product?')) return;
  try {
    const response = await fetch('api.php?action=delete_item', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    const result = await response.json();
    if (result.success) {
      window.AppState.expandedItems.delete(id);
      loadOrders();
      showNotification('✅ Product deleted!');
    } else {
      alert('❌ ' + result.message);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('❌ Failed to delete');
  }
}

async function duplicateItem(id) {
  if (!confirm('📋 Duplicate product?')) return;
  try {
    const response = await fetch('api.php?action=duplicate_item', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    const result = await response.json();
    if (result.success) {
      loadOrders();
      showNotification('✅ Product duplicated!');
    } else {
      alert('❌ ' + result.message);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('❌ Failed to duplicate');
  }
}

window.editItem = editItem;
window.deleteItem = deleteItem;
window.duplicateItem = duplicateItem;
window.showAddItemModal = showAddItemModal;