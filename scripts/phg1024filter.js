// apply filter f to image __src
function applyPhg1024filter(__src, f) {
    var clamp = function(v, lower, upper) {
        var res = v;
        res = Math.min(upper, res);
        res = Math.max(lower, res);
        return res;
    };
    var h = __src.height,
        w = __src.width;
    var dst = copyImageData(__src).imageData;
    var data = dst.data,
        data2 = __src.data;

    var wf = Math.floor(f.width / 2);
    var hf = Math.floor(f.height / 2);
    var bias = f.bias;
    var factor = f.factor;
    var p = f.p;

    if( p && p != 1.0 ) {
        for (var y=0; y < h; y++)
        {
            for (var x=0;x<w;x++)
            {
                var fidx = 0;
                var r = 0, g = 0, b = 0;
                var idx = (y*w+x)*4;
                for (var i=-hf, fi=0;i<=hf;i++,fi++)
                {
                    var py = clamp(i+y,0,h-1);
                    for (var j=-wf, fj=0;j<=wf;j++,fj++)
                    {
                        var px = clamp(j+x,0,w-1);

                        var pidx = (py * w + px) * 4;

                        var weight = f.value[fidx++];

                        r += Math.pow(data2[pidx] * weight, p);
                        g += Math.pow(data2[pidx+1] * weight, p);
                        b += Math.pow(data2[pidx+2] * weight, p);
                    }
                }

                r = clamp(Math.pow(r,1/p)/factor+bias, 0.0, 255.0);
                g = clamp(Math.pow(g,1/p)/factor+bias, 0.0, 255.0);
                b = clamp(Math.pow(b,1/p)/factor+bias, 0.0, 255.0);

                data[idx] = r;
                data[idx+1] = g;
                data[idx+2] = b;
                data[idx+3] = data2[idx+3];
            }
        }
    }
    else {
        // p is undefined or p is 1.0
        // no need to compute the power, which is time consuming
        for (var y = 0; y < h; y++) {
            for (var x = 0; x < w; x++) {
                var fidx = 0;
                var r = 0, g = 0, b = 0;
                var idx = (y * w + x) * 4;
                for (var i = -hf, fi = 0; i <= hf; i++, fi++) {
                    var py = clamp(i + y, 0, h - 1);
                    for (var j = -wf, fj = 0; j <= wf; j++, fj++) {
                        var px = clamp(j + x, 0, w - 1);
                        var pidx = (py * w + px) * 4;
                        var weight = f.value[fidx++];
                        r += data2[pidx] * weight;
                        g += data2[pidx+1] * weight;
                        b += data2[pidx+2] * weight;
                    }
                }

                r = clamp(r / factor + bias, 0.0, 255.0);
                g = clamp(g / factor + bias, 0.0, 255.0);
                b = clamp(b / factor + bias, 0.0, 255.0);

                data[idx] = r;
                data[idx+1] = g;
                data[idx+2] = b;
                data[idx+3] = data2[idx+3];
            }
        }
    }

    return dst;
}

// bilateral filter
function applyPhg1024Bilateral(src, sigmap, sigmaf, size) {
    var clamp = function(v, lower, upper) {
        var res = v;
        res = Math.min(upper, res);
        res = Math.max(lower, res);
        return res;
    };
    var h = src.height,
        w = src.width;
    var dst = copyImageData(src).imageData;
    var data = dst.data,
        data2 = src.data;

    var fp = new Phg1024Filter.blurn(size, sigmap);
    var sigmaf2 = sigmaf * sigmaf * 2;

    var wf = Math.floor(size / 2);
    var hf = Math.floor(size / 2);

    for (var y=0;y<h;y++)
    {
        for (var x=0;x<w;x++)
        {
            var fidx = 0;
            var wsum = 0;
            var r0, g0, b0;
            var idx = (y*w+x)*4;
            var c0 = {r:data2[idx],g:data2[idx+1],b:data2[idx+2]};
            var r0 = c0.r, g0 = c0.g, b0 = c0.b;
            var r, g, b;
            r = g = b = 0;
            
            for (var i=-hf, fi=0;i<=hf;i++,fi++)
            {
                var py = clamp(i+y,0,h-1);
                for (var j=-wf, fj=0;j<=wf;j++,fj++)
                {
                    var px = clamp(j+x,0,w-1);
                    var pidx = (py * w + px) * 4;

                    var weight = fp.value[fidx++];

                    var c = {r:data2[pidx],g:data2[pidx+1],b:data2[pidx+2]};
                    var dr = c.r - r0;
                    var dg = c.g - g0;
                    var db = c.b - b0;

                    weight *= Math.exp(-(dr*dr+dg*dg+db*db)/(sigmaf2));
                    wsum += weight;

                    r += c.r * weight;
                    g += c.g * weight;
                    b += c.b * weight;
                }
            }

            r = clamp((r)/wsum, 0.0, 255.0);
            g = clamp((g)/wsum, 0.0, 255.0);
            b = clamp((b)/wsum, 0.0, 255.0);

            data[idx] = r;
            data[idx+1] = g;
            data[idx+2] = b;
            data[idx+3] = data2[idx+3];
        }
    }
    return dst;
}


function Phg1024Filter( params )
{
    if( params == undefined )
    {
        this.width = 0;
        this.height = 0;
        this.factor = 0;
        this.bias = 0;
        this.p = 1;
        this.value = [];
        return this;
    }
    else
    {
        this.width = params.width;
        this.height = params.height;

        this.value = params.value;

        var weights = 0;
        if( !this.value ) {
            this.value = [];
            var idx = 0;
            for(var i=0;i<this.height;i++)
                for(var j=0;j<this.width;j++, idx++)
                {
                    var val = parseInt(params.weights[i][j]);
                    this.value[idx] = val;
                    weights += val;
                }
        }

        this.p = params.p || 1.0;
        this.bias = parseFloat(params.bias) || 0.0;
        this.factor = parseFloat(params.factor) || weights;
        if( this.factor == 0 ) this.factor = 1;
        return this;
    }
}

Phg1024Filter.prototype.toString = function() {
    var str = '<p>Phg1024Filter Matrix</p><table align=center class="fmtable" cellspacing=0 cellpadding=2>';

    var maxVal = 0, minVal = Number.MAX_VALUE;
    for(var i=0;i<this.value.length;i++) {
        maxVal = Math.max(maxVal, this.value[i]);
        minVal = Math.min(minVal, this.value[i]);
    }

    var diffVal = maxVal - minVal;

    for(var i= 0,idx=0;i<this.height;i++) {
        str += '<tr>';
        for(var j=0;j<this.width;j++,idx++) {
            var ratio = Math.round(((this.value[idx] - minVal) / diffVal)*255.0);
            var c = rgb2hex({r:ratio, g:ratio, b:ratio});
            str += '<td class="fmelem"' + 'bgcolor=#' + c + '>' + this.value[idx].toFixed(2).toString() + '</td>';
        }
        str += '</tr>';
    }
    str += '</table>';
    return str;
}

Phg1024Filter.gradient = function() {
    return new Phg1024Filter({
    width : 3,
    height : 3,
    value : [-1, -1, -1,
        -1, 8, -1,
        -1, -1, -1],
    factor : 1.0,
    bias : 0.0
    });
};

Phg1024Filter.hsobel = function(){
    return new Phg1024Filter({
        width : 3,
            height : 3,
        value : [-1, 0, 1,
        -2, 0, 2,
        -1, 0, 1],
        factor : 1.0,
        bias : 0.0
    });
};

Phg1024Filter.vsobel = function(){
    return new Phg1024Filter({
    width : 3,
    height : 3,
    value : [-1, -2, -1,
        0,  0,  0,
        1,  2,  1],
    factor : 1.0,
    bias : 0.0
    });
};

Phg1024Filter.emboss = function( size, degree ) {

    var val = new Float32Array(size * size);
    var cx = size * 0.5;
    var cy = size * 0.5;

    var theta = degree / 180.0 * Math.PI;

    // line direction
    var v = {
        x: Math.cos(theta),
        y: Math.sin(theta)
    };

    var n = {
        x: -v.y,
        y: v.x
    }

    var THRES = 0.5;
    var weight = 0;
    var N = 8;
    var step = 1.0 / N;
    var step2 = step * step;
    for(var i= 0,idx=0;i<size;i++) {
        var y = cy - 1 - i;
        for(var j=0;j<size;j++,idx++) {
            var x = j - cx;
            // super sampling, make it soft
            var cnt = 0;
            var yy = y + 0.5 * step;
            for(var k=0;k<N;k++) {
                var xx = x + 0.5 * step;
                for(var l=0;l<N;l++) {
                    // compute the distance of point (x, y) to line (0,0) + t * v
                    // the distance is the dot product of vector (x, y) with v
                    cnt += (Math.abs(xx * n.x + yy * n.y) < THRES)?1:0;
                    xx += step;
                }
                yy += step;
            }

            var sign = (x + 0.5) * v.x + (y + 0.5) * v.y;
            sign = (Math.abs(sign) < 1e-6)?1:sign;
            val[idx] = (Math.abs(cnt) < 1e-6) ? 0 : cnt * step2;
            val[idx] *= (1.0 / sign);
            weight += val[idx];
        }
    }

    if( size & 0x1 ) {
        val[(size*size-1) / 2] = 0.0;
    }

    return new Phg1024Filter({
        width : size,
        height : size,
        factor : 1.0,
        bias : 128.0,
        value : val
    });
}

Phg1024Filter.blurn = function( size, sigma ) {

    var val = new Float32Array(size * size);
    // create a gaussian blur Phg1024Filter

    var cx = (size-1) * 0.5;
    var cy = (size-1) * 0.5;
    var r = sigma;

    var weight = 0;

    for(var i= 0,idx=0;i<size;i++) {
        var dy = i - cy;
        for(var j=0;j<size;j++,idx++) {
            var dx = j - cx;
            val[idx] = Math.exp(-(dx*dx + dy*dy) / (2*r*r));
            weight += val[idx];
        }
    }

    return new Phg1024Filter({
        width: size,
        height : size,
        factor : weight,
        bias : 0,
        value : val
    });
};

Phg1024Filter.blur3 = function(){
    return new Phg1024Filter({
        width : 3,
            height : 3,
        factor : 16,
        bias : 0,
        value : [1, 2, 1,
        2, 4, 2,
        1, 2, 1]
    });
};

Phg1024Filter.blur5 = function(){
    return new Phg1024Filter({
    width : 5,
    height : 5,
    factor : 273,
    bias : 0,
    value : [
        1, 4, 7, 4, 1,
        4, 16, 26, 16, 4,
        7, 26, 41, 26, 7,
        4, 16, 26, 16, 4,
        1, 4, 7, 4, 1
    ]
    });
};

Phg1024Filter.blur7 = function(){
    new Phg1024Filter({
        width : 7,
            height : 7,
        factor : 1.0,
        bias : 0,
        value : [
        0.0000, 0.0003, 0.0110, 0.0172, 0.0110, 0.0003, 0.0000,
        0.0003, 0.0245, 0.0354, 0.0354, 0.0354, 0.0245, 0.0003,
        0.0110, 0.0354, 0.0354, 0.0354, 0.0354, 0.0354, 0.0110,
        0.0172, 0.0354, 0.0354, 0.0354, 0.0354, 0.0354, 0.0172,
        0.0110, 0.0354, 0.0354, 0.0354, 0.0354, 0.0354, 0.0110,
        0.0003, 0.0245, 0.0354, 0.0354, 0.0354, 0.0245, 0.0003,
        0.0000, 0.0003, 0.0110, 0.0172, 0.0110, 0.0003, 0.0000
    ]
    });
};

Phg1024Filter.sharpen = function() {
    return new Phg1024Filter({
    width : 5,
    height : 5,
    factor : 10.0,
    bias : 0.0,
    value : [
        0, -1, -2, -1, 0,
        -1, -2, -4, -2, -1,
        -2, -4, 50, -4, -2,
        -1, -2, -4, -2, -1,
        0, -1, -2, -1, 0
    ]});
};

Phg1024Filter.usm = function(size, alpha) {
    // build a gaussian blur kernel
    var usmf = new Phg1024Filter.blurn(size, 0.5 * size);

    // modify the blur kernel with alpha
    for(var i=0;i<usmf.value.length;i++) {
        usmf.value[i] *= (1.0 - alpha);
    }
    usmf.value[(usmf.value.length-1)/2] += alpha * usmf.factor;

    // compute the new weighting factor
    usmf.factor = 0;
    for(var i=0;i<usmf.value.length;i++) {
        usmf.factor += usmf.value[i];
    }

    return usmf;
}

Phg1024Filter.motion = function(size, degree){

    var val = new Float32Array(size * size);
    var cx = size * 0.5;
    var cy = size * 0.5;

    var theta = degree / 180.0 * Math.PI;

    // line direction, normalized
    var v = {
        x: Math.cos(theta),
        y: Math.sin(theta)
    };

    var n = {
        x: -v.y,
        y: v.x
    };

    var N = 8;
    var N2 = N*N;
    var step = 1.0 / N;
    var weight = 0.0;
    var bw = 0.5;

    for(var i= 0,idx=0;i<size;i++) {
        var y = cy - 1 - i;
        for(var j=0;j<size;j++,idx++) {
            // supersampling, make it soft
            var x = j - cx;

            var cnt = 0;
            var yy = y + 0.5 * step;
            for(var ni=0;ni<N;ni++) {
                var xx = x + 0.5 * step;
                for(var nj=0;nj<N;nj++) {
                    // compute the distance of point (x, y) to line (0,0) + t * v
                    // the distance is the dot product of vector (x, y) with n
                    var dist = xx * n.x + yy * n.y;
                    cnt += (Math.abs(dist) <= bw)?1.0:0.0
                    xx += step;
                }
                yy += step;
            }

            val[idx] = cnt / N2;
            weight += val[idx];
        }
    }

    //console.log(val);

    return new Phg1024Filter({
        width : size,
        height : size,
        factor : weight,
        bias : 0.0,
        value : val
    });
};

Phg1024Filter.invert = function(){
    return new Phg1024Filter({
        width : 1,
            height : 1,
        factor : -1,
        bias : 255,
        value : [1.0]
    });
};

Phg1024Filter.erosion = function(size, shape){
    var v = new Float32Array(size*size);

    switch( shape ) {
        case 'square': {
            for(var i=0;i< v.length;i++)
                v[i] = 1.0;
            break;
        }
        case 'round': {
            var r = size * 0.375;
            for(var i= 0, idx=0;i< size;i++)
                for(var j=0;j<size;j++, idx++) {
                    var dy = i - size / 2.0;
                    var dx = j - size / 2.0;
                    if( dx * dx + dy * dy < r * r )
                        v[idx] = 1.0;
                    else
                        v[idx] = 1e4;
                }
            break;
        }
        case 'plus':{
            for(var i= 0, idx=0;i<size;i++) {
                var flagi = ((i>=size/3.0) && (i<size*2.0/3.0));
                for(var j=0;j<size;j++, idx++) {
                    var flagj = ((j>=size/3.0) && (j<size*2.0/3.0));
                    if( flagi || flagj ) {
                        v[idx] = 1.0;
                    }
                    else v[idx] = 1e4;
                }
            }
            break;
        }
        case 'star':{
            var cx = (size-1) * 0.5;
            var cy = (size-1) * 0.5;
            var r = (size-1) * 0.5 * 0.375;
            var s = new Star(cx, cy, r, 5);

            for(var i= 0, idx=0;i<size;i++) {
                for(var j=0;j<size;j++, idx++) {
                    if( s.isInside(j, i) ) {
                        v[idx] = 1.0;
                    }
                    else v[idx] = 1e4;
                }
            }

            break;
        }
    }

    //console.log(v);

    return new Phg1024Filter({
        width : size,
        height: size,
        value : v,
        p : -20,
        factor: 1,
        bias : 0.0
    });
};

Phg1024Filter.dialation = function(size, shape){
    var v = new Float32Array(size*size);
    switch( shape ) {
        case 'square': {
            for(var i=0;i< v.length;i++)
                v[i] = 1.0;
            break;
        }
        case 'round': {
            var r = size * 0.375;
            for(var i= 0, idx=0;i< size;i++)
                for(var j=0;j<size;j++, idx++) {
                    var dy = i - size / 2.0;
                    var dx = j - size / 2.0;
                    if( dx * dx + dy * dy < r * r )
                        v[idx] = 1.0;
                    else
                        v[idx] = 1e-4;
                }
            break;
        }
        case 'plus':{
            for(var i= 0, idx=0;i<size;i++) {
                var flagi = ((i>=size/3.0) && (i<size*2.0/3.0));
                for(var j=0;j<size;j++, idx++) {
                    var flagj = ((j>=size/3.0) && (j<size*2.0/3.0));
                    if( flagi || flagj ) {
                        v[idx] = 1.0;
                    }
                    else v[idx] = 1e-4;
                }
            }
            break;
        }
        case 'star':{
            var cx = (size-1) * 0.5;
            var cy = (size-1) * 0.5;
            var r = (size-1) * 0.5 * 0.375;
            var s = new Star(cx, cy, r, 5);

            for(var i= 0, idx=0;i<size;i++) {
                for(var j=0;j<size;j++, idx++) {
                    if( s.isInside(j, i) ) {
                        v[idx] = 1.0;
                    }
                    else v[idx] = 1e-4;
                }
            }
            break;
        }
    }
    return new Phg1024Filter({
        width : size,
        height: size,
        value : v,
        p : 20,
        factor: 1,
        bias : 0.0
    });
};
