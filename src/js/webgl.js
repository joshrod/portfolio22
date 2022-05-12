window.addEventListener("load", () => {
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

        // // update the plane positions during scroll
        // for (let i = 0; i < planes.length; i++) {
        //     // apply additional translation, scale and rotation
        //     applyPlanesParallax(plane);
        //     deltas.max = 1.75;
        // }

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
});