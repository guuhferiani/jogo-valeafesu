extends Node

# Vale Afesu - Time Manager (Singleton / Autoload)
# Ciclo de Tempo, Relógio, Estações e Iluminação Dia/Noite

signal time_tick(hour, minute)
signal day_advanced(day, season)
signal ambient_light_changed(color)

var season: String = "Primavera"
var day: int = 1
var hour: int = 6
var minute: int = 0

# Velocidade: a cada 'real_seconds_per_ten_mins' segundos reais, passam 10 minutos no jogo
var real_seconds_per_ten_mins: float = 2.5
var timer_accumulator: float = 0.0
var is_time_paused: bool = false

func _ready() -> void:
	print("⏰ [Vale Afesu] TimeManager iniciado: Dia 1, Primavera, 06:00")

func _process(delta: float) -> void:
	if is_time_paused:
		return
	
	timer_accumulator += delta
	if timer_accumulator >= real_seconds_per_ten_mins:
		timer_accumulator = 0.0
		advance_minutes(10)

func advance_minutes(mins: int) -> void:
	minute += mins
	if minute >= 60:
		minute = 0
		hour += 1
		if hour >= 24:
			hour = 0
	
	time_tick.emit(hour, minute)
	update_ambient_light()
	
	# Força o jogador a desmaiar/dormir se chegar às 02:00 da madrugada
	if hour == 2 and minute == 0:
		GameManager.post_notification("🌙 Muito tarde! Você adormeceu de cansaço...", Color(0.8, 0.4, 0.9))
		advance_to_next_day()

func advance_to_next_day() -> void:
	day += 1
	hour = 6
	minute = 0
	
	if day > 28:
		day = 1
		# Troca de estação
		if season == "Primavera": season = "Verão"
		elif season == "Verão": season = "Outono"
		elif season == "Outono": season = "Inverno"
		else: season = "Primavera"
	
	# Processa vendas noturnas e recupera energia
	GameManager.process_night_shipments()
	day_advanced.emit(day, season)
	time_tick.emit(hour, minute)
	update_ambient_light()
	GameManager.post_notification("☀️ Novo Dia! Bem-vindo(a) ao Dia %d da %s!" % [day, season], Color(1.0, 0.9, 0.4))

func update_ambient_light() -> void:
	var light_color = get_current_ambient_color()
	ambient_light_changed.emit(light_color)

func get_current_ambient_color() -> Color:
	# Retorna tom para o CanvasModulate simulando ciclo solar
	var time_val = hour + (minute / 60.0)
	
	if time_val >= 6.0 and time_val < 8.0:
		# Alvorecer suave (laranja dourado matutino)
		var t = (time_val - 6.0) / 2.0
		return Color(0.85, 0.75, 0.65).lerp(Color(1.0, 1.0, 1.0), t)
	elif time_val >= 8.0 and time_val < 17.0:
		# Pleno dia (luz clara pura)
		return Color(1.0, 1.0, 1.0)
	elif time_val >= 17.0 and time_val < 19.5:
		# Entardecer / Pôr do sol (âmbar acolhedor)
		var t = (time_val - 17.0) / 2.5
		return Color(1.0, 1.0, 1.0).lerp(Color(0.95, 0.65, 0.45), t)
	elif time_val >= 19.5 and time_val < 21.0:
		# Crepúsculo para noite
		var t = (time_val - 19.5) / 1.5
		return Color(0.95, 0.65, 0.45).lerp(Color(0.35, 0.35, 0.55), t)
	else:
		# Noite estrelada profunda
		return Color(0.30, 0.30, 0.50)

func get_formatted_time() -> String:
	return "%02d:%02d" % [hour, minute]
