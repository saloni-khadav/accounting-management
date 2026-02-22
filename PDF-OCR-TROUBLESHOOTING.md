# PDF OCR Troubleshooting Guide

## Problem: "Text not found" error when uploading PDF

### Quick Fixes:

1. **Test API Connection**
   ```bash
   cd backend
   node testOCR.js
   ```

2. **Check API Key**
   - Open `.env` file
   - Verify `GOOGLE_OCR_KEY` is present
   - Key should start with `AIza...`

3. **Verify PDF Quality**
   - PDF should contain actual text (not scanned images)
   - If PDF is scanned, ensure it's clear and readable
   - File size should be under 20MB

4. **Check Backend Logs**
   - Start backend: `npm start`
   - Upload document
   - Check console for:
     - "Upload received: [filename]"
     - "Starting OCR..."
     - "Extracted text length: [number]"
     - "Text preview: [text]"

### Common Issues:

#### Issue 1: API Key Invalid
**Symptoms**: Error 403 or "API key not valid"
**Solution**: 
- Go to Google Cloud Console
- Enable Vision API
- Create new API key
- Update `.env` file

#### Issue 2: PDF is Image-based (Scanned)
**Symptoms**: "Text not found" but PDF looks fine
**Solution**:
- Google Vision API works with image-based PDFs
- Ensure PDF is clear and high resolution
- Try converting PDF to JPG first

#### Issue 3: File Too Large
**Symptoms**: Upload fails or times out
**Solution**:
- Compress PDF
- Current limit: 20MB
- Reduce PDF quality/size

#### Issue 4: Network/CORS Issues
**Symptoms**: Request fails immediately
**Solution**:
- Check internet connection
- Verify backend is running on port 5001
- Check browser console for CORS errors

### Testing Steps:

1. **Test with Image First**
   - Upload a clear JPG/PNG of a PAN card
   - If this works, issue is PDF-specific

2. **Test with Different PDF**
   - Try a text-based PDF (not scanned)
   - Try a smaller PDF file

3. **Check Backend Response**
   - Open browser DevTools (F12)
   - Go to Network tab
   - Upload document
   - Check `/api/ocr/extract` response
   - Look for `rawTextPreview` field

### Debug Mode:

Enable detailed logging:
1. Backend logs show:
   - File received
   - OCR processing
   - Text extracted
   - Data found

2. Frontend console shows:
   - File details
   - OCR result
   - Extracted data

### Expected Behavior:

**Successful Upload:**
```
Backend Console:
✓ Upload received: pan-card.pdf application/pdf
✓ Starting OCR...
✓ Extracted text length: 245
✓ Text preview: INCOME TAX DEPARTMENT...
✓ Found data: { panNumber: 'ABCDE1234F' }

Frontend Alert:
✅ Success!
PAN: ABCDE1234F
```

**Failed Upload:**
```
Backend Console:
✓ Upload received: document.pdf application/pdf
✓ Starting OCR...
✗ Extracted text length: 0
✗ OCR Error: No text found

Frontend Alert:
⚠️ Could not extract text from document
```

### Contact Support:

If issue persists:
1. Share backend console logs
2. Share browser console logs
3. Share sample PDF (if possible)
4. Mention PDF size and type
