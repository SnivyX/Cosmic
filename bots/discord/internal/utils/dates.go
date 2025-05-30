package utils

import "time"

func DateFromDayMonth(date string) (time.Time, error) {
	layout := "2/1 15:04"

	t, err := time.Parse(layout, date)
	if err != nil {
		return time.Time{}, err
	}

	currentYear := time.Now().Year()
	t = time.Date(currentYear, t.Month(), t.Day(), t.Hour(), t.Minute(), t.Second(), 0, time.UTC)

	return t, nil
}
