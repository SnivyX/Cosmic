/****
 * @author DevonsDaddy a.k.a. Shawn
 * @purpose: Exchange 50 of any ETC for item of servers economy
****/

var area = [
/*Aqua Road*/		[4000088, 4000179, 4000180, 4000181, 4000182, 4000183, 4000184, 4000185, 4000153, 4000154, 4000155, 4000156, 4000157, 4000158, 4000159, 4000160, 4000161, 4000162, 4000163, 4000164, 4000165, 4000166, 4000167], 
/*Ariant*/			[4000324, 4000325, 4000326, 4000327, 4000328, 4000329, 4000330, 4000331, 4000332, 4000333, 4000334, 4000335, 4000352], 
/*El Nath*/			[4000053, 4000054, 4000059, 4000060, 4000061, 4000069, 4000070, 4000071, 4000072, 4000073, 4000074, 4000083, 4000084, 4000085, 4000086, 4000079, 4000080], 
/*Ludas Lake*/		[4000095, 4000097, 4000101, 4000103, 4000104, 4000105, 4000107, 4000108, 4000109, 4000110, 4000111, 4000114, 4000115, 4000117, 4000118, 4000120, 4000122, 4000127, 4000128, 4000130, 4000132, 4000134, 4000135, 4000143, 4000144, 4000145, 4000148, 4000150, 4000151, 4000152], 
/*Minar Forest*/	[4000232, 4000233, 4000234, 4000235, 4000236, 4000237, 4000238, 4000239, 4000240, 4000241, 4000242, 4000243, 4000244, 4000245, 4000262, 4000263, 4000264, 4000265, 4000266, 4000267, 4000268, 4000269, 4000270, 4000271, 4000272, 4000273], 
/*Vic Island*/		[4000000, 4000001, 4000003, 4000004, 4000005, 4000006, 4000007, 4000008, 4000009, 4000012, 4000013, 4000014, 4000015, 4000016, 4000018, 4000019, 4000020, 4000021, 4000022, 4000024, 4000028, 4000029, 4000032, 4000033, 4000034, 4000036, 4000037, 4000039, 4000042, 4000046], 
/*World Tour*/		[4000064, 4000065, 4000066, 4000077, 4000089, 4000090, 4000091, 4000092, 4000093, 4000136, 4000043, 4000044, 4000045, 4000137, 4000366, 4000367, 4000368, 4000369, 4000370, 4000371, 4000372, 4000373, 4000374, 4000375, 4000376, 4000379, 4000380, 4000382, 4000383], 
/*Ores/Crystals*/	[4010000, 4010001, 4010002, 4010003, 4010004, 4010005, 4010006, 4010007, 4020000, 4020001, 4020002, 4020003, 4020004, 4020005, 4020006, 4020007, 4020008, 4004000, 4004001, 4004002, 4004003, 4004004, 4005000, 4005001, 4005002, 4005003, 4005004]];
var award = [5077000,5520000,5510000,5041000,5130000,5072000,5076000,5222000]; // Servers' awards for 50 ETC items. Edit it.
status = 0;
region = 0;


function start() {
    cm.sendNext("Hello #h #. I have a vast knowledge of the items in MapleStory, but I still crave more knowledge. Perhaps you could help me on my quest for learning?\r\n\r\nYou can?!?! Great!!!\r\n\r\n Bring me 500 of these any of these items so that I may examine and study them. If you bring me enough, I will reward you for your hard work. Good luck!");
}

function action(m,t,s) {
    if (m != 1) {
		if (m == 0) {
			cm.sendOk("Please gather the right amount of items for my research.");
		}
        cm.dispose();
        return;
	} else {
        status++;
    }
    if (status == 1) {
		cm.sendSimple("What region have you trained in?\r\n\r\n#L0#Aqua Road Region =  #v5077000##l\r\n#L1#Ariant Region = #v5520000##l\r\n#L2#El Nath Region = #v5510000##l\r\n#L3#Ludas Lake Region =  #v5041000##l\r\n#L4#Minar Forest Region =  #v5130000##l\r\n#L5#Victoria Island Region = #v5072000##l\r\n#L6#World Tour = #v5076000##l");
	} else if (status == 2) {
		region = s;
		var talk = "You will need 500 of each item. Have you trained hard enough? Which item are you turning in?\r\n\r\n";
		for (var i = 0; i < area[region].length; i++)
			talk += "#L"+i+"##v"+area[region][i]+"##l";
        cm.sendSimple(talk);
	} else if (status == 3) {
		if (cm.haveItem(area[region][s], 500)) {
			if (cm.canHold(4001260)) { // random item that barely any server uses. just checks to see if they have an open slot.
				cm.gainItem(area[region][s], -500);
				cm.gainItem(award[region], 1);
				cm.sendOk("Come back anytime.");
			}else{
				cm.sendOk("You don't have enough space for this item. Please clear your inventory up a bit first.");
			}
		}else{
			cm.sendOk("Looks like you haven't trained as hard as you thought. Go train a little harder before speaking to me.");
		}
		cm.dispose();
	}
}