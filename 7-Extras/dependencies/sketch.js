var context, gain, freqOne, freqTwo, button, sketchStarted = false, filterFreq, filterRes
var colorHue = 0, colorBrightness = 0, myDevice

async function setupRNBO() {
    const WAContext = window.AudioContext || window.webkitAudioContext
    context = new WAContext()
  
    const outputNode = context.createGain()
    outputNode.connect(context.destination)
  
    let responseMyPatcher = await fetch("export/sketch.export.json")
    const myPatcher = await responseMyPatcher.json()
    myDevice = await RNBO.createDevice({ context, patcher: myPatcher })

    // Load the exported dependencies.json file
    let dependencies = await fetch("export/dependencies.json")
    dependencies = await dependencies.json()

    // Load the dependencies into the device
    const results = await myDevice.loadDataBufferDependencies(dependencies)
    results.forEach(result => {
        if (result.type === "success") {
            console.log(`Successfully loaded buffer with id ${result.id}`)
            loadedAudio = true
        } else {
            console.log(`Failed to load buffer with id ${result.id}, ${result.error}`)
        }
    });

    let responseReverb = await fetch("export/effects/rnbo.platereverb.json")
    const reverbPatcher = await responseReverb.json()
    const reverbDevice = await RNBO.createDevice({ context, patcher: reverbPatcher })
  
    // Connect the devices in series
    myDevice.node.connect(reverbDevice.node)
    reverbDevice.node.connect(outputNode)
    
    // get parameters
    gain = myDevice.parametersById.get("gain")

    gain.value = 127
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
    newBackgroundColor.setAlpha(1)
    background(newBackgroundColor)
}

function startSketch() {
    console.log('started sketch')
    document.getElementById("startSketch").style= "display: none;"
    context.resume()
    sketchStarted = true
}

function keyPressed() {
    if(sketchStarted) {
        let noteOnMessage = [
            144, // Code for a note on: 10010000 & MIDI channel (0-15)
            keyCode, // MIDI Note
            127 // MIDI Velocity
        ];
    
        // When scheduling an event, use the current audio context time
        // multiplied by 1000 (converting seconds to milliseconds)
        // midi port 0
        let noteOnEvent = new RNBO.MIDIEvent(context.currentTime * 1000, 0, noteOnMessage)
        myDevice.scheduleEvent(noteOnEvent)
        ellipse(random(windowWidth), random(windowHeight), random(200))
    }
}

function keyReleased() {
    if(sketchStarted) {
        let noteOffMessage = [
            128, // Code for a note off: 10000000 & MIDI channel (0-15)
            keyCode, // MIDI Note
            0 // MIDI Velocity
        ];
        let noteOffEvent = new RNBO.MIDIEvent(context.currentTime * 1000, 0, noteOffMessage)
        myDevice.scheduleEvent(noteOffEvent)   
    }
}