package client.command.commands.gm1;

import client.Client;
import client.command.Command;
import constants.id.NpcId;

public class StylistCommand extends Command {
    {
        setDescription("Open donor Stylist");
    }

    @Override
    public void execute(Client client, String[] params) {
        client.getAbstractPlayerInteraction().openNpc(NpcId.KIN, "stylist");
    }
}
