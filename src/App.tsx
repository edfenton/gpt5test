import { useRef, useEffect, useState } from "react";
import * as Matter from "matter-js";
import "./App.css";

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [spinDirection, setSpinDirection] = useState<
    "clockwise" | "counterclockwise"
  >("clockwise");
  const [spinSpeed, setSpinSpeed] = useState(0.02);
  const [gravityStrength, setGravityStrength] = useState(1.0);
  const [ballBounciness, setBallBounciness] = useState(0.8);
  const [wallFriction, setWallFriction] = useState(0.1);
  const [ballSize, setBallSize] = useState(20);
  const [polygonSides, setPolygonSides] = useState(4);
  const [polygonSize, setPolygonSize] = useState(200);
  const [showDebug, setShowDebug] = useState(false);

  // Calculate minimum polygon size based on ball size
  const minPolygonSize = Math.max(100, ballSize * 6); // At least 6x ball diameter

  // FPS tracking
  const [fps, setFps] = useState(0);
  const [frameTime, setFrameTime] = useState(0);
  const fpsRef = useRef({ lastTime: 0, frameCount: 0 });

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "d") {
        setShowDebug((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const engine = Matter.Engine.create();
    const world = engine.world;
    world.gravity.y = 0.5 * gravityStrength;

    const ball = Matter.Bodies.circle(0, 0, ballSize, {
      restitution: ballBounciness,
      friction: 0.1,
      density: 0.001,
    });

    const containerSize = polygonSize;
    const wallThickness = Math.max(25, containerSize * 0.15); // Increased minimum and percentage for better containment

    // Function to create polygon walls based on number of sides
    const createPolygonWalls = (sides: number) => {
      const walls = [];
      const radius = containerSize / 2;

      for (let i = 0; i < sides; i++) {
        const angle1 = (i * 2 * Math.PI) / sides;
        const angle2 = ((i + 1) * 2 * Math.PI) / sides;

        const x1 = radius * Math.cos(angle1);
        const y1 = radius * Math.sin(angle1);
        const x2 = radius * Math.cos(angle2);
        const y2 = radius * Math.sin(angle2);

        // Calculate wall center and dimensions
        const wallCenterX = (x1 + x2) / 2;
        const wallCenterY = (y1 + y2) / 2;
        const wallLength = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        const wallAngle = Math.atan2(y2 - y1, x2 - x1);

        const wall = Matter.Bodies.rectangle(
          wallCenterX,
          wallCenterY,
          wallLength,
          wallThickness,
          {
            isStatic: true,
            friction: wallFriction,
            angle: wallAngle,
          }
        );
        walls.push(wall);
      }

      return walls;
    };

    // Create a single compound body for the container at the center
    const container = Matter.Body.create({
      parts: createPolygonWalls(polygonSides),
      isStatic: true,
    });

    // Position the ball inside the container
    Matter.Body.setPosition(ball, { x: 0, y: -50 });

    Matter.World.add(world, [ball, container]);

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    Matter.Runner.run(Matter.Runner.create(), engine);

    // Rotation variables
    let rotationAngle = 0;
    const rotationSpeed = spinSpeed;

    const draw = () => {
      // FPS tracking
      const currentTime = performance.now();
      fpsRef.current.frameCount++;

      if (currentTime - fpsRef.current.lastTime >= 1000) {
        setFps(fpsRef.current.frameCount);
        setFrameTime(1000 / fpsRef.current.frameCount);
        fpsRef.current.frameCount = 0;
        fpsRef.current.lastTime = currentTime;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Fill white background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      const direction = spinDirection === "clockwise" ? 1 : -1;
      rotationAngle += rotationSpeed * direction;

      // Rotate the entire container
      Matter.Body.setAngle(container, rotationAngle);

      // Update ball position to account for container movement
      const ballWorldPos = {
        x: ball.position.x + centerX,
        y: ball.position.y + centerY,
      };

      // Draw the container outline
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotationAngle);
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 8;

      // Draw polygon outline
      ctx.beginPath();
      const radius = containerSize / 2;
      for (let i = 0; i <= polygonSides; i++) {
        const angle = (i * 2 * Math.PI) / polygonSides;
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.stroke();

      ctx.restore();

      // Draw the ball at its physics position, adjusted for canvas center
      ctx.fillStyle = "#ff4444";
      ctx.beginPath();
      ctx.arc(ballWorldPos.x, ballWorldPos.y, ballSize, 0, 2 * Math.PI);
      ctx.fill();

      // Draw ball
      ctx.fillStyle = "#ff0000";
      ctx.beginPath();
      ctx.arc(
        ball.position.x + centerX,
        ball.position.y + centerY,
        ballSize,
        0,
        2 * Math.PI
      );
      ctx.fill();

      // Debug overlay
      if (showDebug) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(10, 10, 150, 80);
        ctx.fillStyle = "#ffffff";
        ctx.font = "14px monospace";
        ctx.fillText(`FPS: ${fps}`, 20, 30);
        ctx.fillText(`Frame: ${frameTime.toFixed(1)}ms`, 20, 50);
        ctx.fillText(
          `Ball: ${Math.round(ball.position.x)}, ${Math.round(
            ball.position.y
          )}`,
          20,
          70
        );
      }

      requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      Matter.Runner.stop(Matter.Runner.create());
    };
  }, [
    spinDirection,
    spinSpeed,
    gravityStrength,
    ballBounciness,
    wallFriction,
    ballSize,
    polygonSides,
    polygonSize,
    showDebug,
  ]);

  return (
    <div className="app">
      <div className="canvas-container">
        <canvas ref={canvasRef} />
      </div>
      <div className="control-panel">
        <h3>Controls</h3>
        <div className="control-group">
          <button
            onClick={() => {
              setSpinDirection("clockwise");
              setSpinSpeed(0.02);
              setGravityStrength(1.0);
              setBallBounciness(0.8);
              setWallFriction(0.1);
              setBallSize(20);
              setPolygonSides(4);
              setPolygonSize(200);
            }}
            style={{
              width: "100%",
              padding: "8px",
              marginBottom: "15px",
              backgroundColor: "#007bff",
              color: "#ffffff",
              border: "1px solid #0056b3",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Reset to Defaults
          </button>
        </div>
        <div className="control-group">
          <label>Spin Direction:</label>
          <select
            value={spinDirection}
            onChange={(e) =>
              setSpinDirection(
                e.target.value as "clockwise" | "counterclockwise"
              )
            }
          >
            <option value="clockwise">Clockwise</option>
            <option value="counterclockwise">Counter-clockwise</option>
          </select>
        </div>
        <div className="control-group">
          <label>Spin Speed: {spinSpeed.toFixed(3)}</label>
          <input
            type="range"
            min="0.001"
            max="0.1"
            step="0.001"
            value={spinSpeed}
            onChange={(e) => setSpinSpeed(parseFloat(e.target.value))}
            style={{ width: "100%" }}
          />
        </div>
        <div className="control-group">
          <label>Gravity Strength: {gravityStrength.toFixed(1)}</label>
          <input
            type="range"
            min="0.1"
            max="2.0"
            step="0.1"
            value={gravityStrength}
            onChange={(e) => setGravityStrength(parseFloat(e.target.value))}
            style={{ width: "100%" }}
          />
        </div>
        <div className="control-group">
          <label>Ball Bounciness: {ballBounciness.toFixed(2)}</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={ballBounciness}
            onChange={(e) => setBallBounciness(parseFloat(e.target.value))}
            style={{ width: "100%" }}
          />
        </div>
        <div className="control-group">
          <label>Wall Friction: {wallFriction.toFixed(2)}</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={wallFriction}
            onChange={(e) => setWallFriction(parseFloat(e.target.value))}
            style={{ width: "100%" }}
          />
        </div>
        <div className="control-group">
          <label>Ball Size: {ballSize}px</label>
          <input
            type="range"
            min="5"
            max="50"
            step="1"
            value={ballSize}
            onChange={(e) => setBallSize(parseInt(e.target.value))}
            style={{ width: "100%" }}
          />
        </div>
        <div className="control-group">
          <label>Polygon Sides: {polygonSides}</label>
          <input
            type="range"
            min="3"
            max="10"
            step="1"
            value={polygonSides}
            onChange={(e) => setPolygonSides(parseInt(e.target.value))}
            style={{ width: "100%" }}
          />
        </div>
        <div className="control-group">
          <label>Polygon Size: {polygonSize}px</label>
          <input
            type="range"
            min={minPolygonSize}
            max="500"
            step="10"
            value={polygonSize}
            onChange={(e) => setPolygonSize(parseInt(e.target.value))}
            style={{ width: "100%" }}
          />
        </div>
        <div className="control-group">
          <label>Show Debug:</label>
          <input
            type="checkbox"
            checked={showDebug}
            onChange={(e) => setShowDebug(e.target.checked)}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
