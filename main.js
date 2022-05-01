
var total_distance = 5000;
var lines = 5;
var line_width = total_distance / lines;

var lanes = [];

function mph_to_fps(mph) {
  return (5280 * mph) / 3600;
}

class Car {
  constructor(speed, gas, brake) {
    this.distance = 0;
    this.speed = speed;
    this.length = 20;
    this.gas = gas;
    this.brake = brake;
    this.speed_limit_idx = 0;
    this.traffic_light_idx = 0;
    this.speed_limit = speed_limits[0];
    this.next_light = lights[0]

    // associate this class with a jquery el
    var el = $('#car').clone();
    el.attr('id', '');
    el.appendTo('#canvas');
    this.el = el;
  };

  tick = function(idx) {
    // increase speed up to the limit

    // don't run into cars ahead of you

    // slow down if the light ahead is red

    // slow down if near your destination

    // update distance based on speed
    this.distance += mph_to_fps(this.speed)
  }

  plot = function() {
    var car = this;
    var x = (car.distance % line_width) / line_width;
    var y = Math.floor(car.distance / line_width) / lines;
    car.el.css('top', y * 100 + '%');
    car.el.css('left', x * 100 + '%');
    //console.log("x=" + x + " y=" + y + ' speed=' + this.speed);
  }
}

function car() {
  return new Car(70, 1, 2);
}

class StopLight {
  constructor(distance, green, red) {
    this.distance = distance;
    this.green_duration = green;
    this.red_duration = red;
  }
}

function light(d) {
  return new StopLight(d, 30, 30);
}

class SpeedLimit {
  constructor(distance, speed_limit) {
    this.distance = distance;
    this.speed_limit = speed_limit;
  }
}

function speed_limit(d, limit) {
  return new SpeedLimit(d, limit);
}

var lights = [
  light(100),
  light(1000),
  light(2000),
];

var speed_limits = [
  speed_limit(0, 70),
  speed_limit(400, 50),
  speed_limit(1100, 35),
  speed_limit(2500, 40),
  speed_limit(3000, 55),
];

function tick() {
  _.each(lanes, function(car, idx) {
    // calculate the new speed and distance for each car
    car.tick(idx);
    car.plot();

    // car is finished so remove from the lane
    if (car.distance > total_distance) {
      lanes.pop(car);
      console.log("Car finished");
    }

    if (!lanes.length) {
      stop();
    }
  })

  ticks++;
  //console.log('tick=' + ticks);
}

var ticks = 0;
var interval_id = null;

function add_car() {
  lanes.push(car());
}

function start() {
  add_car()
  interval_id = setInterval(tick, 100)
}

function stop() {
  clearInterval(interval_id);
}















