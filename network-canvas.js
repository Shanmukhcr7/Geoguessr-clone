const networkCanvas = document.getElementById('networkCanvas');
const netCtx = networkCanvas.getContext('2d');

let networkParticles = [];
const numNetworkParticles = 60; // Fewer, more distinct particles
const networkParticleSize = 2;
const networkParticleSpeed = 0.3; // Slower movement
const networkLineColor = 'rgba(0, 230, 118, 0.1)'; // Subtle green lines
const networkParticleColor = '#00e676'; // Bright green dots
const connectionDistance = 150; // Max distance for line connection

function resizeNetworkCanvas() {
    networkCanvas.width = window.innerWidth;
    networkCanvas.height = window.innerHeight;
    networkParticles = []; // Clear and re-init particles on resize
    initNetworkParticles();
}

class NetworkParticle {
    constructor() {
        this.x = Math.random() * networkCanvas.width;
        this.y = Math.random() * networkCanvas.height;
        this.size = Math.random() * networkParticleSize + 1;
        this.speedX = Math.random() * networkParticleSpeed * 2 - networkParticleSpeed;
        this.speedY = Math.random() * networkParticleSpeed * 2 - networkParticleSpeed;
        this.opacity = Math.random() * 0.5 + 0.3; // Varying opacity for depth
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Wrap particles around the screen edges
        if (this.x < 0 - this.size) this.x = networkCanvas.width + this.size;
        if (this.x > networkCanvas.width + this.size) this.x = 0 - this.size;
        if (this.y < 0 - this.size) this.y = networkCanvas.height + this.size;
        if (this.y > networkCanvas.height + this.size) this.y = 0 - this.size;
    }

    draw() {
        netCtx.fillStyle = networkParticleColor;
        netCtx.beginPath();
        netCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        netCtx.fill();
    }
}

function initNetworkParticles() {
    for (let i = 0; i < numNetworkParticles; i++) {
        networkParticles.push(new NetworkParticle());
    }
}

function connectNetworkParticles() {
    for (let a = 0; a < networkParticles.length; a++) {
        for (let b = a; b < networkParticles.length; b++) {
            const distance = Math.sqrt(
                ((networkParticles[a].x - networkParticles[b].x) ** 2) +
                ((networkParticles[a].y - networkParticles[b].y) ** 2)
            );
            if (distance < connectionDistance) {
                // Fade lines based on distance
                netCtx.strokeStyle = `rgba(0, 230, 118, ${networkParticles[a].opacity * (1 - (distance / connectionDistance))})`;
                netCtx.lineWidth = 0.8;
                netCtx.beginPath();
                netCtx.moveTo(networkParticles[a].x, networkParticles[a].y);
                netCtx.lineTo(networkParticles[b].x, networkParticles[b].y);
                netCtx.stroke();
            }
        }
    }
}

function animateNetworkCanvas() {
    netCtx.clearRect(0, 0, networkCanvas.width, networkCanvas.height); // Clear the canvas

    for (let i = 0; i < networkParticles.length; i++) {
        networkParticles[i].update();
        networkParticles[i].draw();
    }
    connectNetworkParticles();
    requestAnimationFrame(animateNetworkCanvas);
}

// Event Listeners
window.addEventListener('resize', resizeNetworkCanvas);

// Initial setup
resizeNetworkCanvas(); // Set initial canvas size and populate particles
animateNetworkCanvas(); // Start the animation loop
