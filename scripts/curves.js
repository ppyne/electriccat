class CatmullRomCurves {
    constructor(pts) {
        // the curve is generated using uniform knots
        this.p = pts;
        this.m = [];
        // compute the m values
        for (var i = 0; i < pts.length; i++) {
            if (i == 0) {
                this.m.push({ x:0.5 * (pts[i+1].x - pts[i].x), y: 0.5 * (pts[i+1].y - pts[i].y)});
            } else if( i == pts.length - 1 ) {
                this.m.push({x: 0.5 * (pts[i].x - pts[i-1].x), y: 0.5 * (pts[i].y - pts[i-1].y)});
            } else {
                this.m.push({x: 0.5 * (pts[i+1].x - pts[i-1].x), y: 0.5 * (pts[i+1].y - pts[i-1].y)});
            }
        }
    }
    h00(t) {
        return (1 + 2 * t) * ( 1 - t) * (1 - t);
    }
    h10(t) {
        return t * (1-t) * (1-t);
    }
    h01(t) {
        return t * t * (3 - 2 * t);
    }
    h11(t) {
        return t * t * (t - 1);
    }
    getValue(x) {
        var clamp = function (v, lower, upper) {
        	var res = v;
        	res = Math.min(upper, res);
        	res = Math.max(lower, res);
        	return res;
        };
        if (x < this.p[0].x) return this.p[0].y;
        if (x > this.p[this.p.length - 1].x) return this.p[this.p.length - 1].y;
        // find the segment x is in
        for(var i = 0; i < this.p.length - 1; i++) {
            if (x >= this.p[i].x && x <= this.p[i+1].x) {
                // compute the t value using binary search
                var xl, yl, xr, yr;
                xl = this.p[i].x; yl = this.p[i].y;
                xr = this.p[i+1].x; yr = this.p[i+1].y;
                var mxl, myl, mxr, myr;
                mxl = this.m[i].x; myl = this.m[i].y;
                mxr = this.m[i+1].x; myr = this.m[i+1].y;

                var t = 0.5, lt = 0, rt = 1.0;
                var found = false;
                var y = -1;
                while( !found ) {
                    var h00 = this.h00(t), h10 = this.h10(t), h01 = this.h01(t), h11 = this.h11(t);
                    var px = h00 * xl + h10 * mxl + h01 * xr + h11 * mxr;
                    var py = h00 * yl + h10 * myl + h01 * yr + h11 * myr;

                    var THRES = 0.01;
                    if ( Math.abs(px - x) < THRES ) {
                        found = true;
                        y = py;
                    } else {
                        if( x > px ) {
                            lt = t;
                            t = 0.5 * (lt + rt);
                        } else {
                            rt = t;
                            t = 0.5 * (lt + rt);
                        }
                    }
                }
                y = clamp(y, 0, 255);
                return y;
            }
        }
    }
}

class curvestool {
    constructor(where, id, onapply, debug, tabindex) {
        var $this = this;
        if (typeof tabindex === 'undefined') tabindex = '-1';
        if (debug) this.debug = debug;
        else debug = false;
        this.lut = null;
        if (typeof onapply === 'function') this.onApply = onapply;
        else this.onApply = function(lut) {
            //console.log(lut);
            $this.lut = lut;
        };
        this.id =id;
        this.IsDown = false;
        this.width = 171;
        this.height = 171;
        this.points = [[0, this.height], [this.width, 0]];
        this.dragged = null;
        this.selected = this.points[0];
        this.rightline = d3.svg.line();
        this.line = d3.svg.line();
        this.svg = d3.select(where).append('svg')
            .attr('tabindex', tabindex)
            .attr('id', this.id)
            .attr('width', this.width)
            .attr('height', this.height);
        this.svg.append('rect')
            .attr('id', 'rect')
            .attr('class', 'bg')
            .attr('width', this.width)
            .attr('height', this.height)
            .on('mousedown', function (e) { $this.mousedown(e); });
        this.svg.append('path')
            .attr('d', 'M'+0+','+this.points[0][1]+'L'+this.points[0][0]+','+this.points[0][1])
            .attr('class', 'left')
            .on('mousedown', function (e) { $this.mousedown(e); });
        this.svg.append('path')
            .attr('d', 'M'+this.points[this.points.length-1][0]+','+this.points[this.points.length-1][1]+'L'+this.width+','+this.points[this.points.length-1][1])
            .attr('class', 'right')
            .on('mousedown', function (e) { $this.mousedown(e); });
        this.svg.append('path')
            .datum(this.points)
            .attr('class', 'line')
            .on('mousedown', function (e) { $this.mousedown(e); })
            .call(function (e) {$this.redraw(e);});
        $(window).on('mousemove', function (e) {$this.mousemove(e);})
            .on('mouseup', function (e) {$this.mouseup(e);})
            .on('keydown', function (e) {$this.keydown(e);});
        this.line.interpolate('cardinal');
        this.redraw();
        this.apply();
    }
    reset() {
        while(this.points.length > 2) this.points.splice(1, 1);
        this.points[0][0] = 0;
        this.points[0][1] = this.height;
        this.points[1][0] = this.width;
        this.points[1][1] = 0;
        this.selected = null;
        this.redraw();
        this.apply();
    }
    redraw() {
        var $this = this;
        this.svg.select('path.line').attr('d', this.line);
        this.svg.select('path.left').attr('d', 'M'+0+','+this.points[0][1]+'L'+this.points[0][0]+','+this.points[0][1]);
        this.svg.select('path.right').attr('d', 'M'+this.points[this.points.length-1][0]+','+this.points[this.points.length-1][1]+'L'+this.width+','+this.points[this.points.length-1][1]);
        var rect = this.svg.selectAll('.handle')
            .data(this.points, function(d) { return d; });
        rect.enter().append('rect')
            .attr('class', 'handle')
            .attr('width', 5.5)
            .attr('height', 5.5)
            .on('mousedown', function(d) { 
                $this.svg[0][0].focus();
                $this.IsDown = true;
                $this.selected = $this.dragged = d;
                $this.redraw();
            });
        rect.classed('selected', function(d) { return d === $this.selected; })
            .attr('x', function(d) { return d[0]-2.5; })
            .attr('y', function(d) { return d[1]-2.5; });
        rect.exit().remove();
        if (d3.event) {
            d3.event.preventDefault();
            d3.event.stopPropagation();
        }
    }
    sortpoints() {
        this.points.sort(function(a, b) {
            if ( a[0] == b[0] ) return b[1] - a[1];
            else return a[0] - b[0];
        });
    }
    mousedown() {
        this.svg[0][0].focus();
        this.IsDown = true;
        this.points.push(this.selected = this.dragged = d3.mouse(this.svg.node()));
        this.sortpoints();
        this.redraw();
    }
    mousemove(e) {
        if (!this.dragged) return;
        var off = $(this.svg[0][0]).offset();
        var x = e.pageX - off.left;
        var y = e.pageY - off.top;
        this.dragged[0] = Math.max(0, Math.min(this.width, x));
        this.dragged[1] = Math.max(0, Math.min(this.height, y));
        this.sortpoints();
        this.redraw();
    }
    mouseup(e) {
        if (this.IsDown) {
            this.IsDown = false;
            if (!this.dragged) return;
            //this.mousemove();
            this.dragged = null;
            this.apply();
        }
    }
    keydown(e) {
        if ($(e.target).attr('id') === this.id) {
            if (!this.selected || this.points.length < 3) return;
            switch (e.keyCode) {
                case 8: // backspace
                case 46: { // delete
                    var i = this.points.indexOf(this.selected);
                    this.points.splice(i, 1);
                    this.selected = this.points.length ? this.points[i > 0 ? i - 1 : 0] : null;
                    this.redraw();
                    this.apply();
                    break;
                }
            }
        }
    }
    apply() {
        // get the point coordinates using the points in the SVG
        var pts = [];
        for(var i = 0; i < this.points.length; i++) {
            // need to flip y coordinates
            pts.push({x: this.points[i][0], y: 171 - this.points[i][1]});
        }
        var crCurve = new CatmullRomCurves(pts);
        // generate lut using catmull-rom curve
        var lut = [];
        if (this.debug) this.debug.clearRect(0, 0, 256, 256);
        for( var i = 0; i < 256; i++) {
            var v = crCurve.getValue(i*2/3)/2*3;
            lut[i] = Math.round(v);
            if (this.debug) {
                this.debug.beginPath();
                this.debug.moveTo(i,256);
                this.debug.lineTo(i,256-lut[i]);
                this.debug.stroke();
            }
        }
        this.onApply(lut);
    }
}