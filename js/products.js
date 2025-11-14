// products.js – Product autocomplete & creation
document.getElementById('productName')?.addEventListener('input', async function(e) {
  const term = e.target.value.trim();
  const dropdown = document.getElementById('productDropdown');
  if (term.length < 2) {
    dropdown.style.display = 'none';
    return;
  }
  try {
    const response = await fetch(`api.php?action=search_products&q=${encodeURIComponent(term)}`);
    const data = await response.json();
    if (data.success) {
      if (data.data.length > 0) {
        dropdown.innerHTML = data.data.map(p => 
          `<a href="#" class="list-group-item list-group-item-action" onclick="selectProduct(${p.id}, '${escapeHtml(p.name)}'); return false;">
            <strong>${escapeHtml(p.name)}</strong><br>
            <small>Size: ${p.default_size || '-'} | Color: ${p.default_color || '-'} | Material: ${p.default_material || '-'}</small>
          </a>`
        ).join('');
        dropdown.style.display = 'block';
      } else {
        dropdown.innerHTML = '<div class="list-group-item text-muted">No products found. Click "+" to add.</div>';
        dropdown.style.display = 'block';
      }
    }
  } catch (err) {
    dropdown.style.display = 'none';
  }
});

document.addEventListener('click', function(e) {
  if (!e.target.closest('#productName') && !e.target.closest('#productDropdown')) {
    document.getElementById('productDropdown').style.display = 'none';
  }
});

function selectProduct(id, name) {
  const nameField = document.getElementById('productName');
  const idField = document.getElementById('selectedProductId');
  const dropdown = document.getElementById('productDropdown');
  if (nameField) nameField.value = name;
  if (idField) idField.value = id;
  if (dropdown) dropdown.style.display = 'none';
  if (nameField) nameField.classList.remove('is-invalid');
}

function showAddProductModal() {
  document.getElementById('addProductForm').reset();
  document.getElementById('addProductForm').classList.remove('was-validated');
  new bootstrap.Modal(document.getElementById('addProductModal')).show();
}

async function saveNewProduct() {
  const form = document.getElementById('addProductForm');
  if (!form.checkValidity()) {
    form.classList.add('was-validated');
    return;
  }
  const data = {
    name: document.getElementById('newProductName').value,
    default_size: document.getElementById('newProductSize').value,
    default_color: document.getElementById('newProductColor').value,
    default_material: document.getElementById('newProductMaterial').value
  };
  try {
    const res = await fetch('api.php?action=add_product', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (result.success) {
      bootstrap.Modal.getInstance(document.getElementById('addProductModal')).hide();
      selectProduct(result.id, data.name);
      showNotification('✅ Product added to catalog!');
    } else {
      alert('❌ ' + result.message);
    }
  } catch (e) {
    alert('❌ Failed to add product');
  }
}