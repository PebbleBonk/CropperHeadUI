import * as pred from './predictor.js'

let model;  // Model
let cropper;  // The awesome Cropper.js
let uploader; // The almost equally awsome, modded, HTML5-ImageUploader
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

function getNormalisedCropValues(w, h, crop) {
    // Convert from x, y, width, height crop coordinates to
    // Top Left Bottom Right
    const cropData = {
        top: crop[0]/w,
        left: crop[1]/h,
        bottom: (crop[2]-crop[0])/w,
        right: (crop[3]-crop[1])/h,
        rotate: crop[4]
        // scaleX: 1,
        // scaleY: 1,
    }
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
        const imgDataEl = document.getElementById('myimage_sqrd');
        const fileNameEl = document.getElementById('currentFilename');

        // FileReader support
        if (FileReader && files && files.length) {
            var fr = new FileReader();
            fr.onload = async function () {
                imgDataEl.src = fr.result;
                fileNameEl.value = tgt.files[0].name
                cropper.replace(fr.result, false)
            }
            fr.readAsDataURL(files[0]);
            document.getElementById('uploader-button').disabled = false;
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
        preview: ".crop-preview",
        crop(event) {
            // Set up data bindings:
            document.getElementById('dataX_user').value = Math.round(event.detail.x);
            document.getElementById('dataY_user').value = Math.round(event.detail.y);
            document.getElementById('dataWidth_user').value = Math.round(event.detail.width);
            document.getElementById('dataHeight_user').value  = Math.round(event.detail.height);
            document.getElementById('dataRotate_user').value = Math.round(event.detail.rotate);

            let imData = cropper.getImageData();
            let im_w = imData.width;
            let im_h = imData.height;
            let crop_data = getNormalisedCropValues(im_w, im_h, [
                Math.round(event.detail.x),
                Math.round(event.detail.y),
                Math.round(event.detail.width),
                Math.round(event.detail.height),
                Math.round(event.detail.rotate)
            ])
            let aspect_ratio = Math.round(event.detail.width) / Math.round(event.detail.height);

            // UGLY, should be a multipart and json:
            const precision = 6;
            let urlArgs = '?top='+crop_data.top.toFixed(precision);
            urlArgs +='&left='+crop_data.left.toFixed(precision);
            urlArgs += '&bottom='+crop_data.bottom.toFixed(precision);
            urlArgs +='&right='+crop_data.right.toFixed(precision);
            urlArgs += '&rotate='+crop_data.rotate.toFixed(precision);
            urlArgs +='&aspect_ratio='+aspect_ratio.toFixed(precision);
            urlArgs += '&filename='+document.getElementById('currentFilename').value

            document.getElementById('urlArgsHandle').value = urlArgs
        }
    });
}


function setupTrainingUploader() {
    document.getElementById('uploader-button').addEventListener('click', function() {
        // document.getElementById('uploader-button').disabled = true;
        // document.getElementById('uploader-spinner').hidden = false;
        // document.getElementById('uploader-logo').hidden = true;
    })

    uploader = new ImageUploader({
        'inputElement': document.getElementById('image-uploader'),
        'firingElement': document.getElementById('uploader-button-puppetmaster'),
        'urlArgsElement': document.getElementById('urlArgsHandle'),
        'maxWidth': 1024,
        'maxHeight': 1024,
        'quality': 0.9,
        'timeout': 10000,
        'onComplete': function() {
            /* Enable upload button */
            document.getElementById('uploader-button').disabled = false;
            document.getElementById('uploader-spinner').hidden = true;
            document.getElementById('uploader-logo').hidden = false;
        },
        'onSuccess': function() {
            swal({
                title: "Thank you!",
                text: "The photo and the crop information were uploaded successfully!",
                icon: "success"
            });
        },
        'onFailed': function(e, f, r) {
            swal({
                title: "Uploading failed!",
                text: "There seems to be an issue with the server. Please try again later!",
                icon: "error"
            });
        },
        /* Add rand parameter to prevent accidental caching of the image by the server */
        'uploadUrl': 'https://data-librarian.herokuapp.com/put',
        'debug': false
    });
}


function bindOptionButtons() {
    const one_btn = document.getElementById("aspect-btn-one");
    const free_btn = document.getElementById("aspect-btn-free");

    one_btn.addEventListener("click", function(){
        one_btn.classList.add("active");
        free_btn.classList.remove("active");
        cropper.setAspectRatio(1);
    });
    document.getElementById("aspect-btn-free").addEventListener("click", function(){
        one_btn.classList.remove("active");
        free_btn.classList.add("active");
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
    setupTrainingUploader();
    // Bind the reset button:
    document.getElementById("reset-pred-btn").addEventListener("click", function(){
        applyPredictedCrop(previous_prediction);
    });
    document.getElementById("uploader-button").addEventListener("click", function(){
        document.getElementById("result-image").hidden = false;
        swal({
            title: "Upload training data?",
            text: "The photo and the crop information will be sent to the server and be used to train the next model.",
            icon: "info",
            buttons: true,
            content: cropper.getCroppedCanvas({maxWidth:300, maxHeight:300}),
        }).then((willSend) => {
            if (willSend) {
                document.getElementById('uploader-spinner').hidden = false;
                document.getElementById('uploader-logo').hidden = true;
                document.getElementById("uploader-button-puppetmaster").click();
            } else {

            }
        });
    })
});

