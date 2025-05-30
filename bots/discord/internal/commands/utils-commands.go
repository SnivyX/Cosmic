package commands

import (
	"fmt"
	"log"
	"strings"
	"time"
	_ "time/tzdata"

	"github.com/bwmarrin/discordgo"
	"github.com/ottersproduction/ottersstory/bots/discord/internal/ai"
	"github.com/ottersproduction/ottersstory/bots/discord/internal/database"
	"github.com/ottersproduction/ottersstory/bots/discord/internal/utils"
)

func SuggestionCommand(s *discordgo.Session, i *discordgo.InteractionCreate) {

	err := s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
		Type: discordgo.InteractionResponseModal,
		Data: &discordgo.InteractionResponseData{
			CustomID: "modals_suggestion_" + i.Interaction.Member.User.ID,
			Title:    "Suggestion",
			Components: []discordgo.MessageComponent{
				discordgo.ActionsRow{
					Components: []discordgo.MessageComponent{
						discordgo.TextInput{
							CustomID:    "title",
							Label:       "Title",
							Style:       discordgo.TextInputShort,
							Placeholder: "Find Base a wife",
							Required:    true,
							MaxLength:   50,
							MinLength:   5,
						},
					},
				},
				discordgo.ActionsRow{
					Components: []discordgo.MessageComponent{
						discordgo.TextInput{
							CustomID:  "description",
							Label:     "Description",
							Style:     discordgo.TextInputParagraph,
							Required:  true,
							MaxLength: 2000,
						},
					},
				},
			},
		},
	})

	if err != nil {
		log.Printf("Error sending modal: %v", err)
	}
}

func HandleModalSuggestion(s *discordgo.Session, i *discordgo.InteractionCreate) error {

	err := s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
		Type: discordgo.InteractionResponseChannelMessageWithSource,
		Data: &discordgo.InteractionResponseData{
			Content: "Thank you for taking your time to fill this suggestion",
			Flags:   discordgo.MessageFlagsEphemeral,
		},
	})
	if err != nil {
		panic(err)
	}

	data := i.ModalSubmitData()
	title := data.Components[0].(*discordgo.ActionsRow).Components[0].(*discordgo.TextInput).Value
	description := data.Components[1].(*discordgo.ActionsRow).Components[0].(*discordgo.TextInput).Value
	userid := strings.Split(data.CustomID, "_")[2]
	_, err = s.ChannelMessageSend(*utils.SuggestionChannel, fmt.Sprintf(
		`**Suggestion: %s**
		Author: <@%s>
		Description: %s`,
		title,
		userid,
		description,
	))

	return err

}

func PC_Command(s *discordgo.Session, i *discordgo.InteractionCreate) {

	options := i.ApplicationCommandData().Options
	prompt := options[0].StringValue()

	err := s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
		Type: discordgo.InteractionResponseChannelMessageWithSource,
		Data: &discordgo.InteractionResponseData{
			Content: "Let me check that for you",
			Flags:   discordgo.MessageFlagsEphemeral,
		},
	})
	if err != nil {
		log.Printf("Error getting price: %v", err)
		return
	}

	respond, err := ai.GetPrice(prompt)

	if err != nil {
		log.Printf("Error getting price: %v", err)
		return
	}
	userId := i.Interaction.Member.User.ID
	_, err = s.ChannelMessageSend(*utils.PCPricesChannel, fmt.Sprintf(`
	<@%s> was searching for: %s
	%s
	`, userId, prompt, respond))

	if err != nil {
		log.Printf("Error sending message: %v", err)
	}

}

func VerifyCommand(s *discordgo.Session, i *discordgo.InteractionCreate) {

	err := s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
		Type: discordgo.InteractionResponseModal,
		Data: &discordgo.InteractionResponseData{
			CustomID: "modals_verify_" + i.Interaction.Member.User.ID,
			Title:    "Verify",
			Components: []discordgo.MessageComponent{
				discordgo.ActionsRow{
					Components: []discordgo.MessageComponent{
						discordgo.TextInput{
							CustomID:    "ign",
							Label:       "IGN",
							Style:       discordgo.TextInputShort,
							Placeholder: "Enter your IGN",
							Required:    true,
							MaxLength:   20,
							MinLength:   2,
						},
					},
				},
				discordgo.ActionsRow{
					Components: []discordgo.MessageComponent{
						discordgo.TextInput{
							CustomID:    "timezone",
							Label:       "Timezone",
							Style:       discordgo.TextInputShort,
							Placeholder: "Enter your timezone",
							Required:    true,
							MaxLength:   30,
							MinLength:   2,
						},
					},
				},
			},
		},
	})

	if err != nil {
		log.Printf("Error sending modal: %v", err)
	}
}

func HandleModalVerify(s *discordgo.Session, i *discordgo.InteractionCreate) error {

	data := i.ModalSubmitData()
	ign := data.Components[0].(*discordgo.ActionsRow).Components[0].(*discordgo.TextInput).Value
	timezone := data.Components[1].(*discordgo.ActionsRow).Components[0].(*discordgo.TextInput).Value
	userid := strings.Split(data.CustomID, "_")[2]

	location, err := time.LoadLocation(timezone)
	if err != nil {
		s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
			Type: discordgo.InteractionResponseChannelMessageWithSource,
			Data: &discordgo.InteractionResponseData{
				Content: "Timezone is invalid, please verify your timezone using /verify list of timezones https://github.com/Lewington-pitsos/golang-time-locations",
				Flags:   discordgo.MessageFlagsEphemeral,
			},
		})
		return err
	}
	roles, err := s.GuildRoles(i.Interaction.GuildID)
	if err != nil {
		log.Printf("Error getting roles: %v", err)
		return err
	}
	var unverifiedRole string
	var babyOtterRole string
	var isVerified = true

	for _, role := range roles {
		if role.Name == "unverified" {
			unverifiedRole = role.ID
		}
		if role.Name == "Baby Otter" {
			babyOtterRole = role.ID
		}
	}

	user, err := s.GuildMember(i.Interaction.GuildID, userid)
	if err != nil {
		log.Printf("Error getting user: %v", err)
		return err
	}

	userRoles := user.Roles

	for _, role := range userRoles {
		if role == unverifiedRole {
			isVerified = false
		}
	}

	if !isVerified {
		err = s.GuildMemberRoleAdd(i.Interaction.GuildID, userid, babyOtterRole)
		if err != nil {
			log.Printf("Error adding role: %v", err)
			return err
		}
		err = s.GuildMemberRoleRemove(i.Interaction.GuildID, userid, unverifiedRole)
		if err != nil {
			log.Printf("Error removing role: %v", err)
			return err
		}
	}

	guild, err := s.Guild(i.Interaction.GuildID)
	if err != nil {
		log.Printf("Error getting guild: %v", err)
		return err
	}

	if guild.OwnerID != userid {
		err = s.GuildMemberNickname(i.Interaction.GuildID, userid, ign)
		if err != nil {
			log.Printf("Error setting nickname: %v", err)
			return err
		}
	}

	database.UpsertUser(userid, ign, location.String())
	err = s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
		Type: discordgo.InteractionResponseChannelMessageWithSource,
		Data: &discordgo.InteractionResponseData{
			Content: "Thank you for verifying your ign and timezone",
			Flags:   discordgo.MessageFlagsEphemeral,
		},
	})
	if err != nil {
		return err
	}

	return nil

}

func TimeCommand(s *discordgo.Session, i *discordgo.InteractionCreate) {

	options := i.ApplicationCommandData().Options
	now := time.Now()
	member := i.Interaction.Member
	if len(options) != 0 {
		var err error
		user := options[0].UserValue(s)
		member, err = s.GuildMember(i.Interaction.GuildID, user.ID)
		if err != nil {
			log.Printf("Error getting member: %v", err)
			return
		}
	}

	nickname := member.Nick
	if nickname == "" {
		nickname = member.User.Username
	}

	userTimezone, err := database.GetTimezone(member.User.ID)
	if err != nil {
		s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
			Type: discordgo.InteractionResponseChannelMessageWithSource,
			Data: &discordgo.InteractionResponseData{
				Content: fmt.Sprintf("%s doesn't have a timezone set, %s need to /verify", nickname, nickname),
			},
		})
		return
	}

	location, err := time.LoadLocation(userTimezone)
	if err != nil {
		s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
			Type: discordgo.InteractionResponseChannelMessageWithSource,
			Data: &discordgo.InteractionResponseData{
				Content: fmt.Sprintf("%s's timezone (%s) is invalid, %s need to reverify their timezone using /verify list of timezones https://github.com/Lewington-pitsos/golang-time-locations", nickname, userTimezone, nickname),
			},
		})
		return
	}

	s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
		Type: discordgo.InteractionResponseChannelMessageWithSource,
		Data: &discordgo.InteractionResponseData{
			Content: fmt.Sprintf("%s's current time is %s", nickname, now.In(location).Format("15:04")),
		},
	})

}
