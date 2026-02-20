const fs = require('fs');
const path = require('path');

const files = [
  'd:\\accounting-management\\frontend\\src\\components\\ClientForm.js',
  'd:\\accounting-management\\frontend\\src\\components\\CreditDebitNoteForm.js',
  'd:\\accounting-management\\frontend\\src\\components\\VendorForm.js',
  'd:\\accounting-management\\frontend\\src\\components\\VendorsAging.js'
];

files.forEach(filePath => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Replace HTML entities with actual characters
    content = content.replace(/&#39;/g, "'");
    content = content.replace(/&quot;/g, '"');
    content = content.replace(/&lt;/g, '<');
    content = content.replace(/&gt;/g, '>');
    content = content.replace(/&amp;/g, '&');
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ Fixed: ${path.basename(filePath)}`);
    } else {
      console.log(`- No changes needed: ${path.basename(filePath)}`);
    }
  } catch (error) {
    console.error(`✗ Error processing ${path.basename(filePath)}:`, error.message);
  }
});

console.log('\nAll files processed!');
