const $ = document.querySelector.bind(document);

/**
 * Collection of rectangles defining user-generated regions
 */
let rectangles = [];
let currentImageIndex = 0;
let images = [];

// DOM elements
const $screenshot = $('#screenshot');
const $draw = $('#draw');
const $marquee = $('#marquee');
const $boxes = $('#boxes');

// Temp variables
let startX = 0;
let startY = 0;
const marqueeRect = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
};

$marquee.classList.add('hide');
$screenshot.addEventListener('pointerdown', startDrag);

function startDrag(ev) {
  // middle button delete rect
  if (ev.button === 1) {
    const rect = hitTest(ev.layerX, ev.layerY);
    if (rect) {
      rectangles.splice(rectangles.indexOf(rect), 1);
      redraw();
    }
    return;
  }
  window.addEventListener('pointerup', stopDrag);
  $screenshot.addEventListener('pointermove', moveDrag);
  $marquee.classList.remove('hide');
  startX = ev.layerX;
  startY = ev.layerY;
  drawRect($marquee, startX, startY, 0, 0);
}

function stopDrag(ev) {
  $marquee.classList.add('hide');
  window.removeEventListener('pointerup', stopDrag);
  $screenshot.removeEventListener('pointermove', moveDrag);
  if (ev.target === $screenshot && marqueeRect.width && marqueeRect.height) {
    rectangles.push(Object.assign({}, marqueeRect));
    redraw();
  }
}

function moveDrag(ev) {
  let x = ev.layerX;
  let y = ev.layerY;
  let width = startX - x;
  let height = startY - y;
  if (width < 0) {
    width *= -1;
    x -= width;
  }
  if (height < 0) {
    height *= -1;
    y -= height;
  }
  Object.assign(marqueeRect, { x, y, width, height });
  drawRect($marquee, marqueeRect);
}

function hitTest(x, y) {
  return rectangles.find(rect => (
    x >= rect.x &&
    y >= rect.y && 
    x <= rect.x + rect.width &&
    y <= rect.y + rect.height
  ));
}

function redraw() {
  $boxes.innerHTML = '';
  rectangles.forEach((data) => {
    $boxes.appendChild(drawRect(
      document.createElementNS("http://www.w3.org/2000/svg", 'rect'), data
    ));
  });
}

function drawRect(rect, data) {
  const { x, y, width, height } = data;
  rect.setAttributeNS(null, 'width', width);
  rect.setAttributeNS(null, 'height', height);
  rect.setAttributeNS(null, 'x', x);
  rect.setAttributeNS(null, 'y', y);
  return rect;
}

function redirectToTrain() {
  window.location.href = "train.html";
}

function handleImageUpload(event) {
    images = Array.from(event.target.files);  // Store all uploaded images
    const progressBar = document.getElementById('progress-bar');
    const progress = document.getElementById('progress');
    const labelSection = document.getElementById('label-section');
    const annotationSection = document.getElementById('annotation-section');
    
    // Reset progress and label section
    progress.style.width = '0%';
    labelSection.style.display = 'none';
    annotationSection.style.display = 'none';
    
    if (images.length === 0) return;
    
    let uploadProgress = 0;
    const interval = setInterval(() => {
      uploadProgress += 10;
      progress.style.width = `${uploadProgress}%`;
      
      if (uploadProgress >= 100) {
        clearInterval(interval);
        // Show label section and annotation section after upload completes
        labelSection.style.display = 'block';
        annotationSection.style.display = 'block';
        showImage(0);  // Show the first uploaded image
      }
    }, 100); // Simulate progress every 100ms
  }
  

function showImage(index) {
    if (index >= 0 && index < images.length) {
      currentImageIndex = index;
      const reader = new FileReader();
      reader.onload = function(e) {
        $screenshot.src = e.target.result;
      };
      reader.readAsDataURL(images[currentImageIndex]);
      
      // Clear rectangles when switching images
      rectangles = [];
      redraw();
      
      document.getElementById('image-index').textContent = `${currentImageIndex + 1}/${images.length}`;
      
      // Show "Train Model" button only on the last image
      const finishBtn = document.getElementById('finish-btn');
      if (currentImageIndex === images.length - 1) {
        finishBtn.style.display = 'block';
      } else {
        finishBtn.style.display = 'none';
      }
    }
  }

function prevImage() {
  if (currentImageIndex > 0) {
    showImage(currentImageIndex - 1);
  }
}

function nextImage() {
  if (currentImageIndex < images.length - 1) {
    showImage(currentImageIndex + 1);
  }
}

function redirectToTrain() {
  window.location.href = "train.html";
}


  function updateValue(type, value) {
    document.getElementById(`${type}-value`).textContent = value;
  }
  
  function handleTrain() {
    const confValue = parseFloat(document.getElementById('conf-slider').value);
    const epochsValue = parseInt(document.getElementById('epochs-slider').value);
    const imageSizeValue = parseInt(document.getElementById('imageSz-slider').value);
    const trainingStatus = document.getElementById('training-status');
    const trainingResult = document.getElementById('training-result');
  
    trainingResult.innerHTML = ''; // Clear any previous result
  
    const steps = [
      "The model is brewing... ☕",
      "Preparing the magic... ✨",
      "Adding the last bit of works to be done... 🔮"
    ];
  
    let stepIndex = 0;
  
    // Display the first step immediately
    trainingStatus.textContent = steps[stepIndex];
    stepIndex++;
  
    const interval = setInterval(() => {
      if (stepIndex < steps.length) {
        trainingStatus.textContent = steps[stepIndex];
        stepIndex++;
      } else {
        clearInterval(interval);
  
        // Create the graph image
        // const graphImage = document.createElement('img');
        // graphImage.src = confValue < 0.5 ? 'graphA.png' : 'graphB.png';
        // graphImage.alt = 'Training Result Graph';
        // graphImage.classList.add('graph-image');
  
        // Create the main picture image
        const resultImage = document.createElement('img');
        resultImage.src = confValue < 0.5 ? 'pictureA.png' : 'pictureB.png';
        resultImage.alt = 'Training Result Picture';
        resultImage.classList.add('main-image');
  
        // Append both images to the result container
        trainingResult.appendChild(resultImage);
        // trainingResult.appendChild(graphImage);
  
        // Update the training status
        trainingStatus.textContent = "Training Completed! 🎉";
      }
    }, 2000); // Change step every 2 seconds
  }
  