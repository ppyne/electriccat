const IMEnumFilters = ['Default', 'Point', 'Box', 'Triangle', 'Hermite', 'Hanning', 'Hamming', 'Blackman', 'Gaussian', 'Quadratic', 'Cubic', 'Catrom', 'Mitchell', 'Jinc', 'Sinc', 'SincFast', 'Kaiser', 'Welsh', 'Parzen', 'Bohman', 'Bartlett', 'Lagrange', 'Lanczos', 'LanczosSharp', 'Lanczos2', 'Lanczos2Sharp', 'Robidoux', 'RobidouxSharp', 'Cosine', 'Spline', 'LanczosRadius'];

const IMEnumColorspaces = ['Default', 'RGB', 'GRAY', 'Transparent', 'OHTA', 'Lab', 'XYZ', 'YCbCr', 'YCC', 'YIQ', 'YPbPr', 'YUV', 'CMYK', 'sRGB', 'HSB', 'HSL', 'HWB', 'Rec601Luma', 'Rec601YCbCr', 'Rec709Luma', 'Rec709YCbCr', 'Log', 'CMY', 'Luv', 'HCL', 'LCH', 'LMS', 'LCHab', 'LCHuv', 'scRGB', 'HSI', 'HSV', 'HCLp', 'YDbDr', 'xyY', 'LinearGRAY'];

const IMEnumChannels = { 'Red': 0x0001, 'Green': 0x0002, 'Blue': 0x0004, 'RGB': 0x0007, 'Alpha': 0x0008, 'RGBA': 0x000F };

const IMEnumDithers = {
    'None': [false, 'None', 'None'],
    'FloydSteinberg': [false, 'FloydSteinberg', 'FloydSteinberg'],
    'Riemersma': [false, 'Riemersma', 'Riemersma'],
    'threshold': [true, 'threshold', 'Threshold 1x1 (non-dither)'],
    'checks': [true, 'checks', 'Checkerboard 2x1 (dither)'],
    'o2x2': [true, 'o2x2', 'Ordered 2x2 (dispersed)'],
    'o3x3': [true, 'o3x3', 'Ordered 3x3 (dispersed)'],
    'o4x4': [true, 'o4x4', 'Ordered 4x4 (dispersed)'],
    'o8x8': [true, 'o8x8', 'Ordered 8x8 (dispersed)'],
    'h4x4a': [true, 'h4x4a', 'Halftone 4x4 (angled)'],
    'h6x6a': [true, 'h6x6a', 'Halftone 6x6 (angled)'],
    'h8x8a': [true, 'h8x8a', 'Halftone 8x8 (angled)'],
    'h4x4o': [true, 'h4x4o', 'Halftone 4x4 (orthogonal)'],
    'h6x6o': [true, 'h6x6o', 'Halftone 6x6 (orthogonal)'],
    'h8x8o': [true, 'h8x8o', 'Halftone 8x8 (orthogonal)'],
    'h16x16o': [true, 'h16x16o', 'Halftone 16x16 (orthogonal)'],
    'c5x5b': [true, 'c5x5b', 'Circles 5x5 (black)'],
    'c5x5w': [true, 'c5x5w', 'Circles 5x5 (white)'],
    'c6x6b': [true, 'c6x6b', 'Circles 6x6 (black)'],
    'c6x6w': [true, 'c6x6w', 'Circles 6x6 (white)'],
    'c7x7b': [true, 'c7x7b', 'Circles 7x7 (black)'],
    'c7x7w': [true, 'c7x7w', 'Circles 7x7 (white)'],
    'diag5x5': [true, 'diag5x5', 'Simple Diagonal Line Dither'],
    'hlines2x2': [true, 'hlines2x2', 'Horizontal Lines 2x2'],
    'hlines2x2a': [true, 'hlines2x2a', 'Horizontal Lines 2x2 (bounds adjusted)'],
    'hlines12x4': [true, 'hlines12x4', 'Horizontal Lines 12x4'],
};

const IMEnumMorphologies = [
    'Correlate',
    'Convolve',
    'Dilate',
    'Erode',
    'Close',
    'Open',
    'DilateIntensity',
    'ErodeIntensity',
    'CloseIntensity',
    'OpenIntensity',
    'DilateI',
    'ErodeI',
    'CloseI',
    'OpenI',
    'Smooth',
    'EdgeOut',
    'EdgeIn',
    'Edge',
    'TopHat',
    'BottomHat',
    'Hmt',
    'HitNMiss',
    'HitAndMiss',
    'Thinning',
    'Thicken',
    'Distance',
    'IterativeDistance'
];

const IMEnumKernels = {
    Square: [1, 2, 3, 4, 5, 6],
    Diamond: [1, 2, 3, 4, 5, 6],
    Octagon: [1, 2, 3, 4, 5, 6],
    Disk: ['0.5', '1.0', '1.5', '2.0', '2.5', '2.9', '3.5', '3.9', '4.3', '4.5', '5.3', '5.5', '6.3'],
    Plus: [1, 2, 3, 4, 5, 6],
    Cross: [1, 2, 3, 4, 5, 6],
    Ring: ['1', '1.5', '1,1.5', '2', '1,2', '1.5,2', '1,2.5', '1.5,2.5', '1.5,2.9', '2,2.5', '2,3.5', '2.5,3.5', '2.9,3.5', '3,3.5', '3,3.9', '2.5,4.3', '3.5,4.3', '3.9,4.5', '4,4.5', '4.3,4.5', '4.3,5.3', '4.5,5.5', '5.3,6.3'],
    Rectangle: ["2x2", "3x3", "4x2", "4", "7x3", "7x1", "7x1+1+0", "7x1+6+0"],
};

let _IMSetSource = ($selector) => {
    let img = $selector.get(0);
    if (img.width === 0 || img.height === 0) return [false,false];
    let canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    let ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    let imagedata = ctx.getImageData(0, 0, canvas.width, canvas.height);
    FS.writeFile('src.rgba', new Uint8Array(imagedata.data.buffer));
    return [img.width, img.height];
};

let _IMSetDestination = ($selector, width, height) => {
    if (!FS.analyzePath('dst.rgba').exists) return;
    let canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    let context = canvas.getContext('2d');
    context.putImageData(new ImageData(Uint8ClampedArray.from(FS.readFile('dst.rgba')), width, height), 0, 0);
    $selector.attr('src', canvas.toDataURL('image/png'));
};

let _IMGetWEBPDestination = async () => {
    if (!FS.analyzePath('dst.webp').exists) return;
    let data = FS.readFile('dst.webp');
    let blob = new Blob([data], {type: 'image/webp'});
    FS.unlink('dst.webp');
    const base64url = await new Promise((r) => {
        const reader = new FileReader()
        reader.onload = () => r(reader.result);
        reader.readAsDataURL(blob);
    });
    return {
        size: data.length,
        base64url: base64url,
        blob: blob,
        data: data
    };
};

let _IMLoadJson = () => {
    if (!FS.analyzePath('dst.json').exists) return false;
    let bytes = FS.readFile('dst.json');
    let string = new TextDecoder().decode(bytes);
    return JSON.parse(string);
};

let _IMClearFS = () => {
    for (file of ['src.rgba', 'dst.rgba', 'dst.json']) {
        if (FS.analyzePath(file).exists) FS.unlink(file);
    }
};

let IMResize = ($src, width, height, filter, $dst) => {
    const [ swidth, sheight ] = _IMSetSource($src);
    if (swidth === false) return;
    if (swidth == width && sheight == height) $dst.attr('src', $src.attr('src'));
    else { 
        if (filter === 0) {
            if (swidth > width || sheight > height) filter = IMEnumFilters.indexOf('Lanczos');
            else filter = IMEnumFilters.indexOf('Mitchell');
        }
        _IMResize(swidth, sheight, width, height, filter, 1.0);
        _IMSetDestination($dst, width, height);
        _IMClearFS();
    }
};

let IMCmdResize = ($src, width, height, filter, $dst) => {
    const [ swidth, sheight ] = _IMSetSource($src);
    if (swidth === false) return;
    if (swidth == width && sheight == height) $dst.attr('src', $src.attr('src'));
    else { 
        if (filter === 'Default') filter = '';
        _IMCmdResize(swidth, sheight, width, height, filter);
        _IMSetDestination($dst, width, height);
        _IMClearFS();
    }
};

let IMCharcoal = ($src, radius, sigma, $dst) => {
    const [ width, height ] = _IMSetSource($src);
    if (width === false) return;
    _IMCharcoal(width, height, radius, sigma);
    _IMSetDestination($dst, width, height);
    _IMClearFS();
};

let IMSketch = ($src, radius, sigma, angle, $dst) => {
    const [ width, height ] = _IMSetSource($src);
    if (width === false) return;
    _IMSketch(width, height, radius, sigma, angle);
    _IMSetDestination($dst, width, height);
    _IMClearFS();
};

let IMQuantize = ($src, numberColors, colorspace, treedepth, dither, measure_error, $dst) => {
    const [ width, height ] = _IMSetSource($src);
    if (width === false) return;
    _IMQuantize(width, height, numberColors, colorspace, treedepth, dither, measure_error);
    _IMSetDestination($dst, width, height);
    _IMClearFS();
};

let IMPosterize = ($src, levels, $dst) => {
    const [ width, height ] = _IMSetSource($src);
    if (width === false) return;
    _IMPosterize(width, height, levels, true);
    _IMSetDestination($dst, width, height);
    _IMClearFS();
};

let IMListUniqueColors = ($src) => {
    const [ width, height ] = _IMSetSource($src);
    if (width === false) return false;
    _IMListUniqueColors(width, height);
    let json = _IMLoadJson();
    _IMClearFS();
    return json;
};

let IMQuantizeAndListUniqueColors = ($src, numberColors) => {
    const [ width, height ] = _IMSetSource($src);
    if (width === false) return false;
    _IMQuantizeAndListUniqueColors(width, height, numberColors);
    let json = _IMLoadJson();
    _IMClearFS();
    return json;
}

let IMAutoLevel = ($src, $dst, channels = IMEnumChannels.RGB) => {
    const [ width, height ] = _IMSetSource($src);
    if (width === false) return;
    _IMAutoLevel(width, height, channels);
    _IMSetDestination($dst, width, height);
    _IMClearFS();
};

let IMAutoGamma = ($src, $dst, channels = IMEnumChannels.RGB) => {
    const [ width, height ] = _IMSetSource($src);
    if (width === false) return;
    _IMAutoGamma(width, height, channels);
    _IMSetDestination($dst, width, height);
    _IMClearFS();
};

let IMCmdAutoGamma = ($src, $dst) => {
    const [ width, height ] = _IMSetSource($src);
    if (width === false) return;
    _IMCmdAutoGamma(width, height);
    _IMSetDestination($dst, width, height);
    _IMClearFS();
};

let IMContrast = ($src, $dst, increase = true) => {
    const [ width, height ] = _IMSetSource($src);
    if (width === false) return;
    _IMContrast(width, height, increase);
    _IMSetDestination($dst, width, height);
    _IMClearFS();
};

let IMSigmoidalContrast = ($src, decrease, contrast, midPoint, $dst) => {
    const [ width, height ] = _IMSetSource($src);
    if (width === false) return;
    _IMSigmoidalContrast(width, height, decrease, contrast, midPoint);
    _IMSetDestination($dst, width, height);
    _IMClearFS();
};

let IMColors = ($src, numberColors, dither, $dst) => {
    const [ width, height ] = _IMSetSource($src);
    if (width === false) return;
    _IMColors(width, height, numberColors, IMEnumDithers[dither][0], IMEnumDithers[dither][1]);
    _IMSetDestination($dst, width, height);
    _IMClearFS();
};

let IMMorphology = ($src, morphology, params, $dst) => {
    const [ width, height ] = _IMSetSource($src);
    if (width === false) return;
    _IMMorphology(width, height, morphology, params);
    _IMSetDestination($dst, width, height);
    _IMClearFS();
};

let IMExposure = ($src, stops, offset, gamma, $dst) => {
    const [ width, height ] = _IMSetSource($src);
    if (width === false) return;
    _IMExposure(width, height, stops, offset, gamma);
    _IMSetDestination($dst, width, height);
    _IMClearFS();
};

let IMGlow = ($src, amount, softening, $dst) => {
    const [ width, height ] = _IMSetSource($src);
    if (width === false) return;
    _IMGlow(width, height, amount, softening);
    _IMSetDestination($dst, width, height);
    _IMClearFS();
};

let IMSobel = ($src, $dst) => {
    const [ width, height ] = _IMSetSource($src);
    if (width === false) return;
    _IMSobel(width, height);
    _IMSetDestination($dst, width, height);
    _IMClearFS();
};

let IMWatercolor = ($src, smoothing, edge, mixing, contrast, $dst) => {
    const [ width, height ] = _IMSetSource($src);
    if (width === false) return;
    _IMWatercolor(width, height, smoothing, edge, mixing, contrast);
    _IMSetDestination($dst, width, height);
    _IMClearFS();
};

let IMDisperse = ($src, spread, density, curviness, reseed, $dst) => {
    const [ width, height ] = _IMSetSource($src);
    if (width === false) return;
    _IMDisperse(width, height, spread, density, curviness, reseed);
    _IMSetDestination($dst, width, height);
    _IMClearFS();
};

let IMCrystallize = ($src, n, seed, $dst) => {
    const [ width, height ] = _IMSetSource($src);
    if (width === false) return;
    _IMCrystallize(width, height, n, seed);
    _IMSetDestination($dst, width, height);
    _IMClearFS();
};

let IMSoftLight = ($src, intensity, smooth, percent, color, $dst) => {
    const [ width, height ] = _IMSetSource($src);
    if (width === false) return;
    _IMSoftLight(width, height, intensity, smooth, percent, color);
    _IMSetDestination($dst, width, height);
    _IMClearFS();
};

let IMDaveHillEffect = ($src, brightness, contrast, gain, $dst) => {
    const [ width, height ] = _IMSetSource($src);
    if (width === false) return;
    _IMDaveHillEffect(width, height, brightness, contrast, gain);
    _IMSetDestination($dst, width, height);
    _IMClearFS();
};

let IMFrosted = ($src, spread, blur, seed, $dst) => {
    const [ width, height ] = _IMSetSource($src);
    if (width === false) return;
    _IMFrosted(width, height, spread, blur, seed);
    _IMSetDestination($dst, width, height);
    _IMClearFS();
};

let IMLucisArtEffect = ($src, gain, saturation, $dst) => {
    const [ width, height ] = _IMSetSource($src);
    if (width === false) return;
    _IMLucisArtEffect(width, height, gain, saturation);
    _IMSetDestination($dst, width, height);
    _IMClearFS();
};

let IMShadowHighlight = ($src, samount, swidth, sradius, hamount, hwidth, hradius, mamount, camount, bclip, wclip, $dst) => {
    const [ width, height ] = _IMSetSource($src);
    if (width === false) return;
    _IMShadowHighlight(width, height, samount, swidth, sradius, hamount, hwidth, hradius, mamount, camount, bclip, wclip);
    _IMSetDestination($dst, width, height);
    _IMClearFS();
};

let IMUnsaturateHue = ($src, hue, saturation, tolerance, ramping, hcl, $dst) => {
    const [ width, height ] = _IMSetSource($src);
    if (width === false) return;
    _IMUnsaturateHue(width, height, hue, saturation, tolerance, ramping, hcl);
    _IMSetDestination($dst, width, height);
    _IMClearFS();
};

let IMTurbulence = ($src, distort, distx, disty, smooth, separate, $dst, virtualpixel = 'mirror', bgcolor = '#000000') => {
    const [ width, height ] = _IMSetSource($src);
    if (width === false) return;
    _IMTurbulence(width, height, distort, distx, disty, smooth, separate, virtualpixel, bgcolor);
    _IMSetDestination($dst, width, height);
    _IMClearFS();
};

let IMToWebP = async ($src, quality /* 0 to 100 */, lossless, method = 4 /* 0 to 6 */) => {
    const [ width, height ] = _IMSetSource($src);
    if (width === false) return;
    _IMToWebP(width, height, quality, lossless, method);
    return await _IMGetWEBPDestination();
};

let _onIMReady = () => {
    _IMResize = Module.cwrap('_IMResize', null, ['number', 'number', 'number', 'number', 'number', 'number']);
    _IMCmdResize = Module.cwrap('_IMCmdResize', null, ['number', 'number', 'number', 'number', 'string']);
    _IMCharcoal = Module.cwrap('_IMCharcoal', null, ['number', 'number', 'number', 'number']);
    _IMSketch = Module.cwrap('_IMSketch', null, ['number', 'number', 'number', 'number', 'number']);
    _IMQuantize = Module.cwrap('_IMQuantize', null, ['number', 'number', 'number', 'number', 'number', 'number', 'number']);
    _IMPosterize = Module.cwrap('_IMPosterize', null, ['number', 'number', 'number', 'number']);
    _IMListUniqueColors = Module.cwrap('_IMListUniqueColors', null, ['number', 'number']);
    _IMQuantizeAndListUniqueColors = Module.cwrap('_IMQuantizeAndListUniqueColors', null, ['number', 'number', 'number']);
    _IMAutoLevel = Module.cwrap('_IMAutoLevel', null, ['number', 'number', 'number']);
    _IMAutoGamma = Module.cwrap('_IMAutoGamma', null, ['number', 'number', 'number']);
    _IMContrast = Module.cwrap('_IMContrast', null, ['number', 'number', 'number']);
    _IMSigmoidalContrast = Module.cwrap('_IMSigmoidalContrast', null, ['number', 'number', 'number', 'number', 'number']);
    _IMColors = Module.cwrap('_IMColors', null, ['number', 'number', 'number', 'number', 'string']);
    _IMMorphology = Module.cwrap('_IMMorphology', null, ['number', 'number', 'string', 'string']);
    _IMExposure = Module.cwrap('_IMExposure', null, ['number', 'number', 'number', 'number', 'number']);
    _IMGlow = Module.cwrap('_IMGlow', null, ['number', 'number', 'number', 'number']);
    _IMSobel = Module.cwrap('_IMSobel', null, ['number', 'number']);
    _IMWatercolor = Module.cwrap('_IMWatercolor', null, ['number', 'number', 'number', 'number', 'number', 'number']);
    _IMDisperse = Module.cwrap('_IMDisperse', null, ['number', 'number', 'number', 'number', 'number', 'number']);
    _IMCrystallize = Module.cwrap('_IMCrystallize', null, ['number', 'number', 'number', 'number']);
    _IMSoftLight = Module.cwrap('_IMSoftLight', null, ['number', 'number', 'number', 'number', 'number', 'string']);
    _IMDaveHillEffect = Module.cwrap('_IMDaveHillEffect', null, ['number', 'number', 'number', 'number', 'number']);
    _IMFrosted = Module.cwrap('_IMFrosted', null, ['number', 'number', 'number', 'number', 'number']);
    _IMLucisArtEffect = Module.cwrap('_IMLucisArtEffect', null, ['number', 'number', 'number', 'number']);
    _IMCmdAutoGamma = Module.cwrap('_IMCmdAutoGamma', null, ['number', 'number']);
    _IMShadowHighlight = Module.cwrap('_IMShadowHighlight', null, ['number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number']);
    _IMUnsaturateHue = Module.cwrap('_IMUnsaturateHue', null, ['number', 'number', 'number', 'number', 'number', 'number', 'number']);
    _IMTurbulence = Module.cwrap('_IMTurbulence', null, ['number', 'number', 'number', 'number', 'number', 'number', 'number', 'string', 'string']);
    _IMToWebP = Module.cwrap('_IMToWebP', null, ['number', 'number', 'number', 'number']);
};

$(window).on('IMReady', _onIMReady);