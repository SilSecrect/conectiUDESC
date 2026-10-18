# ConectiUDESC

Protótipo acadêmico de fórum de notícias da UDESC, feito com React + Vite e `localStorage`.

## Requisitos
- Node.js (versão LTS recomendada)
- npm

## Como executar no Ubuntu/Linux

```bash
npm install
npm run dev
```

Abra o endereço local mostrado pelo Vite no navegador.

## Contas demonstrativas

A tela de login não exibe uma lista de contas. Para entrar como administrador na demonstração, use `admin@udesc.br` com a senha `123456`. No painel do administrador, a tela **Usuários e permissões** mostra as 12 contas iniciais (uma por centro) e permite adicionar, editar permissões e remover usuários. Todas as contas iniciais usam a senha demonstrativa `123456`.

A conta `noemi@udesc.br` é um exemplo fictício de conselheira do CEAD. Os demais usuários por centro começam como alunos; o administrador pode alterar o perfil para conselheiro ou administrador.

Centros incluídos na demonstração: CEAD, FAED, CEART, ESAG, CEFID, CCT, CAV, CEO, CERES, CEPLAN, CESFI e CEAVI.

## Como funciona o armazenamento
As notícias, contas demonstrativas e sessão são guardadas no `localStorage` do navegador/WebView usando chaves `v2` para inicializar a nova lista de usuários sem misturar a lista antiga. Para reiniciar os dados da demonstração, abra o console do navegador e execute:

```js
localStorage.removeItem('conectiudesc_noticias')
localStorage.removeItem('conectiudesc_usuarios')
localStorage.removeItem('conectiudesc_sessao')
location.reload()
```

## Importante: limites do protótipo
- As contas são fictícias; este projeto não valida credenciais reais ou o ID UDESC.
- `localStorage` não é um banco compartilhado entre dispositivos. Cada aparelho/navegador terá os próprios dados.
- Como não há backend, as regras de perfil no React servem apenas para demonstrar o fluxo. Não use este protótipo para publicar notícias oficiais nem para guardar informações sensíveis.
- Antes de uso real, será necessário um backend/API, autenticação institucional e validação de permissões no servidor.

## Observação sobre os centros
A lista usa `FAED` (Faculdade de Educação), não `FEAD`. Confirme a lista final de centros/unidades com a nomenclatura institucional que a disciplina deseja usar.


## Painel de usuários

Somente a conta com perfil de administrador vê a opção “Usuários e permissões”. O painel permite cadastrar usuários, editar nome/e-mail/centro/perfil e remover contas. A interface impede remover a própria conta conectada e mantém ao menos um administrador. Essas regras são didáticas e ficam no cliente; não são segurança real sem backend.
