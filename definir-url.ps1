param([Parameter(Mandatory=$true)][string]$Url)
# Uso: .\definir-url.ps1 -Url https://apaeneves.github.io/
if(-not $Url.EndsWith('/')){ $Url += '/' }
Get-ChildItem -Path $PSScriptRoot -Include *.html,robots.txt,sitemap.xml -Recurse -File | ForEach-Object {
  $t=[IO.File]::ReadAllText($_.FullName,[Text.Encoding]::UTF8)
  if($t.Contains('__SITE_URL__')){ [IO.File]::WriteAllText($_.FullName,$t.Replace('__SITE_URL__',$Url),(New-Object Text.UTF8Encoding $false)); "ajustado: $($_.Name)" }
}
'Pronto. Envie os arquivos alterados ao GitHub.'
