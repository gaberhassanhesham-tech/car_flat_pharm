const express = require('express');
const cors = require('cors');
const path = require('path');
const firebaseConfig = require('./firebase-config');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const projectId = firebaseConfig.projectId;
const apiKey = firebaseConfig.apiKey;
const firestoreBaseUrl = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents`;

const collectionIdFields = {
  'pharmacy_custom_categories': 'id',
  'pharmacy_merchant_preferences': 'user_key',
  'pharmacy_products_metadata': 'product_id',
  'real_estate_listings': 'real_estate_key',
  'vehicle_listings': 'car_key'
};

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

// REST API Endpoints

// GET /api/:collection - Retrieve all documents in a collection
app.get('/api/:collection', async (req, res) => {
  const collectionName = req.params.collection;
  console.log(`[API] Fetching all documents from collection: ${collectionName}`);
  
  try {
    const documents = [];
    let pageToken = "";

    do {
      const tokenPart = pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : "";
      const url = `${firestoreBaseUrl}/${encodeURIComponent(collectionName)}?key=${encodeURIComponent(apiKey)}&pageSize=1000${tokenPart}`;
      const response = await fetch(url);

      if (!response.ok) {
        if (response.status === 404) {
          console.log(`[API] Collection ${collectionName} not found, returning empty array.`);
          return res.json({ success: true, data: [] });
        }
        const errText = await response.text();
        throw new Error(`Firestore response error: ${response.status} - ${errText}`);
      }

      const payload = await response.json();
      documents.push(...((payload.documents || []).map(decodeDocument).filter(Boolean)));
      pageToken = payload.nextPageToken || "";
    } while (pageToken);

    console.log(`[API] Successfully retrieved ${documents.length} documents from ${collectionName}`);
    
    res.json({ success: true, data: documents });
  } catch (error) {
    console.error(`[API ERROR] Error in GET /api/${collectionName}:`, error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/:collection/:id - Retrieve a single document
app.get('/api/:collection/:id', async (req, res) => {
  const collectionName = req.params.collection;
  const docId = req.params.id;
  console.log(`[API] Fetching document ${docId} from collection ${collectionName}`);
  
  try {
    const url = `${firestoreBaseUrl}/${encodeURIComponent(collectionName)}/${encodeURIComponent(docId)}?key=${encodeURIComponent(apiKey)}`;
    const response = await fetch(url);
    
    if (response.status === 404) {
      console.log(`[API] Document ${docId} not found in ${collectionName}`);
      return res.status(404).json({ success: false, error: 'Document not found' });
    }
    
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Firestore response error: ${response.status} - ${errText}`);
    }
    
    const doc = decodeDocument(await response.json());
    console.log(`[API] Successfully retrieved document ${docId}`);
    res.json({ success: true, data: doc });
  } catch (error) {
    console.error(`[API ERROR] Error in GET /api/${collectionName}/${docId}:`, error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/:collection - Create a new document
app.post('/api/:collection', async (req, res) => {
  const collectionName = req.params.collection;
  const data = req.body;
  const idField = collectionIdFields[collectionName] || 'id';
  
  // Generate ID if missing
  if (!data[idField]) {
    data[idField] = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
  
  const docId = String(data[idField]);
  console.log(`[API] Creating document ${docId} in collection ${collectionName}`);
  
  try {
    const url = `${firestoreBaseUrl}/${encodeURIComponent(collectionName)}/${encodeURIComponent(docId)}?key=${encodeURIComponent(apiKey)}`;
    const response = await fetch(url, {
      method: "PATCH", // PATCH on firestore REST acts as upsert
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(encodeDocument(data))
    });
    
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Firestore response error: ${response.status} - ${errText}`);
    }
    
    const doc = decodeDocument(await response.json());
    console.log(`[API] Successfully created document ${docId}`);
    res.json({ success: true, data: doc });
  } catch (error) {
    console.error(`[API ERROR] Error in POST /api/${collectionName}:`, error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/:collection/:id - Update an existing document
app.put('/api/:collection/:id', async (req, res) => {
  const collectionName = req.params.collection;
  const docId = req.params.id;
  const data = req.body;
  console.log(`[API] Updating document ${docId} in collection ${collectionName}`);
  
  try {
    const url = `${firestoreBaseUrl}/${encodeURIComponent(collectionName)}/${encodeURIComponent(docId)}?key=${encodeURIComponent(apiKey)}`;
    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(encodeDocument(data))
    });
    
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Firestore response error: ${response.status} - ${errText}`);
    }
    
    const doc = decodeDocument(await response.json());
    console.log(`[API] Successfully updated document ${docId}`);
    res.json({ success: true, data: doc });
  } catch (error) {
    console.error(`[API ERROR] Error in PUT /api/${collectionName}/${docId}:`, error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/:collection/:id - Delete a document
app.delete('/api/:collection/:id', async (req, res) => {
  const collectionName = req.params.collection;
  const docId = req.params.id;
  console.log(`[API] Deleting document ${docId} from collection ${collectionName}`);
  
  try {
    const url = `${firestoreBaseUrl}/${encodeURIComponent(collectionName)}/${encodeURIComponent(docId)}?key=${encodeURIComponent(apiKey)}`;
    const response = await fetch(url, {
      method: "DELETE"
    });
    
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Firestore response error: ${response.status} - ${errText}`);
    }
    
    console.log(`[API] Successfully deleted document ${docId}`);
    res.json({ success: true });
  } catch (error) {
    console.error(`[API ERROR] Error in DELETE /api/${collectionName}/${docId}:`, error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`[Server] Express server running on port ${PORT}`);
  console.log(`[Server] Connecting to Firestore project: ${projectId}`);
});
