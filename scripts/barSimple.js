(function ($) {
    
    function _update(values) {
        var value = values.Value;
        if (this.Settings.Float) {
            value = parseFloat(value, 10);
        } else {
            value = parseInt(value, 10);
        }
        if (isNaN(value)) value = this.Settings.Default;
        if (value > this.Settings.Max) value = this.Settings.Max;
        else if (value < this.Settings.Min) value = this.Settings.Min;
        var pos = Math.round((value - this.Settings.Min) * this.Ratio);
        this.Dragger.css('left', pos + this.Settings.Dragger.Offset.X + 'px');
        if (typeof this.Settings.onDrag == "function") {
            this.Settings.onDrag({Value: value});
        }
    }
    
    function _reset() {
        var pos = Math.round((this.Settings.Default - this.Settings.Min) * this.Ratio);
        this.Dragger.css('left', (pos + this.Settings.Dragger.Offset.X) + 'px');
        if (typeof this.Settings.onDrag == "function") {
            this.Settings.onDrag({Value: this.Settings.Default});
        }
    }

    $.fn.barSimple = function(options) {
        var args = Array.prototype.slice.call(arguments, 1);
        return this.each(function() {
            if (options == 'update') {
                _update.apply(this, args);
            } else if (options == 'reset') {
                _reset.apply(this, args);
            } else if ( typeof options === 'object' || ! options ) {
                this.Settings = {
                    onDrag: function (pos) {
                        console.log(pos);
                    },
                    Default: 0,
                    Min:0,
                    Max:100,
                    Float: false,
                    HalfScale: false,
                    Color: 'white',
                    Width: 201, 
                    Height: 10,
                    Dragger: {
                        Color: 'white', /*white, gray or black*/
                        Offset: {
                            X: -5, 
                            Y: 1
                        }
                    }
                };
                this.Dragger = null;
                this.Dash = null;
                this.IsDown = false;
                this.Start = 0;
                this.Offset = 0;
                this.Ratio = 1;
                this.Settings = $.extend(true, {}, this.Settings, options);
                var self = this;
                var $this = $(self);
                if (this.Settings.Min > this.Settings.Max) {
                    var ov = this.Settings.Max;
                    this.Settings.Max = this.Settings.Min;
                    this.Settings.Min = ov;
                }
                if (this.Settings.Default < this.Settings.Min) this.Settings.Default = this.Settings.Min;
                if (this.Settings.Default > this.Settings.Max) this.Settings.Default = this.Settings.Max;
                this.Ratio = (this.Settings.Width - 1) / (this.Settings.Max - this.Settings.Min);
                $this.addClass('barSimple');
                $this.css('width', self.Settings.Width+'px');
                $this.css('height', self.Settings.Height+'px');
                $this.css('background-color', self.Settings.Color);
                this.Dash = $('<div>');
                this.Dash.addClass('dash');
                this.Dash.addClass('left');
                $this.append(this.Dash);
                if (this.Settings.HalfScale) {
                    this.Dash = $('<div>');
                    this.Dash.addClass('dash');
                    this.Dash.addClass('middle');
                    $this.append(this.Dash);
                }
                this.Dash = $('<div>');
                this.Dash.addClass('dash');
                this.Dash.addClass('right');
                $this.append(this.Dash);
                this.Dragger = $('<div>');
                this.Dragger.addClass('dragger');
                this.Dragger.addClass(this.Settings.Dragger.Color);
                var initpos = Math.round((this.Settings.Default - this.Settings.Min) * this.Ratio);
                this.Dragger.css('left', (initpos + this.Settings.Dragger.Offset.X) + 'px');
                this.Dragger.css('top', this.Settings.Dragger.Offset.Y+'px');
                $this.append(this.Dragger);
                this.Dragger.mousedown(function(evt) {
                    self.Start = evt.pageX - $this.offset().left;
                    self.Offset = self.Dragger.offset().left - $this.offset().left;
                    self.IsDown = true;
                    $(document).mousemove(function(evt) {
                        if (self.IsDown) {
                            var pos = Math.round(evt.pageX - $this.offset().left - (self.Start - self.Offset));
                            if (pos < self.Settings.Dragger.Offset.X) pos = self.Settings.Dragger.Offset.X;
                            else if (pos > self.Settings.Width + self.Settings.Dragger.Offset.X - 1) pos = self.Settings.Width + self.Settings.Dragger.Offset.X - 1;
                            self.Dragger.css('left', pos + 'px');
                            var value = ((pos - self.Settings.Dragger.Offset.X) / self.Ratio) + self.Settings.Min;
                            if (self.Settings.Float) value = Math.round(value * 10.0) / 10.0;  
                            else value = Math.round(value);
                            if (typeof self.Settings.onDrag == 'function') {
                                self.Settings.onDrag({Value: value, Pos: pos});
                            }
                        }
                    });
                    $(document).mouseup(function() {
                        self.IsDown = false;
                        $(document).off('mousemove');
                        $(document).off('mouseup');
                    });
                    return false;
                });

            }
        });  
    };
}( jQuery ));