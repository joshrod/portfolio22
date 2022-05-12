gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

/********************* 
* * GLOBAL VARS
*********************/
let vw = document.body.clientWidth;
let vh = window.innerHeight;

ScrollTrigger.defaults({
    markers: true
});

/******** CIRCLE EXPANSION ANIMATION ********/

// Set The Canvas
const circleCanvas = document.getElementById('project-circle-canvas');
circleCanvas.width = vw;
circleCanvas.height = vh;

const canvasContext = circleCanvas.getContext('2d');

// Assign Starter Circle Parameters
let starterRadius = 0;
let circleX = vw / 2;
let circleY = vh / 2;

// Make Circle Representable as an Animatable Object
const circle = {
    radius: starterRadius,
    x: circleX,
    y: circleY
}

let fillRadius = calcFillRadius() + 50;

window.addEventListener('load', () => {
    // Create Timeline to Play Forward and Backward Easier
    const circleTl = gsap.timeline({
        scrollTrigger: {
            trigger: ".project-header",
            start: 'top top',
            end: '+=100%',
            scrub: 0.3,
            invalidateOnRefresh: true
        }
    });

    // Timeline Animation (include onUpdate function here)
    circleTl.to(circle, {
        radius: () => calcFillRadius() + 50,
        onUpdate: drawCircle
    });

    ScrollTrigger.matchMedia({
        "(min-width: 1200px)": function () {
            gsap.utils.toArray('.project-desktop-image-container').forEach((container, index) => {
                const xStart = (index % 2) ? 100 : -100;
                gsap.fromTo(container,
                    {
                        x: xStart,
                        autoAlpha: 0
                    },
                    {
                        x: 0,
                        autoAlpha: 1,
                        duration: 0.4,
                        scrollTrigger: {
                            trigger: container,
                            start: 'top center'
                        }
                    }
                );
            });

            gsap.utils.toArray('.project-mobile-image-container').forEach((container, index) => {
                const image = container.querySelector('.img-responsive');
                gsap.fromTo(container,
                    {
                        y: 200,
                        autoAlpha: 0
                    },
                    {
                        y: 0,
                        autoAlpha: 1,
                        scrollTrigger: {
                            trigger: image,
                            start: 'top 65%'
                        }
                    }
                );
            });
        },
        "(max-width: 1199px)": function () {
            gsap.utils.toArray('.project-desktop-image-container').forEach((container, index) => {
                const xStart = (index % 2) ? 100 : -100;
                gsap.fromTo(container,
                    {
                        x: xStart,
                        autoAlpha: 0
                    },
                    {
                        x: 0,
                        autoAlpha: 1,
                        duration: 0.4,
                        scrollTrigger: {
                            trigger: container,
                            start: 'top 75%'
                        }
                    }
                );
            });

            gsap.utils.toArray('.project-mobile-image-container').forEach((container, index) => {
                const image = container.querySelector('.img-responsive');
                gsap.fromTo(container,
                    {
                        y: 100,
                        autoAlpha: 0,
                    },
                    {
                        y: 0,
                        autoAlpha: 1,
                        scrollTrigger: {
                            trigger: image,
                            start: 'top 75%',
                        }
                    }
                );
            });
        }
    });

});

window.addEventListener('resize', () => {
    windowResize();
});


/*********************
* * GLOBAL FUNCTIONS
*********************/

function windowResize() {
    vw = circleCanvas.width = document.body.clientWidth;
    vh = circleCanvas.height = window.innerHeight;
}

// Get Fill Radius for End of Circle Animation
function calcFillRadius() {
    let deltaX = circleX < vw / 2 ? vw - circleX : circleX;
    let deltaY = circleY < vh / 2 ? vh - circleY : circleY;

    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
}

// Canvas Functions to Actually Do The Drawings
function drawCircle() {
    canvasContext.clearRect(0, 0, vw, vh);
    canvasContext.beginPath();
    canvasContext.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI, false);
    canvasContext.fillStyle = "#F4F5F5";
    canvasContext.fill();
}

// On Window Resize, update Circle Coordinates and Radii
function updateCircle() {
    fillRadius = calcFillRadius() + 50;

    circle.x = vw / 2;
    circle.y = vh / 2;
    circle.radius = fillRadius;

    drawCircle();
}