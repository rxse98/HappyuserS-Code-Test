import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';

import { World, System, Component, TagComponent, Types } from 'ecsy';

const NUM_ELEMENTS = 40;
const SPEED_MULTIPLIER = 0.1;
const SHAPE_SIZE = 10;
const SHAPE_HALF_SIZE = SHAPE_SIZE / 2;

let randtimer;

var shapes = [];

// Initialize canvas
let canvas = document.createElement("canvas");

let canvasWidth = canvas.width = window.innerWidth;
let canvasHeight = canvas.height = window.innerHeight;
let ctx = canvas.getContext("2d");

window.addEventListener( 'resize', () => {
  canvasWidth = canvas.width = window.innerWidth
  canvasHeight = canvas.height = window.innerHeight;
}, false );

document.body.appendChild(canvas);


//----------------------
// Components
//----------------------

// Velocity component
class Velocity extends Component {}

Velocity.schema = {
  x: { type: Types.Number },
  y: { type: Types.Number }
};

// Position component
class Position extends Component {}

Position.schema = {
  x: { type: Types.Number },
  y: { type: Types.Number }
};

// Shape component
class Shape extends Component {}

Shape.schema = {
  primitive: { type: Types.String, default: 'box' }
};


// Renderable component
class Renderable extends TagComponent {}

//----------------------
// Systems
//----------------------

// MovableSystem
class MovableSystem extends System {
  // This method will get called on every frame by default
  execute(delta, time) {
    // Iterate through all the entities on the query
    this.queries.moving.results.forEach(entity => {
      var velocity = entity.getComponent(Velocity);
      var position = entity.getMutableComponent(Position);

      position.x += velocity.x * delta;
      position.y += velocity.y * delta;

      
      
      if (position.x > canvasWidth + SHAPE_HALF_SIZE) position.x = - SHAPE_HALF_SIZE;
      if (position.x < - SHAPE_HALF_SIZE) position.x = canvasWidth + SHAPE_HALF_SIZE;
      if (position.y > canvasHeight + SHAPE_HALF_SIZE) position.y = - SHAPE_HALF_SIZE;
      if (position.y < - SHAPE_HALF_SIZE) position.y = canvasHeight + SHAPE_HALF_SIZE;

      

    });
  }
}



// Define a query of entities that have "Velocity" and "Position" components
MovableSystem.queries = {
  moving: {
    components: [Velocity, Position]
  }
}

// RendererSystem
class RendererSystem extends System {
  // This method will get called on every frame by default
  
  execute(delta, time) {
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // shapes = this.queries.renderables.results;

    //ctx.globalAlpha = 0.6;


    // Iterate through all the entities on the query
    this.queries.renderables.results.forEach(entity => {

        var shape = entity.getComponent(Shape);
        var position = entity.getComponent(Position);




        if (shape.primitive === 'box') {
          
          this.drawBox(position);

        } else {
          this.drawCircle(position);
          
        }

        shapes = this.queries.renderables.results;
    });
    
  }


  
  drawCircle(position) {
    ctx.fillStyle = "#888";
    ctx.beginPath();
    ctx.arc(position.x, position.y, SHAPE_HALF_SIZE, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#222";
    ctx.stroke();
  }
  
  drawBox(position) {
   ctx.beginPath();
    ctx.rect(position.x - SHAPE_HALF_SIZE, position.y - SHAPE_HALF_SIZE, SHAPE_SIZE, SHAPE_SIZE);
    ctx.fillStyle= "#f28d89";
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#800904";
    ctx.stroke();
  }
}

function timeOut() {
  shapes.splice(0, NUM_ELEMENTS);
}

// Define a query of entities that have "Renderable" and "Shape" components
RendererSystem.queries = {
  renderables: { components: [Renderable, Shape] }
}

// Create world and register the systems on it
var world = new World();
world
  .registerSystem(MovableSystem)
  .registerSystem(RendererSystem)
  .registerComponent(Renderable)
  .registerComponent(Shape)
  .registerComponent(Velocity)
  .registerComponent(Position);

// Some helper functions when creating the components
function getRandomVelocity() {
  return {
    x: SPEED_MULTIPLIER * (2 * Math.random() - 1), 
    y: SPEED_MULTIPLIER * (2 * Math.random() - 1)
  };
}


function getRandomShape() {
   return {
     primitive: Math.random() >= 0.5 ? 'circle' : 'box'
   };
}


var mx, my;

document.addEventListener("click", function(e) {

  mx = e.clientX;
  my = e.clientY;



  for (let i = 0; i < NUM_ELEMENTS; i++) {
      world
        .createEntity()
        .addComponent(Velocity, getRandomVelocity())
        .addComponent(Shape, getRandomShape())
        .addComponent(Position, {x: mx, y: my})
        .addComponent(Renderable)
  }

  
  randtimer = Math.floor(Math.random() * (5000 - 1000 + 1)) + 1000;
  setTimeout(timeOut, randtimer);

});

      
// Run!
function run() {
  // Compute delta and elapsed time
  var time = performance.now();
  var delta = time - lastTime;

  // Run all the systems
  world.execute(delta, time);

  lastTime = time;
  requestAnimationFrame(run);
}

var lastTime = performance.now();
run();

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
