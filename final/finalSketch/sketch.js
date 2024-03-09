var context, gain, freqOne, freqTwo, button, sketchStarted = false, filterFreq, filterRes
var pastPosX, pastPosY, mouseStopped = true, hue, brightness = 0

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

    gain.value = 0
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
    if(mouseX == pastPosX  && mouseY == pastPosY) {
        mouseStopped = true
    }

    if(mouseStopped && gain != undefined) {
        gain.value = 0
    }

    var colorTest = color(hue, 85, brightness)
    colorTest.setAlpha(10)
    background(colorTest)
}

function startSketch() {
    console.log('started sketch')
    document.getElementById("startSketch").style= "display: none;"
    context.resume()
    sketchStarted = true
}

function mouseMoved() {
    mouseStopped = false
    if (sketchStarted) {
        hue = map(mouseX, 0, innerWidth, 55, 70)
        brightness = map(mouseY, 0, innerHeight, 100, 50)
    
        freqOne.value = map(mouseX, 0, innerWidth, 50, 5000)
        freqTwo.value = map(mouseY, 0, innerHeight, 5000, 50)
        gain.value = map(mouseY, 0, innerHeight, 0.5, 0.1)

        filterRes.value = map(mouseY, 0, innerHeight, 0.9, 0.1)
        filterFreq.value = map(mouseY, 0, innerHeight, 500, 2500)

        ellipse(mouseX, mouseY, 35)
        pastPosX = mouseX
        pastPosY = mouseY
    }
}