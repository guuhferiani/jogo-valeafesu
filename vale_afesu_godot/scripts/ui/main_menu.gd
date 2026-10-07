extends CanvasLayer

# Vale Afesu 3D - Menu Inicial (Inspirado no Menu HTML5 Original)
# Gerencia telas: Menu Principal, Guia Como Jogar e Configurações

signal game_started

@onready var menu_panel: Control = $MenuContainer
@onready var guide_modal: Control = $GuideModal
@onready var settings_modal: Control = $SettingsModal

@onready var btn_start: Button = $MenuContainer/CenterBox/ButtonsVBox/BtnStart
@onready var btn_continue: Button = $MenuContainer/CenterBox/ButtonsVBox/BtnContinue
@onready var btn_guide: Button = $MenuContainer/CenterBox/ButtonsVBox/BtnGuide
@onready var btn_settings: Button = $MenuContainer/CenterBox/ButtonsVBox/BtnSettings
@onready var btn_quit: Button = $MenuContainer/CenterBox/ButtonsVBox/BtnQuit

@onready var btn_close_guide: Button = $GuideModal/Parchment/BtnCloseGuide
@onready var btn_close_settings: Button = $SettingsModal/Parchment/BtnCloseSettings
@onready var speed_slider: HSlider = $SettingsModal/Parchment/Margin/SettingsVBox/SpeedHBox/HSlider
@onready var speed_val_label: Label = $SettingsModal/Parchment/Margin/SettingsVBox/SpeedHBox/ValLabel

var is_game_active: bool = false

func _ready() -> void:
	if btn_start: btn_start.pressed.connect(_on_start_pressed)
	if btn_continue: btn_continue.pressed.connect(_on_continue_pressed)
	if btn_guide: btn_guide.pressed.connect(_on_guide_pressed)
	if btn_settings: btn_settings.pressed.connect(_on_settings_pressed)
	if btn_quit: btn_quit.pressed.connect(_on_quit_pressed)

	if btn_close_guide: btn_close_guide.pressed.connect(func(): guide_modal.visible = false)
	if btn_close_settings: btn_close_settings.pressed.connect(func(): settings_modal.visible = false)

	if speed_slider:
		speed_slider.value_changed.connect(_on_speed_changed)

	open_main_menu()

func _input(event: InputEvent) -> void:
	if event.is_action_pressed("ui_cancel"): # Tecla ESC
		if guide_modal.visible:
			guide_modal.visible = false
		elif settings_modal.visible:
			settings_modal.visible = false
		elif is_game_active:
			toggle_menu()

func open_main_menu() -> void:
	visible = true
	menu_panel.visible = true
	guide_modal.visible = false
	settings_modal.visible = false
	btn_continue.visible = is_game_active

func close_main_menu() -> void:
	menu_panel.visible = false
	guide_modal.visible = false
	settings_modal.visible = false
	visible = false

func toggle_menu() -> void:
	if visible:
		close_main_menu()
	else:
		open_main_menu()

func _on_start_pressed() -> void:
	is_game_active = true
	close_main_menu()
	game_started.emit()
	GameManager.post_notification("🌾 Bem-vindo(a) ao Vale Afesu 3D! Boa colheita!", Color(1.0, 0.9, 0.4))

func _on_continue_pressed() -> void:
	close_main_menu()

func _on_guide_pressed() -> void:
	guide_modal.visible = true

func _on_settings_pressed() -> void:
	settings_modal.visible = true

func _on_quit_pressed() -> void:
	get_tree().quit()

func _on_speed_changed(value: float) -> void:
	TimeManager.real_seconds_per_ten_mins = value
	if speed_val_label:
		speed_val_label.text = "%.1fs por 10min" % value
