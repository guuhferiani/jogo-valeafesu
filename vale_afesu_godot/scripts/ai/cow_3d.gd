extends AnimalFSM3D

# Vale Afesu 3D - IA da Vaca Mimosa 3D

@onready var leg_fl: Node3D = $Visuals/LegFL
@onready var leg_fr: Node3D = $Visuals/LegFR
@onready var leg_bl: Node3D = $Visuals/LegBL
@onready var leg_br: Node3D = $Visuals/LegBR

var milk_ready: bool = false

func _ready() -> void:
	animal_name = "Vaca Mimosa"
	move_speed = 1.2
	min_wander_time = 3.0
	max_wander_time = 6.0
	super._ready()

func on_state_entered(state: State) -> void:
	match state:
		State.ACTION:
			GameManager.post_notification("🐄 Mimosa está pastando a grama fresca!", Color(0.85, 0.95, 0.85))
		State.PETTED:
			if not milk_ready and randf() < 0.75:
				milk_ready = true

func animate_walk(cycle: float) -> void:
	# 4 pernas balançando alternadas
	if leg_fl and leg_fr and leg_bl and leg_br:
		leg_fl.rotation.x = sin(cycle) * 0.4
		leg_br.rotation.x = sin(cycle) * 0.4
		leg_fr.rotation.x = -sin(cycle) * 0.4
		leg_bl.rotation.x = -sin(cycle) * 0.4

func _on_new_day(day: int, season: String) -> void:
	super._on_new_day(day, season)
	if milk_ready:
		milk_ready = false
		GameManager.ship_item("Leite Fresco da Mimosa", 75, 1)
		GameManager.post_notification("🥛 Mimosa produziu um balde de leite fresco!", Color(1.0, 1.0, 1.0))
