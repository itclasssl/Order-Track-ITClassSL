// main.js – Core shared logic
let currentPage = 1;
let currentLimit = 10;
let currentSearch = '';
let currentSortBy = 'id';
let currentSortOrder = 'DESC';
let expandedOrders = new Set();
let expandedItems = new Set();
let ordersData = [];
let customerCache = [];

// Make state globally accessible for simplicity (optional: convert to ES modules later)
window.AppState = {
  currentPage, currentLimit, currentSearch, currentSortBy, currentSortOrder,
  expandedOrders, expandedItems, ordersData, customerCache,
  update: (key, value) => { window.AppState[key] = value; }
};

document.addEventListener('DOMContentLoaded', function () {
  loadOrders();
  
  document.getElementById('searchInput').addEventListener('input', function (e) {
    currentSearch = e.target.value;
    currentPage = 1;
    loadOrders();
  });
  
  document.getElementById('limitSelect').addEventListener('change', function (e) {
    currentLimit = parseInt(e.target.value);
    currentPage = 1;
    loadOrders();
  });

  // ✅ Direct export handler — no global function needed
  const exportBtn = document.getElementById('exportBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', function() {
      window.location.href = 'api.php?action=export';
    });
  }
});

async function loadOrders() {
  try {
    const tbody = document.getElementById('ordersTable');
    tbody.innerHTML = '<tr><td colspan="10" class="text-center">Loading...</td></tr>';
    const response = await fetch(`api.php?action=fetch&page=${currentPage}&limit=${currentLimit}&search=${currentSearch}&sortBy=${currentSortBy}&sortOrder=${currentSortOrder}`);
    const data = await response.json();
    if (data.success) {
        window.AppState.ordersData = data.data;
        renderOrders(data.data);
      renderPagination(data.page, data.totalPages);
      document.getElementById('recordCount').textContent = `📊 Total: ${data.total} orders`;
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Failed to load orders');
  }
}

function renderOrders(orders) {
  const tbody = document.getElementById('ordersTable');
  tbody.innerHTML = '';
  if (orders.length === 0) {
    tbody.innerHTML = '<tr><td colspan="10" class="text-center text-muted py-5">No orders found</td></tr>';
    return;
  }
  orders.forEach(order => {
    const isOrderExpanded = expandedOrders.has(order.id);
    const statusClass = getStatusClass(order.status);
    const hasItems = order.items && order.items.length > 0;
    const productNames = hasItems ? order.items.map(item => item.product_name).join(', ') : '-';
    const allSteps = [];
    if (hasItems) {
      order.items.forEach(item => {
        if (item.steps && item.steps.length > 0) {
          item.steps.forEach(step => {
            const existing = allSteps.find(s => s.name === step.step_name);
            if (!existing) {
              allSteps.push({ name: step.step_name, status: step.status, order: step.step_order });
            }
          });
        }
      });
    }
    allSteps.sort((a, b) => a.order - b.order);
    const stepsHTML = allSteps.length > 0 ?
      allSteps.map(step => `<span class="badge ${getStatusClass(step.status)} step-badge-inline">${step.name}: ${step.status}</span>`).join(' ')
      : '<span class="text-muted">No steps</span>';

    const mainRow = document.createElement('tr');
    mainRow.className = `main-row ${isOrderExpanded ? 'expanded' : ''}`;
    mainRow.id = `order-${order.id}`;
    mainRow.innerHTML = `
      <td onclick="toggleOrderExpand(${order.id}, event)">
        ${hasItems ? `<i class="bi bi-chevron-right expand-icon ${isOrderExpanded ? 'expanded' : ''}" id="icon-order-${order.id}"></i>` : ''}
      </td>
      <td onclick="toggleOrderExpand(${order.id}, event)"><strong>${escapeHtml(order.order_number)}</strong></td>
      <td onclick="toggleOrderExpand(${order.id}, event)"><i class="bi bi-person-circle me-1"></i>${escapeHtml(order.customer_name)}</td>
      <td onclick="toggleOrderExpand(${order.id}, event)" class="text-small">${escapeHtml(productNames)}</td>
      <td onclick="toggleOrderExpand(${order.id}, event)">${order.start_date}</td>
      <td onclick="toggleOrderExpand(${order.id}, event)">${order.end_date || '-'}</td>
      <td onclick="toggleOrderExpand(${order.id}, event)"><span class="badge ${statusClass}">${order.status}</span></td>
      <td onclick="toggleOrderExpand(${order.id}, event)" class="text-small">${stepsHTML}</td>
      <td onclick="toggleOrderExpand(${order.id}, event)" class="text-small">${escapeHtml(order.notes || '-')}</td>
      <td>
        <i class="bi bi-pencil text-primary action-btn" onclick="editOrder(${order.id})" title="Edit"></i>
        <i class="bi bi-files text-info action-btn" onclick="duplicateOrder(${order.id})" title="Duplicate"></i>
        <i class="bi bi-trash text-danger action-btn" onclick="deleteOrder(${order.id})" title="Delete"></i>
        <i class="bi bi-plus-square text-success action-btn" onclick="showAddItemModal(${order.id})" title="Add Product"></i>
      </td>
    `;
    tbody.appendChild(mainRow);

    if (hasItems && isOrderExpanded) {
      const itemsContainer = document.createElement('tr');
      itemsContainer.className = 'sub-rows-container show';
      const itemsCell = document.createElement('td');
      itemsCell.className = 'sub-rows-cell';
      itemsCell.colSpan = 10;
      const itemsTable = document.createElement('table');
      itemsTable.className = 'sub-table table table-sm mb-0';
      itemsTable.innerHTML = `
        <thead>
          <tr>
            <th style="width: 30px;"></th>
            <th>Product Name</th>
            <th style="width: 80px;">Quantity</th>
            <th style="width: 120px;">Size</th>
            <th style="width: 120px;">Color</th>
            <th style="width: 150px;">Material</th>
            <th style="width: 100px;">Status</th>
            <th>Notes</th>
            <th style="width: 140px;">Actions</th>
          </tr>
        </thead>
        <tbody id="items-${order.id}"></tbody>
      `;
      itemsCell.appendChild(itemsTable);
      itemsContainer.appendChild(itemsCell);
      tbody.appendChild(itemsContainer);

      const itemsTbody = document.getElementById(`items-${order.id}`);
      order.items.forEach(item => {
        const isItemExpanded = expandedItems.has(item.id);
        const itemStatusClass = getStatusClass(item.item_status);
        const hasSteps = item.steps && item.steps.length > 0;
        const itemRow = document.createElement('tr');
        itemRow.className = `item-row ${isItemExpanded ? 'expanded' : ''}`;
        itemRow.id = `item-${item.id}`;
        itemRow.innerHTML = `
          <td onclick="toggleItemExpand(${item.id}, event)">
            ${hasSteps ? `<i class="bi bi-chevron-right expand-icon-item ${isItemExpanded ? 'expanded' : ''}" id="icon-item-${item.id}"></i>` : ''}
          </td>
          <td onclick="toggleItemExpand(${item.id}, event)">
            <i class="bi bi-box me-2"></i><strong>${escapeHtml(item.product_name)}</strong>
          </td>
          <td onclick="toggleItemExpand(${item.id}, event)">${item.quantity}</td>
          <td onclick="toggleItemExpand(${item.id}, event)">${escapeHtml(item.size || '-')}</td>
          <td onclick="toggleItemExpand(${item.id}, event)">${escapeHtml(item.color || '-')}</td>
          <td onclick="toggleItemExpand(${item.id}, event)">${escapeHtml(item.material || '-')}</td>
          <td onclick="toggleItemExpand(${item.id}, event)"><span class="badge ${itemStatusClass}">${item.item_status}</span></td>
          <td onclick="toggleItemExpand(${item.id}, event)">${escapeHtml(item.notes || '-')}</td>
          <td>
            <i class="bi bi-pencil text-primary action-btn" onclick="editItem(${item.id})" title="Edit"></i>
            <i class="bi bi-files text-info action-btn" onclick="duplicateItem(${item.id})" title="Duplicate"></i>
            <i class="bi bi-trash text-danger action-btn" onclick="deleteItem(${item.id})" title="Delete"></i>
            <i class="bi bi-list-task text-warning action-btn" onclick="showAddStepModal(${item.id})" title="Add Step"></i>
          </td>
        `;
        itemsTbody.appendChild(itemRow);

        if (hasSteps && isItemExpanded) {
          const stepsContainer = document.createElement('tr');
          stepsContainer.className = 'steps-container show';
          const stepsCell = document.createElement('td');
          stepsCell.colSpan = 9;
          stepsCell.className = 'steps-cell';
          const stepsTable = document.createElement('table');
          stepsTable.className = 'steps-table table table-sm mb-0';
          stepsTable.innerHTML = `
            <thead>
              <tr>
                <th style="width: 50px;">Order</th>
                <th>Step Name</th>
                <th style="width: 100px;">Status</th>
                <th style="width: 120px;">Assigned To</th>
                <th style="width: 100px;">Start Date</th>
                <th style="width: 100px;">End Date</th>
                <th>Notes</th>
                <th style="width: 120px;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${item.steps.map(step => {
                const stepStatusClass = getStatusClass(step.status);
                return `
                  <tr>
                    <td><span class="badge bg-secondary">${step.step_order}</span></td>
                    <td><i class="bi bi-gear me-1"></i>${escapeHtml(step.step_name)}</td>
                    <td><span class="badge ${stepStatusClass}">${step.status}</span></td>
                    <td><i class="bi bi-person me-1"></i>${escapeHtml(step.assigned_to || '-')}</td>
                    <td>${step.start_date || '-'}</td>
                    <td>${step.end_date || '-'}</td>
                    <td>${escapeHtml(step.notes || '-')}</td>
                    <td>
                      <i class="bi bi-pencil text-primary action-btn" onclick="editStep(${step.id})" title="Edit"></i>
                      <i class="bi bi-files text-info action-btn" onclick="duplicateStep(${step.id})" title="Duplicate"></i>
                      <i class="bi bi-trash text-danger action-btn" onclick="deleteStep(${step.id})" title="Delete"></i>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          `;
          stepsCell.appendChild(stepsTable);
          stepsContainer.appendChild(stepsCell);
          itemsTbody.appendChild(stepsContainer);
        }
      });
    }
  });
}

function toggleOrderExpand(orderId, event) {
  if (event && event.target.closest('.action-btn')) return;
  if (expandedOrders.has(orderId)) {
    expandedOrders.delete(orderId);
  } else {
    expandedOrders.add(orderId);
  }
  loadOrders();
}

function toggleItemExpand(itemId, event) {
  if (event && event.target.closest('.action-btn')) return;
  if (expandedItems.has(itemId)) {
    expandedItems.delete(itemId);
  } else {
    expandedItems.add(itemId);
  }
  loadOrders();
}

function renderPagination(page, totalPages) {
  const pagination = document.getElementById('pagination');
  pagination.innerHTML = '';
  if (totalPages <= 1) return;
  pagination.insertAdjacentHTML('beforeend', `
    <li class="page-item ${page === 1 ? 'disabled' : ''}">
      <a class="page-link" href="#" onclick="changePage(${page - 1}); return false;">Previous</a>
    </li>
  `);
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 2 && i <= page + 2)) {
      pagination.insertAdjacentHTML('beforeend', `
        <li class="page-item ${i === page ? 'active' : ''}">
          <a class="page-link" href="#" onclick="changePage(${i}); return false;">${i}</a>
        </li>
      `);
    } else if (i === page - 3 || i === page + 3) {
      pagination.insertAdjacentHTML('beforeend', `
        <li class="page-item disabled"><span class="page-link">...</span></li>
      `);
    }
  }
  pagination.insertAdjacentHTML('beforeend', `
    <li class="page-item ${page === totalPages ? 'disabled' : ''}">
      <a class="page-link" href="#" onclick="changePage(${page + 1}); return false;">Next</a>
    </li>
  `);
}

function changePage(page) {
  currentPage = page;
  loadOrders();
}

function sortTable(column) {
  if (currentSortBy === column) {
    currentSortOrder = currentSortOrder === 'ASC' ? 'DESC' : 'ASC';
  } else {
    currentSortBy = column;
    currentSortOrder = 'DESC';
  }
  loadOrders();
}

// Shared utilities
function getStatusClass(status) {
  const classes = {
    'Pending': 'bg-warning text-dark',
    'Material': 'bg-secondary',
    'Processing': 'bg-info text-dark',
    'In Production': 'bg-primary',
    'In Progress': 'bg-primary',
    'Completed': 'bg-success',
    'Cancelled': 'bg-danger',
    'On Hold': 'bg-secondary'
  };
  return classes[status] || 'bg-secondary';
}

function escapeHtml(text) {
  const map = { '&': '&amp;', '<': '<', '>': '>', '"': '&quot;', "'": '&#039;' };
  return String(text).replace(/[&<>"']/g, m => map[m]);
}

function showNotification(message) {
  const alert = document.createElement('div');
  alert.className = 'alert alert-success alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3';
  alert.style.zIndex = '9999';
  alert.innerHTML = `${message}<button type="button" class="btn-close" data-bs-dismiss="alert"></button>`;
  document.body.appendChild(alert);
  setTimeout(() => alert.remove(), 3000);
}

function validateForm(formId) {
  const form = document.getElementById(formId);
  if (!form.checkValidity()) {
    form.classList.add('was-validated');
    return false;
  }
  if (formId === 'orderForm') {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      alert('End date must be after start date');
      return false;
    }
  }
  if (formId === 'stepForm') {
    const startDate = document.getElementById('stepStartDate').value;
    const endDate = document.getElementById('stepEndDate').value;
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      alert('End date must be after start date');
      return false;
    }
  }
  return true;
}

function resetValidation(formId) {
  const form = document.getElementById(formId);
  form.classList.remove('was-validated');
  form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
}
