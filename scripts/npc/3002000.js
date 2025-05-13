/**
 * How to Edit:
 * Put the item ID you want to use in place of '4001126' for the item players need to trade in.
 * Put the item IDs of the prizes in the first section of the item array. Where you see '4031912, 4031825, etc'.
 * Put the amount of the requiredItem the player needs for the CORRESPONDING item in the second part of the item array. Where you see '250, 200, etc'.
 * Corresponding means: Match up the item ID to the amount of requiredItem needed. In this script, the player needs 250 requiredItem for the '4031912' item.
 */
var status = 0;
var requiredItem = 4001126;
var item = [[1302020, 1382009,1452016,1462014,1472030,1492020,1482020,1302030,1332025,1382012,1412011,1422014,1432012,1442024,1452022,1462019,1472032,1492021,1482021,1302064, 1402039,1332055,1332056,1372034,1382039,1312032,1412027,1322054,1422029,1432040,1442051,1452045,1462040,1472055,1492022,1482022,1302142,1312056,1322084,1332114,1342028,1372071,1382093,1402085,1412055,1422057,1432075,1442104,1452100,1462085,1472111,1482073,1492073],
 [300, 300, 300, 300, 300, 300, 450, 450, 450, 450, 450, 450, 450, 450, 450, 450, 450, 450, 750, 750, 750, 750, 750, 750, 750, 750, 750, 750, 750, 750, 750, 750, 750, 750, 750, 1350, 1350, 1350, 1350, 1350, 1350, 1350, 1350, 1350, 1350, 1350, 1350, 1350, 1350, 1350, 1350, 1350, 1350]]; //an extra , 1350 to fix last item
//maple35 = sword, staff, bow, crow, claw, gun, knuckle 1302020, 1382009,1452016,1462014,1472030,1492020,1482020

//maple43 = 1302030,1332025,1382012,1412011,1422014,1432012,1442024,1452022,1462019,1472032,1492021,1482021
// soul singer, wagner, lama staff, dragon axe, doom singer
// impaler, scorpio, soul searcher, crossbow, kandayo, storm pistol, storm finger

//maple64 = 1302064,1402039,1332055,1332056,1372034,1382039,1312032,1412027,1322054,1422029,1432040,1442051,1452045,1462040,1472055,1492022,1482022
// [glory sword, rohen], [dark mate, asura dagger], [shine wand, wisdom staff], [steel axe, demon axe]
// [havoc hammer, belzet], [soul spear], [karstan], [kandiva], [nishada], [skanda], [canon shooter]
// [golden claw]

//maple77 = [[1302142,1312056,1322084],[1332114,1342028],[1372071,1382093],[1402085,1412055,1422057,1432075,1442104],[1452100,1462085],[1472111],[1482073,1492073]];
// [Sword , Axe , Hammer], [Halfmoon , Katara], [Wand , Staff], [Rohen , Battle Axe, Maul, Spear, Hellslayer]
// [Bow , Crossbow], [Skanda], [Knuckle , Shooter]
var sel;

function start(){
	cm.sendNext("Hello! I'm Moonbeam. Do you have any #r#t"+ requiredItem +"##k? If you do, I can trade you some items for them!");
}

function action(m,t,s){
	status++;
	if(m != 1){
		cm.dispose();
		return;
	}
	if(status == 1){
		if(!cm.haveItem(requiredItem)){ // SORRY, I had this as item[0] =/
			cm.sendOk("You don't have any #r#t"+ requiredItem +"##k!");
			cm.dispose();
		} else {
			var talk = "Which Item would you like to buy?#b";
			for(var i = 0; i < item[0].length; talk += "\r\n\t#L"+ i +"##t"+ item[0][i] +"##l", i++);
			cm.sendSimple(talk);
		}
	} else if (status == 2){
		sel = s;
		cm.sendYesNo("Would you like to buy 1 #b#t"+ item[0][s] +"##k Item for #r"+ item[1][s] +" #t"+ requiredItem +"#?");
	} else if (status == 3){
		if(cm.haveItem(requiredItem, item[1][sel])){
			cm.sendOk("Enjoy your #b#t" + item[0][sel] + "##k ! Remember to hunt more often to get more of these exclusive deals!");
			cm.gainItem(item[0][sel]);
			cm.gainItem(requiredItem, -item[1][sel]);
		} else {
			var percent = Math.ceil(cm.itemQuantity(requiredItem) / item[1][sel]); // removed the +100, as the #B # reads decimals x_x
			cm.sendOk("You only have #b#c"+ requiredItem +"# #t"+ requiredItem +"##k. You need #r"+ item[1][sel] +" #t"+ requiredItem +"##k to buy a #b#t"+ item[0][sel] +"##k! \r\n\r\n#ePercent of #b#t"+ requiredItem +"#'s#k collected (rounded by the 10%): \r\n#B"+ percent +"#");
		}
        cm.dispose(); // forgot this in the first post, sorry x_x
	}
}