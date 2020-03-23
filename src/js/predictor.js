let model;

const loadLocalModel = async function() {
    model = await tf.loadLayersModel('/getmodel/model.json');
    console.log('Successfully loaded local model');
};


const predictImageCrop = async function(imgDataEl) {
    let im = tf.browser.fromPixels(imgDataEl).resizeBilinear([300,300]).expandDims();
    // Scale the tensor from [0,255] to [0,1]
    im = im.div(255.);
    // Our model takes in collections of images, so expand dimensions from 3 -> 4
    let resultensor = await model.predict(im).clipByValue(0,1);
    // resultensor.print();

    return resultensor.dataSync();
};

export {
    loadLocalModel,
    predictImageCrop
}