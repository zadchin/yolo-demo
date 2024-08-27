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
    const labelSection = document.getElementById('label-section');
    const annotationSection = document.getElementById('annotation-section');
    const fileList = document.getElementById('fileList');
    
    // Reset label section and annotation section
    labelSection.classList.remove('show');
    annotationSection.style.display = 'none';
    fileList.innerHTML = ''; // Clear previous files
    
    if (images.length === 0) return;

    images.forEach((file, index) => {
        const listItem = document.createElement('li');
        const progressBar = document.createElement('div');
        const progressBarFill = document.createElement('div');

        listItem.innerHTML = `<span>${file.name}</span>`;

        progressBar.className = 'progress';
        progressBarFill.className = 'progress-bar';

        progressBar.appendChild(progressBarFill);
        listItem.appendChild(progressBar);
        fileList.appendChild(listItem);

        const reader = new FileReader();
        reader.onloadstart = function() {
            progressBarFill.style.width = '0%';
        };
        reader.onprogress = function(e) {
            if (e.lengthComputable) {
                const percentLoaded = Math.round((e.loaded / e.total) * 100);
                progressBarFill.style.width = percentLoaded + '%';
            }
        };
        reader.onloadend = function() {
            progressBarFill.style.width = '100%';
            setTimeout(() => {
                listItem.removeChild(progressBar);
            }, 500); // Remove progress bar after 0.5s
        };
        reader.onload = function(e) {
            if (index === 0) {
                showImage(0);
                setTimeout(() => {
                    labelSection.style.display = 'block'; // Show label section
                    setTimeout(() => {
                        labelSection.classList.add('show'); // Fade in the label section
                    }, 10); // Small delay to trigger transition
                    annotationSection.style.display = 'block';
                }, 500); // Delay to ensure smooth transition after upload
            }
        };
        reader.readAsDataURL(file);
    });
}


function deleteFile(index) {
    images.splice(index, 1); // Remove the file from the list
    updateFileList(); // Update the display
    if (images.length > 0) {
        showImage(Math.min(currentImageIndex, images.length - 1));
    } else {
        // If no images left, hide sections
        const labelSection = document.getElementById('label-section');
        const annotationSection = document.getElementById('annotation-section');
        labelSection.style.display = 'none';
        annotationSection.style.display = 'none';
        $screenshot.src = ''; // Clear the image
    }
}

function updateFileList() {
    const fileList = document.getElementById('fileList');
    fileList.innerHTML = ''; // Clear previous files

    images.forEach((file, index) => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <span>${file.name}</span>
            <span class="delete-icon" onclick="deleteFile(${index})">&times;</span>
        `;
        fileList.appendChild(listItem);
    });
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

  
        // Create the main picture image
        const resultImage = document.createElement('img');
        resultImage.src = confValue < 0.5 ? 'pictureA.png' : 'pictureB.png';
        resultImage.alt = 'Training Result Picture';
        resultImage.classList.add('main-image');
  
        // Append both images to the result container
        trainingResult.appendChild(resultImage);
  
        // Update the training status
        trainingStatus.textContent = "Training Completed! 🎉";
      }
    }, 2000); // Change step every 2 seconds
  }
  