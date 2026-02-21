$files = Get-ChildItem -Path ".\src\components" -Filter "*.js" -Recurse

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    # Remove duplicate API_URL imports
    $lines = $content -split "`r?`n"
    $seenImport = $false
    $newLines = @()
    
    foreach ($line in $lines) {
        if ($line -match "import.*API_URL.*from.*apiConfig") {
            if (-not $seenImport) {
                $newLines += $line
                $seenImport = $true
            }
        } else {
            $newLines += $line
        }
    }
    
    $content = $newLines -join "`r`n"
    
    # Fix template literals - replace '${API_URL} with `${API_URL}
    $content = $content -replace "'(\$\{API_URL\})", '`$1'
    
    Set-Content -Path $file.FullName -Value $content -NoNewline
    Write-Host "Fixed: $($file.Name)"
}

Write-Host "`nDone! All files have been fixed."
