package utils

import (
	"log"

	"github.com/bwmarrin/discordgo"
)

var PCPricesChannel *string
var SuggestionChannel *string

func Init(s *discordgo.Session, GuildID *string) {
	channels, err := s.GuildChannels(*GuildID)
	if err != nil {
		log.Fatalf("Error getting guild channels: %v", err)
	}

	for _, channel := range channels {
		if channel.Name == "suggestions" {
			SuggestionChannel = &channel.ID
		}
		if channel.Name == "💰trade-pc" {
			PCPricesChannel = &channel.ID
		}
	}
}
