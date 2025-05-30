package database

import (
	"database/sql"
	"log"

	_ "github.com/mattn/go-sqlite3"
)

var db *sql.DB

func init() {
	var err error
	db, err = sql.Open("sqlite3", "./database.db")
	if err != nil {
		log.Fatal(err)
	}

	log.Println("Database connected", db.Stats())

	CreateTable()
}

func CreateTable() {
	_, err := db.Exec("CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, ign TEXT, timezone TEXT)")
	if err != nil {
		log.Fatal(err)
	}
	log.Println("Table created")
}

func UpsertUser(id, ign, timezone string) {
	_, err := db.Exec("INSERT OR REPLACE INTO users (id, ign, timezone) VALUES (?, ?, ?)", id, ign, timezone)
	if err != nil {
		log.Fatal(err)
	}
	log.Println("User upserted")
}

func GetTimezone(id string) (string, error) {
	row := db.QueryRow("SELECT ign, timezone FROM users WHERE id = ?", id)
	var ign, timezone string
	err := row.Scan(&ign, &timezone)
	if err != nil {
		return "", err
	}
	return timezone, nil
}

func DeleteUser(id string) {
	db.Exec("DELETE FROM users WHERE id = ?", id)
}
