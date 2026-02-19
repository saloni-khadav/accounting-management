$files = Get-ChildItem -Path ".\src" -Filter "*.js" -Recurse

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    # Fix HTML entities back to proper quotes
    $content = $content -replace '&#39;', "'"
    $content = $content -replace '&quot;', '"'
    $content = $content -replace '&amp;', '&'
    $content = $content -replace '&gt;', '>'
    $content = $content -replace '&lt;', '<'
    
    # Fix malformed template literals - replace `${...}' with `${...}`
    $content = $content -replace "(`\$\{[^}]+\})'", '$1`'
    
    # Fix fetch calls with mixed quotes
    $content = $content -replace "fetch\('`\$\{API_URL\}/([^']+)'\)", 'fetch(`${API_URL}/$1`)'
    $content = $content -replace "fetch\(`\$\{API_URL\}/([^'`]+)'", 'fetch(`${API_URL}/$1`'
    
    Set-Content -Path $file.FullName -Value $content -NoNewline
    Write-Host "Fixed: $($file.Name)"
}

Write-Host "`nDone! All syntax errors have been fixed."
