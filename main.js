
var total_distance = 4000;
var lines = 5;
var line_width = total_distance / lines;
var lane = [];
var lights;
var destinations;
var speed_limits;

TRAFFIC = 0.2;

function mph_to_fps(mph) {
  return (5280 * mph) / 3600;
}

class Car {
  constructor(speed, gas, brake) {
    this.distance = 0;
    this.start_tick = ticks;
    this.speed = speed;
    this.length = 20;
    this.gas = gas;
    this.brake = brake;
    this.speed_limit_idx = 0;
    this.traffic_light_idx = 0;
    this.speed_limit = speed_limits[0];
    this.next_light = lights[0]
    this.next_limit = speed_limits[1];
    this.text = '';
    this.destination = null;

    // associate this class with a jquery el
    var el = $('#car').clone();
    el.attr('id', '');
    el.appendTo('#canvas');
    this.el = el;
    this.text_el = el.children();

    // Give each car some random destination
    var bucket = Math.random()
    for (var i=0; i<destinations.length; i++) {
      if (bucket < destinations[i].weight) {
        this.destination = destinations[i];
        this.el.css('background-color', this.destination.color);
        break;
      }
    }
  };

  tick = function(idx) {
    // see if we passed a light or in a new speed limit
    this._compute_nexts()
    var text = ''
    var distance_to_light = '';
    var brake_pressure = '';

    var ticks_to_break = this.speed / this.brake;
    var break_distance = mph_to_fps(this.speed / 2) * ticks_to_break;
    var near_red_light = (
      this.next_light && this.next_light.is_red() &&
      break_distance + this.distance + 10 > this.next_light.distance
    )

    var next_car = lane[idx - 1];
    var near_car = false;
    var near_dest = false;
    var distance_to_car;
    var distance_to_dest
    var safe_distance;

    if (this.destination) {
      distance_to_dest = this.destination.distance - this.distance;
      near_dest = break_distance > distance_to_dest;
    }

    if (next_car) {
      distance_to_car = next_car.distance - this.distance - next_car.length - 10;
      safe_distance = 2 * mph_to_fps(next_car.speed) + 5;
      near_car = safe_distance > distance_to_car || break_distance + 10 > distance_to_car;
    }

    if (near_dest) {
      var entry_speed = this.destination.entry_speed;
      var speed_to_slow = Math.max(entry_speed, this.speed - entry_speed);
      var exit_ticks_to_break = speed_to_slow / this.brake;
      var avg_speed = (speed_to_slow / 2) + this.destination.entry_speed;
      var break_distance = mph_to_fps(avg_speed) * exit_ticks_to_break;
      brake_pressure = break_distance / distance_to_dest;
      this.speed = Math.max(this.destination.entry_speed, this.speed - (brake_pressure * this.brake));
      this.text = 'dest'
    } else if (near_car) {
      if (this.speed > next_car.speed) {
        brake_pressure = break_distance / distance_to_car;
        this.speed = Math.max(next_car.speed, this.speed - (brake_pressure * this.brake));
      }
      this.text = 'car'
    } else if (near_red_light) {
      // come to a stop in time for the light
      distance_to_light = this.next_light.distance - this.distance;
      brake_pressure = break_distance / distance_to_light;
      this.speed = Math.max(0, this.speed - (brake_pressure * this.brake));
      this.text = 'red';
    } else {
      // start matching speed to the speed limit
      var limit = this.speed_limit.speed_limit;
      if (this.speed > limit) {
        this.speed = Math.max(limit, this.speed - this.brake);
        this.text = 'brake';
      } else {
        this.speed = Math.min(limit, this.speed + this.gas);
        this.text = 'gas';
      }
    }

    // don't run into cars ahead of you

    // slow down if the light ahead is red


    // slow down if near your destination

    // update distance based on speed
    this.distance += mph_to_fps(this.speed);


    this.render();
    /*
    this.el.html(text +
                 '<br/> speed=' + Math.floor(this.speed) +
                 '<br/> break=' + Math.floor(break_distance) +
                 '<br/> light=' + Math.floor(distance_to_light) +
                 '<br/> press=' + Math.floor(brake_pressure) +
                 '');
     */
  }

  finished = function() {
    if (this.destination) {
      return this.distance > this.destination.distance;
    }

    return this.distance > total_distance;
  }

  render = function() {
    this.text_el.html(this.text + '<br/>' + Math.floor(this.speed));
  }

  destroy = function() {
    this.el.remove();
    this.el = null;
    this.text_el = null;
  }

  _compute_nexts = function() {
    if (this.next_limit && this.distance > this.next_limit.distance) {
      this.speed_limit_idx++;
      this.speed_limit = this.next_limit;
      this.next_limit = speed_limits[next_idx]
      var next_idx = this.speed_limit_idx+1
      this.next_limit = speed_limits[next_idx];
    }

    if (this.next_light && this.distance > this.next_light.distance) {
      this.traffic_light_idx++;
      this.next_light = lights[this.traffic_light_idx]
    }
  }

}

function car(speed) {
  speed = speed || 70;
  return new Car(speed, 2, 4);
}

GREEN = 1;
RED = 0;

class StopLight {
  constructor(distance, green, red) {
    this.distance = distance;
    this.green_duration = green;
    this.red_duration = red;
    this.state = GREEN;
    this.ticks = Math.floor(Math.random() * green);

    // associate this class with a jquery el
    var el = $('#light').clone();
    el.attr('id', '');
    el.appendTo('#canvas');
    this.el = el;
  }

  toggle = function() {
    this.ticks = 0;
    if (this.state == GREEN) {
      this.state = RED;
      this.el.css('background-color', 'red');
    } else {
      this.state = GREEN;
      this.el.css('background-color', 'green');
    }
  }

  is_red = function() {
    return this.state == RED;
  }

  is_green = function() {
    return this.state == GREEN;
  }

  tick = function() {
    if (this.state == GREEN) {
      if (this.ticks > this.green_duration) {
        this.toggle();
      }
    } else {
      if (this.ticks > this.red_duration) {
        this.toggle();
      }
    }
    this.ticks++;
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
    el.appendTo('#canvas');
    this.el = el;
    this.render();
  }

  render = function() {
    this.el.html(this.speed_limit);
  }
}

function speed_limit(d, limit) {
  return new SpeedLimit(d, limit);
}

class Destination {
  constructor(name, distance, duration, weight) {
    this.name = name;
    this.distance = distance;
    this.duration = duration;
    this.weight = weight;
    this.entry_speed = 1;
    this.color = 'blue';

    // associate this class with a jquery el
    var el = $('#destination').clone();
    el.attr('id', '');
    el.appendTo('#canvas');
    this.el = el;
    this.render();
  }

  render = function() {
    this.el.html(this.name);
  }
}

function destination(name, distance, duration, weight) {
  return new Destination(name, distance, duration, weight);
}

var stats = {'current': {'num': 0, 'avg': 0.0}};

function reset_stats() {
  stats.num = 0;
  stats.avg = 0.0;
}

function update_stats(t) {
  var d = stats.current;
  d.avg = ((d.avg * d.num) + t) / (d.num + 1)
  d.num++;
}

function tick() {
  // tick lights
  _.each(lights, function(light) {
    light.tick();
  })

  // tick cars
  _.each(lane, function(car, idx) {
    // calculate the new speed and distance for each car
    car.tick(idx);
    plot(car);

    if (car.finished()) {
      update_stats(ticks - car.start_tick);
      car.destroy();
    }
  });

  // remove all cars that have finished.
  lane = _.filter(lane, function(car) { return (car.el); });

  if (!lane.length) {
    stop();
  }

  var first_car = _.last(lane)
  if (first_car.distance > 100) {
    if (Math.random() < TRAFFIC) {
      add_car();
    }
  }

  $('#ticks').html(
    'ticks=' + ticks +
    ' num=' + stats.current.num +
    ' avg=' + Math.floor(stats.current.avg));

  ticks++;
  //console.log('tick=' + ticks);
}

var ticks = 0;
var interval_id = null;

function add_car() {
  var c = car(10);
  lane.push(c);
  plot(c);
  return c;
}

var initialized = false;

function init() {
  if (initialized) return;

  lights = [
    light(400),
    light(2000),
    light(3100),
  ];

  speed_limits = [
    speed_limit(0, 70),
    speed_limit(600, 50),
    speed_limit(2200, 35),
    speed_limit(3500, 40),
    speed_limit(4500, 55),
  ];

  destinations = [
    destination('stripes', 1200, 300, 0.5),
  ]

  replot();
}

function replot() {
  _.each(lights.concat(speed_limits).concat(destinations), function(i) { plot(i)});
  _.each(speed_limits, function(i) { i.render(); });
}

function start() {
  if (interval_id) { console.log("already started"); return; }
  init();
  add_car();
  interval_id = setInterval(tick, 100)
}

function stop() {
  clearInterval(interval_id);
  interval_id = null;
  console.log("Stopped!");
}


function plot(item) {
  var x = (item.distance % line_width) / line_width; // 0 - 1
  var line = Math.floor(item.distance / line_width); // 0 - 5
  var y = line / lines; // 0 - 1
  var flipped = line % 2;
  if (flipped) { x = 1 - x; }
  item.el.css('left', x * 100  + '%');
  item.el.css('top', (y * 100 + 10) + '%');

  // only manipulate dom when it changes
  if (flipped == item.flipped) return;

  if (flipped) {
    item.el.addClass('flip');
    if (item.text_el) {
      item.text_el.addClass('flip');
    }
  } else {
    item.el.removeClass('flip');
    if (item.text_el) {
      item.text_el.removeClass('flip');
    }
  }

  item.flipped = flipped;
}












