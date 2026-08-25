# DRY — direção de arte e assets

O mundo preserva a vegetação detalhada e o terreno aprovados, enquanto as
construções e os personagens utilizam pixel art nativa em escala consistente.

## Cenário

- `public/world/terrain/world-base.png`: gramado e estrada principal contínuos.
- `public/world/terrain/path-dirt.png`: terra pixelada das trilhas orgânicas.
- `public/world/terrain/water-tile.png`: textura pixelada do rio.
- `public/world/structures/*.png`: dez fachadas frontais de 96 × 96 pixels.
- `public/world/scenery/*.png`: vegetação, cerca, poste, ponte, banco, animais,
  plantações, lago e pequenos detalhes naturais.
- `public/world/interiors/dialogue-jao.png`: encontro ilustrado com Jão.
- `public/world/interiors/dialogue-nilo.png`: encontro ilustrado com Nilo.

## Personagens

Os sprites de Dry bebê, adolescente e adulto, de Nilo e de Jão usam atlas de
96 × 192 pixels. Cada atlas possui três colunas e quatro linhas com quadros
nativos de 32 × 48, exibidos em 2×. Os pés permanecem alinhados ao chão durante
as trocas de idade e direção.

Jão utiliza sprite e retrato próprios, com cabelo loiro e identidade baseada no
cantor brasileiro. O encontro não inclui qualquer objeto fúnebre.

## Interface e arquivos

- `app/ui-icon.tsx`: família vetorial consistente usada por todo o HUD e PC.
- `public/memory-icons.png`: atlas nativo de 96 × 72 para memórias.
- `public/paper-poems-atlas.png`: seis variações de papéis colecionáveis.
- `public/characters/*-portrait.png`: portraits próprios de Dry, Nilo e Jão.

Arquivos de produção não recebem sufixos de versão; o Git conserva o histórico
de alterações.
