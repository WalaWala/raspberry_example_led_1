var gpio = require("rpi-gpio");
var readLine = require("readline");
var rl = readLine.createInterface({
	input: process.stdin,
	output: process.stdout
});
var gpios = [[11, gpio.DIR_OUT], [12, gpio.DIR_OUT]];

setupGPIOS(gpios).then(logic);

function setupGPIOS(gpios) {
	var promise = new Promise(function (resolve, reject) {
		var pinsReady = 0;
		
		for (var pin of gpios) {
			if (pin[1] === gpio.DIR_IN) {
				gpio.setup(pin[0], pin[1], gpio.EDGE_BOTH);
				gpioReady();
			} else {
				gpio.setup(pin[0], pin[1], gpioReady);
			}
		}
		
		function gpioReady() {
			pinsReady++;
			if (pinsReady === gpios.length) {
				resolve();
			}
		}
	});
	
	return promise;
}

function logic() {
	var interval = 0;
	var currentValue = false;
	
	askWhatToDo();
	
	function askWhatToDo() {
		rl.question("Please enter 1 for on and 0 for off, f for fancy, q for quit: ", function (answer) {
			switch (answer) {
				case "1":
					setPin(true, askWhatToDo);
					break;
				case "0":
					setPin(false, askWhatToDo);
					break;
				case "f":
					if (interval !== 0) {
						clearInterval(interval);
						break;
					}
					interval = setInterval(function () {currentValue = !currentValue; setPin(currentValue);}, 500);
					break;
				case "q":
					quit();
					return;
					break;
			}
			askWhatToDo();
		});
	}
	
	function setPin(on, callback) {
		gpio.write(11, on, function(err) {
			gpio.write(12, !on, function(err) {
				if (err) 
					throw err;
				if (callback) 
					callback();
			});
		});
	}
	
	function quit() {
		gpio.destroy(function () {
			process.exit();
		});
	}
}