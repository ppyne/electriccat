(function ($) {
    
    function _open() {
        if (this.Opened === false) {
            $('#beep').get(0).play();
            $('.layer').show();
            $('#menu').addClass('disabled');
            var $this = $(this);
            this.Opened = true;
            var posx = (window.innerWidth - $this.width()) / 2;
            var posy = (window.innerHeight - $this.height()) / 2;
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
    
    $.fn.messageBox = function(options) {
        var args = Array.prototype.slice.call(arguments, 1);
        return this.each(function() {
            if (options == 'open') {
                _open.apply(this, args);
            } else if (options == 'close') {
                _close.apply(this, args);
            } else if ( typeof options === 'object' || ! options ) {
                this.Settings = {
                    text: 'An error occured.',
                    btnOk: true,
                    btnCancel: false,
                    btnYes: false,
                    btnNo: false,
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
                    onYes: function () {
                    },
                    onNo: function () {
                    }
                };
                this.Opened = false;
                this.Settings = $.extend({}, this.Settings, options);
                var self = this;
                var $this = $(self);
                this.MyID = '#'+$this.attr('id');
                $this.html('<div class="inner"><div class="text">'+this.Settings.text+'</div><div class="buttons"></div></div>');
                if (this.Settings.btnOk) {
                    $(this.MyID+' .buttons').append('<button class="btn_ok main">Ok</button>');
                }
                if (this.Settings.btnCancel) {
                    $(this.MyID+' .buttons').append('<button class="btn_cancel">Cancel</button>');
                }
                if (this.Settings.btnYes) {
                    $(this.MyID+' .buttons').append('<button class="btn_yes">Yes</button>');
                }
                if (this.Settings.btnNo) {
                    $(this.MyID+' .buttons').append('<button class="btn_no">No</button>');
                }
                if (typeof this.Settings.onInit === 'function') this.Settings.onInit();
                $this.addClass('hidden');
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
                if (typeof self.Settings.onYes === 'function') {
                    $(this.MyID+' .btn_yes').click(self.Settings.onApply);
                    $(this.MyID+' .btn_yes').click(function () {
                        $this.Dialog('close');
                    });
                }
                if (typeof self.Settings.onNo === 'function') {
                    $(this.MyID+' .btn_no').click(self.Settings.onReset);
                    $(this.MyID+' .btn_no').click(function () {
                        $this.Dialog('close');
                    });
                }
            }
        });
    };
}( jQuery ));