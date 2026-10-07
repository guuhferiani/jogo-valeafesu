extends CharacterBody3D
class_name AnimalFSM3D

# Vale Afesu 3D - Módulo Didático de Inteligência Artificial para Jogos
# Implementação de Máquina de Estados Finitos (FSM) em Espaço Tridimensional

enum State {
	IDLE,
	WANDER,
	ACTION,
	PETTED,
	SLEEPING
}

@export var animal_name: String = "Animal"
@export var move_speed: float = 2.0
@export var min_wander_time: float = 2.0
@export var max_wander_time: float = 5.0

var current_state: State = State.IDLE
var state_timer: float = 0.0
var wander_direction: Vector3 = Vector3.ZERO
var has_been_petted_today: bool = false
var walk_cycle: float = 0.0

@onready var visual_root: Node3D = $Visuals
@onready var heart_mesh: Node3D = $HeartIndicator
@onready var head_node: Node3D = $Visuals/Head

func _ready() -> void:
	TimeManager.day_advanced.connect(_on_new_day)
	TimeManager.time_tick.connect(_on_time_tick)
	change_state(State.IDLE)
	if heart_mesh:
		heart_mesh.visible = false

func _physics_process(delta: float) -> void:
	if not is_on_floor():
		velocity += get_gravity() * delta

	state_timer -= delta

	match current_state:
		State.IDLE:
			velocity.x = move_toward(velocity.x, 0, 4.0 * delta)
			velocity.z = move_toward(velocity.z, 0, 4.0 * delta)
			if state_timer <= 0:
				decide_next_action()

		State.WANDER:
			velocity.x = wander_direction.x * move_speed
			velocity.z = wander_direction.z * move_speed
			
			if visual_root and wander_direction != Vector3.ZERO:
				var target_angle = atan2(-wander_direction.x, -wander_direction.z)
				visual_root.rotation.y = lerp_angle(visual_root.rotation.y, target_angle, 8.0 * delta)

			walk_cycle += delta * 8.0
			animate_walk(walk_cycle)

			if is_on_wall() or state_timer <= 0:
				change_state(State.IDLE)

		State.ACTION:
			velocity.x = 0
			velocity.z = 0
			if state_timer <= 0:
				reset_action_pose()
				change_state(State.IDLE)

		State.PETTED:
			velocity.x = 0
			velocity.z = 0
			if heart_mesh:
				heart_mesh.rotate_y(delta * 3.0)
				heart_mesh.position.y = 1.6 + sin(state_timer * 6.0) * 0.1
			if state_timer <= 0:
				if heart_mesh:
					heart_mesh.visible = false
				change_state(State.IDLE)

		State.SLEEPING:
			velocity.x = 0
			velocity.z = 0

	move_and_slide()

func decide_next_action() -> void:
	if TimeManager.hour >= 20 or TimeManager.hour < 6:
		change_state(State.SLEEPING)
		return

	var roll = randf()
	if roll < 0.45:
		var angle = randf() * TAU
		wander_direction = Vector3(cos(angle), 0, sin(angle)).normalized()
		change_state(State.WANDER, randf_range(min_wander_time, max_wander_time))
	elif roll < 0.80:
		change_state(State.ACTION, randf_range(2.0, 4.5))
		perform_action_pose()
	else:
		change_state(State.IDLE, randf_range(1.5, 3.5))

func change_state(new_state: State, duration: float = 1.0) -> void:
	current_state = new_state
	state_timer = duration
	on_state_entered(new_state)

func on_state_entered(_state: State) -> void:
	pass

func receive_petting() -> void:
	has_been_petted_today = true
	change_state(State.PETTED, 2.2)
	if heart_mesh:
		heart_mesh.visible = true
	GameManager.post_notification("❤️ %s adorou seu carinho!" % animal_name, Color(1.0, 0.4, 0.6))

func animate_walk(_cycle: float) -> void:
	pass

func perform_action_pose() -> void:
	if head_node:
		head_node.rotation.x = deg_to_rad(30.0) # Abaixa a cabeça para pastar/ciscar

func reset_action_pose() -> void:
	if head_node:
		head_node.rotation.x = 0.0

func _on_new_day(_day: int, _season: String) -> void:
	has_been_petted_today = false
	if heart_mesh:
		heart_mesh.visible = false
	reset_action_pose()
	change_state(State.IDLE)

func _on_time_tick(hour: int, _minute: int) -> void:
	if hour == 20 and current_state != State.SLEEPING:
		change_state(State.SLEEPING, 3600.0)
	elif hour == 6 and current_state == State.SLEEPING:
		change_state(State.IDLE, 2.0)
