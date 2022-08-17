;(function () {
  /**
    ## ImageData object constructor
    Every return from grafi method is formatted to an ImageData object.
    This constructor is used when `window` is not available.
   */
  function ImageData (pixelData, width, height) {
    this.width = width
    this.height = height
    this.data = pixelData
  }

  /**
    ## formatter
    Internal function used to format pixel data into ImageData object

    ### Parameters
      - pixelData `Uint8ClampedArray`: pixel representation of the image
      - width `Number`: width of the image
      - hight `Number`: height of the image

    ### Example
        formatter(new Uint8ClampedArray[400], 10, 10)
        // ImageData { data: Uint8ClampedArray[400], width: 10, height: 10, }
   */
  function formatter (pixelData, width, height) {
    var colorDepth = pixelData.length / (width * height)

    // Length of pixelData must be multipul of available pixels (width * height).
    // Maximum color depth allowed is 4 (RGBA)
    if (Math.round(colorDepth) !== colorDepth || colorDepth > 4) {
      throw new Error('data and size of the image does now match')
    }

    if (!(pixelData instanceof Uint8ClampedArray)) {
      throw new Error('pixel data passed is not an Uint8ClampedArray')
    }

    // If window is avilable create ImageData using browser API,
    // otherwise call ImageData constructor
    if (typeof window === 'object' && colorDepth === 4) {
      return new window.ImageData(pixelData, width, height)
    }
    return new ImageData(pixelData, width, height)
  }
  /**
    ## convolution method
    Internal method to apply convolution filter
    !!! this method does not return ImageObject

    ### Parameters
      - imageData `Object`: ImageData object
      - option `Object` : Option object

    ### Example
        //code sample goes here
   */
  function convolution (imgData, option) {
    // check options object & set default variables
    option = option || {}
    option.monochrome = option.monochrome || false
    option.divisor = option.divisor || 1
    option.median = option.median || false
    if (!option.filter || !option.radius) {
      throw new Error('Required options missing. filter : ' + option.filter + ', radius: ' + option.radius)
    }

    // Check length of data & avilable pixel size to make sure data is good data
    var pixelSize = imgData.width * imgData.height
    var dataLength = imgData.data.length
    var colorDepth = dataLength / pixelSize
    if (colorDepth !== 4 && colorDepth !== 1) {
      throw new Error('ImageObject has incorrect color depth')
    }
    var newPixelData = new Uint8ClampedArray(pixelSize * (option.monochrome || 4))

    var height = imgData.height
    var width = imgData.width
    var f = option.filter
    var r = option.radius
    var ch, y, x, fy, fx, arr, s, result, i

    // do convolution math for each channel
    for (ch = 0; ch < colorDepth; ch++) {
      for (y = r; y < height - r; y++) {
        for (x = r; x < width - r; x++) {
          i = (x + y * width) * colorDepth + ch
          if (ch === 3) {
            if (colorDepth === 4 && option.monochrome) {
              newPixelData[x + y * width] = imgData.data[x + y * width]
              continue
            }
            newPixelData[i] = imgData.data[i]
            continue
          }

          arr = []
          for (fy = -r; fy < r * 2; fy++) {
            for (fx = -r; fx < r * 2; fx++) {
              arr.push(imgData.data[(x + fx + (y + fy) * width) * colorDepth + ch])
            }
          }

          result = option.median
            ? arr.sort()[Math.floor(arr.length / 2)]
            : arr.map(function (data, index) { return data * f[index]}).reduce(function (p, n) { return p + n }) / option.divisor

          if (colorDepth === 4 && option.monochrome) {
            newPixelData[(x + y * width)] = result
            continue
          }
          newPixelData[i] = result
        }
      }

      for (y = 0; y < height; y++) {
        for (x = 0; x < width; x++) {
          if (colorDepth === 4 && option.monochrome) {
            // copy colors from top & bottom rows
            if (y < r || y > height - (r * 2)) {
              newPixelData[x + y * width] = imgData.data[x + y * width]
              continue
            }
            // copy colors from left and write columns
            if (x < r || x > width - (r * 2)) {
              newPixelData[x + y * width] = imgData.data[x + y * width]
            }
            continue
          }

          i = (x + y * width) * colorDepth + ch
          // copy colors from top & bottom rows
          if (y < r || y > height - (r * 2)) {
            newPixelData[i] = imgData.data[i]
            continue
          }
          // copy colors from left and write columns
          if (x < r || x > width - (r * 2)) {
            newPixelData[i] = imgData.data[i]
          }
        }
      }
    }
    return formatter(newPixelData, imgData.width, imgData.height)
  }
  /**
    ## despeckle method
    Brief description

    ### Parameters
      - imageData `Object`: ImageData object
      - option `Object` : Option object

    ### Example
        //code sample goes here
   */
  function despeckle (imgData, option) {
    // check options object & set default variables
    option = option || {}
    option.monochrome = option.monochrome || false
    option.type = option.type || 'median'

    var types = {
      median: [1, 1, 1, 1, 1, 1, 1, 1, 1],
      mean: [1, 1, 1, 1, 1, 1, 1, 1, 1]
    }
    if (!types[option.type]) {
      throw new Error('Could not find type of filter requested')
    }
    var f = types[option.type]
    return convolution(imgData, {
      filter: f,
      divisor: f.reduce(function (p, n) { return p + n }),
      radius: 1,
      monochrome: option.monochrome,
      median: (option.type === 'median')
    })
  }

  var grafi = {}
  grafi.despeckle = despeckle

  if (typeof module === 'object' && module.exports) {
    module.exports = grafi
  } else {
    this.grafi = grafi
  }
}())
