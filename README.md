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

- `app/page.tsx` e `app/portfolio/page.tsx`: entrada profissional pré-renderizada
- `app/quick-portfolio.tsx`: apresentação profissional e contatos
- `app/projetos/[slug]/page.tsx`: páginas dos projetos
- `app/jornada/page.tsx` e `app/journey-client.tsx`: jornada e interfaces do jogo
- `app/content/`: textos, traduções e contexto dos projetos
- `app/game/world-scene.ts`: cena Phaser, câmera, renderização e entrada
- `app/game/simulation.ts`: movimento e colisões testáveis
- `app/game/world.ts`: mapa, cenários, missões e regras de colisão
- `app/game/data.ts`: personagens, diálogos e poemas
- `app/game/save.ts`: validação e migração de progresso
- `app/game/battle.ts`: regras do combate
- `app/game-extras.tsx`: diálogos, batalha, poemas e computador em React
- `app/movement.ts`: direção estável e ciclo de caminhada
- `public/`: arte original e currículo para download

O jogo usa **Phaser 3.90 + TypeScript**. A engine é carregada apenas ao entrar
na jornada; o visitante pode abrir projetos, currículo e contato diretamente.
O save é local ao navegador, gravado periodicamente e ao sair da página.

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

1. Comece como bebê. Descubra suas origens e visite a escola. As memórias das origens e da escola concluem a primeira missão e permitem evoluir para adolescente.
2. Explore arte, design e ETEC; converse com Luna para concluir a segunda missão
   e evoluir para adulto.
3. Siga o caminho das artes, atravesse a ponte e encontre Jão escondido no fim
   da trilha. Ele não aparece no mapa geral.
4. Avance até Python. Para vencer a batalha, siga **observar, corrigir e executar**.
   O modo assistido permite continuar sem vencer. Nilo está no fim da jornada.
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

## Testes e revisão

```bash
npm run test:audit
npm run build:next
npm run build
npx playwright install chromium
npm run test:browser
```

A suíte de navegador tem cenários desktop e mobile. `test:audit` inclui
verificações comportamentais de movimento, colisões, save e combate.

Veja [docs/CORRECOES.md](docs/CORRECOES.md) para alterações, validações e
informações profissionais que ainda dependem de confirmação do autor.
Certificados e capturas de projetos serão incluídos quando os materiais reais
estiverem disponíveis; a página profissional não exibe slots vazios.
