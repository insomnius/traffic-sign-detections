Certainly! Here is an enhanced version of your `README.md` file, incorporating all necessary information:

---

# Indonesia Traffic Sign Recognition System Using YOLOV8

## Overview

This project is the final submission for ai indonesia bootcamp, aimed at developing a traffic sign recognition system specifically for traffic signs in Indonesia. The project leverages a pretrained YOLOv8 model and includes a web-based implementation using WebAssembly.

## Table of Contents

- [Indonesia Traffic Sign Recognition System Using YOLOV8](#indonesia-traffic-sign-recognition-system-using-yolov8)
  - [Overview](#overview)
  - [Table of Contents](#table-of-contents)
  - [Project Features](#project-features)
  - [Setup and Installation](#setup-and-installation)
    - [YOLOv8 Model Training](#yolov8-model-training)
    - [Web Application](#web-application)
  - [Dataset](#dataset)
  - [Deployment](#deployment)
    - [Deployment Architecture](#deployment-architecture)
  - [Acknowledgements](#acknowledgements)
  - [Teams](#teams)

## Project Features

- **Traffic Sign Detection**: Supports detection of various traffic signs used in Indonesia.
- **YOLOv8 Model**: Utilizes the YOLOv8 model family for detection, hyper-tuned for higher accuracy.
- **Web-Based Implementation**: Built using Next.js and ONNX Runtime for running the model on the web.

## Setup and Installation

### YOLOv8 Model Training

1. **Clone the Repository**:
   ```bash
   git clone git@github.com/insomnius/traffic-sign-detection
   cd traffic-sign-detection
   ```

2. **Train the Model**:
   ```python
   make train
   ```

3. **Move onnx model into web path**
   ```
   cp train/weights/best.onnx web/public/best.onnx
   ```

### Web Application

1. **Navigate to Web Application Directory**:
   ```bash
   cd web
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Run the Development Server**:
   ```bash
   npm run dev
   ```

## Dataset

The dataset used for training and validation is referenced from the paper "Implementasi Deep Learning untuk Object Detection Menggunakan Algoritma YOLO (You Only Look Once) pada Rambu Lalu Lintas di Indonesia" by Adhy Wiranto Sudjana.

- **Training Images**: 1469
- **Validation Images**: 399
- **Test Images**: 231

## Deployment

### Deployment Architecture

1. **Model Serving**:
   - The trained YOLOv8 model is exported to the ONNX format for cross-platform support and optimization.

2. **Web Application**:
   - Built using Next.js for the frontend.
   - Utilizes ONNX Runtime with WebAssembly for high-performance inference on the web.

3. **Frontend Implementation**:
   - Uses `react-webcam` to capture real-time video from the user's camera.
   - Overlays detected traffic signs on the video feed using HTML5 canvas API.

4. **Server Setup**:
   - Deploy the Next.js application on a server.
   - Ensure ONNX model files are accessible in the public directory.

## Acknowledgements

- **Adhy Wiranto Sudjana**: For the dataset referenced.
- **Joseph Redmon**: For creating the YOLO series.

## Teams

- **Group Coordinator**: Lila Setiyani ([Insomnius](https://cv-final-project.insomnius.dev))
- **Model Architect & Design**: Kusuma Noer Adi Purnomo
- **Model Experimentation Contributor**: Rifat Rachim K F
- **App Development & Deployment**: Muhammad Arief Rahman