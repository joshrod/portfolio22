// // wait for everything to be ready
// window.addEventListener("load", () => {
//     // set up our WebGL context and append the canvas to our wrapper
//     const curtains = new Curtains({
//         container: "mcnay-canvas",
//         watchScroll: false
//     });
//     // get our plane element
//     const planeElement = document.getElementsByClassName("mcnay-plane")[0];
//     // set our initial parameters (basic uniforms)
//     const params = {
//         vertexShaderID: "plane-vs", // our vertex shader ID
//         fragmentShaderID: "plane-fs", // our fragment shader ID
//         uniforms: {
//             time: {
//                 name: "uTime", // uniform name that will be passed to our shaders
//                 type: "1f", // this means our uniform is a float
//                 value: 0,
//             },
//         },
//     };
//     // create our plane using our curtains object, the HTML element and the parameters
//     const plane = new Plane(curtains, planeElement, params);
//     plane.onRender(() => {
//         // use the onRender method of our plane fired at each requestAnimationFrame call
//         plane.uniforms.time.value++; // update our time uniform value
//     });
// });

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
        pixelRatio: Math.min(1.5, window.devicePixelRatio) // limit pixel ratio for performance
    });

    // handling errors
    curtains.onError(() => {
        // we will add a class to the document body to display original images
        document.body.classList.add("no-curtains");
    }).onContextLost(() => {
        // on context lost, try to restore the context
        curtains.restoreContext();
    });

    const planes = [];

    // get our plane elements
    const planeElements = document.getElementsByClassName("curtains-plane");
    console.log(planeElements);


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
        void main() {
            vec3 vertexPosition = aVertexPosition;
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
            mousePosition: { // our mouse position
                name: "uMousePosition",
                type: "2f", // again an array of floats
                value: mousePosition,
            },
            mouseMoveStrength: { // the mouse move strength
                name: "uMouseMoveStrength",
                type: "1f",
                value: 0,
            }
        }
    };

    // create our plane
    // const simplePlane = new Plane(curtains, planeElements[0], params);

    // insert my code here
    for (let i = 0; i < planeElements.length; i++) {
        // const plane = planeElements[i];

        // const simplePlane = new Plane(curtains, plane, params);

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
            console.log(wrapper);

            wrapper.addEventListener("mousemove", (e) => {
                handleMovement(e, plane);
            });

            wrapper.addEventListener("touchmove", (e) => {
                handleMovement(e, plane);
            }, {
                passive: true
            });

        }).onRender(() => {
            // increment our time uniform
            plane.uniforms.time.value++;

            // decrease both deltas by damping : if the user doesn't move the mouse, effect will fade away
            deltas.applied += (deltas.max - deltas.applied) * 0.02;
            deltas.max += (0 - deltas.max) * 0.01;

            // send the new mouse move strength value
            plane.uniforms.mouseMoveStrength.value = deltas.applied;

        }).onAfterResize(() => {
            const planeBoundingRect = plane.getBoundingRect();
            plane.uniforms.resolution.value = [planeBoundingRect.width, planeBoundingRect.height];
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
});