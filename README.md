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

```bash
npm run build
npm run start
```

O build validado é gerado em `dist/`. Para publicar futuramente, o projeto pode ser colocado em um repositório Git e conectado a uma hospedagem compatível com aplicações Cloudflare Worker/Vinext. A hospedagem deve usar `npm run build` como comando de build e preservar todo o conteúdo de `public/`.

## Estrutura principal

- `app/page.tsx`: conteúdo, jogo, mapa global, inventário e portfólio rápido
- `app/game-extras.tsx`: personagens, diálogos, batalha, poemas e computador
- `app/globals.css`: direção visual e responsividade
- `public/world/terrain/world-base.png`: terreno principal em pixel art
- `public/world/structures/`: dez construções visitáveis
- `public/world/scenery/`: árvores, arbustos, flores e outros elementos
- `public/portraits/cast-atlas.png`: atlas com oito portraits padronizados
- `public/dry-spritesheet-v2.png`: sprite sheet do Dry, 3×4 frames
- `public/memory-icons.png`: ícones das memórias
- `public/Curriculo_Adryel_Luis_Rodrigues.pdf`: currículo para download

## Controles

- `WASD`: movimentar
- `Shift`: correr
- `E` ou `Enter`: conversar, entrar em uma construção, recolher poemas ou usar o computador
- `M`: abrir o mapa global
- Mobile: direcional virtual e botão de interação

O mouse não movimenta nem teleporta o personagem. A água, os personagens e o
terreno fora dos caminhos possuem colisão; o rio só pode ser cruzado pela ponte.

## Jornada e segredos

1. Explore as dez construções e converse com Nilo para conhecer a jornada.
2. Siga o caminho das artes, atravesse a ponte e encontre Jão escondido no fim
   da trilha. Ele não aparece no mapa geral.
3. Avance até Python. Para vencer a batalha, siga a sequência **observar,
   corrigir e executar**.
4. Após derrotar Python, nove papéis com poemas aparecem pelos caminhos.
5. Recolha os poemas e consulte-os no **Banco de Memórias**, pelo botão PC ou
   pelo computador localizado na trilha tecnológica.
6. O registro de Jão no computador aparece somente depois da conversa com ele.

O protagonista cresce de bebê para criança, adolescente e adulto conforme as
memórias importantes são descobertas. Todos os sprites permanecem alinhados ao
chão em qualquer direção.

## Comandos úteis

- `npm run dev`: desenvolvimento local
- `npm run lint`: análise do código
- `npm run build`: build de produção e validação
- `npm run validate:artifact`: valida novamente um build existente

## Conteúdo que ainda será atualizado

Os cards pretos de diplomas e certificados são placeholders intencionais. Screenshots de projetos, certificados e missões adicionais podem ser inseridos depois sem alterar a estrutura principal.
