//----input values----

    var length = 50 //desired number of colors in the colorscale. Default is 10
    var gamma = 2.2 //defines the curve of luminance from dark to light. Default, as per human perception, is 2.2
    var lowestLum = 0.007; //lowest desired luminance. Default is 0.007
    var highestLum = 0.9; //highest desired luminance. Default is 0.9
    var colors = [
        "4800BA",
        "FFD93A",
        "FF0066",
        "03FFFF",
        "000"
        //{ h:000, s:1.0, l:0.5}
    ]; //passing colors for which color scales are to be created as an array. Values can be passed in any format supported by chroma.js

//----end of input values----


//----derived values----
    var lowerRoot = Math.pow(lowestLum, 1 / gamma);
    var upperRoot = Math.pow(highestLum, 1 / gamma);
    var rootInterval = (upperRoot - lowerRoot) / (length - 1);

    //generating a scale of desired luminances
    var desiredLuminances = generateLuminanceScale();
    console.log("Desired Luminance Values:");
    console.table(desiredLuminances);
    console.log(" ");
//----end of derived values----

// Call the function to render color boxes. Loop is added so that function is called for each color in the provided array
for (i = 0; i < colors.length; i++) {
    renderColorBoxes(generateColorScale(colors[i], length, gamma), colors[i]);
};

//generate luminance values properly using logarithmic scale
function generateLuminanceScale() {
    var desiredLuminances = [];
    for (i = 0; i < length; i++) {
        const desiredLuminance = Math.pow(lowerRoot + (i * rootInterval), gamma);
        desiredLuminances.push(desiredLuminance);
    };
    return desiredLuminances;
}

//main function that generates the color scale from the provided inputs
function generateColorScale(inputColor, colScaleLength, gamma) {

    //generate colors from luminance values
    var colorScale = [];
    var colorScaleHsl = [];
    for (var i = 0; i < colScaleLength; i++) {
        //enable the following nested if condition if lightest color's saturation has to be adjusted specifically
        /*if(i === colScaleLength - 1){
          if(chroma(inputColor).get('hsl.s') > 0.9){
            colorScale.push(chroma(inputColor).set('hsl.s', 0.9).luminance(desiredLuminances[i]).hex());
          }
          else{
            colorScale.push(chroma(inputColor).luminance(desiredLuminances[i]).hex());
          }
        }
        else{ 
          colorScale.push(chroma(inputColor).luminance(desiredLuminances[i]).hex());
        }; */
        colorScale.push(chroma(inputColor).luminance(desiredLuminances[i]).hex());
        const hslColor = chroma(colorScale[i]).hsl();
        colorScaleHsl.push(hslColor);
    }
    console.log("Provided Color: #" + inputColor + " (" + classify(inputColor) + ")" );
    console.log("Color Scale:");
    console.table(colorScale);
    console.log("----------")
    //console.table(colorScaleHsl);
    //console.table(desiredLuminances);
    return colorScale;
};

// Function to render color boxes on the webpage
function renderColorBoxes(colorArray, inputColor) {
    //console.log("inputColor: " + chroma(inputColor).hex());
    const colorScaleContainer = document.getElementById("colorScales");
    const colorScale = document.createElement("div");
    colorScale.classList.add("colorScale")
    colorScaleContainer.appendChild(colorScale);

    const originalColor = document.createElement("div");
    originalColor.classList.add("originalColor")
    originalColor.style.backgroundColor = chroma(inputColor).hex();
    colorScale.appendChild(originalColor);

    // Loop through the array of colors
    colorArray.forEach(function (color) {
        // Create a div element for each color
        const colorBox = document.createElement("div");
        colorBox.classList.add("colorBox");
        colorBox.style.backgroundColor = color;

        // Append the color box to the container
        colorScale.appendChild(colorBox);
    });
}

//find the threshold values for luminances of dark, medium and light. Compare against values of luminance specified for light, medium and dark colors. These values actually can depend on the gamma. It shouldn't be on the basis of position on the color scale as that can change with gamma. The thresholds will be a constant derived from human perception. I.e. gamma of 2.2  
function classify(inputColor) {
    var classification

    mediumLuminanceThreshold = Math.pow(lowerRoot + (0.4 * length * rootInterval), gamma);
    //console.log("mediumLuminanceThreshold: " + mediumLuminanceThreshold);

    lightLuminanceThreshold = Math.pow(lowerRoot + (0.7 * length * rootInterval), gamma);
    //console.log("lightLuminanceThreshold: " + lightLuminanceThreshold);



    if (chroma(inputColor).luminance() >= lightLuminanceThreshold) {
        classification = "Light";
    }
    else if (chroma(inputColor).luminance() >= mediumLuminanceThreshold) {
        classification = "Medium";
    }
    else {
        classification = "Dark";
    }
    return classification
};

//function for clicking to copy a color
document.addEventListener('DOMContentLoaded', function () {
    // Get all elements with the class 'colorBox'
    var colorBoxes = document.querySelectorAll('.colorBox, .originalColor');

    // Add click event listener to each color colorBox to copy the hexcode of the color
    colorBoxes.forEach(function (colorBox) {
        colorBox.addEventListener('click', function () {
            // Get the background color of the clicked element
            var bgColor = this.style.backgroundColor;
            console.log("Selected color: " + bgColor + ", Hexcode: " + chroma(rgbStrToHexCode(bgColor)).hex());
            console.log("Luminance: " + chroma(rgbStrToHexCode(bgColor)).luminance());
            console.log("");

            // Convert the RGB color to HEX format
            var hexColor = rgbStrToHexCode(bgColor);

            // Copy the HEX color to the clipboard
            navigator.clipboard.writeText(hexColor)
                .then(function () {
                    // Alert that the color has been copied to clipboard
                    var alertMessage = '✔️ ' + hexColor + ' copied to clipboard';
                    showMessage(alertMessage, 3000); // Display for 3 seconds
                })
                .catch(function () {
                    // If clipboard write fails
                    var errorMessage = 'Failed to copy color to clipboard';
                    showMessage(errorMessage, 3000); // Display for 3 seconds
                });

            var messageTimeout; // Variable to store the timeout reference

            function showMessage(message, duration) {
                var messageBox = document.getElementById('messageBox');
                // Set the message content
                messageBox.textContent = message;
                // Show the message box
                messageBox.style.display = 'block';

                // Clear the previous timeout, if any
                clearTimeout(messageTimeout);

                // Automatically hide the message box after the specified duration
                messageTimeout = setTimeout(function () {
                    // Hide the message box
                    messageBox.style.display = 'none';
                }, duration);
            }

            // Example function to simulate triggering a message
            function triggerMessage() {
                var hexColor = "#ff0000"; // Example color, replace with your logic to get the color
                var alertMessage = 'Color copied to clipboard: ' + hexColor;
                showMessage(alertMessage, 3000); // Display for 3 seconds
            }
        });
    });
});

// Function to convert RGB string (e.g. rgb(0,0,0)) to HEX format. This conversion isn't a part of Chroma.js
function rgbStrToHexCode(rgb) {
    // Convert rgb color to an array of integers
    var parts = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    delete (parts[0]);
    for (var i = 1; i <= 3; ++i) {
        parts[i] = parseInt(parts[i]).toString(16);
        if (parts[i].length == 1) parts[i] = '0' + parts[i];
    }
    // Construct the HEX color
    var hexColor = '#' + parts.join('');
    return hexColor;
}