from fastapi import FastAPI, HTTPException, Body, BackgroundTasks
from pydantic import BaseModel
from dotenv import load_dotenv
from typing import List, Union, Optional
from datetime import date, timedelta, datetime
from results import getOutcomePrice, getOutcome

import mysql.connector
import os
import bcrypt
import sqlite3

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()




DB_FILE = "database.db"  # Path to your SQLite file

def get_db_connection():
    connection = sqlite3.connect(DB_FILE)
    connection.row_factory = sqlite3.Row  # Enables dict-like access to rows
    return connection

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React app URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

load_dotenv()


# Pydantic models
class LogEntry(BaseModel):
    ticker: str
    log_date: str
    price: float
    n_weeks: int
    prediction: str
    output_date: str
    final_price: Union[float, str, None]
    confidence_train: float
    confidence_test: float
    confusion_matrix_score: float
    auc_roc_score: float
    outcome: Union[bool, str, None]
    predictor_version: Union[str, None]

class chatLog(BaseModel):
    id: int
    user: str
    ticker: Optional[str]
    message: Optional[str]
    timestamp: Optional[str] = None


# Route to fetch all logs

@app.get("/")
def home():
    return "Welcome Home"


@app.get("/logs/{aucMin}", response_model=List[LogEntry])
def get_logs(aucMin: float, background_tasks: BackgroundTasks):
    print(f"Received aucMin: {aucMin}")
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        
        # Query to fetch logs
        query = """
        SELECT * FROM logs 
        WHERE auc_roc_score >= ?
        ORDER BY log_date DESC
        """
        cursor.execute(query, (aucMin,))
        results = cursor.fetchall()
        results = [dict(row) for row in results]
        # Process each result
        for result in results:
            if isinstance(result["output_date"], str):
                result["output_date"] = datetime.strptime(result["output_date"], "%Y-%m-%d")
            
            today = datetime.combine(date.today(), datetime.min.time())
            # Check if output_date is in the past and final_price is missing
            if result["output_date"] + timedelta(7) < today and not result.get("output_price"):
                print(f"Processing {result['ticker']} for output_date {result['output_date']}...")
                
                # Fetch final_price
                final_price = getOutcomePrice(
                    symbol=result["ticker"], 
                    output_date=result["output_date"]
                )
                
                # Calculate outcome
                outcome = getOutcome(
                    startPrice=result["price"], 
                    endPrice=final_price, 
                    prediction=result["prediction"]
                )
                
                # Update database with new data
                update_query = """
                UPDATE logs
                SET output_price = ?, outcome = ?
                WHERE id = ?
                """
                cursor.execute(update_query, (final_price, bool(outcome), result["id"]))
                connection.commit()
                
                # Update the result object in memory for the API response
                result["final_price"] = final_price
                result["outcome"] = outcome
            if not result.get('output_price', None):
                result['final_price'] = "Pending"
            else:
                result['final_price'] = result['output_price']
            if not result.get('outcome', None):
                result['outcome'] = "Pending"
            # Convert date fields to strings for JSON serialization
            if isinstance(result["log_date"], date):
                result["log_date"] = result["log_date"].strftime("%Y-%m-%d")
            if isinstance(result["output_date"], date):
                result["output_date"] = result["output_date"].strftime("%Y-%m-%d")

        return results
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=f"Server Error: {e}")
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

# Route to fetch a log by ticker
@app.get("/logs/{ticker}/{aucMin}", response_model=List[LogEntry])
def get_logs_by_ticker(ticker: str, aucMin: float):
    print(f"Received {ticker} for {aucMin}")
    print(ticker)
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        query = """
        SELECT * FROM logs
        WHERE LOWER(ticker) LIKE ?
        AND auc_roc_score >= ?
        ORDER BY log_date DESC"""
        cursor.execute(query, (f"%{ticker}%", aucMin,))
        results = cursor.fetchall()
        results = [dict(row) for row in results]

        print(results)
        for result in results:
            if isinstance(result["log_date"], date):
                result["log_date"] = result["log_date"].strftime("%Y-%m-%d")

            if isinstance(result["output_date"], date):
                result["output_date"] = result["output_date"].strftime("%Y-%m-%d")

            if not result.get('output_price', None):
                result['final_price'] = "Pending"
            else:
                result['final_price'] = result['output_price']

            if not result.get('outcome', None):
                result['outcome'] = "Pending"
                
        return results

    except mysql.connector.Error as e:
        raise HTTPException(status_code=500, detail=f"MySQL Error: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server Error: {e}")
    finally:
        if 'cursor' in locals() and cursor:
            cursor.close()
        if 'connection' in locals() and connection:
            connection.close()

@app.get("/forum/chat", response_model=List[chatLog])
def get_chat():
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        query = """
        SELECT * FROM forum_chats 
        ORDER BY timestamp DESC"""
        cursor.execute(query)
        results = cursor.fetchall()
        results = [dict(row) for row in results]
        for result in results:
            if result["timestamp"]:
                result["timestamp"] = result["timestamp"].strftime("%Y-%m-%d %H:%M:?")
        print(results)
        return results

    except mysql.connector.Error as e:
        raise HTTPException(status_code=500, detail=f"MySQL Error: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server Error: {e}")
    finally:
        if 'cursor' in locals() and cursor:
            cursor.close()
        if 'connection' in locals() and connection:
            connection.close()

@app.get("/forum/chat/{ticker}", response_model=List[chatLog])
def get_chat(ticker: str):
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        query = """
        SELECT * FROM forum_chats
        WHERE LOWER(ticker) LIKE ? 
        ORDER BY timestamp DESC"""
        cursor.execute(query, (f"%{ticker}%",))
        results = cursor.fetchall()
        results = [dict(row) for row in results]
        for result in results:
            if result["timestamp"]:
                result["timestamp"] = result["timestamp"].strftime("%Y-%m-%d %H:%M:?")
        print(results)
        return results

    except mysql.connector.Error as e:
        raise HTTPException(status_code=500, detail=f"MySQL Error: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server Error: {e}")
    finally:
        if 'cursor' in locals() and cursor:
            cursor.close()
        if 'connection' in locals() and connection:
            connection.close()


@app.post("/forum/chat")
def create_chat(user: str = Body(...), ticker: Optional[str] = Body(None), message: str = Body(...)):
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        query = """
        INSERT INTO forum_chats (user, ticker, message)
        VALUES (?, ?, ?)
        """
        cursor.execute(query, (user, ticker, message))
        connection.commit()

        return {"message": "Post created successfully!", "id": cursor.lastrowid}
    except mysql.connector.Error as e:
        raise HTTPException(status_code=500, detail=f"MySQL Error: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server Error: {e}")
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()



@app.post("/register")
def register_user(username: str = Body(...), email: str = Body(...), password: str = Body(...)):
    try:
        # Hash the password
        hashed_password = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())

        # Insert the user into the database
        connection = get_db_connection()
        cursor = connection.cursor()
        query = """
        INSERT INTO users (username, email, password_hash)
        VALUES (?, ?, ?)
        """
        cursor.execute(query, (username, email, hashed_password))
        connection.commit()

        return {"message": "User registered successfully!"}
    except mysql.connector.Error as e:
        raise HTTPException(status_code=500, detail=f"MySQL Error: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server Error: {e}")
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

@app.post("/login")
def login_user(username: str = Body(...), password: str = Body(...)):
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        query = "SELECT id, password_hash FROM users WHERE username = ?"
        cursor.execute(query, (username,))
        user = cursor.fetchone()

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Verify the password
        if bcrypt.checkpw(password.encode("utf-8"), user["password_hash"].encode("utf-8")):
            return {"message": "Login successful", "user_id": user["id"]}
        else:
            raise HTTPException(status_code=401, detail="Invalid credentials")
    except mysql.connector.Error as e:
        raise HTTPException(status_code=500, detail=f"MySQL Error: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server Error: {e}")
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()


class UpdateMessage(BaseModel):
    message: str

@app.put("/forum/chat/{chat_id}")
def update_chat(chat_id: int, update: UpdateMessage):
    print(f"Update Payload: chat_id={chat_id},  message={update.message}")
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        
        # Check if the chat belongs to the user
        cursor.execute("SELECT user FROM forum_chats WHERE id = ?", (chat_id,))
        chat = cursor.fetchone()
        if not chat:
            raise HTTPException(status_code=404, detail="Chat not found")


        # Update the message
        query = "UPDATE forum_chats SET message = ? WHERE id = ?"
        cursor.execute(query, (update.message, chat_id))
        connection.commit()

        return {"message": "Chat updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()


@app.delete("/forum/chat/{chat_id}")
def delete_chat(chat_id: int):
    print(f"Delete Payload: chat_id={chat_id}")
    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        # Check if the chat belongs to the user
        cursor.execute("SELECT user FROM forum_chats WHERE id = ?", (chat_id,))
        chat = cursor.fetchone()
        if not chat:
            raise HTTPException(status_code=404, detail="Chat not found")

        # Delete the chat
        query = "DELETE FROM forum_chats WHERE id = ?"
        cursor.execute(query, (chat_id,))
        connection.commit()

        return {"message": "Chat deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()
