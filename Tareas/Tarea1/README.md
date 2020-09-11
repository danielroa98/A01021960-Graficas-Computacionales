# Documentación Primer Tarea
## Daniel Roa  -   A01021960

![Imagen demostrando su funcionamiento](\imgs\figuras.jpg)

La documentación está siendo dividida en dos secciones:

* HTML
* JavaScript

Para la sección de JavaScript, solamente se va a mencionar como se compuso la figura y en que secciones se puede notar.

### HTML
El HTML está compuesto por sus secciones básicas, contiene el header, body, canvas, etc..., lo interesante de este se encuentra en las siguiente lineas de código:

    <script src="../../libraries/libs/gl-matrix/gl-matrix.js"></script>
    <script src="../../libraries/libs/jquery-3.4.1/jquery-3.4.1.min.js"></script>
    <script src=tarea1.js></script>
    ...
    <script type="text/javascript">

        $(document).ready(
                function () {
                    let canvas = document.getElementById("webglcanvas");
                    let gl = initWebGL(canvas);
                    initViewport(gl, canvas);
                    initGL(canvas);

                    let pyramid = createPyramid(gl, [-5, 0, -5], [0.1, 1.0, 0.2]);     //  Pyramid
                    let die = createDodecahedron(gl, [0, 0, -5], [-0.4, 1.0, 0.1]);    //  Dodecahedron
                    let rupee = createOctahedron(gl, [5, 0 , -5], [0, 1, 0]);          //  Octahedron

                    initShader(gl);

                    run(gl, [pyramid, rupee, die]);
                }
            );
    </script>
    ...
    <canvas id="webglcanvas" style="border: none;" width="1500px" height="700px"></canvas>

Es lo _interesante_ del HTML debido a que se pueden apreciar las librerías que se están utilizando para poder mandar a llamar las librerías utilizadas para permitir que las figuras se desplieguen al correr un servidor con el HTML corriendo.

Dentro de esto, se puede apreciar la sección que aloja código de JavaScript...
    
    ...
    <script type="text/javascript">

        $(document).ready(
                function () {
                    let canvas = document.getElementById("webglcanvas");
                    let gl = initWebGL(canvas);
                    initViewport(gl, canvas);
                    initGL(canvas);

                    let pyramid = createPyramid(gl, [-5, 0, -5], [0.1, 1.0, 0.2]);     //  Pyramid
                    let die = createDodecahedron(gl, [0, 0, -5], [-0.4, 1.0, 0.1]);    //  Dodecahedron
                    let rupee = createOctahedron(gl, [5, 0 , -5], [0, 1, 0]);          //  Octahedron

                    initShader(gl);

                    run(gl, [pyramid, rupee, die]);
                }
            );
    </script>
    ...

Aquí se pueden apreciar las coordenadas en las que se despliega la figura, esos están en el primer set de coordenadas. 

En el segundo set es el eje donde la figura va a estar rotando.

    <canvas id="webglcanvas" style="border: none;" width="1500px" height="700px"></canvas>

En está sección del HTML es donde se especifican los datos para poder crear el canvas donde se van a alojar las figuras creadas.

### JavaScript
Para poder exportar una figura al HTML para que sea visible, se tienen que declarar funciones de la librería de WebGL para poder especificar que se van a utilizar esos parámetros en específico.

Al momento de inicializar el método de una de las figuras, se está recibiendo el _canvas_ (el cuál es la posición donde van a aparecer las figuras), la ubicación de la _traslación_ (es donde se va a encontrar la figura en el canvas) y los ejes donde va a estar llevando a cabo una _rotación_.

Aunque todos tengan el mismo contenido para su creación, es importante recalcar que va a haber diferencias prevalentes como:

* La cantidad de vértices
* La cantidad de colores que se van a utilizar
* La manera en la que los índices están ordenados
* Y, como es en el caso del octaedro, como se va a estar actualizando su posición en el canvas.
