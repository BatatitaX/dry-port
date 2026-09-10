# Pátio do Observatório — primeira área jogável

## Escopo entregue

O novo `/jornada` abre diretamente o tutorial ilustrado em Phaser + TypeScript.
O portfólio profissional e o CV (ETEC 2023–2025) permanecem acessíveis em `/`.

- Personagem em quatro direções inspirado na foto fornecida pelo autor: cachos,
  óculos, moletom e mochila. Caminhada articulada sobre os recortes da arte aprovada,
  com pés ancorados no chão, transição de parada, respiração e inclinação na esquiva.
  Cenário e objetos separados, com transparência real.
- Movimento contínuo, colisões, esquiva com energia e recarga, teclado, mouse e joystick.
- Lente com observação e pulso direcionado; mira assistida para teclado e toque.
- Refletores giratórios, arcos que revelam a solução e circuito que permanece resolvido.
- Passagem temporizada com aviso visual e desvio seguro por baixo.
- Drone com telegráficos de 1,5 s, vulnerabilidade após o ataque e três acertos.
- Checkpoint após derrota, célula coletável e conclusão ao acender o observatório.
- Sinos ressonantes, descoberta opcional e caderno com pistas do tutorial.
- Pausa com foco contido pelo diálogo nativo; perda de foco limpa controles e pausa.
- Textos PT/EN/ES; opções de som, câmera fixa, mira e modo assistido sem dano.
- Laboratório com save próprio, reinícios, velocidade, esquiva, invulnerabilidade,
  visualização de colisões, FPS e intervalo médio aproximado entre quadros.
- Rastro curto de esquiva, poeira dos passos, ondas de observação e dos sinos,
  rotação suave dos ponteiros, energia percorrendo o circuito, acerto/escudo distintos,
  assentamento do drone após o treino e iluminação gradual na conclusão.
- Áudio opcional de eventos: os sinos têm notas próprias e ações recusadas por energia
  ou recarga não produzem um falso som de disparo.

## Decisões técnicas

`model.ts` contém regras independentes do DOM e de Phaser. A cena atualiza a simulação
por quadro; React recebe no máximo dez snapshots por segundo. A duração de cada passo
é limitada e o movimento usa subpassos para evitar atravessar barreiras com esquiva.
O motor não é carregado na página profissional.

`avatar.ts` articula pernas e tronco da ilustração existente em tempo de execução.
O ciclo dos passos depende da distância realmente percorrida, inclusive no joystick;
pressionar movimento contra uma parede não mantém uma caminhada fictícia.
`effects.ts` usa limites de 120 partículas, 18 ondas e seis imagens de rastro.
Não cria novos objetos Phaser por disparo. O log de eventos em `model.ts` tem limite
de 32 entradas e não é salvo. `audio.ts` compartilha um contexto e limita as vozes.
Efeitos visuais não decidem dano, alcance, energia ou vitória.

Reduzir animações remove rastros, partículas, ondas expansivas, balanço e inclinação;
mantém os avisos de perigo, a mira, o feixe e as cores de estado necessários para jogar.
A pausa congela o movimento e os efeitos. Apenas a iluminação final pode concluir
sua transição atrás da janela de vitória, mantendo a simulação pausada.

O salvamento versionado guarda apenas objetivos e descobertas. Posição, ataque,
energia e timers são recriados em checkpoints seguros ao reabrir. O laboratório
usa outra chave e reiniciar um desafio não modifica a partida normal. Os saves da
jornada anterior não são apagados.

Os arquivos WebP conservam o alfa dos atlases. A fotografia original não foi adicionada
ao repositório: somente a interpretação ilustrada aprovada para o personagem.
As imagens conceituais com HUD não são usadas como fundo clicável; controles, atores,
colisões, mira, dano, energia, iluminação e progresso são executados pelo jogo.

`npm run dev` e `npm run start` não usam mais atribuição de variáveis do Unix.
Os valores locais necessários ao Vite/Wrangler já são definidos em `vite.config.ts`.
O build alternativo Cloudflare ainda usa Bash; o build Next.js é a opção sem Bash.

## Verificação desta entrega

- 23 testes de lógica e contratos passaram, incluindo 8 testes do tutorial.
- Verificação TypeScript e revisão ESLint dos arquivos novos passaram.
- Build Next.js com Webpack passou; build Vinext validado separadamente.
- A suíte de navegador foi atualizada para a nova interface, mas não foi executada
  nesta entrega. Controles por toque, composição visual e fluidez precisam de uma
  rodada de uso em navegadores/dispositivos reais; não há promessa de FPS medido.

## Limites desta primeira área

- Esta é a primeira área de teste, não a aventura completa de três regiões.
- A caminhada é uma animação de recortes articulados das quatro poses aprovadas;
  não é uma sequência redesenhada quadro a quadro. Ataque e esquiva usam movimento,
  inclinação e efeitos sobre a mesma arte.
- A conclusão acende a fachada e o feixe do observatório; a abertura mecânica da
  cúpula não está animada.
- Jão não aparece neste tutorial. A futura participação será baseada no cantor Jão,
  como solicitado. Os NPCs e as regiões da jornada anterior ainda não foram adaptados.
  Os dados antigos (Jão, Luna, Nilo, Python, diálogos e poemas) continuam no código
  para orientar a expansão, sem presumir que todos representam celebridades reais.
- O caderno novo contém anotações ficcionais de mecânicas. Não foram inventados poemas,
  fatos biográficos ou falas reais atribuídas ao autor ou ao cantor.
- O som opcional usa tons curtos sintetizados; não inclui música comercial.
