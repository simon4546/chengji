package main

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

type User struct {
	ID       uint   `gorm:"primaryKey"`
	Username string `gorm:"unique"`
	Password string
}

type Score struct {
	ID       uint `gorm:"primaryKey"`
	UserID   uint
	Subject  string
	PeriodID uint
	Score    int
}

type Period struct {
	ID      uint `gorm:"primaryKey"`
	Subject string
	Name    string
}

var db *gorm.DB

func init() {
	var err error
	db, err = gorm.Open(sqlite.Open("school.db"), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}

	db.AutoMigrate(&User{}, &Score{}, &Period{})
}

func login(c echo.Context) error {
	var user User
	if err := c.Bind(&user); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": "Invalid input"})
	}

	var foundUser User
	result := db.Where("username = ? AND password = ?", user.Username, user.Password).First(&foundUser)
	if result.Error != nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{"message": "Invalid credentials"})
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "Login successful"})
}

func changePassword(c echo.Context) error {
	var user User
	if err := c.Bind(&user); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": "Invalid input"})
	}

	result := db.Model(&User{}).Where("username = ?", user.Username).Update("password", user.Password)
	if result.RowsAffected == 0 {
		return c.JSON(http.StatusNotFound, map[string]string{"message": "User not found"})
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "Password updated"})
}

func getScores(c echo.Context) error {
	username := c.QueryParam("username")
	subject := c.QueryParam("subject")
	periodid := c.QueryParam("periodid")
	var user User
	if err := db.Where("username = ?", username).First(&user).Error; err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"message": "User not found"})
	}

	var scores []Score
	if err := db.Where("user_id = ? AND subject = ? AND periodid=?", user.ID, subject, periodid).Find(&scores).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"message": "Error fetching scores"})
	}

	return c.JSON(http.StatusOK, scores)
}
func getPeriods(c echo.Context) error {
	username := c.QueryParam("username")
	subject := c.QueryParam("subject")

	var user User
	if err := db.Where("username = ?", username).First(&user).Error; err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"message": "User not found"})
	}

	var periods []Period
	if err := db.Where("subject = ?", subject).Find(&periods).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"message": "Error fetching scores"})
	}

	return c.JSON(http.StatusOK, periods)
}

func main() {
	e := echo.New()

	e.POST("/login", login)
	e.POST("/change-password", changePassword)
	e.GET("/get-scores", getScores)
	e.GET("/get-periods", getPeriods)

	e.Logger.Fatal(e.Start(":8080"))
}
