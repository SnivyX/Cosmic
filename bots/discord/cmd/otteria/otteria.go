package otteria

import (
	"log"
	"strings"

	"github.com/bwmarrin/discordgo"
	"github.com/ottersproduction/ottersstory/bots/discord/internal/commands"
	"github.com/ottersproduction/ottersstory/bots/discord/internal/utils"
)

var s *discordgo.Session
var GuildID *string

func Start(token string) *discordgo.Session {
	var err error

	s, err = discordgo.New("Bot " + token)
	if err != nil {
		log.Fatalf("Invalid bot parameters: %v", err)
	}

	s.AddHandler(func(s *discordgo.Session, i *discordgo.InteractionCreate) {
		switch i.Type {
		case discordgo.InteractionApplicationCommand:
			if h, ok := commands.CommandHandlers[i.ApplicationCommandData().Name]; ok {
				h(s, i)
			}
		case discordgo.InteractionModalSubmit:
			data := i.ModalSubmitData()

			if strings.HasPrefix(data.CustomID, "modals_suggestion") {
				err := commands.HandleModalSuggestion(s, i)
				if err != nil {
					log.Printf("Error handling modal suggestion: %v", err)
				}
			}

			if strings.HasPrefix(data.CustomID, "modals_verify") {
				err := commands.HandleModalVerify(s, i)
				if err != nil {
					log.Printf("Error handling modal verify: %v", err)
				}
			}
		}
	})

	s.AddHandler(func(s *discordgo.Session, r *discordgo.Ready) {
		log.Printf("Logged in as: %v#%v", s.State.User.Username, s.State.User.Discriminator)
	})

	err = s.Open()

	if err != nil {
		log.Fatalf("Cannot open the session: %v", err)
	}

	GuildID = &s.State.Guilds[0].ID

	utils.Init(s, GuildID)

	log.Println("Adding commands...")
	for _, v := range commands.Commands {
		_, err := s.ApplicationCommandCreate(s.State.User.ID, *GuildID, v)
		if err != nil {
			log.Panicf("Cannot create '%v' command: %v", v.Name, err)
		}
	}

	return s
}

func Stop() {
	log.Println("Removing commands...")

	registeredCommands, err := s.ApplicationCommands(s.State.User.ID, *GuildID)
	if err != nil {
		log.Panicf("Cannot get registered commands: %v", err)
	}

	for _, v := range registeredCommands {
		err := s.ApplicationCommandDelete(s.State.User.ID, *GuildID, v.ID)
		if err != nil {
			log.Panicf("Cannot delete '%v' command: %v", v.Name, err)
		}
		log.Printf("Deleted '%v' command", v.Name)
	}

}
