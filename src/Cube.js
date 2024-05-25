class Cube {
    constructor() {
        this.type = 'cube';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.normalMatrix = new Matrix4();
        this.realTextureNum = -1;
        this.textureNum = -1;
        this.cubeVerts = new Float32Array([
            // Front of cube
            0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0,
            0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0,

            // Top of cube
            0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0,
            0.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.0,

            // Back of cube
            1.0, 1.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0,
            1.0, 1.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0,

            // // Bottom of cube
            1.0, 0.0, 1.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0,
            1.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0,

            // // Left of cube
            0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0,
            0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0,

            // // Right of cube
            1.0, 1.0, 1.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0,
            1.0, 1.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 0.0,
        ]);
        this.cubeUVs = new Float32Array([
            // Front of cube
            0.0, 0.0, 1.0, 1.0, 1.0, 0.0,
            0.0, 0.0, 0.0, 1.0, 1.0, 1.0,

            // Top of cube
            0.0, 0.0, 0.0, 1.0, 1.0, 1.0,
            0.0, 0.0, 1.0, 1.0, 1.0, 0.0,

            // Back of cube
            0.0, 1.0, 1.0, 0.0, 1.0, 1.0,
            0.0, 1.0, 0.0, 0.0, 1.0, 0.0,

            // // Bottom of cube
            1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
            1.0, 0.0, 0.0, 1.0, 0.0, 0.0,

            // // Left of cube
            1.0, 0.0, 0.0, 0.0, 0.0, 1.0,
            1.0, 0.0, 1.0, 1.0, 0.0, 1.0,

            // // Right of cube
            1.0, 1.0, 0.0, 1.0, 0.0, 0.0,
            1.0, 1.0, 1.0, 0.0, 0.0, 0.0,
        ]);
    }

    // slow old version of render
    oldRender() {
        var rgba = this.color;

        gl.uniform1i(u_whichTexture, this.textureNum);

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // Front of cube
        drawTriangle3DUV([0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0], [0.0, 0.0, 1.0, 1.0, 1.0, 0.0]);
        drawTriangle3DUV([0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0], [0.0, 0.0, 0.0, 1.0, 1.0, 1.0]);

        gl.uniform4f(u_FragColor, rgba[0] * 0.9, rgba[1] * 0.9, rgba[2] * 0.9, rgba[3]);

        // Top of cube
        drawTriangle3DUV([0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0], [0.0, 0.0, 0.0, 1.0, 1.0, 1.0]);
        drawTriangle3DUV([0.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.0], [0.0, 0.0, 1.0, 1.0, 1.0, 0.0]);

        gl.uniform4f(u_FragColor, rgba[0] * 0.8, rgba[1] * 0.8, rgba[2] * 0.8, rgba[3]);

        // Back of cube
        drawTriangle3DUV([1.0, 1.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0], [0.0, 1.0, 1.0, 0.0, 1.0, 1.0]);
        drawTriangle3DUV([1.0, 1.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0], [0.0, 1.0, 0.0, 0.0, 1.0, 0.0]);

        gl.uniform4f(u_FragColor, rgba[0] * 0.7, rgba[1] * 0.7, rgba[2] * 0.7, rgba[3]);

        // // Bottom of cube
        drawTriangle3DUV([1.0, 0.0, 1.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0], [1.0, 0.0, 1.0, 1.0, 0.0, 1.0]);
        drawTriangle3DUV([1.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0], [1.0, 0.0, 0.0, 1.0, 0.0, 0.0]);

        // // Left of cube
        drawTriangle3DUV([0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0], [1.0, 0.0, 0.0, 0.0, 0.0, 1.0]);
        drawTriangle3DUV([0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0], [1.0, 0.0, 1.0, 1.0, 0.0, 1.0]);

        gl.uniform4f(u_FragColor, rgba[0] * 0.6, rgba[1] * 0.6, rgba[2] * 0.6, rgba[3]);

        // // Right of cube
        drawTriangle3DUV([1.0, 1.0, 1.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0], [1.0, 1.0, 0.0, 1.0, 0.0, 0.0]);
        drawTriangle3DUV([1.0, 1.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 0.0], [1.0, 1.0, 1.0, 0.0, 0.0, 0.0]);
    }

    render() {
        var rgba = this.color;

        gl.uniform1i(u_whichTexture, this.textureNum);

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        gl.uniformMatrix4fv(u_NormalMatrix, false, this.normalMatrix.elements);

        // Front of cube
        drawTriangle3DUVNormal(
            [0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0],
            [0.0, 0.0, 1.0, 1.0, 1.0, 0.0],
            [0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0]);
        drawTriangle3DUVNormal(
            [0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0],
            [0.0, 0.0, 0.0, 1.0, 1.0, 1.0],
            [0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0]);

        // gl.uniform4f(u_FragColor, rgba[0] * 0.9, rgba[1] * 0.9, rgba[2] * 0.9, rgba[3]);

        // Top of cube
        drawTriangle3DUVNormal(
            [0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0],
            [0.0, 0.0, 0.0, 1.0, 1.0, 1.0],
            [0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0]);
        drawTriangle3DUVNormal(
            [0.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.0],
            [0.0, 0.0, 1.0, 1.0, 1.0, 0.0],
            [0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0]);

        // gl.uniform4f(u_FragColor, rgba[0] * 0.8, rgba[1] * 0.8, rgba[2] * 0.8, rgba[3]);

        // Back of cube
        drawTriangle3DUVNormal(
            [1.0, 1.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0],
            [0.0, 1.0, 1.0, 0.0, 1.0, 1.0],
            [0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0]);
        drawTriangle3DUVNormal(
            [1.0, 1.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0],
            [0.0, 1.0, 0.0, 0.0, 1.0, 0.0],
            [0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0]);

        // gl.uniform4f(u_FragColor, rgba[0] * 0.7, rgba[1] * 0.7, rgba[2] * 0.7, rgba[3]);

        // Bottom of cube
        drawTriangle3DUVNormal(
            [1.0, 0.0, 1.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0],
            [1.0, 0.0, 1.0, 1.0, 0.0, 1.0],
            [0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0]);
        drawTriangle3DUVNormal(
            [1.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0],
            [1.0, 0.0, 0.0, 1.0, 0.0, 0.0],
            [0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0]);

        // Left of cube
        drawTriangle3DUVNormal(
            [0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0],
            [1.0, 0.0, 0.0, 0.0, 0.0, 1.0],
            [-1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0]);
        drawTriangle3DUVNormal(
            [0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0],
            [1.0, 0.0, 1.0, 1.0, 0.0, 1.0],
            [-1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0]);

        // gl.uniform4f(u_FragColor, rgba[0] * 0.6, rgba[1] * 0.6, rgba[2] * 0.6, rgba[3]);

        // Right of cube
        drawTriangle3DUVNormal(
            [1.0, 1.0, 1.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0],
            [1.0, 1.0, 0.0, 1.0, 0.0, 0.0],
            [1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0]);
        drawTriangle3DUVNormal(
            [1.0, 1.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 0.0],
            [1.0, 1.0, 1.0, 0.0, 0.0, 0.0],
            [1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0]);
    }

    renderFast() {
        let rgba = this.color;

        gl.uniform1i(u_whichTexture, this.textureNum);

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        if (g_vertexBuffer == null) {
            g_vertexBuffer = gl.createBuffer();
            if (!g_vertexBuffer) {
                console.log("Failed to create buffer object");
                return -1;
            }
            gl.bindBuffer(gl.ARRAY_BUFFER, g_vertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, this.cubeVerts, gl.DYNAMIC_DRAW);
            gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(a_Position);
        }

        if (g_uvBuffer == null) {
            g_uvBuffer = gl.createBuffer();
            if (!g_uvBuffer) {
                console.log("Failed to create buffer object");
                return -1;
            }
            gl.bindBuffer(gl.ARRAY_BUFFER, g_uvBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, this.cubeUVs, gl.DYNAMIC_DRAW);
            gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(a_UV);
        }

        drawTriangle3DUV(this.cubeVerts, this.cubeUVs);
    }
}

let g_vertexBuffer = null;
let g_uvBuffer = null
