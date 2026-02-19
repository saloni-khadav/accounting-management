$files = Get-ChildItem -Path ".\src" -Filter "*.js" -Recurse

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    # Fix all variations of incorrect template literals
    $content = $content -replace "fetch\(`\$\{API_URL\}/([^']+)'", 'fetch(`${API_URL}/$1`'
    $content = $content -replace "fetch\('`\$\{API_URL\}/([^']+)'", 'fetch(`${API_URL}/$1`'
    
    Set-Content -Path $file.FullName -Value $content -NoNewline
}

Write-Host "Done! All template literals have been fixed."
