const nameForm = document.getElementById('nameForm');
const userNameInput = document.getElementById('userName');
const authMessage = document.getElementById('authMessage');
const video = document.getElementById('videoInput');

Promise.all([
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
]).then(start);
 
async function start() {
    document.body.append('Models Loaded');

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
    } catch (err) {
        console.error(err);
    }
}



nameForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const userName = userNameInput.value;

    // Check if the user exists in the backend
    const userExists = await checkUserExists(userName);
    

    if (userExists) {
        // Check if the user is voted
        const isVoted = await checkVoterStatus(userName);

        if (isVoted) {
            // If the user is voted, stop the process and display a message
            authMessage.innerText = 'You have already voted.';
            authMessage.style.display = 'block';
            setTimeout(() => {
                alert('You have allredy voted.');
                location.reload();
            }, 0);
        } else {
            const labeledDescriptors = await loadLabeledImages(userName);
            videoInput.style.display = 'block';
            authenticate(userName, labeledDescriptors);
        }
    } else {
        authMessage.innerText = 'User does not exist. Please check your details.';
        authMessage.style.display = 'block';
        setTimeout(() => {
            alert('User does not exist. Please check your details.');
            location.reload();
        }, 0); // 3 seconds delay
    }
});

async function checkVoterStatus(userName) {
    try {
        const response = await fetch(`/voter/${userName}/isVoted`);
        const data = await response.json();
        return data.isVoted;
    } catch (error) {
        console.error('Error checking voter status:', error);
        return false; // Return false in case of an error
    }
}

async function checkUserExists(userName) {
    try {
        const response = await fetch(`/voter-exists/${userName}`);
        const data = await response.json();
        return data.exists;
    } catch (error) {
        console.error('Error checking if user exists:', error);
        return false;
    }
}



async function authenticate(userName, labeledDescriptors) {
    const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.4);

    video.addEventListener('play', async () => {
        const canvas = faceapi.createCanvasFromMedia(video);
        document.body.append(canvas);

        const displaySize = { width: video.width, height: video.height };
        faceapi.matchDimensions(canvas, displaySize);

        setInterval(async () => {
            const detections = await faceapi.detectAllFaces(video).withFaceLandmarks().withFaceDescriptors();
            const resizedDetections = faceapi.resizeResults(detections, displaySize);
            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

            const results = resizedDetections.map((d) => {
                return faceMatcher.findBestMatch(d.descriptor);
            });

            const userResult = results.find(result => result.label === userName);
            if (userResult) {
                authMessage.innerText = `Authentication successful for ${userName}!`;
               
                authMessage.style.display = 'block';
                
                window.location.href = `voting.html?userName=${userName}`;
            } else {
                authMessage.innerText = 'Authentication failed.';
                authMessage.style.display = 'block';
            }

            results.forEach((result, i) => {
                const box = resizedDetections[i].detection.box;
                const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() });
                drawBox.draw(canvas);
            });
        }, 100);
    });
}

async function loadLabeledImages(userName) {
    try {
        const labels = [userName];
    return Promise.all(
        labels.map(async (label) => {
            const descriptions = [];
            for (let i = 1; i <= 1; i++) {
                const img = await faceapi.fetchImage(`../labeled_images/${label}/${i}.jpg`);
                const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
                descriptions.push(detections.descriptor);
            }
            document.body.append(`${label} Faces Loaded | `);
            return new faceapi.LabeledFaceDescriptors(label, descriptions);
        })
    ); 
    } catch (error) {
     console.log(error);   
    }
    
}
