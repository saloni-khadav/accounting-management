$oldUrl = "https://nextbook-backend.nextsphere.co.in"
$newUrl = "`${API_URL}"

$files = Get-ChildItem -Path ".\src\components" -Filter "*.js" -Recurse

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    if ($content -match $oldUrl) {
        Write-Host "Updating: $($file.Name)"
        
        # Check if API_URL import exists
        if ($content -notmatch "import.*API_URL.*from.*apiConfig") {
            # Add import after the first import statement
            $content = $content -replace "(import.*?;)", "`$1`nimport { API_URL } from '../utils/apiConfig';"
        }
        
        # Replace all occurrences of the old URL
        $content = $content -replace [regex]::Escape($oldUrl), $newUrl
        
        Set-Content -Path $file.FullName -Value $content -NoNewline
    }
}

Write-Host "`nDone! All API URLs have been updated."
