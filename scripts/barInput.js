(function ($) {
    
    function _update(values) {
        this.Bar.barSimple('update', values);
    }
    
    function _reset() {
        this.Bar.barSimple('reset');
    }
    
    function _guid() {
        function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
    }

    $.fn.barInput = function(options) {
        var args = Array.prototype.slice.call(arguments, 1);
        return this.each(function() {
            if (options == 'update') {
                _update.apply(this, args);
            } else if (options == 'reset') {
                _reset.apply(this, args);
            } else if ( typeof options === 'object' || ! options ) {
                this.Settings = {
                    Label: 'Untitled',
                    Default: 0,
                    Min:0,
                    Max:100,
                    Float: false,
                    FloatPrecision: 1,
                    HalfScale: false,
                    Color: 'white'
                };
                this.Settings = $.extend(true, {}, this.Settings, options);
                var self = this;
                var $this = $(self);
                $this.addClass('barInput');
                this.uid = _guid();
                
                this.Group = $('<div class="group">');
                this.SlotLeft = $('<div class="slot left">');
                this.SlotRight = $('<div class="slot right">');
                if (typeof this.Settings.Label2 !== 'undefined') this.SlotMiddle = $('<div class="slot middle">');
                
                // Label
                this.Label = $('<label for="input-'+this.uid+'">');
                this.Label.html(this.Settings.Label);
                // Label2
                this.Label2 = null;
                if (typeof this.Settings.Label2 !== 'undefined') {
                    this.Label2 = $('<label>');
                    this.Label2.html(this.Settings.Label2);
                }
                // Input
                var size = 6;
                var minval = this.Settings.Min.toString().match(/\d+/);
                var maxval = this.Settings.Max.toString().match(/\d+/);
                if (maxval !== null && minval !== null) {
                    size = Math.max(minval[0].length, maxval[0].length);
                    if (this.Settings.Max < 0 || this.Settings.Min < 0) size++; // minus sign
                    if (this.Settings.Float === true) size += 2; // dot sign + one digit
                }
                this.Input = $('<input type="text" id="input-'+this.uid+'" maxlength="'+size+'" size="'+size+'">');
                this.Input.val(this.Settings.Default);
                
                if (typeof this.Settings.Label2 !== 'undefined') {
                    this.SlotRight.append(this.Label2);
                    this.Group.append(this.SlotRight);
                    this.SlotMiddle.append(this.Input);
                    this.Group.append(this.SlotMiddle);
                    this.SlotLeft.append(this.Label);
                    this.Group.append(this.SlotLeft);
                } else {
                    this.SlotRight.append(this.Input);
                    this.Group.append(this.SlotRight);
                    this.SlotLeft.append(this.Label);
                    this.Group.append(this.SlotLeft);
                }
                
                // Bar
                this.Bar = $('<div>');
                $this.append(this.Group);
                $this.append(this.Bar);
                this.Bar.barSimple($.extend(true, {}, this.Settings, {
                    onDrag: function (val) {
                        self.Input.val(val.Value);
                        if (typeof self.Settings.onDrag == 'function') {
                            self.Settings.onDrag(val);
                        }
                    }
                }));
                this.Input.change(function () {
                    self.Bar.barSimple('update', {Value: self.Input.val()});
                });
            }
        });  
    };
}( jQuery ));