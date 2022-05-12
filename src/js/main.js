gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

/********************* 
* * GLOBAL VARS
*********************/
let vw = document.body.clientWidth;
let vh = window.innerHeight;

// Prevent Scrolling Variables
const keys = { 37: 1, 38: 1, 39: 1, 40: 1 };

// modern Chrome requires { passive: false } when adding event
var supportsPassive = false;
try {
    window.addEventListener("test", null, Object.defineProperty({}, 'passive', {
        get: function () { supportsPassive = true; }
    }));
} catch (e) { }

var wheelOpt = supportsPassive ? { passive: false } : false;
var wheelEvent = 'onwheel' in document.createElement('div') ? 'wheel' : 'mousewheel';

/*********************
* * HOME PAGE JAVASCRIPT
*********************/

/******** CIRCLE EXPANSION ANIMATION ********/

// Set The Canvas
const shapeCanvas = document.getElementById('gray-circle-canvas');
shapeCanvas.width = vw;
shapeCanvas.height = vh;

const canvasContext = shapeCanvas.getContext('2d');

// Assign Starter Circle Parameters
let starterRadius = calcStarterRadius(vw);
let circleX = calcCircleX(vw);
let circleY = calcCircleY(vw, vh);

// Make Circle Representable as an Animatable Object
const circle = {
    radius: starterRadius,
    x: circleX,
    y: circleY,
    globalAlpha: 0
}

let fillRadius = calcFillRadius();

/******** HERO SECTION ANIMATIONS ********/

// Text Animation, Fade-in Logo, Fade-in Canvas ONLY when first arriving on site
if (scrollY === 0) {
    let heroTl = gsap.timeline(
        {
            // onStart: disableScroll,
            // onComplete: enableScroll
            onStart: () => {
                if (scrollY === 0) {
                    disableScroll();
                }
            },
            onComplete: () => {
                if (scrollY === 0) {
                    enableScroll();
                }
            }
        }
    );

    gsap.set('.hero-logo-container', {
        autoAlpha: 0
    });
    gsap.set('.hero-arrow-container', {
        autoAlpha: 0
    });

    heroTl.from('.split-text', {
        y: 200,
        stagger: 0.03,
        duration: 0.6,
        ease: "circ.out"
    });
    heroTl.to('.hero-logo-container', {
        autoAlpha: 1
    }, "-=0.5");
    heroTl.fromTo(circle,
        {
            globalAlpha: 0
        },
        {
            globalAlpha: 1,
            onUpdate: drawCircle
        }
    );
    heroTl.to('.hero-arrow-container',
        {
            autoAlpha: 1
        },
        "<"
    );
} else {
    circle.globalAlpha = 1;
    drawCircle();
}

// Scroll to Top with GSAP on Arrow Click
const heroArrow = document.querySelector('.hero-arrow-container');

heroArrow.addEventListener('click', function () {
    gsap.to(window,
        {
            scrollTo: 0,
            ease: 'power2'
        }
    )
});

/******** ABOUT ME SECTION ANIMATIONS ********/

// Stagger Reveal About Me Paragraph Text

const aboutTl = gsap.timeline({
    scrollTrigger: {
        trigger: ".about-me",
        start: "top center"
    }
})

aboutTl.fromTo('.inside-word-split',
    {
        y: 200,
    },
    {
        y: 0,
        stagger: 0.03,
        duration: 0.5,
        ease: "circ.out",
    }
);

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

/******** PROJECT SINGLE ANIMATIONS ********/

gsap.utils.toArray('.project').forEach((project, index) => {
    const text = project.querySelectorAll('.project-text');
    const projectTl = gsap.timeline({
        scrollTrigger: {
            trigger: project,
            start: "top 60%"
        }
    });

    projectTl.fromTo(text,
        {
            y: 100
        },
        {
            y: 0,
            // stagger: 0.2,
            duration: 0.3,
            ease: "circ.out"
        }
    );
});

/******** CONTACT ANIMATIONS ********/

// Set Gray Text to OffScreen and Hide It
gsap.set('.contact-decorative-text-container', {
    x: vw
});
gsap.set('.contact-snippet', {
    y: 200
});
gsap.set('.email-heading', {
    y: 200
});


// Create Timeline to Play Forward and Backward Easier
const contactTl = gsap.timeline({
    paused: true
});

contactTl.to('.email-heading', {
    y: 0
});
contactTl.to('.contact-snippet',
    {
        y: 0,
    },
    "<"
);
contactTl.to('.contact-decorative-text', {
    color: '#FF1744',
    duration: 0.3
});
contactTl.to('.email-heading .red-text',
    {
        color: '#FF1744',
        duration: 0.3
    },
    "<"
);

// Set bgRectangle Parameters
let rectHeight = vh;

// Make BG Rectangle Representable as an Animatable Object
const bgRectangle = {
    width: 0
}

const copyrightYear = document.querySelector('.copyright-year');
copyrightYear.innerHTML = new Date().getFullYear();

/******** HOME PAGE SCROLLTRIGGERS BASED ON MEDIA QUERIES ********/

// Variable to capture the End of ScrollTrigger in Pixels
let rectTlEnd;

// ScrollTrigger matchMedia to change 'end:' depending on mobile or desktop
ScrollTrigger.matchMedia({
    "(min-width: 1200px)": function () {

        // Create Timeline to Play Forward and Backward Easier
        let circleTl = gsap.timeline({
            scrollTrigger: {
                trigger: ".hero",
                start: 'top top',
                scrub: 0.3,
                invalidateOnRefresh: true
            }
        });

        // Timeline Animation (include onUpdate function here)
        circleTl.to(circle, {
            radius: () => calcFillRadius(),
            onUpdate: drawCircle
        });
        circleTl.to('.hero-arrow-container',
            {
                rotation: 180
            },
            "<"
        );

        const rectTl = gsap.timeline({
            scrollTrigger: {
                trigger: ".contact",
                start: 'top top',
                end: 'center top',
                scrub: 0.3,
                pin: true,
                invalidateOnRefresh: true,
                onEnter: (self) => {
                    rectTlEnd = self.end;
                },
                onUpdate: (self) => {
                    if (self.progress >= 0.85) {
                        contactTl.timeScale(1);
                        contactTl.play();
                    } else {
                        contactTl.timeScale(3);
                        contactTl.reverse();
                    }
                }
            }
        });

        // Timeline Rectangle Animation (include onUpdate function here)
        rectTl.to(bgRectangle, {
            width: () => document.body.clientWidth,
            onUpdate: drawBgRectangle
        });
        rectTl.to('.contact-decorative-text-container', {
            x: 0
        },
            "<"
        );
        rectTl.to('#hero-arrow path',
            {
                fill: '#F4F5F5'
            },
            "<"
        );
    },
    "(max-width: 1199px)": function () {
        // Create Timeline to Play Forward and Backward Easier
        let circleTl = gsap.timeline({
            scrollTrigger: {
                trigger: ".hero",
                start: 'top top',
                end: 'center top',
                scrub: 0.3,
                invalidateOnRefresh: true
            }
        });

        // Timeline Animation (include onUpdate function here)
        circleTl.to(circle, {
            radius: () => calcFillRadius() + 50,
            onUpdate: drawCircle
        });
        circleTl.to('.hero-arrow-container',
            {
                rotation: 180
            },
            "<"
        );

        const rectTl = gsap.timeline({
            scrollTrigger: {
                trigger: ".contact",
                start: '-=100',
                end: 'top top',
                scrub: 0.5,
                invalidateOnRefresh: true,
                onEnter: (self) => {
                    rectTlEnd = self.end;
                },
                onUpdate: (self) => {
                    if (self.progress >= 0.85) {
                        contactTl.timeScale(1);
                        contactTl.play();
                    } else {
                        contactTl.timeScale(3);
                        contactTl.reverse();
                    }
                }
            }
        });

        // Timeline Rectangle Animation (include onUpdate function here)
        rectTl.to(bgRectangle, {
            width: () => document.body.clientWidth,
            onUpdate: drawBgRectangle
        });
        rectTl.to('.contact-decorative-text-container', {
            x: 0
        },
            "<"
        );
        rectTl.to('#hero-arrow path',
            {
                fill: '#F4F5F5'
            },
            "<"
        );
    }
});

/*********************
* * GLOBAL WINDOW RESIZE EVENT LISTENER
*********************/

window.addEventListener('resize', () => {
    windowResize();

    /******** HOME PAGE RESIZE JAVASCRIPT ********/

    updateCircle();

    if (scrollY >= rectTlEnd) {
        drawBgRectangle();
    }
});

/*********************
* * GLOBAL FUNCTIONS
*********************/

function windowResize() {
    vw = shapeCanvas.width = document.body.clientWidth;
    vh = shapeCanvas.height = window.innerHeight;
}

// Calculate Starter Radius based on ViewWidth
function calcStarterRadius(viewWidth) {
    if (viewWidth < 1200) {
        return 35;
    }

    return ((6.944444444 * viewWidth) / 100) / 2;
}

// Get X and Y Circle Coordinates through Functions
function calcCircleX(viewWidth) {
    let fromRight;

    switch (true) {
        case (viewWidth >= 1440):
            fromRight = 2.083333333333333;
            break;
        case (viewWidth >= 1200 && viewWidth < 1440):
            fromRight = 2.34375;
            break;
        default:
            fromRight = 0;
    }

    switch (true) {
        case (viewWidth >= 768 && viewWidth < 1200):
            return viewWidth - 30 - starterRadius;
        case (viewWidth < 768):
            return viewWidth - 15 - starterRadius;
        default:
            return ((viewWidth * (100 - fromRight)) / 100) - starterRadius;
    }
}

function calcCircleY(windowWidth, windowHeight) {
    let fromBottom;

    switch (true) {
        case (windowWidth >= 1200):
            fromBottom = 4.1666666;
            break;
        case (windowWidth >= 992 && windowWidth < 1200):
            fromBottom = 7.32064421;
            break;
        case (windowWidth >= 768 && windowWidth < 992):
            fromBottom = 9.765625;
            break;
        default:
            fromBottom = 5.556;
    }

    return ((windowHeight * (100 - fromBottom)) / 100) - starterRadius;
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
    canvasContext.globalAlpha = circle.globalAlpha;
    canvasContext.fillStyle = "#F4F5F5";
    canvasContext.fill();
}

// On Window Resize, update Circle Coordinates and Radii
function updateCircle() {
    starterRadius = calcStarterRadius(vw);
    circleX = calcCircleX(vw);
    circleY = calcCircleY(vw, vh);
    fillRadius = calcFillRadius();

    circle.x = circleX;
    circle.y = circleY;

    if (scrollY === 0) {
        circle.radius = starterRadius;
        drawCircle();
    }

    if (scrollY >= vh) {
        circle.radius = fillRadius;
        drawCircle();
    }
}

// Canvas Functions to Actually Do The Drawings on Rectangle
function drawBgRectangle() {
    canvasContext.clearRect(0, 0, vw, vh);
    drawCircle();
    canvasContext.beginPath();
    canvasContext.rect(0, 0, bgRectangle.width, vh);
    canvasContext.fillStyle = "#141C28";
    canvasContext.fill();
}

function preventDefault(e) {
    e.preventDefault();
}

function preventDefaultForScrollKeys(e) {
    if (keys[e.keyCode]) {
        preventDefault(e);
        return false;
    }
}

// call this to Disable
function disableScroll() {
    window.addEventListener('DOMMouseScroll', preventDefault, false); // older FF
    window.addEventListener(wheelEvent, preventDefault, wheelOpt); // modern desktop
    window.addEventListener('touchmove', preventDefault, wheelOpt); // mobile
    window.addEventListener('keydown', preventDefaultForScrollKeys, false);
}

// call this to Enable
function enableScroll() {
    window.removeEventListener('DOMMouseScroll', preventDefault, false);
    window.removeEventListener(wheelEvent, preventDefault, wheelOpt);
    window.removeEventListener('touchmove', preventDefault, wheelOpt);
    window.removeEventListener('keydown', preventDefaultForScrollKeys, false);
}
