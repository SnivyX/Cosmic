package commands

import (
	"fmt"
	"math/rand"
	_ "time/tzdata"

	"github.com/bwmarrin/discordgo"
)

var smickResponses = []string{
	"OMG <@%s> just smicked <@%s>, such savage what will be done????",
	"<@%s> just smicked the shit outta <@%s>",
	"<@%s> trying to smick <@%s>, but he to weak >_>",
	"<@%s> omg you just smicked <@%s>, why i thought you were friends",
	"<@%s> smicked <@%s>, such smick, much wow",
	"<@%s> smicked that :wave: <@%s>",
	"<@%s> smicked <@%s>, why.... i dont get it....",
	"<@%s> smicked <@%s>, what a smick",
}

func SmickCommand(s *discordgo.Session, i *discordgo.InteractionCreate) {

	options := i.ApplicationCommandData().Options
	smickedUser := options[0].UserValue(s)
	if smickedUser.ID == i.Interaction.Member.User.ID {
		s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
			Type: discordgo.InteractionResponseChannelMessageWithSource,
			Data: &discordgo.InteractionResponseData{
				Content: "You can't smick yourself",
				Flags:   discordgo.MessageFlagsEphemeral,
			},
		})
		return
	}
	s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
		Type: discordgo.InteractionResponseChannelMessageWithSource,
		Data: &discordgo.InteractionResponseData{
			Content: fmt.Sprintf(smickResponses[rand.Intn(len(smickResponses))], i.Interaction.Member.User.ID, smickedUser.ID),
		},
	})

}
