<#
  Cadastra na Vercel (ambiente de produção) as variáveis do coletor e do painel /admin.

  Antes, no terminal, dentro da pasta do projeto:
    npx.cmd vercel@63.1.2 login
    npx.cmd vercel@63.1.2 link
  Depois:
    powershell -NoProfile -ExecutionPolicy Bypass -File scripts/configurar-vercel.ps1

  - A senha do painel é digitada por você e não aparece na tela.
  - ADMIN_SESSION_SECRET e CRON_SECRET são gerados aqui, com gerador criptográfico, e nunca são exibidos.
  - Os valores vão para a Vercel pela entrada padrão (não ficam na linha de comando nem em arquivos).
  - Rodar de novo substitui os valores (as sessões abertas do painel deixam de valer).
  - DATABASE_URL não é criada aqui: ela vem do banco Neon (Vercel → Storage).
#>
param(
  # Mostra o que seria feito, sem pedir senha e sem falar com a Vercel.
  [switch]$Simular
)

$Cli = 'vercel@63.1.2'
$Raiz = Split-Path -Parent $PSScriptRoot

function New-Segredo([int]$Tamanho) {
  # Alfabeto de 64 símbolos: cada byte aleatório vira um símbolo sem viés.
  $alfabeto = [char[]]'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'
  $bytes = New-Object byte[] $Tamanho
  $gerador = [System.Security.Cryptography.RandomNumberGenerator]::Create()
  try { $gerador.GetBytes($bytes) } finally { $gerador.Dispose() }
  -join ($bytes | ForEach-Object { $alfabeto[$_ % 64] })
}

function Read-SenhaPainel {
  while ($true) {
    $primeira = Read-Host 'Escolha a senha do painel /admin (12+ caracteres, sem espaços)' -AsSecureString
    $segunda = Read-Host 'Repita a senha' -AsSecureString
    $a = ConvertFrom-Seguro $primeira
    $b = ConvertFrom-Seguro $segunda
    if ($a -cne $b) { Write-Host 'As senhas não conferem. Tente de novo.' -ForegroundColor Yellow; continue }
    if ($a.Length -lt 12) { Write-Host 'Use pelo menos 12 caracteres.' -ForegroundColor Yellow; continue }
    if ($a -notmatch '^[\x21-\x7E]+$') { Write-Host 'Use só letras sem acento, números e símbolos comuns, sem espaços.' -ForegroundColor Yellow; continue }
    return $a
  }
}

function ConvertFrom-Seguro([System.Security.SecureString]$Valor) {
  $ponteiro = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($Valor)
  try { [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ponteiro) } finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ponteiro) }
}

function Set-VariavelVercel([string]$Nome, [string]$Valor, [bool]$Sensivel) {
  $tipo = if ($Sensivel) { '--sensitive' } else { '--no-sensitive' }
  if ($Simular) { Write-Host "  (simulação) $Nome → produção $tipo, $($Valor.Length) caracteres"; return }
  $info = New-Object System.Diagnostics.ProcessStartInfo 'cmd.exe', "/d /s /c `"npx --yes $Cli env add $Nome production --force --yes $tipo`""
  $info.UseShellExecute = $false
  $info.RedirectStandardInput = $true
  # Com o console em UTF-8, o .NET põe um BOM no início da entrada do processo; sem BOM, o valor chega exato.
  $codificacaoAnterior = [Console]::InputEncoding
  [Console]::InputEncoding = New-Object System.Text.UTF8Encoding $false
  try {
    $processo = [System.Diagnostics.Process]::Start($info)
    # Sem quebra de linha no fim: o valor chega exatamente como foi gerado.
    $processo.StandardInput.Write($Valor)
    $processo.StandardInput.Close()
    $processo.WaitForExit()
  } finally {
    [Console]::InputEncoding = $codificacaoAnterior
  }
  if ($processo.ExitCode -ne 0) { throw "A Vercel recusou $Nome (código $($processo.ExitCode)). Veja a mensagem acima." }
  Write-Host "  ok: $Nome" -ForegroundColor Green
}

Write-Host ''
Write-Host 'Passo a Passo · variáveis de ambiente na Vercel (produção)' -ForegroundColor Cyan
Write-Host ''

if (-not $Simular) {
  # A CLI grava o vínculo em project.json, ou em repo.json quando o projeto está ligado pelo Git.
  $vinculado = (Test-Path (Join-Path $Raiz '.vercel\project.json')) -or (Test-Path (Join-Path $Raiz '.vercel\repo.json'))
  if (-not $vinculado) {
    Write-Host 'Esta pasta ainda não está ligada a um projeto da Vercel. Rode antes:' -ForegroundColor Yellow
    Write-Host "  npx.cmd $Cli link"
    exit 1
  }
  Push-Location $Raiz
  try {
    & npx.cmd --yes $Cli whoami
    if ($LASTEXITCODE -ne 0) {
      Write-Host "Faça login antes: npx.cmd $Cli login" -ForegroundColor Yellow
      exit 1
    }
    $existentes = (& npx.cmd --yes $Cli env ls production) -join "`n"
    if ($existentes -notmatch '\bDATABASE_URL\b') {
      Write-Host ''
      Write-Host 'Aviso: DATABASE_URL ainda não existe em produção.' -ForegroundColor Yellow
      Write-Host 'Crie o banco em Vercel → Storage → Neon e conecte ao projeto. O resto pode ser cadastrado agora.'
      Write-Host ''
    }
  } finally {
    Pop-Location
  }
}

$senha = if ($Simular) { New-Segredo 16 } else { Read-SenhaPainel }
$variaveis = @(
  @{ Nome = 'ADMIN_PASSWORD'; Valor = $senha; Sensivel = $true },
  @{ Nome = 'ADMIN_SESSION_SECRET'; Valor = (New-Segredo 48); Sensivel = $true },
  @{ Nome = 'CRON_SECRET'; Valor = (New-Segredo 40); Sensivel = $true },
  @{ Nome = 'CRAWLER_TIMEZONE'; Valor = 'America/Sao_Paulo'; Sensivel = $false },
  @{ Nome = 'CRAWLER_DAILY_HOUR'; Valor = '3'; Sensivel = $false }
)

Write-Host ''
Write-Host 'Cadastrando:'
Push-Location $Raiz
try {
  foreach ($v in $variaveis) { Set-VariavelVercel $v.Nome $v.Valor $v.Sensivel }
} finally {
  Pop-Location
  $senha = $null
  $variaveis = $null
}

Write-Host ''
Write-Host 'Pronto. Para valer, a Vercel precisa de um novo deploy:' -ForegroundColor Cyan
Write-Host '  Vercel → Deployments → (último) → ... → Redeploy, ou envie um novo commit para o GitHub.'
Write-Host 'Depois confira em Settings → Cron Jobs e entre em /admin com a senha que você escolheu.'
