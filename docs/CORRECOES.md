# Correções do portfólio

Base: `f8c22d9c5797b594bfc966da7e0874c63b688dc1` do repositório original.

## Implementado

- CV: período da ETEC corrigido de 2022–2025 para **2023–2025**, conforme confirmação do autor; página conferida visualmente, com texto selecionável.
- Mundo, renderização, câmera e ciclo de movimento migrados para Phaser 3.90 com TypeScript. A arte original foi preservada. React continua responsável por HUD, diálogos, combate, inventário e computador.
- Phaser é carregado sob demanda depois de entrar no jogo. Posição e animação ficam no ciclo da engine; React recebe atualizações de proximidade no máximo dez vezes por segundo.
- Colisão por subpassos, diagonal normalizada, setas e WASD, limpeza ao perder foco ou ocultar a página, toque contínuo com cancelamento e sem deslocamento adicional no clique de soltura.
- Preferência de movimento reduzido respeita o sistema na primeira visita. No jogo, a opção usa telas fixas em vez de câmera acompanhando continuamente o jogador.
- Save v4 com validação, migração dos saves v2/v3, filtragem de IDs, recuperação de posições inválidas e tratamento de armazenamento bloqueado. Posição gravada a cada segundo e ao sair/ocultar a página; mudanças de progresso são gravadas quando ocorrem.
- AudioContext reutilizado e encerrado ao desmontar a jornada.
- Acesso profissional em `/` e `/portfolio`, sem depender do save, e jornada em `/jornada`. Projetos têm páginas próprias em `/projetos/[slug]`.
- Projetos antes da trajetória, descrições com contexto disponível, stack do Visualizer separada do ecossistema PREVER, referência ao TCC institucional e competências agrupadas por evidência em projetos.
- Removidos certificados vazios e botão que simulava reprodução musical sem áudio; mantido o link real para Spotify.
- Saída profissional e seletor de idioma visíveis no celular; fundo inerte durante modais, fechamento por Escape, contenção e retorno de foco.
- Modo assistido para continuar após Python sem exigir vitória no combate.
- Traduções adicionais do terminal, impressão, categorias e rótulos. O idioma da página acompanha o seletor.

## Verificação

- `npm run test:audit`: contratos dos assets, igualdade das chaves de tradução, movimento, colisão, ponte, acesso às interações, save e batalha.
- `npx tsc --noEmit --incremental false` e ESLint em `app`.
- Build Next.js e build Vinext/Cloudflare, com validação do Worker e HTML de produção.
- Conferência no navegador: carregamento da cena original, mapa, Escape, idioma, terminal e páginas profissionais. Não foi feita medição de FPS ou Lighthouse.
- Testes de navegador reproduzíveis em `tests/browser/portfolio.spec.ts`. Executar com `npx playwright install chromium` e `npm run test:browser`; incluem desktop e celular. A execução completa dessa suíte não está incluída na conferência manual acima.

## Informações que dependem do autor

A análise original identificou divergências que não podem ser resolvidas por suposição. Permanecem para confirmação:

- Nome exato do curso técnico conforme diploma.
- Inglês: o site informa avançado, enquanto o CV especifica leitura e escrita.
- Atualização da descrição do PREVER/SMDN no CV: quais contribuições e tecnologias representam a versão a apresentar.
- Screenshots reais, vídeo do jogo, certificados, contribuição individual detalhada e resultados comprovados de cada projeto.
- Perfil do LinkedIn, caso queira incluí-lo. Não foi inventado um endereço.

Essas pendências não bloqueiam o funcionamento do site e não foram convertidas em qualificações ou resultados fictícios.
