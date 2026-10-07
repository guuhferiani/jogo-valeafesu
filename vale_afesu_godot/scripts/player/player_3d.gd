extends CharacterBody3D

# Vale Afesu 3D - Player Controller
# Movimentação 3D suave, rotação na direção do movimento, animação de passos e uso de ferramentas

signal action_performed_3d(tool_id, target_world_pos)
signal interact_requested_3d(target_world_pos)

const WALK_SPEED: float = 5.0
const RUN_SPEED: float = 8.0
const JUMP_VELOCITY: float = 4.5

@onready var visual_root: Node3D = $Visuals
@onready var leg_left: Node3D = $Visuals/LegLeft
@onready var leg_right: Node3D = $Visuals/LegRight
@onready var body_mesh: Node3D = $Visuals/Body

var facing_direction: Vector3 = Vector3.BACK
var walk_cycle: float = 0.0
var is_acting: bool = false
var action_timer: float = 0.0

func _physics_process(delta: float) -> void:
	# Gravidade
	if not is_on_floor():
		velocity += get_gravity() * delta

	# Ação temporária de golpe da ferramenta
	if action_timer > 0.0:
		action_timer -= delta
		if action_timer <= 0.0:
			is_acting = false
			if visual_root:
				visual_root.rotation.x = 0.0
		velocity.x = move_toward(velocity.x, 0, WALK_SPEED * delta * 5.0)
		velocity.z = move_toward(velocity.z, 0, WALK_SPEED * delta * 5.0)
		move_and_slide()
		return

	# Leitura de Inputs de Movimento
	var input_dir = Vector2.ZERO
	if Input.is_action_pressed("move_left"): input_dir.x -= 1
	if Input.is_action_pressed("move_right"): input_dir.x += 1
	if Input.is_action_pressed("move_up"): input_dir.y -= 1
	if Input.is_action_pressed("move_down"): input_dir.y += 1

	var direction = Vector3(input_dir.x, 0, input_dir.y).normalized()
	var speed = RUN_SPEED if Input.is_action_pressed("run") else WALK_SPEED

	if direction != Vector3.ZERO:
		velocity.x = direction.x * speed
		velocity.z = direction.z * speed
		facing_direction = direction

		# Rotação suave do personagem olhando para a direção do movimento
		var target_angle = atan2(-direction.x, -direction.z)
		visual_root.rotation.y = lerp_angle(visual_root.rotation.y, target_angle, 12.0 * delta)

		# Animação de passos (balanço de pernas e corpo)
		walk_cycle += delta * (14.0 if Input.is_action_pressed("run") else 9.0)
		if leg_left and leg_right:
			leg_left.rotation.x = sin(walk_cycle) * 0.6
			leg_right.rotation.x = -sin(walk_cycle) * 0.6
		if body_mesh:
			body_mesh.position.y = 0.5 + abs(sin(walk_cycle)) * 0.08
	else:
		velocity.x = move_toward(velocity.x, 0, speed)
		velocity.z = move_toward(velocity.z, 0, speed)
		# Volta pernas ao repouso
		if leg_left and leg_right:
			leg_left.rotation.x = lerp_angle(leg_left.rotation.x, 0.0, 10.0 * delta)
			leg_right.rotation.x = lerp_angle(leg_right.rotation.x, 0.0, 10.0 * delta)
		if body_mesh:
			body_mesh.position.y = lerp(body_mesh.position.y, 0.5, 10.0 * delta)

	move_and_slide()

	# Troca de Ferramenta (1 a 6)
	for i in range(6):
		if Input.is_key_pressed(KEY_1 + i):
			GameManager.select_tool(i)

	# Ações de Ferramentas (Espaço / Clique Esquerdo)
	if Input.is_action_just_pressed("action") and not is_acting:
		perform_action()

	# Interações (E / Clique Direito)
	if Input.is_action_just_pressed("interact"):
		perform_interact()

func perform_action() -> void:
	var tool_data = GameManager.get_active_tool()
	if not GameManager.use_energy(tool_data.get("cost", 1.0)):
		return

	is_acting = true
	action_timer = 0.25

	# Animação de golpe: inclina o corpo ligeiramente para a frente
	if visual_root:
		visual_root.rotation.x = deg_to_rad(25.0)

	var target_pos = global_position + (facing_direction * 1.5)
	action_performed_3d.emit(tool_data["id"], target_pos)

func perform_interact() -> void:
	var target_pos = global_position + (facing_direction * 1.8)
	interact_requested_3d.emit(target_pos)
