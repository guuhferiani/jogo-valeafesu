extends Node

# Vale Afesu - Game Manager (Singleton / Autoload)
# Gerencia estado global: inventário, ouro, energia, ferramentas e vendas

signal energy_changed(current_energy, max_energy)
signal gold_changed(current_gold)
signal tool_selected(index, tool_data)
signal notification_posted(message, color)
signal inventory_changed

var player_name: String = "Fazendeiro(a)"
var farm_name: String = "Vale Afesu"

var max_energy: float = 100.0
var energy: float = 100.0:
	set(value):
		energy = clamp(value, 0.0, max_energy)
		energy_changed.emit(energy, max_energy)

var gold: int = 500:
	set(value):
		gold = max(0, value)
		gold_changed.emit(gold)

# Ferramentas disponíveis na Hotbar
var tools: Array[Dictionary] = [
	{ "id": "hoe", "name": "Enxada", "type": "tool", "cost": 2.0, "icon_idx": 0 },
	{ "id": "can", "name": "Regador", "type": "tool", "cost": 1.5, "icon_idx": 1 },
	{ "id": "seeds_parsnip", "name": "Sem. Chirívia", "type": "seed", "crop": "parsnip", "count": 15, "cost": 1.0, "icon_idx": 2 },
	{ "id": "seeds_pumpkin", "name": "Sem. Abóbora", "type": "seed", "crop": "pumpkin", "count": 5, "cost": 1.0, "icon_idx": 2 },
	{ "id": "axe", "name": "Machado", "type": "tool", "cost": 3.0, "icon_idx": 0 },
	{ "id": "pickaxe", "name": "Picareta", "type": "tool", "cost": 3.0, "icon_idx": 0 }
]

var active_tool_index: int = 0
var shipping_bin: Array[Dictionary] = []
var items_shipped_today: int = 0

func _ready() -> void:
	print("🌾 [Vale Afesu] GameManager inicializado com sucesso!")

func select_tool(index: int) -> void:
	if index >= 0 and index < tools.size():
		active_tool_index = index
		tool_selected.emit(active_tool_index, tools[active_tool_index])

func get_active_tool() -> Dictionary:
	return tools[active_tool_index]

func use_energy(amount: float) -> bool:
	if energy <= 0:
		post_notification("⚠️ Exausto(a)! Precisa descansar ou comer para recuperar energia!", Color(0.95, 0.3, 0.3))
		return false
	energy -= amount
	return true

func add_gold(amount: int) -> void:
	gold += amount

func ship_item(item_name: String, price: int, quantity: int = 1) -> void:
	shipping_bin.append({
		"name": item_name,
		"price": price,
		"quantity": quantity
	})
	items_shipped_today += quantity
	post_notification("📦 %dx %s colocado(s) no Caixote de Vendas!" % [quantity, item_name], Color(0.95, 0.8, 0.2))

func process_night_shipments() -> int:
	var total_earnings = 0
	for item in shipping_bin:
		total_earnings += item["price"] * item["quantity"]
	
	if total_earnings > 0:
		add_gold(total_earnings)
		post_notification("💰 Vendas de ontem renderam +%d Ouros!" % total_earnings, Color(0.2, 0.9, 0.3))
	
	shipping_bin.clear()
	items_shipped_today = 0
	# Recupera energia ao dormir
	energy = max_energy
	return total_earnings

func post_notification(msg: String, col: Color = Color.WHITE) -> void:
	notification_posted.emit(msg, col)
	print("📢 ", msg)
