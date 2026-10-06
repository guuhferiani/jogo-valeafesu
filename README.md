# 🌾 Vale Afesu - Fazenda Web Jogável

Um protótipo interativo e jogável inspirado na estética, interface e mecânicas acolhedoras de fazenda (estilo *Stardew Valley*), desenvolvido inteiramente em **HTML5 Canvas, CSS3 e JavaScript puro**, sem dependências externas pesadas.

---

## 🎮 Como Jogar e Controles

| Ação | Teclado / Mouse |
| :--- | :--- |
| **Mover o Fazendeiro** | `W`, `A`, `S`, `D` ou `Setas do Teclado` |
| **Correr** | Segurar `Shift` |
| **Selecionar Ferramenta/Item** | Teclas `1` a `9`, `0`, `-`, `=` ou `Roda do Mouse` |
| **Usar Ferramenta / Ação** | `Botão Esquerdo do Mouse` ou `Espaço` / `Tecla C` |
| **Interagir / Carinho nos Animais** | `Botão Direito do Mouse` ou `Tecla E` / `Tecla X` |
| **Ligar/Desligar Música Pastoral** | `Tecla M` ou Botão no topo esquerdo |
| **Dormir (Avançar o Dia)** | Botão `Dormir (Novo Dia)` no topo |
| **Guia / Ajuda** | `Tecla H` ou Botão `?` no topo |

---

## 🌱 Mecânicas Implementadas

1. **Ciclo de Agricultura Completo**:
   - **Enxada (Hoe)**: Ara o solo da grama criando canteiros férteis.
   - **Sementes (Seeds)**: Plante Chirívia (*Parsnip*), Morangos (*Strawberry*), Abóboras (*Pumpkin*) ou Milho (*Corn*).
   - **Regador (Watering Can)**: Regue os canteiros (a terra fica escura e úmida). Recarregue a água no lago!
   - **Crescimento**: Ao dormir, as plantas regadas avançam de fase (4 estágios visuais detalhados).
   - **Colheita**: Colha os vegetais maduros com a pose triunfal clássica do fazendeiro erguendo o fruto acima da cabeça!

2. **Caixote de Vendas (Shipping Bin)**:
   - Deposite colheitas, ovos ou madeira no grande caixote rústico ao lado da casa.
   - Ao dormir, veja o **Relatório de Rendimentos** com os lucros do dia somados ao seu Ouro (`G`).

3. **Cuidado com Animais da Fazenda**:
   - **Galinha Pipoca**: Anda pelo cercado, cisca e bota ovos frescos.
   - **Vaca Mimosa**: Pastoreia e abana o rabo.
   - Aproxime-se e dê carinho para ouvir sons fofos e ver corações flutuantes (`❤️`)!

4. **Coleta de Recursos**:
   - **Machado**: Derruba árvores de carvalho, pinheiros e quebra troncos soltos, gerando madeira e partículas de lascas.
   - **Picareta**: Quebra rochas e desfaz canteiros arados.
   - **Foice**: Corta mato alto e ervas daninhas.

4. **Telas e Prólogo de História (Cutscenes)**:
   - **Menu Principal**: Placa de madeira rústica, nuvens animadas, opções "Novo Jogo", "Continuar Fazenda" (com indicador de dia/estação salvos), "Configurações" e "Como Jogar".
   - **Prólogo Narrativo Interativo**: Reviva a história clássica em 5 capítulos com efeito de máquina de escrever (*typewriter*), sons táteis de papel e ilustrações em pixel-art:
     1. *A Carta Selada do Vovô* ✉️
     2. *Rotina exaustiva na Joja Corp* 🏢
     3. *O Testamento da Fazenda da Família* 📜
     4. *A Viagem de Ônibus para o Interior* 🚌
     5. *Chegada e Boas-Vindas ao Vale* 🌾
   - **Controles de História**: `Espaço` / `Enter` para avançar ou acelerar o texto, `Esc` para pular a introdução direto para a jogatina.

5. **Menu de Configurações**:
   - Ajuste o ritmo do dia: Rápido (5m), Normal (10m) ou Relaxado (15m).
   - Alternância de Música Pastoral e Efeitos Sonoros (SFX).
   - Salvar e Voltar ao Menu Principal.
   - Opção para reiniciar e apagar o save.

6. **Sistema de Salvamento Automático (LocalStorage)**:
   - Salva automaticamente ao dormir ou sair para o menu.
   - Preserva posição, inventário, sementes, ouro, energia, terra arada, água, estágio de crescimento das plantações e itens do caixote.

7. **Criação de Personagem (Customização Total)**:
   - Personalização de **Sexo/Gênero** (Feminino, Masculino, Neutro).
   - Nome do Personagem e Nome da Fazenda integrados na história.
   - 6 tons de pele, 3 estilos de cabelo, 7 cores de cabelo e 5 cores de olhos.
   - Acessórios: Chapéus (Palha, Boné, Gorro, Flor), Óculos (Retrô, Clássico, Sol), Camisas, Calças/Jardineiras/Saias e Calçados.
   - **Palco Giratório 360° em Pixel Art** e botão de **Aleatório**.

8. **Casa Ampliada & Interior Interativo**:
   - Cabana de madeira ampliada para 96x80px com varanda rústica e chaminé de pedra.
   - **Interior Interativo**:
     - 🛏️ **Cama Macia**: Dormir e avançar o ciclo do dia.
     - 🍳 **Fogão a Lenha**: Cozinhar 4 receitas (Omelete, Sopa de Chirívia, Torta de Frutas, Bolo de Abóbora) para recuperar energia.
     - 📺 **Televisão do Vale**: 3 canais (Previsão do Tempo, Dicas da Rainha, Vidente Welwick).
     - 🔥 **Lareira de Pedra**: Acesa ou apagada com estalos sonoros.

9. **Celeiro Tradicional (Barn) com Baú de Vendas**:
   - Celeiro rústico com teto gambrel, varanda coberta, fardo de palha e barril.
   - Baú de vendas (shipping bin) protegido sob o beiral do celeiro.

10. **Interface e HUD Autêntica**:
   - **Relógio e Calendário**: Estação (Primavera), dia da semana, hora animada (*6:00 AM* a *2:00 AM*), clima e moedas de ouro.
   - **Barra de Energia**: Medidor vertical com redução de velocidade ao cansar e recuperação via sono/alimentação.
   - **Hotbar em Madeira**: 12 compartimentos com atalhos numéricos, destaque dourado e medidor de água do regador.
   - **Ciclo Dia e Noite**: Transição de iluminação suave.
   - **Efeitos Sonoros e Trilha Sonora**: Sintetizados via **Web Audio API** sem arquivos de áudio pesados.

---

## 📁 Estrutura do Código

```text
jogo-valeafesu/
├── index.html        # Estrutura do jogo, HUD, telas e modais
├── style.css         # Estilização visual (madeira, pergaminho, fontes pixeladas)
├── vercel.json       # Configuração de segurança e headers HTTP para Vercel
├── package.json      # Metadados e scripts
├── .gitignore        # Regras de segurança para exclusão de arquivos sensíveis
├── js/
│   ├── audio.js      # Sintetizador procedural de efeitos sonoros e música
│   ├── sprites.js    # Gerador modular de pixel art (personagem, animais, construções)
│   ├── world.js      # Grid do mapa, canteiros, colheitas, celeiro e lago
│   ├── player.js     # Movimento, colisões, inventário e ações das ferramentas
│   └── main.js       # Game loop, câmera, criação de personagem e interior da casa
└── README.md         # Documentação completa
```

## 🚀 Como Executar Localmente

Você pode abrir o arquivo `index.html` em qualquer navegador moderno ou rodar o servidor embutido:
```bash
python -m http.server 8080
```
E acessar no navegador: `http://localhost:8080`.

## 🌐 Deploy no Vercel

O projeto está otimizado para deploy imediato no **Vercel**:
1. Conecte o repositório GitHub no [Vercel](https://vercel.com/new).
2. O arquivo `vercel.json` aplica automaticamente os cabeçalhos de segurança HTTP (`X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, `Referrer-Policy`, `Permissions-Policy`).
3. Deploy em segundos com HTTPS automático e CDN global.
