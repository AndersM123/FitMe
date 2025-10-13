from fastapi import FastAPI, Request
from fastapi.responses import Response
import onnxruntime as ort
from utils import process_image
import uuid
import os

app = FastAPI()

MODEL_PATH = "model.onnx"
ort_session = ort.InferenceSession(MODEL_PATH, providers=["CPUExecutionProvider"])

@app.post("/remove-background")
async def remove_background(request: Request):
    try:
        # Read raw bytes
        file_bytes = await request.body()

        # Generate unique temp filenames to avoid conflicts
        uid = str(uuid.uuid4())
        temp_input_path = f"/tmp/input_{uid}.jpg"
        output_path = f"/tmp/output_{uid}.png"

        with open(temp_input_path, "wb") as f:
            f.write(file_bytes)

        # Process image
        process_image(temp_input_path, ort_session, MODEL_PATH, output_path)

        with open(output_path, "rb") as f:
            img_bytes = f.read()

        # Clean up temp files
        os.remove(temp_input_path)
        os.remove(output_path)

        print("✅ Image processed successfully")
        return Response(content=img_bytes, media_type="image/png")

    except Exception as e:
        print("❌ Error:", e)
        return Response(content=str(e), status_code=500)
