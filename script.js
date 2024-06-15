 // Access the video element
const videoElement = document.getElementById('videoElement');

// Access the switch camera button
const switchCameraButton = document.getElementById('switchCameraButton');

// Variable to track the current camera
let currentCamera = null;

// Event listener for switch camera button
switchCameraButton.addEventListener('click', function() {
    switchCamera();
});

// Function to switch camera
function switchCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        console.error('enumerateDevices() not supported.');
        return;
    }

    navigator.mediaDevices.enumerateDevices()
    .then(devices => {
        const videoDevices = devices.filter(device => device.kind === 'videoinput');

        if (videoDevices.length < 2) {
            console.warn('Only one camera available.');
            return;
        }

        const currentDeviceId = currentCamera ? currentCamera.deviceId : null;
        let nextDeviceIndex = videoDevices.findIndex(device => device.deviceId !== currentDeviceId);

        if (nextDeviceIndex === -1) {
            nextDeviceIndex = 0; // Wrap around to the first device if the current device is the last one
        }

        const nextDeviceId = videoDevices[nextDeviceIndex].deviceId;

        // Stop the current stream
        if (videoElement.srcObject) {
            videoElement.srcObject.getTracks().forEach(track => track.stop());
        }

        // Get stream from the next device
        navigator.mediaDevices.getUserMedia({
            video: { deviceId: { exact: nextDeviceId } }
        })
        .then(stream => {
            videoElement.srcObject = stream;
            currentCamera = videoDevices[nextDeviceIndex];
        })
        .catch(error => {
            console.error('Error accessing camera:', error);
        });
    })
    .catch(error => {
        console.error('Error enumerating devices:', error);
    });
}

// Rest of your code...

// Access the Protanope and Deutranope buttons
const protanopeButton = document.getElementById('protanopeButton');
const deutranopeButton = document.getElementById('deutranopeButton');

// Variable to track the current filter
let currentFilter = '';

// Event listener for Protanope button
protanopeButton.addEventListener('click', function() {
    // Apply Protanope filter
    applyFilter('protanope');
});

// Event listener for Deutranope button
deutranopeButton.addEventListener('click', function() {
    // Apply Deutranope filter
    applyFilter('deutranope');
});

// Function to apply filter
function applyFilter(filter) {
    // Remove the current filter
    removeFilter();

    // Apply the new filter
    if (filter === 'protanope') {
        // Reds appear more green and less bright
        videoElement.style.filter = 'grayscale(100%) sepia(100%) brightness(70%) saturate(120%)';
    } else if (filter === 'deutranope') {
        // Greens appear more red
        videoElement.style.filter = 'grayscale(100%) brightness(80%) saturate(150%)';
    }

    // Update the current filter
    currentFilter = filter;
}

// Function to remove filter
function removeFilter() {
    videoElement.style.filter = ''; // Reset filter to default
    currentFilter = ''; // Update current filter
}

// Access the camera capture button
const cameraCaptureButton = document.getElementById('cameraCaptureButton');

// Event listener for camera capture button
cameraCaptureButton.addEventListener('click', function() {
    captureImage();
});

// Function to capture image from video stream with applied filter
function captureImage() {
    const canvasElement = document.createElement('canvas');
    
    // Set canvas dimensions to match the video stream
    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;

    // Draw current video frame onto the canvas
    const ctx = canvasElement.getContext('2d');

    // Draw the video frame with the current filter
    if (currentFilter !== '') {
        ctx.filter = videoElement.style.filter;
    }
    ctx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);

    // Convert canvas to data URL
    const imageDataURL = canvasElement.toDataURL('image/jpeg');

    // Create a temporary anchor element to trigger download
    const downloadLink = document.createElement('a');
    downloadLink.href = imageDataURL;
    downloadLink.download = 'captured_image.jpg';
    downloadLink.click();
}
