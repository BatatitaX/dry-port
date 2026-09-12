# Tutorial guiado — visual simples e apresentação progressiva

Solicitação: começar vazio com WASD, apresentar os relógios depois do movimento,
e apresentar o desvio depois de acertar os relógios.

## Comportamento

O cenário inicial tem somente piso e personagem. Não há objetos invisíveis com colisão:
os relógios colidem apenas durante sua etapa e as faixas aparecem apenas na etapa de desvio.
Cada etapa revela sua própria instrução e seus controles. Mudanças de etapa congelam
a entrada por 650 ms enquanto os elementos aparecem suavemente. Movimento reduzido
mostra os elementos diretamente, preservando o breve intervalo de preparação.

No início, registra-se deslocamento em quatro direções e um percurso mínimo de 160 px.
Nos relógios, E gira em quartos de volta. Alvos: 03:00 e 09:00. O relógio correto fica
travado; Q mostra uma pista. No desvio, Espaço atravessa as faixas durante 230 ms,
com recarga de 900 ms. Há também passagem segura por cima/baixo e modo sem dano.

## Arte e fluidez

- Novo avatar mais simples, com cabeça maior e cores planas, baseado na foto fornecida.
- Uma única imagem WebP transparente para a arte do jogo; piso e relógios são geometria
  funcional. Sem fundo pintado, textura de cenário ou filtros de desfoque na interface.
- Reutiliza a animação articulada de recortes; não se apresenta como animação desenhada
  quadro a quadro. Os recortes foram ajustados aos limites do novo atlas.
- Aceleração/frenagem exponenciais curtas e câmera dependente de delta de tempo.
- Movimento e esquiva usam subpassos para não saltar limites. O passo máximo é 50 ms.
- Objetos de desenho são criados uma vez. HUD limitado a dez atualizações por segundo,
  rastro limitado a oito pontos, log de eventos limitado a 16 entradas.
- Não foi feita medição visual de FPS em dispositivos reais nesta entrega. Essas mudanças
  reduzem trabalho de renderização, mas não são uma garantia de 60 FPS em todo aparelho.

## Progresso e compatibilidade

A entrada permanece `/jornada`; o portfólio e o CV não mudam. O tutorial novo usa chaves
v2 próprias para iniciar a nova sequência sem sobrescrever progresso antigo. Laboratório
tem save separado. O motor Phaser continua sendo importado somente após abrir o jogo.
Textos PT/EN/ES, teclado, toque, pausa por perda de foco e diálogo nativo são preservados.

## Verificação

Seis testes novos cobrem ordem das etapas, movimento real, bloqueio de ações prematuras,
relógios, colisões por etapa, esquiva, caminho seguro, frenagem, comportamento em taxas
de quadros diferentes e saves inválidos. A suíte completa mantém também os testes antigos.
O teste de navegador foi atualizado para esse fluxo, mas não executado nesta entrega.
