extends AnimalFSM

# Vale Afesu - IA da Galinha Pipoca
# Spritesheet: 4 colunas (Idle, Peck, Walk1, Walk2) x 2 linhas (Direita, Esquerda)

var egg_produced: bool = false
var step_tick: float = 0.0
var walk_anim_frame: int = 0

func _ready() -> void:
	animal_name = "Galinha Pipoca"
	move_speed = 30.0
	super._ready()

func on_state_entered(state: State) -> void:
	match state:
		State.ACTION:
			# Peck no chão
			GameManager.post_notification("🐔 Pipoca está ciscando sementinhas!", Color(0.9, 0.9, 0.9))
		State.PETTED:
			# O carinho estimula a botar ovo no dia seguinte
			if not egg_produced and randf() < 0.8:
				egg_produced = true

func _on_new_day(day: int, season: String) -> void:
	super._on_new_day(day, season)
	if egg_produced:
		egg_produced = false
		# Coloca um ovo no inventário ou caixote
		GameManager.ship_item("Ovo Fresco da Pipoca", 35, 1)
		GameManager.post_notification("🥚 Pipoca botou um ovo fresco no ninho!", Color(1.0, 1.0, 0.8))

func update_animation() -> void:
	if not sprite:
		return
	
	var row = 1 if is_facing_left else 0
	var col = 0
	
	match current_state:
		State.IDLE, State.SLEEPING:
			col = 0
		State.ACTION:
			col = 1 # Pecking
		State.WANDER:
			step_tick += get_process_delta_time() * 8.0
			col = 2 if int(step_tick) % 2 == 0 else 3
		State.PETTED:
			col = 0

	sprite.frame = row * 4 + col
