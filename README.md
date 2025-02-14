# **Trustwise Assessment**

This project implements a REST API that processes text using ML models to analyze gibberish and emotions. The received text and results are stored in a database and displayed in a React frontend.

---

## **How to Run the Project**
Since Docker encountered issues with the frontend/backend, follow the manual setup instructions below.

---

## **Backend (Flask API)**
1. **Clone the repository**:
```sh
git clone https://github.com/AnjaliPaii/trustwise-assessment.git
cd trustwise-assessment
```

2. **Create and activate a virtual environment:**:
```sh
python3 -m venv venv
source venv/bin/activate  # if using Windows run: venv\Scripts\activate
```

3. **Install Dependencies:**:
```sh
pip install -r requirements.txt
```

4. **Run the backend:**:
```sh
python app.py
```
5. Backend should be running

## **Frontend (React + Vite)**
1. **Navigate to the frontend folder:**:
```sh
cd web-ui
```

2. **Install Dependencies:**:
```sh
npm install
```
3. **Run the frontend:**:
```sh
npm run dev
```
4. **Open the frontend:**:
run the frontend at http://localhost:5173.

## Docker Setup (not recommended)
The initial goal was to containerize both the backend and frontend using Docker. However, due to issues with various dependencies, Docker may not work properly.

### If you still want to try it:
```sh
docker-compose up --build
```

## API Documentation

### **API Endpoints**
### **POST /score**
**Description:** Analyzes the input text for gibberish and emotion.
**Request:**
```json
   {
      "text": "Your input text"
   }
```

**Response example:**
```json
  {
     "gibberish": "Clean",
     "gibberish_score": 0.87,
     "emotion": "Joy",
     "emotion_score": 0.95
   }
```
### **GET /logs**
**Description:** Fetches all analyzed text entries.

**Response example:**
```json
[
  {
    "id": 1,
    "text": "I love programming",
    "gibberish": "Clean",
    "gibberish_score": 0.90,
    "emotion": "Excitement",
    "emotion_score": 0.89
  }
]
```

### **DELETE /clear**
**Description:** Clears the database of all logs.
  
**Response example:**
```json
{ "message": "Logs cleared successfully" }
```
  
## Final Notes:
-  All functionality is working when run manually
-  Docker was attempted, but currently causes issues and is a work in progress
-  To fully test the application, please follow the manual setup instructions above.
