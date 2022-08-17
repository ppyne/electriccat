(function ($) {
    function _update(aspect_ratio) {
        this.Settings.aspectRatio = aspect_ratio;
        if (aspect_ratio !== false) this.Settings.aspectRatio = parseFloat(aspect_ratio);
        var $this = $(this);
        var x = 0;
        var y = 0;
        var w = $this.parent().width();
        var h = $this.parent().height();
        var r = w/h;
        if (typeof this.Settings.aspectRatio === 'number') {
            if (this.Settings.aspectRatio > r) {
                h = w / this.Settings.aspectRatio;
                y += ($this.parent().height() - h) / 2;
            } else if (this.Settings.aspectRatio < r) {
                w = h * this.Settings.aspectRatio;
                x += ($this.parent().width() - w) / 2;
            } else {
                if ($this.parent().height() < $this.parent().width()) {
                    w = h * this.Settings.aspectRatio;
                    x += ($this.parent().width() - w) / 2;
                } else {
                    h = w / this.Settings.aspectRatio;
                    y += ($this.parent().height() - h) / 2;
                }
            }
        }
        $this.css('left', x+'px');
        $this.css('top', y+'px');
        $this.css('width', w + 'px');
        $this.css('height', h + 'px');
        if (typeof this.Settings.onChange === 'function') this.Settings.onChange(
            Math.round(x), Math.round(y),
            Math.round(w), Math.round(h),
            $this
        );
    }

    $.fn.Selection = function(options) {
        var args = Array.prototype.slice.call(arguments, 1);
        return this.each(function() {
            if (options == 'update') {
                _update.apply(this, args);
            } else if ( typeof options === 'object' || ! options ) {
                this.Settings = {
                    minWidth: 16,
                    minHeight: 16,
                    aspectRatio: false,
                    onChange: function (x, y, width, height) {
                        console.log({x:x, y:y, width:width, height:height});
                    }
                };
                this.Settings = $.extend({}, this.Settings, options);
                var self = this;
                var $this = $(self);
                self.LimitLeft = 0;
                self.LimitTop = 0;
                self.LimitRight = $this.parent().width();
                self.LimitBottom = $this.parent().height();
                self.Width = $this.outerWidth();
                self.Height = $this.outerHeight();
                this.StartX = 0;
                this.StartY = 0;
                this.OffsetX = 0;
                this.OffsetY = 0;
                this.OffsetXBR = 0;
                this.OffsetYBR = 0;
                this.IsDown = false;
                this.neIsDown = false;
                this.nwIsDown = false;
                this.seIsDown = false;
                this.swIsDown = false;
                this.shiftKeyPressed = false;
                this.selectionAspectRatio = 1;
                this.currentAspectRatio = false;
                this.$hne = $('<div class="handler ne">');
                this.hne = this.$hne.get(0);
                $this.append(this.$hne);
                this.$hnw = $('<div class="handler nw">');
                this.hnw = this.$hnw.get(0);
                $this.append(this.$hnw);
                this.$hse = $('<div class="handler se">');
                this.hse = this.$hse.get(0);
                $this.append(this.$hse);
                this.$hsw = $('<div class="handler sw">');
                this.hsw = this.$hsw.get(0);
                $this.append(this.$hsw);
                _update.apply(this, [this.Settings.aspectRatio]);
                $this.mousedown(function (e) {
                    self.LimitLeft = 0;
                    self.LimitTop = 0;
                    self.LimitRight = $this.parent().width();
                    self.LimitBottom = $this.parent().height();
                    self.Width = $this.outerWidth();
                    self.Height = $this.outerHeight();
                    self.StartX = e.clientX;
                    self.StartY = e.clientY;
                    self.OffsetX = $this.offset().left - $this.parent().offset().left;
                    self.OffsetY = $this.offset().top - $this.parent().offset().top;
                    self.OffsetXBR = self.OffsetX+self.Width;
                    self.OffsetYBR = self.OffsetY+self.Height;
                    self.shiftKeyPressed = false;
                    self.selectionAspectRatio = self.Width / self.Height;
                    if (typeof self.Settings.aspectRatio === 'number') self.currentAspectRatio = self.Settings.aspectRatio;
                    else if (e.shiftKey) self.currentAspectRatio = self.selectionAspectRatio;
                    else self.currentAspectRatio = false;
                    if (e.target == self) self.IsDown = true;
                    else if (e.target == self.hne) self.neIsDown = true;
                    else if (e.target == self.hnw) self.nwIsDown = true;
                    else if (e.target == self.hse) self.seIsDown = true;
                    else if (e.target == self.hsw) self.swIsDown = true;
                    $(document).mousemove(function(evt) {
                        if (evt.shiftKey && self.currentAspectRatio === false) {
                            self.currentAspectRatio = self.selectionAspectRatio;
                            self.shiftKeyPressed = true;
                        }
                        if (self.shiftKeyPressed && !evt.shiftKey) {
                            self.currentAspectRatio = false;
                            self.shiftKeyPressed = false;
                        }
                        var posx = self.OffsetX + evt.clientX - self.StartX;
                        var posy = self.OffsetY + evt.clientY - self.StartY;
                        if (self.IsDown) {
                            if (posx < self.LimitLeft) posx = self.LimitLeft;
                            else if (posx + self.Width > self.LimitRight) posx = self.LimitRight - self.Width;
                            if (posy < self.LimitTop) posy = self.LimitTop;
                            else if (posy + self.Height > self.LimitBottom) posy = self.LimitBottom - self.Height;
                            $this.css('left', posx + 'px');
                            $this.css('top', posy + 'px');
                            if (typeof self.Settings.onChange === 'function') self.Settings.onChange(
                                Math.round(posx-self.LimitLeft), Math.round(posy-self.LimitTop),
                                Math.round(self.Width), Math.round(self.Height),
                                $this
                            );
                        } else {
                            if (self.neIsDown) {
                                if (posx + self.Width > self.LimitRight) posx = self.LimitRight - self.Width;
                                if (posy < self.LimitTop) posy = self.LimitTop;
                                if (posy > self.OffsetYBR-self.Settings.minHeight) posy = self.OffsetYBR-self.Settings.minHeight;
                                var w = self.Width + (posx - self.OffsetX);
                                var h = self.OffsetYBR - posy;
                                if (w < self.Settings.minWidth) w = self.Settings.minWidth;
                                if (h < self.Settings.minHeight) h = self.Settings.minHeight;
                                if (typeof self.currentAspectRatio === 'number') {
                                    w = h * self.currentAspectRatio;
                                    if (self.OffsetX + w > self.LimitRight) {
                                        w = self.LimitRight - self.OffsetX;
                                        h = w / self.currentAspectRatio;
                                        posy = self.OffsetYBR - h;
                                    }
                                }
                                $this.css('top', posy + 'px');
                                $this.css('width', w + 'px');
                                $this.css('height', h + 'px');
                                if (typeof self.Settings.onChange === 'function') self.Settings.onChange(
                                    Math.round($this.offset().left - $this.parent().offset().left), Math.round($this.offset().top - $this.parent().offset().top),
                                    Math.round(w), Math.round(h),
                                    $this
                                );
                            } else if (self.nwIsDown) {
                                if (posx < self.LimitLeft) posx = self.LimitLeft;
                                if (posx > self.OffsetXBR-self.Settings.minWidth) posx = self.OffsetXBR-self.Settings.minWidth;
                                if (posy < self.LimitTop) posy = self.LimitTop;
                                if (posy > self.OffsetYBR-self.Settings.minHeight) posy = self.OffsetYBR-self.Settings.minHeight;
                                var w = self.OffsetXBR - posx;
                                var h = self.OffsetYBR - posy;
                                if (w < self.Settings.minWidth) w = self.Settings.minWidth;
                                if (h < self.Settings.minHeight) h = self.Settings.minHeight;
                                if (typeof self.currentAspectRatio === 'number') {
                                    w = h * self.currentAspectRatio;
                                    posx = self.OffsetXBR - w;
                                    if (posx < self.LimitLeft) {
                                        posx = self.LimitLeft;
                                        w = self.OffsetXBR - posx;
                                        h = w / self.currentAspectRatio;
                                        posy = self.OffsetYBR - h;
                                    }
                                }
                                $this.css('left', posx + 'px');
                                $this.css('top', posy + 'px');
                                $this.css('width', w + 'px');
                                $this.css('height', h + 'px');
                                if (typeof self.Settings.onChange === 'function') self.Settings.onChange(
                                    Math.round($this.offset().left - $this.parent().offset().left), Math.round($this.offset().top - $this.parent().offset().top),
                                    Math.round(w), Math.round(h),
                                    $this
                                );
                            } else if (self.seIsDown) {
                                if (posx + self.Width > self.LimitRight) posx = self.LimitRight - self.Width;
                                if (posy + self.Height > self.LimitBottom) posy = self.LimitBottom - self.Height;
                                var w = self.Width + (posx - self.OffsetX);
                                var h = self.Height + (posy - self.OffsetY);
                                if (w < self.Settings.minWidth) w = self.Settings.minWidth;
                                if (h < self.Settings.minHeight) h = self.Settings.minHeight;
                                if (typeof self.currentAspectRatio === 'number') {
                                    h = w / self.currentAspectRatio;
                                    if (self.OffsetY + h > self.LimitBottom) {
                                        h = self.LimitBottom - self.OffsetY;
                                        w = h * self.currentAspectRatio;
                                    }
                                }
                                $this.css('width', w + 'px');
                                $this.css('height', h + 'px');
                                if (typeof self.Settings.onChange === 'function') self.Settings.onChange(
                                    Math.round($this.offset().left - $this.parent().offset().left), Math.round($this.offset().top - $this.parent().offset().top),
                                    Math.round(w), Math.round(h), $this
                                );
                            } else if (self.swIsDown) {
                                if (posx < self.LimitLeft) posx = self.LimitLeft;
                                if (posx > self.OffsetXBR-self.Settings.minWidth) posx = self.OffsetXBR-self.Settings.minWidth;
                                if (posy + self.Height > self.LimitBottom) posy = self.LimitBottom - self.Height;
                                var w = self.OffsetXBR - posx;
                                var h = self.Height + (posy - self.OffsetY);
                                if (w < self.Settings.minWidth) w = self.Settings.minWidth;
                                if (h < self.Settings.minHeight) h = self.Settings.minHeight;
                                if (typeof self.currentAspectRatio === 'number') {
                                    h = w / self.currentAspectRatio;
                                    if (self.OffsetY + h > self.LimitBottom) {
                                        h = self.LimitBottom - self.OffsetY;
                                        w = h * self.currentAspectRatio;
                                        posx = self.OffsetXBR - w;
                                    }
                                }
                                $this.css('left', posx + 'px');
                                $this.css('width', w + 'px');
                                $this.css('height', h + 'px');
                                if (typeof self.Settings.onChange === 'function') self.Settings.onChange(
                                    Math.round($this.offset().left - $this.parent().offset().left), Math.round($this.offset().top - $this.parent().offset().top),
                                    Math.round(w), Math.round(h), $this
                                );
                            }
                        }
                    });
                    $(document).mouseup(function() {
                        self.IsDown = false;
                        self.neIsDown = false;
                        self.nwIsDown = false;
                        self.seIsDown = false;
                        self.swIsDown = false;
                        $(document).off('mousemove');
                        $(document).off('mouseup');
                    });
                    return false;
                });
            }
        });
    };
}( jQuery ));