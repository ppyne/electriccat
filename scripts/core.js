function copyImageData(src) {
    var dst = {
        canvas: null,
        context: null,
        imageData: null
    };
    dst.canvas = document.createElement('canvas');
    dst.context = dst.canvas.getContext('2d');
    dst.imageData = dst.context.createImageData(src.width, src.height);
    //dst.imageData.data.set(src.data);
    for(var i = 0; i < src.data.length; i++){
        dst.imageData.data[i] = src.data[i];
    }
    return dst;
}

function newImageData(width, height) {
    var dst = {
        canvas: null,
        context: null,
        imageData: null
    };
    dst.canvas = $('<canvas width="'+width+'" height="'+height+'">').get(0);
    dst.context = dst.canvas.getContext('2d');
    dst.imageData = dst.context.createImageData(width, height);
    return dst;
}

function median(imageData, radius) {
    var dst = copyImageData(imageData);
    var hist = {
        r: [],
        g: [],
        b: [],
        n: 0
    };
    var _median = function(x, n) {
    	var i;
	    for (n /= 2, i = 0; i < 256 && (n -= x[i]) > 0; i++);
    	return i;
    };
    var _addPixels = function (imageData, y, x, radius, hist) {
        if (x < 0 || x >= imageData.width) return;
        for (var i = y - radius; i <= y + radius && i < imageData.height; i++) {
            if (i < 0) continue;
            var index = (x + i * imageData.width) * 4;
            hist.r[imageData.data[index]]++;
            hist.g[imageData.data[index+1]]++;
            hist.b[imageData.data[index+2]]++;
            hist.n++;
        }
    };
    var _delPixels = function (imageData, y, x, radius, hist) {
        if (x < 0 || x >= imageData.width) return;
        for (var i = y - radius; i <= y + radius && i < imageData.height; i++) {
            if (i < 0) continue;
            var index = (x + i * imageData.width) * 4;
            hist.r[imageData.data[index]]--;
            hist.g[imageData.data[index+1]]--;
            hist.b[imageData.data[index+2]]--;
            hist.n--;
        }
    };
    for (var y = 0; y < imageData.height; y++) {
        for (var x = 0; x < imageData.width; x++) {
            var index = (x + y * imageData.width) * 4;
            if (x === 0) {
                // init
                for (var k = 0; k < 256; k++) {
                    hist.r[k] = 0;
                    hist.g[k] = 0;
                    hist.b[k] = 0;
                }
                hist.n = 0;
                for (var j = 0; j < radius && j < imageData.width; j++)
                    _addPixels(imageData, y, j, radius, hist);
            } else {
                _delPixels(imageData, y, x - radius, radius, hist);
                _addPixels(imageData, y, x + radius, radius, hist);
            }
            dst.imageData.data[index] = _median(hist.r, hist.n);
            dst.imageData.data[index+1] = _median(hist.g, hist.n);
            dst.imageData.data[index+2] = _median(hist.b, hist.n);
        }
    }
    return dst.imageData;
}

function pixelate(imageData, cellSize) {
    var pixsize = cellSize * cellSize;
    var pixels = [];
    var wpixels = [];
    var col = 0;
    var row = 0;
    var wpix = 0;
    var hpix = 0;
    var windex = 0;
    var maxsize = cellSize - 1;
    var maxwidth = imageData.width - 1;
    var maxheight = imageData.height - 1;
    
    for (var cp = 0; cp < imageData.data.length; cp+=4) {        
        if (typeof wpixels[windex] === 'undefined') wpixels[windex] = [];
        wpixels[windex].push([imageData.data[cp], imageData.data[cp+1], imageData.data[cp+2]]);
        wpix++;
        col++;
        if (wpix > maxsize || col > maxwidth) {
            wpix = 0;
            windex++;
        }
        if (col > maxwidth) {
            hpix++;
            row++;
            windex = 0;
            col = 0;
        }
        if (hpix > maxsize || row > maxheight) {
            hpix = 0;
            for(var i = 0; i < wpixels.length; i++) {
                var ps = wpixels[i];
                var r = 0, g = 0, b = 0;
                for(var j = 0; j < ps.length; j++) {
                    r += ps[j][0];
                    g += ps[j][1];
                    b += ps[j][2];
                }
                wpixels[i] = [Math.round(r/ps.length), Math.round(g/ps.length), Math.round(b/ps.length)];
            }
            pixels.push(wpixels);
            wpixels = [];
        }
    }
    
    col = 0;
    row = 0;
    wpix = 0;
    hpix = 0;
    windex = 0;
    var hindex = 0;
    
    for (var cp = 0; cp < imageData.data.length; cp+=4) {
        imageData.data[cp] = pixels[hindex][windex][0];
        imageData.data[cp+1] = pixels[hindex][windex][1];
        imageData.data[cp+2] = pixels[hindex][windex][2];
        wpix++;
        col++;
        if (wpix > maxsize || col > maxwidth) {
            wpix = 0;
            windex++;
        }
        if (col > maxwidth) {
            hpix++;
            row++;
            windex = 0;
            col = 0;
        }
        if (hpix > maxsize) {
            hpix = 0;
            hindex++;
        }
    }
    return imageData;
}

function normalize(imageData) {
    var maxval = 0;
    var minval = 255;
    var lut = [];
    for (var i = 0; i < 256; i++) lut.push(0);
    for (var cp = 0; cp < imageData.data.length; cp+=4) {
        for (var u = 0; u < 3; u++) {
            maxval = Math.max(maxval, imageData.data[cp+u]);
            minval = Math.min(minval, imageData.data[cp+u]);
        }
    }
    var range = maxval - minval;
    if (range !== 0) {
        for (var i = minval; i <= maxval; i++)
            lut[i] = 255 * (i - minval) / range;
    } else {
        lut[minval] = minval;
    }
    for (var cp = 0; cp < imageData.data.length; cp+=4) {
        for (var u = 0; u < 3; u++) {
            imageData.data[cp+u] = lut[imageData.data[cp+u]];
        }
    }
    return imageData;
}

function equalize(imageData) {
    var hist = histogram(imageData);
    var _count = function(hist) {
        var n = 0;
        for (var i = 0; i < 256; i++) {
            n += hist[i];
        }
        return n;
    };
    var RINT = function(x) { return Math.floor(x + 0.5); };
    var lut = [];
    for (var i = 0; i < 256; i++) lut.push(0);
    var pixels = _count(hist);
    var sum = 0;
    for (var v = 0; v < 256; v++) {
        sum += hist[v];
        lut[v] = RINT(sum * 255 / pixels);
    }
    for (var cp = 0; cp < imageData.data.length; cp+=4) {
        for (var u = 0; u < 3; u++) {
            imageData.data[cp+u] = lut[imageData.data[cp+u]];
        }
    }
    return imageData;
}

function equalizeTheGimpWay(imageData) {
    var hists = histogram_array(imageData, [0,1,2]);
    var _count = function(hist) {
        var n = 0;
        for (var i = 0; i < 256; i++) {
            n += hist[i];
        }
        return n;
    };
    var RINT = function(x) { return Math.floor(x + 0.5); };
    var luts = [];
    for (var h = 0; h < 3; h++) for (var i = 0; i < 256; i++) {
        if (typeof luts[h] === 'undefined') luts[h] = [];
        luts[h].push(0);
    }
    for (var u = 0; u < 3; u++) {
        var pixels = _count(hists[u]);
        var sum = 0;
        for (var v = 0; v < 256; v++) {
            sum += hists[u][v];
            luts[u][v] = RINT(sum * 255 / pixels);
        }
    }
    for (var cp = 0; cp < imageData.data.length; cp+=4) {
        for (var u = 0; u < 3; u++) {
            imageData.data[cp+u] = luts[u][imageData.data[cp+u]];
        }
    }
    return imageData;
}

function autoContrast(imageData) {
    var threshold = 50;
    var dst = copyImageData(imageData);
    var hist = [];
    for (var i = 0; i < 256; i++) hist.push(0);
    for (var p = 0; p < dst.imageData.data.length; p += 4) {
        hist[Math.round(getLuminance(imageData.data[p], imageData.data[p+1], imageData.data[p+2]))]++;
    }
    var param = {min: imageData.width*imageData.height, max: 0};
    for(var i = 0; i < 256; i++) {
        if (hist[i] > threshold) {
            param.min = i;
            break;
        }
    }
    for(var i = 255; i >= 0; i--) {
        if (hist[i] > threshold) {
            param.max = i;
            break;
        }
    }
    var lut = [];
    for (var i = 0; i < 256; i++) lut.push(255);
    var range = param.max - param.min;
    if (range !== 0) {
        for (var x = 0; x < 255; x++) {
            var val = Math.round(255 * (x - param.min) / range);
            if (val > 255) val = 255;
            else if (val < 0) val = 0;
            lut[x] = val;
        }
    } else lut[param.min] = param.min;
    for (var p = 0; p < dst.imageData.data.length; p += 4) {
        for(var u = 0; u < 3; u++) {
            dst.imageData.data[p+u] = lut[dst.imageData.data[p+u]];
        }
    }
    return dst.imageData;
}

// Contrast Stretch multi-channels
function autoContrastTry3(imageData) {
    var dst = copyImageData(imageData);
    var params = [{min:255,max:0},{min:255,max:0},{min:255,max:0}];
    for (var p = 0; p < dst.imageData.data.length; p += 4) {
        for(var u = 0; u < 3; u++) {
            params[u].min = Math.min(params[u].min, dst.imageData.data[p+u]);
            params[u].max = Math.max(params[u].max, dst.imageData.data[p+u]);
        }
    }
    var luts = [[],[],[]];
    for (var i = 0; i < 256; i++) {
        for (var j = 0; j < 3; j++) luts[j].push(0);
    }
    for (var j = 0; j < 3; j++) {
        var range = params[j].max - params[j].min;
        if (range !== 0) {
            for (var x = params[j].min; x <= params[j].max; x++) luts[j][x] = 255 * (x - params[j].min) / range;
        } else luts[j][params[j].min] = params[j].min;
    }
    for (var p = 0; p < dst.imageData.data.length; p += 4) {
        for(var u = 0; u < 3; u++) {
            dst.imageData.data[p+u] = luts[u][dst.imageData.data[p+u]];
        }
    }
    
    return dst.imageData;
    
}

function autoContrastTry2(imageData) {
/*

A simple linear way of performing "auto-contrast" is to linearly stretch and offset the image intensities.
The idea is to find the stretch (contrast) and offset (intensity) correction parameters such that in the corrected image the 5th percentile will be mapped to 0, and the 95th percentile will be mapped to 255.

My example is for a grayscale image. For color images you can convert to any color space that has a single intensity channel and 2 color channels (e.g. Lab, HSV, YUV etc.) and perform this only on the intensity channel.

Create an image histogram
Find the 5th and 95 grey-value percentile (use accumulating sum over the histogram values).
Solve for a and b in these 2 simple linear equations:
a*p5+b=0 and a*p95+b=255, where p5 and p95 are the 5th and 95 grey-value percentiles respectively.
a is the contrast, and b is the intensity corrections.
Now map all your grey pixel intensities according to the equation: g'=a*g+b for all g=0..255.
Of course, you might want to use different values for the percentile and the actual mappings. See what works for you.

*/
    var k = 0.01;
    var dst = copyImageData(imageData);
    var lab = [];
    var hist = [];
    var total = 0;
    for (var i = 0; i < 255; i++) hist.push(0);
    for (var p = 0; p < imageData.data.length; p+=4) {
        hist[Math.round(getLuminance(imageData.data[p], imageData.data[p+1], imageData.data[p+2]))]++;
        total++;
    }
    var c1 = total*k;
    var c2 = total*(1-k);
    var p1 = false;
    var p2 = false;
    var sum = 0;
    for (var i = 0; i < 255; i++) {
        sum += hist[i];
        if (sum >= c1 && p1 === false) p1 = i;
        if (sum >= c2 && p2 === false) {
            p2 = i;
            break;
        }
    }
    // contrast
    var a = -(255/(p1-p2));
    // intensity
    var b = (255*p1)/(p1-p2);
    //return brightnessContrast(dst.imageData, b*0.005, (a*0.0075)+1);
    for (var p = 0; p < imageData.data.length; p+=4) {
            dst.imageData.data[p] =  imageData.data[p]*a-b;
            dst.imageData.data[p+1] = imageData.data[p+1]*a-b;
            dst.imageData.data[p+2] = imageData.data[p+2]*a-b;
    }

    return dst.imageData;
    
}

function autoContrastTry1(imageData) {
    /*var lut = [];
    for (var i = 0; i < 256; i++) {
        lut.push(i + (((i - 127) * 50) / 100));
    }*/
    var lut = [0, 0, 0, 0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 4, 5, 5, 5, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15, 17, 18, 19, 20, 21, 23, 24, 25, 26, 27, 29, 30, 31, 32, 33, 35, 36, 37, 38, 39, 41, 42, 43, 44, 45, 47, 48, 49, 50, 51, 53, 54, 55, 56, 57, 59, 60, 61, 62, 63, 65, 66, 67, 68, 69, 71, 72, 73, 74, 75, 77, 78, 79, 80, 81, 83, 84, 85, 86, 87, 89, 90, 91, 92, 93, 95, 96, 97, 98, 99, 101, 102, 103, 104, 105, 107, 108, 109, 110, 111, 113, 114, 115, 116, 117, 119, 120, 121, 122, 123, 125, 126, 127, 128, 129, 131, 132, 133, 134, 135, 137, 138, 139, 140, 141, 143, 144, 145, 146, 147, 149, 150, 151, 152, 153, 155, 156, 157, 158, 159, 161, 162, 163, 164, 165, 167, 168, 169, 170, 171, 173, 174, 175, 176, 177, 179, 180, 181, 182, 183, 185, 186, 187, 188, 189, 191, 192, 193, 194, 195, 197, 198, 199, 200, 201, 203, 204, 205, 206, 207, 209, 210, 211, 212, 213, 215, 216, 217, 218, 219, 221, 222, 223, 224, 225, 227, 228, 229, 230, 231, 233, 234, 235, 236, 237, 239, 240, 241, 242, 243, 245, 246, 247, 248, 249, 250, 250, 250, 250, 251, 251, 251, 251, 251, 252, 252, 252, 252, 253, 253, 253, 253, 254, 254, 254, 254, 254, 255, 255, 255, 255];
    for (var cp = 0; cp < imageData.data.length; cp+=4) {
        for (var u = 0; u < 3; u++) {
            imageData.data[cp+u] = lut[imageData.data[cp+u]];
        }
    }
    return imageData;
}

function levels_config_stretch_channel(hist, channel) {
    var config = {
        Input: {
            Gamma: 1.0,
            High: 255,
            Low: 0
        },
        Output: {
            High: 255,
            Low: 0
        }
    };
    
    var getValue = function (hist, bin) {
        return Math.min(hist[0][bin], Math.min(hist[1][bin], hist[2][bin]));
    };
    if (hist.length == 1) getValue = function (hist, bin) {
        return hist[0][bin];
    };
  
    var count = 0;
    for (var k = 0; k <= 255; k++) count += hist[channel][k];
  
    if (count === 0.0) {
        config.Input.Low = 0.0;
        config.Input.High = 0.0;
    } else {
        var i;
        var percentage;
        var next_percentage;
  
        /*  Set the low input  */
        var new_count = 0.0;
  
        for (i = 0; i < 255; i++) {
            new_count += getValue(hist, i);
            percentage = new_count / count;
            next_percentage = (new_count + getValue(hist, i + 1)) / count;
            if (Math.abs(percentage) < Math.abs(next_percentage)) {
                config.Input.Low = i + 1;
                break;
            }
        }
  
        /*  Set the high input  */
        new_count = 0.0;
  
        for (i = 255; i > 0; i--) {
            new_count += getValue(hist, i);
            percentage = new_count / count;
            next_percentage = (new_count + getValue(hist, i - 1)) / count;
            if (Math.abs(percentage) < Math.abs(next_percentage)) {
                config.Input.High = i - 1;
                break;
            }
        }
    }
    return config;
}

function levels_config_stretch_channels(imageData, channels) {
    if (typeof channels === 'undefined') channels = [0, 1, 2];
    var hist = histogram_array(imageData, channels);
    var levels = [];
    for (var i = 0; i < channels.length; i++) {
        levels[channels[i]] = levels_config_stretch_channel(hist, channels[i]);
    }
    return levels;
}

function levels_multi_channels(imageData, levels) {
    var putValue = function (imageData, cp, i, v) {
        imageData.data[cp + i] = v;
    };
    // Grayscale
    if (levels.length == 1) putValue = function (imageData, cp, i, v) {
        imageData.data[cp] = imageData.data[cp+1] = imageData.data[cp+2] = v;
    };
    for (var cp = 0; cp < imageData.data.length; cp+=4) {
        var inten;
        for (var i = 0; i < levels.length; i++) {
            var inten = imageData.data[cp + i];
            /*  determine input intensity  */
            if (levels[i].Input.High != levels[i].Input.Low) {
                inten = ((inten - levels[i].Input.Low) / (levels[i].Input.High - levels[i].Input.Low));
            } else {
                inten = (inten - levels[i].Input.Low);
            }
            /* clamp to new black and white points */
            if (inten > 1.0) inten = 1.0;
            else if (inten < 0.0) inten = 0.0;
            if (levels[i].Input.Gamma !== 0.0) {
                inten =  Math.pow(inten, (1.0 / levels[i].Input.Gamma));
            }
            /*  determine the output intensity  */
            if (levels[i].Output.High >= levels[i].Output.Low)
                inten = (inten * (levels[i].Output.High - levels[i].Output.Low) + levels[i].Output.Low);
            else if (levels[i].Output.High < levels[i].Output.Low)
                inten = (levels[i].Output.Low - inten * (levels[i].Output.Low - levels[i].Output.High));
            putValue(imageData, cp, i, Math.round(inten));
        }
    }
    return imageData;
}

//----- Begin findBoundarySizeOfRotatedRect

/* Given a list of floating-point values, convert each to its integer equivalent *furthest* from 0.
  Said another way, round negative numbers down, and positive numbers up.  This is often relevant in PD when performing
  coordinate conversions that are ultimately mapped to pixel locations, and we need to bounds-check corner coordinates
  in advance and push them away from 0, so any partially-covered pixels are converted to fully-covered ones. */
function convertArbitraryListToFurthestRoundedInt(list) {
    for (var element in list) {
        if (list.hasOwnProperty(element)) {
            if (list[element] < 0) {
                list[element] = parseInt(list[element]);
            } else {
                if (list[element] == parseInt(list[element])) {
                    list[element] = parseInt(list[element]);
                } else {
                    list[element] = parseInt(list[element]) + 1;
                }
            }
        }
    }
}

/* Given a rectangle (as defined by width and height, not position), calculate the bounding rect required by a rotation of that rectangle. */
function findBoundarySizeOfRotatedRect(srcWidth, srcHeight, rotateAngle, padToIntegerValues) {
    padToIntegerValues = padToIntegerValues | true;
    
    /* Convert the rotation angle to radians */
    rotateAngle = rotateAngle * (Math.PI / 180);

    /*Find the cos and sin of this angle and store the values */
    var cosTheta = Math.cos(rotateAngle);
    var sinTheta = Math.sin(rotateAngle);

    /* Create source and destination points */

    /* Position the points around (0, 0) to simplify the rotation code */
    var x1 = -srcWidth / 2;
    var x2 = srcWidth / 2;
    var x3 = srcWidth / 2;
    var x4 = -srcWidth / 2;
    var y1 = srcHeight / 2;
    var y2 = srcHeight / 2;
    var y3 = -srcHeight / 2;
    var y4 = -srcHeight / 2;

    /* Apply the rotation to each point */
    var points = {
        x11: x1 * cosTheta + y1 * sinTheta,
        y11: -x1 * sinTheta + y1 * cosTheta,
        x21: x2 * cosTheta + y2 * sinTheta,
        y21: -x2 * sinTheta + y2 * cosTheta,
        x31: x3 * cosTheta + y3 * sinTheta,
        y31: -x3 * sinTheta + y3 * cosTheta,
        x41: x4 * cosTheta + y4 * sinTheta,
        y41: -x4 * sinTheta + y4 * cosTheta
    };

    /* If the caller is using this for something like determining bounds of a rotated image, we need to convert all points to
       their "furthest from 0" integer amount.  Int() works on negative numbers, but a modified Ceiling()-type functions is
       required as VB oddly does not provide one. */
    if (padToIntegerValues) {
        convertArbitraryListToFurthestRoundedInt(points);
    }

    /* Find max/min values */
    var xMin = Math.min(points.x11, Math.min(points.x21, Math.min(points.x31, points.x41)));
    var xMax = Math.max(points.x11, Math.max(points.x21, Math.max(points.x31, points.x41)));
    var yMin = Math.min(points.y11, Math.min(points.y21, Math.min(points.y31, points.y41)));
    var yMax = Math.max(points.y11, Math.max(points.y21, Math.max(points.y31, points.y41)));

    /* Return the max/min values */
    return {width: xMax - xMin, height: yMax - yMin};
}

//----- End findBoundarySizeOfRotatedRect

function hermite(imageData, width, height) {
    width = Math.round(parseInt(width));
    height = Math.round(parseInt(height));

    var ratio_w = imageData.width / width;
    var ratio_h = imageData.height / height;
    var ratio_w_half = Math.ceil(ratio_w / 2);
    var ratio_h_half = Math.ceil(ratio_h / 2);

    var imageData2 = (newImageData(width, height)).imageData;

    var data = imageData.data;
    var data2 = imageData2.data;

    for (var j = 0; j < height; j++) {
        for (var i = 0; i < width; i++) {
            var x2 = (i + j * width) * 4;
            var weight = 0;
            var weights = 0;
            var weights_alpha = 0;
            var gx_r = 0;
            var gx_g = 0;
            var gx_b = 0;
            var gx_a = 0;
            var center_y = (j + 0.5) * ratio_h;
            var yy_start = Math.floor(j * ratio_h);
            var yy_stop = Math.ceil((j + 1) * ratio_h);
            for (var yy = yy_start; yy < yy_stop; yy++) {
                var dy = Math.abs(center_y - (yy + 0.5)) / ratio_h_half;
                var center_x = (i + 0.5) * ratio_w;
                var w0 = dy * dy; //pre-calc part of w
                var xx_start = Math.floor(i * ratio_w);
                var xx_stop = Math.ceil((i + 1) * ratio_w);
                for (var xx = xx_start; xx < xx_stop; xx++) {
                    var dx = Math.abs(center_x - (xx + 0.5)) / ratio_w_half;
                    var w = Math.sqrt(w0 + dx * dx);
                    if (w >= 1) {
                        //pixel too far
                        continue;
                    }
                    //hermite filter
                    weight = 2 * w * w * w - 3 * w * w + 1;
                    var pos_x = 4 * (xx + yy * imageData.width);
                    //alpha
                    gx_a += weight * data[pos_x + 3];
                    weights_alpha += weight;
                    //colors
                    if (data[pos_x + 3] < 255)
                        weight = weight * data[pos_x + 3] / 250;
                    gx_r += weight * data[pos_x];
                    gx_g += weight * data[pos_x + 1];
                    gx_b += weight * data[pos_x + 2];
                    weights += weight;
                }
            }
            data2[x2] = gx_r / weights;
            data2[x2 + 1] = gx_g / weights;
            data2[x2 + 2] = gx_b / weights;
            data2[x2 + 3] = gx_a / weights_alpha;
        }
    }
    return imageData2;
}

function desaturate(imageData, type) {
    if (type == 'average') {
        for (var cp = 0; cp < imageData.data.length; cp+=4) {
            imageData.data[cp] = imageData.data[cp + 1] = imageData.data[cp + 2] = (imageData.data[cp] + imageData.data[cp+1] + imageData.data[cp+2] + 1) / 3;
        }
    } else if (type == 'luminosity') {
        for (var cp = 0; cp < imageData.data.length; cp+=4) {
            imageData.data[cp] = imageData.data[cp+1] = imageData.data[cp+2] = getLuminance(imageData.data[cp], imageData.data[cp+1], imageData.data[cp+2]);
        }
    } else {
        for (var cp = 0; cp < imageData.data.length; cp+=4) {
            var m = Math.min(Math.min(imageData.data[cp], imageData.data[cp+1]), imageData.data[cp+2]);
            var M = Math.max(Math.max(imageData.data[cp], imageData.data[cp+1]), imageData.data[cp+2]);
            imageData.data[cp] = imageData.data[cp + 1] = imageData.data[cp + 2] = (M + m) / 2;
        }
    }
    return imageData;
}

function posterize(imageData, n) {
    var lookupTable = new Uint8Array(256);
    var colorSize = 256 / (n - 1);
    var stepSize = 256 / n;

    for (var level = 0; level < n; level++) {
      for (var step = 0; step < stepSize; step++) {
        var indx = Math.round(level * stepSize + step);
        if (level === n - 1) {
          lookupTable[indx] = 255;
          continue;
        }
        lookupTable[indx] = level * colorSize;
      }
    }
    
    for (var cp = 0; cp < imageData.data.length; cp+=4) {
        imageData.data[cp] = lookupTable[imageData.data[cp]];
        imageData.data[cp+1] = lookupTable[imageData.data[cp+1]];
        imageData.data[cp+2] = lookupTable[imageData.data[cp+2]];
    }
    return imageData;
}

var colorBalanceParams = {
    midtones: {
        cyan_red: 0,
        magenta_green: 0,
        yellow_blue: 0
    },
    shadows: {
        cyan_red: 0,
        magenta_green: 0,
        yellow_blue: 0
    },
    highlights: {
        cyan_red: 0,
        magenta_green: 0,
        yellow_blue: 0
    },
    preserve_luminosity: false
};

function colorBalance(imageData, params) {
    var CLAMP = function (a, b, c) {
        if (a < b) a = b;
        if (a > c) a = c;
        return a;
    };
    var CLAMP0255 = function (a) {
        return CLAMP(a,0,255);
    };
    var _rgb_to_hsl_int = function (t) {
        var u = tRGBToHSL(t.r_n, t.g_n, t.b_n);
        t.r_n = u.h;
        t.g_n = u.s;
        t.b_n = u.l;
    };
    var _rgb_to_l_int = function (p) {
        var u = tRGBToHSL(p.r, p.g, p.b);
        return u.l;
    };
    var _hsl_to_rgb_int = function (t) {
        var u = tHSLToRGB(t.r_n, t.g_n, t.b_n);
        t.r_n = u.r;
        t.g_n = u.g;
        t.b_n = u.b;
    };
    var highlights = [];
    var midtones = [];
    var shadows = [];
    for (var i = 0; i < 256; i++) {
        var a = 64, b = 85, scale = 1.785;
        var low = CLAMP ((i - b) / -a + 0.5, 0, 1) * scale;
        var mid = CLAMP ((i - b) /  a + 0.5, 0, 1) * CLAMP ((i + b - 255) / -a + 0.5, 0, 1) * scale;
        shadows[i]          = low;
        midtones[i]         = mid;
        highlights[255 - i] = low;
    }
    var rlut = [];
    var glut = [];
    var blut = [];
    var temp = {
        r_n:0,
        g_n:0,
        b_n:0
    };
    for (var i = 0; i < 256; i++) {
      temp.r_n = i;
      temp.g_n = i;
      temp.b_n = i;

      temp.r_n += params.shadows.cyan_red * shadows[i];
      temp.r_n += params.midtones.cyan_red * midtones[i];
      temp.r_n += params.highlights.cyan_red * highlights[i];
      temp.r_n = CLAMP0255(temp.r_n);

      temp.g_n += params.shadows.magenta_green * shadows[i];
      temp.g_n += params.midtones.magenta_green * midtones[i];
      temp.g_n += params.highlights.magenta_green * highlights[i];
      temp.g_n = CLAMP0255(temp.g_n);

      temp.b_n += params.shadows.yellow_blue * shadows[i];
      temp.b_n += params.midtones.yellow_blue * midtones[i];
      temp.b_n += params.highlights.yellow_blue * highlights[i];
      temp.b_n = CLAMP0255(temp.b_n);

      rlut[i] = temp.r_n;
      glut[i] = temp.g_n;
      blut[i] = temp.b_n;
    }
    var pix = {
        r:0,
        g:0,
        b:0
    };
    for (var cp = 0; cp < imageData.data.length; cp+=4) {
        pix.r = imageData.data[cp];
        pix.g = imageData.data[cp+1];
        pix.b = imageData.data[cp+2];
        temp.r_n = rlut[pix.r];
        temp.g_n = glut[pix.g];
        temp.b_n = blut[pix.b];
        if (params.preserve_luminosity) {
            _rgb_to_hsl_int(temp);
            temp.b_n = _rgb_to_l_int(pix);
            _hsl_to_rgb_int(temp);
        }
        imageData.data[cp] = temp.r_n;
        imageData.data[cp+1] = temp.g_n;
        imageData.data[cp+2] = temp.b_n;
    }
    return imageData;
}

var channelMixerParams = {
  red: {
    red_gain: 0.0,
    green_gain: 0.0,
    blue_gain: 0.0
  },
  green: {
    red_gain: 0.0,
    green_gain: 0.0,
    blue_gain: 0.0
  },
  blue: {
    red_gain: 0.0,
    green_gain: 0.0,
    blue_gain: 0.0
  },
  black: {
    red_gain: 0.0,
    green_gain: 0.0,
    blue_gain: 0.0
  },
  monochrome: false,
  preserve_luminosity: false
};

function channelMixerCalculateNorm(params, channel) {
    var sum = params[channel].red_gain + params[channel].green_gain + params[channel].blue_gain;
    if (sum === 0.0 || ! params.preserve_luminosity) return 1.0;
    return Math.abs(1/sum);
}

function channelMixerMixPixel(ch, r, g, b, norm) {
    var c = ch.red_gain * r + ch.green_gain * g + ch.blue_gain * b;
    c *= norm;
    if (c > 255) c = 255;
    if (c < 0) c = 0;
    return c;
}

function channelMixer(imageData, params) {
    var red_norm, green_norm, blue_norm, black_norm;
    red_norm = channelMixerCalculateNorm(params, 'red');
    green_norm = channelMixerCalculateNorm(params, 'green');
    blue_norm = channelMixerCalculateNorm(params, 'blue');
    black_norm = channelMixerCalculateNorm(params, 'black');
    for (var cp = 0; cp < imageData.data.length; cp+=4) {
        if (params.monochrome) {
            imageData.data[cp] = imageData.data[cp + 1] = imageData.data[cp + 2] = channelMixerMixPixel(params.black, imageData.data[cp], imageData.data[cp + 1], imageData.data[cp + 2], black_norm);
        } else {
            imageData.data[cp] = channelMixerMixPixel(params.red, imageData.data[cp], imageData.data[cp + 1], imageData.data[cp + 2], red_norm);
            imageData.data[cp+1] = channelMixerMixPixel(params.green, imageData.data[cp], imageData.data[cp + 1], imageData.data[cp + 2], green_norm);
            imageData.data[cp+2] = channelMixerMixPixel(params.blue, imageData.data[cp], imageData.data[cp + 1], imageData.data[cp + 2], blue_norm);
        }
    }
    return imageData;
}

function tRGBToHSL(r, g, b) {
    var Max, Min, Delta, h, s, l;
    r = r / 255;
    g = g / 255;
    b = b / 255;
    Max = Math.max(Math.max(r, g), b);
    Min = Math.min(Math.min(r, g), b);
    l = (Max + Min) / 2;
    if (Max == Min) {
        s = 0;
        h = 0;
    } else {
        Delta = Max - Min;
        if (l <= 0.5 ) s = Delta / (Max + Min);
        else s = Delta / (2 - Max - Min);
        if (r == Max) h = (g - b) / Delta;
        else if (g == Max) h = 2 + (b - r) / Delta;
        else if (b == Max) h = 4 + (r - g) / Delta;
    }
    return {h: h, s: s, l: l};
}

function tHSLToRGB(h, s, l) {
    var Min, Max, r, g, b;
    if (h > 5) h = h - 6;

    if (s === 0) {
        r = l;
        g = l;
        b = l;
    } else {
        if (l <= 0.5) Min = l * (1 - s);
        else Min = l - s * (1 - l);

        Max = 2 * l - Min;
        if (h < 1)  {
            r = Max;
            if (h < 0)  {
                g = Min;
                b = g - h * (Max - Min);
            } else {
                b = Min;
                g = h * (Max - Min) + b;
            }
        } else if (h < 3) {
            g = Max;
            if (h < 2) {
                b = Min;
                r = b - (h - 2) * (Max - Min);
            } else {
                r = Min;
                b = (h - 2) * (Max - Min) + r;
            }
        } else {
            b = Max;
            if (h < 4) {
                r = Min;
                g = r - (h - 4) * (Max - Min);
            } else {
                g = Min;
                r = (h - 4) * (Max - Min) + g;
            }
        }

    }
    r *= 255;
    g *= 255;
    b *= 255;
    if (r > 255) r = 255;
    if (g > 255) g = 255;
    if (b > 255) b = 255;
    return {r: r, g: g, b: b};
}

function hueSaturation(imageData, h, s, l, colorize) {
    
    var hsl;
    var _v = ['r', 'g', 'b'];
    var rgb = {};
    
    h = parseFloat(h) / 60.0;
    if (colorize) h = h + 3;
    s = (parseFloat(s) + 100.0) / 100.0;
    l = parseFloat(l) / 100.0;

    for (var cp = 0; cp < imageData.data.length; cp+=4) {
        for (var i = 0; i < 3; i++) rgb[_v[i]] = imageData.data[cp + i];
        
        hsl = tRGBToHSL(rgb.r, rgb.g, rgb.b);
        
        hsl.h = hsl.h + h;
        if (hsl.h > 5) hsl.h = hsl.h - 6;
        if (hsl.h < -1) hsl.h = hsl.h + 6;
        
        hsl.s = hsl.s * s;
        if (hsl.s < 0) hsl.s = 0;
        if (hsl.s > 1) hsl.s = 1;
        
        hsl.l = hsl.l + l;
        if (hsl.l < 0) hsl.l = 0;
        if (hsl.l > 1) hsl.l = 1;
        
        if (colorize) {
            rgb = tHSLToRGB(h, s, hsl.l);
        } else rgb = tHSLToRGB(hsl.h, hsl.s, hsl.l);
        
        for (var i = 0; i < 3; i++) imageData.data[cp + i] = rgb[_v[i]];
    }
    return imageData;
}

function photofilter(imageData, density, rgb, lumin, blendmode) {
    var _getLuminance = function (r, g, b) {
        return (Math.max(Math.max(r,g),b) + Math.min(Math.min(r,g),b)) / 2;
    };
    var mixRatio = density / 100;
    var ol = 0;
    for (var i = 0; i < imageData.data.length; i+=4) {
        var _rgb = [imageData.data[i],imageData.data[i+1],imageData.data[i+2]];
        if (lumin) ol = _getLuminance(_rgb[0], _rgb[1], _rgb[2]) / 255;
        
        if (blendmode == 'multiply') {
            // Multiply
            for(var j = 0; j < rgb.length; j++) {
                _rgb[j] = ((rgb[j]/255 * _rgb[j]/255) * 255 * mixRatio) + (_rgb[j]*(1-mixRatio));
            }
        } else if (blendmode == 'overlay') {
            // Overlay
            for(var j = 0; j < rgb.length; j++) {
                var target = _rgb[j]/255;
                var blend = rgb[j]/255;
                if (target > 0.5) {
                    target = (1 - (1 - 2 * (target - 0.5)) * (1 - blend));
                } else {
                    target = (( 2 * target) * blend);
                }
                _rgb[j] = ((1 - mixRatio) * _rgb[j]) + (mixRatio * (target*255));
            }
        } else if (blendmode == 'screen') {
            for(var j = 0; j < rgb.length; j++) {
                var res = 255 - (255 - _rgb[j]) * (255 - rgb[j]);
                _rgb[j] = ((1 - mixRatio) * _rgb[j]) + (mixRatio * res);
            }
        } else {
            // Normal
            for(var j = 0; j < rgb.length; j++) {
                _rgb[j] = ((1 - mixRatio) * _rgb[j]) + (mixRatio * rgb[j]);
            }
        }
        if (lumin) {
            var hsl = tRGBToHSL(_rgb[0], _rgb[1], _rgb[2]);
            var __rgb = tHSLToRGB(hsl.h, hsl.s, ol);
            imageData.data[i] = __rgb.r;
            imageData.data[i+1] = __rgb.g;
            imageData.data[i+2] = __rgb.b;
        } else {
            imageData.data[i] = _rgb[0];
            imageData.data[i+1] = _rgb[1];
            imageData.data[i+2] = _rgb[2];
        }
    }
    return imageData;
}

/*
 * The weights to compute true CIE luminance from linear red, green
 * and blue, as defined by the ITU-R Recommendation BT.709, "Basic
 * Parameter Values for the HDTV Standard for the Studio and for
 * International Programme Exchange" (1990). Also suggested in the
 * sRGB colorspace specification by the W3C.
 */
function getLuminance(r, g, b) {
    return Math.round(r * 0.2126 + g * 0.7152 + b * 0.0722);
// old    return Math.round(r * 0.299 + g * 0.587 + b * 0.114);
}

function grayScale(imageData) {
    for (var cp = 0; cp < imageData.data.length; cp+=4) {
        imageData.data[cp] = imageData.data[cp+1] = imageData.data[cp+2] = getLuminance(imageData.data[cp], imageData.data[cp+1], imageData.data[cp+2]);
    }
    return imageData;
}

function invert(imageData) {
    for (var cp = 0; cp < imageData.data.length; cp+=4) {
        imageData.data[cp] = 255 - imageData.data[cp];
        imageData.data[cp + 1] = 255 - imageData.data[cp + 1];
        imageData.data[cp + 2] = 255 - imageData.data[cp + 2];
    }
    return imageData;
}

function brightnessContrast(imageData, bri, con) {
    for (var cp = 0; cp < imageData.data.length; cp+=4) {
        imageData.data[cp] = Math.round((((imageData.data[cp] / 255) - 0.5) * con + bri + 0.5)*255);
        imageData.data[cp + 1] = Math.round((((imageData.data[cp + 1] / 255) - 0.5) * con + bri + 0.5)*255);
        imageData.data[cp + 2] = Math.round((((imageData.data[cp + 2] / 255) - 0.5) * con + bri + 0.5)*255);
    }
    return imageData;
}

function histoStats(hist, _vmin, _vmax) {
    if (typeof _vmin === 'undefined') _vmin = 0;
    if (typeof _vmax === 'undefined') _vmax = 255;
    var vmin = _vmin;
    var vmax = _vmax;
    if (_vmin > _vmax) {
        vmax = _vmin;
        vmin = _vmax;
    }
    var stats = {level: vmin+'…'+vmax};
    if (vmax === vmin) stats.level = vmin;
    var total = 0;
    var count = 0;
    for (var i = 0; i < hist.length; i++) {
        if (i >= vmin && i <= vmax) {
            count += hist[i];
        }
        total += hist[i];
    }
    stats.count = count;
    stats.percentil = (count/total*100).toFixed(1)+'%';
    var mean = 0;
    for (var i = vmin; i <= vmax; i++) mean += hist[i] * i;
    mean = mean / count;
    stats.mean = mean.toFixed(1);
    var sum = 0;
    for (var i = vmin; i <= vmax; i++) {
        sum += hist[i];
        if (sum * 2 > count) {
            stats.median = i;
            break;
        }
    }
    var dev = 0;
    for (var i = vmin; i <= vmax; i++) {
        dev += hist[i] * Math.pow(i - mean, 2);
    }
    stats.sigma = (Math.sqrt(dev/count)).toFixed(1);
    stats.begin = vmin;
    stats.end = vmax;
    return stats;
}

function cumulateRGBHistograms(hist) {
    if (hist.length !== 3) return;
    var h = [];
    for (var i = 0; i < 256; i++) {
        h[i] = hist[0][i] + hist[1][i] + hist[2][i];
    }
    return h;
}

/* Channel = 0 Red, 1 Green, 2 Blue, 3 Alpha 
   example for RGB channellist = [0,1,2] */
function histogram_array(imageData, channellist) {
    if (typeof channellist === 'undefined') {
        channellist = [0, 1, 2];
    }
    if (channellist.length <= 0) return [];
    var hist = [];
    for(var j = 0; j < channellist.length; j++) {
        hist[channellist[j]] = [];
        for(var i = 0; i < 256; i++) hist[channellist[j]][i] = 0;
    }
    for (var cp = 0; cp < imageData.data.length; cp+=4) {
        for(var j = 0; j < channellist.length; j++) {
            var h = channellist[j];
            hist[h][imageData.data[cp + h]]++;
        }
    }
    return hist;
}

function histogram(imageData, histCanvas) {
    var copy = copyImageData(imageData);
    copy.context.putImageData(grayScale(copy.imageData), 0, 0);
    var hist = (histogram_array(copy.imageData, [0]))[0];
    
    if (typeof histCanvas !== 'undefined') {
        var histctx = histCanvas.getContext("2d");
        histctx.beginPath();
        histctx.lineWidth = 0;
        histctx.fillStyle = 'white';
        histctx.rect(0, 0, 256, 100);
        histctx.fill();
        histctx.beginPath();
        histctx.lineWidth = 1;
        histctx.strokeStyle='black';
    
        // Max
        var _max = 0;
        var lhist = [];
        for (var i = 0; i < 256; i++) {
            lhist[i] = Math.log(hist[i]);
            _max = Math.max(_max, lhist[i]);
        }
    
        for (var i = 0; i < 256; i++) {
            histctx.moveTo(i+0.5, 99.5);
            histctx.lineTo(i+0.5, Math.round(100 - lhist[i]/_max*100)+0.5);
            histctx.stroke();
        }
    }
    return hist;
}

function rgb_histogram(hist, names, colors, rgbname, loga) {

    var canvas = $(rgbname).get(0);
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'screen';
    ctx.beginPath();
    ctx.lineWidth = 0;
    ctx.fillStyle = 'black';
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fill();

    // Max
    var _max = 0;
    var lhist = [];
    for (var k = 0; k < hist.length; k++) {
        lhist[k] = [];
        for (var i = 0; i < 256; i++) {
            if (loga === true) lhist[k][i] = Math.log(hist[k][i]);
            else lhist[k][i] = hist[k][i];
            _max = Math.max(_max, lhist[k][i]);
        }
    }

    for (var k = 0; k < hist.length; k++) {
        var histCanvas = $(names[k]).get(0);
        var histctx = histCanvas.getContext("2d");
        histctx.clearRect(0, 0, histCanvas.width, histCanvas.height);
        histctx.beginPath();
        histctx.lineWidth = 0;
        histctx.fillStyle = 'rgba(255,255,255,0)';
        histctx.rect(0, 0, histCanvas.width, histCanvas.height);
        histctx.fill();
        histctx.beginPath();
        histctx.lineWidth = 1;
        histctx.strokeStyle=colors[k];
        ctx.strokeStyle=colors[k];

        var __max = 0;
        for (var i = 0; i < 256; i++) {
            __max = Math.max(__max, lhist[k][i]);
        }

        ctx.beginPath();
        ctx.lineWidth = 1;
        for (var i = 0; i < 256; i++) {
            histctx.beginPath();
            histctx.moveTo(i+0.5, 100);
            histctx.lineTo(i+0.5, Math.round(100 - lhist[k][i]/__max*100));
            histctx.stroke();
            ctx.beginPath();
            ctx.moveTo(i+0.5, 100);
            ctx.lineTo(i+0.5, Math.round(100 - lhist[k][i]/_max*100));
            ctx.stroke();
        }
    }

    var imageData = ctx.getImageData(0,0,canvas.width, canvas.height);
    for (var j = 0; j < imageData.data.length; j+=4) {
        if (imageData.data[j] === 0 && imageData.data[j + 1] === 0 && imageData.data[j + 2] === 0) {
            imageData.data[j] = 255;
            imageData.data[j + 1] = 255;
            imageData.data[j + 2] = 255;
            imageData.data[j + 3] = 0;
        } else if (imageData.data[j] >= 127 && imageData.data[j + 1] >= 127 && imageData.data[j + 2] >= 127) {
            imageData.data[j] = 127;
            imageData.data[j + 1] = 127;
            imageData.data[j + 2] = 127;
        }
    }
    ctx.putImageData(imageData, 0, 0);
}

/* Uses the complementary hulling technique from Crimmins. */
function despeckle(imageData) {
    var dirs = [
        function(im, i, w) {
            return {a: im.data[i - 4*w], b: im.data[i], c: im.data[i + 4*w]};
        },
        function (im, i, w) {
            return {a: im.data[i - 4], b: im.data[i], c: im.data[i + 4]};
        },
        function (im, i, w) {
            return {a: im.data[i - 4*w - 4], b: im.data[i], c: im.data[i + 4*w + 4]};
        },
        function (im, i, w) {
            return {a: im.data[i - 4*w + 4], b: im.data[i], c: im.data[i + 4*w - 4]};
        }
    ];
    var darkadjustprocs = [
        function (im, i, d) {
            if (d.a >= d.b + 2) im.data[i]++;
        },
        function (im, i, d) {
            if (d.a > d.b && d.b <= d.c) im.data[i]++;
        },
        function (im, i, d) {
            if (d.c > d.b && d.b <= d.a) im.data[i]++;
        },
        function (im, i, d) {
            if (d.c >= d.b + 2) im.data[i]++;
        }
    ];
    var lightadjustprocs = [
        function (im, i, d) {
            if (d.a <= d.b - 2) im.data[i]--;
        },
        function (im, i, d) {
            if (d.a < d.b && d.b >= d.c) im.data[i]--;
        },
        function (im, i, d) {
            if (d.c < d.b && d.b >= d.a) im.data[i]--;
        },
        function (im, i, d) {
            if (d.c <= d.b - 2) im.data[i]--;
        }
    ];
    var dst = copyImageData(imageData);
    for (var channel = 0; channel < 3; channel++) {
        $.each(dirs, function (nd, dir) {
            $.each(darkadjustprocs, function (na, adj) {
                for (var cp = channel; cp < dst.imageData.data.length; cp+=4) {
                    adj(dst.imageData, cp, dir(dst.imageData, cp, dst.imageData.width));
                }
            });
        });
        $.each(dirs, function (nd, dir) {
            $.each(lightadjustprocs, function (na, adj) {
                for (var cp = channel; cp < dst.imageData.data.length; cp+=4) {
                    adj(dst.imageData, cp, dir(dst.imageData, cp, dst.imageData.width));
                }
            });
        });
    }
    return dst.imageData;
}

function process(imageData, callback, options, withalpha) {
    if (typeof options === 'undefined') options = {};
    if (typeof withalpha === 'undefined') withalpha = false;
    var dst = copyImageData(imageData);
    for (var x = 0; x < imageData.width; x++) {
        for (var y = 0; y < imageData.height; y++) {
            var index = (y * imageData.width + x) * 4;
            var processed = callback(
                                imageData.data[index],
                                imageData.data[index+1],
                                imageData.data[index+2], 
                                imageData.data[index+3], options, x, y, index);
            dst.imageData.data[index]   = processed[0];
            dst.imageData.data[index+1] = processed[1];
            dst.imageData.data[index+2] = processed[2];
            if (withalpha) dst.imageData.data[index+3] = processed[3];
        }
    }
    return dst.imageData;
}

function convolution(imageData, options) {
    options = $.extend({}, {
        updateR: true,
        updateG: true,
        updateB: true,
        offset: 0,
        filter: [1]
    }, options);

    var filter = options.filter;

    var rows = filter.length;
    var cols = filter[0].length;

    var rm = Math.floor(rows/2);
    var cm = Math.floor(cols/2);

    return process(
        imageData,
        function (r, g, b, a, options, x, y, i) {

            var nR = options.updateR ? 0 : imageData.data[i  ],
                nG = options.updateG ? 0 : imageData.data[i+1],
                nB = options.updateB ? 0 : imageData.data[i+2]
            ;

            for(var row = 0; row < rows; row++) {
                var rd = Math.abs(row-rm);
                var ri = (row < rm ? -rd : (row > rm ? +rd : 0));
    
                var nY = Math.max(Math.min(y+ri, imageData.height-1), 0);
    
                for(var col = 0; col < cols; col++) {
                    var cd = Math.abs(col-cm);
                    var ci = (col < cm ? -cd : (col > cm ? +cd : 0));
    
                    var nX = Math.max(Math.min(x+ci, imageData.width-1), 0);
                    var nI = 4*(nY * imageData.width + nX);
    
                    if(options.updateR) { nR += (filter[row][col] * imageData.data[nI  ]); }
                    if(options.updateG) { nG += (filter[row][col] * imageData.data[nI+1]); }
                    if(options.updateB) { nB += (filter[row][col] * imageData.data[nI+2]); }
                }
            }
            return [options.offset + nR, options.offset + nG, options.offset + nB, a];
    }, options);
}

function noise(imageData, amount) {
    if (typeof amount === 'undefined') amount = 30;
    return process(imageData, function (r, g, b, a, options) {
        return [
            r + (0.5 - Math.random()) * options.amount,
            g + (0.5 - Math.random()) * options.amount,
            b + (0.5 - Math.random()) * options.amount,
            a
        ];
    }, {amount: amount});
}

function embossMediumGray(imageData, offset) {
    if (typeof offset === 'undefined') offset = 127;
    return convolution(imageData, {
                offset: offset,
                filter: [
                    [2,  0,  0],
                    [0, -1,  0],
                    [0,  0, -1]
                ]
            });
}

function emboss(imageData, offset) {
    if (typeof offset === 'undefined') offset = 0;
    return convolution(imageData, {
                offset: offset,
                filter: [
                    [-2,  -1,  0],
                    [-1, 1,  1],
                    [0,  1, 2]
                ]
            });
}

function blur(imageData) {
    return convolution(imageData, {filter:[
                [0, 0.125, 0],
                [0.125, 0.5, 0.125],
                [0, 0.125, 0]
            ]});
}

function blurMore(imageData) {
    return convolution(imageData, {filter:[
                [0.1, 0.1, 0.1],
                [0.1, 0.2, 0.1],
                [0.1, 0.1, 0.1]
            ]});
}

function sharpen(imageData) {
    return convolution(imageData, {filter: [
                    [ 0, -1,  0],
                    [-1,  5, -1],
                    [ 0, -1,  0]
                ]});
}

function boxBlur(imageData, radius) {
    if (typeof radius === 'undefined') radius = 3;
    
    var len = radius * radius;
    var val = 1 / len;
    var filter = [];

    for(var r = 0; r < radius; r++) {
        var row = [];
        for(var c = 0; c < radius; c++) {
            row.push(val);
        }
        filter.push(row);
    }
    
    return convolution(imageData, {
                radius: radius,
                filter: filter
            });
}

function gaussianBlur(imageData, radius) {
    if (typeof radius === 'undefined') radius = 3;
    
    var _gaussian = function(x, mu, sigma) {
        return Math.exp( -(((x-mu)/(sigma))*((x-mu)/(sigma)))/2.0 );
    };
    
    var size = 2*radius+1;
    var sigma = radius/2;
    var sum = 0.0; // For accumulating the filter values
    var filter = [];
    for (var x = 0; x < size; ++x) {
        var row = [];
        for (var y = 0; y < size; ++y) {
            var col = _gaussian(x, radius, sigma) * _gaussian(y, radius, sigma);
            row.push(col);
            sum += col;
        }
        filter.push(row);
    }

    // Normalize the filter
    for (var x2 = 0; x2 < size; ++x2) {
        for (var y2 = 0; y2 < size; ++y2) {
            filter[x2][y2] /= sum;
        }
    }
    
    return convolution(imageData, {
                radius: radius,
                filter: filter
            });
}

function unsharpMask(imageData, radius, amount, threshold) {
    var src = copyImageData(imageData);
    var dst = copyImageData(imageData);
    src.imageData = Filters.gaussianBlur(src.imageData, radius);

    for (var y = 0; y < src.imageData.height; y++) {
        for (var x = 0; x < src.imageData.width; x++) {
            var index = (y * imageData.width + x) * 4;
            for (var v = 0; v < 3; v++) {
                var diff = dst.imageData.data[index + v] - src.imageData.data[index + v];
                
                if (Math.abs (2 * diff) < threshold) diff = 0;
          
                var value = dst.imageData.data[index + v] + amount * diff;
                dst.imageData.data[index + v] = value;
            }
        }
    }
    return dst.imageData;
}

function diffGauss(imageData, radius1, radius2, normalize, invert) {
    var src1 = copyImageData(imageData);
    var src2 = copyImageData(imageData);
    var dst = copyImageData(imageData);
    var maxval = 0;
    if (radius1 > 0) src1.imageData = Filters.gaussianBlur(src1.imageData, radius1);
    if (radius2 > 0) src2.imageData = Filters.gaussianBlur(src2.imageData, radius2);

    for (var y = 0; y < imageData.height; y++) {
        for (var x = 0; x < imageData.width; x++) {
            var index = (y * imageData.width + x) * 4;
            for (var v = 0; v < 3; v++) {
                dst.imageData.data[index + v] = src1.imageData.data[index + v] - src2.imageData.data[index + v];
                if (normalize) maxval = Math.max(maxval, dst.imageData.data[index + v]);
            }
        }
    }
    var factor = 1.0;
    if (normalize && maxval != 0) {
        factor = 255.0 / maxval;
    }
    if (normalize || invert) {
        for (var cp = 0; cp < dst.imageData.data.length; cp+=4) {
            if (normalize) {
                dst.imageData.data[cp] = factor * dst.imageData.data[cp];
                dst.imageData.data[cp+1] = factor * dst.imageData.data[cp+1];
                dst.imageData.data[cp+2] = factor * dst.imageData.data[cp+2];
            }
            if (invert) {
                dst.imageData.data[cp] = 255 - dst.imageData.data[cp];
                dst.imageData.data[cp+1] = 255 - dst.imageData.data[cp+1];
                dst.imageData.data[cp+2] = 255 - dst.imageData.data[cp+2];
            }
        }
    }

    return dst.imageData;
}

var bayerThresholdMap = [
  [  15, 135,  45, 165 ],
  [ 195,  75, 225, 105 ],
  [  60, 180,  30, 150 ],
  [ 240, 120, 210,  90 ]
];

var bayer8ThresholdMap = [
[3, 147, 39, 183, 12, 156, 48, 192],
[99, 51, 135, 87, 108, 60, 144, 96],
[27, 171, 15, 159, 36, 180, 24, 168],
[123, 75, 111, 63, 132, 84, 120, 72],
[9, 153, 45, 189, 6, 150, 42, 186],
[105, 57, 141, 93, 102, 54, 138, 90],
[33, 177, 21, 165, 30, 174, 18, 162],
[129, 81, 117, 69, 126, 78, 114, 66]
];

function monochrome(imageData, threshold, type) {
  if (typeof threshold == 'undefined') threshold = 127;
  else {
      if (threshold > 255) threshold = 255;
      else if (threshold < 0) threshold = 0;
  }

  // Greyscale luminance (sets r pixels to luminance of rgb)
  for (var i = 0; i < imageData.data.length; i += 4) {
    imageData.data[i] = getLuminance(imageData.data[i], imageData.data[i+1], imageData.data[i+2]);
  }

  var w = imageData.width;
  var newPixel, err;

  for (var cp = 0; cp < imageData.data.length; cp+=4) {

    if (type == 'bayer') {
      // 4x4 Bayer ordered dithering algorithm
      var x = cp/4 % w;
      var y = Math.floor(cp / 4 / w);
      var map = Math.floor( (imageData.data[cp] + bayerThresholdMap[x%4][y%4]) / 2 );
      imageData.data[cp] = (map < threshold) ? 0 : 255;
    } else if (type == 'bayer8') {
      // 8x8 Bayer ordered dithering algorithm
      var x = cp/4 % w;
      var y = Math.floor(cp / 4 / w);
      var map = Math.floor( (imageData.data[cp] + bayer8ThresholdMap[x%8][y%8]) / 2 );
      imageData.data[cp] = (map < threshold) ? 0 : 255;
    } else if (type == 'falsefloydsteinberg') {
      // Floyd–Steinberg dithering algorithm
      newPixel = imageData.data[cp] <= threshold ? 0 : 255;
      err = Math.floor((imageData.data[cp] - newPixel) / 8);
      imageData.data[cp] = newPixel;

      imageData.data[cp       + 4 ] += err*3;
      imageData.data[cp + 4*w     ] += err*3;
      imageData.data[cp + 4*w + 4 ] += err*2;
    } else if (type == 'floydsteinberg') {
      // Floyd–Steinberg dithering algorithm
      newPixel = imageData.data[cp] <= threshold ? 0 : 255;
      err = Math.floor((imageData.data[cp] - newPixel) / 16);
      imageData.data[cp] = newPixel;

      imageData.data[cp       + 4 ] += err*7;
      imageData.data[cp + 4*w - 4 ] += err*3;
      imageData.data[cp + 4*w     ] += err*5;
      imageData.data[cp + 4*w + 4 ] += err;
    } else if (type == 'atkinson') {
      // Bill Atkinson's dithering algorithm
      newPixel = imageData.data[cp] <= threshold ? 0 : 255;
      err = Math.floor((imageData.data[cp] - newPixel) / 8);
      imageData.data[cp] = newPixel;
      imageData.data[cp       + 4 ] += err;
      imageData.data[cp       + 8 ] += err;
      imageData.data[cp + 4*w - 4 ] += err;
      imageData.data[cp + 4*w     ] += err;
      imageData.data[cp + 4*w + 4 ] += err;
      imageData.data[cp + 8*w     ] += err;
    } else if (type == 'sierra') {
      newPixel = imageData.data[cp] <= threshold ? 0 : 255;
      err = Math.floor((imageData.data[cp] - newPixel) / 32);
      imageData.data[cp] = newPixel;
      imageData.data[cp       + 4 ] += err*5;
      imageData.data[cp       + 8 ] += err*3;
      imageData.data[cp + 4*w - 8 ] += err*2;
      imageData.data[cp + 4*w - 4 ] += err*4;
      imageData.data[cp + 4*w     ] += err*5;
      imageData.data[cp + 4*w + 4 ] += err*4;
      imageData.data[cp + 4*w + 8 ] += err*2;
      imageData.data[cp + 8*w - 4 ] += err*2;
      imageData.data[cp + 8*w     ] += err*3;
      imageData.data[cp + 8*w + 4 ] += err*2;
    } else if (type == 'sierra2row') {
      newPixel = imageData.data[cp] <= threshold ? 0 : 255;
      err = Math.floor((imageData.data[cp] - newPixel) / 16);
      imageData.data[cp] = newPixel;
      imageData.data[cp       + 4 ] += err*4;
      imageData.data[cp       + 8 ] += err*3;
      imageData.data[cp + 4*w - 8 ] += err;
      imageData.data[cp + 4*w - 4 ] += err*2;
      imageData.data[cp + 4*w     ] += err*3;
      imageData.data[cp + 4*w + 4 ] += err*2;
      imageData.data[cp + 4*w + 8 ] += err;
    } else if (type == 'sierralite') {
      newPixel = imageData.data[cp] <= threshold ? 0 : 255;
      err = Math.floor((imageData.data[cp] - newPixel) / 4);
      imageData.data[cp] = newPixel;
      imageData.data[cp       + 4 ] += err*2;
      imageData.data[cp + 4*w - 4 ] += err;
      imageData.data[cp + 4*w     ] += err;
    } else if (type == 'stucki') {
      newPixel = imageData.data[cp] <= threshold ? 0 : 255;
      err = Math.floor((imageData.data[cp] - newPixel) / 42);
      imageData.data[cp] = newPixel;
      imageData.data[cp       + 4 ] += err*8;
      imageData.data[cp       + 8 ] += err*4;
      imageData.data[cp + 4*w - 8 ] += err*2;
      imageData.data[cp + 4*w - 4 ] += err*4;
      imageData.data[cp + 4*w     ] += err*8;
      imageData.data[cp + 4*w + 4 ] += err*4;
      imageData.data[cp + 4*w + 8 ] += err*2;
      imageData.data[cp + 8*w - 8 ] += err;
      imageData.data[cp + 8*w - 4 ] += err*2;
      imageData.data[cp + 8*w     ] += err*4;
      imageData.data[cp + 8*w + 4 ] += err*2;
      imageData.data[cp + 8*w + 8 ] += err;
    } else if (type == 'jarvisjudiceninke') {
      newPixel = imageData.data[cp] <= threshold ? 0 : 255;
      err = Math.floor((imageData.data[cp] - newPixel) / 48);
      imageData.data[cp] = newPixel;
      imageData.data[cp       + 4 ] += err*7;
      imageData.data[cp       + 8 ] += err*5;
      imageData.data[cp + 4*w - 8 ] += err*3;
      imageData.data[cp + 4*w - 4 ] += err*5;
      imageData.data[cp + 4*w     ] += err*7;
      imageData.data[cp + 4*w + 4 ] += err*5;
      imageData.data[cp + 4*w + 8 ] += err*3;
      imageData.data[cp + 8*w - 8 ] += err;
      imageData.data[cp + 8*w - 4 ] += err*3;
      imageData.data[cp + 8*w     ] += err*5;
      imageData.data[cp + 8*w + 4 ] += err*3;
      imageData.data[cp + 8*w + 8 ] += err;
    } else if (type == 'burkes') {
      newPixel = imageData.data[cp] <= threshold ? 0 : 255;
      err = Math.floor((imageData.data[cp] - newPixel) / 32);
      imageData.data[cp] = newPixel;
      imageData.data[cp       + 4 ] += err*8;
      imageData.data[cp       + 8 ] += err*4;
      imageData.data[cp + 4*w - 8 ] += err*2;
      imageData.data[cp + 4*w - 4 ] += err*4;
      imageData.data[cp + 4*w     ] += err*8;
      imageData.data[cp + 4*w + 4 ] += err*4;
      imageData.data[cp + 4*w + 8 ] += err*2;
    } else {
      // No dithering
      imageData.data[cp] = imageData.data[cp] < threshold ? 0 : 255;
    }

    // Set g and b pixels equal to r
    imageData.data[cp + 1] = imageData.data[cp + 2] = imageData.data[cp];
  }

  return imageData;
}

/* pure javascript bilinear image interpolation
Philippe Strauss, philou at philou.ch, Jan 2012 */

function ivect(ix, iy, w) {
    // byte array, r,g,b,a
    return((ix + w * iy) * 4);
}

function bilinear(srcImg, width, height) {
    var dst = newImageData(width, height);
    var destImg = dst.imageData;
    var scaleX = width / srcImg.width;
    var scaleY = height / srcImg.height;
    // c.f.: wikipedia english article on bilinear interpolation
    // taking the unit square, the inner loop looks like this
    // note: there's a function call inside the double loop to this one
    // maybe a performance killer, optimize this whole code as you need
    function inner(f00, f10, f01, f11, x, y) {
        var un_x = 1.0 - x; var un_y = 1.0 - y;
        return (f00 * un_x * un_y + f10 * x * un_y + f01 * un_x * y + f11 * x * y);
    }
    var i, j;
    var iyv, iy0, iy1, ixv, ix0, ix1;
    var idxD, idxS00, idxS10, idxS01, idxS11;
    var dx, dy;
    var r, g, b, a;
    for (i = 0; i < destImg.height; ++i) {
        iyv = i / scaleY;
        iy0 = Math.floor(iyv);
        // Math.ceil can go over bounds
        iy1 = ( Math.ceil(iyv) > (srcImg.height-1) ? (srcImg.height-1) : Math.ceil(iyv) );
        for (j = 0; j < destImg.width; ++j) {
            ixv = j / scaleX;
            ix0 = Math.floor(ixv);
            // Math.ceil can go over bounds
            ix1 = ( Math.ceil(ixv) > (srcImg.width-1) ? (srcImg.width-1) : Math.ceil(ixv) );
            idxD = ivect(j, i, destImg.width);
            // matrix to vector indices
            idxS00 = ivect(ix0, iy0, srcImg.width);
            idxS10 = ivect(ix1, iy0, srcImg.width);
            idxS01 = ivect(ix0, iy1, srcImg.width);
            idxS11 = ivect(ix1, iy1, srcImg.width);
            // overall coordinates to unit square
            dx = ixv - ix0; dy = iyv - iy0;
            // I let the r, g, b, a on purpose for debugging
            r = inner(srcImg.data[idxS00], srcImg.data[idxS10],
                srcImg.data[idxS01], srcImg.data[idxS11], dx, dy);
            destImg.data[idxD] = r;

            g = inner(srcImg.data[idxS00+1], srcImg.data[idxS10+1],
                srcImg.data[idxS01+1], srcImg.data[idxS11+1], dx, dy);
            destImg.data[idxD+1] = g;

            b = inner(srcImg.data[idxS00+2], srcImg.data[idxS10+2],
                srcImg.data[idxS01+2], srcImg.data[idxS11+2], dx, dy);
            destImg.data[idxD+2] = b;

            a = inner(srcImg.data[idxS00+3], srcImg.data[idxS10+3],
                srcImg.data[idxS01+3], srcImg.data[idxS11+3], dx, dy);
            destImg.data[idxD+3] = a;
        }
    }
    return destImg;
}

var BicubicInterpolation = (function(){
    return function(x, y, values){
        var i0, i1, i2, i3;

        i0 = TERP(x, values[0][0], values[1][0], values[2][0], values[3][0]);
        i1 = TERP(x, values[0][1], values[1][1], values[2][1], values[3][1]);
        i2 = TERP(x, values[0][2], values[1][2], values[2][2], values[3][2]);
        i3 = TERP(x, values[0][3], values[1][3], values[2][3], values[3][3]);
        return TERP(y, i0, i1, i2, i3);
    };
    /* Yay, hoisting! */
    function TERP(t, a, b, c, d){
        return 0.5 * (c - a + (2.0*a - 5.0*b + 4.0*c - d + (3.0*(b - c) + d - a)*t)*t)*t + b;
    }
})();


function bicubic(srcImg, width, height) {
    var dst = newImageData(width, height);
    var destImg = dst.imageData;
    var scaleX = width / srcImg.width;
    var scaleY = height / srcImg.height;
    var i, j;
    var dx, dy;
    var repeatX, repeatY;
    var offset_row0, offset_row1, offset_row2, offset_row3;
    var offset_col0, offset_col1, offset_col2, offset_col3;
    var red_pixels, green_pixels, blue_pixels, alpha_pixels;
    for (i = 0; i < destImg.height; ++i) {
        var iyv = i / scaleY;
        var iy0 = Math.floor(iyv);

        // We have to special-case the pixels along the border and repeat their values if neccessary
        repeatY = 0;
        if(iy0 < 1) repeatY = -1;
        else if(iy0 > srcImg.height - 3) repeatY = iy0 - (srcImg.height - 3);

        for (j = 0; j < destImg.width; ++j) {
            var ixv = j / scaleX;
            var ix0 = Math.floor(ixv);

            // We have to special-case the pixels along the border and repeat their values if neccessary
            repeatX = 0;
            if(ix0 < 1) repeatX = -1;
            else if(ix0 > srcImg.width - 3) repeatX = ix0 - (srcImg.width - 3);

            offset_row1 = ((iy0)   * srcImg.width + ix0) * 4;
            offset_row0 = repeatY < 0 ? offset_row1 : ((iy0-1) * srcImg.width + ix0) * 4;
            offset_row2 = repeatY > 1 ? offset_row1 : ((iy0+1) * srcImg.width + ix0) * 4;
            offset_row3 = repeatY > 0 ? offset_row2 : ((iy0+2) * srcImg.width + ix0) * 4;

            offset_col1 = 0;
            offset_col0 = repeatX < 0 ? offset_col1 : -4;
            offset_col2 = repeatX > 1 ? offset_col1 : 4;
            offset_col3 = repeatX > 0 ? offset_col2 : 8;

            //Each offset is for the start of a row's red pixels
            red_pixels = [[srcImg.data[offset_row0+offset_col0], srcImg.data[offset_row1+offset_col0], srcImg.data[offset_row2+offset_col0], srcImg.data[offset_row3+offset_col0]],
                              [srcImg.data[offset_row0+offset_col1], srcImg.data[offset_row1+offset_col1], srcImg.data[offset_row2+offset_col1], srcImg.data[offset_row3+offset_col1]],
                              [srcImg.data[offset_row0+offset_col2], srcImg.data[offset_row1+offset_col2], srcImg.data[offset_row2+offset_col2], srcImg.data[offset_row3+offset_col2]],
                              [srcImg.data[offset_row0+offset_col3], srcImg.data[offset_row1+offset_col3], srcImg.data[offset_row2+offset_col3], srcImg.data[offset_row3+offset_col3]]];
            offset_row0++;
            offset_row1++;
            offset_row2++;
            offset_row3++;
            //Each offset is for the start of a row's green pixels
            green_pixels = [[srcImg.data[offset_row0+offset_col0], srcImg.data[offset_row1+offset_col0], srcImg.data[offset_row2+offset_col0], srcImg.data[offset_row3+offset_col0]],
                              [srcImg.data[offset_row0+offset_col1], srcImg.data[offset_row1+offset_col1], srcImg.data[offset_row2+offset_col1], srcImg.data[offset_row3+offset_col1]],
                              [srcImg.data[offset_row0+offset_col2], srcImg.data[offset_row1+offset_col2], srcImg.data[offset_row2+offset_col2], srcImg.data[offset_row3+offset_col2]],
                              [srcImg.data[offset_row0+offset_col3], srcImg.data[offset_row1+offset_col3], srcImg.data[offset_row2+offset_col3], srcImg.data[offset_row3+offset_col3]]];
            offset_row0++;
            offset_row1++;
            offset_row2++;
            offset_row3++;
            //Each offset is for the start of a row's blue pixels
            blue_pixels = [[srcImg.data[offset_row0+offset_col0], srcImg.data[offset_row1+offset_col0], srcImg.data[offset_row2+offset_col0], srcImg.data[offset_row3+offset_col0]],
                              [srcImg.data[offset_row0+offset_col1], srcImg.data[offset_row1+offset_col1], srcImg.data[offset_row2+offset_col1], srcImg.data[offset_row3+offset_col1]],
                              [srcImg.data[offset_row0+offset_col2], srcImg.data[offset_row1+offset_col2], srcImg.data[offset_row2+offset_col2], srcImg.data[offset_row3+offset_col2]],
                              [srcImg.data[offset_row0+offset_col3], srcImg.data[offset_row1+offset_col3], srcImg.data[offset_row2+offset_col3], srcImg.data[offset_row3+offset_col3]]];
            offset_row0++;
            offset_row1++;
            offset_row2++;
            offset_row3++;
            //Each offset is for the start of a row's alpha pixels
            alpha_pixels =[[srcImg.data[offset_row0+offset_col0], srcImg.data[offset_row1+offset_col0], srcImg.data[offset_row2+offset_col0], srcImg.data[offset_row3+offset_col0]],
                              [srcImg.data[offset_row0+offset_col1], srcImg.data[offset_row1+offset_col1], srcImg.data[offset_row2+offset_col1], srcImg.data[offset_row3+offset_col1]],
                              [srcImg.data[offset_row0+offset_col2], srcImg.data[offset_row1+offset_col2], srcImg.data[offset_row2+offset_col2], srcImg.data[offset_row3+offset_col2]],
                              [srcImg.data[offset_row0+offset_col3], srcImg.data[offset_row1+offset_col3], srcImg.data[offset_row2+offset_col3], srcImg.data[offset_row3+offset_col3]]];

            // overall coordinates to unit square
            dx = ixv - ix0; dy = iyv - iy0;

            var idxD = ivect(j, i, destImg.width);

            destImg.data[idxD] = BicubicInterpolation(dx, dy, red_pixels);

            destImg.data[idxD+1] =  BicubicInterpolation(dx, dy, green_pixels);

            destImg.data[idxD+2] = BicubicInterpolation(dx, dy, blue_pixels);

            destImg.data[idxD+3] = BicubicInterpolation(dx, dy, alpha_pixels);
        }
    }
    return destImg;
}

function nearestNeighbor(srcImageData, width, height) {
    var srcPixels    = srcImageData.data,
        srcWidth     = srcImageData.width,
        srcHeight    = srcImageData.height,
        srcLength    = srcPixels.length;
        var dst = newImageData(width, height);
        var dstImageData = dst.imageData;
        var dstPixels    = dstImageData.data;

    var xFactor = srcWidth / width,
        yFactor = srcHeight / height,
        dstIndex = 0, srcIndex,
        x, y, offset;

    for (y = 0; y < height; y += 1) {
        offset = ((y * yFactor) | 0) * srcWidth;

        for (x = 0; x < width; x += 1) {
            srcIndex = (offset + x * xFactor) << 2;

            dstPixels[dstIndex]     = srcPixels[srcIndex];
            dstPixels[dstIndex + 1] = srcPixels[srcIndex + 1];
            dstPixels[dstIndex + 2] = srcPixels[srcIndex + 2];
            dstPixels[dstIndex + 3] = srcPixels[srcIndex + 3];
            dstIndex += 4;
        }
    }

    return dstImageData;
}

function lanczos(srcImg, dW, dH, lanczosLobes) {
    if (typeof lanczosLobes === 'undefined') lanczosLobes = 3;
    var oW = srcImg.width;
    var oH = srcImg.height;
    var dst = newImageData(dW, dH);

  function lanczosCreate(lobes) {
    return function(x) {
      if (x > lobes) {
        return 0;
      }
      x *= Math.PI;
      if (Math.abs(x) < 1e-16) {
        return 1;
      }
      var xx = x / lobes;
      return Math.sin(x) * Math.sin(xx) / x / xx;
    };
  }

  function process(u) {
    var v, i, weight, idx, a, red, green,
        blue, alpha, fX, fY;
    center.x = (u + 0.5) * ratioX;
    icenter.x = Math.floor(center.x);
    for (v = 0; v < dH; v++) {
      center.y = (v + 0.5) * ratioY;
      icenter.y = Math.floor(center.y);
      a = 0; red = 0; green = 0; blue = 0; alpha = 0;
      for (i = icenter.x - range2X; i <= icenter.x + range2X; i++) {
        if (i < 0 || i >= oW) {
          continue;
        }
        fX = Math.floor(1000 * Math.abs(i - center.x));
        if (!cacheLanc[fX]) {
          cacheLanc[fX] = { };
        }
        for (var j = icenter.y - range2Y; j <= icenter.y + range2Y; j++) {
          if (j < 0 || j >= oH) {
            continue;
          }
          fY = Math.floor(1000 * Math.abs(j - center.y));
          if (!cacheLanc[fX][fY]) {
            cacheLanc[fX][fY] = lanczos(Math.sqrt(Math.pow(fX * rcpRatioX, 2) + Math.pow(fY * rcpRatioY, 2)) / 1000);
          }
          weight = cacheLanc[fX][fY];
          if (weight > 0) {
            idx = (j * oW + i) * 4;
            a += weight;
            red += weight * srcData[idx];
            green += weight * srcData[idx + 1];
            blue += weight * srcData[idx + 2];
            alpha += weight * srcData[idx + 3];
          }
        }
      }
      idx = (v * dW + u) * 4;
      destData[idx] = red / a;
      destData[idx + 1] = green / a;
      destData[idx + 2] = blue / a;
      destData[idx + 3] = alpha / a;
    }

    if (++u < dW) {
      return process(u);
    }
    else {
      return destImg;
    }
  }

  
  var scaleX = dW / oW;
  var scaleY = dH / oH;
  var rcpScaleX = 1 / scaleX;
  var rcpScaleY = 1 / scaleY;
  
  
  var destImg = dst.imageData;
  var srcData = srcImg.data;
  var destData = destImg.data;
  var lanczos = lanczosCreate(lanczosLobes),
      ratioX = rcpScaleX, ratioY = rcpScaleY,
      rcpRatioX = 2 / rcpScaleX, rcpRatioY = 2 / rcpScaleY,
      range2X = Math.ceil(ratioX * lanczosLobes / 2),
      range2Y = Math.ceil(ratioY * lanczosLobes / 2),
      cacheLanc = { }, center = { }, icenter = { };

  return process(0);
}

function lanczosWeird(imageData, width, height, lobes) {
    var d = newImageData(width, height);
    var r = imageData.width / width;
	var obj = {
		src:imageData,
		dst:d.imageData,
		lanczos:function(x) {
			if (x > lobes) return 0;
			x *= Math.PI;
			if (Math.abs(x) < 1e-16) return 1;
			var xx = x / lobes;
			return Math.sin(x) * Math.sin(xx) / x / xx;
		},
		ratio:r,
		rcp_ratio:2 / r,
		range2:Math.ceil(r * lobes / 2),
		cacheLanc:{},
		center:{},
		icenter:{},
		process:function(self, u) {
			self.center.x = (u + 0.5) * self.ratio;
			self.icenter.x = Math.floor(self.center.x);
			for (var v = 0; v < self.dst.height; v++) {
				self.center.y = (v + 0.5) * self.ratio;
				self.icenter.y = Math.floor(self.center.y);
				var a=0, r=0, g=0, b=0, z=0;
				for (var i = self.icenter.x - self.range2; i <= self.icenter.x + self.range2; i++) {
					if (i < 0 || i >= self.src.width) continue;
					var f_x = Math.floor(1000 * Math.abs(i - self.center.x));
					if (!self.cacheLanc[f_x]) self.cacheLanc[f_x] = {};
					for (var j = self.icenter.y - self.range2; j <= self.icenter.y + self.range2; j++) {
						if (j < 0 || j >= self.src.height) continue;
						var f_y = Math.floor(1000 * Math.abs(j - self.center.y));
						if (typeof self.cacheLanc[f_x][f_y] === 'undefined') self.cacheLanc[f_x][f_y] = self.lanczos(Math.sqrt(Math.pow(f_x * self.rcp_ratio, 2) + Math.pow(f_y * self.rcp_ratio, 2)) / 1000);
						z += (self.cacheLanc[f_x][f_y] < 0) ? 0 : self.cacheLanc[f_x][f_y];
						r += (self.cacheLanc[f_x][f_y] < 0) ? 0 : self.cacheLanc[f_x][f_y] * self.src.data[(j * self.src.width + i) * 4];
						g += (self.cacheLanc[f_x][f_y] < 0) ? 0 : self.cacheLanc[f_x][f_y] * self.src.data[(j * self.src.width + i) * 4 + 1];
						b += (self.cacheLanc[f_x][f_y] < 0) ? 0 : self.cacheLanc[f_x][f_y] * self.src.data[(j * self.src.width + i) * 4 + 2];
						a += (self.cacheLanc[f_x][f_y] < 0) ? 0 : self.cacheLanc[f_x][f_y] * self.src.data[(j * self.src.width + i) * 4 + 3];
					}
				}
				self.dst.data[(v * self.dst.width + u) * 4] = r / z;
				self.dst.data[(v * self.dst.width + u) * 4 + 1] = g / z;
				self.dst.data[(v * self.dst.width + u) * 4 + 2] = b / z;
				self.dst.data[(v * self.dst.width + u) * 4 + 3] = a / z;
			}
			if (++u < self.dst.width) return self.process(self, u);
			else return self.dst;
		}
	};
	return obj.process(obj,0);
}

function humanFileSize(bytes, si=true, dp=1) {
    const thresh = si ? 1000 : 1024;
    if (Math.abs(bytes) < thresh) return bytes + ' B';
    const units = si 
      ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] 
      : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
    let u = -1;
    const r = 10**dp;
    do {
      bytes /= thresh;
      ++u;
    } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);
    return bytes.toFixed(dp) + ' ' + units[u];
  }

  function isSupported(format = 'webp') {
    let canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    let ctx = canvas.getContext("2d");
    ctx.fillRect(0, 0, 1, 1);
    let str = canvas.toDataURL('image/'+format);
    const re = new RegExp('^data:image/'+format+';base64,');
    return re.test(str);
}