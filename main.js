
class Car {
  constructor(speed, gas, brake) {
    this.distance = 0;
    this.speed = speed;
    this.length = 20;
    this.gas = gas;
    this.brake = brake;
  }
}

function car() {
  return new Car(70, 1, 2)
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

var lanes = [car()];

function render() {
  _.each(lanes, function(car) {
    plot(car)
  })
}

function plot(car) {

}
















