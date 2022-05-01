
var total_distance = 5000;
var lines = 5;
var line_width = total_distance / lines;
var lanes = [];
var lights;
var speed_limits;

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
    this.next_limit = speed_limits[1];

    // associate this class with a jquery el
    var el = $('#car').clone();
    el.attr('id', '');
    el.appendTo('#canvas');
    this.el = el;
  };

  tick = function(idx) {
    // see if we passed a light or in a new speed limit
    this._compute_nexts()

    // increase speed up to the limit
    var limit = this.speed_limit.speed_limit;
    if (this.speed > limit) {
      this.speed = Math.max(limit, this.speed - this.brake);
    } else {
      this.speed = Math.min(limit, this.speed + this.gas);
    }

    // don't run into cars ahead of you

    // slow down if the light ahead is red

    // slow down if near your destination

    // update distance based on speed
    this.distance += mph_to_fps(this.speed)
  }

  _compute_nexts() {
    if (this.next_limit && this.distance > this.next_limit.distance) {
      this.speed_limit_idx++;
      this.speed_limit = this.next_limit;
      this.next_limit = speed_limits[next_idx]
      var next_idx = this.speed_limit_idx+1
      if (next_idx >= speed_limits.length) {
        this.next_limit = null
      } else {
        this.next_limit = speed_limits[next_idx]
        console.log("new limit!")
      }
    }

    if (this.next_light && this.distance > this.next_light.distance) {
      this.traffic_light_idx++;
      if (this.traffic_light_idx >= lights.length) {
        this.next_light = null
      } else {
        this.next_light = lights[this.traffic_light_idx]
        console.log("new light!")
      }
    }
  }

}

function car(speed) {
  speed = speed || 70;
  return new Car(speed, 1, 2);
}

class StopLight {
  constructor(distance, green, red) {
    this.distance = distance;
    this.green_duration = green;
    this.red_duration = red;

    // associate this class with a jquery el
    var el = $('#light').clone();
    el.attr('id', '');
    el.appendTo('#canvas');
    this.el = el;
  }
}

function light(d) {
  return new StopLight(d, 30, 30);
}

class SpeedLimit {
  constructor(distance, speed_limit) {
    this.distance = distance;
    this.speed_limit = speed_limit;

    // associate this class with a jquery el
    var el = $('#speedlimit').clone();
    el.attr('id', '');
    el.html(this.speed_limit);
    el.appendTo('#canvas');
    this.el = el;

  }
}

function speed_limit(d, limit) {
  return new SpeedLimit(d, limit);
}


function tick() {
  _.each(lanes, function(car, idx) {
    // calculate the new speed and distance for each car
    car.tick(idx);
    plot(car);
  });

  // remove all cars that have finished.
  lanes = _.filter(lanes, function(car) { return (car.distance < total_distance); });

  if (!lanes.length) {
    stop();
  }

  ticks++;
  //console.log('tick=' + ticks);
}

var ticks = 0;
var interval_id = null;

function add_car() {
  var c = car(10);
  lanes.push(c);
  plot(c);
  return c;
}

var initialized = false;

function init() {
  if (initialized) return;

  lights = [
    light(100),
    light(1000),
    light(2000),
  ];

  speed_limits = [
    speed_limit(0, 70),
    speed_limit(400, 50),
    speed_limit(1100, 35),
    speed_limit(2500, 40),
    speed_limit(3000, 55),
  ];

  _.each(lights.concat(speed_limits), function(i) { plot(i)});
}

function start() {
  init();
  add_car();
  interval_id = setInterval(tick, 500)
}

function stop() {
  clearInterval(interval_id);
  console.log("Stopped!");
}


function plot(item) {
  var x = (item.distance % line_width) / line_width; // 0 - 1
  var line = Math.floor(item.distance / line_width); // 0 - 5
  var y = line / lines; // 0 - 1
  if (line % 2) { x = 1 - x; }
  item.el.css('left', x * 100  + '%');
  item.el.css('top', (y * 100 + 10) + '%');
}












