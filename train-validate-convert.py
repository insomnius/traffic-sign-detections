from ultralytics import YOLO

model_name = 'yolov8n'

print("==========")
print(f"Model: {model_name}")

print("------------------")
print("Model training...")
model = YOLO(f"{model_name}.pt")
train_result = model.train(data='./dataset/dataset.yaml', epochs=100, imgsz=640, device=0, batch=8, plots=True, seed=18, project=f"./training/{model_name}")
print("Train result: ", train_result)

print("------------------")
print("Model validations...")
metrics = model.val(save_json=True)
print("Metrics: ", metrics)
print("Mean average precisions: ", metrics.box.maps)
print("Map", metrics.box.map)
print("Map 50", metrics.box.map50)


print("------------------")
print("Model deployments, converting model to onnx format...")
model.export(format='onnx')