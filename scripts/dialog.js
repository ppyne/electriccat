(function ($) {
    
    function _open() {
        if (this.Opened === false) {
            $('.layer').show();
            $('#menu').addClass('disabled');
            var $this = $(this);
            this.Opened = true;
            var posx = (window.innerWidth - this.Width) / 2;
            var posy = (window.innerHeight - this.Height) / 2;
            $this.css('left', posx + 'px');
            $this.css('top', posy + 'px');
            $this.removeClass('hidden');
            if (typeof this.Settings.onOpen === 'function') this.Settings.onOpen();
        }
    }
    
    function _close() {
        if (this.Opened === true) {
            var $this = $(this);
            this.Opened = false;
            $this.addClass('hidden');
            $('#menu').removeClass('disabled');
            $('.layer').hide();
            if (typeof this.Settings.onClose === 'function') this.Settings.onClose();
        }
    }
    
    $.fn.Dialog = function(options) {
        var args = Array.prototype.slice.call(arguments, 1);
        return this.each(function() {
            if (options == 'open') {
                _open.apply(this, args);
            } else if (options == 'close') {
                _close.apply(this, args);
            } else if ( typeof options === 'object' || ! options ) {
                this.Settings = {
                    onInit: function() {
                    },
                    onOpen: function() {
                    },
                    onClose: function() {
                    },
                    onOk: function() {
                    },
                    onCancel: function() {
                    },
                    onApply: function () {
                    },
                    onReset: function () {
                    }
                };
                this.StartX = 0;
                this.StartY = 0;
                this.OffsetX = 0;
                this.OffsetY = 0;
                this.IsDown = false;
                this.Opened = false;
                this.Settings = $.extend({}, this.Settings, options);
                var self = this;
                var $this = $(self);
                this.MyID = '#'+$this.attr('id');
                this.Width = $this.width();
                this.Height = $this.height();
                if (typeof this.Settings.onInit === 'function') this.Settings.onInit();
                $this.addClass('hidden');
                var bar = $this.children('.bar');
                bar.mousedown(function (e) {
                    self.Width = $this.outerWidth();
                    self.Height = $this.outerHeight();
                    self.StartX = e.clientX;
                    self.StartY = e.clientY;
                    self.OffsetX = $this.offset().left - $this.parent().offset().left;
                    self.OffsetY = $this.offset().top - $this.parent().offset().top;
                    self.IsDown = true;
                    $(document).mousemove(function(evt) {
                        if (self.IsDown) {
                            var posx = self.OffsetX + evt.clientX - self.StartX;
                            var posy = self.OffsetY + evt.clientY - self.StartY;
                            if (posx < 0) posx = 0;
                            else if (posx + self.Width > $this.parent().outerWidth()) posx = $this.parent().outerWidth() - self.Width;
                            if (posy < 0) posy = 0;
                            else if (posy + self.Height > $this.parent().outerHeight()) posy = $this.parent().outerHeight() - self.Height;
                            $this.css('left', posx + 'px');
                            $this.css('top', posy + 'px');
                        }
                    });
                    $(document).mouseup(function() {
                        self.IsDown = false;
                        $(document).off('mousemove');
                        $(document).off('mouseup');
                    });
                    return false;
                });
                if (typeof self.Settings.onOk === 'function') {
                    $(this.MyID+' .btn_ok').click(self.Settings.onOk);
                    $(this.MyID+' .btn_ok').click(function () {
                        $this.Dialog('close');
                    });
                }
                if (typeof self.Settings.onCancel === 'function') {
                    $(this.MyID+' .btn_cancel').click(self.Settings.onCancel);
                    $(this.MyID+' .btn_cancel').click(function () {
                        $this.Dialog('close');
                    });
                }
                if (typeof self.Settings.onApply === 'function') {
                    $(this.MyID+' .btn_apply').click(self.Settings.onApply);
                }
                if (typeof self.Settings.onReset === 'function') {
                    $(this.MyID+' .btn_reset').click(self.Settings.onReset);
                }
            }
        });
    };
}( jQuery ));