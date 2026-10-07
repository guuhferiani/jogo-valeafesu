extends CharacterBody2D

# Vale Afesu - Player Controller
# Movimentação suave, orientação, animação de passos e uso de ferramentas

signal action_performed(tool_id, target_grid_pos)
signal interact_requested(target_grid_pos)

const WALK_SPEED: float = 95.0
const RUN_SPEED: float = 145.0

@onready var sprite: Sprite2D = $Sprite2D
@onready var interaction_ray: RayCast2D = $RayCast2D
@onready var anim_timer: Timer = $WalkAnimTimer

var facing_dir: Vector2 = Vector2.DOWN
var is_moving: bool = false
var walk_frame: int = 0
var is_acting: bool = false
var action_cooldown: float = 0.0

# Dimensões da spritesheet: 4 colunas (Down, Up, Left, Right) x 4 linhas (Idle, Walk1, Walk2, Action)
# Cada frame é 16x24 px
const DIR_COLS = {
	Vector2.DOWN: 0,
	Vector2.UP: 1,
	Vector2.LEFT: 2,
	Vector2.RIGHT: 3
}

func _ready() -> void:
	update_sprite_frame()

func _physics_process(delta: float) -> void:
	if action_cooldown > 0.0:
		action_cooldown -= delta
		if action_cooldown <= 0.0:
			is_acting = false
			update_sprite_frame()
		velocity = Vector2.ZERO
		move_and_slide()
		return

	handle_input()
	move_and_slide()

func handle_input() -> void:
	var input_vector = Vector2.ZERO
	if Input.is_action_pressed("move_left"): input_vector.x -= 1
	if Input.is_action_pressed("move_right"): input_vector.x += 1
	if Input.is_action_pressed("move_up"): input_vector.y -= 1
	if Input.is_action_pressed("move_down"): input_vector.y += 1

	if input_vector != Vector2.ZERO:
		input_vector = input_vector.normalized()
		is_moving = true
		
		# Define direção cardeal principal
		if abs(input_vector.x) > abs(input_vector.y):
			facing_dir = Vector2.RIGHT if input_vector.x > 0 else Vector2.LEFT
		else:
			facing_dir = Vector2.DOWN if input_vector.y > 0 else Vector2.UP
		
		var speed = RUN_SPEED if Input.is_action_pressed("run") else WALK_SPEED
		velocity = input_vector * speed
		
		# Atualiza raycast de interação para apontar na direção do olhar
		if interaction_ray:
			interaction_ray.target_position = facing_dir * 20.0
	else:
		is_moving = false
		velocity = Vector2.ZERO

	# Hotbar atalhos 1 a 6
	for i in range(6):
		if Input.is_key_pressed(KEY_1 + i):
			GameManager.select_tool(i)

	# Ações (Espaço / Clique Esquerdo / C)
	if Input.is_action_just_pressed("action") and not is_acting:
		perform_tool_action()

	# Interações (E / Clique Direito / X)
	if Input.is_action_just_pressed("interact"):
		perform_interaction()

	update_animation_frames()

func perform_tool_action() -> void:
	var tool_data = GameManager.get_active_tool()
	if not GameManager.use_energy(tool_data.get("cost", 1.0)):
		return

	is_acting = true
	action_cooldown = 0.22
	
	# Calcula o tile à frente do jogador
	var target_world_pos = global_position + (facing_dir * 18.0)
	var target_grid_pos = Vector2i(floor(target_world_pos.x / 16.0), floor(target_world_pos.y / 16.0))
	
	update_sprite_frame()
	action_performed.emit(tool_data["id"], target_grid_pos)

func perform_interaction() -> void:
	var target_world_pos = global_position + (facing_dir * 18.0)
	var target_grid_pos = Vector2i(floor(target_world_pos.x / 16.0), floor(target_world_pos.y / 16.0))
	interact_requested.emit(target_grid_pos)

func update_animation_frames() -> void:
	if not is_moving:
		walk_frame = 0
	update_sprite_frame()

func _on_walk_anim_timer_timeout() -> void:
	if is_moving and not is_acting:
		walk_frame = (walk_frame + 1) % 4
		update_sprite_frame()

func update_sprite_frame() -> void:
	if not sprite:
		return
	
	var col = DIR_COLS.get(facing_dir, 0)
	var row = 0
	
	if is_acting:
		row = 3 # Linha de ação/golpe da ferramenta
	elif is_moving:
		# Alterna entre frame 1 e 2 de passos
		row = 1 if (walk_frame % 2 == 0) else 2
	else:
		row = 0 # Idle parado
	
	# Na spritesheet: 4 colunas x 4 linhas = frame index: row * 4 + col
	sprite.frame = row * 4 + col
