var context, gain, freqOne, freqTwo, button, sketchStarted = false, filterFreq, filterRes
var colorHue = 0, colorBrightness = 0

async function setupRNBO() {
    const WAContext = window.AudioContext || window.webkitAudioContext
    context = new WAContext()
  
    const outputNode = context.createGain()
    outputNode.connect(context.destination)
  
    let responseMyPatcher = await fetch("export/sketch.export.json")
    const myPatcher = await responseMyPatcher.json()
    const myDevice = await RNBO.createDevice({ context, patcher: myPatcher })

    let responseReverb = await fetch("export/effects/rnbo.shimmerev.json")
    const reverbPatcher = await responseReverb.json()
    const reverbDevice = await RNBO.createDevice({ context, patcher: reverbPatcher })
  
    // Connect the devices in series
    myDevice.node.connect(reverbDevice.node)
    reverbDevice.node.connect(outputNode)
    
    // get parameters
    gain = myDevice.parametersById.get("gain")
    freqOne = myDevice.parametersById.get("freqOne")
    freqTwo = myDevice.parametersById.get("freqTwo")
    filterFreq = myDevice.parametersById.get("filterFreq")
    filterRes = myDevice.parametersById.get("filterRes")

    gain.value = 0.0
    freqOne.value = 400.0
    freqTwo.value = 400.0
    context.suspend()
}

function setup() {
    createCanvas(innerWidth, innerHeight)
    colorMode(HSB, 100)
    background(15)

    noStroke()
    setupRNBO()
}

function draw() {
    var newBackgroundColor = color(colorHue, 85, colorBrightness)
    newBackgroundColor.setAlpha(10)
    background(newBackgroundColor)
}

function startSketch() {
    console.log('started sketch')
    document.getElementById("startSketch").style= "display: none;"
    context.resume()
    sketchStarted = true
}

function theremin() {
    if (sketchStarted) {
        colorHue = map(mouseX, 0, innerWidth, 55, 70)
        colorBrightness = map(mouseY, 0, innerHeight, 100, 50)
        gain.value = 0.9
        freqOne.value = map(mouseX, 0, innerWidth, 50, 5000)
        freqTwo.value = map(mouseY, 0, innerHeight, 5000, 50)

        filterRes.value = map(mouseY, 0, innerHeight, 0.9, 0.1)
        filterFreq.value = map(mouseY, 0, innerHeight, 500, 2500)

        ellipse(mouseX, mouseY, 35)
    }
}

function mouseMoved() {
    theremin()
}

function mouseDragged() {
    theremin()
}