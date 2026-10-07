# 🌾 Vale Afesu 3D - Projeto Godot 4.7 Engine

Projeto oficial de desenvolvimento de jogos 3D com Inteligência Artificial para o curso **SENAI / AFESU** (*Inteligência Artificial Aplicada a Desenvolvimento de Jogos Digitais*).

---

## 🎮 Como Abrir e Jogar em 3D

1. Abra o executável **`Godot_v4.7.2-stable_win64.exe`** (em `Documents\Gustavo Feriani\Godot_v4.7.2\`).
2. Abra o projeto **Vale Afesu 3D** já importado.
3. No canto superior direito, clique no botão de **Play ▶️** (ou pressione a tecla **`F5`**).
4. O mundo 3D abrirá com o fazendeiro, a casa, o lago, a vaquinha e a galinha com sombras em tempo real!

> 💡 *Dica:* A versão clássica em 2D continua guardada em `scenes/main.tscn`. A versão 3D principal está em `scenes/main_3d.tscn`.

---

## 🕹️ Controles do Jogo 3D

| Ação | Teclas |
| :--- | :--- |
| **Mover o Fazendeiro no Espaço 3D** | `W`, `A`, `S`, `D` ou `Setas do Teclado` |
| **Correr** | Segurar `Shift` |
| **Usar Ferramenta no Canteiro** | `Espaço`, `Tecla C` ou `Clique Esquerdo do Mouse` |
| **Interagir / Carinho nos Animais** | `Tecla E`, `Tecla X` ou `Clique Direito do Mouse` |
| **Trocar de Ferramenta** | Teclas `1` a `6` ou clicar na Hotbar |
| **Dormir (Avançar o Dia)** | Clicar no botão `🛏️ Dormir` no topo |

---

## 🧠 Módulos de IA 3D Implementados

1. **Máquinas de Estados Finitos 3D (FSM - Finite State Machine)**:
   - Implementado no script `scripts/ai/animal_fsm_3d.gd`.
   - Vaca Mimosa 3D e Galinha Pipoca 3D exploram o pasto tridimensionalmente com navegação vetorial e desvio de obstáculos.
   - Estados de pastagem com animação da cabeça abaixando para comer a grama e asas batendo.
   - Resposta sensorial com corações 3D (`❤️`) flutuantes e giratórios sobre as criaturas ao receberem carinho.

2. **Ciclo Solar e Sombras Dinâmicas**:
   - Luz solar física calculada com base na hora do dia (`scripts/world/farm_world_3d.gd`), projetando sombras que se movem com o passar das horas.

3. **Agricultura 3D**:
   - Blocos de terra arada 3D com materiais PBR (seco e úmido).
   - Modelos de plantações com brotos, folhas e frutos maduros colhíveis (abóbora e chirívia).
