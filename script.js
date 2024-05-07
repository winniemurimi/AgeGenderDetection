const video = document.getElementById("video");

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
    faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
    faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
    faceapi.nets.faceExpressionNet.loadFromUri("/models"),
    faceapi.nets.ageGenderNet.loadFromUri("/models"),
]).then(webCam);

function webCam(){
    navigator.mediaDevices.getUserMedia({
        video:true,
        audio:false,
    }).then(
        (stream)=>{
            video.srcObject = stream;
        }
    ).catch(
        (error)=>{
            console.log(error);
        }
    )
}


video.addEventListener("play", () =>{
    const canvas = faceapi.createCanvasFromMedia(video);
    document.body.append(canvas);

    faceapi.matchDimensions(canvas, {height: video.height, width: video.width});

    setInterval(async () => {
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceExpressions()
          .withAgeAndGender();
      
        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

       const resizedWindow = faceapi.resizeResults(detections, {
            height: video.height,
            width: video.width,
        })
        faceapi.draw.drawDetections(canvas,  resizedWindow);
        faceapi.draw.drawFaceLandmarks(canvas,  resizedWindow);
        faceapi.draw.drawFaceExpressions(canvas,  resizedWindow);
        
        resizedWindow.forEach((detections) => {
            const box = detections.detections.box;
            const drawBox = new faceapi.draw.DrawBow(box, {
                label: Math.round(detections.age)+ "year old" + detections.gender,
            });
            drawBox.draw(canvas);
        })


        console.log(detections);
      }, 200);
})


