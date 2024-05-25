// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
    precision mediump float;
    attribute vec4 a_Position;
    attribute vec2 a_UV;
    attribute vec3 a_Normal;
    varying vec2 v_UV;
    varying vec3 v_Normal;
    varying vec4 v_VertPos;
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_NormalMatrix;
    uniform mat4 u_GlobalRotateMatrix;
    uniform mat4 u_ViewMatrix;
    uniform mat4 u_ProjectionMatrix;
    void main() {
        gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
        v_UV = a_UV;
        v_Normal = normalize(vec3(u_NormalMatrix * vec4(a_Normal, 1)));
        // v_Normal = a_Normal;
        v_VertPos = u_ModelMatrix * a_Position;
    }
`;

// Fragment shader program
var FSHADER_SOURCE = `
    precision mediump float;
    varying vec2 v_UV;
    varying vec3 v_Normal;
    uniform vec4 u_FragColor;
    uniform sampler2D u_Sampler0;
    uniform sampler2D u_Sampler1;
    uniform int u_whichTexture;
    uniform vec3 u_LightPos;
    uniform vec3 u_CameraPos;
    varying vec4 v_VertPos;
    uniform bool u_IsLightOn;
    uniform vec4 u_LightColor;
    void main() {
        if(u_whichTexture == -3){
            gl_FragColor = vec4((v_Normal + 1.0) / 2.0, 1.0);
        }
        else if(u_whichTexture == -2){
            gl_FragColor = u_FragColor;
        }
        else if(u_whichTexture == -1){
            gl_FragColor = vec4(v_UV, 1.0, 1.0);
        }
        else if(u_whichTexture == 0){
            gl_FragColor = texture2D(u_Sampler0, v_UV);
        }
        else if(u_whichTexture == 1){
            gl_FragColor = texture2D(u_Sampler1, v_UV);
        }
        else{
            gl_FragColor = vec4(1.0, 0.2, 0.2, 1.0);
        }

        vec3 lightVector = u_LightPos - vec3(v_VertPos);
        float r = length(lightVector);

        // if(r < 1.0){
        //     gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
        // }
        // else if(r < 2.0){
        //     gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
        // }

        // gl_FragColor = vec4(vec3(gl_FragColor) / (r * r), 1);

        // N dot L
        vec3 L = normalize(lightVector);
        vec3 N = normalize(v_Normal);
        float nDotL = max(dot(N, L), 0.0);

        // Reflection
        vec3 R = reflect(-L, N);

        // Eye
        vec3 E = normalize(u_CameraPos - vec3(v_VertPos));

        // Specular
        float specular = pow(max(dot(E, R), 0.0), 10.0);

        vec3 diffuse = vec3(gl_FragColor) * nDotL * 0.7;
        vec3 ambient = vec3(gl_FragColor) * 0.3;

        if(u_IsLightOn){
            gl_FragColor = vec4(specular + diffuse + ambient, 1.0) * u_LightColor;
        }
    }
`;

let canvas;
let gl;
let a_Position;
let a_UV;
let a_Normal;
let u_FragColor;
let u_ModelMatrix;
let u_NormalMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let u_Sampler0; // sky
let u_Sampler1; // dirt
let u_whichTexture; // -2 = color, -1 = UV
let u_LightPos;
let u_CameraPos;
let u_IsLightOn;
let u_LightColor;

function setupWebGL() {
    // Retrieve canvas element
    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    // Get the storage location of a_Position
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }

    a_UV = gl.getAttribLocation(gl.program, 'a_UV');
    if (a_UV < 0) {
        console.log('Failed to get the storage location of a_UV');
        return;
    }

    a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
    if (a_Normal < 0) {
        console.log('Failed to get the storage location of a_Normal');
        return;
    }

    // Get the storage location of u_FragColor
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }

    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix) {
        console.log('Failed to get the storage location of u_ModelMatrix');
        return;
    }

    u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
    if (!u_NormalMatrix) {
        console.log('Failed to get the storage location of u_NormalMatrix');
        return;
    }

    u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
    if (!u_ProjectionMatrix) {
        console.log('Failed to get the storage location of u_ProjectionMatrix');
        return;
    }

    u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    if (!u_ViewMatrix) {
        console.log('Failed to get the storage location of u_ViewMatrix');
        return;
    }

    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    if (!u_GlobalRotateMatrix) {
        console.log('Failed to get the storage location of u_GlobalRotateMatrix');
        return;
    }

    // Get the storage location of u_Sampler0
    u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
    if (!u_Sampler0) {
        console.log('Failed to get the storage location of u_Sampler0');
        return false;
    }

    u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
    if (!u_Sampler1) {
        console.log('Failed to get the storage location of u_Sampler1');
        return false;
    }

    u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
    if (!u_whichTexture) {
        console.log('Failed to get the storage location of u_whichTexture');
        return false;
    }

    u_LightPos = gl.getUniformLocation(gl.program, 'u_LightPos');
    if (!u_LightPos) {
        console.log('Failed to get the storage location of u_LightPos');
        return false;
    }

    u_CameraPos = gl.getUniformLocation(gl.program, 'u_CameraPos');
    if (!u_CameraPos) {
        console.log('Failed to get the storage location of u_CameraPos');
        return false;
    }

    u_IsLightOn = gl.getUniformLocation(gl.program, 'u_IsLightOn');
    if (!u_IsLightOn) {
        console.log('Failed to get the storage location of u_IsLightOn');
        return false;
    }

    u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
    if (!u_LightColor) {
        console.log('Failed to get the storage location of u_LightColor');
        return false;
    }
}

// Global UI elements
let g_fpsCounter = document.getElementById("fpsCounter");

let g_globalAngleH = 0;
let g_globalAngleV = 0;

let g_testAngle = 0;

let g_camera;

let g_normalOn = false;
let g_lightPos = [1, 1, 1];
let g_isLightOn = true;
let g_lightColor = [1.0, 1.0, 1.0, 1.0];
let g_animateLight = true;

let g_localBuild = true; // this line changes whether running locally or on github pages

let g_map = [];
let g_mapCubes = [];

let g_mouseDown;
let g_mouseX;
let g_mouseY;

let g_customMapInput;

let g_snake;

let g_movementKeys = {
    "w": false,
    "a": false,
    "s": false,
    "d": false
};

function addActionsForHtmlUI() {
    //document.getElementById('angleHSlide').addEventListener('input', function () { g_globalAngleH = this.value; renderAllShapes(); });
    //document.getElementById('angleVSlide').addEventListener('input', function () { g_globalAngleV = this.value; renderAllShapes(); });

    document.getElementById('angleHSlide').addEventListener('input', function () { g_testAngle = this.value; renderAllShapes(); });

    document.getElementById('redSlide').addEventListener('mouseup', function () { g_lightColor[0] = this.value / 100 })
    document.getElementById('greenSlide').addEventListener('mouseup', function () { g_lightColor[1] = this.value / 100 })
    document.getElementById('blueSlide').addEventListener('mouseup', function () { g_lightColor[2] = this.value / 100 })

    document.getElementById("normalOn").onclick = function () { g_normalOn = true; };
    document.getElementById("normalOff").onclick = function () { g_normalOn = false; };

    document.getElementById("lightSlideX").addEventListener("mousemove", function (ev) {
        if (ev.buttons == 1) {
            g_lightPos[0] = this.value / 100;
            renderAllShapes();
        }
    });
    document.getElementById("lightSlideY").addEventListener("mousemove", function (ev) {
        if (ev.buttons == 1) {
            g_lightPos[1] = this.value / 100;
            renderAllShapes();
        }
    });
    document.getElementById("lightSlideZ").addEventListener("mousemove", function (ev) {
        if (ev.buttons == 1) {
            g_lightPos[2] = this.value / 100;
            renderAllShapes();
        }
    });
    document.getElementById("animateLightButton").onclick = function () { g_animateLight = !g_animateLight; };


    document.getElementById("lightsOnButton").onclick = function (ev) {
        g_isLightOn = true;
    };
    document.getElementById("lightsOffButton").onclick = function (ev) {
        g_isLightOn = false;
    };


    g_customMapInput = document.getElementById("customMapInput");
    document.getElementById("loadCustomMapButton").addEventListener("click", function () {
        let customMapData = g_customMapInput.value;
        customMapData = JSON.parse(customMapData);
        g_map = customMapData;
        initializeMapCubes();
    });

    document.getElementById("loadEmptyMapButton").addEventListener("click", function () {
        g_map = JSON.parse(JSON.stringify(g_emptyMap)); // stringify then parse to create deep copy
        initializeMapCubes();
    });
    document.getElementById("loadBasicMapButton").addEventListener("click", function () {
        g_map = JSON.parse(JSON.stringify(g_lightingDefaultMap));
        initializeMapCubes();
    });

    document.getElementById("playSnakeButton").addEventListener("click", function () {
        startPlayingSnake();
    });
    document.getElementById("snakeEasyModeCheckbox").addEventListener("change", function () {
        g_snakeEasyMode = this.checked;
    });

    document.onkeydown = keydown;
    document.onkeyup = keyup;
}

function main() {
    g_camera = new Camera();

    setupWebGL();
    connectVariablesToGLSL();
    addActionsForHtmlUI();

    canvas.onmousedown = function (ev) {
        if (ev.button === 0)
            g_mouseDown = true;
    };
    canvas.onmouseup = function (ev) {
        if (ev.button === 0)
            g_mouseDown = false;
    };
    // move camera with mouse
    canvas.onmousemove = function (ev) {
        if (!g_mouseDown)
            return;
        let panAmount = 300;
        if (ev.clientX > g_mouseX)
            g_camera.panRight(g_deltaTime * panAmount);
        else if (ev.clientX < g_mouseX)
            g_camera.panLeft(g_deltaTime * panAmount);
        if (ev.clientY < g_mouseY)
            g_camera.panUp(g_deltaTime * panAmount);
        else if (ev.clientY > g_mouseY)
            g_camera.panDown(g_deltaTime * panAmount);
        g_mouseX = ev.clientX;
        g_mouseY = ev.clientY;
    };

    initTextures();
    // generateDefaultMap();
    // g_map = JSON.parse(JSON.stringify(g_mapWithSomeStructures));
    g_map = JSON.parse(JSON.stringify(g_lightingDefaultMap));
    initializeMapCubes();

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    requestAnimationFrame(tick);
}

function placeBlock() {
    let frontPos = g_camera.getPosInFront(2);
    frontPos.x = Math.floor(frontPos.x); // floor seems to work better than round
    frontPos.y = Math.floor(frontPos.y);
    frontPos.z = Math.floor(frontPos.z);
    let newCube = new Cube();
    newCube.textureNum = 1;
    newCube.matrix.setTranslate(frontPos.x, frontPos.y, frontPos.z);
    setBlock(newCube, 1, frontPos);
    console.log("placeBlock", frontPos.x, frontPos.y, frontPos.z);
}

function deleteBlock() {
    let frontPos = g_camera.getPosInFront(2);
    frontPos.x = Math.floor(frontPos.x);
    frontPos.y = Math.floor(frontPos.y);
    frontPos.z = Math.floor(frontPos.z);
    setBlock(null, 0, frontPos);
    console.log("deleteBlock", frontPos.x, frontPos.y, frontPos.z);
}

function setBlock(block, blockData, blockPos) {
    /*
        blockData
        0 = empty
        1 = dirt
        2 = snake
        3 = apple
    */
    g_map[blockPos.x][blockPos.y][blockPos.z] = blockData;

    g_mapCubes[blockPos.x][blockPos.y][blockPos.z] = block;
    renderAllShapes();
}

function getMapData(pos) {
    return g_map[pos.x][pos.y][pos.z];
}

function getCube(pos) {
    return g_mapCubes[pos.x][pos.y][pos.z];
}

function generateDefaultMap() {
    let mapX = 32;
    let mapY = 32;
    let mapZ = 32;
    g_map = [];

    for (let x = 0; x < mapX; x++) {
        let arrayX = [];
        for (let y = 0; y < mapY; y++) {
            let arrayY = [];
            for (let z = 0; z < mapZ; z++) {
                if (y == 0)
                    arrayY.push(1);
                else
                    arrayY.push(0);
            }
            arrayX.push(arrayY);
        }
        g_map.push(arrayX);
    }
}

function initializeMapCubes() {
    let mapX = 32;
    let mapY = 32;
    let mapZ = 32;
    g_mapCubes = [];

    for (let x = 0; x < mapX; x++) {
        let arrayXCube = [];
        for (let y = 0; y < mapY; y++) {
            let arrayYCube = [];
            for (let z = 0; z < mapZ; z++) {
                if (g_map[x][y][z] == 1) {
                    let cube = new Cube();
                    cube.textureNum = 1;
                    cube.realTextureNum = cube.textureNum;
                    cube.matrix.setTranslate(x, y, z);
                    arrayYCube.push(cube);
                }
                else
                    arrayYCube.push(null);
            }
            arrayXCube.push(arrayYCube);
        }
        g_mapCubes.push(arrayXCube);
    }
}

function printMap() {
    console.log(JSON.stringify(g_map));
}

function drawMap() {
    for (let x = 0; x < g_mapCubes.length; x++) {
        for (let y = 0; y < g_mapCubes[0].length; y++) {
            for (let z = 0; z < g_mapCubes[0][0].length; z++) {
                let cube = g_mapCubes[x][y][z];
                if (cube != null) {
                    if (g_normalOn)
                        cube.textureNum = -3;
                    else
                        cube.textureNum = cube.realTextureNum;
                    cube.render();
                }
            }
        }
    }
}

function keydown(ev) {
    g_movementKeys[ev.key] = true;
    if (ev.key === "t" || ev.key === "T") {
        placeBlock();
    }
    if (ev.key === "g" || ev.key === "G") {
        deleteBlock();
    }
    if (ev.key === "p" || ev.key === "P") {
        printMap();
    }
    renderAllShapes();
}

function keyup(ev) {
    g_movementKeys[ev.key] = false;
}

function handleMovement() {
    let moveDistance = 20;
    let panAmount = 150;
    if (g_movementKeys["w"] || g_movementKeys["W"])
        g_camera.forward(g_deltaTime * moveDistance);
    if (g_movementKeys["a"] || g_movementKeys["A"])
        g_camera.left(g_deltaTime * moveDistance);
    if (g_movementKeys["s"] || g_movementKeys["S"])
        g_camera.back(g_deltaTime * moveDistance);
    if (g_movementKeys["d"] || g_movementKeys["D"])
        g_camera.right(g_deltaTime * moveDistance);
    if (g_movementKeys["q"] || g_movementKeys["Q"])
        g_camera.panLeft(g_deltaTime * panAmount);
    if (g_movementKeys["e"] || g_movementKeys["E"])
        g_camera.panRight(g_deltaTime * panAmount);
    if (g_movementKeys["r"] || g_movementKeys["R"])
        g_camera.moveUp(g_deltaTime * moveDistance);
    if (g_movementKeys["f"] || g_movementKeys["F"])
        g_camera.moveDown(g_deltaTime * moveDistance);
}

function initTextures() {
    var image0 = new Image();
    if (!image0) {
        console.log('Failed to create the image object');
        return false;
    }
    image0.onload = function () { sendImageToTEXTURE(image0, 0); };
    image0.src = getImagePath("sky.jpg");

    var image1 = new Image();
    if (!image1) {
        console.log('Failed to create the image object');
        return false;
    }

    image1.onload = function () { sendImageToTEXTURE(image1, 1); };
    image1.src = getImagePath("dirt.jpg");

    return true;
}

function getImagePath(imageName) {
    if (g_localBuild)
        return "../resources/" + imageName;
    return "https://wwang178.github.io/cse160-assignment3B/resources/" + imageName;
}

function sendImageToTEXTURE(image, textureIndex) {
    let texture = gl.createTexture();
    if (!texture) {
        console.log('Failed to create the texture object');
        return false;
    }

    let activeTexture;
    let sampler;
    switch (textureIndex) {
        case 0:
            activeTexture = gl.TEXTURE0;
            sampler = u_Sampler0;
            break;
        case 1:
            activeTexture = gl.TEXTURE1;
            sampler = u_Sampler1;
            break;
    }

    // Flip the image's y axis
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    // Enable texture unit
    gl.activeTexture(activeTexture);
    // Bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture);
    // Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // Set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    // Set the texture unit 0 to the sampler
    gl.uniform1i(sampler, textureIndex);
}

function renderAllShapes() {
    let startTime = performance.now();

    let projMat = new Matrix4();
    projMat.setPerspective(90, canvas.width / canvas.height, 0.1, 1000);
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

    let viewMat = new Matrix4();
    viewMat.setLookAt(
        g_camera.eye.x, g_camera.eye.y, g_camera.eye.z,
        g_camera.at.x, g_camera.at.y, g_camera.at.z,
        g_camera.up.x, g_camera.up.y, g_camera.up.z
    );
    //viewMat.setLookAt(10.0, 1.0, 10.0, 10.0, 0.0, 20.0, 0.0, 1.0, 0.0); // (eye, at, up)
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

    var globalRotMat = new Matrix4();
    globalRotMat.rotate(g_globalAngleH, 0, 1, 0);
    globalRotMat.rotate(g_globalAngleV, 1, 0, 0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    // Clear canvas
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.uniform3f(u_LightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);
    gl.uniform3f(u_CameraPos, g_camera.eye.x, g_camera.eye.y, g_camera.eye.z);
    gl.uniform1i(u_IsLightOn, g_isLightOn);
    gl.uniform4f(u_LightColor, g_lightColor[0], g_lightColor[1], g_lightColor[2], g_lightColor[3]);

    // // sky
    // let sky = new Cube();
    // sky.textureNum = 0;
    // sky.matrix.setTranslate(0.0, 7, 0.0);
    // sky.matrix.scale(50.0, 0.1, 50.0);
    // sky.render();

    // // ground
    // let ground = new Cube();
    // ground.textureNum = 1;
    // ground.matrix.setTranslate(0.0, -0.5, 0.0);
    // ground.matrix.scale(50.0, 0.1, 50.0);
    // ground.render();

    // cube1 - color
    let cube1 = new Cube();
    cube1.color = [1.0, 0.0, 0.0, 1.0];
    cube1.textureNum = -2;
    if (g_normalOn)
        cube1.textureNum = -3;
    cube1.matrix.setTranslate(12.5, 4.0, 15.0);
    cube1.matrix.scale(1.0, 1.0, 1.0);
    cube1.matrix.rotate(g_testAngle, 0, 1, 0);
    cube1.normalMatrix.setInverseOf(cube1.matrix).transpose();
    cube1.render();

    // // cube2 - uv
    // let cube2 = new Cube();
    // cube2.color = [1.0, 0.0, 0.0, 1.0];
    // cube2.textureNum = -1;
    // cube2.matrix.setTranslate(10.0, 0.0, 15.0);
    // cube2.matrix.scale(1.0, 1.0, 1.0);
    // cube2.render();

    // // cube3 - dirt texture
    // let cube3 = new Cube();
    // cube3.color = [1.0, 0.0, 0.0, 1.0];
    // cube3.textureNum = 1;
    // cube3.matrix.setTranslate(7.5, 0.0, 15.0);
    // cube3.matrix.scale(1.0, 1.0, 1.0);
    // cube3.render();

    // world box
    let worldBox = new Cube();
    worldBox.color = [0.0, 1.0, 0.0, 1.0];
    worldBox.textureNum = 0;
    if (g_normalOn)
        worldBox.textureNum = -3;
    worldBox.matrix.scale(-100.0, -100.0, -100.0);
    worldBox.matrix.translate(-1.0, -1.0, -1.0);
    worldBox.render();

    // light box
    let lightBox = new Cube();
    lightBox.color = [1.0, 1.0, 0.0, 1.0];
    lightBox.textureNum = -2;
    lightBox.matrix.translate(g_lightPos[0], g_lightPos[1], g_lightPos[2]);
    lightBox.matrix.scale(-0.5, -0.5, -0.5);
    lightBox.matrix.translate(-0.25, -0.25, -0.25);
    lightBox.render();

    // sphere
    let sphere = new Sphere();
    sphere.color = [1.0, 1.0, 1.0, 1.0];
    sphere.textureNum = -2;
    if (g_normalOn)
        sphere.textureNum = -3;
    sphere.matrix.setTranslate(7.0, 5.0, 15.0);
    sphere.render();

    // // wall bottom
    // let wall0 = new Cube();
    // wall0.color = [1.0, 0.0, 0.0, 1.0];
    // wall0.textureNum = -2;
    // if(g_normalOn)
    //     wall0.textureNum = -3;
    // wall0.matrix.setTranslate(-25.0, -10, -25.0);
    // wall0.matrix.scale(100.0, 0.0, 100.0);
    // wall0.render();

    // // wall front
    // let wall1 = new Cube();
    // wall1.color = [0.0, 1.0, 0.0, 1.0];
    // wall1.textureNum = 0;
    // if (g_normalOn)
    //     wall1.textureNum = -3;
    // // wall1.matrix.setTranslate(-25.0, -10, 75.0);
    // wall1.matrix.scale(100.0, 100.0, 0.0);
    // wall1.render();

    // // wall back
    // let wall2 = new Cube();
    // wall2.color = [0.0, 0.0, 1.0, 1.0];
    // wall2.textureNum = 0;
    // if (g_normalOn)
    //     wall2.textureNum = -3;
    // // wall2.matrix.setTranslate(-25.0, -10, -25.0);
    // wall2.matrix.translate(0.0, 0.0, 100.0);
    // wall2.matrix.scale(100.0, 100.0, 0.0);

    // wall2.render();

    // // wall right
    // let wall3 = new Cube();
    // wall3.color = [0.0, 0.5, 0.5, 1.0];
    // wall3.textureNum = 0;
    // if (g_normalOn)
    //     wall3.textureNum = -3;
    // wall3.matrix.scale(0.0, 100.0, 100.0);

    // wall3.matrix.scale(-0.0, -100.0, -100.0);
    // wall3.matrix.translate(0.0, -1, 0.0);

    // wall3.matrix.setTranslate(-25.0, -10, -25.0);
    // wall3.matrix.translate(0.0, 0.0, 0.0);
    // wall3.render();

    // // wall left
    // let wall4 = new Cube();
    // wall4.color = [1.0, 1.0, 1.0, 1.0];
    // wall4.textureNum = 0;
    // if (g_normalOn)
    //     wall4.textureNum = -3;
    // // wall4.matrix.setTranslate(75.0, -10, -25.0);
    // wall4.matrix.translate(100.0, 0.0, 0.0);
    // wall4.matrix.scale(0.0, 100.0, 100.0);
    // wall4.render();

    // // wall bottom
    // let wall5 = new Cube();
    // wall5.color = [1.0, 0.0, 0.0, 1.0];
    // wall5.textureNum = 0;
    // if(g_normalOn)
    //     wall5.textureNum = -3;
    // wall5.matrix.setTranslate(-25.0, 75, -25.0);
    // wall5.matrix.scale(100.0, 0.0, 100.0);
    // wall5.render();

    // map border v bottom right
    let border0 = new Cube();
    border0.color = [1.0, 1.0, 1.0, 1.0];
    border0.textureNum = -2;
    border0.matrix.setTranslate(-1.0, 0.0, -1.0);
    border0.matrix.scale(1.0, 32.0, 1.0);
    border0.render();

    // map border v bottom left
    let border1 = new Cube();
    border1.color = [1.0, 1.0, 1.0, 1.0];
    border1.textureNum = -2;
    border1.matrix.setTranslate(32.0, 0.0, -1.0);
    border1.matrix.scale(1.0, 32.0, 1.0);
    border1.render();

    // map border v top left
    let border2 = new Cube();
    border2.color = [1.0, 1.0, 1.0, 1.0];
    border2.textureNum = -2;
    border2.matrix.setTranslate(32.0, 0.0, 32.0);
    border2.matrix.scale(1.0, 32.0, 1.0);
    border2.render();

    // map border v top right
    let border3 = new Cube();
    border3.color = [1.0, 1.0, 1.0, 1.0];
    border3.textureNum = -2;
    border3.matrix.setTranslate(-1.0, 0.0, 32.0);
    border3.matrix.scale(1.0, 32.0, 1.0);
    border3.render();

    // map border h front bottom
    let border4 = new Cube();
    border4.color = [1.0, 1.0, 1.0, 1.0];
    border4.textureNum = -2;
    border4.matrix.setTranslate(0.0, -1.0, -1.0);
    border4.matrix.scale(32.0, 1.0, 1.0);
    border4.render();

    // map border h back bottom
    let border5 = new Cube();
    border5.color = [1.0, 1.0, 1.0, 1.0];
    border5.textureNum = -2;
    border5.matrix.setTranslate(0.0, -1.0, 32.0);
    border5.matrix.scale(32.0, 1.0, 1.0);
    border5.render();

    // map border h front top
    let border6 = new Cube();
    border6.color = [1.0, 1.0, 1.0, 1.0];
    border6.textureNum = -2;
    border6.matrix.setTranslate(0.0, 32.0, -1.0);
    border6.matrix.scale(32.0, 1.0, 1.0);
    border6.render();

    // map border h back top
    let border7 = new Cube();
    border7.color = [1.0, 1.0, 1.0, 1.0];
    border7.textureNum = -2;
    border7.matrix.setTranslate(0.0, 32.0, 32.0);
    border7.matrix.scale(32.0, 1.0, 1.0);
    border7.render();

    // map border h left bottom
    let border8 = new Cube();
    border8.color = [1.0, 1.0, 1.0, 1.0];
    border8.textureNum = -2;
    border8.matrix.setTranslate(32.0, -1.0, 0.0);
    border8.matrix.scale(1.0, 1.0, 32.0);
    border8.render();

    // map border h right bottom
    let border9 = new Cube();
    border9.color = [1.0, 1.0, 1.0, 1.0];
    border9.textureNum = -2;
    border9.matrix.setTranslate(-1.0, -1.0, 0.0);
    border9.matrix.scale(1.0, 1.0, 32.0);
    border9.render();

    // map border h left top
    let border10 = new Cube();
    border10.color = [1.0, 1.0, 1.0, 1.0];
    border10.textureNum = -2;
    border10.matrix.setTranslate(32.0, 32.0, 0.0);
    border10.matrix.scale(1.0, 1.0, 32.0);
    border10.render();

    // map border h right top
    let border11 = new Cube();
    border11.color = [1.0, 1.0, 1.0, 1.0];
    border11.textureNum = -2;
    border11.matrix.setTranslate(-1.0, 32.0, 0.0);
    border11.matrix.scale(1.0, 1.0, 32.0);
    border11.render();

    drawMap();

    {
        // fps
        let duration = performance.now() - startTime;
        let fpsText = "ms: " + Math.floor(duration) + " fps: " + Math.floor(10000 / duration) / 10;
        displayFps(fpsText);
    }
}

let g_startTime = performance.now() / 1000.0;
let g_seconds = performance.now() / 1000.0 - g_startTime;
let g_lastTickTime = performance.now() / 1000.0;
let g_deltaTime;

function tick() {
    g_seconds = performance.now() / 1000.0 - g_startTime;
    g_deltaTime = performance.now() / 1000.0 - g_lastTickTime;
    g_lastTickTime = performance.now() / 1000.0;
    handleMovement();
    renderAllShapes();
    if (g_isPlayingSnake) {
        g_snake.moveHeadTo(getCurrentPos());
        if (!g_snakeEasyMode)
            // g_camera.forward(0.05);
            g_camera.forward(g_deltaTime * 10);
    }

    if (g_animateLight) {
        g_lightPos[1] = (Math.cos(g_seconds) * 50) + 50;
    }
    requestAnimationFrame(tick);
}

function displayFps(text) {
    g_fpsCounter.innerHTML = text;
}
