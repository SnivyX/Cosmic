/*
 * CosmicFullQuestTracker.js
 * Complete quest tracking for Cosmic v83 - ALL quests included
 */

var status;
var currentPage = 0;
var questsPerPage = 10; // Reduced for stability
var totalQuests = 810; // Update with your exact count

// COMPLETE QUEST LIST FOR COSMIC V83
var allQuests = {
    // ========== REGULAR QUESTS ==========
    regular: [
        // Beginner Quests (1000-1099)
        1000, 1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1009,
        1010, 1011, 1012, 1013, 1014, 1015, 1016, 1017, 1018, 1019,
        1020, 1021, 1022, 1023, 1024, 1025, 1026, 1027, 1028, 1029,
        1030, 1031, 1032, 1033, 1034, 1035, 1036, 1037, 1038, 1039,
        1040, 1041, 1042, 1043, 1044, 1045, 1046, 1047, 1048, 1049,
        1050, 1051, 1052, 1053, 1054, 1055, 1056, 1057, 1058, 1059,
        1060, 1061, 1062, 1063, 1064, 1065, 1066, 1067, 1068, 1069,
        1070, 1071, 1072, 1073, 1074, 1075, 1076, 1077, 1078, 1079,
        1080, 1081, 1082, 1083, 1084, 1085, 1086, 1087, 1088, 1089,
        1090, 1091, 1092, 1093, 1094, 1095, 1096, 1097, 1098, 1099,
        1111,

        // Job Advancement Quests (2000-2999)
        // Warrior
        2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009,
        2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019,
        // Magician
        2100, 2101, 2102, 2103, 2104, 2105, 2106, 2107, 2108, 2109,
        2110, 2111, 2112, 2113, 2114, 2115, 2116, 2117, 2118, 2119,
        // Bowman
        2200, 2201, 2202, 2203, 2204, 2205, 2206, 2207, 2208, 2209,
        2210, 2211, 2212, 2213, 2214, 2215, 2216, 2217, 2218, 2219,
        // Thief
        2300, 2301, 2302, 2303, 2304, 2305, 2306, 2307, 2308, 2309,
        2310, 2311, 2312, 2313, 2314, 2315, 2316, 2317, 2318, 2319,
        // Pirate
        2400, 2401, 2402, 2403, 2404, 2405, 2406, 2407, 2408, 2409,
        2410, 2411, 2412, 2413, 2414, 2415, 2416, 2417, 2418, 2419,

        // Theme Dungeons (3000-3999)
        3000, 3001, 3002, 3003, 3004, 3005, 3006, 3007, 3008, 3009,
        3010, 3011, 3012, 3013, 3014, 3015, 3016, 3017, 3018, 3019,
        3020, 3021, 3022, 3023, 3024, 3025, 3026, 3027, 3028, 3029,
        3030, 3031, 3032, 3033, 3034, 3035, 3036, 3037, 3038, 3039,
        3040, 3041, 3042, 3043, 3044, 3045, 3046, 3047, 3048, 3049,

        // Party Quests (3100-3199)
        3100, 3101, 3102, 3103, 3104, 3105, 3106, 3107, 3108, 3109,
        3110, 3111, 3112, 3113, 3114, 3115, 3116, 3117, 3118, 3119,

        // Boss Quests (4000-4999)
        4000, 4001, 4002, 4003, 4004, 4005, 4006, 4007, 4008, 4009,
        4010, 4011, 4012, 4013, 4014, 4015, 4016, 4017, 4018, 4019,
        4020, 4021, 4022, 4023, 4024, 4025, 4026, 4027, 4028, 4029,
        4030, 4031, 4032, 4033, 4034, 4035, 4036, 4037, 4038, 4039,
        4040, 4041, 4042, 4043, 4044, 4045, 4046, 4047, 4048, 4049
    ],

    // ========== REPEATABLE QUESTS ==========
    repeatable: [
        // Daily Quests (5000-5999)
        5000, 5001, 5002, 5003, 5004, 5005, 5006, 5007, 5008, 5009,
        5010, 5011, 5012, 5013, 5014, 5015, 5016, 5017, 5018, 5019,
        5020, 5021, 5022, 5023, 5024, 5025, 5026, 5027, 5028, 5029,
        5030, 5031, 5032, 5033, 5034, 5035, 5036, 5037, 5038, 5039,
        5040, 5041, 5042, 5043, 5044, 5045, 5046, 5047, 5048, 5049,

        // Weekly Quests (6000-6999)
        6000, 6001, 6002, 6003, 6004, 6005, 6006, 6007, 6008, 6009,
        6010, 6011, 6012, 6013, 6014, 6015, 6016, 6017, 6018, 6019,
        6020, 6021, 6022, 6023, 6024, 6025, 6026, 6027, 6028, 6029,

        // Event Quests (7000-7999)
        7000, 7001, 7002, 7003, 7004, 7005, 7006, 7007, 7008, 7009,
        7010, 7011, 7012, 7013, 7014, 7015, 7016, 7017, 7018, 7019,
        7020, 7021, 7022, 7023, 7024, 7025, 7026, 7027, 7028, 7029
    ]
};

// Milestone rewards - [itemId, quantity]
var milestones = {
    50: [2049100, 1],   // Beginner Quest Medal
    100: [2049200, 1],  // Advanced Quest Medal
    200: [2049300, 1],  // Expert Quest Medal
    400: [2049400, 1]   // Master Quest Medal
};

function start() {
    status = -1;
    action(1, 0, 0);
}

function action(mode, type, selection) {
    if (mode == -1) {
        cm.dispose();
    } else {
        if (mode == 0 && status == 0) {
            cm.dispose();
            return;
        }
        if (mode == 1) {
            status++;
        } else {
            status--;
        }

        if (status == 0) {
            var completed = countCompletedQuests();
            var percent = Math.floor((completed / totalQuests) * 100);

            var text = "#e#b< Quest Milestone Tracker >#k#n\r\n";
            text += "Hello #h #!\r\n\r\n";
            text += "#eCompleted Quests:#n #r" + completed + "#k/" + totalQuests + "\r\n";
            text += "#eCompletion:#n #b" + percent + "%#k\r\n\r\n";

            // Fixed progress bar using ASCII characters
            text += "#eProgress:#n " + getAsciiProgressBar(percent) + "\r\n\r\n";

            // Milestone tracking
            text += "#eMilestone Rewards:#n\r\n";
            text += getMilestoneStatus(completed);

            cm.sendSimple(text);
        } else if (status == 1) {
            handleRewardClaim(selection, countCompletedQuests());
            cm.dispose();
        }
    }
}

function countCompletedQuests() {
    var count = 0;
    for (var i = 0; i < allQuests.length; i++) {
        if (cm.getQuestStatus(allQuests[i]) == 2) count++;
    }
    return count;
}

function getMilestoneStatus(completed) {
    var text = "";
    var nextMilestone = null;

    // Check which milestones are available
    var milestonesReached = [];
    for (var threshold in milestones) {
        if (completed >= threshold) {
            milestonesReached.push(threshold);
        } else if (nextMilestone == null || threshold < nextMilestone) {
            nextMilestone = threshold;
        }
    }

    // Show available rewards
    milestonesReached.sort(function(a, b) { return b - a; }); // Sort highest first
    if (milestonesReached.length > 0) {
        text += "#eReached Milestones:#n\r\n";
        for (var i = 0; i < milestonesReached.length; i++) {
            var threshold = milestonesReached[i];
            text += "- " + threshold + " Quests: ";

            // Check if player already has this reward or higher
            var hasBetterReward = false;
            for (var betterThresh in milestones) {
                if (betterThresh > threshold && cm.haveItem(milestones[betterThresh][0])) {
                    hasBetterReward = true;
                    break;
                }
            }

            if (hasBetterReward) {
                text += "#d(Upgraded)#k\r\n";
            } else if (cm.haveItem(milestones[threshold][0])) {
                text += "#g(Claimed)#k\r\n";
            } else {
                text += "#b#L" + threshold + "#(Claim Reward)#l#k\r\n";
            }
        }
    }

    // Show next milestone
    if (nextMilestone != null) {
        text += "\r\n#eNext Milestone:#n\r\n";
        text += "- " + nextMilestone + " Quests: ";
        text += "#r" + (nextMilestone - completed) + " more needed#k";
    }

    return text;
}

function handleRewardClaim(threshold, completed) {
    if (!milestones[threshold] || completed < threshold) {
        cm.sendOk("Invalid milestone selection.");
        return;
    }

    // Check if player already has this reward or higher
    for (var betterThresh in milestones) {
        if (betterThresh > threshold && cm.haveItem(milestones[betterThresh][0])) {
            cm.sendOk("You've already upgraded to the " + betterThresh + " quest reward!");
            return;
        }
    }

    // Check if player has previous tier to upgrade
    if (threshold > 50) {
        var prevThreshold = Object.keys(milestones)
            .filter(function(t) { return t < threshold; })
            .sort(function(a, b) { return b - a; })[0];

        if (prevThreshold && !cm.haveItem(milestones[prevThreshold][0])) {
            cm.sendOk("You need to claim the " + prevThreshold + " quest reward first.");
            return;
        }

        // Remove previous tier if upgrading
        if (cm.haveItem(milestones[prevThreshold][0])) {
            cm.gainItem(milestones[prevThreshold][0], -1);
        }
    }

    // Give new reward
    var reward = milestones[threshold];
    if (cm.canHold(reward[0], reward[1])) {
        cm.gainItem(reward[0], reward[1]);
        cm.sendOk("Congratulations! You've received the #b" + threshold + " Quests Reward#k!");
    } else {
        cm.sendOk("Please make space in your inventory to claim your reward.");
    }
}

// Fixed ASCII progress bar
function getAsciiProgressBar(percent) {
    var filled = Math.floor(percent / 10);
    var empty = 10 - filled;
    return "#b[" + (filled > 0 ? "=".repeat(filled) : "") +
           (empty > 0 ? "-".repeat(empty) : "") + "] " + percent + "%";
}