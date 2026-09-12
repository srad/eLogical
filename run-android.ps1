param(
    [string]$AdbPath = "",
    # Pick a specific device instead of the first one adb lists.
    [string]$Serial = "",
    # Build the signed release APK instead of the debug one. Needs the signing keys
    # in android/keystore.properties; installs as an update over a Play build.
    [switch]$Release,
    # Uninstall first. Required to replace a differently signed build (e.g. the one
    # from Play with a debug build) -- DELETES the app's data, highscores included.
    [switch]$Reinstall,
    # Skip the web build and cap sync; only rebuild the native project.
    [switch]$SkipWebBuild,
    # Stream the app's log after launching (Ctrl+C to stop).
    [switch]$Log
)

# Builds the web app, syncs it into the Android project, assembles an APK,
# installs it on the first phone adb lists and starts it.

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ProjectRoot
$AndroidRoot = Join-Path $ProjectRoot "android"

function Fail {
    param([Parameter(Mandatory = $true)][string]$Message)
    Write-Host $Message -ForegroundColor Red
    exit 1
}

function Invoke-Native {
    param(
        [Parameter(Mandatory = $true)][string]$FilePath,
        [string[]]$Arguments = @()
    )
    # stderr comes back as text; with "Stop" it would abort the script.
    $ErrorActionPreference = "Continue"
    $output = @(& $FilePath @Arguments 2>&1 | ForEach-Object { "$_" })
    return [pscustomobject]@{ Output = $output; ExitCode = $LASTEXITCODE }
}

function Resolve-Executable {
    param([Parameter(Mandatory = $true)][string]$Path)
    $command = Get-Command $Path -ErrorAction SilentlyContinue
    if ($command) {
        return $command.Source
    }
    if (Test-Path $Path -PathType Leaf) {
        return (Resolve-Path $Path).Path
    }
    return $null
}

function Invoke-Step {
    # Runs a build tool with its output left on the console, and stops on failure.
    param(
        [Parameter(Mandatory = $true)][string]$FilePath,
        [string[]]$Arguments = @(),
        [string]$WorkingDirectory = $ProjectRoot,
        [Parameter(Mandatory = $true)][string]$FailureMessage
    )
    $process = Start-Process -FilePath $FilePath -ArgumentList $Arguments `
        -WorkingDirectory $WorkingDirectory -Wait -PassThru -NoNewWindow
    if ($process.ExitCode -ne 0) {
        Fail -Message "$FailureMessage (exit code $($process.ExitCode))."
    }
}

# --- Tools -------------------------------------------------------------------

$npm = Resolve-Executable -Path "npm.cmd"
if (-not $npm) {
    $npm = Resolve-Executable -Path "npm"
}
if (-not $npm) {
    Fail -Message "npm not found. Install Node.js 22 or newer."
}

if ($AdbPath) {
    $adb = Resolve-Executable -Path $AdbPath
} else {
    $adb = Resolve-Executable -Path "adb"
    if (-not $adb) {
        $adb = Resolve-Executable -Path (Join-Path $env:LOCALAPPDATA "Android\Sdk\platform-tools\adb.exe")
    }
}
if (-not $adb) {
    Fail -Message "adb not found. Pass -AdbPath or install the Android SDK platform-tools."
}

$gradlew = Join-Path $AndroidRoot "gradlew.bat"
if (-not (Test-Path $gradlew)) {
    Fail -Message "android\gradlew.bat not found. Run 'npx cap add android' first."
}

# Gradle takes the JDK from JAVA_HOME, falling back to java on PATH. Android
# Studio's bundled runtime is the reliable one when neither is set up.
if (-not $env:JAVA_HOME -and -not (Get-Command java -ErrorAction SilentlyContinue)) {
    $jbr = @(
        "$env:ProgramFiles\Android\Android Studio\jbr",
        "$env:LOCALAPPDATA\Programs\Android Studio\jbr"
    ) | Where-Object { Test-Path (Join-Path $_ "bin\java.exe") } | Select-Object -First 1
    if (-not $jbr) {
        Fail -Message "No JDK found. Install JDK 17 or newer, or set JAVA_HOME."
    }
    $env:JAVA_HOME = $jbr
    Write-Host "Using Android Studio's JDK at $jbr."
}

# --- Package name ------------------------------------------------------------

$buildGradle = Join-Path $AndroidRoot "app\build.gradle"
$applicationIdLine = Select-String -Path $buildGradle -Pattern '^\s*applicationId\s*=?\s*"([^"]+)"' | Select-Object -First 1
if (-not $applicationIdLine) {
    Fail -Message "Could not read applicationId from android\app\build.gradle."
}
$package = $applicationIdLine.Matches[0].Groups[1].Value
if (-not $Release) {
    # The debug build type carries a suffix so it installs next to the Play build.
    $suffixLine = Select-String -Path $buildGradle -Pattern '^\s*applicationIdSuffix\s*=?\s*"([^"]+)"' | Select-Object -First 1
    if ($suffixLine) {
        $package += $suffixLine.Matches[0].Groups[1].Value
    }
}
# applicationIdSuffix shifts the package id but not the activity's class, which stays in
# the namespace -- so the component is e.g. "com.x.app.debug/com.x.app.MainActivity".
$namespaceLine = Select-String -Path $buildGradle -Pattern '^\s*namespace\s*=?\s*"([^"]+)"' | Select-Object -First 1
if (-not $namespaceLine) {
    Fail -Message "Could not read namespace from android\app\build.gradle."
}
$launchComponent = "$package/$($namespaceLine.Matches[0].Groups[1].Value).MainActivity"

# --- Phone -------------------------------------------------------------------

Write-Host "Looking for a connected device..."
$devices = Invoke-Native -FilePath $adb -Arguments @("devices")
$serial = $null
foreach ($line in $devices.Output) {
    # A wirelessly paired phone's mDNS serial can contain spaces, e.g.
    # "adb-R5CY819NQ7W-uFkgtv (2)._adb-tls-connect._tcp".
    if ($line -match '^(.*\S)\s+device$') {
        if (-not $Serial -or $Matches[1] -eq $Serial) {
            $serial = $Matches[1]
            break
        }
    }
}
if (-not $serial) {
    if ($Serial) {
        Fail -Message "Device '$Serial' is not connected. Run 'adb devices' to list them."
    }
    if ($devices.Output -match '\sunauthorized$') {
        Fail -Message "A device is connected but not authorized. Accept the debugging prompt on it and run again."
    }
    Fail -Message "No Android device found. Connect one with adb, or start an emulator, and run again."
}
$model = (Invoke-Native -FilePath $adb -Arguments @("-s", $serial, "shell", "getprop", "ro.product.model")).Output | Select-Object -First 1
$androidRelease = (Invoke-Native -FilePath $adb -Arguments @("-s", $serial, "shell", "getprop", "ro.build.version.release")).Output | Select-Object -First 1
$deviceSdk = (Invoke-Native -FilePath $adb -Arguments @("-s", $serial, "shell", "getprop", "ro.build.version.sdk")).Output | Select-Object -First 1
Write-Host "Using $model - Android $androidRelease (API $deviceSdk)."

# --- Web build and sync ------------------------------------------------------

if (-not (Test-Path (Join-Path $ProjectRoot "node_modules"))) {
    Write-Host "Installing dependencies (first run)..."
    Invoke-Step -FilePath $npm -Arguments @("install") -FailureMessage "npm install failed"
}

if ($SkipWebBuild) {
    if (-not (Test-Path (Join-Path $AndroidRoot "app\src\main\assets\public\index.html"))) {
        Fail -Message "-SkipWebBuild needs a previous sync; the Android project has no web assets yet."
    }
    Write-Host "Skipping the web build; reusing the synced assets."
} else {
    Write-Host "Building the web app..."
    Invoke-Step -FilePath $npm -Arguments @("run", "build") -FailureMessage "The Vite build failed"

    Write-Host "Syncing into the Android project..."
    Invoke-Step -FilePath $npm -Arguments @("exec", "--", "cap", "sync", "android") -FailureMessage "cap sync failed"
}

# --- Assemble ----------------------------------------------------------------

if ($Release) {
    $gradleTask = "assembleRelease"
    $apkPath = Join-Path $AndroidRoot "app\build\outputs\apk\release\app-release.apk"
    $unsignedApkPath = Join-Path $AndroidRoot "app\build\outputs\apk\release\app-release-unsigned.apk"
} else {
    $gradleTask = "assembleDebug"
    $apkPath = Join-Path $AndroidRoot "app\build\outputs\apk\debug\app-debug.apk"
    $unsignedApkPath = $null
}

Write-Host "Running gradlew $gradleTask..."
$buildStarted = Get-Date
Invoke-Step -FilePath $gradlew -Arguments @($gradleTask) -WorkingDirectory $AndroidRoot `
    -FailureMessage "The Gradle build failed"

if ($unsignedApkPath -and -not (Test-Path $apkPath) -and (Test-Path $unsignedApkPath)) {
    Fail -Message ("Gradle produced an UNSIGNED release APK, which cannot be installed. " +
        "Add RELEASE_STORE_FILE, RELEASE_STORE_PASSWORD, RELEASE_KEY_ALIAS and " +
        "RELEASE_KEY_PASSWORD to android\keystore.properties -- see README.md.")
}
$apkItem = Get-Item $apkPath -ErrorAction SilentlyContinue
if (-not $apkItem) {
    Fail -Message "Gradle did not produce $apkPath."
}
if ($apkItem.LastWriteTime -lt $buildStarted) {
    Write-Host "Note: the APK was up to date; installing the existing build."
}

# --- Install -----------------------------------------------------------------

if ($Reinstall) {
    Write-Host "Uninstalling $package (its data, including highscores, is deleted)..."
    $uninstall = Invoke-Native -FilePath $adb -Arguments @("-s", $serial, "shell", "pm", "uninstall", "--user", "current", $package)
    if (-not ($uninstall.Output -match 'Success')) {
        # Not installed for this user is fine; anything else is not.
        if (-not ($uninstall.Output -match 'DELETE_FAILED_INTERNAL_ERROR|not installed')) {
            $uninstall.Output | ForEach-Object { Write-Host $_ }
            Fail -Message "Could not uninstall $package."
        }
    }
}

Write-Host "Installing $package on $model..."
# --user current: installing for all users fails when the phone has a profile
# adb may not access (e.g. Secure Folder).
$install = Invoke-Native -FilePath $adb -Arguments @("-s", $serial, "install", "--user", "current", "-r", $apkPath)
$install.Output | ForEach-Object { Write-Host $_ }
if (-not ($install.Output -match '^Success')) {
    if ($install.Output -match 'INSTALL_FAILED_UPDATE_INCOMPATIBLE|signatures do not match') {
        Fail -Message ("$package is already installed with a different signature (a Play or " +
            "release build). Either run with -Release to build with the same keystore, or " +
            "with -Reinstall to uninstall first -- which DELETES its data, highscores included.")
    }
    Fail -Message "Installing the APK failed."
}

# --- Launch ------------------------------------------------------------------

# The explicit component first: a launcher activity declares MAIN/LAUNCHER but usually not
# CATEGORY_DEFAULT, so resolving it implicitly can fail.
$launch = Invoke-Native -FilePath $adb -Arguments @("-s", $serial, "shell", "am", "start", "--user", "current", "-n", $launchComponent)
if ($launch.ExitCode -ne 0 -or ($launch.Output -match 'Error')) {
    $launch = Invoke-Native -FilePath $adb -Arguments @("-s", $serial, "shell", "am", "start", "--user", "current", "-a", "android.intent.action.MAIN", "-c", "android.intent.category.LAUNCHER", $package)
    if ($launch.ExitCode -ne 0 -or ($launch.Output -match 'Error')) {
        $launch.Output | ForEach-Object { Write-Host $_ }
        Fail -Message "Could not start the app on the device."
    }
}

$installed = (Invoke-Native -FilePath $adb -Arguments @("-s", $serial, "shell", "dumpsys", "package", $package)).Output |
    Select-String -Pattern 'versionCode=(\d+).*targetSdk=(\d+)' | Select-Object -First 1
if ($installed) {
    $groups = $installed.Matches[0].Groups
    Write-Host "eLogical launched on $model (versionCode $($groups[1].Value), targetSdk $($groups[2].Value))."
} else {
    Write-Host "eLogical launched on $model."
}

# --- Log ---------------------------------------------------------------------

if ($Log) {
    $processId = $null
    for ($attempt = 0; $attempt -lt 20 -and -not $processId; $attempt++) {
        $pidof = Invoke-Native -FilePath $adb -Arguments @("-s", $serial, "shell", "pidof", $package)
        $processId = $pidof.Output | Where-Object { $_ -match '^\d+' } | ForEach-Object { $_.Trim().Split(" ")[0] } | Select-Object -First 1
        if (-not $processId) {
            Start-Sleep -Milliseconds 500
        }
    }
    if (-not $processId) {
        Fail -Message "The app did not start (no process found)."
    }
    Write-Host "Streaming the app's log (Ctrl+C to stop)..."
    & $adb -s $serial logcat "--pid=$processId"
}
exit 0
