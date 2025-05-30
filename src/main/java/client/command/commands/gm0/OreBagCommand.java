package client.command.commands.gm0;

import client.Client;
import client.command.Command;

public class OreBagCommand extends Command {
    {
        setDescription("@orebag - Access your Ore Bag.");
    }

    @Override
    public void execute(Client c, String[] params) {
        c.getPlayer().getAbstractPlayerInteraction().npcTalk(3003225, "orebag");
    }
}