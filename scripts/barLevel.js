(function ($) {
    
    function _update(values) {
        if (values.Low) {
            this.Values.Low = parseInt(values.Low, 10);
            if (this.Values.Low < 0) this.Values.Low = 0;
            else if (this.Values.Low > 255) this.Values.Low = 255;
            else if (this.Settings.InputBar && this.Values.Low > this.Values.High) this.Values.Low = this.Values.High;
            this.DraggerLow.css('left', (this.Values.Low + this.Settings.Dragger.Offset.X) + 'px');
            if (this.Settings.InputBar) {
                var delta = (this.Values.High - this.Values.Low) / 2.0;
                var mid = this.Values.Low + delta;
                var tmp   = Math.log10(1.0 / this.Values.Gamma);
                var value = Math.round(mid + delta * tmp) + this.Settings.Dragger.Offset.X;
                this.DraggerGamma.css('left', value + 'px');
                this.GammaPos = value;
            }
            if (typeof this.Settings.onDrag === 'function') {
                var v = this.Values;
                v.Cursor = 'low';
                this.Settings.onDrag(v);
            }
        }
        if (values.High) {
            this.Values.High = parseInt(values.High, 10);
            if (this.Values.High < 0) this.Values.High = 0;
            else if (this.Values.High > 255) this.Values.High = 255;
            else if (this.Settings.InputBar && this.Values.High < this.Values.Low) this.Values.High = this.Values.Low;
            this.DraggerHigh.css('left', (this.Values.High + this.Settings.Dragger.Offset.X) + 'px');
            if (this.Settings.InputBar) {
                var delta = (this.Values.High - this.Values.Low) / 2.0;
                var mid = this.Values.Low + delta;
                var tmp   = Math.log10(1.0 / this.Values.Gamma);
                var value = Math.round(mid + delta * tmp) + this.Settings.Dragger.Offset.X;
                this.DraggerGamma.css('left', value + 'px');
                this.GammaPos = value;
            }
            if (typeof this.Settings.onDrag === 'function') {
                var v = this.Values;
                v.Cursor = 'high';
                this.Settings.onDrag(v);
            }
        }
        if (this.Settings.InputBar && values.Gamma) {
            this.Values.Gamma = Math.floor(parseFloat(values.Gamma)*100)/100;
            if (this.Values.Gamma < 0.1) this.Values.Gamma = 0.1;
            else if (this.Values.Gamma > 10) this.Values.Gamma = 10;
            var delta = (this.Values.High - this.Values.Low) / 2.0;
            var mid = this.Values.Low + delta;
            var tmp   = Math.log10(1.0 / this.Values.Gamma);
            var value = Math.round(mid + delta * tmp) + this.Settings.Dragger.Offset.X;
            this.DraggerGamma.css('left', value + 'px');
            this.GammaPos = value;
            if (typeof this.Settings.onDrag === 'function') {
                var v = this.Values;
                v.Cursor = 'gamma';
                this.Settings.onDrag(v);
            }
        }
    }

    function _reset() {
        this.Values.Low = 0;
        this.DraggerLow.css('left', this.Settings.Dragger.Offset.X + 'px');
        this.Values.High = 255;
        this.DraggerHigh.css('left', (this.Values.High + this.Settings.Dragger.Offset.X) + 'px');
        if (this.Settings.InputBar) {
            this.Values.Gamma = 1;
            this.GammaPos = 127;
            this.DraggerGamma.css('left', (this.GammaPos + this.Settings.Dragger.Offset.X) + 'px');
        }
        if (typeof this.Settings.onDrag === 'function') {
            var v = this.Values;
            v.Cursor = 'reset';
            this.Settings.onDrag(v);
        }
    }

    $.fn.barLevel = function(options) {
        var args = Array.prototype.slice.call(arguments, 1);
        return this.each(function() {
            if (options == 'update') {
                _update.apply(this, args);
            } else if (options == 'reset') {
                _reset.apply(this, args);
            } else if ( typeof options === 'object' || ! options ) {
                this.Settings = {
                    InputBar: false,
                    onDrag: function (pos) {
                        console.log(pos);
                    },
                    Color: 'white',
                    Width: 256, 
                    Height: 10,
                    Margin: '2px 0 0 1px',
                    Dragger: {
                        Images: {
                            Low: 'url(images/cur_low.gif)',
                            High: 'url(images/cur_high.gif)',
                            Gamma: 'url(images/cur_gamma.gif)'
                        },
                        Width: 11,
                        Height: 6,
                        Offset: {
                            X: -5, 
                            Y: 1
                        }
                    }
                };
                this.Settings = $.extend(true, {}, this.Settings, options);
                this.DraggerLow = null;
                this.DraggerHigh = null;
                this.DraggerGamma = null;
                this.LowIsDown = false;
                this.HighIsDown = false;
                this.GammaIsDown = false;
                this.Values = {
                    Low: 0,
                    High: 255
                };
                if (this.Settings.InputBar) this.Values.Gamma = 1.0;
                this.GammaPos = 127;
                this.Offset = 0;
                var self = this;
                var $this = $(self);
                $this.css('position', 'relative');
                $this.css('width', this.Settings.Width+'px');
                $this.css('height', this.Settings.Height+'px');
                $this.css('overflow', 'visible');
                $this.css('margin', this.Settings.Margin);
                $this.css('background-color', this.Settings.Color);
                $this.css('background-repeat', 'repeat-x');
                $this.css('background-image', 'url(images/1blackpx.gif)');
                this.Offset = Math.round($this.offset().left);
                this.DraggerLow = $('<div>');
                this.DraggerLow.css('position', 'absolute');
                this.DraggerLow.css('width', this.Settings.Dragger.Width+'px');
                this.DraggerLow.css('height', this.Settings.Dragger.Height+'px');
                this.DraggerLow.css('left', this.Settings.Dragger.Offset.X+'px');
                this.DraggerLow.css('top', this.Settings.Dragger.Offset.Y+'px');
                this.DraggerLow.css('background-image', this.Settings.Dragger.Images.Low);
                this.DraggerLow.css('cursor', 'pointer');
                $this.append(this.DraggerLow);
                if (this.Settings.InputBar) {
                    this.DraggerGamma = $('<div>');
                    this.DraggerGamma.css('position', 'absolute');
                    this.DraggerGamma.css('width', this.Settings.Dragger.Width+'px');
                    this.DraggerGamma.css('height', this.Settings.Dragger.Height+'px');
                    this.DraggerGamma.css('left', (this.GammaPos + this.Settings.Dragger.Offset.X) + 'px');
                    this.DraggerGamma.css('top', this.Settings.Dragger.Offset.Y+'px');
                    this.DraggerGamma.css('background-image', this.Settings.Dragger.Images.Gamma);
                    this.DraggerGamma.css('cursor', 'pointer');
                    $this.append(this.DraggerGamma);
                }
                this.DraggerHigh = $('<div>');
                this.DraggerHigh.css('position', 'absolute');
                this.DraggerHigh.css('width', this.Settings.Dragger.Width+'px');
                this.DraggerHigh.css('height', this.Settings.Dragger.Height+'px');
                this.DraggerHigh.css('left', (255 + this.Settings.Dragger.Offset.X) + 'px');
                this.DraggerHigh.css('top', this.Settings.Dragger.Offset.Y+'px');
                this.DraggerHigh.css('background-image', this.Settings.Dragger.Images.High);
                this.DraggerHigh.css('cursor', 'pointer');
                $this.append(this.DraggerHigh);
                this.DraggerLow.mousedown(function(evt) {
                    self.Offset = Math.round($this.offset().left);
                    self.LowIsDown = true;
                    $(document).mousemove(function(evt) {
                        if (self.LowIsDown) {
                            var pos = evt.pageX - self.Offset + self.Settings.Dragger.Offset.X;
                            if (self.Settings.InputBar) {
                                if (pos < self.Settings.Dragger.Offset.X) pos = self.Settings.Dragger.Offset.X;
                                else if (pos > self.Values.High + self.Settings.Dragger.Offset.X) pos = self.Values.High + self.Settings.Dragger.Offset.X;
                            } else {
                                if (pos < self.Settings.Dragger.Offset.X) pos = self.Settings.Dragger.Offset.X;
                                else if (pos > self.Settings.Width - 1 + self.Settings.Dragger.Offset.X) pos = self.Settings.Width - 1 + self.Settings.Dragger.Offset.X;
                            }
                            self.DraggerLow.css('left', pos + 'px');
                            self.Values.Low = pos - self.Settings.Dragger.Offset.X;
                            if (self.Settings.InputBar) {
                                var delta = (self.Values.High - self.Values.Low) / 2.0;
                                var mid = self.Values.Low + delta;
                                var tmp   = Math.log10(1.0 / self.Values.Gamma);
                                var value = Math.round(mid + delta * tmp) + self.Settings.Dragger.Offset.X;
                                self.DraggerGamma.css('left', value + 'px');
                                self.GammaPos = value;
                            }
                            if (typeof self.Settings.onDrag === 'function') {
                                var values = self.Values;
                                values.Cursor = 'low';
                                self.Settings.onDrag(values);
                            }
                        }
                    });
                    $(document).mouseup(function() {
                        self.LowIsDown = false;
                        $(document).off('mousemove');
                        $(document).off('mouseup');
                    });
                    return false;
                });
                this.DraggerHigh.mousedown(function(evt) {
                    self.Offset = Math.round($this.offset().left);
                    self.HighIsDown = true;
                    $(document).mousemove(function(evt) {
                        if (self.HighIsDown) {
                            var pos = evt.pageX - self.Offset + self.Settings.Dragger.Offset.X;
                            if (self.Settings.InputBar) {
                                if (pos < self.Values.Low + self.Settings.Dragger.Offset.X) pos =  self.Values.Low + self.Settings.Dragger.Offset.X;
                                else if (pos > self.Settings.Width - 1 + self.Settings.Dragger.Offset.X) pos = self.Settings.Width - 1 + self.Settings.Dragger.Offset.X;
                            } else {
                                if (pos < self.Settings.Dragger.Offset.X) pos = self.Settings.Dragger.Offset.X;
                                else if (pos > self.Settings.Width - 1 + self.Settings.Dragger.Offset.X) pos = self.Settings.Width - 1 + self.Settings.Dragger.Offset.X;
                            }
                            self.DraggerHigh.css('left', pos + 'px');
                            self.Values.High = pos - self.Settings.Dragger.Offset.X;
                            if (self.Settings.InputBar) {
                                var delta = (self.Values.High - self.Values.Low) / 2.0;
                                var mid = self.Values.Low + delta;
                                var tmp   = Math.log10(1.0 / self.Values.Gamma);
                                var value = Math.round(mid + delta * tmp) + self.Settings.Dragger.Offset.X;
                                self.DraggerGamma.css('left', value + 'px');
                                self.GammaPos = value;
                            }
                            if (typeof self.Settings.onDrag === 'function') {
                                var values = self.Values;
                                values.Cursor = 'high';
                                self.Settings.onDrag(values);
                            }
                        }
                    });
                    $(document).mouseup(function() {
                        self.HighIsDown = false;
                        $(document).off('mousemove');
                        $(document).off('mouseup');
                    });
                    return false;
                });
                if (this.Settings.InputBar) {
                    this.DraggerGamma.mousedown(function(evt) {
                        self.Offset = Math.round($this.offset().left);
                        self.GammaIsDown = true;
                        $(document).mousemove(function(evt) {
                            if (self.GammaIsDown) {
                                var pos = evt.pageX - self.Offset + self.Settings.Dragger.Offset.X;
                                if (pos < self.Values.Low + self.Settings.Dragger.Offset.X) pos =  self.Values.Low + self.Settings.Dragger.Offset.X;
                                else if (pos > self.Values.High + self.Settings.Dragger.Offset.X) pos = self.Values.High + self.Settings.Dragger.Offset.X;
                                self.DraggerGamma.css('left', pos + 'px');
                                self.GammaPos = pos - self.Settings.Dragger.Offset.X;
                                var delta = (self.Values.High - self.Values.Low) / 2.0;
                                var mid = self.Values.Low + delta;
                                var tmp = (self.GammaPos - mid) / delta;
                                var value = 1.0 / Math.pow(10, tmp);
                                value = Math.floor(value * 100) / 100.0;
                                self.Values.Gamma = value;
                                
                                if (typeof self.Settings.onDrag === 'function') {
                                    var values = self.Values;
                                    values.Cursor = 'gamma';
                                    self.Settings.onDrag(values);
                                }
                            }
                        });
                        $(document).mouseup(function() {
                            self.GammaIsDown = false;
                            $(document).off('mousemove');
                            $(document).off('mouseup');
                        });
                        return false;
                    });
                }
            }
        });  
    };
}( jQuery ));