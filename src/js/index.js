import * as pred from './predictor.js'

let model;  // Model
let cropper;  // The awesome Cropper.js
let previous_prediction = {};

function getCropValues(w, h, crop) {
    // Convert from Top, Left, Bottom, Right crop coordinates to
    // X, Y, Width, Height
    const cropData = {
        x: w*crop[0],
        y: h*crop[1],
        width: w*(crop[2]-crop[0]),
        height: h*(crop[3]-crop[1]),
        rotate: crop[4]
        // scaleX: 1,
        // scaleY: 1,
    }
    console.log("Raw results, just for you ;)", cropData);
    return cropData;
}


async function predictImageCrop() {
    // Get the image data:
    const imgData = cropper.getData();
    const imgDataEl = document.getElementById('myimage_sqrd');

    // Predict using our model:
    const crop_values = await pred.predictImageCrop(imgDataEl);

    // Convert into crop values:
    const crop_data = getCropValues(imgData.width, imgData.height, crop_values);
    // Stash values:
    previous_prediction = crop_data;
    // Apply crop:
    applyPredictedCrop(crop_data);

}


function applyPredictedCrop(crop_data) {
    // Apply crop:
    cropper.setData(crop_data);

    // Set values to the input fields:
    document.getElementById('dataX_pred').value = Math.round(crop_data.x);
    document.getElementById('dataY_pred').value = Math.round(crop_data.y);
    document.getElementById('dataWidth_pred').value = Math.round(crop_data.width);
    document.getElementById('dataHeight_pred').value = Math.round(crop_data.height);
    document.getElementById('dataRotate_pred').value = Math.round(crop_data.rotate);
}


function setupImageUploader() {
    document.getElementById('image-uploader').onchange = function (evt) {
        var tgt = evt.target || window.event.srcElement,
        files = tgt.files;

        // FileReader support
        if (FileReader && files && files.length) {
            var fr = new FileReader();
            fr.onload = async function () {
                const imgDataEl = document.getElementById('myimage_sqrd');
                // const imgViewEl = document.getElementById('myimage_view');
                imgDataEl.src = fr.result;
                // imgViewEl.src = fr.result;
                //document.getElementById('result-image').src = fr.result;
                cropper.replace(fr.result, false)
            }
            fr.readAsDataURL(files[0]);
        }

        // Not supported
        else {
            console.log("[LOADING IMG]: Something went wrong with loading the photo.")
        }
    }
}


function setupCropper() {
    // XXX: Could we create the cropper without image?
    const cropper_img = document.getElementById('result-image');
    cropper_img.addEventListener('ready', function () {
        predictImageCrop();
    });

    cropper = new Cropper(cropper_img, {
        zoomOnWheel: false,
        viewMode: 1,
        background: false,
        crop(event) {
            // Set up data bindings:
            document.getElementById('dataX_user').value = Math.round(event.detail.x);
            document.getElementById('dataY_user').value = Math.round(event.detail.y);
            document.getElementById('dataHeight_user').value = Math.round(event.detail.width);
            document.getElementById('dataWidth_user').value  = Math.round(event.detail.height);
            document.getElementById('dataRotate_user').value = Math.round(event.detail.rotate);
        }
    });







}

document.addEventListener("DOMContentLoaded",async function(){
    // Handler when the DOM is fully loaded
    await pred.loadLocalModel();
    setupCropper();
    setupImageUploader();

    // Bind the reset button:
    document.getElementById("reset-pred-btn").addEventListener("click", function(){
        applyPredictedCrop(previous_prediction);
    });
});

