"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as ort from 'onnxruntime-web';
import Webcam from 'react-webcam';
import { isMobile } from 'react-device-detect';


const TrafficSignDetection: React.FC = () => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [session, setSession] = useState<ort.InferenceSession>();

  const loadModel = useCallback(async () => {

    try {
      ort.env.wasm.wasmPaths = '/onnxruntime-web/';
      const modelUrl = '/best.onnx';
      const loadedSession = await ort.InferenceSession.create(modelUrl, { executionProviders: ['wasm'] });
      console.log('Input Tensors:', loadedSession.inputNames);
      console.log('Output Tensors:', loadedSession.outputNames);
      setSession(loadedSession);
      console.log('Model loaded with WASM backend');
    } catch (e) {
      console.error('Failed to load model', e);
    }
  }, [])

  useEffect(() => {
    loadModel()
  }, [loadModel]);

  function iou(box1: any, box2: any) {
    return intersection(box1, box2) / union(box1, box2);
  }

  function union(box1: any, box2: any) {
    const [box1_x1, box1_y1, box1_x2, box1_y2] = box1;
    const [box2_x1, box2_y1, box2_x2, box2_y2] = box2;
    const box1_area = (box1_x2 - box1_x1) * (box1_y2 - box1_y1)
    const box2_area = (box2_x2 - box2_x1) * (box2_y2 - box2_y1)
    return box1_area + box2_area - intersection(box1, box2)
  }

  function intersection(box1: any, box2: any) {
    const [box1_x1, box1_y1, box1_x2, box1_y2] = box1;
    const [box2_x1, box2_y1, box2_x2, box2_y2] = box2;
    const x1 = Math.max(box1_x1, box2_x1);
    const y1 = Math.max(box1_y1, box2_y1);
    const x2 = Math.min(box1_x2, box2_x2);
    const y2 = Math.min(box1_y2, box2_y2);
    return (x2 - x1) * (y2 - y1)
  }

  const process_output = useCallback((output: Float32Array, img_width: number, img_height: number) => {
    const detection_classes = [
      "larangan berhenti",
      "larangan masuk bagi kendaraan bermotor dan tidak bermotor",
      "larangan parkir",
      "lampu hijau",
      "lampu kuning",
      "lampu merah",
      "larangan belok kanan",
      "larangan belok kiri",
      "larangan berjalan terus wajib berhenti sesaat",
      "larangan memutar balik",
      "peringatan alat pemberi isyarat lalu lintas",
      "peringatan banyak pejalan kaki menggunakan zebra cross",
      "peringatan pintu perlintasan kereta api",
      "peringatan simpang tiga sisi kiri",
      "peringatan penegasan rambu tambahan",
      "perintah masuk jalur kiri",
      "perintah pilihan memasuki salah satu jalur",
      "petunjuk area parkir",
      "petunjuk lokasi pemberhentian bus",
      "petunjuk lokasi putar balik",
      "petunjuk-penyeberangan-pejalan-kaki",
    ];

    type Box = [number, number, number, number, string, number];
    let boxes: Box[] = [];


    for (let index = 0; index < 8400; index++) {
      let maxClassId = 0;
      let maxProb = 0;

      for (let col = 0; col < 20; col++) {
        const prob = output[8400 * (col + 4) + index];
        if (prob > maxProb) {
          maxClassId = col;
          maxProb = prob;
        }
      }

      const class_id = maxClassId;
      const prob = maxProb;

      if (prob < 0.5) {
        continue;
      }

      const label = detection_classes[class_id];
      const xc = output[index];
      const yc = output[8400 + index];
      const w = output[2 * 8400 + index];
      const h = output[3 * 8400 + index];
      const x1 = (xc - w / 2) / 640 * img_width;
      const y1 = (yc - h / 2) / 640 * img_height;
      const x2 = (xc + w / 2) / 640 * img_width;
      const y2 = (yc + h / 2) / 640 * img_height;
      boxes.push([x1, y1, x2, y2, label, prob]);
    }

    boxes = boxes.sort((box1, box2) => box2[5] - box1[5])
    console.log(boxes)
    const result: any[] = []

    while (boxes.length > 0) {
      result.push(boxes[0]);
      boxes = boxes.filter(box => iou(boxes[0], box) < 0.7);
    }

    return result
  }, [])

  function draw_boxes(ctx: CanvasRenderingContext2D, boxes: any[]) {
    ctx.strokeStyle = "#00FF00";
    ctx.lineWidth = 3;
    ctx.font = "18px serif";
    boxes.forEach(([x1, y1, x2, y2, label]) => {
      ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
      ctx.fillStyle = "#00ff00";
      const width = ctx.measureText(label).width;
      ctx.fillRect(x1, y1, width + 10, 25);
      ctx.fillStyle = "#000000";
      ctx.fillText(label, x1, y1 + 18);
    });
  }

  const detectObjects = useCallback(async () => {
    if (
      webcamRef.current &&
      webcamRef.current.video &&
      webcamRef.current.video.readyState === 4 &&
      canvasRef.current
    ) {
      const video = webcamRef.current.video;
      const { videoWidth, videoHeight } = video;

      const canvas = canvasRef.current;
      canvas.width = videoWidth;
      canvas.height = videoHeight;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        const input = prepare_input(video, ctx)
        const output = await run_model(input, session as ort.InferenceSession)
        const boxes = process_output(output as Float32Array, videoWidth, videoHeight)
        draw_boxes(ctx, boxes)
      }
    }
  }, [session, process_output]);

  function prepare_input(img: CanvasImageSource, ctx: CanvasRenderingContext2D) {
    ctx.drawImage(img, 0, 0, 640, 640);

    const data = ctx.getImageData(0, 0, 640, 640).data;
    const red = [], green = [], blue = [];
    for (let index = 0; index < data.length; index += 4) {
      red.push(data[index] / 255);
      green.push(data[index + 1] / 255);
      blue.push(data[index + 2] / 255);
    }
    return [...red, ...green, ...blue];
  }

  async function run_model(input: number[], session: ort.InferenceSession) {
    const convertedInput = new ort.Tensor(Float32Array.from(input), [1, 3, 640, 640]);
    const outputs = await session.run({ 'images': convertedInput });
    return outputs["output0"].data;
  }

  useEffect(() => {
    const interval = setInterval(async () => {
      if (session) {
        await detectObjects();
      }
    }, 0);

    return () => clearInterval(interval);
  }, [session, detectObjects]);

  return (
    <div className="flex flex-col gap-6">
      <canvas
        ref={canvasRef}
        className="
      border border-black
      w-full max-w-3xl h-auto
      shadow-lg rounded-lg
    "
      ></canvas>

      <div className="relative w-640 h-640">
        <Webcam
          ref={webcamRef}
          audio={false}
          videoConstraints={{
            width: 640,
            height: 640,
            facingMode: isMobile ? { exact: 'environment' } : 'user',
          }}
          style={{
            position: 'absolute',
            marginLeft: 'auto',
            marginRight: 'auto',
            left: 0,
            right: 0,
            textAlign: 'center',
            zIndex: 8,
            width: 640,
            height: 640,
            visibility: 'hidden',
          }}
        />
      </div>
    </div>
  );
};

export default TrafficSignDetection;
