// JavaScript Document
(function ($) {
    'use strict';

    var DEFAULT_CAROUSEL_OPTIONS = {
        items: 1,
        loop: false,
        autoplay: true,
        autoplayTimeout: 6000,
        autoplayHoverPause: true,
        smartSpeed: 600,
        autoHeight: true,
        nav: false,
        dots: false,
        responsiveClass: true
    };

    function parseOptions(raw) {
        if (!raw) {
            return {};
        }
        if (typeof raw === 'object') {
            return raw;
        }
        if (typeof raw === 'string') {
            try {
                return JSON.parse(raw);
            } catch (error) {
                console.warn('healowaware: invalid Owl Carousel options', error);
            }
        }
        return {};
    }

    function updateIndicators(id, index) {
        var selector = '[data-hw-owl-target="#' + id + '"][data-hw-owl-slide]';
        $(selector).each(function (idx) {
            var $indicator = $(this);
            if (idx === index) {
                $indicator.addClass('active').attr('aria-current', 'true');
            } else {
                $indicator.removeClass('active').removeAttr('aria-current');
            }
        });
    }

    function bindControls($carousel, id) {
        var selector = '[data-hw-owl-target="#' + id + '"]';
        $(selector).each(function () {
            var $control = $(this);
            if ($control.data('hwOwlBound')) {
                return;
            }
            $control.data('hwOwlBound', true);
            var action = $control.data('hwOwlAction');
            if (action === 'prev' || action === 'next') {
                $control.on('click', function (event) {
                    event.preventDefault();
                    $carousel.trigger(action + '.owl.carousel');
                });
            }
            if ($control.is('[data-hw-owl-slide]')) {
                var targetIndex = parseInt($control.data('hwOwlSlide'), 10) || 0;
                $control.on('click', function (event) {
                    event.preventDefault();
                    $carousel.trigger('to.owl.carousel', [targetIndex, 400, true]);
                });
            }
        });
    }

    function buildOptions($carousel) {
        var raw = $carousel.attr('data-hw-owl-options');
        var merged = $.extend(true, {}, DEFAULT_CAROUSEL_OPTIONS, parseOptions(raw));
        if ($carousel.children().length <= 1) {
            merged.loop = false;
        }
        return merged;
    }

    function initCarousel($carousel) {
        if (!$carousel.length || $carousel.data('hwOwlInitialized')) {
            return;
        }
        if (!$.fn || !$.fn.owlCarousel) {
            console.warn('healowaware: Owl Carousel is not available on the page.');
            return;
        }
        var carouselId = $carousel.attr('id');
        var options = buildOptions($carousel);

        $carousel.on('initialized.owl.carousel changed.owl.carousel', function (event) {
            if (!event.namespace || !event.relatedTarget) {
                return;
            }
            var related = event.relatedTarget;
            var relativeIndex = related.relative(related.current());
            updateIndicators(carouselId, relativeIndex);
        });

        $carousel.owlCarousel(options);
        bindControls($carousel, carouselId);
        updateIndicators(carouselId, 0);
        $carousel.data('hwOwlInitialized', true);
    }

    function initCarousels(context) {
        var $context = context ? $(context) : $(document);
        var $carousels = $context.filter('.js-hw-owl-carousel').add($context.find('.js-hw-owl-carousel'));
        $carousels.each(function () {
            initCarousel($(this));
        });
    }

    window.hwHealowawareInitCarousels = initCarousels;

    $(document).ready(function () {
        $('#collapseExample').on('hidden.bs.collapse', function () {
            $('#read-more').html('Read More &#9660;');
        });
        $('#collapseExample').on('shown.bs.collapse', function () {
            $('#read-more').html('Read Less &#9650;');
        });

        $('body').scrollspy({ target: '#navbar-primary' });

        $("#navbar-primary ul li a[href^='#']").on('click', function (e) {
            e.preventDefault();
            var hash = this.hash;
            $('html, body').animate({
                scrollTop: $(hash).offset().top
            }, 300, function () {
                window.location.hash = hash;
            });
        });

        const $accordion = $('.accordion');
        $accordion.find('.faq-link').on('click', function (e) {
            const $button = $(this);
            const $icon = $button.find('.faq-toggle-icon');
            if (!$icon.length) { return; }
            console.log(this);
            $icon.html($button.hasClass('collapsed') ? 'expand_less' : 'expand_more');
        });

        function alignModal() {
            var modalDialog = $(this).find('.modal-dialog');
            modalDialog.css('margin-top', Math.max(0, ($(window).height() - modalDialog.height()) / 2));
        }

        $('.modal').on('shown.bs.modal', alignModal);
        $(window).on('resize', function () {
            $('.modal:visible').each(alignModal);
        });

        initCarousels(document);
    });

    $(document).on('hw:dom-updated', function (event) {
        initCarousels(event.target);
    });

})(window.jQuery);
