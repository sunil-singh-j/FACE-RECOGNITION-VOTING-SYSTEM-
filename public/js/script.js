
const video = document.getElementById('videoInput');

Promise.all([
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('/models')   
]).then(start).catch(error => {
    console.error('Error loading models:', error);
});

function start() {
    document.body.append('Models loaded');
    // Set up video input and perform face recognition/detection logic

    video.src='../videos/speech.mp4'
   recognizefaces() 


}

async function recognizefaces(){

    const labeledDescriptors =await loadlabedImages()
    const faceMatcher=new faceapi.FaceMatcher(labeledDescriptors,0.6)
    video.addEventListener('play', ()=>{
        console.log("vidfdl playing" );

        const canvas=faceapi.createCanvasFromMedia(video)
        document.body.append(canvas)

        const displaySize={width:video.width,height:video.height }
        faceapi.matchDimensions(canvas,displaySize)
 
        setInterval(async ()=>{
            const detections=await faceapi.detectALLFaces(video).widthFaceLandmarks().withFaceDiscriptors()

            const resizedDetections=faceapi.resizeResults(detections,displaySize)
            canvas.getContext('2d').clearRect(0,0, canvas.width,canvas.height)


            const results=resizedDetections.map((d)=>{
                return  faceMatcher .findBestMatch(d.descriptor)
            })

            results.forEach((result,i)=>{
                const box =resizedDetections[i].detections.box
                const drawBox=new faceapi.draw.deawBox(Box,{label:result.toString()})
                drawBox.draw(canvas)

            })

        },100)
          
    })

}

function loadlabedImages(){
    const labels=['Black Widow','captain America', 'captain Marvel','iron Man']
    return Promise.all(
        labels.map(async(label)=>{
            const descriptions=[]
            for(let i=1;i<=2;i++){
                const img=await faceapi.fetchImage(`../labeled_images/${label}/${i}.jpg`)
                const detections=await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
                descriptions.push(detections.descriptor)
            }
            document.body.append(label+'faces loaded')
            return new faceapi.LabeledDescriptors(label, descriptions)
        })
    )

}


