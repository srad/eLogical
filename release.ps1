# Builds a signed release of eLogical, bumping the build number as it goes.
#
#   .\release.ps1            # bump, then build an app bundle for Play
#   .\release.ps1 -DryRun    # say what the bump would be and stop
#
# The signing config is checked before anything is written: an unsigned build is
# worse than no build, because it installs and runs perfectly well and only fails
# when you try to publish it.
param(
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$androidDir = Join-Path $projectRoot "android"
$buildGradlePath = Join-Path $androidDir "app\build.gradle"

# --- Signing config ----------------------------------------------------------

$keyPropertiesPath = @("key.properties", "keystore.properties") |
    ForEach-Object { Join-Path $androidDir $_ } |
    Where-Object { Test-Path -LiteralPath $_ -PathType Leaf } |
    Select-Object -First 1

if (-not $keyPropertiesPath) {
    Write-Host "Missing signing config: $(Join-Path $androidDir 'key.properties')" -ForegroundColor Red
    Write-Host ""
    Write-Host "Create it with these four keys, writing the path with FORWARD slashes:"
    Write-Host "    storeFile=C:/path/to/upload-keystore.jks"
    Write-Host "    storePassword=..."
    Write-Host "    keyAlias=upload"
    Write-Host "    keyPassword=..."
    Write-Host ""
    Write-Host "To make the keystore itself:"
    Write-Host '    keytool -genkey -v -keystore upload-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload'
    Write-Host ""
    Write-Host "Both the file and the keystore are git-ignored. Keep a backup of the"
    Write-Host "keystore somewhere safe: lose it and you cannot update the app again."
    exit 1
}

$properties = @{}
foreach ($line in (Get-Content -LiteralPath $keyPropertiesPath)) {
    $trimmed = $line.Trim()
    if ([string]::IsNullOrWhiteSpace($trimmed) -or $trimmed.StartsWith("#")) {
        continue
    }
    $separatorIndex = $trimmed.IndexOf("=")
    if ($separatorIndex -lt 1) {
        continue
    }
    $properties[$trimmed.Substring(0, $separatorIndex).Trim()] = $trimmed.Substring($separatorIndex + 1).Trim()
}

$missingOrInvalid = @()
foreach ($key in @("storeFile", "storePassword", "keyAlias", "keyPassword")) {
    $value = if ($properties.ContainsKey($key)) { $properties[$key] } else { "" }
    if ([string]::IsNullOrWhiteSpace($value) -or $value -like "REPLACE_WITH_*") {
        $missingOrInvalid += $key
    }
}
if ($missingOrInvalid.Count -gt 0) {
    Write-Error "$keyPropertiesPath has missing or placeholder values: $($missingOrInvalid -join ', ')"
    exit 1
}

$storeFileValue = $properties["storeFile"].Trim().Trim('"').Trim("'")

# Gradle loads this file with java.util.Properties, where a backslash is an ESCAPE
# character: `C:\Users\saman\keys.jks` reaches Gradle as `C:Userssamankeys.jks`,
# which it then reports as a missing keystore — an error that says nothing about
# the real cause. A doubled `\\` is the correct escape and survives intact, so only
# single backslashes are a problem.
if ($storeFileValue -match '(?<!\\)\\(?!\\)') {
    Write-Host "storeFile contains single backslashes: $storeFileValue" -ForegroundColor Red
    Write-Host ""
    Write-Host "Gradle reads this as a Java properties file, where '\' escapes the next"
    Write-Host "character, so the path arrives mangled. Use forward slashes instead:"
    Write-Host "    storeFile=$($storeFileValue -replace '\\+', '/')"
    exit 1
}
$storeFileValue = $storeFileValue -replace '\\\\', '\'

# android/app/build.gradle resolves a relative storeFile with rootProject.file(),
# and rootProject here is android/ — not android/app.
$isAbsolutePath = ($storeFileValue -match "^[A-Za-z]:[\\/]") -or ($storeFileValue -match "^[\\/]{2}")
$resolvedStoreFile = if ($isAbsolutePath) { $storeFileValue } else { Join-Path $androidDir $storeFileValue }

if (-not (Test-Path -LiteralPath $resolvedStoreFile -PathType Leaf)) {
    Write-Error "Keystore file not found at storeFile path: $resolvedStoreFile"
    exit 1
}

# --- Version -----------------------------------------------------------------

$gradleLines = Get-Content -LiteralPath $buildGradlePath
$versionCodeIndex = -1
$versionCode = 0
for ($i = 0; $i -lt $gradleLines.Count; $i++) {
    if ($gradleLines[$i] -match '^(?<indent>\s*)versionCode\s*=?\s*(?<code>\d+)\s*$') {
        $versionCodeIndex = $i
        $versionCode = [int]$Matches["code"]
        $versionCodeIndent = $Matches["indent"]
        break
    }
}
if ($versionCodeIndex -lt 0) {
    Write-Error "Could not find a 'versionCode' line in $buildGradlePath"
    exit 1
}

$versionNameMatch = $gradleLines | Select-String -Pattern '^\s*versionName\s*=?\s*"([^"]+)"' | Select-Object -First 1
$versionName = if ($versionNameMatch) { $versionNameMatch.Matches[0].Groups[1].Value } else { "?" }
$newVersionCode = $versionCode + 1

if ($DryRun) {
    Write-Host "Dry run: build number would be bumped: $versionCode -> $newVersionCode  (versionName $versionName)"
    Write-Host "Dry run: would build an app bundle"
    exit 0
}

$gradleLines[$versionCodeIndex] = "$versionCodeIndent" + "versionCode $newVersionCode"
Set-Content -LiteralPath $buildGradlePath -Value $gradleLines
Write-Host "Build number bumped: $versionCode -> $newVersionCode  (versionName $versionName)"

# --- Build -------------------------------------------------------------------

Push-Location $projectRoot
try {
    Write-Host "Building the web app..." -ForegroundColor Cyan
    & npm.cmd run build
    if ($LASTEXITCODE -ne 0) {
        Write-Error "The web build failed. build.gradle is already at $newVersionCode; re-run when it is fixed."
        exit 1
    }

    & npm.cmd exec -- cap sync android
    if ($LASTEXITCODE -ne 0) {
        Write-Error "cap sync failed. build.gradle is already at $newVersionCode; re-run when it is fixed."
        exit 1
    }
}
finally {
    Pop-Location
}

Push-Location $androidDir
try {
    Write-Host "Signing config looks valid. Building release..." -ForegroundColor Cyan
    & (Join-Path $androidDir "gradlew.bat") bundleRelease
    if ($LASTEXITCODE -ne 0) {
        Write-Error "The build failed. build.gradle is already at $newVersionCode; re-run when it is fixed."
        exit 1
    }
}
finally {
    Pop-Location
}

$artifact = Join-Path $androidDir "app\build\outputs\bundle\release\app-release.aab"
if (-not (Test-Path -LiteralPath $artifact -PathType Leaf)) {
    Write-Error "Gradle did not produce $artifact"
    exit 1
}

# --- Verify it is actually signed --------------------------------------------

# An unsigned bundle is written under the SAME name as a signed one, so the filename
# proves nothing. Read the answer out of the artifact instead: a bundle is JAR-signed,
# which puts the signature block at the root of the zip as META-INF/<ALIAS>.RSA (or .DSA
# /.EC) beside MANIFEST.MF. Checking the zip needs no JDK tool, and -- unlike parsing
# `jarsigner -verify` -- cannot be defeated by the JVM localising its output.
#
# This test holds for bundles only. An APK built here is signed with APK Signature
# Scheme v2 and no v1 JAR signature at all (minSdk 31 lets AGP skip it), so it carries
# no META-INF/*.RSA and would fail this check while being perfectly well signed.
Add-Type -AssemblyName System.IO.Compression.FileSystem
$archive = [System.IO.Compression.ZipFile]::OpenRead($artifact)
try {
    $signatureBlocks = @($archive.Entries |
        Where-Object { $_.FullName -match '^META-INF/(?<alias>[^/]+)\.(RSA|DSA|EC)$' } |
        ForEach-Object { $_.FullName })
}
finally {
    $archive.Dispose()
}

if ($signatureBlocks.Count -eq 0) {
    Write-Host "The bundle came out UNSIGNED and Play would reject it." -ForegroundColor Red
    Write-Host "Gradle did not apply the signing config -- check the values in $keyPropertiesPath."
    exit 1
}

$signedBy = ($signatureBlocks[0] -replace '^META-INF/', '' -replace '\.(RSA|DSA|EC)$', '')
$sizeMb = [math]::Round((Get-Item -LiteralPath $artifact).Length / 1MB, 1)
Write-Host ""
Write-Host "Signed by '$signedBy': $versionName+$newVersionCode  ->  $artifact  ($sizeMb MB)" -ForegroundColor Green
Write-Host "Upload it at https://play.google.com/console -> Test and release."
