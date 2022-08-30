# Electric Cat


Electric Cat is an image processing software project, under development, implemented entirely in JavaScript, which mimics Photoshop 1.0 on Apple System 7, offering similar functionalities and interface. It's both a nod to Photoshop and to the Mac, and a study of what JS allows for image processing today (in 2018).

The software uses libraries and algorithms transcribed into JS from Gimp, ImageMagick and many other free software. Not everything is optimized yet, and some processing, depending on the parameters used, can take a lot of CPU time when they are not performed by the GPU with WebGL, discovered during the project.

At this stage of development (a hundred hours only), the software has only been tested on Google Chrome, on Macintosh. Thank you for using Chrome to test Electric Cat.

Handled image formats are PNG, JPG, WEBP and GIF (not animated).

It is possible to undo the last 20 actions using the Edit / Undo menu.

To open an image file, simply drag and drop it onto the gray area or use the File / Open menu.

No Zoom function is implemented at the moment, therefore choose a small image to test.

Normally, it is not necessary to load the application through a web server; it should run locally, directly in your browser, by opening the file named "index.html" in Chrome. Be sure to have all the folders present in the project nearby.

You can also simply run it folowing this demo link [ppyne.github.io/electriccat](https://ppyne.github.io/electriccat/).

Here is an ideal test image, save it on your computer, 

<img src="readme_images/sample.jpg" width="422" height="499" alt=""/>

then drag and drop it on the gray area to open it, like this:

<img src="readme_images/Ouvrir.gif" width="900" height="600" alt=""/>

It is possible to carry out many treatments on an image, here are some eloquent examples.

## The transformations (transform menu)

Available features:

- Flip Horizontal
- Flip Vertical
- Rotate 180°
- Rotate 90° Clockwise
- Rotate 90° Counterclockwise
- Arbitrary Rotation...
- Resize...
- Crop...

### Transform / Arbitrary Rotation...

<img src="readme_images/ArbitraryRotation.png" width="900" height="600" alt=""/>

### Transform / Resize...

<img src="readme_images/Resize.png" width="900" height="600" alt=""/>

### Transform / Crop...

<img src="readme_images/Crop.png" width="900" height="600" alt=""/>

## The adjustments (Adjust menu)

Available features:

- Levels... currently buggy (2022)
- Auto Levels
- Brightness/Contrast...
- Auto Contrast
- Curves...
- Color Balance...
- Vibrance...
- Hue/Saturation...
- Channel Mixer...
- Photo Filter...
- Invert
- Normalize
- Equalize
- Desaturate...
- Posterize...
- Threshold...
- Histogram...

### Adjust / Levels...

<img src="readme_images/Levels.png" width="900" height="600" alt=""/>

### Adjust / Curves...

<img src="readme_images/Curve.png" width="900" height="600" alt=""/>

### Adjust / Color Balance...

<img src="readme_images/ColorBalance.png" width="900" height="600" alt=""/>

### Adjust / Channel Mixer...

<img src="readme_images/ChannelMixer.png" width="900" height="600" alt=""/>

### Adjust / Hue/Saturation...

<img src="readme_images/HueSaturation.png" width="900" height="600" alt=""/>

With the colorize option:

<img src="readme_images/HueSaturationColorize.png" width="900" height="600" alt=""/>

### Adjust / Channel Mixer...

<img src="readme_images/ChannelMixer.png" width="900" height="600" alt=""/>

### Adjust / Photo Filter...

With all Kodak filters.

<img src="readme_images/PhotoFilter.png" width="900" height="600" alt=""/>

### Adjust / Desaturate...

<img src="readme_images/Desaturate.png" width="900" height="600" alt=""/>

### Adjust / Posterize...

<img src="readme_images/Posterize.png" width="900" height="600" alt=""/>

## Les filters (Filter menu)

Available features:

- Blur
    - Blur
    - Blur More
    - Gaussian Blur...
    - Motion Blur...
    - Zoom Blur...
    - Lens Blur...
    - Tilt Shift...
    - Bilateral...
    - Triangle Blur...
    - Box Blur...
- Sharpen
    - Sharpen
    - Sharpen More
    - Unsharp Mask...
- Noise
    - Add Noise...
    - Median...
    - Despeckle
    - Denoise...
    - Bilateral...
- Pixelate
    - Pixelate...
    - Hexagonal Pixelate...
    - Halftone...
- Distort
    - Sine Distortion...
    - Pinch...
    - Twirl...
- Stylize
    - Sepia...
    - Vignette...
    - Ink...
    - Painting...
    - Erosion...
    - Dialation...
    - Edge Work...
    - Difference of Gaussians...
    - Trace Contour
    - Find Edge
    - Emboss Medium Gray
    - Emboss
    - Solarize
    - Pseudocolor

### Filter / Blur / Zoom Blur...

<img src="readme_images/ZoomBlur.png" width="900" height="600" alt=""/>

### Filter / Sharpen / Unsharp Mask...

<img src="readme_images/UnsharpMask.png" width="900" height="600" alt=""/>

### Filter / Noise / Median...

<img src="readme_images/Median.png" width="900" height="600" alt=""/>

### Filter / Noise / Bilateral...

<img src="readme_images/Bilateral.png" width="900" height="600" alt=""/>

### Filter / Pixelate / Hexagonal Pixelate...

<img src="readme_images/HexagonalPixelate.png" width="900" height="600" alt=""/>

### Filter / Pixelate / Halftone...

<img src="readme_images/Halftone.png" width="900" height="600" alt=""/>

### Filter / Distort / Pinch...

<img src="readme_images/Pinch.png" width="900" height="600" alt=""/>

### Filter / Distort / Twirl...

<img src="readme_images/Twirl.png" width="900" height="600" alt=""/>

### Filter / Stylize / Difference of Gaussians...

<img src="readme_images/DifferenceOfGaussians.png" width="900" height="600" alt=""/>

### Filter / Stylize / Solarize

<img src="readme_images/Solarize.png" width="900" height="600" alt=""/>

## The modes (Mode menu)

Available features:
- Bitmap...
- Indexed Color...
- Grayscale
- RGB

### Mode / Bitmap...

<img src="readme_images/Bitmap.png" width="900" height="600" alt=""/>

### Mode / Indexed Color...

<img src="readme_images/IndexedColor.png" width="900" height="600" alt=""/>
