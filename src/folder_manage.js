/**
 * Created by westonnovelli on 7/13/15.
 */

function none(){}

function save_link(id, parent) {
    $.ajax({
        url: "http://localhost:8000/add_item/",
        data: {"query": id,
               "parent": parent,
               "ajax_source": true},
        success: function(result){
            btn = $('#btn-save-'+id);
            btn.html('<span style="color:white;" class="glyphicon glyphicon-floppy-saved"></span>');
            btn.addClass('btn-success');
            btn.removeClass('btn-primary');
            btn.prop('onclick',null).off('click');
            $("#btn-remove-"+id).show();
            $("#folders").html(result);
            set_click_handlers();
        }
    });

}

function reset_result(id, parent, result) {
    btn = $('#btn-save-'+id);
    btn.html('<span style="color:white;" class="glyphicon glyphicon-floppy-save"></span>');
    btn.addClass('btn-primary');
    btn.removeClass('btn-success');
    btn.on('click', function() { save_link(id, parent); });
    $("#folders").html(result);
    $("#btn-remove-"+id).hide();
    set_click_handlers();
}

function remove_link(id, parent) {
    $.ajax({
        url: "http://localhost:8000/remove_item/",
        data: {"query": id,
               "parent": parent,
               "ajax_source": true},
        success: function(result){
            reset_result(id, parent, result);
        }
    });
}
