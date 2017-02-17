var canvas, gpu;
var shader_src;
var library, vertexFunction, fragmentFunction;
var pipelineDescriptor, pipelineState;
var vertexData, vertexBuffer;
var drawable, passDescriptor;

window.onload = function () {
  canvas = document.getElementById("mycanvas");
  gpu = canvas.getContext("webgpu");
  shader_src = document.getElementById("library").text;

  library = gpu.createLibrary(shader_src);
  vertexFunction = library.functionWithName("vertex_main");
  fragmentFunction = library.functionWithName("fragment_main");

  pipelineDescriptor = new WebGPURenderPipelineDescriptor();
  pipelineDescriptor.vertexFunction = vertexFunction;
  pipelineDescriptor.fragmentFunction = fragmentFunction;
  // Source/WebCore/html/canvas/WebGPURenderingContext.idl const unsigned int PixelFormatBGRA8Unorm = 80;
  pipelineDescriptor.colorAttachments[0].pixelFormat = 80;
  pipelineState = gpu.createRenderPipelineState(pipelineDescriptor);


  vertexData = new Float32Array([
    // x y z 1 r g b 1
    0, 0.75, 0, 1, 1, 0, 0, 1,
    -0.75, -0.75, 0, 1, 0, 1, 0, 1,
    0.75, -0.75, 0, 1, 0, 0, 1, 1
  ]);
  vertexBuffer = gpu.createBuffer(vertexData);

  drawable = gpu.nextDrawable();

  passDescriptor = new WebGPURenderPassDescriptor();
  passDescriptor.colorAttachments[0].loadAction = 2;//LoadActionClear
  passDescriptor.colorAttachments[0].storeAction = 1;//StoreActionStore
  passDescriptor.colorAttachments[0].clearColor = [0.2, 0.8, 0.8, 1.0];
  passDescriptor.colorAttachments[0].texture = drawable.texture;

  let commandQueue = gpu.createCommandQueue();
  let commandBuffer = commandQueue.createCommandBuffer();

  // Use the descriptor we created above.
  let commandEncoder = commandBuffer.createRenderCommandEncoderWithDescriptor(
    passDescriptor);

  // Tell the encoder which state to use (i.e. shaders).
  commandEncoder.setRenderPipelineState(pipelineState);

  // And, lastly, the encoder needs to know which buffer
  // to use for the geometry.
  commandEncoder.setVertexBuffer(vertexBuffer, 0, 0);

  // We know our buffer has three vertices. We want to draw them
  // with filled triangles.
  // first 3: PrimitiveTypeTriangle
  commandEncoder.drawPrimitives(3, 0, 3);
  commandEncoder.endEncoding();

  // All drawing commands have been submitted. Tell WebGPU to
  // show/present the results in the canvas once the queue has
  // been processed.
  commandBuffer.presentDrawable(drawable);
  commandBuffer.commit();

}
