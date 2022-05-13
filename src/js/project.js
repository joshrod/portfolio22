gsap.registerPlugin(ScrollTrigger);

/********************* 
* * GLOBAL VARS
*********************/
let vw = document.body.clientWidth;
let vh = window.innerHeight;

ScrollTrigger.defaults({
    markers: true
});

/*********************
* * PROJECT PAGE JAVASCRIPT
*********************/

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

// Load Listener Required to Fully Load Images Before ScrollTrigger Calculates
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

    // Set Things That Need to Be Faded In
    gsap.set('.project-overview', {
        autoAlpha: 0
    });

    if (document.querySelector('.project-awards')) {
        gsap.set('.project-awards', {
            autoAlpha: 0
        });
    } else {
        gsap.set('.project-mosaic', {
            autoAlpha: 0
        });
    }

    /******** MARQUEE ANIMATIONS ********/

    // Marquees Go In and Out on Scroll
    gsap.utils.toArray('.marquee').forEach((marquee, index) => {
        const wrapper = marquee.querySelector('.marquee-wrapper');
        const [x, xEnd] = (index % 2) ? ['100%', (wrapper.scrollWidth - marquee.offsetWidth) * -1] : [wrapper.scrollWidth * -1, 0];
        gsap.fromTo(wrapper, { x }, {
            x: xEnd,
            scrollTrigger: {
                trigger: ".marquee-divider",
                scrub: 0.2
            }
        });
    });

    /******** PROJECT PAGE SCROLLTRIGGERS BASED ON MEDIA QUERIES ********/

    ScrollTrigger.matchMedia({
        "(min-width: 1200px)": function () {

            // Project Main Image Parallax on Desktop
            let bg = document.querySelector('.project-hero-background');
            bg.style.backgroundPosition = `50% 50%`;

            gsap.to(bg, {
                backgroundPosition: `50% 30%`,
                ease: "none",
                scrollTrigger: {
                    trigger: '.project-header',
                    start: 'top top',
                    end: '+=100%',
                    scrub: true
                }
            });

            // Fade In Overview
            gsap.to('.project-overview', {
                autoAlpha: 1,
                scrollTrigger: {
                    trigger: '.project-overview',
                    start: 'top 60%'
                }
            });

            // Fade In Awards or Mosaic
            if (document.querySelector('.project-awards')) {
                gsap.to('.project-awards', {
                    autoAlpha: 1,
                    scrollTrigger: {
                        trigger: '.project-awards',
                        start: 'top 60%'
                    }
                });
            } else {
                gsap.to('.project-mosaic', {
                    autoAlpha: 1,
                    scrollTrigger: {
                        trigger: '.project-mosaic',
                        start: 'top 60%'
                    }
                });
            }

            // Fade In and Translate Alternating Images
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

            // Fade In and Translate Y Mobile Images
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
                            start: 'top 70%'
                        }
                    }
                );
            });
        },
        "(max-width: 1199px)": function () {

            // Project Main Image Parallax on Mobile
            let bg = document.querySelector('.project-hero-background');
            bg.style.backgroundPosition = `50% 50%`;

            gsap.to(bg, {
                backgroundPosition: `50% 30%`,
                ease: "none",
                scrollTrigger: {
                    trigger: '.project-header',
                    start: 'top top',
                    end: '+=75%',
                    scrub: true
                }
            });

            // Fade In Overview
            gsap.to('.project-overview', {
                autoAlpha: 1,
                scrollTrigger: {
                    trigger: '.project-overview',
                    start: 'top 70%'
                }
            });

            // Fade In Awards or Mosaic
            if (document.querySelector('.project-awards')) {
                gsap.to('.project-awards', {
                    autoAlpha: 1,
                    scrollTrigger: {
                        trigger: '.project-awards',
                        start: 'top 70%'
                    }
                });
            } else {
                gsap.to('.project-mosaic', {
                    autoAlpha: 1,
                    scrollTrigger: {
                        trigger: '.project-mosaic',
                        start: 'top 70%'
                    }
                });
            }

            // Fade In and Translate Alternating Images
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

            // Fade In and Translate Y Mobile Images
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

/*********************
* * GLOBAL WINDOW RESIZE EVENT LISTENER
*********************/

window.addEventListener('resize', () => {
    windowResize();

    /******** PROJECT PAGE RESIZE JAVASCRIPT ********/

    updateCircle();
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