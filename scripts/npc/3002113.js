/*
    Mesos for items, and vice versa.
    By Kars
*/

var status = -1;
var item = Array(4001253,4001252,4000174,4036313); // Item's go here
var mesos = Array(1000000000,500000000,250000000,100000000); // Mesos here
var choice;

function start() {
    action(1, 0, 0);
}

function action(mode, type, selection) {
    if (mode != 1) {
        cm.dispose();
        return;
    } else
        status++;
    if (status == 0) {
        cm.sendSimple("Hello there, I trade back and forth items for Mesos what would you like to do?\r\n#b#L0#Exchange mesos for items#l\r\n#L1#Exchange items for mesos#l");
    } else if (status == 1) {
        if (selection == 0) {
            choice = 1;
            var text = "Mesos for items?";
            for (var i = 0; i < item.length; i++)
                text += "\r\n#L" + i + "##r" + mesos[i] + " Mesos#k for #b#v" + item[i] + "# #z" + item[i] + "##k#l";
            cm.sendSimple(text);
        } else {
            choice = 0;
            var text = "Items for mesos?";
            for (var i = 0; i < item.length; i++)
                text += "\r\n#L" + i + "##r#v" + item[i] + "# #z" + item[i] + "##k for #b" + mesos[i] + " Mesos#k#l";
             cm.sendSimple(text);
        }
    } else if (status == 2) {
        if (choice == 1) {
            if (cm.getMeso() > mesos[selection]){
                cm.gainMeso(-mesos[selection]);
                cm.gainItem(item[selection],1);
                cm.sendOk("You have traded #r" + mesos[selection] + " Mesos#k for #b#z" + item[selection] + "##k");
				cm.dispose();
			} else
                cm.sendOk("You need at least #r" + mesos[selection] + " Mesos#k for #b#z" + item[selection] + "##k!");
				cm.dispose();
        } else {
            if (cm.haveItem(item[selection],1)) {
				if (cm.getMeso()+ mesos[selection] >= 2100000000) {
					cm.sendOk("You have too much money!\r\n#b" + cm.getMeso() + "#k + #r" + mesos[selection] + "#k = Above the meso limit of \r\n#d2100000000#k!");
					cm.dispose();
				} else {
					cm.gainItem(item[selection],-1);
					cm.gainMeso(mesos[selection]);
					cm.sendOk("You have traded #r#z" + item[selection] + "##k for #b" + mesos[selection] + " Mesos#k!");
					cm.dispose();
				}
			} else  {
                cm.sendOk("You need #r#z" + item[selection] + "##k for #b" + mesos[selection] + " Mesos#k!");
				cm.dispose();
			}
        }
    }
}