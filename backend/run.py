import sys
import os
import uvicorn

if __name__ == "__main__":
    # Pastikan current working directory adalah folder backend
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(backend_dir)
    sys.path.insert(0, backend_dir)

    print("===================================================")
    print("  🏛️ SIBIRU Backend Service (FastAPI + MySQL)")
    print("  Docs: http://127.0.0.1:8000/docs")
    print("===================================================\n")

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
