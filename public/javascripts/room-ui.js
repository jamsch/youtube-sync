/**
 * Created by James on 30-Dec-15.
 */
$(document).ready(function(){
    //Dragging userlist and chatbox
    $('#drag').on('mousedown', function(e){
        var $dragable = $(this).parent(),
            startHeight = $dragable.height(),
            pY = e.pageY;
        $(document).on('mouseup', function(e){
            $(document).off('mouseup').off('mousemove');
        });
        $(document).on('mousemove', function(me){
            var my = (me.pageY - pY);
            $dragable.css({
                height: startHeight + my,
            });
        });
    });
});