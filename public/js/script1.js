const video = document.getElementById('videoInput');

Promise.all([
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
]).then(start).catch(error => {
    console.error('Error loading models:', error);
});

async function start() {
    document.body.append('Models Loaded');

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
    } catch (err) {
        console.error(err);
    }

    recognizeFaces();
}

async function recognizeFaces() {
    const labeledDescriptors = await loadLabeledImages();
    const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.7);

    video.addEventListener('play', async () => {
        console.log('Playing');
        const canvas = faceapi.createCanvasFromMedia(video);
        document.body.append(canvas);

        const displaySize = { width: video.width, height: video.height };
        faceapi.matchDimensions(canvas, displaySize);

        setInterval(async () => {
            const detections = await faceapi.detectAllFaces(video).withFaceLandmarks().withFaceDescriptors();

            const resizedDetections = faceapi.resizeResults(detections, displaySize);

            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

            const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor));
            results.forEach((result, i) => {
                const box = resizedDetections[i].detection.box;
                const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() });
                drawBox.draw(canvas);
            });
        }, 100);
    });
}

async function loadLabeledImages() {
    const labels = ['Prashant Kumar']; // for Webcam
    const labeledDescriptors = [];

    for (const label of labels) {
        const descriptions = [];

        for (let i = 1; i <= 2; i++) {
            const img = await faceapi.fetchImage(`../labeled_images/${label}/${i}.jpg`);
            const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();

            if (detections) {
                descriptions.push(detections.descriptor);
            }
        }

        if (descriptions.length > 0) {
            document.body.append(label + ' Faces Loaded | ');
            labeledDescriptors.push(new faceapi.LabeledFaceDescriptors(label, descriptions));
        }
    }

    return labeledDescriptors;
}
