/**
 * @author rdifb0
 * @version 1.5
 */

(function($) {

    var uniqid = 0;

    $.fn.iframeAjax = function(options) {

        var settings = {
            "url": null,
            "json": true,
            "post": true,
            "autolock": true,
            "onBeforeSubmit": function() {},
            "onAfterSubmit": function(data, rawData) {},
            "onError" : function(error, rawData) {}
        };

        if (options) {
            $.extend(settings, options);
        }

        return this.each(function(i, el) {

            var $S = settings;
            var $E = $(el);

            // only forms are supported
            if (!$E.is('form')) {
                return;
            }

            var formId = 'ajaxIframe-' + ++uniqid;
            var url = $S.url || $E.attr('action');

            $E.submit(function() {

                $S.onBeforeSubmit.apply(el);

                if ($S.autolock) {
                    // disable submit button
                    $E.find(':submit').attr('disabled', 'disabled');
                }

                var tmpIFrame = document.getElementById(formId);
                if (!tmpIFrame) {
                    tmpIFrame = document.createElement("iframe");
                    tmpIFrame.style.display = "none";
                    tmpIFrame.setAttribute("id", formId);
                    tmpIFrame.setAttribute("name", formId);
                    tmpIFrame.addEventListener('load', function() {
                        var response = "";

                        if (tmpIFrame.contentDocument) {
                            response = tmpIFrame.contentDocument.getElementsByTagName('body')[0].innerHTML;
                        } else if ( tmpIFrame.contentWindow ) {
                            response = tmpIFrame.contentWindow.document.getElementsByTagName('body')[0].innerHTML;
                        }

                        if ($S.json) {
                            var json = null;
                            if (response !== "") {
                                try {
                                    json = $.parseJSON(response);
                                } catch (error) {
                                    $S.onError.apply(el, [error, response]);
                                }
                            }

                            $S.onAfterSubmit.apply(el, [json, response]);
                        } else {

                            $S.onAfterSubmit.apply(el, [response]);
                        }

                        if ($S.autolock) {
                            // enable submit button
                            $E.find(':submit').removeAttr('disabled');
                        }
                    }, true);

                    tmpIFrame.addEventListener('onerror', function() {
                        $S.onError.apply(el, []);

                        if ($S.autolock) {
                            // enable submit button
                            $E.find(':submit').removeAttr('disabled');
                        }
                    }, true);

                    document.body.appendChild(tmpIFrame);

                    $E.attr('action', url);
                    $E.attr('target', formId);
                    if ($S.post) {
                        $E.attr('method', 'post');
                    }
                    // if found file input change enctype
                    if ($E.find('input[type="file"]').length) {
                        $E.attr('enctype', 'multipart/form-data');
                    }
                }

                return true;
            });

        });

    };

})(jQuery);
