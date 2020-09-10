let mat4 = glMatrix.mat4;

let projectionMatrix;

let shaderProgram, shaderVertexPositionAttribute, shaderVertexColorAttribute, shaderProjectionMatrixUniform, shaderModelViewMatrixUniform;

let duration = 10000; // ms

// Attributes: Input variables used in the vertex shader. Since the vertex shader is called on each vertex, these will be different every time the vertex shader is invoked.
// Uniforms: Input variables for both the vertex and fragment shaders. These do not change values from vertex to vertex.
// Varyings: Used for passing data from the vertex shader to the fragment shader. Represent information for which the shader can output different value for each vertex.
let vertexShaderSource =
    "    attribute vec3 vertexPos;\n" +
    "    attribute vec4 vertexColor;\n" +

    "    uniform mat4 modelViewMatrix;\n" +
    "    uniform mat4 projectionMatrix;\n" +

    "    varying vec4 vColor;\n" +

    "    void main(void) {\n" +
    "		// Return the transformed and projected vertex value\n" +
    "        gl_Position = projectionMatrix * modelViewMatrix * \n" +
    "            vec4(vertexPos, 1.0);\n" +
    "        // Output the vertexColor in vColor\n" +
    "        vColor = vertexColor * 0.8;\n" +
    "    }\n";

// precision lowp float
// This determines how much precision the GPU uses when calculating floats. The use of highp depends on the system.
// - highp for vertex positions,
// - mediump for texture coordinates,
// - lowp for colors.
let fragmentShaderSource =
    "    precision lowp float;\n" +
    "    varying vec4 vColor;\n" +
    "    void main(void) {\n" +
    "    gl_FragColor = vColor;\n" +
    "}\n";

function initWebGL(canvas) {
    let gl = null;
    let msg = "Your browser does not support WebGL, " +
        "or it is not enabled by default.";
    try {
        gl = canvas.getContext("experimental-webgl");
    }
    catch (e) {
        msg = "Error creating WebGL Context!: " + e.toString();
    }

    if (!gl) {
        alert(msg);
        throw new Error(msg);
    }

    return gl;
}

function initViewport(gl, canvas) {
    gl.viewport(0, 0, canvas.width, canvas.height);
}

function initGL(canvas) {
    // Create a project matrix with 45 degree field of view
    projectionMatrix = mat4.create();

    mat4.perspective(projectionMatrix, Math.PI / 4, canvas.width / canvas.height, 1, 100);
    mat4.translate(projectionMatrix, projectionMatrix, [0, 0, -5]);
}

// Create the vertex, color and index data for a multi-colored cube
function createPyramid(gl, translation, rotationAxis) {
    // Vertex Data
    let vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    let verts = [
        //Base
        0.0, 1.8, 0.0,      //A 0
        -0.81, -0.8, 0.0,   //B 1  
        0.81, -0.8, 0.0,    //C 2
        -1.24, 0.96, 0.0,   //D 3
        1.24, 0.96, 0.0,    //E 4

        //Primer cara
        0.0, 1.8, 0.0,      //A 5
        -1.24, 0.96, 0.0,   //D 6
        0.0, 0.0, 2.25,      //P 7

        //Segunda cara
        -0.81, -0.8, 0.0,   //B 8  
        -1.24, 0.96, 0.0,   //D 9
        0.0, 0.0, 2.25,      //P 10

        //Tercera cara
        -0.81, -0.8, 0.0,   //B 11
        0.81, -0.8, 0.0,    //C 12 
        0.0, 0.0, 2.25,      //P 13

        //Cuarta cara
        0.81, -0.8, 0.0,    //C 14
        1.24, 0.96, 0.0,    //E 15
        0.0, 0.0, 2.25,      //P 16

        //Quinta cara
        0.0, 1.8, 0.0,      //A 17
        1.24, 0.96, 0.0,    //E 18
        0.0, 0.0, 2.25,      //P 19

    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    // Color data
    let colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

    let faceColors = [
        //R    G    B    T
        [1.0, 0.0, 0.0, 1.0], // BASE
        [0.0, 1.0, 0.0, 1.0], // Primera cara
        [0.0, 0.0, 1.0, 1.0], // Segunda Cara
        [1.0, 1.0, 0.0, 1.0], // Tercera Cara
        [1.0, 0.0, 1.0, 1.0], // Cuarta cara
        [0.0, 1.0, 1.0, 1.0]  // Quinta cara
    ];

    // Each vertex must have the color information, that is why the same color is concatenated 4 times, one for each vertex of the cube's face.
    let vertexColors = [];

    let baseValues = [0.99, 0.80, 0.24, 1];

    for (let index = 0; index < 5; index++) {
        vertexColors.push(...baseValues);
    }

    faceColors.forEach(color => {
        for (let j = 0; j < 3; j++)
            vertexColors.push(...color);
    });

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    // Index data (defines the triangles to be drawn).
    let pyramidIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, pyramidIndexBuffer);

    let pyramidIndices = [
        0, 1, 3,    0, 1, 2,    0, 2, 4,    //Base
        5, 6, 7,                            //1er cara
        8, 9, 10,                           //2nda cara
        11, 12, 13,                         //3era cara
        14, 15, 16,                         //4ta cara
        17, 18, 19                          //5ta cara
    ];

    // gl.ELEMENT_ARRAY_BUFFER: Buffer used for element indices.
    // Uint16Array: Array of 16-bit unsigned integers.
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(pyramidIndices), gl.STATIC_DRAW);

    let pyramid = {
        buffer: vertexBuffer, colorBuffer: colorBuffer, indices: pyramidIndexBuffer,
        vertSize: 3, nVerts: 20, colorSize: 4, nColors: 20, nIndices: 24,
        primtype: gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime: Date.now()
    };

    mat4.translate(pyramid.modelViewMatrix, pyramid.modelViewMatrix, translation);

    pyramid.update = function () {
        let now = Date.now();
        let deltat = now - this.currentTime;
        this.currentTime = now;
        let fract = deltat / duration;
        let angle = Math.PI * 2 * fract;

        // Rotates a mat4 by the given angle
        // mat4 out the receiving matrix
        // mat4 a the matrix to rotate
        // Number rad the angle to rotate the matrix by
        // vec3 axis the axis to rotate around
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
    };

    return pyramid;
}

function createDodecahedron(gl, translation, rotationAxis) {
    // Vertex Data
    let vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    let verts = [

        //Base
        -2.53, 0.16, 0,     //  A - 0
        -0.63, 2.46, 0,     //  B - 1
        2.15, 1.36, 0,      //  C - 2
        1.95, -1.62, 0,     //  D - 3
        -0.94, -2.36, 0,    //  E - 4

       //1st face
        -2.53, 0.16, 0,     //  A - 5
        -0.63, 2.46, 0,     //  B - 6
        -1.02, 3.98, 2.54,  //  F - 7
        -3.16, 2.62, 4.11,  //  G - 8
        -4.1, 0.26, 2.54,   //  H - 9

        //2nd face
        -0.63, 2.46, 0,     //  B - 10
        2.15, 1.36, 0,      //  C - 11
        3.47, 2.2, 2.54,    //  I - 12
        1.52, 3.82, 4.11,   //  J - 13
        -1.02, 3.98, 2.54,  //  F - 14

        //3rd face
        2.15, 1.36, 0,      //  C - 15
        1.95, -1.62, 0,     //  D - 16
        3.16, -2.62, 2.54,  //  L - 17
        4.1, -0.26, 4.11,   //  M - 18
        3.47, 2.2, 2.54,    //  I - 19

        //4th face
        3.16, -2.62, 2.54,  //  L - 20
        1.95, -1.62, 0,     //  D - 21
        -0.94, -2.36, 0,    //  E - 22
        -1.52, -3.82, 2.54, //  N - 23
        1.02, -3.98, 4.11,  //  O - 24

        //5th face
        -1.52, -3.82, 2.54, //  N - 25
        -0.94, -2.36, 0,    //  E - 26
        -2.53, 0.16, 0,     //  A - 27
        -4.1, 0.26, 2.54,   //  H - 28
        -3.47, -2.2, 4.11,  //  P - 29

//      Base superior y caras de ese lado
        //6th face
        -2.15, -1.36, 6.65      //  T - 30
        -1.95, 1.62, 6.65,     //  V - 31
        -4.1, 0.26, 2.54,       //  H - 9
        -3.16, 2.62, 4.11,      //  G - 8
        -3.47, -2.2, 4.11,      //  P - 29  (34)

    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    // Color data
    let colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

    let faceColors = [
        //R    G    B    T
        [1.0, 0.0, 0.0, 1.0],       // Primera
        [0.0, 1.0, 0.0, 1.0],       // Segunda
        [0.0, 0.0, 1.0, 1.0],       // Tercera
        [1.0, 1.0, 0.0, 1.0],       // Cuarta
        [1.0, 0.0, 1.0, 1.0],       // Quinta
        [0.0, 1.0, 1.0, 1.0],       // Sexta
        [1.0, 1.0, 1.0, 1.0],       // Séptima  
        [0.0, 0.0, 0.0, 1.0]        //Octavo
    ];

    // Each vertex must have the color information, that is why the same color is concatenated 4 times, one for each vertex of the cube's face.
    let vertexColors = [];
    // for (const color of faceColors) 
    // {
    //     for (let j=0; j < 4; j++)
    //         vertexColors.push(...color);
    // }
    faceColors.forEach(color => {
        for (let j = 0; j < 5; j++)
            vertexColors.push(...color);
    });

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    // Index data (defines the triangles to be drawn).
    let cubeIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndexBuffer);

    let cubeIndices = [
        0, 1, 2,        0, 2, 3,        0, 3, 4,    //BASE
        8, 7, 6,        8, 6, 5,        8, 5, 9,    //First
        13, 11, 12,     13, 11, 10,     10, 14, 13, //Second
        16, 17, 18,     15, 16, 18,     15, 18, 19, //Third
        22, 23, 24,     21, 22, 24,     20, 21, 24, //Fourth
        27, 28, 29,     26, 27, 29,     25, 26, 29, //Fifth
        8, 9, 30,       9, 30, 31,      9, 29, 31,  //Seventh
    ];

    // gl.ELEMENT_ARRAY_BUFFER: Buffer used for element indices.
    // Uint16Array: Array of 16-bit unsigned integers.
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeIndices), gl.STATIC_DRAW);

    let cube = {
        buffer: vertexBuffer, colorBuffer: colorBuffer, indices: cubeIndexBuffer,
        vertSize: 3, nVerts: 35, colorSize: 4, nColors: 35, nIndices: 63,
        primtype: gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime: Date.now()
    };

    mat4.translate(cube.modelViewMatrix, cube.modelViewMatrix, translation);

    cube.update = function () {
        let now = Date.now();
        let deltat = now - this.currentTime;
        this.currentTime = now;
        let fract = deltat / duration;
        let angle = Math.PI * 2 * fract;

        // Rotates a mat4 by the given angle
        // mat4 out the receiving matrix
        // mat4 a the matrix to rotate
        // Number rad the angle to rotate the matrix by
        // vec3 axis the axis to rotate around
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
    };

    return cube;
}

function createOctahedron(gl, translation, rotationAxis) {
    // Vertex Data
    let vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    let verts = [
        //Comienzan áreas positivas
        // X,    Z,     Y
        //Primera cara
        -1.0, 0.0, 1.0, 	//  A   0
        -1.0, 0.0, -1.0,    //  B   1
        0.0, 1.25, 0.0,     //  P+  2

        //Segunda cara
        -1.0, 0.0, -1.0,    //  B   3
        1.0, 0.0, -1.0,     //  C   4
        0.0, 1.25, 0.0,     //  P+  5

        //Tercer cara
        1.0, 0.0, -1.0,     //  C   6
        1.0, 0.0, 1.0,      //  D   7
        0.0, 1.25, 0.0,     //  P+  8

        //Cuarta cara
        1.0, 0.0, 1.0,      //  A   9
        -1.0, 0.0, 1.0,     //  D   10
        0.0, 1.25, 0.0,     //  P+  11


        //  A partir de aquí se pintan las caras negativas

        //Left side
        -1.0, 0.0, 1.0, 	//  A   12
        -1.0, 0.0, -1.0,    //  B   13
        0.0, -1.25, 0.0,    //  P-  14

        //Back side
        -1.0, 0.0, -1.0,    //  B   15
        1.0, 0.0, -1.0,     //  C   16
        0.0, -1.25, 0.0,    //  P-  17

        //Right side
        1.0, 0.0, -1.0,     //  C   18
        1.0, 0.0, 1.0,      //  D   19
        0.0, -1.25, 0.0,    //  P-  20

        //Front side
        1.0, 0.0, 1.0,      //  A   21
        -1.0, 0.0, 1.0,     //  D   22
        0.0, -1.25, 0.0,    //  P-  23
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    // Color data
    let colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

    let faceColors = [
        //R    G    B    T
        [1.0, 0.0, 0.0, 1.0],       // Primera
        [0.0, 1.0, 0.0, 1.0],       // Segunda
        [0.0, 0.0, 1.0, 1.0],       // Tercera
        [1.0, 1.0, 0.0, 1.0],       // Cuarta
        [1.0, 0.0, 1.0, 1.0],       // Quinta
        [0.0, 1.0, 1.0, 1.0],       // Sexta
        [1.0, 1.0, 1.0, 1.0],       // Séptima  
        [0.0, 0.0, 0.0, 1.0]        //Octavo
    ];

    // Each vertex must have the color information, that is why the same color is concatenated 4 times, one for each vertex of the cube's face.
    let vertexColors = [];

    faceColors.forEach(color => {
        for (let j = 0; j < 3; j++)
            vertexColors.push(...color);
    });

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    // Index data (defines the triangles to be drawn).
    let diamondIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, diamondIndexBuffer);

    let diamondIndices = [
        0, 1, 2,        //Primer cara
        3, 4, 5,        //Segunda cara
        6, 7, 8,        //Tercera cara
        9, 10, 11,      //Cuarta cara
        12, 13, 14,     //Quinta cara
        15, 16, 17,     //Sexta cara
        18, 19, 20,     //Séptima cara
        21, 22, 23      //Octava cara
    ];

    // gl.ELEMENT_ARRAY_BUFFER: Buffer used for element indices.
    // Uint16Array: Array of 16-bit unsigned integers.
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(diamondIndices), gl.STATIC_DRAW);

    let rupee = {
        buffer: vertexBuffer, colorBuffer: colorBuffer, indices: diamondIndexBuffer,
        vertSize: 3, nVerts: 24, colorSize: 4, nColors: 24, nIndices: 24,
        primtype: gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime: Date.now()
    };

    mat4.translate(rupee.modelViewMatrix, rupee.modelViewMatrix, translation);

    let bounceTop = true;
    let bounceBot = false;

    rupee.update = function () {
        let now = Date.now();
        let deltat = now - this.currentTime;
        this.currentTime = now;
        let fract = deltat / duration;
        let angle = Math.PI * 2 * fract;

        if (bounceTop == true) {
            mat4.translate(rupee.modelViewMatrix, rupee.modelViewMatrix, [0, -.025, 0]);
            if (this.modelViewMatrix[13] < -2.89) {
                bounceBot = true;
                bounceTop = false;
            }
        }

        if (bounceBot == true) {
            mat4.translate(rupee.modelViewMatrix, rupee.modelViewMatrix, [0, .025, 0]);
            if (this.modelViewMatrix[13] > 2.89) {
                bounceBot = false;
                bounceTop = true;
            }
        }

        // Rotates a mat4 by the given angle
        // mat4 out the receiving matrix
        // mat4 a the matrix to rotate
        // Number rad the angle to rotate the matrix by
        // vec3 axis the axis to rotate around
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
    };

    return rupee;
}

function createShader(gl, str, type) {
    let shader;
    if (type == "fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (type == "vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

function initShader(gl) {
    // load and compile the fragment and vertex shader
    let fragmentShader = createShader(gl, fragmentShaderSource, "fragment");
    let vertexShader = createShader(gl, vertexShaderSource, "vertex");

    // link them together into a new program
    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // get pointers to the shader params
    shaderVertexPositionAttribute = gl.getAttribLocation(shaderProgram, "vertexPos");
    gl.enableVertexAttribArray(shaderVertexPositionAttribute);

    shaderVertexColorAttribute = gl.getAttribLocation(shaderProgram, "vertexColor");
    gl.enableVertexAttribArray(shaderVertexColorAttribute);

    shaderProjectionMatrixUniform = gl.getUniformLocation(shaderProgram, "projectionMatrix");
    shaderModelViewMatrixUniform = gl.getUniformLocation(shaderProgram, "modelViewMatrix");

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }
}

function draw(gl, objs) {
    // clear the background (with black)
    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // set the shader to use
    gl.useProgram(shaderProgram);

    for (i = 0; i < objs.length; i++) {
        obj = objs[i];
        // connect up the shader parameters: vertex position, color and projection/model matrices
        // set up the buffers
        gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffer);
        gl.vertexAttribPointer(shaderVertexPositionAttribute, obj.vertSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, obj.colorBuffer);
        gl.vertexAttribPointer(shaderVertexColorAttribute, obj.colorSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indices);

        gl.uniformMatrix4fv(shaderProjectionMatrixUniform, false, projectionMatrix);
        gl.uniformMatrix4fv(shaderModelViewMatrixUniform, false, obj.modelViewMatrix);

        // Draw the object's primitives using indexed buffer information.
        // void gl.drawElements(mode, count, type, offset);
        // mode: A GLenum specifying the type primitive to render.
        // count: A GLsizei specifying the number of elements to be rendered.
        // type: A GLenum specifying the type of the values in the element array buffer.
        // offset: A GLintptr specifying an offset in the element array buffer.
        gl.drawElements(obj.primtype, obj.nIndices, gl.UNSIGNED_SHORT, 0);
    }
}

function run(gl, objs) {
    // The window.requestAnimationFrame() method tells the browser that you wish to perform an animation and requests that the browser call a specified function to update an animation before the next repaint. The method takes a callback as an argument to be invoked before the repaint.
    requestAnimationFrame(function () { run(gl, objs); });

    draw(gl, objs);

    for (i = 0; i < objs.length; i++)
        objs[i].update();
}