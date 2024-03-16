var context, gain, freqOne, freqTwo, button, sketchStarted = false, filterFreq, filterRes
var colorHue = 0, colorBrightness = 0, myDevice
var warp_FS, drawLayer, warpLayer, intensity = 1

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

    let responseReverb = await fetch("export/effects-1/rnbo.platereverb.json")
    const reverbPatcher = await responseReverb.json()
    const reverbDevice = await RNBO.createDevice({ context, patcher: reverbPatcher })

    let finalReverb = await fetch("export/effects-2/rnbo.shimmerev.json")
    const finalReverbPatcher = await finalReverb.json()
    const finalReverbDevice = await RNBO.createDevice({ context, patcher: finalReverbPatcher })
  
    // Connect the devices in series
    myDevice.node.connect(reverbDevice.node)
    reverbDevice.node.connect(finalReverbDevice.node)
    finalReverbDevice.node.connect(outputNode)
    
    // get parameters
    gain = myDevice.parametersById.get("gain")

    gain.value = 127
    context.suspend()
}

function setup() {
    canvas = createCanvas(innerWidth, innerHeight, WEBGL)

    var glslFunctions =  
    `
    vec2 sineWave(vec2 p, float disp, float time, float intensity) {
        float x = sin(disp * p.x + time) * intensity;
        float y = sin(disp * p.y + time) * intensity;
        return vec2(p.x + x, p.y + y);
    }
    `
    use = `precision highp float; varying vec2 vPos;`
    vs = use + `
    attribute vec3 aPosition;
    
    void main() {
        vec4 positionVec4 = vec4(aPosition, 1.0);
        gl_Position = positionVec4;
    }
    `
  
    warp_FS = use + glslFunctions +
    `
    uniform vec2 r;
    uniform sampler2D img;
    uniform float pr, disp, time, intensity;
  
    void main() {
        vec2 uv = (gl_FragCoord.xy/r.xy)/pr;
        uv.y = 1.0 - uv.y;
  
        gl_FragColor = texture2D(img, sineWave(uv, disp, time, intensity));
      // gl_FragColor = texture2D(img, uv);
    }
    `

    drawLayer = createGraphics(innerWidth, innerHeight, WEBGL)
    warpLayer = createGraphics(innerWidth, innerHeight, WEBGL)
    warp = warpLayer.createShader(vs, warp_FS)

    drawLayer.colorMode(HSB, 100)
    drawLayer.background(15)

    drawLayer.noStroke()
    setupRNBO()
}

function draw() {
    warpLayer.shader(warp)
    warp.setUniform("r", [innerWidth, innerHeight])
    warp.setUniform("pr", pixelDensity())
    warp.setUniform("iResolution", [innerWidth, innerHeight])
    warp.setUniform("img", drawLayer)
    warp.setUniform("time", frameCount/25)
    warp.setUniform("disp", keyCode)
    warp.setUniform("intensity", intensity/100)
  
    warpLayer.quad(-1, -1, 1, -1, 1, 1, -1, 1)

    image(warpLayer, -innerWidth/2, -innerHeight/2)

    if(intensity > 1) {
        intensity--
    }
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
        drawLayer.ellipse(random(innerWidth) - innerWidth/2, random(innerHeight) - innerHeight/2, random(200))
        intensity += 10
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