# Build stage
FROM golang:1.22-alpine AS builder

# Set working directory
WORKDIR /app

# Install necessary build tools
RUN apk add --no-cache git gcc musl-dev

# Copy go mod files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Build the application
RUN CGO_ENABLED=1 GOOS=linux go build -o discord-bot

# Final stage
FROM alpine:latest

# Add ca-certificates for HTTPS
RUN apk --no-cache add ca-certificates tzdata

WORKDIR /app

# Copy the binary from builder
COPY --from=builder /app/discord-bot .

# Create a default .env file
RUN touch .env
RUN touch database.db
# Create entrypoint script using printf to ensure proper line endings
RUN printf '#!/bin/sh\n\
if [ -f "/run/secrets/discord_token" ]; then\n\
    echo "DISCORD_TOKEN=$(cat /run/secrets/discord_token)" > .env\n\
else\n\
    echo "No discord token secret found, using existing .env file"\n\
fi\n\
\n\
if [ -f "/run/secrets/openai_key" ]; then\n\
    echo "OPENAI_API_KEY=$(cat /run/secrets/openai_key)" >> .env\n\
else\n\
    echo "No OpenAI API key secret found, using existing .env file"\n\
fi\n\
\n\
exec "$@"\n' > /entrypoint.sh \
    && chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
CMD ["./discord-bot"]
