/*
    Ore Bag Keeper NPC (ID: 9900999)
    Allows deposit/withdrawal of Ores and Scrolls from the Ore Bag (unlimited storage in MySQL).
    Uses cosmic.npc_inventory (npc_id INT, item_id INT, quantity INT)
*/

var status = -1;
var oreBagItems = [];
var selectedItem = null;
var npcId = 3003225; // Adjust if different

function start() {
    status = -1;
    action(1, 0, 0);
}

function getConnection() {
    var DriverManager = Java.type("java.sql.DriverManager");
    return DriverManager.getConnection(
        "jdbc:mysql://localhost:3306/cosmic", "root", "hobi2085"
    );
}

// Only include item IDs that are ores or scrolls
function isOreOrScroll(itemId) {
    // Example: ores are 4010000–4010007, scrolls are 2040000–2049999
    if ((itemId >= 4010000 && itemId <= 4010007) || (itemId >= 2040000 && itemId <= 2049999)) {
        return true;
    }
    return false;
}

// Get all items stored in NPC inventory
function getNpcInventory() {
    var items = [];
    try {
        var conn = getConnection();
        var ps = conn.prepareStatement("SELECT item_id, quantity FROM npc_inventory WHERE npc_id = ?");
        ps.setInt(1, npcId);
        var rs = ps.executeQuery();
        while (rs.next()) {
            items.push({
                itemId: rs.getInt("item_id"),
                quantity: rs.getInt("quantity")
            });
        }
        rs.close(); ps.close(); conn.close();
    } catch (e) {
        cm.sendOk("Database error: " + e);
    }
    return items;
}

// Deposit all ores/scrolls from player to NPC inventory
function depositAllOresAndScrolls() {
    var deposited = 0;
    try {
        var invTypes = [1, 2, 3, 4]; // Use correct inventory types for your server
        var conn = getConnection();
        for (var t = 0; t < invTypes.length; t++) {
            var inv = cm.getPlayer().getInventory(invTypes[t]).list();
            for (var i = 0; i < inv.size(); i++) {
                var item = inv.get(i);
                var itemId = item.getItemId();
                var qty = item.getQuantity();
                if (isOreOrScroll(itemId)) {
                    // Add or update in database
                    var ps = conn.prepareStatement(
                        "INSERT INTO npc_inventory (npc_id, item_id, quantity) VALUES (?, ?, ?) " +
                        "ON DUPLICATE KEY UPDATE quantity = quantity + ?"
                    );
                    ps.setInt(1, npcId);
                    ps.setInt(2, itemId);
                    ps.setInt(3, qty);
                    ps.setInt(4, qty);
                    ps.executeUpdate();
                    ps.close();
                    // Remove from player inventory
                    cm.gainItem(itemId, -qty);
                    deposited += qty;
                }
            }
        }
        conn.close();
    } catch (e) {
        cm.sendOk("Database error: " + e);
    }
    return deposited;
}

// Withdraw item from NPC inventory to player
function withdrawItem(itemId, amount) {
    var success = false;
    try {
        var conn = getConnection();
        // Check if enough quantity exists
        var ps = conn.prepareStatement(
            "SELECT quantity FROM npc_inventory WHERE npc_id = ? AND item_id = ?"
        );
        ps.setInt(1, npcId);
        ps.setInt(2, itemId);
        var rs = ps.executeQuery();
        if (rs.next() && rs.getInt("quantity") >= amount) {
            // Deduct from database
            var ps2 = conn.prepareStatement(
                "UPDATE npc_inventory SET quantity = quantity - ? WHERE npc_id = ? AND item_id = ?"
            );
            ps2.setInt(1, amount);
            ps2.setInt(2, npcId);
            ps2.setInt(3, itemId);
            ps2.executeUpdate();
            ps2.close();
            // Add to player inventory
            cm.gainItem(itemId, amount);
            success = true;
        }
        rs.close(); ps.close(); conn.close();
    } catch (e) {
        cm.sendOk("Database error: " + e);
    }
    return success;
}

function action(mode, type, selection) {
    if (mode == -1) {
        cm.dispose(); return;
    }
    if (mode == 0 && status == 0) {
        cm.dispose(); return;
    }
    if (mode == 1) status++;
    else status--;

    if (status == 0) {
        cm.sendSimple(
            "Welcome to the #bOre & Scroll Bag#k!\r\nWhat would you like to do?\r\n" +
            "#L0#Deposit all Ores/Scrolls#l\r\n" +
            "#L1#Withdraw Ores/Scrolls#l\r\n" +
            "#L2#View Ore Bag contents#l\r\n"
        );
    } else if (status == 1) {
        if (selection == 0) {
            var deposited = depositAllOresAndScrolls();
            cm.sendOk("Deposited " + deposited + " ores/scrolls to the Ore Bag!");
            cm.dispose();
        } else if (selection == 1) {
            oreBagItems = getNpcInventory();
            if (oreBagItems.length == 0) {
                cm.sendOk("The Ore Bag is empty!");
                cm.dispose(); return;
            }
            var text = "Select an item to withdraw:\r\n";
            for (var i = 0; i < oreBagItems.length; i++) {
                var it = oreBagItems[i];
                text += "#L" + i + "# #i" + it.itemId + "# #b" + it.quantity + "#k x #t" + it.itemId + "#\r\n";
            }
            cm.sendSimple(text);
        } else if (selection == 2) {
            oreBagItems = getNpcInventory();
            if (oreBagItems.length == 0) {
                cm.sendOk("The Ore Bag is empty!");
            } else {
                var text = "The Ore Bag contains:\r\n";
                for (var i = 0; i < oreBagItems.length; i++) {
                    var it = oreBagItems[i];
                    text += "#i" + it.itemId + "# #b" + it.quantity + "#k x #t" + it.itemId + "#\r\n";
                }
                cm.sendOk(text);
            }
            cm.dispose();
        }
    } else if (status == 2 && oreBagItems.length > 0) {
        selectedItem = oreBagItems[selection];
        cm.sendGetNumber(
            "How many #b#t" + selectedItem.itemId + "##k would you like to withdraw? (Max: " + selectedItem.quantity + ")",
            1, 1, selectedItem.quantity
        );
    } else if (status == 3 && selectedItem != null) {
        var amount = selection;
        var success = withdrawItem(selectedItem.itemId, amount);
        if (success) {
            cm.sendOk("Withdrawn " + amount + " #t" + selectedItem.itemId + "# to your inventory!");
        } else {
            cm.sendOk("Failed to withdraw. Check the Ore Bag quantity or your inventory space.");
        }
        cm.dispose();
    }
}