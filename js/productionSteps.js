// productionSteps.js – Step CRUD
function showAddStepModal(itemId) {
  document.getElementById('stepModalTitle').innerHTML = '<i class="bi bi-list-task me-2"></i>Add Production Step(s)';
  document.getElementById('stepForm').reset();
  resetValidation('stepForm');
  const checkboxes = document.getElementById('stepNameCheckboxes');
  if (checkboxes) checkboxes.style.display = 'block';
  const editNameRow = document.getElementById('editStepNameDisplayRow');
  if (editNameRow) editNameRow.style.display = 'none';
  document.querySelectorAll('.step-checkbox').forEach(cb => cb.checked = false);
  const feedback = document.getElementById('stepNameFeedback');
  if (feedback) feedback.classList.add('d-none');
  document.getElementById('stepId').value = '';
  document.getElementById('stepItemId').value = itemId;
  document.getElementById('stepOrder').value = 1;
  new bootstrap.Modal(document.getElementById('stepModal')).show();
}

function editStep(id) {
  let step = null;
  for (const order of window.AppState.ordersData) {
    for (const item of order.items) {
      step = item.steps.find(s => s.id == id);
      if (step) break;
    }
    if (step) break;
  }
  if (!step) return;

  document.getElementById('stepModalTitle').innerHTML = '<i class="bi bi-pencil me-2"></i>Edit Step';
  resetValidation('stepForm');

  const editNameRow = document.getElementById('editStepNameDisplayRow');
  const editNameInput = document.getElementById('editStepNameDisplay');
  if (editNameRow && editNameInput) {
    editNameRow.style.display = 'block';
    editNameInput.value = step.step_name;
  }

  const checkboxesContainer = document.getElementById('stepNameCheckboxes');
  if (checkboxesContainer) checkboxesContainer.style.display = 'none';

  document.getElementById('stepId').value = step.id;
  document.getElementById('stepItemId').value = step.item_id;
  document.getElementById('stepOrder').value = step.step_order;
  document.getElementById('stepStatus').value = step.status;
  document.getElementById('stepAssignedTo').value = step.assigned_to || '';
  document.getElementById('stepStartDate').value = step.start_date || '';
  document.getElementById('stepEndDate').value = step.end_date || '';
  document.getElementById('stepNotes').value = step.notes || '';

  new bootstrap.Modal(document.getElementById('stepModal')).show();
}

async function saveStep() {
  const stepId = document.getElementById('stepId').value;
  if (stepId) {
    // Edit mode
    const stepName = document.getElementById('editStepNameDisplay')?.value;
    const data = {
      id: parseInt(stepId),
      item_id: parseInt(document.getElementById('stepItemId').value),
      step_name: stepName,
      step_order: document.getElementById('stepOrder').value,
      status: document.getElementById('stepStatus').value,
      assigned_to: document.getElementById('stepAssignedTo').value.trim(),
      start_date: document.getElementById('stepStartDate').value || null,
      end_date: document.getElementById('stepEndDate').value || null,
      notes: document.getElementById('stepNotes').value.trim()
    };

    if (data.start_date && data.end_date && new Date(data.start_date) > new Date(data.end_date)) {
      alert('❌ End date must be after start date');
      return;
    }

    try {
      const response = await fetch('api.php?action=update_step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      if (result.success) {
        bootstrap.Modal.getInstance(document.getElementById('stepModal')).hide();
        loadOrders();
        showNotification('✅ Step updated!');
      } else {
        alert('❌ ' + result.message);
      }
    } catch (error) {
      console.error('Error updating step:', error);
      alert('❌ Failed to update step');
    }
  } else {
    // Add mode
    const checkedBoxes = document.querySelectorAll('.step-checkbox:checked');
    const selectedSteps = Array.from(checkedBoxes).map(cb => cb.value);
    const feedback = document.getElementById('stepNameFeedback');
    if (selectedSteps.length === 0) {
      if (feedback) feedback.classList.remove('d-none');
      return;
    } else if (feedback) feedback.classList.add('d-none');

    const itemId = document.getElementById('stepItemId')?.value;
    if (!itemId) {
      alert('❌ Item ID missing');
      return;
    }

    const commonData = {
      item_id: parseInt(itemId),
      step_order: document.getElementById('stepOrder').value,
      status: document.getElementById('stepStatus').value,
      assigned_to: document.getElementById('stepAssignedTo').value.trim(),
      start_date: document.getElementById('stepStartDate').value || null,
      end_date: document.getElementById('stepEndDate').value || null,
      notes: document.getElementById('stepNotes').value.trim()
    };

    if (commonData.start_date && commonData.end_date && new Date(commonData.start_date) > new Date(commonData.end_date)) {
      alert('❌ End date must be after start date');
      return;
    }

    try {
      const requests = selectedSteps.map(stepName => 
        fetch('api.php?action=add_step', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...commonData, step_name: stepName })
        })
      );
      const responses = await Promise.all(requests);
      const results = await Promise.all(responses.map(res => res.json()));
      const failed = results.find(r => !r.success);
      if (failed) {
        alert('❌ ' + (failed.message || 'One or more steps failed to save.'));
      } else {
        bootstrap.Modal.getInstance(document.getElementById('stepModal')).hide();
        window.AppState.expandedItems.add(parseInt(itemId));
        loadOrders();
        showNotification(`✅ ${selectedSteps.length} step(s) added!`);
      }
    } catch (error) {
      console.error('Save steps error:', error);
      alert('❌ Network error while saving steps');
    }
  }
}

async function deleteStep(id) {
  if (!confirm('⚠️ Delete step?')) return;
  try {
    const response = await fetch('api.php?action=delete_step', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    const result = await response.json();
    if (result.success) {
      loadOrders();
      showNotification('✅ Step deleted!');
    } else {
      alert('❌ ' + result.message);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('❌ Failed to delete');
  }
}

async function duplicateStep(id) {
  if (!confirm('📋 Duplicate step?')) return;
  try {
    const response = await fetch('api.php?action=duplicate_step', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    const result = await response.json();
    if (result.success) {
      loadOrders();
      showNotification('✅ Step duplicated!');
    } else {
      alert('❌ ' + result.message);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('❌ Failed to duplicate');
  }
}


window.editStep = editStep;
window.deleteStep = deleteStep;
window.duplicateStep = duplicateStep;
window.showAddStepModal = showAddStepModal;