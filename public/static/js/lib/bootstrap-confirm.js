/* ===================================================
 * confirmModal by Maxime AILLOUD
 * https://github.com/mailloud/confirm-bootstrap
 * ===================================================
 *            DO WHAT THE FUCK YOU WANT TO PUBLIC LICENCE
 *                    Version 2, December 2004
 *
 * Copyright (C) 2004 Sam Hocevar <sam@hocevar.net>
 *
 * Everyone is permitted to copy and distribute verbatim or modified
 * copies of this licence document, and changing it is allowed as long
 * as the name is changed.
 *
 *            DO WHAT THE FUCK YOU WANT TO PUBLIC LICENCE
 *   TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION
 *
 *  0. You just DO WHAT THE FUCK YOU WANT TO.
 * ========================================================== */


 (function($) {
    $.confirmModal = function(opts)
    {
        var body = $('body');
        var defaultOptions    = {
            confirmTitle     : '确认提示',
            confirmMessage   : '确定执行该操作 ?',
            confirmOk        : '确定',
            confirmCancel    : '取消',
            confirmDirection : 'rtl',
            confirmStyle     : 'primary',
            confirmCallback  : defaultCallback,
            confirmDismiss   : true
        };

        var headModalTemplate =
            '<div class="modal fade" id="#modalId#" tabindex="-1" role="dialog" aria-labelledby="#AriaLabel#" aria-hidden="true">' +
                '<div class="modal-dialog">' +
                    '<div class="modal-content">' +
                        '<div class="modal-header">' +
                            '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
                            '<h4 id="#AriaLabel#" class="modal-title">#Heading#</h4>' +
                        '</div>' +
                        '<div class="modal-body">' +
                            '<p>#Body#</p>' +
                        '</div>' +
                        '<div class="modal-footer">' +
                        '#buttonTemplate#' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>'
            ;

        var options = $.extend({}, defaultOptions, opts);

        // var confirmLink = $(this);
        // var targetData  = confirmLink.data();
        //
        // $.extend(options, targetData);

        var modalId = "confirmModal";
        var modalTemplate = headModalTemplate;
        var buttonTemplate =
                '<button class="btn btn-default" data-dismiss="modal">#Cancel#</button>' +
                '<button class="btn btn-#Style#" data-dismiss="ok">#Ok#</button>'
            ;

        if(options.confirmDirection == 'ltr')
        {
            buttonTemplate =
                '<button class="btn btn-#Style#" data-dismiss="ok">#Ok#</button>' +
                '<button class="btn btn-default" data-dismiss="modal">#Cancel#</button>'
            ;
        }

        var confirmTitle = options.confirmTitle;
        if(typeof options.confirmTitle == 'function')
        {
            confirmTitle = options.confirmTitle.call(this);
        }

        var confirmMessage = options.confirmMessage;
        if(typeof options.confirmMessage == 'function')
        {
            confirmMessage = options.confirmMessage.call(this);
        }

        modalTemplate = modalTemplate.
        replace('#buttonTemplate#', buttonTemplate).
        replace('#modalId#', modalId).
        replace('#AriaLabel#', confirmTitle).
        replace('#Heading#', confirmTitle).
        replace('#Body#', confirmMessage).
        replace('#Ok#', options.confirmOk).
        replace('#Cancel#', options.confirmCancel).
        replace('#Style#', options.confirmStyle)
        ;

        var confirmModal = $('#' + modalId);
        if(confirmModal.size() > 0){
            confirmModal.remove();
        }
        body.append(modalTemplate);

        confirmModal = $('#' + modalId);

        $('button[data-dismiss="ok"]', confirmModal).on('click', function(event) {
            if (options.confirmDismiss) {
                confirmModal.modal('hide');
            }
            options.confirmCallback();
        });

        //if (options.confirmAutoOpen) {
        confirmModal.modal('show');
        //}

        function defaultCallback(target, modal)
        {
            //window.location = $(target).attr('href');
        }
    };
})(jQuery);
