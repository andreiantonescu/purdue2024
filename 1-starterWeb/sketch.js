function setup() {
    createCanvas(windowWidth, windowHeight)
    background(200)
    fill('green')
    ellipse(200, 200, 250)
}

function draw() {
    ellipse(random(windowWidth), random(windowHeight), 50)
}