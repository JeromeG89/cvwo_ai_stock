from datetime import datetime, timedelta
import sqlite3
import yfinance as yf

# Initialize SQLite connection
conn = sqlite3.connect("price_cache.db",  check_same_thread=False)

cursor = conn.cursor()

# Create table for caching


def getOutcomePrice(symbol, output_date):
    print(f"Fetching price for {symbol} on {output_date}...")
    yf_symbol = yf.Ticker(symbol)

    try:
        prices = yf_symbol.history(
                start=output_date, end=output_date + timedelta(7), interval="1wk", auto_adjust=False
            )

        price_data = round(prices["Adj Close"].iloc[0], 3)
    except Exception as e:
        print(f"Find failed due to {e}")
        return None
    return price_data

def getOutcome(startPrice, endPrice, prediction):
    print(startPrice, endPrice, prediction)
    if prediction == "Long":
        return bool(endPrice > startPrice)
    elif prediction == "Short":
        return bool(endPrice < startPrice)
    else:
        return "Error -.-"
    

if __name__ == "__main__":
    print(getOutcomePrice('NVDA', "2024-12-30"))
