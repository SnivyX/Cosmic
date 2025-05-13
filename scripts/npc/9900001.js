var status;
var inSubMenu = false;

function start() {
    status = -1;
    action(1, 0, 0);
}

function action(mode, type, selection) {
    if (mode == -1) {
        cm.dispose();
        return;
    }

    if (mode == 0) {
        cm.dispose();
        return;
    }

    if (mode == 1) {
        status++;
    } else {
        status--;
    }

    if (status == 0) {
        showMainMenu();
    } else if (status == 1) {
        if (inSubMenu) {
            handleNpcMenuSelection(selection);
        } else {
            handleMainMenuSelection(selection);
        }
    }
}

function showMainMenu() {
    inSubMenu = false;
    var menu = "#eWelcome to the All-in-One NPC!#n#b\r\n";
    menu += "#L0#Open Exchanger NPCs#l\r\n";
    menu += "#L1#View Server Status#l\r\n";
    menu += "#L2#Exit#l";
    cm.sendSimple(menu);
}

function handleMainMenuSelection(selection) {
    switch(selection) {
        case 0: // Open Custom NPCs
            inSubMenu = true;
            status = 0;
            showNpcMenu();
            break;

        case 1: // Server Status
            displayServerStatus();
            break;

        case 2: // Exit
            cm.sendOk("#eGoodbye!#n");
            cm.dispose();
            break;
    }
}

function showNpcMenu() {
    var menu = "#eSelect an NPC to open:#n#b\r\n";
    menu += "#L0#Moonbeam - Maple Weapons#l\r\n";
    menu += "#L1#Patience - Mesos Exchanger#l\r\n";
    menu += "#L2#Sniffs - ETC Exchanger#l\r\n";
    menu += "#L3#VIP NPC#l\r\n";
    menu += "#L4#Back to Main Menu#l";
    cm.sendSimple(menu);
}

function handleNpcMenuSelection(selection) {
    if (selection == 4) {
        inSubMenu = false;
        status = -1;
        action(1, 0, 0);
        return;
    }

    cm.dispose();
    switch(selection) {
        case 0: cm.openNpc(3002000); break; // Moonbeam
        case 1: cm.openNpc(3002113); break; // Patience
        case 2: cm.openNpc(3002114); break; // Sniffs
        case 3: cm.openNpc(9000003); break; // VIP NPC
    }
}

// Basic Server Status that works in Cosmic v83
function displayServerStatus() {
    var status = "#eServer Status:#n#b\r\n\r\n";
    status += "#eServer Version:#n v83\r\n";
    status += "#eCurrent Date:#n " + getCurrentDate() + "\r\n";

    // Note: Player count is not directly accessible in Cosmic v83 NPC scripts
    // You would need to implement a server-wide tracking system

    cm.sendNext(status);
    cm.dispose();
}

function getCurrentDate() {
    var date = new Packages.java.util.Date();
    return date.toString();
}