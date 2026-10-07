extends Node3D

# Vale Afesu 3D - Farm World Manager
# Gerencia a fazenda 3D: solo arado, irrigação, modelos de plantações e ciclo solar

var farm_plots: Dictionary = {}

@onready var soil_container: Node3D = $SoilContainer
@onready var crops_container: Node3D = $CropsContainer
@onready var player: CharacterBody3D = $Player
@onready var chicken: AnimalFSM3D = $Animals/Chicken
@onready var cow: AnimalFSM3D = $Animals/Cow
@onready var sun_light: DirectionalLight3D = $DirectionalLight3D
@onready var shipping_bin: Node3D = $ShippingBin

# Materiais 3D dos canteiros
var mat_soil_dry: StandardMaterial3D
var mat_soil_wet: StandardMaterial3D
var mat_leaf: StandardMaterial3D
var mat_pumpkin: StandardMaterial3D
var mat_parsnip: StandardMaterial3D

func _ready() -> void:
	init_materials()
	TimeManager.day_advanced.connect(_on_day_advanced)
	TimeManager.time_tick.connect(_on_time_tick)
	
	if player:
		player.action_performed_3d.connect(_on_player_action)
		player.interact_requested_3d.connect(_on_player_interact)
	
	# Prepara canteiros iniciais de demonstração
	for x in range(-3, 3):
		for z in range(1, 4):
			hoe_plot(Vector2i(x, z), false)
	
	plant_crop(Vector2i(-2, 1), "parsnip", false)
	plant_crop(Vector2i(-1, 1), "parsnip", false)
	plant_crop(Vector2i(0, 1), "pumpkin", false)
	water_plot(Vector2i(-2, 1), false)
	water_plot(Vector2i(-1, 1), false)
	water_plot(Vector2i(0, 1), false)

	update_sun_lighting()
	GameManager.post_notification("🌾 Bem-vindo(a) ao Vale Afesu 3D!", Color(0.95, 0.85, 0.3))

func init_materials() -> void:
	mat_soil_dry = StandardMaterial3D.new()
	mat_soil_dry.albedo_color = Color("#8b5a2b")
	mat_soil_dry.roughness = 0.9

	mat_soil_wet = StandardMaterial3D.new()
	mat_soil_wet.albedo_color = Color("#4a2e15")
	mat_soil_wet.roughness = 0.45

	mat_leaf = StandardMaterial3D.new()
	mat_leaf.albedo_color = Color("#2ecc71")
	mat_leaf.roughness = 0.6

	mat_pumpkin = StandardMaterial3D.new()
	mat_pumpkin.albedo_color = Color("#e67e22")
	mat_pumpkin.roughness = 0.5

	mat_parsnip = StandardMaterial3D.new()
	mat_parsnip.albedo_color = Color("#ecf0f1")
	mat_parsnip.roughness = 0.7

func _on_player_action(tool_id: String, target_world_pos: Vector3) -> void:
	var grid_pos = Vector2i(round(target_world_pos.x), round(target_world_pos.z))
	
	match tool_id:
		"hoe":
			hoe_plot(grid_pos)
		"can":
			water_plot(grid_pos)
		"seeds_parsnip":
			plant_crop(grid_pos, "parsnip")
		"seeds_pumpkin":
			plant_crop(grid_pos, "pumpkin")
		"axe", "pickaxe":
			clear_plot(grid_pos)

func _on_player_interact(target_world_pos: Vector3) -> void:
	var grid_pos = Vector2i(round(target_world_pos.x), round(target_world_pos.z))

	# 1. Colheita de fruto maduro
	if farm_plots.has(grid_pos):
		var plot = farm_plots[grid_pos]
		if plot["crop"] != null and plot["stage"] >= plot["max_stage"]:
			harvest_crop(grid_pos)
			return

	# 2. Caixote de Vendas
	if shipping_bin and player.global_position.distance_to(shipping_bin.global_position) < 3.2:
		GameManager.ship_item("Madeira da Fazenda", 10, 5)
		GameManager.post_notification("📦 Madeira colocada no Caixote de Vendas!", Color(0.2, 0.9, 0.4))
		return

	# 3. Carinho nos animais
	if chicken and player.global_position.distance_to(chicken.global_position) < 2.5:
		chicken.receive_petting()
		return

	if cow and player.global_position.distance_to(cow.global_position) < 3.5:
		cow.receive_petting()
		return

func hoe_plot(grid_pos: Vector2i, notify: bool = true) -> void:
	if farm_plots.has(grid_pos):
		return

	# Limite da área da fazenda
	if abs(grid_pos.x) > 10 or abs(grid_pos.y) > 10:
		if notify:
			GameManager.post_notification("Fora da área cultivável da fazenda!", Color(0.8, 0.5, 0.3))
		return

	farm_plots[grid_pos] = {
		"tilled": true,
		"watered": false,
		"crop": null,
		"stage": 0,
		"max_stage": 3
	}
	render_plot_3d(grid_pos)
	if notify:
		GameManager.post_notification("🌱 Solo arado em 3D!", Color(0.8, 0.6, 0.3))

func water_plot(grid_pos: Vector2i, notify: bool = true) -> void:
	if not farm_plots.has(grid_pos):
		return
	farm_plots[grid_pos]["watered"] = true
	render_plot_3d(grid_pos)
	if notify:
		GameManager.post_notification("💧 Canteiro irrigado!", Color(0.3, 0.7, 1.0))

func plant_crop(grid_pos: Vector2i, crop_name: String, notify: bool = true) -> void:
	if not farm_plots.has(grid_pos):
		if notify:
			GameManager.post_notification("Você precisa arar a terra antes de plantar!", Color(0.9, 0.6, 0.2))
		return

	var plot = farm_plots[grid_pos]
	if plot["crop"] != null:
		if notify:
			GameManager.post_notification("Já existe uma planta crescendo neste canteiro!", Color(0.9, 0.6, 0.2))
		return

	plot["crop"] = crop_name
	plot["stage"] = 0
	plot["max_stage"] = 3
	render_plot_3d(grid_pos)
	if notify:
		var name_pt = "Chirívia" if crop_name == "parsnip" else "Abóbora"
		GameManager.post_notification("🌱 %s plantada com sucesso!" % name_pt, Color(0.4, 0.9, 0.4))

func clear_plot(grid_pos: Vector2i) -> void:
	if farm_plots.has(grid_pos):
		farm_plots.erase(grid_pos)
		clear_rendered_plot_3d(grid_pos)
		GameManager.post_notification("Canteiro desfeito!", Color(0.7, 0.7, 0.7))

func harvest_crop(grid_pos: Vector2i) -> void:
	var plot = farm_plots[grid_pos]
	var crop_name = plot["crop"]
	var val = 40 if crop_name == "parsnip" else 95
	var name_pt = "Chirívia Dourada" if crop_name == "parsnip" else "Abóbora de Outono"
	
	GameManager.add_gold(val)
	GameManager.post_notification("✨ Colheita 3D de %s! (+%d Ouro)" % [name_pt, val], Color(1.0, 0.85, 0.2))
	
	plot["crop"] = null
	plot["stage"] = 0
	render_plot_3d(grid_pos)

func _on_day_advanced(_day: int, _season: String) -> void:
	for grid_pos in farm_plots.keys():
		var plot = farm_plots[grid_pos]
		if plot["crop"] != null and plot["watered"]:
			plot["stage"] = min(plot["max_stage"], plot["stage"] + 1)
		plot["watered"] = false
		render_plot_3d(grid_pos)

func render_plot_3d(grid_pos: Vector2i) -> void:
	clear_rendered_plot_3d(grid_pos)
	var plot = farm_plots[grid_pos]
	var world_pos = Vector3(grid_pos.x, 0.04, grid_pos.y)

	# 1. Bloco de Terra Arada
	var soil_mesh_inst = MeshInstance3D.new()
	soil_mesh_inst.name = "Soil_%d_%d" % [grid_pos.x, grid_pos.y]
	var box = BoxMesh.new()
	box.size = Vector3(0.92, 0.08, 0.92)
	soil_mesh_inst.mesh = box
	soil_mesh_inst.material_override = mat_soil_wet if plot["watered"] else mat_soil_dry
	soil_mesh_inst.position = world_pos
	soil_container.add_child(soil_mesh_inst)

	# 2. Plantação 3D
	if plot["crop"] != null:
		var crop_node = Node3D.new()
		crop_node.name = "Crop_%d_%d" % [grid_pos.x, grid_pos.y]
		crop_node.position = world_pos + Vector3(0, 0.04, 0)
		
		var stage = plot["stage"]
		if stage == 0:
			# Broto pequeno
			var s_mesh = MeshInstance3D.new()
			var c = CylinderMesh.new()
			c.top_radius = 0.03
			c.bottom_radius = 0.03
			c.height = 0.12
			s_mesh.mesh = c
			s_mesh.material_override = mat_leaf
			s_mesh.position.y = 0.06
			crop_node.add_child(s_mesh)
		elif stage == 1:
			# Planta crescendo com folhas
			var leaf1 = MeshInstance3D.new()
			var b = BoxMesh.new()
			b.size = Vector3(0.3, 0.04, 0.2)
			leaf1.mesh = b
			leaf1.material_override = mat_leaf
			leaf1.position.y = 0.1
			crop_node.add_child(leaf1)
		elif stage == 2:
			# Arbusto exuberante
			var leaf1 = MeshInstance3D.new()
			var b = BoxMesh.new()
			b.size = Vector3(0.5, 0.08, 0.4)
			leaf1.mesh = b
			leaf1.material_override = mat_leaf
			leaf1.position.y = 0.15
			crop_node.add_child(leaf1)
		elif stage >= 3:
			# Madura! Fruto colhível em 3D
			if plot["crop"] == "pumpkin":
				var p_mesh = MeshInstance3D.new()
				var sphere = SphereMesh.new()
				sphere.radius = 0.28
				sphere.height = 0.42
				p_mesh.mesh = sphere
				p_mesh.material_override = mat_pumpkin
				p_mesh.position.y = 0.22
				crop_node.add_child(p_mesh)
				
				# Talo verde
				var stem = MeshInstance3D.new()
				var sc = CylinderMesh.new()
				sc.top_radius = 0.03
				sc.bottom_radius = 0.03
				sc.height = 0.1
				stem.mesh = sc
				stem.material_override = mat_leaf
				stem.position.y = 0.45
				crop_node.add_child(stem)
			else:
				# Parsnip (raiz branca + folhas no topo)
				var r_mesh = MeshInstance3D.new()
				var cyl = CylinderMesh.new()
				cyl.top_radius = 0.14
				cyl.bottom_radius = 0.04
				cyl.height = 0.35
				r_mesh.mesh = cyl
				r_mesh.material_override = mat_parsnip
				r_mesh.position.y = 0.18
				crop_node.add_child(r_mesh)
				
				var top_leaves = MeshInstance3D.new()
				var lb = BoxMesh.new()
				lb.size = Vector3(0.4, 0.04, 0.4)
				top_leaves.mesh = lb
				top_leaves.material_override = mat_leaf
				top_leaves.position.y = 0.36
				crop_node.add_child(top_leaves)
		
		crops_container.add_child(crop_node)

func clear_rendered_plot_3d(grid_pos: Vector2i) -> void:
	var s_name = "Soil_%d_%d" % [grid_pos.x, grid_pos.y]
	var c_name = "Crop_%d_%d" % [grid_pos.x, grid_pos.y]
	if soil_container.has_node(s_name):
		soil_container.get_node(s_name).queue_free()
	if crops_container.has_node(c_name):
		crops_container.get_node(c_name).queue_free()

func _on_time_tick(_hour: int, _minute: int) -> void:
	update_sun_lighting()

func update_sun_lighting() -> void:
	if not sun_light:
		return
	
	var time_val = TimeManager.hour + (TimeManager.minute / 60.0)
	
	# Ângulo do sol através do dia (de 6:00 a 18:00)
	var sun_progress = clamp((time_val - 6.0) / 12.0, 0.0, 1.0)
	var sun_pitch = lerp(-15.0, -80.0, sin(sun_progress * PI))
	var sun_yaw = lerp(-45.0, 45.0, sun_progress)
	sun_light.rotation_degrees = Vector3(sun_pitch, sun_yaw, 0)
	
	# Cor e intensidade da luz solar
	if time_val >= 6.0 and time_val < 8.0:
		sun_light.light_color = Color(1.0, 0.8, 0.6)
		sun_light.light_energy = 0.8
	elif time_val >= 8.0 and time_val < 17.0:
		sun_light.light_color = Color(1.0, 0.98, 0.9)
		sun_light.light_energy = 1.2
	elif time_val >= 17.0 and time_val < 19.5:
		sun_light.light_color = Color(1.0, 0.6, 0.35)
		sun_light.light_energy = 0.7
	else:
		# Noite (luz da lua azulada suave)
		sun_light.light_color = Color(0.4, 0.45, 0.7)
		sun_light.light_energy = 0.25
