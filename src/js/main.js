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

ScrollTrigger.defaults({
    // markers: true
});

/********************* 
* * HOME PAGE VARS
*********************/

let shapeCanvas;
let shapeCanvasContext;
let homeCircle;
let bgRectangle;

// Variable to capture the End of ScrollTrigger in Pixels
let rectTlEnd;

/********************* 
* * PROJECT PAGE VARS
*********************/

let projectCircleCanvas;
let projectCanvasContext;
let projectCircle;

/*********************
* * HOME PAGE JAVASCRIPT
*********************/

function initHomeAnimations() {

    /******** HOME CIRCLE EXPANSION VARS ********/

    // Set The Canvas
    shapeCanvas = document.getElementById('gray-circle-canvas');
    shapeCanvas.width = vw;
    shapeCanvas.height = vh;

    shapeCanvasContext = shapeCanvas.getContext('2d');

    // Assign Starter Circle Parameters
    let starterRadius = calcStarterRadius(vw);
    let circleX = calcCircleX(vw);
    let circleY = calcCircleY(vw, vh);

    // Make Circle Representable as an Animatable Object
    homeCircle = {
        radius: starterRadius,
        x: circleX,
        y: circleY,
        globalAlpha: 0
    }

    /******** HOME RECTANGLE EXPANSION VARS ********/

    // Make BG Rectangle Representable as an Animatable Object
    bgRectangle = {
        width: 0
    }

    // Variable to capture the End of ScrollTrigger in Pixels
    // let rectTlEnd;

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

        heroTl.to('.split-text', {
            y: 0,
            stagger: 0.03,
            duration: 0.6,
            ease: "circ.out"
        });
        heroTl.to('.hero-logo-container', {
            autoAlpha: 1
        }, "-=0.5");
        heroTl.fromTo(homeCircle,
            {
                globalAlpha: 0
            },
            {
                globalAlpha: 1,
                onUpdate: () => { drawCircle(shapeCanvasContext, homeCircle) }
            }
        );
        heroTl.to('.hero-arrow-container',
            {
                autoAlpha: 1
            },
            "<"
        );
    } else {

        gsap.set('.split-text', {
            y: 0
        });
        gsap.set('.hero-logo-container', {
            opacity: 1
        });
        gsap.set('.hero-arrow-container', {
            opacity: 1
        });
        homeCircle.globalAlpha = 1;
        drawCircle(shapeCanvasContext, homeCircle);
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
            start: "top 70%"
        }
    });

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

    const copyrightYear = document.querySelector('.copyright-year');
    copyrightYear.innerHTML = new Date().getFullYear();

    /******** HOME PAGE SCROLLTRIGGERS BASED ON MEDIA QUERIES ********/

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
            circleTl.to(homeCircle, {
                radius: () => calcFillRadius(vw, vh, homeCircle),
                onUpdate: () => { drawCircle(shapeCanvasContext, homeCircle) }
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
                onUpdate: () => { drawBgRectangle(shapeCanvasContext, homeCircle, bgRectangle) }
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
            circleTl.to(homeCircle, {
                radius: () => calcFillRadius(vw, vh, homeCircle) + 50,
                onUpdate: () => { drawCircle(shapeCanvasContext, homeCircle) }
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
                onUpdate: () => { drawBgRectangle(shapeCanvasContext, homeCircle, bgRectangle) }
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

}

/*********************
* * PROJECT PAGE JAVASCRIPT
*********************/

function initProjectAnimations() {
    /******** PROJECT CIRCLE EXPANSION VARS ********/

    // Set The Canvas
    projectCircleCanvas = document.getElementById('project-circle-canvas');
    projectCircleCanvas.width = vw;
    projectCircleCanvas.height = vh;

    projectCanvasContext = projectCircleCanvas.getContext('2d');

    // Assign Starter Circle Parameters
    let starterRadius = 0;
    let circleX = vw / 2;
    let circleY = vh / 2;

    // Make Circle Representable as an Animatable Object
    projectCircle = {
        radius: starterRadius,
        x: circleX,
        y: circleY,
        globalAlpha: 1,
    }

    // ! Load Listener Required to Fully Load Images Before ScrollTrigger Calculates

    // Create Timeline to Play Forward and Backward Easier
    const projectCircleTl = gsap.timeline({
        scrollTrigger: {
            trigger: ".project-header",
            start: 'top top',
            end: '+=100%',
            scrub: 0.3,
            invalidateOnRefresh: true
        }
    });

    // Timeline Animation (include onUpdate function here)
    projectCircleTl.to(projectCircle, {
        radius: () => calcFillRadius(vw, vh, projectCircle) + 50,
        onUpdate: () => { drawCircle(projectCanvasContext, projectCircle) }
    });

    // Set Things That Need to Be Faded In

    if (document.querySelector('.project-awards')) {
        gsap.set('.project-overview', {
            autoAlpha: 0
        });

        gsap.set('.project-awards', {
            autoAlpha: 0
        });
    } else {
        gsap.set('.project-synopsis', {
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



            // Fade In Awards or Mosaic
            if (document.querySelector('.project-awards')) {

                // Fade In Overview
                gsap.to('.project-overview', {
                    autoAlpha: 1,
                    scrollTrigger: {
                        trigger: '.project-overview',
                        start: 'top 60%'
                    }
                });
                gsap.to('.project-awards', {
                    autoAlpha: 1,
                    scrollTrigger: {
                        trigger: '.project-awards',
                        start: 'top 60%'
                    }
                });
            } else {
                gsap.to('.project-synopsis', {
                    autoAlpha: 1,
                    scrollTrigger: {
                        trigger: '.project-synopsis',
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

            // Fade In Awards or Mosaic
            if (document.querySelector('.project-awards')) {

                // Fade In Overview
                gsap.to('.project-overview', {
                    autoAlpha: 1,
                    scrollTrigger: {
                        trigger: '.project-overview',
                        start: 'top 70%'
                    }
                });
                gsap.to('.project-awards', {
                    autoAlpha: 1,
                    scrollTrigger: {
                        trigger: '.project-awards',
                        start: 'top 70%'
                    }
                });
            } else {
                gsap.to('.project-synopsis', {
                    autoAlpha: 1,
                    scrollTrigger: {
                        trigger: '.project-synopsis',
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
}

window.addEventListener("load", () => {

    if (document.body.classList.contains('home')) {
        initHomeAnimations();
    } else if (document.body.classList.contains('project-body')) {
        initProjectAnimations();
    }

    /*********************
    * * BARBAJS JAVASCRIPT
    *********************/

    // const animationOut = (container) => {
    //     return gsap.to(container, { autoAlpha: 0, duration: 1, clearProps: 'all' });
    // }

    // const animationIn = (container) => {
    //     return gsap.from(container, { autoAlpha: 0, duration: 1, clearProps: 'all' });
    // }

    // barba.hooks.afterLeave(() => {

    //     killScrollTriggers();

    // });

    // barba.hooks.before(() => {

    //     document.querySelector('html').classList.add('is-transitioning');
    //     barba.wrapper.classList.add('is-animating');

    // });

    // barba.hooks.after((data) => {

    //     document.querySelector('html').classList.remove('is-transitioning');
    //     barba.wrapper.classList.remove('is-animating');

    //     if (data.next.namespace === 'project') {
    //         console.log(data.next.namespace)
    //         initProjectAnimations();
    //     }
    //     else if (data.next.namespace === 'home') {
    //         initHomeAnimations();
    //     }

    //     ScrollTrigger.refresh(true);
    //     countActiveScrollTriggers();

    // });

    // barba.hooks.enter(() => {
    //     window.scrollTo(0, 0);
    // });

    // barba.init({
    //     debug: true,
    //     transitions: [{
    //         name: 'opacity-transition',
    //         leave: ({ current }) =>
    //             animationOut(current.container),
    //         enter({ next }) {
    //             console.log('entering');
    //             animationIn(next.container);
    //         }
    //     }],
    // });

    /*********************
    * * CURTAINS JS IMPLEMENTATIONS
    *********************/

    // track the mouse positions to send it to the shaders
    const mousePosition = new Vec2();
    // we will keep track of the last position in order to calculate the movement strength/delta
    const mouseLastPosition = new Vec2();

    const deltas = {
        max: 0,
        applied: 0,
    };

    // set up our WebGL context and append the canvas to our wrapper
    const curtains = new Curtains({
        container: "projects-canvas",
        // watchScroll: false, // no need to listen for the scroll in this example
        pixelRatio: Math.min(1.5, window.devicePixelRatio), // limit pixel ratio for performance
        autoRender: false,

    });

    curtains.onRender(() => {
        // update our planes deformation
        // increase/decrease the effect
        scrollEffect = curtains.lerp(scrollEffect, 0, 0.075);
    })

    curtains.onScroll(() => {
        const scrollDelta = curtains.getScrollDeltas();

        // invert value for the effect
        scrollDelta.y = -scrollDelta.y;

        // threshold
        if (scrollDelta.y > 60) {
            scrollDelta.y = 60;
        }
        else if (scrollDelta.y < -60) {
            scrollDelta.y = -60;
        }

        if (Math.abs(scrollDelta.y) > Math.abs(scrollEffect)) {
            scrollEffect = curtains.lerp(scrollEffect, scrollDelta.y, 0.5);
        }

        planes.forEach((plane) => {
            applyPlanesParallax(plane);
            deltas.max = 1.15;
        })

    });

    // handling errors
    curtains.onError(() => {
        // we will add a class to the document body to display original images
        document.body.classList.add("no-curtains");
    }).onContextLost(() => {
        // on context lost, try to restore the context
        curtains.restoreContext();
    });

    // use gsap ticker to render our scene
    // gsap ticker handles different monitor refresh rates
    // besides for performance we'll want to have only one request animation frame loop running
    gsap.ticker.add(curtains.render.bind(curtains));


    const planes = [];
    let scrollEffect = 0;

    // get our plane elements
    const planeElements = document.getElementsByClassName("curtains-plane");


    const vs = `
            precision mediump float;
            // default mandatory variables
            attribute vec3 aVertexPosition;
            attribute vec2 aTextureCoord;
            uniform mat4 uMVMatrix;
            uniform mat4 uPMatrix;

            // our texture matrix uniform
            uniform mat4 simplePlaneTextureMatrix;
            // custom variables
            varying vec3 vVertexPosition;
            varying vec2 vTextureCoord;
            uniform float uTime;
            uniform vec2 uResolution;
            uniform vec2 uMousePosition;
            uniform float uMouseMoveStrength;
            uniform float uTransition;
            void main() {
                vec3 vertexPosition = aVertexPosition;
                // convert uTransition from [0,1] to [0,1,0]
                float transition = 1.0 - abs((uTransition * 2.0) - 1.0);
                // get the distance between our vertex and the mouse position
                float distanceFromMouse = distance(uMousePosition, vec2(vertexPosition.x, vertexPosition.y));
                // calculate our wave effect
                float waveSinusoid = cos(5.0 * (distanceFromMouse - (uTime / 75.0)));
                // attenuate the effect based on mouse distance
                float distanceStrength = (0.4 / (distanceFromMouse + 0.4));
                // calculate our distortion effect
                float distortionEffect = distanceStrength * waveSinusoid * uMouseMoveStrength;
                // apply it to our vertex position
                vertexPosition.z +=  distortionEffect / 30.0;
                vertexPosition.x +=  (distortionEffect / 30.0 * (uResolution.x / uResolution.y) * (uMousePosition.x - vertexPosition.x));
                vertexPosition.y +=  distortionEffect / 30.0 * (uMousePosition.y - vertexPosition.y);
                gl_Position = uPMatrix * uMVMatrix * vec4(vertexPosition, 1.0);
                // varyings
                vTextureCoord = (simplePlaneTextureMatrix * vec4(aTextureCoord, 0.0, 1.0)).xy;
                vVertexPosition = vertexPosition;
            }
        `;

    const fs = `
            precision mediump float;
            varying vec3 vVertexPosition;
            varying vec2 vTextureCoord;
            uniform sampler2D simplePlaneTexture;
            void main() {
                // apply our texture
                vec4 finalColor = texture2D(simplePlaneTexture, vTextureCoord);
                // fake shadows based on vertex position along Z axis
                finalColor.rgb -= clamp(-vVertexPosition.z, 0.0, 1.0);
                // fake lights based on vertex position along Z axis
                finalColor.rgb += clamp(vVertexPosition.z, 0.0, 1.0);
                // handling premultiplied alpha (useful if we were using a png with transparency)
                finalColor = vec4(finalColor.rgb * finalColor.a, finalColor.a);
                gl_FragColor = finalColor;
            }
        `;

    // some basic parameters
    const params = {
        vertexShader: vs,
        fragmentShader: fs,
        widthSegments: 20,
        heightSegments: 20,
        uniforms: {
            resolution: { // resolution of our plane
                name: "uResolution",
                type: "2f", // notice this is an length 2 array of floats
                value: [planeElements[0].clientWidth, planeElements[0].clientHeight],
            },
            time: { // time uniform that will be updated at each draw call
                name: "uTime",
                type: "1f",
                value: 0,
            },
            fullscreenTransition: {
                name: "uTransition",
                type: "1f",
                value: 0,
            },
            mousePosition: { // our mouse position
                name: "uMousePosition",
                type: "2f", // again an array of floats
                value: mousePosition,
            },
            mouseMoveStrength: { // the mouse move strength
                name: "uMouseMoveStrength",
                type: "1f",
                value: 0,
            },
            scrollEffect: {
                name: "uScrollEffect",
                type: "1f",
                value: 0,
            }
        }
    };

    // create our plane
    // const simplePlane = new Plane(curtains, planeElements[0], params);

    // insert my code here
    for (let i = 0; i < planeElements.length; i++) {

        planes.push(new Plane(curtains, planeElements[i], params));

        handlePlanes(i);

    }


    // handle the plane
    function handlePlanes(index) {
        const plane = planes[index];

        // if there has been an error during init, simplePlane will be null
        plane.onReady(() => {
            // set a fov of 35 to reduce perspective (we could have used the fov init parameter)
            plane.setPerspective(35);

            // apply a little effect once everything is ready
            deltas.max = 3;

            const wrapper = planeElements[index];

            plane.textures[0].setScale(new Vec2(1.25, 1.25));

            // apply parallax on load
            applyPlanesParallax(plane);

            wrapper.addEventListener("mousemove", (e) => {
                handleMovement(e, plane);
            });

            wrapper.addEventListener("touchmove", (e) => {
                handleMovement(e, plane);
            }, {
                passive: true
            });

            // plane.htmlElement.addEventListener("click", (e) => {
            //     onPlaneClick(e, plane);
            // });

        }).onRender(() => {
            // increment our time uniform
            plane.uniforms.time.value++;

            // decrease both deltas by damping : if the user doesn't move the mouse, effect will fade away
            deltas.applied += (deltas.max - deltas.applied) * 0.02;
            deltas.max += (0 - deltas.max) * 0.01;

            // send the new mouse move strength value
            plane.uniforms.mouseMoveStrength.value = deltas.applied;

            // new way: we just have to change the rotation and scale properties directly!
            // apply the rotation
            // plane.rotation.z = Math.abs(scrollEffect) / 750;

            // scale plane and its texture
            // plane.scale.y = 1 + Math.abs(scrollEffect) / 300;
            // plane.textures[0].scale.y = 1 + Math.abs(scrollEffect) / 150;

            // update the uniform
            plane.uniforms.scrollEffect.value = scrollEffect;

        }).onAfterResize(() => {
            const planeBoundingRect = plane.getBoundingRect();
            plane.uniforms.resolution.value = [planeBoundingRect.width, planeBoundingRect.height];

            // if plane is displayed fullscreen, update its scale and translations
            if (plane.userData.isFullscreen) {
                const planeBoundingRect = plane.getBoundingRect();
                const curtainBoundingRect = curtains.getBoundingRect();

                plane.setScale(new Vec2(
                    curtainBoundingRect.width / planeBoundingRect.width,
                    curtainBoundingRect.height / planeBoundingRect.height
                ));

                plane.setRelativeTranslation(new Vec3(
                    -1 * planeBoundingRect.left / curtains.pixelRatio,
                    -1 * planeBoundingRect.top / curtains.pixelRatio,
                    0
                ));
            }

            applyPlanesParallax(plane);
        }).onError(() => {
            // we will add a class to the document body to display original images
            document.body.classList.add("no-curtains");
        });
    }

    // handle the mouse move event
    function handleMovement(e, plane) {
        // update mouse last pos
        mouseLastPosition.copy(mousePosition);

        const mouse = new Vec2();

        // touch event
        if (e.targetTouches) {
            mouse.set(e.targetTouches[0].clientX, e.targetTouches[0].clientY);
        }
        // mouse event
        else {
            mouse.set(e.clientX, e.clientY);
        }

        // lerp the mouse position a bit to smoothen the overall effect
        mousePosition.set(
            curtains.lerp(mousePosition.x, mouse.x, 0.3),
            curtains.lerp(mousePosition.y, mouse.y, 0.3)
        );

        // convert our mouse/touch position to coordinates relative to the vertices of the plane and update our uniform
        plane.uniforms.mousePosition.value.copy(plane.mouseToPlaneCoords(mousePosition));

        // calculate the mouse move strength
        if (mouseLastPosition.x && mouseLastPosition.y) {
            let delta = Math.sqrt(Math.pow(mousePosition.x - mouseLastPosition.x, 2) + Math.pow(mousePosition.y - mouseLastPosition.y, 2)) / 30;
            delta = Math.min(4, delta);
            // update max delta only if it increased
            if (delta >= deltas.max) {
                deltas.max = delta;
            }
        }
    }

    function applyPlanesParallax(plane) {
        // calculate the parallax effect
        // get our window size
        const sceneBoundingRect = curtains.getBoundingRect();
        // get our plane center coordinate
        const planeBoundingRect = plane.getBoundingRect();
        const planeOffsetTop = planeBoundingRect.top + planeBoundingRect.height / 2;
        // get a float value based on window height (0 means the plane is centered)
        const parallaxEffect = (planeOffsetTop - sceneBoundingRect.height / 2) / sceneBoundingRect.height;

        // set texture offset
        const texture = plane.textures[0];
        texture.offset.y = (1 - texture.scale.y) * 0.5 * parallaxEffect;
    }

    /******** GALLERY ********/

    const galleryState = {
        fullscreenThumb: false,
        openTween: null
    }

    function onPlaneClick(event, plane) {
        // if no planes are already displayed fullscreen
        if (!galleryState.fullscreenThumb) {
            // set fullscreen state
            galleryState.fullscreenThumb = true;
            document.body.classList.add("is-fullscreen");

            // flag this plane
            plane.userData.isFullscreen = true;

            // put plane in front
            plane.setRenderOrder(1);

            // start ripple effect from mouse position, and tween it to center
            const startMousePosition = plane.mouseToPlaneCoords(mousePosition);
            plane.uniforms.mousePosition.value.copy(startMousePosition);
            plane.uniforms.time.value = 0;

            // we'll be using bounding rect values to tween scale and translation values
            const planeBoundingRect = plane.getBoundingRect();
            const curtainBoundingRect = curtains.getBoundingRect();

            // starting values
            let animation = {
                scaleX: 1,
                scaleY: 1,
                translationX: 0,
                translationY: 0,
                transition: 0,
                textureScale: 1.25,
                mouseX: startMousePosition.x,
                mouseY: startMousePosition.y,
            };


            // create vectors only once and use them later on during tween onUpdate callback
            const newScale = new Vec2();
            const newTranslation = new Vec3();

            // kill tween
            if (galleryState.openTween) {
                galleryState.openTween.kill();
            }

            // we want to take top left corner as our plane transform origin
            plane.setTransformOrigin(newTranslation);

            galleryState.openTween = gsap.to(animation, 2, {
                scaleX: curtainBoundingRect.width / planeBoundingRect.width,
                scaleY: curtainBoundingRect.height / planeBoundingRect.height,
                translationX: -1 * planeBoundingRect.left / curtains.pixelRatio,
                translationY: -1 * planeBoundingRect.top / curtains.pixelRatio,
                transition: 1,
                textureScale: 1,
                mouseX: 0,
                mouseY: 0,
                ease: Power3.easeInOut,
                onUpdate: function () {
                    // plane scale
                    newScale.set(animation.scaleX, animation.scaleY);
                    plane.setScale(newScale);

                    // plane translation
                    newTranslation.set(animation.translationX, animation.translationY, 0);
                    plane.setRelativeTranslation(newTranslation);

                    // texture scale
                    newScale.set(animation.textureScale, animation.textureScale);
                    plane.textures[0].setScale(newScale);

                    // transition value
                    plane.uniforms.fullscreenTransition.value = animation.transition;

                    // apply parallax to change texture offset
                    applyPlanesParallax(plane);

                    // tween mouse position back to center
                    plane.uniforms.mousePosition.value.set(animation.mouseX, animation.mouseY);
                },
                onComplete: function () {
                    // do not draw all other planes since animation is complete and they are hidden
                    const nonClickedPlanes = curtains.planes.filter(el => el.uuid !== plane.uuid && el.type !== "PingPongPlane");

                    nonClickedPlanes.forEach(el => {
                        el.visible = false;
                    });

                    // display close button
                    // galleryState.closeButtonEl.style.display = "inline-block";

                    // clear tween
                    galleryState.openTween = null;
                }
            });
        }
    }

    function destroyPlanes() {
        planes.forEach((plane) => {
            plane.remove();
        });

        planes = [];
    }
});

/*********************
* * GLOBAL WINDOW RESIZE EVENT LISTENER
*********************/

window.addEventListener('resize', () => {

    if (document.body.classList.contains('home')) {
        windowResize(shapeCanvas);

        updateCircle(shapeCanvasContext, homeCircle);

        if (scrollY >= rectTlEnd) {
            drawBgRectangle(shapeCanvasContext, homeCircle, bgRectangle);
        }
    }
    else if (document.body.classList.contains('project-body')) {
        windowResize(projectCircleCanvas);

        updateCircle(projectCanvasContext, projectCircle);
    }

});

/*********************
* * GLOBAL FUNCTIONS
*********************/

function windowResize(canvas) {
    vw = canvas.width = document.body.clientWidth;
    vh = canvas.height = window.innerHeight;
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
    let starterRadius = calcStarterRadius(viewWidth);

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

    let starterRadius = calcStarterRadius(windowWidth);

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
function calcFillRadius(viewWidth, viewHeight, circle) {
    let circleX = circle.x;
    let circleY = circle.y;

    let deltaX = circleX < viewWidth / 2 ? viewWidth - circleX : circleX;
    let deltaY = circleY < viewHeight / 2 ? viewHeight - circleY : circleY;

    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
}

// Canvas Functions to Actually Do The Drawings
function drawCircle(context, circle) {
    context.clearRect(0, 0, vw, vh);
    context.beginPath();
    context.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI, false);
    context.globalAlpha = circle.globalAlpha;
    context.fillStyle = "#F4F5F5";
    context.fill();
}

// On Window Resize, update Circle Coordinates and Radii
function updateCircle(context, circle) {
    let starterRadius, circleX, circleY, fillRadius;

    if (document.body.classList.contains('home')) {
        starterRadius = calcStarterRadius(vw);
        circleX = calcCircleX(vw);
        circleY = calcCircleY(vw, vh);
        fillRadius = calcFillRadius(vw, vh, circle);
    } else {
        starterRadius = 0;
        circleX = vw / 2;
        circleY = vh / 2;
        fillRadius = calcFillRadius(vw, vh, circle);
    }

    circle.x = circleX;
    circle.y = circleY;

    if (scrollY === 0) {
        circle.radius = starterRadius;
        drawCircle(context, circle);
    }

    if (scrollY >= vh) {
        circle.radius = fillRadius;
        drawCircle(context, circle);
    }
}

// Canvas Functions to Actually Do The Drawings on Rectangle
function drawBgRectangle(context, circle, rectangle) {
    context.clearRect(0, 0, vw, vh);
    drawCircle(context, circle);
    context.beginPath();
    context.rect(0, 0, rectangle.width, vh);
    context.fillStyle = "#141C28";
    context.fill();
}

/******** BARBAJS SPECIFIC FUNCTIONS ********/

function killScrollTriggers() {
    let triggers = ScrollTrigger.getAll();
    let count = 0;

    triggers.forEach((trigger) => {
        trigger.kill();
        count++;
    });

    console.log(count, 'ScrollTriggers killed');
}

function countActiveScrollTriggers() {
    let triggers = ScrollTrigger.getAll();
    let count = 0;

    triggers.forEach((trigger) => {
        count++;
    });

    console.log(count, 'ScrollTriggers on this page');
}

/******** ENABLE/DISABLE SCROLL FUNCTIONS ********/

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
