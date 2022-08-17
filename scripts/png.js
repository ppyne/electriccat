// http://www.libpng.org/pub/png/spec/1.2/PNG-Contents.html
class CPNGChunk {
    constructor(type, littleendian) {
        this.typestr = type;
        this.length = new Array();
        this.type = new Array();
        this.setType(type);
        this.littleEndian = littleendian | false;
        this.data = new Array();
        this.checksum = new Array();
    }
    setLength() {
        this.appendU32([this.totalLength(this.data)], this.length);
    }
    setType(type) {
        this.appendString(type, this.type);
    }
    setChecksum() {
        var table = this.crc32Table();
        var crc = 0 ^ (-1);
        crc = this.crc32(table, crc, this.type);
        crc = this.crc32(table, crc, this.data);
        crc = (crc ^ (-1)) >>> 0;
        //console.log(crc);
        this.appendU32([crc], this.checksum);
    }
    crc32Table() {
        // Init CRC table
        var c;
        var table = [];
        for(var n =0; n < 256; n++){
            c = n;
            for(var k =0; k < 8; k++) {
                c = ((c&1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
            }
            table[n] = c;
        }
        return table;
    }
    crc32(table, crc, src) {
        // Calc CRC
        for(var i = 0; i < src.length; i++) {
            var buffer = src[i].buffer;
            var dv = new DataView(buffer);
            for(var j = 0; j < buffer.byteLength; j++) {
                crc = (crc >>> 8) ^ table[(crc ^ dv.getUint8(j)) & 0xFF];
            }
        }
        return crc;
    }
    appendString(str, dst) {
        var buffer = new Array();
        for (var i = 0; i < str.length; i++) {
            buffer.push(str.charCodeAt(i));
        }
        dst.push(new Uint8Array(buffer));
    }
    append(array, dst) {
        dst.push(new Uint8Array(array));
    }
    appendU32(array, dst) {
        var buffer = new ArrayBuffer(4*array.length);
        for(var i = 0; i < array.length; i++) {
            new DataView(buffer).setUint32(i*4, array[i], this.littleEndian);
        }
        dst.push(new Uint32Array(buffer));
    }
    append32(array, dst) {
        var buffer = new ArrayBuffer(4*array.length);
        for(var i = 0; i < array.length; i++) {
            new DataView(buffer).setInt32(i*4, array[i], this.littleEndian);
        }
        dst.push(new Int32Array(buffer));
    }
    deflateData() {
        //http://nodeca.github.io/pako/#deflate
        // https://github.com/ShyykoSerhiy/canvas-png-compression/blob/master/src/PngWriter.ts
        console.log(this.data);
        this.data[0] = window.pako.deflate(this.data[0], {
            level: 9,
            windowBits: 15,
            chunkSize: 32768,
            strategy: 3
        });
        console.log(this.data);
    }
    totalLength(array) {
        var count = 0;
        for(var i = 0; i < array.length; i++) count += array[i].byteLength;
        return count;
    }
    merge(a, b) {
        var c = a.concat(b);
        return c;
    }
    mergeTyped(a, b) {
        var c = new Int8Array(a.length + b.length);
        c.set(a);
        c.set(b, a.length);
        return c;
    }
    chunk() {
        if (this.typestr == 'IDAT') this.deflateData();
        this.setLength();
        this.setChecksum();
        return this.merge(this.length, this.merge(this.type, this.merge(this.data, this.checksum)));
    }
}

class CPNGImage {
    constructor(littleendian) {
        this.width = 0;
        this.height = 0;
        this.depth = 0;
        this.type = 0;
        this.palcolors = 0;
        this.littleEndian = littleendian | false;
        this.IHDR = new CPNGChunk('IHDR', this.littleEndian);
        this.PLTE = new CPNGChunk('PLTE', this.littleEndian);
        this.IDAT = new CPNGChunk('IDAT', this.littleEndian);
        this.IEND = new CPNGChunk('IEND', this.littleEndian);
    }
/* Color    Allowed    Interpretation
   Type    Bit Depths
   
   0       1,2,4,8,16  Each pixel is a grayscale sample. (no palette)
   
   2       8,16        Each pixel is an R,G,B triple.
   
   3       1,2,4,8     Each pixel is a palette index;
                       a PLTE chunk must appear.
   
   4       8,16        Each pixel is a grayscale sample,
                       followed by an alpha sample. (no palette)
   
   6       8,16        Each pixel is an R,G,B triple,
                       followed by an alpha sample.*/
    header(width, height, depth, type) {
        this.width = width;
        this.height = height;
        this.depth = depth;
        this.type = type;
        this.IHDR.appendU32([width,height], this.IHDR.data);
        this.IHDR.append([depth, type, 0, 0, 0], this.IHDR.data);
    }
    palette(array) {
        this.palcolors = array.length;
        for (var i = 0; i < this.palcolors; i++) this.PLTE.append(array[i], this.PLTE.data);
    }
    data(array) {
        var cols = array[0].length;
        var buffer = [];
        for (var row = 0; row < array.length; row++) {
            buffer.push(0); // each row gets filter type 0.
            for (var col = 0; col < cols; col += 8/this.depth) {
                var byte = 0;
                for (var sub = 0; sub < 8/this.depth; sub++) {
                    byte <<= this.depth;
                    if (col + sub < cols) {
                        byte |= array[row][col+sub];
                    }
                }
                buffer.push(byte);
            }
        }
        this.IHDR.append(buffer, this.IDAT.data);
    }
    blob() {
        var buffer = new Array();
        CPNGChunk.prototype.append([137, 80, 78, 71, 13, 10, 26, 10], buffer);
        buffer = CPNGChunk.prototype.merge(buffer, this.IHDR.chunk());
        if (this.type != 0 && this.type != 4) {
            buffer = CPNGChunk.prototype.merge(buffer, this.PLTE.chunk());
        }
        buffer = CPNGChunk.prototype.merge(buffer, this.IDAT.chunk());
        buffer = CPNGChunk.prototype.merge(buffer, this.IEND.chunk());
        return new Blob(buffer, {type: 'image/png'});
    }
}
