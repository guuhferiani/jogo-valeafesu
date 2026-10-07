extends AnimalFSM3D

# Vale Afesu 3D - IA da Galinha Pipoca 3D

@onready var wing_left: Node3D = $Visuals/WingLeft
@onready var wing_right: Node3D = $Visuals/WingRight

var egg_ready: bool = false

func _ready() -> void:
	animal_name = "Galinha Pipoca"
	move_speed = 1.8
	min_wander_time = 1.5
	max_wander_time = 3.5
	super._ready()

func on_state_entered(state: State) -> void:
	match state:
		State.ACTION:
			GameManager.post_notification("🐔 Pipoca está ciscando sementinhas no pasto!", Color(0.95, 0.95, 0.95))
		State.PETTED:
			if not egg_ready and randf() < 0.8:
				egg_ready = true

func animate_walk(cycle: float) -> void:
	# Asinhas batendo de leve enquanto anda
	if wing_left and wing_right:
		wing_left.rotation.z = deg_to_rad(sin(cycle * 1.5) * 20.0)
		wing_right.rotation.z = deg_to_rad(-sin(cycle * 1.5) * 20.0)

func _on_new_day(day: int, season: String) -> void:
	super._on_new_day(day, season)
	if egg_ready:
		egg_ready = false
		GameManager.ship_item("Ovo Fresco da Pipoca", 35, 1)
		GameManager.post_notification("🥚 Pipoca botou um ovo fresco no ninho 3D!", Color(1.0, 1.0, 0.8))
