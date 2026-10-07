extends Node2D

# Vale Afesu - Farm World Manager
# Gerencia canteiros arados, irrigação, crescimento de plantações e interações

# Dicionário de tiles cultivados:
# chave: Vector2i(x, y) -> valor: { "tilled": true, "watered": false, "crop": "parsnip"|"pumpkin", "stage": 0, "max_stage": 3 }
var farm_plots: Dictionary = {}

@onready var crops_node: Node2D = $CropsContainer
@onready var soil_node: Node2D = $SoilContainer
@onready var floating_text_node: Node2D = $FloatingTexts
@onready var shipping_bin_area: Area2D = $ShippingBin/Area2D
@onready var player: CharacterBody2D = $Player
@onready var chicken: AnimalFSM = $Animals/Chicken
@onready var cow: AnimalFSM = $Animals/Cow
@onready var canvas_modulate: CanvasModulate = $CanvasModulate

var tileset_tex: Texture2D = preload("res://assets/terrain/tileset.png")
var crops_tex: Texture2D = preload("res://assets/crops/crops.png")

func _ready() -> void:
	TimeManager.day_advanced.connect(_on_day_advanced)
	if canvas_modulate:
		TimeManager.ambient_light_changed.connect(func(col): canvas_modulate.color = col)
		canvas_modulate.color = TimeManager.get_current_ambient_color()
	
	if player:
		player.action_performed.connect(_on_player_action)
		player.interact_requested.connect(_on_player_interact)
	
	# Inicializa alguns canteiros de boas-vindas já preparados
	for gx in range(12, 16):
		for gy in range(8, 11):
			hoe_tile(Vector2i(gx, gy), false)
	
	# Planta algumas chirívias iniciais para demonstração
	plant_seed(Vector2i(12, 8), "parsnip", false)
	plant_seed(Vector2i(13, 8), "parsnip", false)
	plant_seed(Vector2i(14, 8), "pumpkin", false)
	water_tile(Vector2i(12, 8), false)
	water_tile(Vector2i(13, 8), false)
	water_tile(Vector2i(14, 8), false)

	GameManager.post_notification("🌾 Bem-vindo(a) ao Vale Afesu! Cuide da terra com carinho!", Color(0.9, 0.8, 0.2))

func _on_player_action(tool_id: String, grid_pos: Vector2i) -> void:
	match tool_id:
		"hoe":
			hoe_tile(grid_pos)
		"can":
			water_tile(grid_pos)
		"seeds_parsnip":
			plant_seed(grid_pos, "parsnip")
		"seeds_pumpkin":
			plant_seed(grid_pos, "pumpkin")
		"axe", "pickaxe":
			clear_tile(grid_pos)

func _on_player_interact(grid_pos: Vector2i) -> void:
	# 1. Verifica se há colheita madura para pegar
	if farm_plots.has(grid_pos):
		var plot = farm_plots[grid_pos]
		if plot["crop"] != null and plot["stage"] >= plot["max_stage"]:
			harvest_crop(grid_pos)
			return

	# 2. Verifica se está perto do Caixote de Vendas
	var bin_pos = Vector2(80, 80)
	var player_pos = player.global_position
	if player_pos.distance_to(bin_pos) < 36.0:
		GameManager.ship_item("Madeira da Fazenda", 10, 5)
		spawn_floating_text("+50 Ouro em Potencial!", bin_pos + Vector2(0, -16), Color(0.2, 0.9, 0.3))
		return

	# 3. Verifica carinho nos animais
	if chicken and player_pos.distance_to(chicken.global_position) < 32.0:
		chicken.receive_petting()
		spawn_floating_text("❤️ Pipoca!", chicken.global_position + Vector2(0, -14), Color(1.0, 0.4, 0.6))
		return

	if cow and player_pos.distance_to(cow.global_position) < 40.0:
		cow.receive_petting()
		spawn_floating_text("❤️ Mimosa!", cow.global_position + Vector2(0, -18), Color(1.0, 0.4, 0.6))
		return

func hoe_tile(grid_pos: Vector2i, notify: bool = true) -> void:
	if farm_plots.has(grid_pos):
		return
	
	# Limites da área cultivável da fazenda
	if grid_pos.x < 4 or grid_pos.x > 26 or grid_pos.y < 4 or grid_pos.y > 15:
		if notify:
			GameManager.post_notification("Solo muito pedregoso ou fora da área de plantio!", Color(0.8, 0.5, 0.3))
		return

	farm_plots[grid_pos] = {
		"tilled": true,
		"watered": false,
		"crop": null,
		"stage": 0,
		"max_stage": 3
	}
	render_plot(grid_pos)
	if notify:
		spawn_floating_text("Solo Arado!", Vector2(grid_pos.x * 16 + 8, grid_pos.y * 16), Color(0.7, 0.5, 0.2))

func water_tile(grid_pos: Vector2i, notify: bool = true) -> void:
	if not farm_plots.has(grid_pos):
		return
	
	farm_plots[grid_pos]["watered"] = true
	render_plot(grid_pos)
	if notify:
		spawn_floating_text("💧 Regado!", Vector2(grid_pos.x * 16 + 8, grid_pos.y * 16), Color(0.3, 0.7, 1.0))

func plant_seed(grid_pos: Vector2i, crop_name: String, notify: bool = true) -> void:
	if not farm_plots.has(grid_pos):
		if notify:
			GameManager.post_notification("Você precisa arar o solo antes de plantar!", Color(0.9, 0.6, 0.2))
		return

	var plot = farm_plots[grid_pos]
	if plot["crop"] != null:
		if notify:
			GameManager.post_notification("Já existe uma semente brotando aqui!", Color(0.9, 0.6, 0.2))
		return

	plot["crop"] = crop_name
	plot["stage"] = 0
	plot["max_stage"] = 3
	render_plot(grid_pos)
	if notify:
		var name_pt = "Chirívia" if crop_name == "parsnip" else "Abóbora"
		spawn_floating_text("🌱 %s Plantada!" % name_pt, Vector2(grid_pos.x * 16 + 8, grid_pos.y * 16), Color(0.4, 0.9, 0.4))

func clear_tile(grid_pos: Vector2i) -> void:
	if farm_plots.has(grid_pos):
		farm_plots.erase(grid_pos)
		clear_rendered_plot(grid_pos)
		spawn_floating_text("Canteiro Desfeito", Vector2(grid_pos.x * 16 + 8, grid_pos.y * 16), Color(0.7, 0.7, 0.7))

func harvest_crop(grid_pos: Vector2i) -> void:
	var plot = farm_plots[grid_pos]
	var crop_name = plot["crop"]
	var sell_value = 40 if crop_name == "parsnip" else 95
	var name_pt = "Chirívia Dourada" if crop_name == "parsnip" else "Abóbora de Outono"
	
	GameManager.add_gold(sell_value)
	spawn_floating_text("✨ Colheu %s! (+%d Ouro)" % [name_pt, sell_value], Vector2(grid_pos.x * 16 + 8, grid_pos.y * 16 - 8), Color(1.0, 0.85, 0.2))
	GameManager.post_notification("🌾 Colheita de %s realizada com sucesso!" % name_pt, Color(0.3, 0.9, 0.4))
	
	# Reseta canteiro mantendo arado
	plot["crop"] = null
	plot["stage"] = 0
	render_plot(grid_pos)

func _on_day_advanced(_day: int, _season: String) -> void:
	for grid_pos in farm_plots.keys():
		var plot = farm_plots[grid_pos]
		# Se foi regada ontem, a planta cresce!
		if plot["crop"] != null and plot["watered"]:
			plot["stage"] = min(plot["max_stage"], plot["stage"] + 1)
		
		# A terra seca no novo dia precisando de nova água
		plot["watered"] = false
		render_plot(grid_pos)

# Renderização procedural leve de canteiros e colheitas
func render_plot(grid_pos: Vector2i) -> void:
	clear_rendered_plot(grid_pos)
	var plot = farm_plots[grid_pos]
	var world_pos = Vector2(grid_pos.x * 16 + 8, grid_pos.y * 16 + 8)

	# 1. Sprite do solo (Seco ou Molhado)
	var soil_sprite = Sprite2D.new()
	soil_sprite.name = "Soil_%d_%d" % [grid_pos.x, grid_pos.y]
	soil_sprite.texture = tileset_tex
	soil_sprite.region_enabled = true
	# (0, 16) é terra seca, (16, 16) é terra molhada
	var reg_x = 16 if plot["watered"] else 0
	soil_sprite.region_rect = Rect2(reg_x, 16, 16, 16)
	soil_sprite.position = world_pos
	soil_node.add_child(soil_sprite)

	# 2. Sprite da planta
	if plot["crop"] != null:
		var crop_sprite = Sprite2D.new()
		crop_sprite.name = "Crop_%d_%d" % [grid_pos.x, grid_pos.y]
		crop_sprite.texture = crops_tex
		crop_sprite.region_enabled = true
		
		var crop_row = 0 if plot["crop"] == "parsnip" else 1
		var crop_col = clamp(plot["stage"], 0, 3)
		crop_sprite.region_rect = Rect2(crop_col * 16, crop_row * 16, 16, 16)
		crop_sprite.position = world_pos
		crops_node.add_child(crop_sprite)

func clear_rendered_plot(grid_pos: Vector2i) -> void:
	var s_name = "Soil_%d_%d" % [grid_pos.x, grid_pos.y]
	var c_name = "Crop_%d_%d" % [grid_pos.x, grid_pos.y]
	if soil_node.has_node(s_name):
		soil_node.get_node(s_name).queue_free()
	if crops_node.has_node(c_name):
		crops_node.get_node(c_name).queue_free()

func spawn_floating_text(text: String, pos: Vector2, col: Color) -> void:
	var label = Label.new()
	label.text = text
	label.position = pos - Vector2(30, 10)
	label.modulate = col
	label.scale = Vector2(0.65, 0.65)
	label.z_index = 100
	floating_text_node.add_child(label)
	
	# Animação suave para cima e desvanecimento
	var tween = create_tween()
	tween.parallel().tween_property(label, "position:y", label.position.y - 20.0, 1.2)
	tween.parallel().tween_property(label, "modulate:a", 0.0, 1.2)
	tween.tween_callback(label.queue_free)
