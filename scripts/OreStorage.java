// Created by Darnell
package server;

import client.Client;
import client.inventory.InventoryType;
import client.inventory.Item;
import client.inventory.ItemFactory;
import constants.game.GameConstants;
import constants.inventory.ItemConstants;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import provider.Data;
import provider.DataProvider;
import provider.DataProviderFactory;
import provider.DataTool;
import provider.wz.WZFiles;
import tools.DatabaseConnection;
import tools.PacketCreator;
import tools.Pair;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

/**
 * @author Darnell
 */
public class OreStorage {
    private static final Logger log = LoggerFactory.getLogger(OreStorage.class);
    private static final Map<Integer, Integer> trunkGetCache = new HashMap<>();
    private static final Map<Integer, Integer> trunkPutCache = new HashMap<>();

    private final int id;
    private int currentNpcid;
    private int meso;
    private int slots;
    private final Map<InventoryType, List<Item>> typeItems = new HashMap<>();
    private List<Item> items = new LinkedList<>();
    private final Lock lock = new ReentrantLock(true);

    private OreStorage(int id, int slots, int meso) {
        this.id = id;
        this.slots = clamp(slots, 1, ItemConstants.STORAGE_MAX_SLOT_SIZE);
        this.meso = meso;
    }

    private static int clamp(int value, int min, int max) {
        return Math.max(min, Math.min(max, value));
    }

    private static OreStorage create(int id, int world) throws SQLException {
        try (Connection con = DatabaseConnection.getConnection();
             PreparedStatement ps = con.prepareStatement("INSERT INTO orestorages (accountid, world, slots, meso) VALUES (?, ?, 255, 0)")) {
            ps.setInt(1, id);
            ps.setInt(2, world);
            ps.executeUpdate();
        }

        return loadOrCreateFromDB(id, world);
    }

    public static OreStorage loadOrCreateFromDB(int id, int world) {
        OreStorage ret;
        try (Connection con = DatabaseConnection.getConnection();
             PreparedStatement ps = con.prepareStatement("SELECT storageid, slots, meso FROM orestorages WHERE accountid = ? AND world = ?")) {
            ps.setInt(1, id);
            ps.setInt(2, world);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    ret = new OreStorage(rs.getInt("storageid"), rs.getInt("slots"), rs.getInt("meso"));
                    for (Pair<Item, InventoryType> item : ItemFactory.OREBAG.loadItems(ret.id, false)) {
                        ret.items.add(item.getLeft());
                    }
                } else {
                    ret = create(id, world);
                }
            }

            return ret;
        } catch (SQLException ex) { // exceptions leading to deploy null storages found thanks to Jefe
            log.error("SQL error occurred when trying to load storage for accId {}, world {}", id, GameConstants.WORLD_NAMES[world], ex);
            throw new RuntimeException(ex);
        }
    }

    public int getSlots() {
        return slots;
    }

    public boolean canGainSlots(int slots) {
        slots += this.slots;
        return slots <= ItemConstants.STORAGE_MAX_SLOT_SIZE;
    }

    public boolean gainSlots(int slots) {
        lock.lock();
        try {
            if (canGainSlots(slots)) {
                this.slots = clamp(this.slots + slots, 1, ItemConstants.STORAGE_MAX_SLOT_SIZE); // clamping here
                return true;
            }

            return false;
        } finally {
            lock.unlock();
        }
    }

    public void saveToDB(Connection con) {
        try {
            try (PreparedStatement ps = con.prepareStatement("UPDATE orestorages SET slots = ?, meso = ? WHERE storageid = ?")) {
                ps.setInt(1, clamp(slots, 1, ItemConstants.STORAGE_MAX_SLOT_SIZE));
                ps.setInt(2, meso);
                ps.setInt(3, id);
                ps.executeUpdate();
            }
            List<Pair<Item, InventoryType>> itemsWithType = new ArrayList<>();

            List<Item> list = getItems();
            for (Item item : list) {
                itemsWithType.add(new Pair<>(item, item.getInventoryType()));
            }

            ItemFactory.OREBAG.saveItems(itemsWithType, id, con);
        } catch (SQLException ex) {
            ex.printStackTrace();
        }
    }

    public Item getItem(int slot) {
        lock.lock();
        try {
            return items.get(slot);
        } finally {
            lock.unlock();
        }
    }

    public boolean takeOut(Item item) {
        lock.lock();
        try {
            boolean ret = items.remove(item);

            InventoryType type = item.getInventoryType();
            typeItems.put(type, new ArrayList<>(filterItems(type)));

            try (Connection con = DatabaseConnection.getConnection();)
            {
                saveToDB(con);
            } catch (SQLException ex) {
                ex.printStackTrace();
            }

            return ret;
        } finally {
            lock.unlock();
        }
    }

    public boolean store(Item item) {
        lock.lock();
        try {
            if (isFull()) { // thanks Optimist for noticing unrestricted amount of insertions here
                return false;
            }

            items.add(item);

            InventoryType type = item.getInventoryType();
            typeItems.put(type, new ArrayList<>(filterItems(type)));

            try (Connection con = DatabaseConnection.getConnection();)
            {
                saveToDB(con);
            } catch (SQLException ex) {
                ex.printStackTrace();
            }

            return true;
        } finally {
            lock.unlock();
        }
    }

    public List<Item> getItems() {
        lock.lock();
        try {
            return Collections.unmodifiableList(items);
        } finally {
            lock.unlock();
        }
    }

    private List<Item> filterItems(InventoryType type) {
        List<Item> storageItems = getItems();
        List<Item> ret = new LinkedList<>();

        for (Item item : storageItems) {
            if (item.getInventoryType() == type) {
                ret.add(item);
            }
        }
        return ret;
    }

    public byte getSlot(InventoryType type, int slot) {
        lock.lock();
        try {
            byte ret = 0;
            List<Item> storageItems = getItems();
            for (Item item : storageItems) {
                if (item == typeItems.get(type).get(slot)) {
                    return ret;
                }
                ret++;
            }
            return -1;
        } finally {
            lock.unlock();
        }
    }

    public void sendStorage(Client c, int npcId) {
        if (c.getPlayer().getLevel() < 15) {
            c.getPlayer().dropMessage(1, "You may only use the orebag once you have reached level 15.");
            c.sendPacket(PacketCreator.enableActions());
            return;
        }

        lock.lock();
        try {
            items.sort((o1, o2) -> {
                if (o1.getInventoryType().getType() < o2.getInventoryType().getType()) {
                    return -1;
                } else if (o1.getInventoryType() == o2.getInventoryType()) {
                    return 0;
                }
                return 1;
            });

            List<Item> storageItems = getItems();
            for (InventoryType type : InventoryType.values()) {
                typeItems.put(type, new ArrayList<>(storageItems));
            }

            currentNpcid = npcId;
            c.sendPacket(PacketCreator.getStorage(npcId, (byte)slots, storageItems, meso));
        } finally {
            lock.unlock();
        }
    }

    public void sendStored(Client c, InventoryType type) {
        lock.lock();
        try {
            c.sendPacket(PacketCreator.storeStorage((byte)slots, type, typeItems.get(type)));
        } finally {
            lock.unlock();
        }
    }

    public void sendTakenOut(Client c, InventoryType type) {
        lock.lock();
        try {
            c.sendPacket(PacketCreator.takeOutStorage((byte)slots, type, typeItems.get(type)));
        } finally {
            lock.unlock();
        }
    }

    public void arrangeItems(Client c) {
        lock.lock();
        try {
            StorageInventory msi = new StorageInventory(c, items);
            msi.mergeItems();
            items = msi.sortItems();

            for (InventoryType type : InventoryType.values()) {
                typeItems.put(type, new ArrayList<>(items));
            }

            c.sendPacket(PacketCreator.arrangeStorage((byte)slots, items));
        } finally {
            lock.unlock();
        }
    }

    public int getMeso() {
        return meso;
    }

    public void setMeso(int meso) {
        if (meso < 0) {
            throw new RuntimeException();
        }
        this.meso = meso;
    }

    public void sendMeso(Client c) {
        c.sendPacket(PacketCreator.mesoStorage((byte)slots, meso));
    }

    public int getStoreFee() {  // thanks to GabrielSin
        int npcId = currentNpcid;
        Integer fee = trunkPutCache.get(npcId);
        if (fee == null) {
            fee = 100;

            DataProvider npc = DataProviderFactory.getDataProvider(WZFiles.NPC);
            Data npcData = npc.getData(npcId + ".img");
            if (npcData != null) {
                fee = DataTool.getIntConvert("info/trunkPut", npcData, 100);
            }

            trunkPutCache.put(npcId, fee);
        }

        return fee;
    }

    public int getTakeOutFee() {
        int npcId = currentNpcid;
        Integer fee = trunkGetCache.get(npcId);
        if (fee == null) {
            fee = 0;

            DataProvider npc = DataProviderFactory.getDataProvider(WZFiles.NPC);
            Data npcData = npc.getData(npcId + ".img");
            if (npcData != null) {
                fee = DataTool.getIntConvert("info/trunkGet", npcData, 0);
            }

            trunkGetCache.put(npcId, fee);
        }

        return fee;
    }

    public boolean isFull() {
        lock.lock();
        try {
            return items.size() >= slots;
        } finally {
            lock.unlock();
        }
    }

    public void close() {
        lock.lock();
        try {
            typeItems.clear();
        } finally {
            lock.unlock();
        }
    }

}