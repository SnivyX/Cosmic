/*
    This file is part of the OdinMS Maple Story Server
    Copyright (C) 2008 Patrick Huy <patrick.huy@frz.cc>
               Matthias Butz <matze@odinms.de>
               Jan Christian Meyer <vimes@odinms.de>

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation version 3 as published by
    the Free Software Foundation. You may not use, modify or distribute
    this program under any other version of the GNU Affero General Public
    License.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
/**
 *9201142 - Witch Malady - Haunted House
 *@author BubblesDev v75 (Moogra)
 *@author DstroyerDev v83 (Revan)
 */

function start() {
    cm.sendNext("Nice to meet you!");
    cm.dispose();
}

/*
 * creditz: nico, kane, jorn
 */
var gachaMessage
var status = 0;
var items_10   = [
1702941, // Great Golden Dragon's Fury
1702940, // Dark Furrytail Cat's Paw
1702933, // Light Executor Weapon Skin
1702932, // Dark Executor Weapon Skin
1702913, // Starry Light Weapon
1702911, // Drowsy Rabbit
1702906, // Cursed Bow
1702902, // Celestial Staff
1702900, // Azure Sunset Sword
1702880, // Reaper's Wing
1702878, // Regal Romance Parasol
1702875, // Frostblade Weapon
1702858, // Seafoam Coral Blade
1702830, // Spring Rain Parasol
1702804, // Take Me Too!
1702365, // Tedimus Beartaculous
1012644, // Teddy Surgeon Mask
1000082, // Fashionista Wig(M) (Male)
1000084, // Little Wing Cap(Male)
1000090, // Penguin Hood (Male)
1001083, // Angelic Ribbon (F)
1003778, // Fluffy Cat Hood
1001112, // Penguin Hood (F)
1005320, // Pink Bean Hooded Scarf
1005283, // Neckerchief Fascinator Black
1005284, // '' Blue
1005285, // '' Purple
1005286, // '' Red
1005287, // '' White
1004589, // Jay's Sterilized Kitty Eye Patch
1004533, // Gaming Moonbeam
1004503, // Cat Hood
1004167, // Dinosaur Snapback
1051443, // School for the Gifted Uniform
1051504, // Lucid Dream F
1050437, // Lucid Dream M
1033000, // Lucid's Earrings
1004850, // Lucid's Silk Hat
1053457, // Dark Furrytail Fur - Trimmed Outfit (M)
1053458, // Dark Furrytail Fur-Trimmed Outfit (F)
1053386, // Outsized Sailor Coat (Black & Ivory)
1042349, // All About Black
1073370, //  Dark Furrytail Cuff (M)
1073371, // Dark Furrytail Cuff (F)
1073354, // Fox Fire Anklet
1073328, // Lunar New Year Pudgy Piggy Shoes
1073059, // Cat Knee Socks
1102835, // Schwarzer Coat
1102824, // Halfblood Wings
1102823, // Petite Devil Wings
1102149, // Mercury Cloak
1102809, // Death Waltz Cloak
1102724, // Giant Dark Devil Wings
1102723, // Giant Bright Angel Wings
1102702, // Ruby Monarch
1102703, // Jade Monarch
1102695, // Spirited Nine Tails
5010167, // Goddess's Blessing
5010166, // Specter Crown
5000170, // PSY PET
5000176, // Kangaroo
5000198, // Lil Moonbeam
5000249, // Fluffy Teddy
5000250, // Cutie Teddy
5000251, // Puffy Teddy
5000330, // Lil Von Leon
5000331, // Lil Orchid
5000332, // Lil Hilla
5000345, // Tiny Gollux
5000415, // Lil Lotus
5000433, // War Sheep
5000434, // Mage SHeep
5000435, // Cleric Sheep
5000445, // Baby Nero
5000446, // Strawbear
5000447, // Bananabear
5000448, // Cookiebear
5000479, // Tiny Zakum
5000484, // Lil Evan
5000485, // Lil Aran
5000486, // Lil Phantom
5000490, // Lil Luminous
5000491, // Lil Mercedes
5000492, // Lil Shade
5000499, // Stickman
5000528, // Meerkat Mob
5000529, // Pudgycat
5000545, // Black Bean
5000570, // Lil Tutu
5000587, // Salem Cat
5000588, // Binx Cat
5000589, // Kit Cat
5000590, // Bichon
5000591, // Yodeling Hen
5000592, // Gold Chicken
5000641, // Ebony Lucid
5000642, // Power Lucid
5000643, // Rose Lucid
5000707, // Small Spirit
5000708, // Tree Spirit
5000709, // Rock Spirit
];

var items_30   = [
1702931, //Sheperd's Crook Weapon Skin
1702915, //Fox Fire Fammiliar Weapon
1702910, // Bushmaster Sword
1702909, // Gorgon Baston
1702891, // Scribble Bloom
1702883, // Pajama Party
1702879, // Dreamland Unicorn
1702846, // Summer Story Weapon
1005375, // Superstar Pink Bean Horned Headphones
1005323, // Midnight Magician Hat
1005279, // Lunar New Year Pudgy Piggy Hat
1004479, // Hoi Poi Hat
1051349, // Succubus Dress
1051439, // Mint Kitty Tea Party
1042376, // Snazzy Bunny Outfit
1042337, // Teddy Picnic Shirt
1042338, // Brown Teddy Top
1073328, // Lunar New Year Pudgy Piggy Shoes
1073304, // Rock Spirit Slippers
1073262, // Lunar New Year VIP Shoes
1102885, // Fluffy Fox Tail (Gold)
1102886, // Fluffy Fox Tail (Silver)
1115137, // Falling Darkness Label Ring
1115110, // Heroes Black Mage Label Ring
1115079, // Grim Reaper Chat Ring
1115068, // Frosty Cherry Blossom Chat Ring
];


var items_50   = [
1702930, // Movie Popcorn Weapon Skin
1702927, // Red Lotus Spirit Walker's Fan
1702917, // Blue Flame Whip
1702916, // Springtime Sprout Greenery
1702912, // Demonic Sword
1702905, // Wish Fulfiller Crossbody Tote
1702904, // Midnight Magician Weapon
1702903, // Sunny Songbird Weapon
1702901, // Crystalline Wand
1022263, // Sleepy Eye Patch
1002186, // Transparent Hat
1005238, // Happy Bear Hat (F)
1005239, // Happy Bear Hat (M)
1050319, // Sky BLue Picnic (M)
1050509, // Camelia Tea Livery (M)
1051256, // Light Chiffon Dress
1051345, // Fluffy Cat Outfit
1062231, // All about jeans
1062217, // Polka-Dot A Line Skirt
1073046, //Baby Ram Slippers (Blue)
1073047, //Baby Ram Slippers (Pink)
];


var items      = new Array(items_10,items_30,items_50);

function start() {
    status = 0;
    action (1, 0, 0);
}

function action(mode, type, selection) {
    if (mode == -1 || (mode == 0 && status == 0)) {
        cm.dispose();
    } else {
        if (mode == 1) {
            status++;
        } else {
            status--;
        }
        if (status == 1) {
            cm.sendYesNo("If you give me 1 donor point you will get:\r\n\r\n#fUI/UIWindow.img/QuestIcon/4/0#\r\n\r\n#fUI/UIWindow.img/QuestIcon/5/0# #bx 1 Mysterious NX Equip#k\r\n\r\n");
        } else if (status == 2) {
            if (cm.haveItem(5220000, 1)) {
                chance = Math.ceil(Math.random() * 100);
                var type_ = 2;
                if (chance <= 10) {
                    type_ = 0;
                } else if (chance <= 30){
                    type_ = 1;
                }
                random = Math.floor(Math.random() * items[type_].length);
                itemid = items[type_][random];
                if (cm.canHold(itemid)) { // Check if player can hold the item
                    cm.gainItem(5220000, -1);
                    cm.gainItem(itemid, 1); // Ensure the quantity is set to 1
                    cm.sendOk("Thank you for the Donation!\r\n\r\n#fUI/UIWindow.img/QuestIcon/4/0#\r\n\r\n#v" + itemid + "# #b#z" + itemid + "#\r\n\r\n");
                    cm.dispose();
                } else {
                    cm.sendOk("Make some space in your inventory; where am I going to put the chair?");
                    cm.dispose();
                }
            } else {
                cm.sendOk("I'm sorry #h #, in order to receive:\r\n\r\n#fUI/UIWindow.img/QuestIcon/5/0# #bx One Mysterious NX Item#k you would need to have at least 1 donor point\r\n\r\n");
                cm.dispose();
            }
        }
    }
}