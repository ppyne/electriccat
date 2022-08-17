(function ($) {
    $.fn.Nub = function(options) {
        var args = Array.prototype.slice.call(arguments, 1);
        return this.each(function() {
            if ( typeof options === 'object' || ! options ) {
                this.Settings = {
                    onChange: function (x, y) {
                        console.log({x:x, y:y});
                    },
                    x: false,
                    y: false
                };
                this.Settings = $.extend({}, this.Settings, options);
                var self = this;
                var $this = $(self);
                $this.addClass('nub');
                self.Width = $this.parent().width();
                self.Height = $this.parent().height();
                var x = Math.round((self.Width)/2);
                var y = Math.round((self.Height)/2);
                if (self.Settings.x !== false) x = self.Settings.x;
                if (self.Settings.y !== false) y = self.Settings.y;
                $this.css('left', x + 'px');
                $this.css('top', y + 'px');
                if (typeof self.Settings.onChange === 'function') {
                    self.Settings.onChange(Math.round(x), Math.round(y));
                }
                self.IsDown = false;
                $this.mousedown(function (e) {
                    self.Width = $this.parent().width();
                    self.Height = $this.parent().height();
                    self.StartX = e.clientX;
                    self.StartY = e.clientY;
                    self.OffsetX = $this.offset().left - $this.parent().offset().left;
                    self.OffsetY = $this.offset().top - $this.parent().offset().top;
                    self.IsDown = true;
                    $(document).mousemove(function(evt) {
                        if (self.IsDown) {
                            var posx = self.OffsetX + evt.clientX - self.StartX+4;
                            var posy = self.OffsetY + evt.clientY - self.StartY+4;
                            if (posx < 0) posx = 0;
                            else if (posx > self.Width - 1) posx = self.Width - 1;
                            if (posy < 0) posy = 0;
                            else if (posy > self.Height - 1) posy = self.Height - 1;
                            $this.css('left', posx + 'px');
                            $this.css('top', posy + 'px');
                            if (typeof self.Settings.onChange === 'function') {
                                self.Settings.onChange(Math.round(posx), Math.round(posy));
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