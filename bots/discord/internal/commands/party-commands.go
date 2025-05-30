package commands

import (
	"fmt"

	"github.com/bwmarrin/discordgo"
	dates "github.com/ottersproduction/ottersstory/bots/discord/internal/utils"
)

func HT_PartyCommand(s *discordgo.Session, i *discordgo.InteractionCreate) {

	options := i.ApplicationCommandData().Options
	input := options[0].StringValue()
	startTime, err := dates.DateFromDayMonth(input)

	if err != nil {
		s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
			Type: discordgo.InteractionResponseChannelMessageWithSource,
			Data: &discordgo.InteractionResponseData{
				Content: "Invalid date :(",
			},
		})
		return
	}

	s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
		Type: discordgo.InteractionResponseChannelMessageWithSource,
		Data: &discordgo.InteractionResponseData{
			Embeds: []*discordgo.MessageEmbed{
				{
					Title:       "Horntail Run",
					Description: fmt.Sprintf("Running at %s server time (UTC) <3", &startTime),
					URL:         "https://royals.ms/forum/threads/zancks-bossing-guide.196246/",
					Color:       0x221111,
					Thumbnail: &discordgo.MessageEmbedThumbnail{
						URL: "https://bc.hidden-street.net/sites/global.hidden-street.net/files/npcs/npc438.png",
					},
					Image: &discordgo.MessageEmbedImage{
						URL: "https://media.maplestorywiki.net/yetidb/Mob_Horntail_%28Full_Body%29.png",
					},
					Fields: []*discordgo.MessageEmbedField{
						{
							Name: "Members needed: 6 minimum, no max)",
							Value: `React with the following for your **role**:

> Attacker :crossed_swords:
> Seduce Target :face_with_spiral_eyes:
> SI / Bucc :pirate_flag:
> SE / Archer :bow_and_arrow:
> CR / Pally :shield:
> HS / Bishop :pray_tone4:`,
						},
						{
							Name: "**Ready Checklist**",
							Value: `> 300~ All cure potions :milk:
> 1k~ HP/MP Potions :cheese:
> 8~ Onyx Apples :apple:
> Dragon Elixirs :dragon_face:`,
						},
						{},
						{
							Name:  "Summary",
							Value: "Just have fun every one, which you best of luck <3",
						},
					},
				},
			},
		},
	})

}
