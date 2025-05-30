package commands

import (
	"github.com/bwmarrin/discordgo"
)

var (
	Commands = []*discordgo.ApplicationCommand{
		{
			Name:        "opq-guide",
			Description: "Guide to Orbis pq",
		},
		{
			Name:        "ht-pt",
			Description: "Arrange a party to kill horntail",
			Options: []*discordgo.ApplicationCommandOption{
				{
					Type:        discordgo.ApplicationCommandOptionString,
					Name:        "date",
					Description: "Date of the party assembly (DD/MM HH:MM) UTC/Server time",
					Required:    true,
				},
			},
		},
		{
			Name:        "suggest",
			Description: "Suggest a new feature or report a bug",
		},
		{
			Name:        "pc",
			Description: "Get the price of a item",
			Options: []*discordgo.ApplicationCommandOption{
				{
					Type:        discordgo.ApplicationCommandOptionString,
					Name:        "prompt",
					Description: "Prompt to get the price of a item",
					Required:    true,
				},
			},
		},
		{
			Name:        "verify",
			Description: "Verify your ign and timezone",
		},
		{
			Name:        "time",
			Description: "Get user current time",
			Options: []*discordgo.ApplicationCommandOption{
				{
					Type:        discordgo.ApplicationCommandOptionUser,
					Name:        "user",
					Description: "User to show its current time",
					Required:    false,
				},
			},
		},
		{
			Name:        "smick",
			Description: "Smick a user",
			Options: []*discordgo.ApplicationCommandOption{
				{
					Type:        discordgo.ApplicationCommandOptionUser,
					Name:        "user",
					Description: "User to smick",
					Required:    true,
				},
			},
		},
	}

	CommandHandlers = map[string]func(s *discordgo.Session, i *discordgo.InteractionCreate){
		"opq-guide": OPQ_GuideCommand,
		"ht-pt":     HT_PartyCommand,
		"suggest":   SuggestionCommand,
		"pc":        PC_Command,
		"verify":    VerifyCommand,
		"time":      TimeCommand,
		"smick":     SmickCommand,
	}
)
