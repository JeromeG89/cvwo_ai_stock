package main

import (
    "database/sql"
    "log"
    "net/http"

    "github.com/gin-gonic/gin"
    _ "github.com/go-sql-driver/mysql"
    "github.com/gin-contrib/cors"
)

func main() {
    // Initialize Gin router
    r := gin.Default()

    // Connect to MySQL
    db, err := sql.Open("mysql", "root:Password12345!@tcp(localhost:3306)/stock_logs")
    if err != nil {
        log.Fatal(err)
    }
    defer db.Close()

    // Enable CORS
    r.Use(cors.New(cors.Config{
        AllowOrigins:     []string{"http://localhost:3000"}, // Allow React frontend
        AllowMethods:     []string{"GET", "POST", "PUT", "DELETE"},
        AllowHeaders:     []string{"Content-Type"},
        AllowCredentials: true,
    }))

    // Define routes
    r.GET("/api/logs", func(c *gin.Context) {
        rows, err := db.Query("SELECT id, ticker, log_date, price, n_weeks, prediction, output_date, confidence_train, confidence_test, confusion_matrix_score, auc_roc_score, predictor_version FROM logs")
        if err != nil {
            log.Printf("Database query failed: %v", err)
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch data"})
            return
        }
        defer rows.Close()
    
        var results []map[string]interface{}
        for rows.Next() {
            var id int
            var ticker, prediction, predictorVersion string
            var logDate, outputDate string
            var price, confidenceTrain, confidenceTest, confusionMatrixScore, aucRocScore float64
            var nWeeks int
    
            if err := rows.Scan(&id, &ticker, &logDate, &price, &nWeeks, &prediction, &outputDate, &confidenceTrain, &confidenceTest, &confusionMatrixScore, &aucRocScore, &predictorVersion); err != nil {
                log.Printf("Row scan failed: %v", err)
                c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process data"})
                return
            }
    
            results = append(results, gin.H{
                "id": id,
                "ticker": ticker,
                "log_date": logDate,
                "price": price,
                "n_weeks": nWeeks,
                "prediction": prediction,
                "output_date": outputDate,
                "confidence_train": confidenceTrain,
                "confidence_test": confidenceTest,
                "confusion_matrix_score": confusionMatrixScore,
                "auc_roc_score": aucRocScore,
                "predictor_version": predictorVersion,
            })
        }
    
        c.JSON(http.StatusOK, results)
    })
    

    r.Run(":8080")
}
