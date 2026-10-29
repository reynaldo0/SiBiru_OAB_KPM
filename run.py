import sys
import os

# Arahkan ke backend folder
root_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(root_dir, "backend")
os.chdir(backend_dir)
sys.path.insert(0, backend_dir)

import uvicorn

if __name__ == "__main__":
    print("===================================================")
    print("  🏛️ SIBIRU Backend Service (FastAPI + MySQL Laragon)")
    print("  Target DB: MySQL port 3306 (database: sibiru)")
    print("  Docs API : http://127.0.0.1:8000/docs")
    print("===================================================\n")

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
