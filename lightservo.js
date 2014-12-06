/*********************************************
 Tessel app to use the ambient sensor and servo
 module to check the light level and move the servo
 to indicate if the light level is (a subjective
 value) on or off. The leds will also indicate
 the light sensor detection.
 *********************************************/

var tessel = require('tessel');
var ambientlib = require('ambient-attx4');
var servolib = require('servo-pca9685');

// servo is on the following port
var servo = servolib.use(tessel.port['A']);
var servo1 = 1; // We have a servo plugged in at position 1

// ambient sensor is on the following port
var ambient = ambientlib.use(tessel.port['B']);

var lightState = 0;

servo.on('ready', function () {

    servo.configure(servo1, 0.05, 0.12, function () {


        ambient.on('ready', function () {
            // Get points of light and sound data.
            setInterval(function () {
                ambient.getLightLevel(function (err, ldata) {
                    if (err) throw err;

                    console.log("Light level:", ldata.toFixed(8));

                    // if the light level detected is greater than this
                    // then assume that the light is on
                    if (ldata > 0.02) {
                        console.log("light is on");

                        // if the light was not previously on then
                        // note that it is now off and
                        // move the servo and change the leds
                        if (lightState == 0) {
                            lightState = 1;
                            servo.move(servo1, 0.0);
                            tessel.led[0].output(1);
                            tessel.led[1].output(0);
                        }
                    } else {
                        console.log("light is off");
                        if (lightState == 1) {
                            lightState = 0;
                            servo.move(servo1, 1);
                            tessel.led[0].output(0);
                            tessel.led[1].output(1);
                        }
                    }

                })
            }, 500); // The readings will happen every .5 seconds unless the trigger is hit

            ambient.setLightTrigger(0.5);

            // Set a light level trigger
            // The trigger is a float between 0 and 1
            ambient.on('light-trigger', function (data) {
                console.log("Our light trigger was hit:", data);

                // Clear the trigger so it stops firing
                ambient.clearLightTrigger();
                //After 1.5 seconds reset light trigger
                setTimeout(function () {

                    ambient.setLightTrigger(0.5);

                }, 1500);
            });


        });

    });

});


ambient.on('error', function (err) {
    console.log(err)
});

servo.on('error', function(err) {
    console.log("servo error:" ,err);
})
