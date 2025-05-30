package client.inventory;

import java.io.Serializable;
import java.util.*;
import client.Client;
import server.ItemInformationProvider;

public class OreBagInventory implements Serializable {
    private static final long serialVersionUID = 1L;
    private final Map<Integer, Item> items = new HashMap<>(); // ItemId -> Item
    private final int characterId; // Use character id for persistence

    public OreBagInventory(int characterId) {
        this.characterId = characterId;
    }

    private boolean isOreOrScroll(int itemId) {
        // Example logic: adjust per your actual item ID categories
        ItemInformationProvider ii = ItemInformationProvider.getInstance();
        String name = ii.getName(itemId);
        if (name == null) return false;
        name = name.toLowerCase();
        return name.contains("ore") || name.contains("scroll");
    }

    public boolean deposit(Item item) {
        if (!isOreOrScroll(item.getItemId())) return false;
        items.merge(item.getItemId(), item.copy(), (existing, incoming) -> {
            existing.setQuantity((short) (existing.getQuantity() + incoming.getQuantity()));
            return existing;
        });
        return true;
    }

    public boolean withdraw(int itemId, short quantity) {
        Item stored = items.get(itemId);
        if (stored == null || stored.getQuantity() < quantity) return false;
        stored.setQuantity((short)(stored.getQuantity() - quantity));
        if (stored.getQuantity() <= 0)
            items.remove(itemId);
        return true;
    }

    public List<Item> getAllItems() {
        List<Item> result = new ArrayList<>();
        for (Item item : items.values()) {
            result.add(item.copy());
        }
        return result;
    }

    public Item getItem(int itemId) {
        Item item = items.get(itemId);
        return (item == null) ? null : item.copy();
    }

    public void clear() {
        items.clear();
    }
}