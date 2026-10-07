extends CharacterBody2D
class_name AnimalFSM

# Vale Afesu - Módulo Didático de Inteligência Artificial para Jogos
# Implementação de Máquina de Estados Finitos (FSM) para Criaturas Autônomas

enum State {
	IDLE,      # Parado descansando ou observando
	WANDER,    # Andando de forma autônoma pelo cercado
	ACTION,    # Ciscando (Galinha) ou Pastando (Vaca)
	PETTED,    # Reagindo ao carinho do jogador (Coração flutuante)
	SLEEPING   # Dormindo durante a noite
}

@export var animal_name: String = "Animal"
@export var move_speed: float = 25.0
@export var min_wander_time: float = 2.0
@export var max_wander_time: float = 5.0

var current_state: State = State.IDLE
var state_timer: float = 0.0
var wander_direction: Vector2 = Vector2.ZERO
var is_facing_left: bool = false
var has_been_petted_today: bool = false

@onready var sprite: Sprite2D = $Sprite2D
@onready var heart_sprite: Sprite2D = $HeartSprite

func _ready() -> void:
	# Conecta ao sinal de novo dia para resetar carinho e produzir recursos
	TimeManager.day_advanced.connect(_on_new_day)
	TimeManager.time_tick.connect(_on_time_tick)
	change_state(State.IDLE)
	if heart_sprite:
		heart_sprite.visible = false

func _physics_process(delta: float) -> void:
	state_timer -= delta

	match current_state:
		State.IDLE:
			velocity = Vector2.ZERO
			if state_timer <= 0:
				decide_next_autonomous_action()

		State.WANDER:
			velocity = wander_direction * move_speed
			move_and_slide()
			# Colisão com cercas ou bordas faz mudar de direção
			if get_slide_collision_count() > 0 or state_timer <= 0:
				change_state(State.IDLE)

		State.ACTION:
			velocity = Vector2.ZERO
			if state_timer <= 0:
				change_state(State.IDLE)

		State.PETTED:
			velocity = Vector2.ZERO
			if state_timer <= 0:
				if heart_sprite:
					heart_sprite.visible = false
				change_state(State.IDLE)

		State.SLEEPING:
			velocity = Vector2.ZERO

	update_animation()

# Tomada de Decisão Autônoma (IA FSM)
func decide_next_autonomous_action() -> void:
	if TimeManager.hour >= 20 or TimeManager.hour < 6:
		change_state(State.SLEEPING)
		return

	var roll = randf()
	if roll < 0.45:
		# Escolhe vagar em direção aleatória
		var angles = [0.0, PI/2, PI, 3*PI/2, randf() * TAU]
		wander_direction = Vector2.RIGHT.rotated(angles.pick_random()).normalized()
		is_facing_left = (wander_direction.x < 0)
		change_state(State.WANDER, randf_range(min_wander_time, max_wander_time))
	elif roll < 0.80:
		# Parar e ciscar / pastar
		change_state(State.ACTION, randf_range(2.0, 4.0))
	else:
		# Ficar em alerta/idle
		change_state(State.IDLE, randf_range(1.5, 3.5))

func change_state(new_state: State, duration: float = 1.0) -> void:
	current_state = new_state
	state_timer = duration
	on_state_entered(new_state)

func on_state_entered(state: State) -> void:
	# Sobrescrito nas classes filhas (Galinha / Vaca)
	pass

func receive_petting() -> void:
	has_been_petted_today = true
	change_state(State.PETTED, 1.8)
	if heart_sprite:
		heart_sprite.visible = true
	GameManager.post_notification("❤️ %s ficou muito feliz com seu carinho!" % animal_name, Color(1.0, 0.4, 0.6))

func _on_new_day(_day: int, _season: String) -> void:
	has_been_petted_today = false
	if heart_sprite:
		heart_sprite.visible = false
	change_state(State.IDLE)

func _on_time_tick(hour: int, _minute: int) -> void:
	if hour == 20 and current_state != State.SLEEPING:
		change_state(State.SLEEPING, 3600.0)
	elif hour == 6 and current_state == State.SLEEPING:
		change_state(State.IDLE, 2.0)

func update_animation() -> void:
	# Sobrescrito nas classes filhas
	pass
