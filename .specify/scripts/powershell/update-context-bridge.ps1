#!/usr/bin/env pwsh
# .specify/scripts/powershell/update-context-bridge.ps1
#
# Bridge between Spec Kit artifacts and context_envelope.json
# Parses constitution.md, specs/, contracts/ and produces a validated
# context_envelope.json consumable by gem-team agents.
#
# ═══════════════════════════════════════════════════════════════════════════
# SCHEMA CONTRACT
# ═══════════════════════════════════════════════════════════════════════════
# Este script genera context_envelope.json con los siguientes campos:
#
# Campos obligatorios:
# - context_envelope.meta (object): plan_id, created_at, version
# - context_envelope.scope (object): purpose, applies_to
# - context_envelope.tech_stack (array): tecnologías detectadas
# - context_envelope.conventions (array): reglas y convenciones
# - context_envelope.constraints (object): hard/soft/compatibility
# - context_envelope.architecture_snapshot (object): key_dirs, patterns
# - context_envelope.research_digest (object): relevant_files, patterns_found, gotchas
#
# Campos opcionales:
# - context_envelope.prior_decisions (array): decisiones registradas
# - context_envelope.reuse_notes (array): notas de reutilización
#
# Mapping artifact → field:
#   constitution.md         → conventions, constraints.hard, prior_decisions
#   spec.md                 → research_digest.domain_context, scope.purpose
#   plan.md                 → tech_stack, architecture_snapshot
#   data-model.md           → architecture_snapshot.key_components
#   tasks.md                → research_digest.dependencies
#   contracts/              → architecture_snapshot.key_components
#   research.md             → research_digest.patterns_found
# ═══════════════════════════════════════════════════════════════════════════

param(
    [string]$ProjectPath,
    [switch]$ValidateOnly,
    [switch]$Force
)

$ErrorActionPreference = 'Stop'

# ─── Source common functions ───────────────────────────────────────────────
$PSScriptRootResolved = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path $MyInvocation.MyCommand.Path -Parent }
. "$PSScriptRootResolved/common.ps1"

# ─── Help ─────────────────────────────────────────────────────────────────
if ($MyInvocation.BoundParameters.Verbose -or ($args -contains '-Help') -or ($args -contains '-h') -or ($args -contains '/h')) {
    Write-Output @"
Usage: .\update-context-bridge.ps1 [OPTIONS]

Bridge entre artifacts Spec Kit y context_envelope.json.
Parsea constitution.md, specs/*/, contracts/ y genera context_envelope.json validado.

OPTIONS:
  -ProjectPath <path>   Ruta del proyecto (default: repositorio detectado)
  -ValidateOnly         Solo validar context_envelope.json existente
  -Force                Sobrescribir context_envelope.json sin confirmar
  -Verbose              Output detallado

OUTPUT:
  context_envelope.json (en raíz del proyecto)

SCHEMA CONTRACT (resumen):
  Meta, Scope, TechStack, Conventions, Constraints, ArchitectureSnapshot,
  ResearchDigest (obligatorios); PriorDecisions, ReuseNotes (opcionales)

  Mapping artifact → field:
    constitution.md   → conventions, constraints.hard, prior_decisions
    spec.md           → domain_context, scope.purpose
    plan.md           → tech_stack, architecture_snapshot
    data-model.md     → architecture_snapshot.key_components
    tasks.md          → dependencies
    contracts/        → key_components
"@
    exit 0
}

# ─── Resolve paths ────────────────────────────────────────────────────────
if (-not $ProjectPath) {
    try {
        $ProjectPath = Get-RepoRoot
    } catch {
        $ProjectPath = (Get-Location).Path
    }
}

$ProjectPath = Resolve-Path -LiteralPath $ProjectPath -ErrorAction Stop
$specifyDir = Join-Path $ProjectPath '.specify'
$outputPath = Join-Path $ProjectPath 'context_envelope.json'
$schemaPath = Join-Path $specifyDir 'scripts/powershell/context_envelope.schema.json'

Write-Verbose "Project path: $ProjectPath"
Write-Verbose "Output path: $outputPath"

# ─── ValidateOnly mode ────────────────────────────────────────────────────
if ($ValidateOnly) {
    if (-not (Test-Path $outputPath -PathType Leaf)) {
        [Console]::Error.WriteLine("ERROR: context_envelope.json not found at $outputPath")
        exit 1
    }
    Write-Verbose "Validating existing context_envelope.json..."
    if (Test-Path $schemaPath -PathType Leaf) {
        $result = & $PSCommandPath -ProjectPath $ProjectPath -Force 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Output "[OK] context_envelope.json is valid"
            exit 0
        } else {
            [Console]::Error.WriteLine("FAIL: context_envelope.json validation failed")
            exit 1
        }
    } else {
        Write-Warning "Schema not found at $schemaPath; cannot validate"
        exit 1
    }
}

# ─── Helpers ──────────────────────────────────────────────────────────────

function ConvertTo-Hashtable {
    <#
    .SYNOPSIS
        Recursively convert PSCustomObject to Hashtable for JSON serialization.
    #>
    param([object]$InputObject)

    if ($null -eq $InputObject) { return $null }
    if ($InputObject -is [array]) {
        return @($InputObject | ForEach-Object { ConvertTo-Hashtable $_ })
    }
    if ($InputObject -is [hashtable] -or $InputObject -is [PSCustomObject]) {
        $hash = [ordered]@{}
        foreach ($prop in $InputObject.PSObject.Properties) {
            $hash[$prop.Name] = ConvertTo-Hashtable $prop.Value
        }
        return $hash
    }
    return $InputObject
}

function Read-Section {
    <#
    .SYNOPSIS
        Extract a markdown section by heading name.
    .PARAMETER Content
        Full markdown content
    .PARAMETER Heading
        Heading text to match (case-insensitive, leading # trimmed)
    .PARAMETER HeadingLevel
        Number of # characters (default: auto-detect)
    #>
    param(
        [Parameter(Mandatory)][string]$Content,
        [Parameter(Mandatory)][string]$Heading,
        [int]$HeadingLevel = 0
    )

    $Heading = $Heading.Trim().TrimStart('#').Trim()

    if ($HeadingLevel -eq 0) {
        # Try ## first, then ###, then #
        foreach ($level in 2, 1, 3) {
            # Build the regex pattern.  Escape variable contents for literal regex matching.
            $escapedHeading = [regex]::Escape($Heading)
            $regexPattern = "(?m)^ {$level,}#{$level}\s+$escapedHeading\s*$"
            $matches = [regex]::Matches($Content, $regexPattern)
            if ($matches.Count -gt 0) {
                $HeadingLevel = $level
                break
            }
        }
        if ($HeadingLevel -eq 0) { return $null }
    }

    $lvl = $HeadingLevel
    $escapedHeading = [regex]::Escape($Heading)
    $pattern = "(?ms)(?:^ {0,$lvl}#{$lvl}\s+$escapedHeading\s*$)\s*(.+?)(?=^ {0,$lvl}#{$lvl}\s+\S|$)"
    $match = [regex]::Match($Content, $pattern)

    if (-not $match.Success) {
        # Fallback: grab everything after heading until next heading of same or lower level
        $startPattern = "(?m)^ {0,$lvl}#{$lvl}\s+$Heading\s*`$"
        $startMatch = [regex]::Match($Content, $startPattern)
        if (-not $startMatch.Success) { return $null }

        $start = $startMatch.Index + $startMatch.Length
        $remaining = $Content.Substring($start)

        $endPattern = "(?m)^ {0,$(([math]::Max(1, $lvl)))}#{$lvl,6}\s+\S"
        $endMatch = [regex]::Match($remaining, $endPattern)

        if ($endMatch.Success) {
            return $remaining.Substring(0, $endMatch.Index).Trim()
        }
        return $remaining.Trim()
    }

    return $match.Groups[1].Value.Trim()
}

function Parse-BulletList {
    <#
    .SYNOPSIS
        Extract items from a markdown bullet list into an array of strings.
    #>
    param([string]$Text)

    if ([string]::IsNullOrWhiteSpace($Text)) { return @() }

    $items = @()
    # Match lines starting with -, *, or + followed by a space
    $lines = $Text -split "`r`n|`n|`r"
    foreach ($line in $lines) {
        if ($line -match '^\s*[-*+]\s+(.+)$') {
            $items += $matches[1].Trim()
        }
    }
    return $items
}

function Parse-Constitution {
    <#
    .SYNOPSIS
        Parse .specify/memory/constitution.md into conventions, constraints, prior_decisions.
    #>
    param([string]$Content)

    $result = @{
        conventions     = @()
        constraints     = @{ hard = @(); soft = @(); compatibility = @() }
        prior_decisions = @()
    }

    if ([string]::IsNullOrWhiteSpace($Content)) { return $result }

    # ── Core Principles → conventions ──
    $principlesSection = Read-Section -Content $Content -Heading 'Core Principles'
    if ($principlesSection) {
        $principles = Parse-BulletList $principlesSection
        foreach ($p in $principles) {
            if ($p.Trim()) { $result.conventions += $p.Trim() }
        }
    }

    # ── Sections that may contain constraints ──
    $constraintKeywords = @('constraint', 'security', 'performance', 'requirement', 'compliance')
    $allSections = [regex]::Matches($Content, "(?m)^ {0,3}##\s+(.+?)\s*`$")
    foreach ($section in $allSections) {
        $sectionName = $section.Groups[1].Value.Trim()
        $sectionContent = Read-Section -Content $Content -Heading $sectionName -HeadingLevel 2
        if (-not $sectionContent) { continue }

        $sectionLower = $sectionName.ToLowerInvariant()

        # Is this a constraints-like section?
        $isConstraintSection = $false
        foreach ($kw in $constraintKeywords) {
            if ($sectionLower -match $kw) { $isConstraintSection = $true; break }
        }

        if ($isConstraintSection) {
            $bullets = Parse-BulletList $sectionContent
            foreach ($b in $bullets) {
                if ($b.Trim()) {
                    # Classify: "hard" if contains "must", "required", "non-negotiable", "mandatory"
                    $bLower = $b.ToLowerInvariant()
                    if ($bLower -match '\b(must|required|non-negotiable|mandatory|shall|always)\b') {
                        $result.constraints.hard += $b.Trim()
                    } else {
                        $result.constraints.soft += $b.Trim()
                    }
                }
            }
        } elseif ($sectionLower -notmatch 'core principles|governance') {
            # Other sections → soft constraints
            $bullets = Parse-BulletList $sectionContent
            foreach ($b in $bullets) {
                if ($b.Trim()) { $result.constraints.soft += $b.Trim() }
            }
        }
    }

    # ── Governance → conventions + prior_decisions ──
    $govSection = Read-Section -Content $Content -Heading 'Governance'
    if ($govSection) {
        $govItems = Parse-BulletList $govSection
        foreach ($item in $govItems) {
            if ($item.Trim()) { $result.conventions += "[Governance] $($item.Trim())" }
        }
    }

    # ── Version/footer → prior_decisions ──
    $versionMatch = [regex]::Match($Content, '(?i)version\s*:\s*(.+)')
    if ($versionMatch.Success) {
        $result.prior_decisions += @{
            decision  = "Constitution version adopted"
            rationale = @("Version: $($versionMatch.Groups[1].Value.Trim())")
            confidence = 1.0
        }
    }

    return $result
}

function Parse-SpecMd {
    <#
    .SYNOPSIS
        Parse specs/*/spec.md into scope and research_digest.domain_context.
    #>
    param([string]$Path)

    $result = @{
        purpose         = @()
        applies_to      = @()
        non_goals       = @()
        domain_context  = $null
        relevant_files  = @()
    }

    if (-not (Test-Path $Path -PathType Leaf)) { return $result }

    $content = Get-Content -LiteralPath $Path -Raw -ErrorAction SilentlyContinue
    if (-not $content) { return $result }

    # ── Title → purpose ──
    $titleMatch = [regex]::Match($content, '(?m)^#\s+(.+)$')
    if ($titleMatch.Success) {
        $result.purpose += $titleMatch.Groups[1].Value.Trim()
    }

    # ── Sections → purpose, applies_to, non_goals ──
    $sections = [regex]::Matches($content, "(?m)^ {0,3}##\s+(.+?)\s*`$")
    foreach ($section in $sections) {
        $sectionName = $section.Groups[1].Value.Trim()
        $sectionContent = Read-Section -Content $content -Heading $sectionName -HeadingLevel 2
        if (-not $sectionContent) { continue }

        $sectionLower = $sectionName.ToLowerInvariant()

        if ($sectionLower -match 'objective|goal|purpose|problem') {
            $bullets = Parse-BulletList $sectionContent
            if ($bullets.Count -gt 0) {
                $result.purpose += $bullets
            } else {
                $result.purpose += $sectionContent -split "`r`n|`n" | ForEach-Object { $_.Trim() } | Where-Object { $_ -and $_ -notmatch '^#' }
            }
        } elseif ($sectionLower -match 'scope|applies|audience|context') {
            $bullets = Parse-BulletList $sectionContent
            if ($bullets.Count -gt 0) {
                $result.applies_to += $bullets
            } else {
                $result.applies_to += $sectionContent.Trim()
            }
        } elseif ($sectionLower -match 'non.goal|out.of.scope|not covered') {
            $bullets = Parse-BulletList $sectionContent
            if ($bullets.Count -gt 0) {
                $result.non_goals += $bullets
            }
        } elseif ($sectionLower -match 'tech|technology|stack') {
            # tech stack inline in spec
            $result.domain_context = @{
                tech_context = ($sectionContent.Trim())
            }
        }
    }

    # ── First paragraph (if no sections found) → purpose ──
    if ($result.purpose.Count -eq 0) {
        $firstParaMatch = [regex]::Match($content, '(?ms)^#\s+.+?\n\n(.+?)\n\n')
        if ($firstParaMatch.Success) {
            $result.purpose += $firstParaMatch.Groups[1].Value.Trim()
        }
    }

    # ── Code blocks → relevant_files references ──
    $codeBlocks = [regex]::Matches($content, '```[\s\S]*?```')
    foreach ($block in $codeBlocks) {
        $blockText = $block.Value
        $fileRefs = [regex]::Matches($blockText, '[\w./\\-]+\.[a-zA-Z]{1,5}')
        foreach ($ref in $fileRefs) {
            $refPath = $ref.Value.Trim()
            if ($refPath -notmatch '\.(md|json|yaml|yml|txt)$') { continue }
            if ($result.relevant_files -notcontains $refPath) {
                $result.relevant_files += $refPath
            }
        }
    }

    return $result
}

function Parse-PlanMd {
    <#
    .SYNOPSIS
        Parse specs/*/plan.md into tech_stack and architecture_snapshot.
    #>
    param([string]$Path)

    $result = @{
        tech_stack        = @()
        key_dirs          = @{}
        patterns          = @()
        key_components    = @()
    }

    if (-not (Test-Path $Path -PathType Leaf)) { return $result }

    $content = Get-Content -LiteralPath $Path -Raw -ErrorAction SilentlyContinue
    if (-not $content) { return $result }

    # ── Tech stack sections ──
    $sections = [regex]::Matches($content, "(?m)^ {0,3}##+\s+(.+?)\s*`$")
    foreach ($section in $sections) {
        $sectionName = $section.Groups[1].Value.Trim()
        $sectionLower = $sectionName.ToLowerInvariant()
        $sectionContent = Read-Section -Content $content -Heading $sectionName -HeadingLevel 2
        if (-not $sectionContent) { continue }

        if ($sectionLower -match 'tech.*stack|technology|dependencies|librar') {
            $bullets = Parse-BulletList $sectionContent
            foreach ($b in $bullets) {
                $parts = $b -split ' ', 2
                $name = $parts[0].Trim().TrimEnd(':', '@', 'v')
                $version = $null
                if ($b -match '[@v](\d+\.\d+[.\d]*)') { $version = $matches[1] }

                # Try to find usage context
                $usage = ''
                if ($parts.Count -gt 1) { $usage = $parts[1].Trim() }

                $entry = @{ name = $name }
                if ($version) { $entry.version = $version }
                if ($usage) { $entry.usage_context = $usage }

                $result.tech_stack += $entry
            }
        } elseif ($sectionLower -match 'architect|structure|component|module|pattern') {
            $bullets = Parse-BulletList $sectionContent
            foreach ($b in $bullets) {
                $result.patterns += $b.Trim()
                # Extract file/dir references
                $fileMatch = [regex]::Match($b, '[\w./\\-]+\.[a-zA-Z]{1,5}')
                if ($fileMatch.Success) {
                    $result.key_components += @{
                        name         = ($b -split '[-:]', 2)[0].Trim()
                        location     = $fileMatch.Value.Trim()
                        responsibility = @($b.Trim())
                        confidence   = 0.7
                    }
                }
            }
        }
    }

    # ── YAML front-matter tech fields ──
    if ($content -match '^---\s*\n([\s\S]*?)\n---') {
        $front = $matches[1]
        # Grab lines like "tech_stack: [..., ...]" or "language: ..."
        $techLines = [regex]::Matches($front, '(?m)^\s*(?:tech|language|framework|runtime|database)\S*\s*:\s*(.+)$')
        foreach ($t in $techLines) {
            $result.tech_stack += @{ name = $t.Groups[1].Value.Trim() }
        }
    }

    # ── Inline YAML code blocks (```yaml) → parse key objects ──
    $yamlBlocks = [regex]::Matches($content, '```yaml\s*\n([\s\S]*?)```')
    foreach ($yb in $yamlBlocks) {
        $ybContent = $yb.Groups[1].Value
        if ($ybContent -match '(?i)tech_stack|technology|stack') {
            $items = [regex]::Matches($ybContent, '(?m)^\s*-\s+(.+)$')
            foreach ($item in $items) {
                $result.tech_stack += @{ name = $item.Groups[1].Value.Trim() }
            }
        }
    }

    return $result
}

function Parse-DataModelMd {
    <#
    .SYNOPSIS
        Parse specs/*/data-model.md into key_components.
    #>
    param([string]$Path)

    $result = @{ key_components = @() }

    if (-not (Test-Path $Path -PathType Leaf)) { return $result }

    $content = Get-Content -LiteralPath $Path -Raw -ErrorAction SilentlyContinue
    if (-not $content) { return $result }

    $currentComponent = $null
    $lines = $content -split "`r`n|`n|`r"

    foreach ($line in $lines) {
        $trimmed = $line.Trim()

        # Heading → new component
        if ($trimmed -match '^#{2,3}\s+(.+)$') {
            if ($currentComponent) { $result.key_components += $currentComponent }
            $currentComponent = @{
                name          = $matches[1].Trim()
                location      = ''
                responsibility = @()
                confidence    = 0.7
            }
            continue
        }

        if (-not $currentComponent) {
            # Top-level heading
            if ($trimmed -match '^#\s+(.+)$') {
                $currentComponent = @{
                    name          = $matches[1].Trim()
                    location      = ''
                    responsibility = @()
                    confidence    = 0.7
                }
            }
            continue
        }

        # Bullet → responsibility
        if ($trimmed -match '^[-*+]\s+(.+)$') {
            $currentComponent.responsibility += $matches[1].Trim()
        } elseif ($trimmed -match '^`(.+)`') {
            # Code inline → location hint
            $currentComponent.location = $matches[1].Trim()
        }

        # Look for table rows (| ... |) → extract field definitions
        if ($trimmed -match '^\|\s*\w+\s*\|') {
            # Skip header/separator rows
            if ($trimmed -match '^\|[-\s:]+\|') { continue }
            $cells = $trimmed -split '\|' | ForEach-Object { $_.Trim() } | Where-Object { $_ }
            if ($cells.Count -ge 2) {
                $currentComponent.responsibility += "Field: $($cells[0]) - $($cells[1])"
            }
        }
    }

    if ($currentComponent) { $result.key_components += $currentComponent }

    return $result
}

function Parse-TasksMd {
    <#
    .SYNOPSIS
        Parse specs/*/tasks.md into dependencies.
    #>
    param([string]$Path)

    $result = @{
        dependencies = @{ internal = @(); external = @() }
    }

    if (-not (Test-Path $Path -PathType Leaf)) { return $result }

    $content = Get-Content -LiteralPath $Path -Raw -ErrorAction SilentlyContinue
    if (-not $content) { return $result }

    # Look for dependency sections or task references
    $sections = [regex]::Matches($content, "(?m)^ {0,3}##+\s+(.+?)\s*`$")
    foreach ($section in $sections) {
        $sectionName = $section.Groups[1].Value.Trim()
        $sectionLower = $sectionName.ToLowerInvariant()
        $sectionContent = Read-Section -Content $content -Heading $sectionName -HeadingLevel 2
        if (-not $sectionContent) { continue }

        if ($sectionLower -match 'dep|external|library|package|import') {
            $bullets = Parse-BulletList $sectionContent
            foreach ($b in $bullets) {
                $result.dependencies.external += $b.Trim()
            }
        } elseif ($sectionLower -match 'internal.*dep|module|component') {
            $bullets = Parse-BulletList $sectionContent
            foreach ($b in $bullets) {
                $result.dependencies.internal += $b.Trim()
            }
        }
    }

    # Also extract file references from task descriptions
    $fileRefs = [regex]::Matches($content, '[\w./\\-]+\.[a-zA-Z]{1,5}')
    foreach ($ref in $fileRefs) {
        $refPath = $ref.Value.Trim()
        if ($refPath -notmatch '\.(md|json|yaml|yml)$' -and $refPath -match '\.(ts|js|jsx|tsx|py|go|rs|cs|java|vue|css|scss|html)$') {
            if ($result.dependencies.internal -notcontains $refPath) {
                $result.dependencies.internal += $refPath
            }
        }
    }

    return $result
}

function Parse-ContractsDir {
    <#
    .SYNOPSIS
        List specs/*/contracts/ files and extract key_components.
    #>
    param([string]$Path)

    $result = @{ key_components = @() }

    if (-not (Test-Path $Path -PathType Container)) { return $result }

    $files = Get-ChildItem -Path $Path -File -ErrorAction SilentlyContinue
    foreach ($file in $files) {
        $result.key_components += @{
            name          = $file.BaseName
            location      = $file.FullName
            responsibility = @("Contract/API definition from: $($file.Name)")
            confidence    = 0.8
        }
    }

    return $result
}

function Parse-ResearchMd {
    <#
    .SYNOPSIS
        Parse specs/*/research.md into patterns_found.
    #>
    param([string]$Path)

    $result = @{ patterns_found = @() }

    if (-not (Test-Path $Path -PathType Leaf)) { return $result }

    $content = Get-Content -LiteralPath $Path -Raw -ErrorAction SilentlyContinue
    if (-not $content) { return $result }

    $sections = [regex]::Matches($content, "(?m)^ {0,3}##+\s+(.+?)\s*`$")
    foreach ($section in $sections) {
        $sectionName = $section.Groups[1].Value.Trim()
        $sectionContent = Read-Section -Content $content -Heading $sectionName -HeadingLevel 2
        if (-not $sectionContent) { continue }

        $sectionLower = $sectionName.ToLowerInvariant()

        if ($sectionLower -match 'pattern|approach|strategy') {
            $bullets = Parse-BulletList $sectionContent
            foreach ($b in $bullets) {
                $result.patterns_found += @{
                    name             = ($b -split '[-:]', 2)[0].Trim()
                    category         = $sectionName
                    confidence       = 0.6
                    source           = 'doc'
                    example_location = @()
                }
            }
        }
    }

    return $result
}

function Get-SpecsDirs {
    <#
    .SYNOPSIS
        Find all specs subdirectories under specs/.
    #>
    param([string]$ProjectRoot)

    $specsRoot = Join-Path $ProjectRoot 'specs'
    if (-not (Test-Path $specsRoot -PathType Container)) { return @() }

    return Get-ChildItem -Path $specsRoot -Directory -ErrorAction SilentlyContinue |
        Where-Object { $_.Name -notlike '.*' } |
        ForEach-Object { $_.FullName }
}

# ─── Merge: collect data from all artifacts ──────────────────────────────

Write-Verbose "Scanning artifacts..."

# 1. Constitution
$constitutionPath = Join-Path $specifyDir 'memory/constitution.md'
$constitution = if (Test-Path $constitutionPath -PathType Leaf) {
    Write-Verbose "Parsing constitution: $constitutionPath"
    $raw = Get-Content -LiteralPath $constitutionPath -Raw -ErrorAction SilentlyContinue
    Parse-Constitution -Content $raw
} else {
    Write-Verbose "No constitution.md found"
    @{ conventions = @(); constraints = @{ hard = @(); soft = @(); compatibility = @() }; prior_decisions = @() }
}

# 2. All specs/*/ directories
$specDirs = Get-SpecsDirs -ProjectRoot $ProjectPath
Write-Verbose "Found $($specDirs.Count) spec directories"

$scopePurpose = @()
$scopeAppliesTo = @()
$scopeNonGoals = @()
$relevantFiles = @()
$techStack = @()
$keyDirs = @{}
$patterns = @()
$keyComponents = @()
$domainContextList = @()
$dependenciesInternal = @()
$dependenciesExternal = @()
$patternsFound = @()

foreach ($specDir in $specDirs) {
    $specName = Split-Path $specDir -Leaf
    Write-Verbose "Processing spec: $specName"

    # spec.md
    $specPath = Join-Path $specDir 'spec.md'
    $specData = Parse-SpecMd -Path $specPath
    $scopePurpose += $specData.purpose
    $scopeAppliesTo += $specData.applies_to
    $scopeNonGoals += $specData.non_goals
    $relevantFiles += $specData.relevant_files
    if ($specData.domain_context) { $domainContextList += $specData.domain_context }

    # plan.md
    $planPath = Join-Path $specDir 'plan.md'
    $planData = Parse-PlanMd -Path $planPath
    $techStack += $planData.tech_stack
    foreach ($dir in $planData.key_dirs.Keys) { $keyDirs[$dir] = $planData.key_dirs[$dir] }
    $patterns += $planData.patterns
    $keyComponents += $planData.key_components

    # data-model.md
    $dataModelPath = Join-Path $specDir 'data-model.md'
    $dmData = Parse-DataModelMd -Path $dataModelPath
    $keyComponents += $dmData.key_components

    # tasks.md
    $tasksPath = Join-Path $specDir 'tasks.md'
    $tasksData = Parse-TasksMd -Path $tasksPath
    $dependenciesInternal += $tasksData.dependencies.internal
    $dependenciesExternal += $tasksData.dependencies.external

    # research.md
    $researchPath = Join-Path $specDir 'research.md'
    $researchData = Parse-ResearchMd -Path $researchPath
    $patternsFound += $researchData.patterns_found

    # contracts/
    $contractsDir = Join-Path $specDir 'contracts'
    $contractsData = Parse-ContractsDir -Path $contractsDir
    $keyComponents += $contractsData.key_components
}

# Deduplicate arrays
$scopePurpose = $scopePurpose | Select-Object -Unique
$scopeAppliesTo = $scopeAppliesTo | Select-Object -Unique
$scopeNonGoals = $scopeNonGoals | Select-Object -Unique
$relevantFiles = $relevantFiles | Select-Object -Unique
$dependenciesInternal = $dependenciesInternal | Select-Object -Unique
$dependenciesExternal = $dependenciesExternal | Select-Object -Unique

# Deduplicate tech_stack by name
$techStackDeduped = @()
$seenTechNames = @{}
foreach ($t in $techStack) {
    if (-not $seenTechNames.ContainsKey($t.name.ToLowerInvariant())) {
        $seenTechNames[$t.name.ToLowerInvariant()] = $true
        $techStackDeduped += $t
    }
}

# Deduplicate key_components by name+location
$keyComponentsDeduped = @()
$seenComp = @{}
foreach ($c in $keyComponents) {
    $key = "$($c.name)|$($c.location)"
    if (-not $seenComp.ContainsKey($key)) {
        $seenComp[$key] = $true
        $keyComponentsDeduped += $c
    }
}

# Detect base key_dirs from the project
$knownDirs = @('specs/', '.specify/', 'docs/', 'src/', 'lib/', 'app/', 'pages/', 'components/')
foreach ($dir in $knownDirs) {
    $fullDir = Join-Path $ProjectPath $dir
    if (Test-Path $fullDir -PathType Container) {
        if (-not $keyDirs.ContainsKey($dir)) {
            $items = (Get-ChildItem -Path $fullDir -Directory -ErrorAction SilentlyContinue).Count
            $keyDirs[$dir] = @{ exists = $true; subdirectory_count = $items }
        }
    }
}

# ─── Build context_envelope ───────────────────────────────────────────────

$gotchas = @()
# Detect templated placeholders in constitution as gotchas
$constitutionRaw = if (Test-Path $constitutionPath) { Get-Content -LiteralPath $constitutionPath -Raw -ErrorAction SilentlyContinue } else { '' }
if ($constitutionRaw -match '\[PROJECT_NAME\]|\[PRINCIPLE_\d+_NAME\]|\[SECTION_\d+_NAME\]') {
    $gotchas += @{
        text       = "Constitution.md contains unsubstituted template placeholders ([PROJECT_NAME], [PRINCIPLE_N_NAME], etc.)"
        confidence = 0.9
    }
}

$now = (Get-Date).ToString('yyyy-MM-ddTHH:mm:ssZ')
$planId = "auto-$(Get-Date -Format 'yyyyMMdd-HHmmss')"

# Build the envelope
$envelope = [ordered]@{
    context_envelope = [ordered]@{
        meta = [ordered]@{
            plan_id     = $planId
            created_at  = $now
            last_updated = $now
            version     = 1
            source      = @(
                '.specify/memory/constitution.md',
                'specs/*/spec.md',
                'specs/*/plan.md',
                'specs/*/data-model.md',
                'specs/*/tasks.md',
                'specs/*/research.md',
                'specs/*/contracts/'
            )
        }

        scope = [ordered]@{
            purpose    = if ($scopePurpose.Count -gt 0) { $scopePurpose } else { @('Spec Kit project (auto-detected)') }
            applies_to = if ($scopeAppliesTo.Count -gt 0) { $scopeAppliesTo } else { @('All Spec Kit artifacts') }
            non_goals  = $scopeNonGoals
        }

        tech_stack = $techStackDeduped

        conventions = if ($constitution.conventions.Count -gt 0) { $constitution.conventions } else { @('Spec Kit SDD workflow') }

        constraints = [ordered]@{
            hard          = $constitution.constraints.hard
            soft          = $constitution.constraints.soft
            compatibility = $constitution.constraints.compatibility
        }

        architecture_snapshot = [ordered]@{
            key_dirs       = $keyDirs
            patterns       = $patterns
            key_components = $keyComponentsDeduped
        }

        research_digest = [ordered]@{
            relevant_files   = $relevantFiles
            patterns_found   = $patternsFound
            dependencies     = [ordered]@{
                internal = $dependenciesInternal
                external = $dependenciesExternal
            }
            gotchas          = $gotchas
            open_questions   = @()
            domain_context   = if ($domainContextList.Count -gt 0) { $domainContextList } else { $null }
        }
    }
}

# Optional: prior_decisions
if ($constitution.prior_decisions.Count -gt 0) {
    $envelope.context_envelope.prior_decisions = $constitution.prior_decisions
}

# Optional: reuse_notes (from existing context_envelope if present)
$existingEnvelopePath = $outputPath
if (Test-Path $existingEnvelopePath -PathType Leaf) {
    try {
        $existing = Get-Content -LiteralPath $existingEnvelopePath -Raw | ConvertFrom-Json
        if ($existing.context_envelope.reuse_notes) {
            $envelope.context_envelope.reuse_notes = $existing.context_envelope.reuse_notes
        }
    } catch {
        Write-Verbose "Could not read existing context_envelope.json for reuse_notes"
    }
}

# ─── Validate required fields ─────────────────────────────────────────────

Write-Verbose "Validating envelope structure..."
$validationErrors = @()

$requiredTopFields = @('meta', 'scope', 'tech_stack', 'conventions', 'constraints', 'architecture_snapshot', 'research_digest')
foreach ($field in $requiredTopFields) {
    if (-not $envelope.context_envelope.Contains($field)) {
        $validationErrors += "Missing required field: context_envelope.$field"
    }
}

# Validate meta
if ($envelope.context_envelope.meta) {
    foreach ($mf in @('plan_id', 'created_at', 'version')) {
        if (-not $envelope.context_envelope.meta.Contains($mf)) {
            $validationErrors += "Missing required field: context_envelope.meta.$mf"
        }
    }
}

# Validate scope
if ($envelope.context_envelope.scope) {
    if (-not $envelope.context_envelope.scope.Contains('purpose') -or $envelope.context_envelope.scope.purpose.Count -eq 0) {
        $validationErrors += "Missing required field: context_envelope.scope.purpose (must be non-empty)"
    }
}

# Validate constraints
if ($envelope.context_envelope.constraints) {
    foreach ($cf in @('hard', 'soft', 'compatibility')) {
        if (-not $envelope.context_envelope.constraints.Contains($cf)) {
            $validationErrors += "Missing required field: context_envelope.constraints.$cf"
        }
    }
}

# Validate research_digest
if ($envelope.context_envelope.research_digest) {
    foreach ($rf in @('relevant_files', 'patterns_found')) {
        if (-not $envelope.context_envelope.research_digest.Contains($rf)) {
            $validationErrors += "Missing required field: context_envelope.research_digest.$rf"
        }
    }
}

if ($validationErrors.Count -gt 0) {
    Write-Warning "Validation found $($validationErrors.Count) issue(s):"
    foreach ($err in $validationErrors) { Write-Warning "  - $err" }

    # Try to fill gaps with defaults before giving up
    if (-not $envelope.context_envelope.meta.plan_id) { $envelope.context_envelope.meta.plan_id = $planId }
    if (-not $envelope.context_envelope.meta.created_at) { $envelope.context_envelope.meta.created_at = $now }
    if (-not $envelope.context_envelope.meta.version) { $envelope.context_envelope.meta.version = 1 }

    if (-not $envelope.context_envelope.constraints.hard) { $envelope.context_envelope.constraints.hard = @() }
    if (-not $envelope.context_envelope.constraints.soft) { $envelope.context_envelope.constraints.soft = @() }
    if (-not $envelope.context_envelope.constraints.compatibility) { $envelope.context_envelope.constraints.compatibility = @() }

    if ($validationErrors.Count -gt 5) {
        [Console]::Error.WriteLine("ERROR: Too many validation errors ($($validationErrors.Count)). Aborting.")
        exit 1
    }
}

# ─── Ensure array types (PowerShell ConvertTo-Json flattens single-element arrays) ──

function Ensure-ArrayType {
    param([object]$Value)
    if ($null -eq $Value) { return @() }
    if ($Value -is [array]) { return $Value }
    return @($Value)
}

# Force critical fields to be proper arrays for ConvertTo-Json
$envelope.context_envelope.scope.purpose          = @($envelope.context_envelope.scope.purpose)
$envelope.context_envelope.scope.applies_to        = @($envelope.context_envelope.scope.applies_to)
$envelope.context_envelope.scope.non_goals         = @(if ($envelope.context_envelope.scope.non_goals) { $envelope.context_envelope.scope.non_goals } else { @() })
$envelope.context_envelope.conventions             = @($envelope.context_envelope.conventions)
$envelope.context_envelope.tech_stack              = @($envelope.context_envelope.tech_stack)
$envelope.context_envelope.research_digest.relevant_files = @(if ($envelope.context_envelope.research_digest.relevant_files) { $envelope.context_envelope.research_digest.relevant_files } else { @() })
$envelope.context_envelope.research_digest.dependencies.internal = @(if ($envelope.context_envelope.research_digest.dependencies.internal) { $envelope.context_envelope.research_digest.dependencies.internal } else { @() })
$envelope.context_envelope.research_digest.dependencies.external = @(if ($envelope.context_envelope.research_digest.dependencies.external) { $envelope.context_envelope.research_digest.dependencies.external } else { @() })
$envelope.context_envelope.research_digest.domain_context = @(if ($envelope.context_envelope.research_digest.domain_context) { $envelope.context_envelope.research_digest.domain_context } else { @() })
$envelope.context_envelope.architecture_snapshot.patterns = @($envelope.context_envelope.architecture_snapshot.patterns)
$envelope.context_envelope.architecture_snapshot.key_components = @($envelope.context_envelope.architecture_snapshot.key_components)
$envelope.context_envelope.research_digest.open_questions = @($envelope.context_envelope.research_digest.open_questions)

# Add backup of existing context_envelope.json if present
if ((Test-Path $outputPath -PathType Leaf) -and (-not $Force)) {
    $bakPath = "$outputPath.bak"
    Copy-Item -LiteralPath $outputPath -Destination $bakPath -Force
    Write-Output "Backup created: $bakPath"
}

# ─── Write output ─────────────────────────────────────────────────────────

$json = $envelope | ConvertTo-Json -Depth 10

# Write UTF-8 without BOM
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($outputPath, $json, $utf8NoBom)

Write-Output "context_envelope.json written to: $outputPath"

# ─── Schema validation (optional) ─────────────────────────────────────────
if (Test-Path $schemaPath -PathType Leaf) {
    Write-Verbose "Validating against schema: $schemaPath"
    try {
        $schema = Get-Content -LiteralPath $schemaPath -Raw | ConvertFrom-Json
        Write-Output "Schema reference: $schemaPath"
    } catch {
        Write-Warning "Could not parse schema for validation: $_"
    }
}

Write-Output "Done."
exit 0
