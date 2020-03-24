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
    // XXX: Reset the aspect ratio:
    document.getElementById("aspect-btn-free").click();
    // Apply crop:
    const containerData = cropper.getContainerData();

    // Zoom to 50% from the center of the container.
    cropper.zoomTo(0.001, {
    x: containerData.width / 2,
    y: containerData.height / 2,
    });
    cropper.setData(crop_data);
    // Set values to the input fields:
    document.getElementById('dataX_pred').value = Math.round(crop_data.x);
    document.getElementById('dataY_pred').value = Math.round(crop_data.y);
    document.getElementById('dataWidth_pred').value = Math.round(crop_data.width);
    document.getElementById('dataHeight_pred').value = Math.round(crop_data.height);
    document.getElementById('dataRotate_pred').value = Math.round(crop_data.rotate);
}


function setupUserCropBindings() {
    document.getElementById("dataX_user").addEventListener("change", function(event) {
        cropper.setData({x: parseInt(event.target.value)});
    });
    document.getElementById("dataY_user").addEventListener("change", function(event) {
        cropper.setData({y: parseInt(event.target.value)});
    });
    document.getElementById("dataWidth_user").addEventListener("change", function(event) {
        cropper.setData({width: parseInt(event.target.value)});
    });
    document.getElementById("dataHeight_user").addEventListener("change", function(event) {
        cropper.setData({height: parseInt(event.target.value)});
    });
    document.getElementById("dataRotate_user").addEventListener("change", function(event) {
        cropper.setData({rotate: parseInt(event.target.value)});
    });
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
        zoomable: false,
        viewMode: 2,
        background: false,
        crop(event) {
            // Set up data bindings:
            document.getElementById('dataX_user').value = Math.round(event.detail.x);
            document.getElementById('dataY_user').value = Math.round(event.detail.y);
            document.getElementById('dataWidth_user').value = Math.round(event.detail.width);
            document.getElementById('dataHeight_user').value  = Math.round(event.detail.height);
            document.getElementById('dataRotate_user').value = Math.round(event.detail.rotate);
        }
    });







}


function bindOptionButtons() {
    const one_btn = document.getElementById("aspect-btn-one");
    const free_btn = document.getElementById("aspect-btn-free");

    one_btn.addEventListener("click", function(){
        one_btn.classList.toggle("active");
        free_btn.classList.toggle("active");
        cropper.setAspectRatio(1);
    });
    document.getElementById("aspect-btn-free").addEventListener("click", function(){
        one_btn.classList.toggle("active");
        free_btn.classList.toggle("active");
        cropper.setAspectRatio(null);
    });
}


document.addEventListener("DOMContentLoaded",async function(){
    // Handler when the DOM is fully loaded
    await pred.loadLocalModel();
    setupCropper();
    setupImageUploader();
    setupUserCropBindings();
    bindOptionButtons();
    // Bind the reset button:
    document.getElementById("reset-pred-btn").addEventListener("click", function(){
        applyPredictedCrop(previous_prediction);
    });


});

