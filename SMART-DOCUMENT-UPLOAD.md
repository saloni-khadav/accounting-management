# Smart Document Upload Feature

## Overview
Users can now upload ANY type of document (GST Certificate, PAN Card, Bank Statement, Aadhar Card) and the system will automatically:
1. Detect the document type
2. Extract relevant information using OCR
3. Auto-fill the appropriate form fields

## How It Works

### Backend (OCR Service)
**File**: `backend/routes/ocr.js`

- **Auto-Detection**: Analyzes extracted text to identify document type
- **Pattern Matching**: Uses regex patterns to extract:
  - PAN Number: `[A-Z]{5}[0-9]{4}[A-Z]{1}`
  - GST Number: `\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}`
  - Aadhar Number: `\d{4}\s?\d{4}\s?\d{4}`
  - IFSC Code: `[A-Z]{4}0[A-Z0-9]{6}`
  - Account Number: `\d{9,18}`
  - Bank Name: Common bank names (HDFC, ICICI, SBI, etc.)

### Frontend (Vendor Form)
**File**: `frontend/src/components/VendorForm.js`

#### New Features:
1. **Smart Upload Section**: Blue highlighted area at the top of documents section
2. **Auto-Detection**: Upload any document without specifying type
3. **Multi-Field Extraction**: Extracts all available fields from a single document
4. **Visual Feedback**: Shows which fields were extracted

## Usage

### For Users:
1. Click "Upload Any Document" button in the blue section
2. Select any document (GST/PAN/Bank/Aadhar)
3. System automatically:
   - Detects document type
   - Extracts all relevant information
   - Fills appropriate form fields
   - Shows confirmation with extracted fields

### Example Scenarios:

**Scenario 1: Upload PAN Card**
- System detects: PAN Card
- Extracts: PAN Number
- Auto-fills: PAN Number field
- Stores: Document in panCard field

**Scenario 2: Upload Bank Statement**
- System detects: Bank Statement
- Extracts: Account Number, IFSC Code, Bank Name
- Auto-fills: All three bank fields
- Stores: Document in bankStatement field

**Scenario 3: Upload GST Certificate**
- System detects: GST Certificate
- Extracts: GST Number
- Auto-fills: First GST Number field
- Stores: Document in gstCertificate field

**Scenario 4: Upload Aadhar Card**
- System detects: Aadhar Card
- Extracts: Aadhar Number
- Auto-fills: Aadhar Number field
- Stores: Document in aadharCard field

## API Endpoint

### POST `/api/ocr/extract`

**Request:**
```javascript
FormData {
  document: File,
  documentType: String (optional - auto-detected if not provided)
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "panNumber": "ABCDE1234F",
    "gstNumber": "29ABCDE1234F1Z5",
    "accountNumber": "1234567890",
    "ifscCode": "HDFC0001234",
    "bankName": "HDFC BANK",
    "aadharNumber": "123456789012"
  },
  "detectedType": "panCard",
  "message": "Data extracted successfully"
}
```

## Benefits

1. **User-Friendly**: No need to specify document type
2. **Time-Saving**: Upload once, extract multiple fields
3. **Error-Reduction**: Automatic extraction reduces manual entry errors
4. **Flexible**: Works with any supported document type
5. **Smart**: Detects and extracts all available information

## Supported File Types
- PDF (.pdf)
- Images (.jpg, .jpeg, .png)

## Technical Details

### OCR Provider
- Google Cloud Vision API
- Document Text Detection feature
- High accuracy for printed documents

### Extraction Logic
1. Upload document → Google Vision API
2. Extract raw text from document
3. Apply regex patterns to identify data
4. Detect document type based on found patterns
5. Return structured data with detected type
6. Frontend auto-fills corresponding fields

## Future Enhancements
- Support for more document types (Driving License, Passport, etc.)
- Address extraction from documents
- Multi-language support
- Confidence scores for extracted data
- Manual correction interface
