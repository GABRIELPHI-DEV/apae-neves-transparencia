# Portal da Transparência da APAE de Ribeirão das Neves

Site estático (HTML, CSS e JavaScript). Não precisa de servidor nem de banco de dados.

## Arquivos

| Arquivo | Para que serve |
|---|---|
| `index.html` | Página inicial: trabalho do Centro Dia, termos, recursos, conquistas, fotos, doações (Pix e Imposto de Renda), contato, ouvidoria e denúncia |
| `equipe.html` | Organograma, diretoria, conselhos e equipe do Centro Dia |
| `privacidade.html` | Política de Privacidade (LGPD) |
| `admin.html` | Painel para a equipe atualizar o site sem programar |
| `dados.json` | Todos os textos e números do site. É o arquivo que o painel edita |
| `img/` | Logo em vetor (`logo.svg`), imagem de compartilhamento e fotos |
| `definir-url.ps1` | Troca `__SITE_URL__` pelo endereço real do site (SEO e compartilhamento) |

## Publicar no GitHub Pages

1. Crie a conta (ou use a da APAE) em github.com. Se puder escolher o nome, use algo como `apaeneves`.
2. Crie um repositório **público**. Se o nome for igual ao da conta + `.github.io` (ex.: `apaeneves.github.io`), o site fica em `https://apaeneves.github.io/`.
3. Em **Add file > Upload files**, arraste **todo o conteúdo desta pasta** (inclusive as pastas `css`, `js` e `img` e o arquivo `.nojekyll`) e confirme.
4. Em **Settings > Pages**: *Deploy from a branch*, branch `main`, pasta `/ (root)`.
5. Quando o endereço aparecer, rode `definir-url.ps1 -Url https://SEU-ENDERECO/` e envie de novo `index.html`, `equipe.html`, `privacidade.html`, `robots.txt` e `sitemap.xml`.

## Atualizar o conteúdo (painel da equipe)

Abra `https://SEU-ENDERECO/admin.html`. Edite, clique em **Ver prévia** e depois em **Publicar agora**.

Para publicar direto do painel é preciso um token do GitHub:
1. GitHub > Settings > Developer settings > Personal access tokens > Fine-grained tokens > Generate new token.
2. *Repository access*: só este repositório. *Permissions > Contents*: **Read and write**.
3. Cole o token no painel. Ele fica apenas na aba aberta e some quando você a fecha.

Sem token: use **Baixar dados.json** e, no GitHub, envie o arquivo para substituir o antigo (Add file > Upload files).

O painel não tem senha própria: quem não tem o token do GitHub não consegue publicar nada. Guarde o token como uma senha.

## Antes de divulgar, confirme

- **Endereço, telefone e e-mail** (aba “Instituição e contatos” do painel).
- **Autorização de uso de imagem** de todas as pessoas que aparecem nas fotos. Fotos de pessoas com deficiência e de menores só devem ficar no ar com autorização dos responsáveis. Para retirar uma foto, remova na aba “Fotos”.
- **Nomes da equipe técnica**: vieram do Relatório de Atividades 2024.
- **Política de Privacidade**: peça a revisão do jurídico ou do contador da APAE. Ela promete resposta em até 15 dias e arquivamento restrito de denúncias.
- **Destinação do Imposto de Renda**: informe na aba “Doações e Imposto de Renda” se a APAE tem projeto aprovado no fundo do município e qual.
- **Canal de denúncia anônima**: crie um formulário que não colete e-mail e cole o link na aba “Instituição e contatos”.
- **Depoimentos de famílias**: a seção só aparece quando houver depoimento cadastrado, e sempre com autorização por escrito.

## Acessibilidade

VLibras, tamanho de letra, alto contraste, leitura fácil (textos curtos), pausa de animações, navegação por teclado, textos alternativos nas fotos, tema claro e escuro.
