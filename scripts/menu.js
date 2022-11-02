(function ($) {
    $.fn.Menu = function(options) {
        var args = Array.prototype.slice.call(arguments, 1);
        return this.each(function() {
            if ( typeof options === 'object' || ! options ) {
                this.Settings = {
                    Items: [
                        {
                            id: 'mifile',
                            Caption: 'File',
                            Items: [
                                {
                                    id: 'miopen',
                                    Caption: 'Open...',
                                    onClick: function () {
                                        $('#fileinput').click();
                                    }
                                }, {
                                    id: 'misave',
                                    Caption: 'Save',
                                    Disabled: true,
                                    onClick: function () {
                                        makeSave();
                                    }
                                }, {
                                    id: 'miclose',
                                    Caption: 'Close',
                                    Disabled: true,
                                    onClick: function () {
                                        makeClose();
                                    }
                                }, {
                                    Separator: true
                                }, {
                                    id: 'mirestart',
                                    Caption: 'Restart',
                                    onClick: function () {
                                        location.reload();
                                    }
                                }, {
                                    id: 'miquit',
                                    Caption: 'Quit',
                                    onClick: function () {
                                        window.close();
                                    }
                                }
                            ]
                        }, {
                            id: 'miedit',
                            Caption: 'Edit',
                            Items: [
                                {
                                    id: 'miundo',
                                    Caption: 'Undo',
                                    Disabled: true,
                                    onClick: function () {
                                        State.restore();
                                    }
                                }, {
                                    Separator: true
                                }, {
                                    id: 'micopy',
                                    Caption: 'Copy',
                                    Disabled: true,
                                    onClick: function () {
                                        makeCopy();
                                    }
                                }, {
                                    id: 'mipaste',
                                    Caption: 'Paste',
                                    Disabled: false,
                                    onClick: function () {
                                        makePaste();
                                    }
                                }
                            ]
                        }, {
                            id: 'mimode',
                            MenuId: 'menumode',
                            Caption: 'Mode',
                            Items: [
                                {
                                    id: 'mibitmap',
                                    Caption: 'Bitmap...',
                                    Disabled: true,
                                    onClick: function () {
                                        $('#dialog_monochrome').Dialog('open');
                                    }
                                }, {
                                    id: 'miindexed',
                                    Caption: 'Indexed Color...',
                                    Disabled: true,
                                    onClick: function () {
                                        $('#dialog_colorquant').Dialog('open');
                                    }
                                }, {
                                    id: 'migrayscale',
                                    Caption: 'Grayscale',
                                    Disabled: true,
                                    onClick: function () {
                                        makeGrayscale($('#src').get(0));
                                    }
                                }, {
                                    id: 'mirgb',
                                    Caption: 'RGB',
                                    Disabled: true,
                                    Checked: true,
                                    onClick: function () {
                                        makeRGB();
                                    }
                                }
                            ]
                        }, {
                            id: 'mitransform',
                            Caption: 'Transform',
                            Items: [
                                {
                                    id: 'mifliphorizontal',
                                    Caption: 'Flip Horizontal',
                                    Disabled: true,
                                    onClick: function () {
                                        makeFlipHorizontal();
                                    }
                                }, {
                                    id: 'miflipvertical',
                                    Caption: 'Flip Vertical',
                                    Disabled: true,
                                    onClick: function () {
                                        makeFlipVertical();
                                    }
                                }, {
                                    Separator: true
                                }, {
                                    id: 'mirotate180',
                                    Caption: 'Rotate 180°',
                                    Disabled: true,
                                    onClick: function () {
                                        makeRotate180();
                                    }
                                }, {
                                    id: 'mirotate90CW',
                                    Caption: 'Rotate 90° Clockwise',
                                    Disabled: true,
                                    onClick: function () {
                                        makeRotate90CW();
                                    }
                                }, {
                                    id: 'mirotate90CCW',
                                    Caption: 'Rotate 90° Counterclockwise',
                                    Disabled: true,
                                    onClick: function () {
                                        makeRotate90CCW();
                                    }
                                }, {
                                    id: 'miarbitraryrotation',
                                    Caption: 'Arbitrary Rotation...',
                                    Disabled: true,
                                    onClick: function () {
                                        $('#dialog_arbi_rot').Dialog('open');
                                    }
                                }, {
                                    Separator: true
                                }, {
                                    id: 'miresize',
                                    Caption: 'Resize...',
                                    Disabled: true,
                                    onClick: function () {
                                        $('#dialog_resize').Dialog('open');
                                    }
                                }, {
                                    id: 'microp',
                                    Caption: 'Crop...',
                                    Disabled: true,
                                    onClick: function () {
                                        $('#dialog_crop').Dialog('open');
                                    }
                                }
                            ]
                        }, {
                            id: 'miadjust',
                            Caption: 'Adjust',
                            Items: [
                                {
                                    id: 'milevels',
                                    Caption: 'Levels...',
                                    Disabled: true,
                                    onClick: function () {
                                        $('#dialog_levels').Dialog('open');
                                    }
                                }, {
                                    id: 'mistretch',
                                    Caption: 'Auto Levels',
                                    Disabled: true,
                                    onClick: function () {
                                        makeStretch();
                                    }
                                }, {
                                    id: 'miautogamma',
                                    Caption: 'Auto Gamma',
                                    Disabled: true,
                                    onClick: function () {
                                        makeAutoGamma();
                                    }
                                }, {
                                    id: 'mibrightnesscontrast',
                                    Disabled: true,
                                    Caption: 'Brightness/Contrast...',
                                    onClick: function () {
                                        $('#dialog_bricon').Dialog('open');
                                    }
                                }, {
                                    id: 'miautocontrast',
                                    Disabled: true,
                                    Caption: 'Auto Contrast',
                                    onClick: function () {
                                        makeAutoContrast();
                                    }
                                }, {
                                    id: 'misigmoidalcontrast',
                                    Disabled: true,
                                    Caption: 'Sigmoidal Contrast...',
                                    onClick: function () {
                                        $('#dialog_sigcon').Dialog('open');
                                    }
                                }, {
                                    id: 'micurves',
                                    Disabled: true,
                                    Caption: 'Curves...',
                                    onClick: function () {
                                         $('#dialog_curves').Dialog('open');
                                    }
                                }, {
                                    id: 'miexposure',
                                    Disabled: true,
                                    Caption: 'Exposure...',
                                    onClick: function () {
                                         $('#dialog_exposure').Dialog('open');
                                    }
                                }, {
                                    id: 'mishadowhighlight',
                                    Disabled: true,
                                    Caption: 'Shadow and highlight...',
                                    onClick: function () {
                                         $('#dialog_ShadowHighlight').Dialog('open');
                                    }
                                }, {
                                    Separator: true
                                }, {
                                    id: 'micolorbalance',
                                    Caption: 'Color Balance...',
                                    Disabled: true,
                                    onClick: function () {
                                        $('#dialog_colbal').Dialog('open');
                                    }
                                }, {
                                    id: 'mivibrance',
                                    Caption: 'Vibrance...',
                                    Disabled: true,
                                    onClick: function () {
                                        $('#dialog_vibrance').Dialog('open');
                                    }
                                }, {
                                    id: 'mihuesaturation',
                                    Caption: 'Hue/Saturation...',
                                    Disabled: true,
                                    onClick: function () {
                                        $('#dialog_hsl').Dialog('open');
                                    }
                                }, {
                                    id: 'michannelmixer',
                                    Caption: 'Channel Mixer...',
                                    Disabled: true,
                                    onClick: function () {
                                        $('#dialog_chanmix').Dialog('open');
                                    }
                                }, {
                                    id: 'miphotofilter',
                                    Caption: 'Photo Filter...',
                                    Disabled: true,
                                    onClick: function () {
                                        $('#dialog_photofilter').Dialog('open');
                                    }
                                }, {
                                    Separator: true
                                }, {
                                    id: 'miinvert',
                                    Caption: 'Invert',
                                    Disabled: true,
                                    onClick: function () {
                                        makeInvert();
                                    }
                                }, {
                                    id: 'minormalize',
                                    Caption: 'Normalize',
                                    Disabled: true,
                                    onClick: function () {
                                        makeNormalize();
                                    }
                                }, {
                                    id: 'miequalize',
                                    Caption: 'Equalize',
                                    Disabled: true,
                                    onClick: function () {
                                        makeEqualize();
                                    }
                                }, {
                                    id: 'midesaturate',
                                    Caption: 'Desaturate...',
                                    Disabled: true,
                                    onClick: function () {
                                        $('#dialog_desat').Dialog('open');
                                    }
                                }, {
                                    id: 'miposterize',
                                    Caption: 'Posterize...',
                                    Disabled: true,
                                    onClick: function () {
                                        $('#dialog_posterize').Dialog('open');
                                    }
                                }, {
                                    id: 'mithreshold',
                                    Caption: 'Threshold...',
                                    Disabled: true,
                                    onClick: function () {
                                        $('#dialog_threshold').Dialog('open');
                                    }
                                }, {
                                    Separator: true
                                }, {
                                    id: 'mihistogram',
                                    Caption: 'Histogram...',
                                    Disabled: true,
                                    onClick: function () {
                                        $('#dialog_histogram').Dialog('open');
                                    }
                                }
                            ]
                        }, {
                            id: 'mifilter',
                            Caption: 'Filter',
                            Items: [
                                {
                                    id:'smblur',
                                    Caption: 'Blur',
                                    Items: [
                                        {
                                            id: 'miblur',
                                            Caption: 'Blur',
                                            Disabled: true,
                                            onClick: function () {
                                                makeBlur();
                                            }
                                        }, {
                                            id: 'miblurmore',
                                            Caption: 'Blur More',
                                            Disabled: true,
                                            onClick: function () {
                                                makeBlurMore();
                                            }
                                        }, {
                                            id: 'migaussian',
                                            Caption: 'Gaussian Blur...',
                                            Disabled: true,
                                            onClick: function () {
                                                $('#dialog_gaussian').Dialog('open');
                                            }
                                        }, {
                                            id: 'mimotionblur',
                                            Caption: 'Motion Blur...',
                                            Disabled: true,
                                            onClick: function () {
                                                $('#dialog_motionblur').Dialog('open');
                                            }
                                        }, {
                                            id: 'mizoom',
                                            Caption: 'Zoom Blur...',
                                            Disabled: true,
                                            onClick: function () {
                                                $('#dialog_zoom').Dialog('open');
                                            }
                                        }, {
                                            id: 'milensblur',
                                            Caption: 'Lens Blur...',
                                            Disabled: true,
                                            onClick: function () {
                                                $('#dialog_lensblur').Dialog('open');
                                            }
                                        }, {
                                            id: 'mitiltshift',
                                            Caption: 'Tilt Shift...',
                                            Disabled: true,
                                            onClick: function () {
                                                $('#dialog_tiltshift').Dialog('open');
                                            }
                                        }, {
                                            id: 'mibilateral2',
                                            Caption: 'Bilateral...',
                                            Disabled: true,
                                            onClick: function () {
                                                $('#dialog_bilateral').Dialog('open');
                                            }
                                        }, {
                                            id: 'mitriangleblur',
                                            Caption: 'Triangle Blur...',
                                            Disabled: true,
                                            onClick: function () {
                                                $('#dialog_triangleblur').Dialog('open');
                                            }
                                        }, {
                                            id: 'miboxblur',
                                            Caption: 'Box Blur...',
                                            Disabled: true,
                                            onClick: function () {
                                                $('#dialog_boxblur').Dialog('open');
                                            }
                                        }
            
                                    ]
                                }, {
                                    id:'smsharpen',
                                    Caption: 'Sharpen',
                                    Items: [
                                        {
                                            id: 'misharpen',
                                            Caption: 'Sharpen',
                                            Disabled: true,
                                            onClick: function () {
                                                makeSharpen();
                                            }
                                        }, {
                                            id: 'misharpenmore',
                                            Caption: 'Sharpen More',
                                            Disabled: true,
                                            onClick: function () {
                                                makeSharpenMore();
                                            }
                                        }, {
                                            id: 'miunsharpmask',
                                            Caption: 'Unsharp Mask...',
                                            Disabled: true,
                                            onClick: function () {
                                                $('#dialog_unsharpmask').Dialog('open');
                                            }
                                        }
                                    ]
                                }, {
                                    id:'smnoise',
                                    Caption: 'Noise',
                                    Items: [
                                        {
                                            id: 'minoise',
                                            Caption: 'Add Noise...',
                                            Disabled: true,
                                            onClick: function () {
                                                $('#dialog_noise').Dialog('open');
                                            }
                                        }, {
                                            id: 'mimedian',
                                            Caption: 'Median...',
                                            Disabled: true,
                                            onClick: function () {
                                                $('#dialog_median').Dialog('open');
                                            }
                                        }, {
                                            id: 'midespeckle',
                                            Caption: 'Despeckle',
                                            Disabled: true,
                                            onClick: function () {
                                                makeDespeckle();
                                            }
                                        }, {
                                            id: 'midenoise',
                                            Caption: 'Denoise...',
                                            Disabled: true,
                                            onClick: function () {
                                                $('#dialog_denoise').Dialog('open');
                                            }
                                        }, {
                                            id: 'mibilateral',
                                            Caption: 'Bilateral...',
                                            Disabled: true,
                                            onClick: function () {
                                                $('#dialog_bilateral').Dialog('open');
                                            }
                                        }
                                    ]
                                }, {
                                    id:'smpixelate',
                                    Caption: 'Pixelate',
                                    Items: [
                                        {
                                            id: 'mipixelate',
                                            Caption: 'Pixelate...',
                                            Disabled: true,
                                            onClick: function () {
                                                $('#dialog_pixelate').Dialog('open');
                                            }
                                        }, {
                                            id: 'mihexagonalpixelate',
                                            Caption: 'Hexagonal Pixelate...',
                                            Disabled: true,
                                            onClick: function () {
                                                $('#dialog_hexagonalpixelate').Dialog('open');
                                            }
                                        }, {
                                            id: 'mihalftone',
                                            Caption: 'Halftone...',
                                            Disabled: true,
                                            onClick: function () {
                                                $('#dialog_halftone').Dialog('open');
                                            }
                                        }, {
                                            id: 'micrystallize',
                                            Caption: 'Crystallize...',
                                            Disabled: true,
                                            onClick: function () {
                                                $('#dialog_crystallize').Dialog('open');
                                            }
                                        }
                                    ]
                                }, {
                                    id:'smdistort',
                                    Caption: 'Distort',
                                    Items: [
                                        {
                                            id: 'midistorsine',
                                            Caption: 'Sine Distortion...',
                                            Disabled: true,
                                            onClick: function () {
                                                $('#dialog_distorsine').Dialog('open');
                                            }
                                        }, {
                                            id: 'mipinch',
                                            Caption: 'Pinch...',
                                            Disabled: true,
                                            onClick: function () {
                                                $('#dialog_pinch').Dialog('open');
                                            }
                                        }, {
                                            id: 'mitwirl',
                                            Caption: 'Twirl...',
                                            Disabled: true,
                                            onClick: function () {
                                                $('#dialog_twirl').Dialog('open');
                                            }
                                        }, {
                                            id: 'midisperse',
                                            Caption: 'Disperse...',
                                            Disabled: true,
                                            onClick: function () {
                                                $('#dialog_disperse').Dialog('open');
                                            }
                                        }, {
                                            id: 'mifrosted',
                                            Caption: 'Frosted...',
                                            Disabled: true,
                                            onClick: function () {
                                                $('#dialog_frosted').Dialog('open');
                                            }
                                        }
                                    ]
                                }, {
                                    id:'smstylize',
                                    Caption: 'Stylize',
                                    Items: [
                                        {
                                            id: 'misepia',
                                            Caption: 'Sepia...',
                                            Disabled: true,
                                            onClick: function () {
                                                $('#dialog_sepia').Dialog('open');
                                            }
                                        }, {
                                            id: 'mivignette',
                                            Caption: 'Vignette...',
                                            Disabled: true,
                                            onClick: function () {
                                                $('#dialog_vignette').Dialog('open');
                                            }
                                        }, {
                                            id: 'micharcoal',
                                            Caption: 'Charcoal...',
                                            Disabled: true,
                                            onClick: function () {
                                                $('#dialog_charcoal').Dialog('open');
                                            }
                                        }, {
                                            id: 'misketch',
                                            Caption: 'Sketch...',
                                            Disabled: true,
                                            onClick: function () {
                                                $('#dialog_sketch').Dialog('open');
                                            }
                                        }, {
                                            id: 'miink',
                                            Caption: 'Ink...',
                                            Disabled: true,
                                            onClick: function () {
                                                $('#dialog_ink').Dialog('open');
                                            }
                                        }, {
                                            id: 'miwatercolor',
                                            Caption: 'Watercolor...',
                                            Disabled: true,
                                            onClick: function () {
                                                $('#dialog_watercolor').Dialog('open');
                                            }
                                        }, {
                                            id: 'mioil',
                                            Caption: 'Painting...',
                                            Disabled: true,
                                            onClick: function () {
                                                $('#dialog_oil').Dialog('open');
                                            }
                                        }, {
                                            id: 'miglow',
                                            Caption: 'Glow...',
                                            Disabled: true,
                                            onClick: function () {
                                                $('#dialog_glow').Dialog('open');
                                            }
                                        }, {
                                            id: 'misoftlight',
                                            Caption: 'Soft light...',
                                            Disabled: true,
                                            onClick: function () {
                                                $('#dialog_softlight').Dialog('open');
                                            }
                                        }, {
                                            id: 'midavehilleffect',
                                            Caption: 'Dave Hill Effect...',
                                            Disabled: true,
                                            onClick: function () {
                                                $('#dialog_DaveHillEffect').Dialog('open');
                                            }
                                        }, {
                                            id: 'milucisarteffect',
                                            Caption: 'Lucis Art Effect...',
                                            Disabled: true,
                                            onClick: function () {
                                                $('#dialog_LucisArtEffect').Dialog('open');
                                            }
                                        }, {
                                            id: 'mimorphology',
                                            Caption: 'Morphology...',
                                            Disabled: true,
                                            onClick: function () {
                                                $('#dialog_morphology').Dialog('open');
                                            }
                                        }, {
                                            id: 'mierosion',
                                            Caption: 'Erosion...',
                                            Disabled: true,
                                            onClick: function () {
                                                $('#dialog_erosion').Dialog('open');
                                            }
                                        }, {
                                            id: 'midialation',
                                            Caption: 'Dialation...',
                                            Disabled: true,
                                            onClick: function () {
                                                $('#dialog_dialation').Dialog('open');
                                            }
                                        }, {
                                            id: 'miedgework',
                                            Caption: 'Edge Work...',
                                            Disabled: true,
                                            onClick: function () {
                                                $('#dialog_edgework').Dialog('open');
                                            }
                                        }, {
                                            id: 'midiffgauss',
                                            Caption: 'Difference of Gaussians...',
                                            Disabled: true,
                                            onClick: function () {
                                                $('#dialog_diffgauss').Dialog('open');
                                            }
                                        }, {
                                            id: 'milaplace',
                                            Caption: 'Trace Contour',
                                            Disabled: true,
                                            onClick: function () {
                                                makeLaplace();
                                            }
                                        }, {
                                            id: 'misobel',
                                            Caption: 'Find Edge',
                                            Disabled: true,
                                            onClick: function () {
                                                makeSobel();
                                            }
                                        }, {
                                            id: 'misobelim',
                                            Caption: 'Find Edge IM',
                                            Disabled: true,
                                            onClick: function () {
                                                makeSobelIM();
                                            }
                                        }, {
                                            id: 'miembossmediumgray',
                                            Caption: 'Emboss Medium Gray',
                                            Disabled: true,
                                            onClick: function () {
                                                makeEmbossMediumGray();
                                            }
                                        }, {
                                            id: 'miemboss',
                                            Caption: 'Emboss',
                                            Disabled: true,
                                            onClick: function () {
                                                makeEmboss();
                                            }
                                        }, {
                                            id: 'misolarize',
                                            Caption: 'Solarize',
                                            Disabled: true,
                                            onClick: function () {
                                                makeSolarize();
                                            }
                                        }, {
                                            id: 'mipseudocolor',
                                            Caption: 'Pseudocolor',
                                            Disabled: true,
                                            onClick: function () {
                                                makePseudocolor();
                                            }
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                };
                this.Settings = $.extend({}, this.Settings, options);
                var self = this;
                var $this = $(self);
                $this.addClass('menu');
                this.bar = $('<div>');
                this.bar.addClass('bar');
                $this.append(this.bar);
                this.left = $('<div>');
                this.left.addClass('left');
                this.bar.append(this.left);
                this.pomme = $('<div>');
                this.pomme.addClass('pomme');
                this.bar.append(this.pomme);
                this.sicontainer = $('<div>');
                this.sicontainer.addClass('sicontainer');
                this.pomme.append(this.sicontainer);
                this.container = $('<div>');
                this.container.addClass('container');
                this.container.data('level', 0);
                this.bar.append(this.container);
                this.right = $('<div>');
                this.right.addClass('right');
                this.bar.append(this.right);
                $.each(this.Settings.Items, function (i, elt) {
                    addItem(self, self.container, elt);
                });
            }
        });
    };
    function addItem(self, parent, elt) {
        var it = $('<div>');
        if (elt.Separator) {
            it.addClass('separator');
        } else {
            it.data('parent', parent);
            var level = parent.data('level') + 1;
            it.data('level', level);
            if (elt.id) it.attr('id', elt.id);
            if (elt.Caption) it.html(elt.Caption);
            if (elt.Disabled) it.addClass('disabled');
            if (elt.Checked) it.addClass('checked');
            if (typeof elt.onClick == 'function') it.click(function (e) {
                var target = $(e.delegateTarget);
                var parent = target.data('parent');
                target.trigger('mouseleave');
                elt.onClick(e);
            });
            if (elt.Items) {
                var menu = $('<div>');
                if (elt.MenuId) menu.attr('id', elt.MenuId); 
                it.data('menu', menu);
                menu.data('level', level);
                menu.data('parent', it);
                if (level >= 1) menu.addClass('subitems');
                if (level > 1) menu.addClass('submenu');
                menu.addClass('hidden');
                self.sicontainer.append(menu);
                $.each(elt.Items, function (i, elt) {
                    addItem(self, menu, elt);
                });
                menu.mouseenter(function (e) {
                    var target = $(e.delegateTarget);
                    var parent = target.data('parent');
                    var level = target.data('level');
                    parent.data('pain', true);
                    parent.addClass('over');
                });
                menu.mouseleave(function (e) {
                    var target = $(e.delegateTarget);
                    var parent = target.data('parent');
                    var level = target.data('level');
                    var inchild = false;
                    parent.data('pain', false);
                    setTimeout(function () {
                        // check if in a child
                        if (level >= 1) {
                            target.children().each(function(index, element) {
                                var $element = $(element);
                                var m = $element.data('menu');
                                if (m) {
                                    var c = $element.data('pain');
                                    if (c === true) inchild = true;
                                }
                            });
                        }

                        if (parent.data('itin') !== true && inchild !== true) {
                            target.addClass('hidden');
                            parent.removeClass('over');
                            // close parent menus
                            if (level >= 2) {
                                var p = parent.data('parent');
                                if (p.data('parent').data('pain') !== true) {
                                    var l = p.data('level');
                                    while (l >= 1) {
                                        p.trigger('mouseleave');
                                        p = p.data('parent');
                                        l = p.data('level');
                                    }
                                }
                            }
                        }
                    }, 10);
                });
            } else {
                it.data('menu', false);
            }
            if (level == 1) it.addClass('item');
            else {
                if (elt.Items) it.addClass('submenu');
                else it.addClass('subitem');
            }
            it.mouseenter(function (e) {
                var target = $(e.delegateTarget);
                var menu = target.data('menu');
                var parent = target.data('parent');
                var level = target.data('level');
                target.data('itin', true);
                if (menu !== false) {
                    if (level == 1) menu.css('left', target.offset().left+'px');
                    else {
                        var posx = target.offset().left + parent.width() - 5;
                        var posy = target.offset().top - 1;
                        if (posy < 20) posy = 23;
                        menu.css('left', posx+'px');
                        menu.css('top', posy+'px');
                    }
                    menu.removeClass('hidden');
                }
            });
            it.mouseleave(function (e) {
                var target = $(e.delegateTarget);
                var menu = target.data('menu');
                var parent = target.data('parent');
                target.data('itin', false);
                setTimeout(function () {
                    if (menu && target.data('pain') !== true) {
                        menu.addClass('hidden');
                        target.removeClass('over');
                    }
                }, 10);
            });
        }
        parent.append(it);
    }
}( jQuery ));