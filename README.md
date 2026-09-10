# DRY // Portfólio de Adryel Luís Rodrigues

Portfólio profissional em português, inglês e espanhol, com uma área jogável em
**Phaser 3.90 + TypeScript**. A primeira área do novo jogo é o Pátio do Observatório:
um tutorial ilustrado e um laboratório independente para experimentar as mecânicas.

## Abrir no computador (Windows, macOS ou Linux)

Requisitos: Node.js 22.13 ou superior e npm.

```sh
npm install
npm run dev
```

Abra o endereço mostrado pelo terminal, normalmente `http://localhost:5173`.
O portfólio abre em `/`; para jogar, entre em `/jornada`.
O script `dev` funciona no PowerShell e CMD: as configurações locais do Wrangler
já são definidas no `vite.config.ts`, sem a sintaxe de variáveis exclusiva do Unix.

## Tutorial jogável

1. Vá até a Lente luminosa à esquerda e use **E** para pegá-la.
2. Use **Q** para revelar os arcos dourados dos refletores. Aproxime-se e use **E**
   para girar cada ponteiro até o arco correspondente. O circuito resolvido fica travado.
3. Atravesse a faixa de energia quando apagar, use a esquiva ou siga pela rota inferior
   e desligue a faixa no interruptor. O caminho inferior permanece acessível.
4. Use **E** perto do drone para começar o treino. Saia do círculo marcado antes
   do disparo. O núcleo fica aberto depois do ataque: mire e use **Pulso** três vezes.
5. Recolha a célula com **E** e leve-a à porta do observatório para concluir.

Três sinos ressonantes e um caderno de campo ficam disponíveis para exploração.
O caderno contém texto ficcional do tutorial, não um poema atribuído ao autor.

## Controles

| Ação | Teclado e mouse | Toque |
| --- | --- | --- |
| Mover | WASD ou setas | Joystick esquerdo |
| Observar | Q | Botão Observar |
| Pulso | Clique na direção desejada ou F com mira assistida | Botão Pulso com mira assistida |
| Esquiva | Espaço | Botão Esquiva |
| Interagir | E | Botão Interagir |
| Pausar | Esc | Botão Pausa |
| Laboratório | T | Botão Testes |

A pausa oferece idiomas, efeitos sonoros opcionais, mira assistida, modo sem dano,
redução de animações e câmera fixa. Perder o foco pausa a simulação e limpa a entrada.
O modo assistido preserva o puzzle e as janelas de vulnerabilidade do drone.

## Laboratório

Abra **Testes → Entrar no laboratório**. O modo usa um save separado da partida normal.
É possível reiniciar os refletores, o drone ou todo o tutorial; ajustar velocidade
(120–320 px/s) e duração da esquiva; ativar invulnerabilidade, colisões visíveis,
câmera fixa e animação reduzida. O painel mostra FPS, intervalo médio aproximado
por quadro e coordenadas. **Voltar à partida** restaura o progresso normal.
Os ajustes de laboratório são temporários e não afetam a partida normal.

O save versionado é local: `dry-observatory-v1` e `dry-observatory-test-v1`.
Reabrir a página restaura objetivos e um checkpoint seguro, não um ataque em andamento.
Saves anteriores da jornada em pixel art permanecem intactos, mas não são convertidos
em progresso deste novo tutorial.

## Produção

### Vercel / Next.js

`vercel.json` usa `npx next build`. Para gerar localmente:

```sh
npm run build:next
```

### Cloudflare / Vinext

```sh
npm run build
npm run start
```

O build alternativo usa Bash e gera `dist/`. No Windows, use WSL/Git Bash para esse
build, ou o fluxo Next.js. Essa limitação não afeta `npm run dev` no PowerShell.

## Estrutura

- `app/page.tsx`, `app/portfolio/`: portfólio profissional.
- `app/projetos/[slug]/`: detalhes dos projetos.
- `app/jornada/page.tsx`: entrada direta do novo tutorial.
- `app/game/tutorial/model.ts`: simulação, colisões, combate, progresso e checkpoints.
- `app/game/tutorial/scene.ts`: renderização Phaser, câmera, luz e efeitos.
- `app/game/tutorial/tutorial-client.tsx`: interface React, áudio, toque, pausa e laboratório.
- `app/game/tutorial/copy.ts`: textos PT/EN/ES.
- `public/observatory/`: cenário e atlases ilustrados, gerados a partir da direção aprovada.
- `app/journey-client.tsx` e demais módulos antigos de `app/game/`: implementação anterior
  conservada como referência para a expansão; não é carregada pela rota nova.

Phaser só é importado quando o visitante abre o jogo. A posição fica na simulação,
e o HUD recebe snapshots no máximo dez vezes por segundo.

## Verificação

```sh
npm run test:audit
npx tsc --noEmit --incremental false
npm run build:next
```

A suíte cobre conclusão do tutorial, colisões e alcance, pistas do ataque, esquiva,
checkpoint, assistências, saves inválidos, separação do laboratório e segredos.
Também mantém os testes dos módulos anteriores usados como referência.

A suíte opcional de navegador está em `tests/browser/`. Para executá-la localmente:

```sh
npx playwright install chromium
npm run test:browser
```

Confira `docs/OBSERVATORIO.md` para escopo e limitações desta primeira área e
`docs/CORRECOES.md` para os ajustes anteriores do portfólio e do CV.
