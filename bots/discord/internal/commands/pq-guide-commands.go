package commands

import "github.com/bwmarrin/discordgo"

func OPQ_GuideCommand(s *discordgo.Session, i *discordgo.InteractionCreate) {
	s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
		Type: discordgo.InteractionResponseChannelMessageWithSource,
		Data: &discordgo.InteractionResponseData{
			Embeds: []*discordgo.MessageEmbed{
				{
					Title:       "Orbis pq guide",
					Description: "Guide for the Orbis pq",
					URL:         "https://royals.ms/forum/threads/orbis-pq-guide.174277/",
					Color:       0x58bcff,
					Thumbnail: &discordgo.MessageEmbedThumbnail{
						URL: "https://bc.hidden-street.net/sites/global.hidden-street.net/files/npcs/npc_2013000.png",
					},
					Image: &discordgo.MessageEmbedImage{
						URL: "https://i.imgur.com/EUtYsf3.png",
					},
					Fields: []*discordgo.MessageEmbedField{
						{
							Name:   "Stage 1 (Entrance)",
							Value:  "Break the clouds and collect 20 pieces, drop in the middle of the room on the platform",
							Inline: true,
						},
						{
							Name:   "Stage 2 (Lobby)",
							Value:  "Reach top of each platform to break boxes which drops records. after getting the correct record, drop it at the player. see https://i.imgur.com/OKkxinP.png",
							Inline: true,
						},
						{},
						{
							Name:   "Stage 3 (Sealed room)",
							Value:  "5 members need to find the correct combination by standing on the correct platform. see http://i.imgur.com/tSVhylv.png",
							Inline: true,
						},
						{
							Name:   "Stage 4 (Lounge)",
							Value:  "Collect 40 rocks, 10 from each room",
							Inline: true,
						},
						{},
						{
							Name:   "Stage 5 (Storage)",
							Value:  "Kill all Cellions, only 1 will spawn at a time. last Cellion drops a piece which need to talk to cloudy",
							Inline: true,
						},
						{
							Name:   "Stage 6 (Walkway)",
							Value:  "Kill all the ghosts, need 30 pieces to continue.",
							Inline: true,
						},
						{},
						{
							Name:   "Stage 7 (On the way up)",
							Value:  "Climb up by finding the correct path. spam attack the levers while the leader spam talk to the npc",
							Inline: true,
						},
						{
							Name:   "Stage 8 (Restoring the Statue)",
							Value:  "Drops all the statue pieces on the correct spot completing the statue",
							Inline: true,
						},
						{},
						{
							Name:  "Stage 9 (Boss stage)",
							Value: "Find seeds and drop in the pots, find brown plant and kill it to spawn the boss. drop the boss seed at the pot that didnt grew",
						},
					},
				},
			},
		},
	})
}
