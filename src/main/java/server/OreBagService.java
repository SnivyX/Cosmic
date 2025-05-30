package server;

import client.Client;
import client.Character;
import client.inventory.Item;
import client.inventory.OreBagInventory;
import client.inventory.InventoryType;
import client.inventory.Inventory;
import client.inventory.manipulator.InventoryManipulator;

import java.util.ArrayList;
import java.util.List;

public class OreBagService {

    public static List<Item> getOreBagItems(Character chr) {
        return chr.getOreBag().getAllItems();
    }

    // Deposit all ores/scrolls from player's inventory to their Ore Bag
    public static int depositAllOresAndScrolls(Client c) {
        Character chr = c.getPlayer();
        int count = 0;
        for (InventoryType type : InventoryType.values()) {
            Inventory inv = chr.getInventory(type);
            List<Item> toDeposit = new ArrayList<>();
            for (Item item : inv.list()) {
                if (chr.getOreBag().deposit(item)) {
                    toDeposit.add(item);
                    count++;
                }
            }
            // Remove the items from the player's inventory
            for (Item item : toDeposit) {
                InventoryManipulator.removeById(c, type, item.getItemId(), item.getQuantity(), true, false);
            }
        }
        return count;
    }

    // Withdraw specific item from Ore Bag to player's inventory
    public static boolean withdrawItem(Client c, int itemId, short quantity) {
        Character chr = c.getPlayer();
        OreBagInventory bag = chr.getOreBag();
        Item stored = bag.getItem(itemId);
        if (stored == null || stored.getQuantity() < quantity) return false;
        boolean canHold = InventoryManipulator.checkSpace(c, itemId, quantity, "");
        if (!canHold) return false;
        bag.withdraw(itemId, quantity);
        InventoryManipulator.addById(c, itemId, quantity);
        return true;
    }
}