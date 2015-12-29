/**
 * Created by James on 30-Dec-15.
 */
$(document).ready(function(){
    //Dragging userlist and chatbox
    $('#drag').on('mousedown', function(e){
        var $dragable = $(this).parent(),
            startHeight = $dragable.height(),
            pX = e.pageY;
        console.log('dragging');
        $(document).on('mouseup', function(e){
            $(document).off('mouseup').off('mousemove');
        });
        $(document).on('mousemove', function(me){
            var my = (me.pageY - pX);
            $dragable.css({
                height: startHeight + my,
            });
        });
    });
});