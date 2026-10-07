extends AnimalFSM

# Vale Afesu - IA da Vaca Mimosa
# Spritesheet: 3 colunas (Idle, Graze/Chew, Blink/Tail) x 2 linhas (Direita, Esquerda)

var milk_produced: bool = false

func _ready() -> void:
	animal_name = "Vaca Mimosa"
	move_speed = 18.0
	min_wander_time = 3.0
	max_wander_time = 7.0
	super._ready()

func on_state_entered(state: State) -> void:
	match state:
		State.ACTION:
			GameManager.post_notification("🐄 Mimosa está pastando calmamente...", Color(0.85, 0.95, 0.85))
		State.PETTED:
			if not milk_produced and randf() < 0.75:
				milk_produced = true

func _on_new_day(day: int, season: String) -> void:
	super._on_new_day(day, season)
	if milk_produced:
		milk_produced = false
		GameManager.ship_item("Leite Fresco da Mimosa", 75, 1)
		GameManager.post_notification("🥛 Mimosa produziu um balde de leite fresco!", Color(1.0, 1.0, 1.0))

func update_animation() -> void:
	if not sprite:
		return
	
	var row = 1 if is_facing_left else 0
	var col = 0
	
	match current_state:
		State.IDLE, State.SLEEPING:
			col = 0
		State.ACTION:
			col = 1 # Graze/pastar
		State.WANDER:
			col = 2 # Passo lento
		State.PETTED:
			col = 0

	sprite.frame = row * 3 + col
