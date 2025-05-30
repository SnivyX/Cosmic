package ai

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/sashabaranov/go-openai"
)

var threadID *string
var client *openai.Client
var ctx context.Context

func Create(apiKey string) {

	ctx = context.Background()
	client = openai.NewClient(apiKey)

	// Create initial thread
	thread, err := client.CreateThread(ctx, openai.ThreadRequest{})
	if err != nil {
		log.Fatalf("Failed to create thread: %v", err)
	}

	if err != nil {
		log.Fatalf("Failed to create thread: %v", err)
	}

	threadID = &thread.ID

}

func GetPrice(prompt string) (string, error) {

	// Create message in existing thread
	_, err := client.CreateMessage(ctx, *threadID, openai.MessageRequest{
		Role:    openai.ChatMessageRoleUser,
		Content: prompt,
	})
	if err != nil {
		return "", fmt.Errorf("failed to create message: %w", err)
	}

	// Create run
	run, err := client.CreateRun(ctx, *threadID, openai.RunRequest{
		AssistantID: "asst_l2eDjJeQ5AgWlTmojeLHvHB1",
	})
	if err != nil {
		return "", fmt.Errorf("failed to create run: %w", err)
	}

	// Wait for response with timeout
	timeout := time.After(30 * time.Second)
	ticker := time.NewTicker(100 * time.Millisecond)
	defer ticker.Stop()

	for run.Status == openai.RunStatusQueued || run.Status == openai.RunStatusInProgress {
		select {
		case <-timeout:
			return "", fmt.Errorf("timeout waiting for response")
		case <-ticker.C:
			run, err = client.RetrieveRun(ctx, *threadID, run.ID)
			if err != nil {
				return "", fmt.Errorf("failed to retrieve run: %w", err)
			}
		}
	}

	if run.Status != openai.RunStatusCompleted {
		return "", fmt.Errorf("run failed with status %s", run.Status)
	}

	// Get the latest message
	numMessages := 1
	messages, err := client.ListMessage(ctx, *threadID, &numMessages, nil, nil, nil, nil)
	if err != nil {
		return "", fmt.Errorf("failed to list messages: %w", err)
	}

	if len(messages.Messages) == 0 || len(messages.Messages[0].Content) == 0 {
		return "", fmt.Errorf("no message content received")
	}

	return messages.Messages[0].Content[0].Text.Value, nil
}
