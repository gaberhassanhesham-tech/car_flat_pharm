const firebaseConfig = {
  apiKey: "AIzaSyDPh6Dt7UKk2SJWKrpNF_SxZ-eicGtPNEE",
  authDomain: "car-flat-pharm.firebaseapp.com",
  projectId: "car-flat-pharm",
  storageBucket: "car-flat-pharm.firebasestorage.app",
  messagingSenderId: "599204546085",
  appId: "1:599204546085:web:94b8c9fd74ab20134b61cc",
  measurementId: "G-0FGTE9PLK7"
};

const firestoreBaseUrl = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(firebaseConfig.projectId)}/databases/(default)/documents`;
const apiKey = firebaseConfig.apiKey;

// Firestore JSON encoder/decoder helper functions
function encodeValue(value) {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === "boolean") return { booleanValue: value };
  if (Number.isInteger(value)) return { integerValue: String(value) };
  if (typeof value === "number") return { doubleValue: value };
  if (Array.isArray(value)) {
    return { arrayValue: { values: value.map((item) => encodeValue(item)) } };
  }
  if (typeof value === "object") {
    return {
      mapValue: {
        fields: Object.fromEntries(
          Object.entries(value).map(([key, item]) => [key, encodeValue(item)])
        ),
      },
    };
  }
  return { stringValue: String(value) };
}

function decodeValue(value) {
  if (!value || typeof value !== "object") return null;
  if (Object.prototype.hasOwnProperty.call(value, "nullValue")) return null;
  if (Object.prototype.hasOwnProperty.call(value, "booleanValue")) return value.booleanValue;
  if (Object.prototype.hasOwnProperty.call(value, "integerValue")) return Number(value.integerValue);
  if (Object.prototype.hasOwnProperty.call(value, "doubleValue")) return Number(value.doubleValue);
  if (Object.prototype.hasOwnProperty.call(value, "timestampValue")) return value.timestampValue;
  if (Object.prototype.hasOwnProperty.call(value, "stringValue")) return value.stringValue;
  if (Object.prototype.hasOwnProperty.call(value, "arrayValue")) {
    return (value.arrayValue.values || []).map((item) => decodeValue(item));
  }
  if (Object.prototype.hasOwnProperty.call(value, "mapValue")) {
    return Object.fromEntries(
      Object.entries(value.mapValue.fields || {}).map(([key, item]) => [key, decodeValue(item)])
    );
  }
  return null;
}

function encodeDocument(data) {
  return {
    fields: Object.fromEntries(
      Object.entries(data || {}).map(([key, value]) => [key, encodeValue(value)])
    ),
  };
}

function getDocumentId(name = "") {
  return String(name).split("/").pop();
}

function decodeDocument(document) {
  if (!document) return null;
  const data = Object.fromEntries(
    Object.entries(document.fields || {}).map(([key, value]) => [key, decodeValue(value)])
  );
  return {
    ...data,
    _firestore_id: getDocumentId(document.name),
  };
}

// Metadata and schema configurations for each collection
const collectionsConfig = {
  pharmacy_products_metadata: {
    title: 'Products Metadata',
    desc: 'Manage pharmaceutical products, stock quantities, barcode records, and custom categories.',
    idField: 'product_id',
    displayFields: [
      { name: 'product_id', label: 'ID', type: 'text', readOnly: true },
      { name: 'name_ar', label: 'Name (AR)', type: 'text', required: true },
      { name: 'name_en', label: 'Name (EN)', type: 'text' },
      { name: 'price', label: 'Price', type: 'number', required: true },
      { name: 'stock_quantity', label: 'Stock', type: 'number' },
      { name: 'is_prescription_required', label: 'Prescription Req.', type: 'boolean' }
    ],
    formFields: [
      { name: 'product_id', label: 'Product ID (Leave empty to auto-generate)', type: 'text' },
      { name: 'user_key', label: 'User Key', type: 'text', required: true },
      { name: 'name_ar', label: 'Name Arabic', type: 'text', required: true },
      { name: 'name_en', label: 'Name English', type: 'text' },
      { name: 'price', label: 'Price', type: 'number', required: true },
      { name: 'discount', label: 'Discount', type: 'number', defaultValue: 0 },
      { name: 'stock_quantity', label: 'Stock Quantity', type: 'number', defaultValue: 1 },
      { name: 'status', label: 'Status (1 = Active, 0 = Inactive)', type: 'number', defaultValue: 1 },
      { name: 'brand_ar', label: 'Brand Arabic', type: 'text' },
      { name: 'brand_en', label: 'Brand English', type: 'text' },
      { name: 'barcode', label: 'Barcode', type: 'text' },
      { name: 'manufacturer', label: 'Manufacturer', type: 'text' },
      { name: 'is_prescription_required', label: 'Is Prescription Required?', type: 'boolean' },
      { name: 'active_ingredients', label: 'Active Ingredients', type: 'text' },
      { name: 'custom_main_cat_id', label: 'Custom Main Category ID', type: 'text' },
      { name: 'custom_sub_cat_id', label: 'Custom Sub Category ID', type: 'text' }
    ]
  },
  pharmacy_custom_categories: {
    title: 'Custom Categories',
    desc: 'Manage custom hierarchy structure levels for pharmacy classifications.',
    idField: 'id',
    displayFields: [
      { name: 'id', label: 'ID', type: 'text', readOnly: true },
      { name: 'title_ar', label: 'Title (AR)', type: 'text', required: true },
      { name: 'title_en', label: 'Title (EN)', type: 'text' },
      { name: 'level', label: 'Level', type: 'select', options: ['MAIN', 'SUB'], required: true },
      { name: 'parent_id', label: 'Parent ID', type: 'text' }
    ],
    formFields: [
      { name: 'id', label: 'Category ID (Leave empty to auto-generate)', type: 'text' },
      { name: 'user_key', label: 'User Key', type: 'text', required: true },
      { name: 'title_ar', label: 'Title Arabic', type: 'text', required: true },
      { name: 'title_en', label: 'Title English', type: 'text' },
      { name: 'level', label: 'Level', type: 'select', options: ['MAIN', 'SUB'], required: true },
      { name: 'parent_id', label: 'Parent ID (Optional, for SUB levels)', type: 'text' }
    ]
  },
  pharmacy_merchant_preferences: {
    title: 'Merchant Preferences',
    desc: 'Manage custom overrides and hidden items for specific merchants.',
    idField: 'user_key',
    displayFields: [
      { name: 'user_key', label: 'User Key', type: 'text', required: true },
      { name: 'hidden_main_categories', label: 'Hidden Main Cats (JSON)', type: 'text' },
      { name: 'hidden_sub_categories', label: 'Hidden Sub Cats (JSON)', type: 'text' }
    ],
    formFields: [
      { name: 'user_key', label: 'User Key', type: 'text', required: true },
      { name: 'hidden_main_categories', label: 'Hidden Main Categories (JSON)', type: 'text', defaultValue: '[]' },
      { name: 'hidden_sub_categories', label: 'Hidden Sub Categories (JSON)', type: 'text', defaultValue: '[]' },
      { name: 'hidden_catalog_products', label: 'Hidden Catalog Products (JSON)', type: 'text', defaultValue: '[]' }
    ]
  },
  real_estate_listings: {
    title: 'Real Estate Listings',
    desc: 'Browse, manage, and edit details of property properties listings.',
    idField: 'real_estate_key',
    displayFields: [
      { name: 'real_estate_key', label: 'Listing Key', type: 'text', readOnly: true },
      { name: 'price', label: 'Price', type: 'number', required: true },
      { name: 'area_sqm', label: 'Area (Sqm)', type: 'number' },
      { name: 'rooms', label: 'Rooms', type: 'number' },
      { name: 'address', label: 'Address', type: 'text' },
      { name: 'is_featured', label: 'Featured', type: 'boolean' }
    ],
    formFields: [
      { name: 'real_estate_key', label: 'Real Estate Key (Leave empty to auto-generate)', type: 'text' },
      { name: 'user_key', label: 'User Key', type: 'text', required: true },
      { name: 'sub_category_id', label: 'Sub Category ID', type: 'text', defaultValue: '' },
      { name: 'price', label: 'Price', type: 'number', required: true },
      { name: 'area_sqm', label: 'Area (Sqm)', type: 'number' },
      { name: 'rooms', label: 'Rooms Count', type: 'number' },
      { name: 'bathrooms', label: 'Bathrooms Count', type: 'number' },
      { name: 'floor_level', label: 'Floor Level', type: 'number' },
      { name: 'address', label: 'Address', type: 'text' },
      { name: 'notes', label: 'Notes', type: 'textarea' },
      { name: 'is_featured', label: 'Is Featured?', type: 'boolean' },
      { name: 'status', label: 'Status (1 = Active, 0 = Inactive)', type: 'number', defaultValue: 1 }
    ]
  },
  vehicle_listings: {
    title: 'Vehicle Listings',
    desc: 'Browse, manage, and edit car inventory information.',
    idField: 'car_key',
    displayFields: [
      { name: 'car_key', label: 'Car Key', type: 'text', readOnly: true },
      { name: 'brand_id', label: 'Brand', type: 'text', required: true },
      { name: 'year', label: 'Year', type: 'number', required: true },
      { name: 'price', label: 'Price', type: 'number', required: true },
      { name: 'transmission_type_id', label: 'Transmission', type: 'text' },
      { name: 'is_featured', label: 'Featured', type: 'boolean' }
    ],
    formFields: [
      { name: 'car_key', label: 'Car Key (Leave empty to auto-generate)', type: 'text' },
      { name: 'user_key', label: 'User Key', type: 'text', required: true },
      { name: 'brand_id', label: 'Brand ID (e.g. toyota)', type: 'text', required: true },
      { name: 'body_type_id', label: 'Body Type', type: 'text' },
      { name: 'fuel_type_id', label: 'Fuel Type', type: 'text' },
      { name: 'transmission_type_id', label: 'Transmission Type', type: 'text' },
      { name: 'condition_id', label: 'Condition (used/new)', type: 'text' },
      { name: 'year', label: 'Year', type: 'number', required: true },
      { name: 'price', label: 'Price', type: 'number', required: true },
      { name: 'notes', label: 'Notes', type: 'textarea' },
      { name: 'is_featured', label: 'Is Featured?', type: 'boolean' },
      { name: 'status', label: 'Status (1 = Active, 0 = Inactive)', type: 'number', defaultValue: 1 }
    ]
  },
  product_ratings_v2: {
    title: 'Product Ratings',
    desc: 'View and manage product ratings submitted for cars, real estate listings, and pharmacy items.',
    idField: 'rating_id',
    displayFields: [
      { name: 'rating_id', label: 'Rating ID', type: 'text', readOnly: true },
      { name: 'product_key', label: 'Product Key', type: 'text' },
      { name: 'rater_id', label: 'Rater User Key', type: 'text' },
      { name: 'rater_name', label: 'Rater Name', type: 'text' },
      { name: 'rating', label: 'Rating (1–5)', type: 'number' },
      { name: 'comment', label: 'Comment', type: 'text' },
      { name: 'created_at', label: 'Date', type: 'text' }
    ],
    formFields: [
      { name: 'rating_id', label: 'Rating ID (auto-generated if empty)', type: 'text' },
      { name: 'product_key', label: 'Product Key', type: 'text', required: true },
      { name: 'rater_id', label: 'Rater User Key', type: 'text', required: true },
      { name: 'rater_name', label: 'Rater Name', type: 'text' },
      { name: 'rating', label: 'Rating (1–5)', type: 'number', required: true },
      { name: 'comment', label: 'Comment', type: 'textarea' },
      { name: 'date', label: 'Date (ISO string, auto-filled if empty)', type: 'text' }
    ]
  }
};

// Application State
let currentCollection = 'pharmacy_products_metadata';
let currentData = [];
let editTargetId = null; // null for Create, id for Edit

// UI Elements
const sidebarNav = document.getElementById('sidebarNav');
const boardTitle = document.getElementById('currentCollectionTitle');
const boardDesc = document.getElementById('currentCollectionDesc');
const statsCounter = document.getElementById('statsCounter');
const tableLoading = document.getElementById('tableLoading');
const tableEmpty = document.getElementById('tableEmpty');
const dataTable = document.getElementById('dataTable');
const tableHead = document.getElementById('tableHead');
const tableBody = document.getElementById('tableBody');
const searchInput = document.getElementById('searchInput');
const addRecordBtn = document.getElementById('addRecordBtn');
const formModal = document.getElementById('formModal');
const modalTitle = document.getElementById('modalTitle');
const modalFormFields = document.getElementById('modalFormFields');
const recordForm = document.getElementById('recordForm');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelFormBtn = document.getElementById('cancelFormBtn');
const toastContainer = document.getElementById('toastContainer');
const connectionStatus = document.getElementById('connectionStatus');

// Initialize App
function init() {
  setupEventListeners();
  loadCollection(currentCollection);
}

function setupEventListeners() {
  // Navigation
  sidebarNav.addEventListener('click', (e) => {
    const btn = e.target.closest('.nav-item');
    if (!btn) return;
    
    // Set Active states
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    btn.classList.add('active');
    
    currentCollection = btn.dataset.collection;
    loadCollection(currentCollection);
  });
  
  // Search filter
  searchInput.addEventListener('input', () => {
    filterAndRenderTable();
  });
  
  // Create Form Open
  addRecordBtn.addEventListener('click', () => {
    openFormModal();
  });
  
  // Modal Close buttons
  closeModalBtn.addEventListener('click', closeFormModal);
  cancelFormBtn.addEventListener('click', closeFormModal);
  
  // Save form handler
  recordForm.addEventListener('submit', handleFormSubmit);
}

// Fetch and load data
async function loadCollection(collectionName) {
  showLoading(true);
  boardTitle.textContent = collectionsConfig[collectionName].title;
  boardDesc.textContent = collectionsConfig[collectionName].desc;
  searchInput.value = '';
  
  try {
    const documents = [];
    let pageToken = "";

    do {
      const tokenPart = pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : "";
      const url = `${firestoreBaseUrl}/${encodeURIComponent(collectionName)}?key=${encodeURIComponent(apiKey)}&pageSize=1000${tokenPart}`;
      const response = await fetch(url);

      if (!response.ok) {
        if (response.status === 404) {
          break;
        }
        const errText = await response.text();
        throw new Error(`Firestore error: ${response.status} - ${errText}`);
      }

      const payload = await response.json();
      documents.push(...((payload.documents || []).map(decodeDocument).filter(Boolean)));
      pageToken = payload.nextPageToken || "";
    } while (pageToken);

    currentData = documents;
    filterAndRenderTable();
    setConnectionStatus(true);
  } catch (error) {
    console.error('Fetch error:', error);
    showToast(`Failed to load data: ${error.message}`, 'danger');
    setConnectionStatus(false);
    showEmptyState(true);
  } finally {
    showLoading(false);
  }
}

// Render dynamic data table
function filterAndRenderTable() {
  const config = collectionsConfig[currentCollection];
  const query = searchInput.value.toLowerCase().trim();
  
  // Filter search
  const filtered = currentData.filter(row => {
    if (!query) return true;
    return Object.values(row).some(val => 
      String(val || '').toLowerCase().includes(query)
    );
  });
  
  // Counter
  statsCounter.textContent = `${filtered.length} entries found`;
  
  if (filtered.length === 0) {
    showEmptyState(true);
    return;
  }
  
  showEmptyState(false);
  
  // Head
  let headHtml = '<tr>';
  config.displayFields.forEach(field => {
    headHtml += `<th>${field.label}</th>`;
  });
  headHtml += '<th style="text-align: right;">Actions</th></tr>';
  tableHead.innerHTML = headHtml;
  
  // Body
  let bodyHtml = '';
  filtered.forEach(row => {
    const rowId = row[config.idField];
    bodyHtml += `<tr data-id="${rowId}">`;
    
    config.displayFields.forEach(field => {
      let val = row[field.name];
      
      // Formatting boolean values to custom badges
      if (field.type === 'boolean') {
        const isTrue = val === true || Number(val) === 1;
        val = isTrue 
          ? `<span class="badge badge-success">Yes</span>` 
          : `<span class="badge badge-secondary">No</span>`;
      } else if (val === null || val === undefined) {
        val = `<span style="color: var(--text-muted);">NULL</span>`;
      }
      
      bodyHtml += `<td>${val}</td>`;
    });
    
    // Actions block with active micro-actions
    bodyHtml += `
      <td style="text-align: right;">
        <div class="action-cell" style="justify-content: flex-end;">
          <button class="btn-icon-only btn-edit" title="Edit" onclick="editRecord('${rowId}')">
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
          </button>
          <button class="btn-icon-only btn-delete" title="Delete" onclick="deleteRecord('${rowId}')">
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2M10 11v6M14 11v6"/></svg>
          </button>
        </div>
      </td>
    </tr>`;
  });
  
  tableBody.innerHTML = bodyHtml;
}

// Open modal and render dynamic inputs
function openFormModal(recordId = null) {
  editTargetId = recordId;
  const config = collectionsConfig[currentCollection];
  
  if (recordId) {
    modalTitle.textContent = `Edit Record: ${recordId}`;
  } else {
    modalTitle.textContent = `Add Record to ${config.title}`;
  }
  
  // Find record values if editing
  const record = recordId ? currentData.find(r => String(r[config.idField]) === String(recordId)) : {};
  
  // Render Form Fields
  let fieldsHtml = '';
  
  config.formFields.forEach(field => {
    const isIdField = field.name === config.idField;
    const value = recordId ? (record[field.name] !== undefined ? record[field.name] : '') : (field.defaultValue !== undefined ? field.defaultValue : '');
    const requiredAttr = field.required ? 'required' : '';
    const readOnlyAttr = (recordId && isIdField) ? 'disabled style="opacity: 0.65; cursor: not-allowed;"' : '';
    
    fieldsHtml += `<div class="form-group">`;
    fieldsHtml += `<label for="field_${field.name}">${field.label}${field.required ? ' *' : ''}</label>`;
    
    if (field.type === 'boolean') {
      const isChecked = value === true || Number(value) === 1 ? 'checked' : '';
      fieldsHtml += `
        <label class="checkbox-group">
          <input type="checkbox" id="field_${field.name}" name="${field.name}" ${isChecked}>
          <span class="custom-checkbox"></span>
          <span class="checkbox-label">Enabled / Yes</span>
        </label>
      `;
    } else if (field.type === 'textarea') {
      fieldsHtml += `<textarea id="field_${field.name}" name="${field.name}" rows="3" ${requiredAttr} ${readOnlyAttr}>${value}</textarea>`;
    } else if (field.type === 'select') {
      fieldsHtml += `<select id="field_${field.name}" name="${field.name}" ${requiredAttr} ${readOnlyAttr}>`;
      field.options.forEach(opt => {
        const isSelected = opt === value ? 'selected' : '';
        fieldsHtml += `<option value="${opt}" ${isSelected}>${opt}</option>`;
      });
      fieldsHtml += `</select>`;
    } else {
      // numbers or strings
      const inputType = field.type === 'number' ? 'number' : 'text';
      const stepAttr = field.type === 'number' ? 'step="any"' : '';
      fieldsHtml += `<input type="${inputType}" id="field_${field.name}" name="${field.name}" value="${value}" ${stepAttr} ${requiredAttr} ${readOnlyAttr}>`;
    }
    
    fieldsHtml += `</div>`;
  });
  
  modalFormFields.innerHTML = fieldsHtml;
  formModal.style.display = 'flex';
}

function closeFormModal() {
  formModal.style.display = 'none';
  recordForm.reset();
  editTargetId = null;
}

// Form Submission (Create / Edit)
async function handleFormSubmit(e) {
  e.preventDefault();
  const config = collectionsConfig[currentCollection];
  const formData = new FormData(recordForm);
  const payload = {};
  
  // Extract and map values correctly based on config fields
  config.formFields.forEach(field => {
    // If editing, ID field is disabled and won't be sent by form, so we fetch it from state
    if (editTargetId && field.name === config.idField) {
      payload[field.name] = editTargetId;
      return;
    }
    
    if (field.type === 'boolean') {
      const isChecked = document.getElementById(`field_${field.name}`).checked;
      payload[field.name] = isChecked;
    } else if (field.type === 'number') {
      const val = formData.get(field.name);
      payload[field.name] = val !== '' && val !== null ? Number(val) : null;
    } else {
      payload[field.name] = formData.get(field.name);
    }
  });
  
  // Validate ID field if creating and user filled it
  if (!editTargetId && payload[config.idField]) {
    payload[config.idField] = String(payload[config.idField]).trim();
  }

  const idField = config.idField || 'id';
  if (!editTargetId && !payload[idField]) {
    const idPrefixes = {
      'product_ratings_v2': 'rating',
      'pharmacy_products_metadata': 'prod',
      'pharmacy_custom_categories': 'cat',
      'real_estate_listings': 're',
      'vehicle_listings': 'car'
    };
    const prefix = idPrefixes[currentCollection] || 'doc';
    payload[idField] = `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  const docId = editTargetId || String(payload[idField]);
  
  showLoading(true);
  closeFormModal();
  
  try {
    const url = `${firestoreBaseUrl}/${encodeURIComponent(currentCollection)}/${encodeURIComponent(docId)}?key=${encodeURIComponent(apiKey)}`;
    const firestoreDoc = encodeDocument(payload);
    
    const response = await fetch(url, {
      method: "PATCH", // acts as upsert (create or update)
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(firestoreDoc)
    });
    
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Firestore error: ${response.status} - ${errText}`);
    }
    
    showToast(editTargetId ? 'Record updated successfully!' : 'Record created successfully!', 'success');
    loadCollection(currentCollection);
  } catch (error) {
    console.error('Save error:', error);
    showToast(`Error: ${error.message}`, 'danger');
    showLoading(false);
  }
}

// Global scope window methods for Actions buttons in dynamic table
window.editRecord = function(id) {
  openFormModal(id);
};

window.deleteRecord = async function(id) {
  if (!confirm(`Are you sure you want to delete entry "${id}"?`)) return;
  
  showLoading(true);
  try {
    const url = `${firestoreBaseUrl}/${encodeURIComponent(currentCollection)}/${encodeURIComponent(id)}?key=${encodeURIComponent(apiKey)}`;
    const response = await fetch(url, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Firestore error: ${response.status} - ${errText}`);
    }
    
    showToast('Record deleted successfully!', 'success');
    loadCollection(currentCollection);
  } catch (error) {
    console.error('Delete error:', error);
    showToast(`Error: ${error.message}`, 'danger');
    showLoading(false);
  }
};

// UI Feedback helpers
function showLoading(visible) {
  tableLoading.style.display = visible ? 'flex' : 'none';
}

function showEmptyState(visible) {
  tableEmpty.style.display = visible ? 'flex' : 'none';
  dataTable.style.display = visible ? 'none' : 'table';
}

function setConnectionStatus(connected) {
  const dot = connectionStatus.querySelector('.status-dot');
  const text = connectionStatus.querySelector('.status-text');
  if (connected) {
    dot.style.backgroundColor = 'var(--success)';
    dot.style.boxShadow = '0 0 8px var(--success)';
    text.textContent = 'Connected';
  } else {
    dot.style.backgroundColor = 'var(--danger)';
    dot.style.boxShadow = '0 0 8px var(--danger)';
    text.textContent = 'Disconnected';
  }
}

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <div class="toast-message">${message}</div>
  `;
  toastContainer.appendChild(toast);
  
  // Slide out after 3.5s
  setTimeout(() => {
    toast.classList.add('toast-exit');
    toast.addEventListener('transitionend', () => {
      toast.remove();
    });
  }, 3500);
}

// Start app on load
window.addEventListener('DOMContentLoaded', init);
