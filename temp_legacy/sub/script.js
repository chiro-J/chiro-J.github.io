// Dark/Light Mode Toggle
const themeToggle = document.getElementById("theme-toggle");
const darkIcon = document.getElementById("dark-icon");
const lightIcon = document.getElementById("light-icon");

themeToggle.addEventListener("click", () => {
  document.documentElement.classList.toggle("dark");
  darkIcon.classList.toggle("hidden");
  lightIcon.classList.toggle("hidden");
});

// Particle Background
function createParticles() {
  const container = document.getElementById("particles-js");
  const particleCount = 50;

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement("div");
    particle.classList.add("particle");

    // Random properties
    const size = Math.random() * 5 + 1;
    const posX = Math.random() * 100;
    const posY = Math.random() * 100;
    const delay = Math.random() * 10;
    const duration = Math.random() * 20 + 10;
    const color = `hsl(${Math.random() * 60 + 180}, 100%, 70%)`;

    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${posX}%`;
    particle.style.top = `${posY}%`;
    particle.style.animation = `float ${duration}s ease-in-out ${delay}s infinite`;
    particle.style.backgroundColor = color;

    container.appendChild(particle);
  }
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  createParticles();

  // Initialize tilt.js
  if (window.innerWidth > 768) {
    const elements = document.querySelectorAll(".tilt-effect");
    elements.forEach((el) => {
      VanillaTilt.init(el, {
        max: 5,
        speed: 400,
        glare: true,
        "max-glare": 0.2,
      });
    });
  }
});
