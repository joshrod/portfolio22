gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// /* GLOBAL VARS */
// let vw = window.innerWidth;
// let vh = window.innerHeight;
let vw = document.body.clientWidth;
let vh = window.innerHeight;

/* CIRCLE EXPANSION ANIMATION */

// Set The Canvas
const circleCanvas = document.getElementById('gray-circle-canvas');
circleCanvas.width = vw;
circleCanvas.height = vh;

const circleContext = circleCanvas.getContext('2d');

// Get Starter Circle Parameters
let starterRadius = (vw < 1200 ? 35 : 50);
let circleX = calcFirstCircleX(vw);
let circleY = calcFirstCircleY(vw, vh);

// Make Second Circle Representable as an Animatable Object
let firstCircle = {
    radius: starterRadius,
    x: circleX,
    y: circleY,
    globalAlpha: 0
}

// Get X and Y Circle Coordinates through Functions
function calcFirstCircleX(viewWidth) {
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

function calcFirstCircleY(windowWidth, windowHeight) {
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

// Draw First Circle
function drawFirstCircle() {
    circleContext.clearRect(0, 0, vw, vh);
    circleContext.beginPath();
    circleContext.arc(firstCircle.x, firstCircle.y, firstCircle.radius, 0, 2 * Math.PI, false);
    circleContext.globalAlpha = firstCircle.globalAlpha;
    circleContext.fillStyle = "#F4F5F5";
    circleContext.fill();
}


// Get New Circle Parameters
let deltaX = circleX < vw / 2 ? vw - circleX : circleX;
let deltaY = circleY < vh / 2 ? vh - circleY : circleY;
let radius2 = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

// Make Second Circle Representable as an Animatable Object
let secondCircle = {
    radius: starterRadius,
    x: circleX,
    y: circleY
}

// Create Timeline to Play Forward and Backward Easier
const circleTl = gsap.timeline({
    scrollTrigger: {
        trigger: ".hero",
        start: 'top top',
        scrub: 0.3,
    }
});

// Timeline Animation (include onUpdate function here)
circleTl.to(secondCircle, {
    radius: radius2,
    onUpdate: drawSecondCircle
});
circleTl.to('.hero-arrow-container',
    {
        rotation: 180
    },
    "<"
);

function drawSecondCircle() {

    circleContext.clearRect(0, 0, vw, vh);
    circleContext.beginPath();
    circleContext.arc(secondCircle.x, secondCircle.y, secondCircle.radius, 0, 2 * Math.PI, false);
    circleContext.fillStyle = "#F4F5F5";
    circleContext.fill();

}

/* HERO SECTION ANIMATIONS */

// Text Animation, Fade-in Logo, Fade-in Canvas ONLY when first arriving on site
if (scrollY === 0) {
    let heroTl = gsap.timeline(
        {
            onStart: disableScroll,
            onComplete: enableScroll
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
    heroTl.fromTo(firstCircle,
        {
            globalAlpha: 0
        },
        {
            globalAlpha: 1,
            onUpdate: drawFirstCircle
        }
    );
    heroTl.to('.hero-arrow-container',
        {
            autoAlpha: 1
        },
        "<"
    );
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


/* ABOUT ME SECTION ANIMATIONS */

// Stagger Reveal About Me Paragraph Text

const aboutTl = gsap.timeline({
    scrollTrigger: {
        trigger: ".about-me",
        start: "top center",
        // toggleActions: 'play none none reverse',
        // onEnter: () => {
        //     aboutTl.timeScale(1.0);
        // },
        // onEnterBack: () => {
        //     aboutTl.timeScale(3.5);
        // },
        // markers: true
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

/* MARQUEE ANIMATIONS */

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

/* GLOBAL WINDOW RESIZE */

window.addEventListener('resize', windowResize);

function windowResize() {
    vw = window.innerWidth;
    vh = window.innerHeight;
}

/* GLOBAL FUNCTIONS */

/* PREVENT SCROLLING */

// left: 37, up: 38, right: 39, down: 40,
// spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36
const keys = { 37: 1, 38: 1, 39: 1, 40: 1 };

function preventDefault(e) {
    e.preventDefault();
}

function preventDefaultForScrollKeys(e) {
    if (keys[e.keyCode]) {
        preventDefault(e);
        return false;
    }
}

// modern Chrome requires { passive: false } when adding event
var supportsPassive = false;
try {
    window.addEventListener("test", null, Object.defineProperty({}, 'passive', {
        get: function () { supportsPassive = true; }
    }));
} catch (e) { }

var wheelOpt = supportsPassive ? { passive: false } : false;
var wheelEvent = 'onwheel' in document.createElement('div') ? 'wheel' : 'mousewheel';

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