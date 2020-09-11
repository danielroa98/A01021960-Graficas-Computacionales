/*
 *  First homework
 *  WebGL Figures
 * 
 *  Made by:
 *  Daniel Roa  -   A01021960
 */

//JS library that manages 3D graphics
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

// Function that initializes the canvas in order to show 
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

//  Para crear la figura de la pirámide pentagonal, se están recibiendo tres parametros
//  la iniciación de WebGL en el canvas, las coordenadas donde se va a encontrar y
//  las coordenadas donde va a estar su eje de rotación.
function createPyramid(gl, translation, rotationAxis) {
    // Datos de los vértices
    let vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    //  En esta sección se encuentran los puntos que van a componer la figura, en este caso
    //  la piramide pentagonal.
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

    //  Aquí se encuentra el colour pallette que se utilizará para
    //  pintar la figura
    let faceColors = [
        //R    G    B    T
        [1.0, 0.0, 0.0, 1.0], // BASE
        [0.0, 1.0, 0.0, 1.0], // Primera cara
        [0.0, 0.0, 1.0, 1.0], // Segunda Cara
        [1.0, 1.0, 0.0, 1.0], // Tercera Cara
        [1.0, 0.0, 1.0, 1.0], // Cuarta cara
        [0.0, 1.0, 1.0, 1.0]  // Quinta cara
    ];

    let vertexColors = [];

    //  Colores usados unicamente para colorear la base
    let baseValues = [0.99, 0.80, 0.24, 1];

    //  For utilizado para pintar la base de la pirámide
    for (let index = 0; index < 5; index++) {
        vertexColors.push(...baseValues);
    }

    //  Función utilizada para pintar las caras de la figura
    faceColors.forEach(color => {
        for (let j = 0; j < 3; j++)
            vertexColors.push(...color);
    });

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    // Aquí se van a definir los vértices para la creación de la figura.
    let pyramidIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, pyramidIndexBuffer);

    //Aquí se encuentran los indices para crear cada cara de la figura.
    let pyramidIndices = [
        0, 1, 3, 0, 1, 2, 0, 2, 4,    //Base
        5, 6, 7,                            //1er cara
        8, 9, 10,                           //2nda cara
        11, 12, 13,                         //3era cara
        14, 15, 16,                         //4ta cara
        17, 18, 19                          //5ta cara
    ];

    // gl.ELEMENT_ARRAY_BUFFER: Buffer used for element indices.
    // Uint16Array: Array of 16-bit unsigned integers.
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(pyramidIndices), gl.STATIC_DRAW);

    //  Aquí se encuentran los campos necesarios para la creación correcta de la figura
    //  verSize = tamaño de los vertices a utilizar
    //  nVerts = nColors -> cantidad total de indices a utilizar
    let pyramid = {
        buffer: vertexBuffer, colorBuffer: colorBuffer, indices: pyramidIndexBuffer,
        vertSize: 3, nVerts: 20, colorSize: 4, nColors: 20, nIndices: 24,
        primtype: gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime: Date.now()
    };

    //En esta sección se especifica el movimiento de la figura
    mat4.translate(pyramid.modelViewMatrix, pyramid.modelViewMatrix, translation);

    //  Aquí se actualizan la posición de la figura
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

//  Para crear la figura de la pirámide pentagonal, se están recibiendo tres parametros
//  la iniciación de WebGL en el canvas, las coordenadas donde se va a encontrar y
//  las coordenadas donde va a estar su eje de rotación.
function createDodecahedron(gl, translation, rotationAxis) {
    // Vertex Data
    let vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    //  En esta sección se encuentran los puntos que van a componer la figura, en este caso
    //  un dodecaedro.
    let verts = [
        //Base
        -1.3, 0.0, -0.5,    // 0
        -0.8, 0.8, -0.8,    // 1
        0.0, 0.5, -1.3,     // 2
        0.0, -0.5, -1.3,    // 3
        -0.8, -0.8, -0.8,   // 4

        //First face
        -0.8, 0.8, 0.8,     // 5
        -0.5, 1.3, 0.0,     // 6
        -0.8, 0.8, -0.8,    // 7
        -1.3, 0.0, -0.5,    // 8
        -1.3, 0.0, 0.5,     // 9

        //Second face
        0.5, 1.3, 0.0,      // 10
        0.8, 0.8, -0.8,     // 11
        0.0, 0.5, -1.3,     // 12
        -0.8, 0.8, -0.8,    // 13
        -0.5, 1.3, 0.0,     // 14

        //Third face
        1.3, 0.0, -0.5,     // 15
        0.8, -0.8, -0.8,    // 16
        0.0, -0.5, -1.3,    // 17
        0.0, 0.5, -1.3,     // 18
        0.8, 0.8, -0.8,     // 19

        //Fourth face
        0.5, -1.3, 0.0,     // 20
        -0.5, -1.3, 0.0,    // 21
        -0.8, -0.8, -0.8,   // 22
        0.0, -0.5, -1.3,    // 23
        0.8, -0.8, -0.8,    // 24

        //Fifth face
        -0.8, -0.8, 0.8,    // 25
        -1.3, 0.0, 0.5,     // 26
        -1.3, 0.0, -0.5,    // 27
        -0.8, -0.8, -0.8,   // 28
        -0.5, -1.3, 0.0,    // 29 

        //Sixth face
        0.8, 0.8, 0.8,      // 30
        1.3, 0.0, 0.5,      // 31
        1.3, 0.0, -0.5,     // 32
        0.8, 0.8, -0.8,     // 33
        0.5, 1.3, 0.0,      // 34

        //Seventh face
        0.0, 0.5, 1.3,      // 35
        0.8, 0.8, 0.8,      // 36
        0.5, 1.3, 0.0,      // 37
        -0.5, 1.3, 0.0,     // 38
        -0.8, 0.8, 0.8,     // 39

        //Eighth face
        0.8, -0.8, 0.8,     // 40
        1.3, 0.0, 0.5,      // 41
        1.3, 0.0, -0.5,     // 42
        0.8, -0.8, -0.8,    // 43
        0.5, -1.3, 0.0,     // 44

        //Nineth face
        0.0, -0.5, 1.3,         // 45
        0.8, -0.8, 0.8,         // 46
        0.5, -1.3, 0.0,         // 47
        -0.5, -1.3, 0.0,        // 48
        -0.8, -0.8, 0.8,        // 49

        //10nth face
        0.0, 0.5, 1.3,      // 50
        0.0, -0.5, 1.3,         // 51
        -0.8, -0.8, 0.8,        // 52
        -1.3, 0.0, 0.5,         // 53
        -0.8, 0.8, 0.8,         // 54

        //11nth face
        0.0, 0.5, 1.3,      // 55
        0.8, 0.8, 0.8,      // 56
        1.3, 0.0, 0.5,      // 57
        0.8, -0.8, 0.8,         // 58
        0.0, -0.5, 1.3,         // 59
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    // Color data
    let colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

    //  Aquí se encuentra el colour pallette que se utilizará para
    //  pintar la figura
    let faceColors = [
        //R    G    B    T
        [1.0, 0.0, 0.0, 1.0],           // Primera
        [0.0, 1.0, 0.0, 1.0],           // Segunda
        [0.0, 0.0, 1.0, 1.0],           // Tercera
        [1.0, 1.0, 0.0, 1.0],           // Cuarta
        [1.0, 0.0, 1.0, 1.0],           // Quinta
        [0.0, 1.0, 1.0, 1.0],           // Sexta
        [1.0, 1.0, 1.0, 1.0],           // Séptima  
        [0.0, 0.0, 0.0, 1.0],           //Octavo
        [0.4, 0.0, 0.0, 1.0],           //Novena
        [0.5691, 0.9333, 0.92, 1.0],    //Decima
        [0.749, 0.572, 0.160, 1.0],     //Onceava
        [0.670, 0.019, 0.949, 1.0]      //Doceava
    ];

    let vertexColors = [];

    //  Aquí se encuentra el colour pallette que se utilizará para
    //  pintar la figura
    faceColors.forEach(color => {
        for (let j = 0; j < 5; j++)
            vertexColors.push(...color);
    });

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    // Aquí se van a definir los vértices para la creación de la figura.
    let dodeIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, dodeIndexBuffer);

    let cubeIndices = [
        0, 1, 2, 0, 4, 3, 0, 3, 2,            // BASE
        5, 6, 7, 5, 9, 8, 5, 8, 7,            // FIRST FACE
        10, 11, 12, 10, 14, 13, 10, 13, 12,         // SECOND FACE
        15, 16, 17, 15, 19, 18, 15, 18, 17,         // THIRD FACE
        20, 21, 22, 20, 24, 23, 20, 23, 22,         // FOURTH FACE
        25, 26, 27, 25, 29, 28, 25, 28, 27,         // FIFTH FACE
        30, 31, 32, 30, 34, 33, 30, 33, 32,         // SIXTH FACE
        35, 36, 37, 35, 39, 38, 35, 38, 37,         // SEVENTH FACE 
        40, 41, 42, 40, 44, 43, 40, 43, 42,         // EIGHTH FACE
        45, 46, 47, 45, 49, 48, 45, 48, 47,         // NINETH FACE 
        50, 51, 52, 50, 54, 53, 50, 53, 52,         // TENTH FACE
        55, 56, 57, 55, 59, 58, 55, 58, 57,         // ELEVENTH FACE
    ];

    // gl.ELEMENT_ARRAY_BUFFER: Buffer used for element indices.
    // Uint16Array: Array of 16-bit unsigned integers.
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeIndices), gl.STATIC_DRAW);

    //  Aquí se encuentran los campos necesarios para la creación correcta de la figura
    //  verSize = tamaño de los vertices a utilizar
    //  nVerts = nColors -> cantidad total de indices a utilizar
    let dode = {
        buffer: vertexBuffer, colorBuffer: colorBuffer, indices: dodeIndexBuffer,
        vertSize: 3, nVerts: 60, colorSize: 4, nColors: 60, nIndices: 108,
        primtype: gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime: Date.now()
    };

    //En esta sección se especifica el movimiento de la figura
    mat4.translate(dode.modelViewMatrix, dode.modelViewMatrix, translation);

    //Aquí se actualiza la posición de la figura
    dode.update = function () {
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

    return dode;
}

//  Para crear la figura de la pirámide pentagonal, se están recibiendo tres parametros
//  la iniciación de WebGL en el canvas, las coordenadas donde se va a encontrar y
//  las coordenadas donde va a estar su eje de rotación.
function createOctahedron(gl, translation, rotationAxis) {
    // Vertex Data
    let vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    //  En esta sección se encuentran los puntos que van a componer la figura, en este caso
    //  un dodecaedro.
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

    //  Aquí se encuentra el colour pallette que se utilizará para
    //  pintar la figura
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

    let vertexColors = [];

    //  Aquí se encuentra el colour pallette que se utilizará para
    //  pintar la figura
    faceColors.forEach(color => {
        for (let j = 0; j < 3; j++)
            vertexColors.push(...color);
    });

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    // Index data (defines the triangles to be drawn).
    let diamondIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, diamondIndexBuffer);

    // Aquí se van a definir los vértices para la creación de la figura.
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

    //  Aquí se encuentran los campos necesarios para la creación correcta de la figura
    //  verSize = tamaño de los vertices a utilizar
    //  nVerts = nColors -> cantidad total de indices a utilizar
    let rupee = {
        buffer: vertexBuffer, colorBuffer: colorBuffer, indices: diamondIndexBuffer,
        vertSize: 3, nVerts: 24, colorSize: 4, nColors: 24, nIndices: 24,
        primtype: gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime: Date.now()
    };

    //En esta sección se especifica el movimiento de la figura
    mat4.translate(rupee.modelViewMatrix, rupee.modelViewMatrix, translation);

    //Valores que indican cuando el octaedro toca la parte superior o la inferior del canvas
    let bounceTop = true;
    let bounceBot = false;

    //Aquí se actualiza la posición de la figura
    rupee.update = function () {
        let now = Date.now();
        let deltat = now - this.currentTime;
        this.currentTime = now;
        let fract = deltat / duration;
        let angle = Math.PI * 2 * fract;

        //Lo que cambia de esta función es la actualización del octaedro.
        //En otras palabras, cuando el octaedro toque el techo el valor se va a actualizar a false junto el valor de su posición para indicar que tiene que descender.
        if (bounceTop == true) {
            mat4.translate(rupee.modelViewMatrix, rupee.modelViewMatrix, [0, -.025, 0]);
            if (this.modelViewMatrix[13] < -2.89) {
                bounceBot = true;
                bounceTop = false;
            }
        }

        //Lo que cambia de esta función es la actualización del octaedro.
        //En otras palabras, cuando el octaedro toque el piso, el valor se va a actualizar a false junto el valor de su posición para indicar que tiene que ascender.
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