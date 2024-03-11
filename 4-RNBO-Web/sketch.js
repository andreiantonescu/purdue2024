var context, sketchStarted = false, colorToSet

async function setupRNBO() {
    const WAContext = window.AudioContext || window.webkitAudioContext
    context = new WAContext()
  
    const outputNode = context.createGain()
    outputNode.connect(context.destination)
  
    let response = await fetch("export/Example.export.json")
    const myPatcher = await response.json()
    const myDevice = await RNBO.createDevice({ context, patcher: myPatcher })
  
    // Connect the devices in series
    myDevice.node.connect(outputNode)
    
    // get parameters
    freqOne = myDevice.parametersById.get("freqOne")
    freqOne.value = 350.0

    freqTwo = myDevice.parametersById.get("freqTwo")
    freqTwo.value = 500.0

    gain = myDevice.parametersById.get("gain")
    gain.value = 85.0

    context.suspend()
}

function setup() {
    createCanvas(innerWidth, innerHeight)
    background(200)
    setupRNBO()
}

function draw() {
    if(colorToSet) {
        colorToSet.setAlpha(50)
        background(colorToSet)
    }
}

function mouseMoved() {
    if(sketchStarted) {
        freqOne.value = map(mouseX, 0, innerWidth, 0, 5000)
        freqTwo.value = map(mouseY, 0, innerHeight, 5000, 0)

        redValue = map(mouseX, 0, innerWidth, 0, 255)
        greenValue = map(mouseY, 0, innerHeight, 255, 0)

        colorToSet = color(redValue, greenValue, 255)
        ellipse(mouseX, mouseY, 40)
    }
}

function doSomething() {
    context.resume()
    sketchStarted = true
    console.log("Start Audio")
}