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

## Tutorial por etapas

A nova entrada `/jornada` começa em um espaço vazio, com o personagem e a indicação de WASD.
Cada mecânica aparece somente quando a anterior foi aprendida:

1. **Movimento:** caminhe para cima, esquerda, baixo e direita usando WASD/setas ou joystick.
   As quatro direções precisam ser usadas com deslocamento real; apertar uma tecla parado
   contra a borda não conclui a etapa.
2. **Relógios:** surgem dois relógios. Aproxime-se e use **E** para ajustar os ponteiros
   para **03:00** e **09:00**. **Q** destaca a posição correta. Ao resolver os dois,
   os relógios saem da área e o próximo exercício aparece.
3. **Desvio:** atravesse as três faixas de pulso e alcance o marcador. **Espaço** permite
   uma esquiva com recarga; os caminhos por cima e por baixo são alternativas sem tempo.
   Um contato com uma faixa ativa devolve o personagem ao começo desse exercício.

A interface mostra apenas as ações da etapa atual. No toque, o joystick fica à esquerda
com o botão da ação à direita. **Esc** pausa e oferece idiomas, animações reduzidas e
modo assistido sem dano. Perder o foco pausa e limpa a entrada.

O visual usa uma ilustração mais simples do personagem, formas planas e relógios
funcionais desenhados pelo motor. Não carrega o cenário pintado, drone ou atlas de objetos
da versão anterior. O movimento tem aceleração e frenagem curtas, passos associados ao
deslocamento real e câmera com suavização dependente do tempo.

## Laboratório e progresso

**T → Entrar no laboratório** abre uma partida independente, com seleção de Movimento,
Relógios ou Desvio e ajuste de velocidade. O painel mostra FPS e coordenadas. Ao voltar
à partida normal, seu progresso é restaurado. O salvamento usa as chaves versionadas
`dry-guided-tutorial-v2` e `dry-guided-lab-v2`, sem apagar saves das versões anteriores.
Reabrir a página restaura a etapa e os relógios em um ponto seguro.

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
- `app/game/guided/model.ts`: etapas, movimento, relógios, desvio e progresso.
- `app/game/guided/scene.ts`: cenário simples, relógios, transições e câmera.
- `app/game/tutorial/avatar.ts`: caminhada articulada, postura e ancoragem dos pés.
- `app/game/tutorial/`: também conserva os módulos da versão anterior, sem carregá-los na nova entrada.
- `app/game/guided/client.tsx`: interface progressiva, toque, pausa, idiomas e laboratório.
- `app/game/guided/style.css`: interface limpa, responsiva e com movimento reduzido.
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

Confira `docs/TUTORIAL-GUIADO.md` para o fluxo atual, `docs/OBSERVATORIO.md` para a versão anterior e
`docs/CORRECOES.md` para os ajustes anteriores do portfólio e do CV.
