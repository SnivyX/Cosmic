package main

import (
	"log"
	"os"
	"os/signal"

	"github.com/joho/godotenv"
	"github.com/ottersproduction/ottersstory/bots/discord/cmd/otteria"
	"github.com/ottersproduction/ottersstory/bots/discord/internal/ai"
)

func init() {
	var err error

	err = godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

}

func main() {
	ai.Create(os.Getenv("OPENAI_API_KEY"))
	s := otteria.Start(os.Getenv("DISCORD_TOKEN"))

	defer s.Close()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt)
	log.Println("Press Ctrl+C to exit")
	<-stop
	otteria.Stop()
	log.Println("Gracefully shutting down.")
}
