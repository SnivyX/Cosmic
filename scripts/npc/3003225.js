/*
    Ore Bag Keeper NPC (ID: 3003225)
    Allows deposit/withdrawal of Ores and Scrolls from the Ore Bag (unlimited storage in MySQL).
    Uses cosmic.npc_inventory (npc_id INT, character_id INT, item_id INT, quantity INT)
*/

var status = -1;
var oreBagItems = [];
var selectedItem = null;
var npcId = 3003225; // NPC ID

function start() {
    status = -1;
    action(1, 0, 0);
}

function getConnection() {
    try {
        var DriverManager = Java.type("java.sql.DriverManager");
        return DriverManager.getConnection(
            "jdbc:mysql://localhost:3306/cosmic?useSSL=false&serverTimezone=UTC", "root", "hobi2085"
        );
    } catch (e) {
        cm.getPlayer().dropMessage(6, "Database connection error: " + e);
        return null;
    }
}

// Check if database table exists, create if it doesn't - with character_id added
function checkTable() {
    var conn = null;
    try {
        conn = getConnection();
        if (conn == null) return false;

        var stmt = conn.createStatement();

        // Check if the old table exists
        var rs = stmt.executeQuery("SHOW TABLES LIKE 'npc_inventory'");
        var oldTableExists = rs.next();
        rs.close();

        if (oldTableExists) {
            // Check if character_id column exists
            rs = stmt.executeQuery("SHOW COLUMNS FROM npc_inventory LIKE 'character_id'");
            var hasCharacterIdColumn = rs.next();
            rs.close();

            if (!hasCharacterIdColumn) {
                // Need to migrate old table - this will lose ownership information
                cm.getPlayer().dropMessage(6, "Upgrading table schema...");

                // Create the new table with character_id
                stmt.executeUpdate(
                    "CREATE TABLE npc_inventory_new (" +
                    "`npc_id` INT NOT NULL, " +
                    "`character_id` INT NOT NULL, " +
                    "`item_id` INT NOT NULL, " +
                    "`quantity` INT NOT NULL DEFAULT 0, " +
                    "PRIMARY KEY (`npc_id`, `character_id`, `item_id`)" +
                    ") ENGINE=InnoDB DEFAULT CHARSET=utf8;"
                );

                // Copy data, assigning all existing items to character ID 0 (unclaimed)
                stmt.executeUpdate(
                    "INSERT INTO npc_inventory_new (npc_id, character_id, item_id, quantity) " +
                    "SELECT npc_id, 0, item_id, quantity FROM npc_inventory"
                );

                // Drop old table
                stmt.executeUpdate("DROP TABLE npc_inventory");

                // Rename new table
                stmt.executeUpdate("RENAME TABLE npc_inventory_new TO npc_inventory");

                cm.getPlayer().dropMessage(6, "Table schema upgraded successfully");
            }
        } else {
            // Create the table from scratch with character_id
            stmt.executeUpdate(
                "CREATE TABLE `npc_inventory` (" +
                "`npc_id` INT NOT NULL, " +
                "`character_id` INT NOT NULL, " +
                "`item_id` INT NOT NULL, " +
                "`quantity` INT NOT NULL DEFAULT 0, " +
                "PRIMARY KEY (`npc_id`, `character_id`, `item_id`)" +
                ") ENGINE=InnoDB DEFAULT CHARSET=utf8;"
            );
        }

        stmt.close();
        return true;
    } catch (e) {
        cm.getPlayer().dropMessage(6, "Table check error: " + e);
        return false;
    } finally {
        if (conn != null) {
            try { conn.close(); } catch (e) {}
        }
    }
}

// Only include specific item IDs that are ores or scrolls
function isOreOrScroll(itemId) {
    // Ore IDs (more specific range)
    var oreIDs = [
        // Mineral ores (4010000-4010007)
        4010000, 4010001, 4010002, 4010003, 4010004, 4010005, 4010006, 4010007,
        // Jewel ores (4020000-4020008)
        4020000, 4020001, 4020002, 4020003, 4020004, 4020005, 4020006, 4020007, 4020008,
        // Crafting materials (4021000-4021009)
        4021000, 4021001, 4021002, 4021003, 4021004, 4021005, 4021006, 4021007, 4021008, 4021009,
        // Common ores in v83
        4004000, 4004001, 4004002, 4004003, 4004004 // Processed ores like Power Crystal, etc.
    ];

    // Check if it's in our ore list
    for (var i = 0; i < oreIDs.length; i++) {
        if (itemId === oreIDs[i]) {
            return true;
        }
    }

    // Check if it's a scroll (2040000-2049999)
    if (itemId >= 2040000 && itemId <= 2049999) {
        return true;
    }

    return false;
}

// Get player's character ID
function getCharacterId() {
    return cm.getChar().getId();
}

// Get all items stored in NPC inventory for this character
function getNpcInventory() {
    var items = [];
    var conn = null;
    var ps = null;
    var rs = null;

    try {
        conn = getConnection();
        if (conn == null) return items;

        var characterId = getCharacterId();

        ps = conn.prepareStatement(
            "SELECT item_id, quantity FROM npc_inventory " +
            "WHERE npc_id = ? AND character_id = ?"
        );
        ps.setInt(1, npcId);
        ps.setInt(2, characterId);
        rs = ps.executeQuery();

        while (rs.next()) {
            items.push({
                itemId: rs.getInt("item_id"),
                quantity: rs.getInt("quantity")
            });
        }
    } catch (e) {
        cm.getPlayer().dropMessage(6, "Error retrieving items: " + e);
    } finally {
        if (rs != null) try { rs.close(); } catch (e) {}
        if (ps != null) try { ps.close(); } catch (e) {}
        if (conn != null) try { conn.close(); } catch (e) {}
    }

    return items;
}

// Deposit all ores/scrolls from player to NPC inventory
function depositAllOresAndScrolls() {
    var deposited = 0;
    var conn = null;
    var itemsToDeposit = []; // Store items to deposit

    try {
        // Import the InventoryType enum
        var InventoryType = Java.type("client.inventory.InventoryType");

        // Use the proper enum values instead of raw integers
        var invTypes = [InventoryType.USE, InventoryType.ETC]; // USE for scrolls, ETC for ores

        // Step 1: First collect all items to be deposited
        for (var t = 0; t < invTypes.length; t++) {
            var inv = cm.getChar().getInventory(invTypes[t]);
            if (inv == null) continue;

            var itemCollection = inv.list();
            if (itemCollection == null) continue;

            // Convert collection to Java Iterator and iterate
            var iterator = itemCollection.iterator();

            while (iterator.hasNext()) {
                var item = iterator.next();
                if (item == null) continue;

                var itemId = item.getItemId();
                var qty = item.getQuantity();

                if (isOreOrScroll(itemId)) {
                    // Add to our deposit list instead of removing immediately
                    itemsToDeposit.push({
                        itemId: itemId,
                        quantity: qty
                    });
                }
            }
        }

        // If nothing to deposit, return early
        if (itemsToDeposit.length === 0) {
            return 0;
        }

        // Step 2: Now connect to database and deposit items
        conn = getConnection();
        if (conn == null) return 0;

        conn.setAutoCommit(false); // Start transaction

        var characterId = getCharacterId();

        // Process all items to deposit
        for (var i = 0; i < itemsToDeposit.length; i++) {
            var item = itemsToDeposit[i];
            var ps = null;

            try {
                // Add or update in database - now with character_id
                ps = conn.prepareStatement(
                    "INSERT INTO npc_inventory (npc_id, character_id, item_id, quantity) VALUES (?, ?, ?, ?) " +
                    "ON DUPLICATE KEY UPDATE quantity = quantity + ?"
                );
                ps.setInt(1, npcId);
                ps.setInt(2, characterId);
                ps.setInt(3, item.itemId);
                ps.setInt(4, item.quantity);
                ps.setInt(5, item.quantity);
                ps.executeUpdate();

                // Now it's safe to remove from inventory
                cm.gainItem(item.itemId, -item.quantity);
                deposited += item.quantity;
            } catch (e) {
                cm.getPlayer().dropMessage(6, "Error with item " + item.itemId + ": " + e);
                throw e; // Re-throw to trigger rollback
            } finally {
                if (ps != null) try { ps.close(); } catch (e) {}
            }
        }

        conn.commit(); // Commit transaction
    } catch (e) {
        if (conn != null) {
            try { conn.rollback(); } catch (e2) {} // Rollback on error
        }
        cm.getPlayer().dropMessage(6, "Error depositing items: " + e);
    } finally {
        if (conn != null) {
            try { conn.setAutoCommit(true); } catch (e) {}
            try { conn.close(); } catch (e) {}
        }
    }

    return deposited;
}

// Withdraw item from NPC inventory to player
function withdrawItem(itemId, amount) {
    var success = false;
    var conn = null;
    var ps = null;
    var rs = null;
    var ps2 = null;

    try {
        conn = getConnection();
        if (conn == null) return false;

        var characterId = getCharacterId();

        conn.setAutoCommit(false); // Start transaction

        // Check if enough quantity exists - now with character_id
        ps = conn.prepareStatement(
            "SELECT quantity FROM npc_inventory WHERE npc_id = ? AND character_id = ? AND item_id = ? FOR UPDATE"
        );
        ps.setInt(1, npcId);
        ps.setInt(2, characterId);
        ps.setInt(3, itemId);
        rs = ps.executeQuery();

        if (rs.next() && rs.getInt("quantity") >= amount) {
            // Deduct from database - now with character_id
            ps2 = conn.prepareStatement(
                "UPDATE npc_inventory SET quantity = quantity - ? WHERE npc_id = ? AND character_id = ? AND item_id = ?"
            );
            ps2.setInt(1, amount);
            ps2.setInt(2, npcId);
            ps2.setInt(3, characterId);
            ps2.setInt(4, itemId);
            ps2.executeUpdate();

            // Clean up zero quantity entries
            var ps3 = conn.prepareStatement(
                "DELETE FROM npc_inventory WHERE quantity <= 0"
            );
            ps3.executeUpdate();
            ps3.close();

            // Add to player inventory
            if (cm.canHold(itemId, amount)) {
                cm.gainItem(itemId, amount);
                success = true;
                conn.commit(); // Commit only if successful
            } else {
                conn.rollback(); // Roll back if can't hold
                cm.sendOk("You don't have enough inventory space.");
            }
        } else {
            cm.sendOk("Not enough items in storage.");
            conn.rollback(); // Roll back if not enough items
        }
    } catch (e) {
        if (conn != null) {
            try { conn.rollback(); } catch (e2) {} // Rollback on error
        }
        cm.getPlayer().dropMessage(6, "Error withdrawing items: " + e);
    } finally {
        if (rs != null) try { rs.close(); } catch (e) {}
        if (ps != null) try { ps.close(); } catch (e) {}
        if (ps2 != null) try { ps2.close(); } catch (e) {}
        if (conn != null) {
            try { conn.setAutoCommit(true); } catch (e) {}
            try { conn.close(); } catch (e) {}
        }
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

    try {
        // First check if the table exists
        if (status == 0) {
            if (!checkTable()) {
                cm.sendOk("System error: Could not connect to database or create required table. Please contact an administrator.");
                cm.dispose();
                return;
            }

            cm.sendSimple(
                "Welcome to the #bOre & Scroll Bag#k!\r\n" +
                "Your personal storage for ores and scrolls.\r\n\r\n" +
                "What would you like to do?\r\n" +
                "#L0#Deposit all Ores/Scrolls#l\r\n" +
                "#L1#Withdraw Ores/Scrolls#l\r\n" +
                "#L2#View Ore Bag contents#l\r\n"
            );
        } else if (status == 1) {
            if (selection == 0) {
                var deposited = depositAllOresAndScrolls();
                cm.sendOk("Deposited " + deposited + " ores/scrolls to your Ore Bag!");
                cm.dispose();
            } else if (selection == 1) {
                oreBagItems = getNpcInventory();
                if (oreBagItems.length == 0) {
                    cm.sendOk("Your Ore Bag is empty!");
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
                    cm.sendOk("Your Ore Bag is empty!");
                } else {
                    var text = "Your Ore Bag contains:\r\n";
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
                cm.sendOk("Failed to withdraw. Check your inventory space.");
            }
            cm.dispose();
        }
    } catch (e) {
        cm.getPlayer().dropMessage(6, "Error in NPC: " + e);
        cm.dispose();
    }
}