var context, gain, freqOne, freqTwo, button, sketchStarted = false

async function setupRNBO() {
    const WAContext = window.AudioContext || window.webkitAudioContext
    context = new WAContext()
  
    const outputNode = context.createGain()
    outputNode.connect(context.destination)
  
    let response = await fetch("export/sketch.export.json");
    const myPatcher = await response.json();
  
    const myDevice = await RNBO.createDevice({ context, patcher: myPatcher });
  
    // Connect the devices in series
    myDevice.node.connect(outputNode)
    
    // get parameters
    gain = myDevice.parametersById.get("gain")
    freqOne = myDevice.parametersById.get("freqOne")
    freqTwo = myDevice.parametersById.get("freqTwo")

    gain.value = 0.9
    freqOne.value = 400.0
    freqTwo.value = 400.0
    context.suspend()
}

function setup() {
    createCanvas(innerWidth, innerHeight)
    colorMode(HSB, 100)
    background(15)

    button = createButton('start sketch')
    button.position(innerWidth/2, innerHeight/2)
    button.mousePressed(startSketch)

    setupRNBO()
}

function draw() {

}

function startSketch() {
    console.log('started sketch')
    context.resume()
    button.style('display: none')
    sketchStarted = true
}

function mouseMoved() {
    if (sketchStarted) {
        var hue = map(mouseX, 0, innerWidth, 55, 70)
        var brightness = map(mouseY, 0, innerHeight, 100, 50)
    
        freqOne.value = map(mouseX, 0, innerWidth, 50, 5000)
        freqTwo.value = map(mouseY, 0, innerHeight, 5000, 50)
        gain.value = map(mouseY, 0, innerHeight, 0.75, 0.1)
    
        background(hue, 85, brightness)
    }
}