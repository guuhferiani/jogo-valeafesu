extends CanvasLayer

# Vale Afesu - Interface de Usuário (HUD)
# Relógio, Calendário, Barra de Energia, Ouro, Hotbar e Notificações

@onready var clock_label: Label = $TopBar/ClockPanel/ClockLabel
@onready var gold_label: Label = $TopBar/GoldPanel/GoldLabel
@onready var energy_bar: ProgressBar = $EnergyPanel/ProgressBar
@onready var energy_label: Label = $EnergyPanel/EnergyLabel
@onready var active_tool_label: Label = $HotbarContainer/ActiveToolLabel
@onready var hotbar_slots: HBoxContainer = $HotbarContainer/Slots
@onready var notification_label: Label = $NotificationPanel/NotificationLabel
@onready var sleep_button: Button = $TopBar/SleepButton
@onready var menu_button: Button = $TopBar/MenuButton

var notify_timer: float = 0.0

func _ready() -> void:
	# Conexão aos sinais do GameManager e TimeManager
	TimeManager.time_tick.connect(_on_time_tick)
	TimeManager.day_advanced.connect(_on_day_advanced)
	GameManager.energy_changed.connect(_on_energy_changed)
	GameManager.gold_changed.connect(_on_gold_changed)
	GameManager.tool_selected.connect(_on_tool_selected)
	GameManager.notification_posted.connect(_on_notification_posted)
	
	if sleep_button:
		sleep_button.pressed.connect(_on_sleep_button_pressed)
	if menu_button:
		menu_button.pressed.connect(func():
			var menu = get_tree().root.find_child("MainMenu", true, false)
			if menu:
				menu.toggle_menu()
		)
	
	setup_hotbar()
	update_clock_display()
	_on_energy_changed(GameManager.energy, GameManager.max_energy)
	_on_gold_changed(GameManager.gold)
	_on_tool_selected(GameManager.active_tool_index, GameManager.get_active_tool())

func _process(delta: float) -> void:
	if notify_timer > 0.0:
		notify_timer -= delta
		if notify_timer <= 0.0:
			$NotificationPanel.visible = false

func setup_hotbar() -> void:
	# Cria ou estiliza os slots de ferramentas 1 a 6
	for child in hotbar_slots.get_children():
		child.queue_free()
	
	for i in range(GameManager.tools.size()):
		var tool_data = GameManager.tools[i]
		var btn = Button.new()
		btn.text = "%d: %s" % [i + 1, tool_data["name"]]
		btn.custom_minimum_size = Vector2(70, 26)
		btn.focus_mode = Control.FOCUS_NONE
		btn.pressed.connect(func(): GameManager.select_tool(i))
		hotbar_slots.add_child(btn)

func update_clock_display() -> void:
	clock_label.text = "🌱 %s • Dia %d • %s" % [TimeManager.season, TimeManager.day, TimeManager.get_formatted_time()]

func _on_time_tick(_hour: int, _minute: int) -> void:
	update_clock_display()

func _on_day_advanced(_day: int, _season: String) -> void:
	update_clock_display()

func _on_energy_changed(curr_energy: float, max_energy: float) -> void:
	energy_bar.max_value = max_energy
	energy_bar.value = curr_energy
	energy_label.text = "⚡ %d/%d" % [int(curr_energy), int(max_energy)]
	
	# Cor da barra muda se estiver exausto
	if curr_energy < 25.0:
		energy_bar.modulate = Color(0.9, 0.2, 0.2)
	else:
		energy_bar.modulate = Color(0.2, 0.8, 0.3)

func _on_gold_changed(curr_gold: int) -> void:
	gold_label.text = "🪙 %d G" % curr_gold

func _on_tool_selected(index: int, tool_data: Dictionary) -> void:
	active_tool_label.text = "Ferramenta Ativa [%d]: %s" % [index + 1, tool_data["name"]]
	# Destaca visualmente o botão selecionado
	for i in range(hotbar_slots.get_child_count()):
		var slot_btn = hotbar_slots.get_child(i) as Button
		if slot_btn:
			slot_btn.modulate = Color(1.3, 1.2, 0.6) if i == index else Color(1.0, 1.0, 1.0)

func _on_notification_posted(msg: String, col: Color) -> void:
	notification_label.text = msg
	notification_label.modulate = col
	$NotificationPanel.visible = true
	notify_timer = 3.5

func _on_sleep_button_pressed() -> void:
	GameManager.post_notification("🛏️ Indo descansar na cama macia...", Color(0.8, 0.7, 1.0))
	TimeManager.advance_to_next_day()
