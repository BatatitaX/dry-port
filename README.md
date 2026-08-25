# DRY // Portfólio de Adryel Luís Rodrigues

Portfólio trilíngue com uma jornada jogável em pixel art, personagens interativos,
chefe, poemas colecionáveis e uma versão profissional rápida. O projeto é
autocontido: textos, código, mapa, sprites, portraits, poemas, ícones e currículo
ficam dentro desta pasta.

## Requisitos

- Node.js 22.13 ou superior
- npm

## Rodar no computador

```bash
npm install
npm run dev
```

Abra o endereço informado pelo terminal, geralmente `http://localhost:5173`.
O progresso, os encontros e os poemas ficam salvos no navegador do visitante.

## Gerar a versão de produção

O projeto mantém dois modos de publicação independentes.

### Vercel / Next.js

O arquivo `vercel.json` já configura automaticamente:

- Framework: `Next.js`
- Diretório raiz: `./`
- Instalação: `npm ci`
- Build: `npx next build`
- Diretório de saída: automático
- Variáveis de ambiente: nenhuma

Conecte o repositório ao Vercel e publique a branch `main`. O progresso continua
sendo salvo no navegador de cada visitante. Os arquivos exclusivos de
Cloudflare/Vinext são desconsiderados pela checagem TypeScript do Next.js.

### Cloudflare Worker / Vinext

```bash
npm run build
npm run start
```

Esse build alternativo é gerado em `dist/`. Hospedagens compatíveis com
Cloudflare Worker/Vinext devem usar `npm run build` e preservar todo o conteúdo
de `public/`. Esse comando não deve substituir o build do Vercel.

## Estrutura principal

- `app/page.tsx`: conteúdo, jogo, mapa global, inventário e portfólio rápido
- `app/game-extras.tsx`: personagens, diálogos, evolução, batalha, poemas e computador
- `app/movement.ts`: movimentação diagonal estável e ciclo de caminhada
- `app/ui-icon.tsx`: família vetorial própria dos ícones da interface
- `app/globals.css`: direção visual e responsividade
- `public/world/terrain/world-base.png`: terreno principal em pixel art
- `public/world/structures/`: dez construções frontais nativas de 96 × 96
- `public/world/scenery/`: árvores, arbustos, flores, animais, lago, bancos e plantações
- `public/world/interiors/`: cenas ilustradas de Nilo e Jão
- `public/portraits/cast-atlas.png`: atlas com oito portraits padronizados
- `public/characters/dry-baby.png`: atlas do Dry bebê, 96 × 192
- `public/characters/dry-teen.png`: atlas do Dry adolescente, 96 × 192
- `public/characters/dry-adult.png`: atlas do Dry adulto, 96 × 192
- `public/characters/jao.png`: sprite original do cantor Jão
- `public/memory-icons.png`: ícones das memórias
- `public/paper-poems-atlas.png`: seis variações visuais de páginas colecionáveis
- `public/Curriculo_Adryel_Luis_Rodrigues.pdf`: currículo para download

## Controles

- `WASD` ou setas do teclado: movimentar
- `Shift`: correr
- `E` ou `Enter`: conversar, entrar em uma construção, recolher poemas ou usar o computador
- `M`: abrir o mapa global
- `Esc`: fechar a janela aberta
- Mobile: direcional virtual com movimentação contínua ao manter pressionado

O mouse não movimenta nem teleporta o personagem. O jogador pode explorar o
gramado, mas construções, cenários sólidos, NPCs e água possuem colisão; o rio
só pode ser cruzado pela ponte.

## Jornada e segredos

1. Comece como bebê. Descubra suas origens, visite a escola e converse com Nilo
   para concluir a primeira missão e evoluir para adolescente.
2. Explore arte, design e ETEC; converse com Luna para concluir a segunda missão
   e evoluir para adulto.
3. Siga o caminho das artes, atravesse a ponte e encontre Jão escondido no fim
   da trilha. Ele não aparece no mapa geral.
4. Avance até Python. Para vencer a batalha, siga a sequência **observar,
   corrigir e executar**.
5. Após derrotar Python, nove papéis com poemas aparecem pelo mundo.
6. Abra o **DRY OS**, pelo botão PC ou pelo computador na trilha tecnológica,
   para acessar arquivos, terminal interativo, perfil e biblioteca musical.
7. A discografia de Jão aparece no computador somente depois da conversa com ele.

As fases bebê, adolescente e adulto possuem sprites próprios de 32 × 48 por
quadro, com a mesma linha dos pés em todas as direções. Os nomes dos arquivos
de arte não possuem sufixos de versão: o histórico pertence ao Git.

## Comandos úteis

- `npm run dev`: desenvolvimento local
- `npm run lint`: análise do código
- `npm run test:audit`: verifica artes, missões, personagens, computador, traduções e deploy
- `npm test`: auditoria, build de produção e validação do HTML publicado
- `npm run build`: build de produção e validação
- `npm run validate:artifact`: valida novamente um build existente

## Conteúdo que ainda será atualizado

Os cards pretos de diplomas e certificados são placeholders intencionais. Screenshots de projetos, certificados e missões adicionais podem ser inseridos depois sem alterar a estrutura principal.
