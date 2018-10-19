var ajaxRequest = null;
var patient_record;
var patient_action;
var is_cancel;
var patient_tab_class;
var is_history = '';
var maxupload_count = 6;
window.initial_count = 1;
window.count = 1;
var available_text = "Doctor is available";
var non_available_text = "Doctor not available";


function get_current_date()
{
    var date_instance       = new Date();
    var c_month             = date_instance.getMonth()+1;
    var c_date              = date_instance.getDate();
    var c_year              = date_instance.getFullYear();
    var current_date        = c_year+'-'+c_month+'-'+c_date;
    return current_date;
}

function filterPatient() {
    var searchKeyword = jQuery('input[name = "search-bar"]').val();
    var divcontent = '';
    if (ajaxRequest != null) ajaxRequest.abort();
    if (searchKeyword != '') {
        ajaxRequest = jQuery.ajax({
            url: admin_ajax.ajax_url,
            type: 'POST',
            dataType: 'json',
            data: {
                action: 'get_searched_patients',
                searchKey: searchKeyword
            },
            success: function(response) {
                if (response.status == '200') {
                    var srno = 1;
                    divcontent += '<table>';
                    divcontent += '<thead>';
                    divcontent += '<tr class="patient-email-row">';
                    divcontent += '<th class="patient-email-colum1">Srno</th>';
                    divcontent += '<th class="patient-email-colum2">Patient-Email</th>';
                    divcontent += '<th class="patient-email-colum3">Patient-Name</th>';
                    divcontent += '<th class="patient-email-colum4">Select Patient</th>';
                    divcontent += '</tr></thead>';
                    for (var i = 0; i < response.content.length; i++) {
                     divcontent += '<tr class="patient-email-row2">';
                     divcontent += '<td class="patient-email-colum1">' + srno + '</td>';
                     divcontent += '<td class="patient-email-colum2">' + response.content[i].userEmail + '</td>';
                     divcontent += '<td class="patient-email-colum3">' + response.content[i].display_name + '</td>';
                     divcontent += '<td class="patient-email-colum4"><button type = "button" class = "selected-patient" name ="patientId" patient_name= "' + response.content[i].display_name + '" value ="' + response.content[i].id + '">Seleccionar</button></td>';
                     divcontent += '</tr>';
                     divcontent += '<table>';
                     srno++;
                    }
                    jQuery(".results").html(divcontent);
                    jQuery('#search-icon').show();
                    jQuery('.load').hide();
                } else {
                    jQuery(".results").text("No record Found");
                    jQuery('#search-icon').show();
                    jQuery('.load').hide();
                }
            },
        })
    } else {
        jQuery(".results").html('');
    }
}

function getDoctorList() {
    var selClinic_id = jQuery('select[name="v_clinic"]').val();
    if (window.location.search.indexOf('edit') > -1 || window.location.search.indexOf('clone') > -1) {
        var doctor_id = jQuery('#dram_dct_id').val();
    } else {
        var doctor_id = '';
    }
    var docPan = '';
    jQuery('.clinica-hospital').find('.spinner').addClass('is-active');
    if (selClinic_id != '') {
        jQuery.ajax({
            url: admin_ajax.ajax_url,
            type: 'POST',
            dataType: 'json',
            data: {
                action: 'dram_clinic_doctorList',
                sdClinic_id: selClinic_id
            },
            success: function(response) {
                if (response.status == '200') {
                    docPan += '<option value="">Select Doctor</option>';
                    (response.content).forEach(function(item) {
                        if (doctor_id == item.id) $getVal = 'selected=selected';
                        else $getVal = '';
                        docPan += '<option value="' + item.id + '" ' + $getVal + '>' + item.name + '</option>';
                    })
                    jQuery('#doctor').html(docPan);
                }
            },
        }).done(function() {
            console.log("success");
            jQuery('.clinica-hospital').find('.spinner').removeClass('is-active');
        }).fail(function() {
            console.log("error");
        }).always(function() {
            console.log("complete");
        });
    }
}

/*Get patient name Details
*/
function get_patient_name_details()
{
    jQuery.ajax({
        url: admin_ajax.ajax_url,
        type: 'POST',
        dataType: 'json',
        data: 'action=dram_get_patient_name_details',
        success: function(response) {
            jQuery(".dram-patient-dashboard-name").text(response.patient_name);
        }
    })
}

/*Get personal information of selected patient*/
function get_patient_personal_info() {
    var currentLi = jQuery(".patient-tabs").find('li.pattab-link.current');
    var patientId = '';
    jQuery(".loading-screen-cover").show();
    jQuery(".app-status").text('');
    jQuery(".appointment-book-mess").text('');
    jQuery(".show-checkbox").hide();

    if(jQuery('.active-patient').val()!='' && jQuery('.active-patient').length > 0)
    {
        patientId = jQuery('.active-patient').val();
    }   
    patient_name = jQuery('.active-patient').attr('patient_name');
    jQuery(".selected-pat-name").text(patient_name);
    jQuery.ajax({
        url: admin_ajax.ajax_url,
        type: 'POST',
        dataType: 'json',
        data: 'action=get_patient_personal_info' + '&patient_id=' + patientId,
        success: function(response) {
            jQuery(".loading-screen-cover").hide();
            if (jQuery.trim(response.content) != '') {
                var db_content = response.content;
                jQuery(".selected-pat-name").text(db_content['pat-name'] + " " + db_content['pat-lastname']);
                if (db_content.profile_image.trim() != '') jQuery('#profile_image').attr('src', db_content.profile_image);
                else jQuery('#profile_image').attr('src', profile_object.profile_url);
                jQuery.each(db_content, function(key, value) {
                    if (jQuery('.current').find('input[name="' + key + '"]').length > 0) jQuery('.current').find('input[name="' + key + '"]').val(value);
                    else if (jQuery('.current').find('select[name="' + key + '"]').length > 0) jQuery('.current').find('select[name="' + key + '"]').val(value);
                    else jQuery('.current').find('textarea[name="' + key + '"]').val(value);
                });
            }
        }
    })
}

/*Get background information of selected patient*/
function get_patient_background_info() {
    patientId = jQuery('.active-patient').val();
    jQuery(".loading-screen-cover").show();
    jQuery.ajax({
        url: admin_ajax.ajax_url,
        type: 'POST',
        dataType: 'json',
        data: 'action=get_patient_background_info' + '&patient_id=' + patientId,
        success: function(response) {
            jQuery(".loading-screen-cover").hide();
            if (jQuery.trim(response.content) != '') {
                var db_content = response.content;
                jQuery.each(db_content, function(key, value) {
                    if (jQuery('.current').find('input[name="' + key + '"]').length > 0) jQuery('.current').find('input[name="' + key + '"]').val(value);
                    else if (jQuery('.current').find('select[name="' + key + '"]').length > 0) jQuery('.current').find('select[name="' + key + '"]').val(value);
                    else jQuery('.current').find('textarea[name="' + key + '"]').val(value);
                });
            }
        }
    })
}

/*Get specialty information of selected patient*/
function get_patient_speciality_info() {
    patientId = jQuery('.active-patient').val();
    jQuery(".loading-screen-cover").show();
    jQuery.ajax({
        url: admin_ajax.ajax_url,
        type: 'POST',
        dataType: 'json',
        data: 'action=get_patient_speciality_info' + '&patient_id=' + patientId,
        success: function(response) {
            jQuery(".loading-screen-cover").hide();
            if (response.status == '200') {
                jQuery(".main-speciality").html(response.content);
            }
        }
    })
}

/*Get all queries(consultation) data for patient
*/
function get_patient_queries_info() {
    var select_content = '';
    var i;
    var count = 1;
    var table_content = '';
    jQuery(".loading-screen-cover").show();
    patientId = jQuery('.active-patient').val();
    jQuery.ajax({
        url: admin_ajax.ajax_url,
        type: 'POST',
        dataType: 'json',
        async: false,
        data: 'action=get_patient_appointment_history' + '&patient_id=' + patientId,
        success: function(response) {
            jQuery(".loading-screen-cover").hide();
            if (response.status == '200') {

                /*Append dropdown for appointment number selection for entering consultation data*/
                if (jQuery("#app_history").length == 0) {
                    select_content += '<div class="bootstrap-timepicker timepicker clinica-hospital patient-fileds ">';
                    select_content += '<select name="appointment_history" id = "app_history">';
                    select_content += '<option value = "">--Select Appointment No--</option>';
                    jQuery(".queries-form").prepend(select_content);
                }
                jQuery("select[name = appointment_history]").html('');
                jQuery("select[name = appointment_history]").html('<option value = "">--Select Appointment No--</option>');
                for (i = 0; i < response.content.length; i++) {
                    jQuery("select[name = appointment_history]").append(jQuery("<option></option>").attr("value", response.content[i]).text(response.content[i]));
                }
            } else if (response.status == '400') {
                jQuery("select[name = appointment_history]").remove();
            }
        }
    })
    jQuery(".loading-screen-cover").show();

    /*Get previous consultation reports of patient*/
    jQuery.ajax({
        url: admin_ajax.ajax_url,
        type: 'POST',
        dataType: 'json',
        data: 'action=get_patient_queries_info' + '&patient_id=' + patientId,
        success: function(response) {
            jQuery(".loading-screen-cover").hide();
            if (response.status == '200') {
                for (i = 0; i < response.content.length; i++) {
                    table_content += '<tr class = "doctor-row"><td class = "doctor-name-c">' + response.content[i].doctor_name + '</td>';
                    table_content += '<td>' + response.content[i].consultation_date + '</td>';
                    table_content += '<td class = "doctor-row-id"><a app_clinic_id = ' + response.content[i].clinic_id + ' report_id = ' + response.content[i].doctor_id + ' id = "showpost-' + response.content[i].meta_id + '" class = "query_detail" style="cursor: pointer;">See Details</a></td></tr>';
                }
                jQuery(".doctor-list").html(table_content);
            }
            if (response.status == '400') {
                jQuery(".doctor-list").html('');
            }
        }
    })
}

jQuery.noConflict();
function dram_initialize_datepicker(jQuery){
        if (jQuery('.appdate').length > 0) {
            jQuery('#app_date').datepicker({
                format: "dd-mm-yyyy",
                autoclose: true
            });
            jQuery('.date1').datepicker({
                format: "dd-mm-yyyy",
                autoclose: true
            });
            jQuery('#timepicker1').timepicker();
        }

        if (jQuery('.date').length > 0) 
        {
            jQuery('.date').datepicker({
                format: "dd/mm/yyyy",
                autoclose: true
            });
            jQuery('#timepicker1').timepicker();
            jQuery('#timepicker2').timepicker();
        }

        if (jQuery('.dob').length > 0) 
        {
            jQuery('#dob').datepicker({
                format: "dd-mm-yyyy",
                autoclose: true
            });
            jQuery('.date1').datepicker({
                format: "dd-mm-yyyy",
                autoclose: true
            });
            jQuery('#timepicker1').timepicker();
        }
    }

/*Patient Dashboard info*/
/*get appointment listing(upcoming and history) for patient
*/

function dram_get_patient_appointments()
{
    jQuery(".loading-screen-cover").show();
    jQuery.ajax({
            url: admin_ajax.ajax_url,
            type: 'POST',
            dataType: 'json',
            data: 'action=dram_patient_upcoming_app'+ '&is_history=' + is_history,
            async: false,
            success: function(response) {
            jQuery(".loading-screen-cover").hide();
            if (response.status == '200') {
                var  table_content = '';
                console.log(response.content.length);
                for (i = 0; i < response.content.length; i++) {
                        table_content += '<tr dram-data-attr = '+response.content[i].patient_appointment_no+' class = "dram_patient_app_data"><td>' + response.content[i].appointment_date +response.content[i].appointment_time+ '</td>';
                        table_content += '<td>' + response.content[i].doctor_name + '</td>';
                        table_content += '<td>' + response.content[i].clinic_name + '</td>';
                        if(patient_tab_class!='' && patient_tab_class != 'patdata-app-history')
                        {
                             table_content += '<td> <div class="dropdown">';
                             table_content +=    '<button class="btn btn-primary patient-dash-dropdown" type="button">Cancel';
                             table_content +=      '<span class="caret"></span></button>';
                             table_content +=     '<ul class="dropdown-menu dropdown-menu-right dram-patient-selection">';
                             table_content +=      '<div class="dropdown-divider">PLEASE SELECT A REASON:';
                             table_content +=       '</div>';
                             table_content +=       '<li><a class = "dram-patient-app-action" action-data-attr = "reschedule">Re-schedule Appointment</a></li>';
                             table_content +=       '<li><a class = "dram-patient-app-action" action-data-attr = "cancel">Cancel appointment</a></li>';
                             table_content +=       '</ul>';
                             table_content +=    '</div></td>';
                        }
                        table_content += '</tr>';
                    }
                    /*Append data for Upcoming appointment section*/
                    if(patient_tab_class!='' && patient_tab_class != 'patdata-app-history')
                    {
                        jQuery(".dram-patient-upcoming-app-body").html(table_content);
                    }
                    /*Append data for appointment history section*/
                    else
                    {
                        jQuery(".dram-patient-history-app-body").html(table_content);
                    }
                }
                if (response.status == '400') {
                    console.log('else condition');
                    /*Append data for Upcoming appointment section*/
                    if(patient_tab_class!='' && patient_tab_class != 'patdata-app-history')
                    {
                        jQuery(".dram-patient-upcoming-app-body").html('<div style="padding: 10px auto 10px auto; text-align: center;width:100%;">No Appointments found</div>');
                    }
                    /*Append data for appointment history section*/
                    else
                    {
                        jQuery(".dram-patient-history-app-body").html('<div style="padding: 10px auto 10px auto; width:100%;">No Appointments found</div>');
                    }
                }
            }
        })
}


function dram_cancel_reschedule_appointment()
{
    jQuery(".loading-screen-cover").show();
     jQuery.ajax({
        url: admin_ajax.ajax_url,
        type: 'POST',
        dataType: 'json',
        data: 'action=dram_patient_cancel_reschedule_appointment'+'&patient_record='+patient_record+'&is_cancel='+is_cancel,
        async: false,
        success: function(response) {
            dram_get_patient_appointments();
            if(patient_action == 'reschedule')
            {   
                bookAppointment(jQuery);
            }
        }
    }) 
}

//Initialize book appointment form
function bookAppointment(jQuery)
{
    jQuery('ul.nav li').removeClass('active current');
    jQuery('#dram_appointment_button').parent('li').addClass('active current');
    if(jQuery(".patient-schedule-left").length == 0)
    {    
        jQuery(".loading-screen-cover").show();
        jQuery.ajax({
            url: admin_ajax.ajax_url,
            type: 'POST',
            dataType: 'json',
            data: 'action=dram_get_registration_content',
            success: function(response) {
                jQuery(".loading-screen-cover").hide();
                jQuery('.dram_tab_content').hide();
                
                jQuery('div.current').append(response.content);
                jQuery('.patient-schedule-left').css({'margin':'0 auto','float':'none'});
                dram_initialize_datepicker(jQuery); //Call datepicker function to initialize datepicker 
            },
        })
    }
}

function dram_set_doctor_session()
{
    /*Get id of current logged in doctor*/
    jQuery.ajax({
        url: admin_ajax.ajax_url,
        type: 'POST',
        dataType: 'json',
        data: 'action=get_logged_doctor',
        async: false,
        success: function(response) {
            console.log(response);
            doctorid = response.doctor_id;
            window.doctorid = response.doctor_id;
        }
    })
}

function get_dates_of_week(seldate)
{
    console.log("seldate");
    console.log(seldate);
    var dd = seldate.getDate();
    var mm = seldate.getMonth() + 1;
    var y = seldate.getFullYear();

   /* var curr        = new Date;
    var first_date;
    console.log("curr");
    console.log(curr);
    console.log("seldate");
    console.log(seldate);
    var firstyear   = new Date(curr.setDate(seldate)).getFullYear();
    var firstmonth  = new Date(curr.setDate(seldate)).getMonth() + parseInt(1);
    console.log("month");
    console.log(firstmonth);
    var firstdate   = new Date(curr.setDate(seldate)).getDate();
    if(firstmonth < 10)
    {
        firstmonth  = '0'+firstmonth;
    }*/
    first_date  = y +'-'+mm+'-'+dd;
    // var first_date['changed_date_format']  = firstmonth+'/'+firstdate+'-'+firstyear;

    return first_date;
}

 

jQuery.noConflict();
jQuery(document).ready(function(jQuery) {

    jQuery('body').on('click','.handlediv', function(){
    jQuery(this).parent().find('.inside').toggle();
});


    /*Initialize datepicker and timepicker
    */
    dram_initialize_datepicker(jQuery);

    //check if current user role is patient
    if(loggeduser_role.user_role == cm_patient_dashboard.patient)
    {
        dram_get_patient_appointments();
        get_patient_name_details();
    }
    //check if current usre role is doctor,set doctor session id
    if(loggeduser_role.user_role == cm_doctor_dashboard.doctor)
    {
        dram_set_doctor_session();
    }

    /*Reschedule/Cancel patient appointment*/
    jQuery('body').on('click',".dram-patient-app-action",function(){
       patient_record = jQuery(this).closest('tr').attr("dram-data-attr");
       patient_action = jQuery(this).attr('action-data-attr');
       if(patient_action == 'cancel')
       {
            is_cancel = 1;
       }
       else
       {
            is_cancel = '';
       }
       dram_cancel_reschedule_appointment();
    });

    jQuery('body').on('click','.dram_forgot_password',function(){
        var append_content = '';
        append_content +=  '<form method="post" class="form_dram_ResetPassword">';
        append_content +=       '<p>Lost your password? Please enter your username or email address. You will receive a link to create a new password via email.</p>';
        append_content +=       '<p>';
        append_content +=       '<label for="user_login">Username or email</label>';
        append_content +=       '<input type="text" name="dram_user_login" id="dram_user_login">';
        append_content +=       '</p>';
        append_content +=       '<div class="clear"></div>';
        append_content +=       '<p>';
        append_content +=       '<input type="hidden" name="dram_reset_password" value="true">';
        append_content +=       '<button type="submit" class="dram_reset_password_req" value="Reset password">Reset password</button>';
        append_content +=       '</p>';
        append_content +=  '</form>';

        jQuery(".dram_login_container").html(append_content);
    });

    jQuery('body').on('click','.dram_reset_password_req',function(){
            var user_email = jQuery("#dram_user_login").val();
            var append_content = '';
            jQuery.ajax({
                url: admin_ajax.ajax_url,
                type: 'POST',
                dataType: 'json',
                data: 'action=dram_send_pasword_reset_mail'+'&user_email='+user_email,
                async: false,
                success: function(response) {
                    if(response.status == '200')
                    {
                        append_content += '<div class="messageBox">';
                        append_content += '<p>Password reset email has been send</p>';
                        append_content += '<p>A password reset email has been sent to the email address linked to your account.Please wait atleast 10 minutes before attempting another request</p>';
                        append_content += '</div>';
                    }
                    if (response.status == '500')
                    {
                        append_content += '<p class = "appointment-book-mess red">Email Id does not exist</p>';
                        jQuery(".dram_login_container").append(append_content);
                        return false;
                    }
                    if(response.status == '400')
                    {
                        append_content += '<p>Error in sending email</p>';
                    }
                    jQuery(".dram_login_container").html(append_content);
                }   
            }) 
            return false;
    });

    jQuery('body').on('click','#dram_reset_password',function(){
            var user_password = jQuery("#dram_set_password").val();
            var append_content = '';
            jQuery.ajax({
            url: admin_ajax.ajax_url,
            type: 'POST',
            dataType: 'json',
            data: 'action=dram_set_user_pasword'+'&user_password='+user_password,
            async: false,
            success: function(response) {
                if(response.status == '200')
                {
                    append_content += 'Your Password has been set.<a href="'+login_object.login_url+'">Log in</a>' ;
                }
                else
                {
                    append_content += 'Error in setting your password.Please Try again';
                }
                jQuery("#login-form").html(append_content);
            }
        })
        return false;
    });

   
    /*Get detail of selected consultation report*/
    jQuery('body').on('click', '.query_detail', function() {
        var selected_id = jQuery(this).attr('id');
        var i;
        var doctorid = jQuery(this).attr('report_id');
        var clinic_id = jQuery(this).attr('app_clinic_id');
        var doctor_name_content = '<input type = "hidden" name = "doctor_report_id" value = "' + doctorid + '">';
        var clinic_name_content = '<input type = "hidden" name = "app_clinic_id" value = "' + clinic_id + '">';
        var images_data;
        var input_val = jQuery("input[name = doctor_report_id]").val();
        if (input_val != undefined) {
            jQuery("input[name = doctor_report_id]").val(doctorid);
        } else {
            jQuery(".queries-table").append(doctor_name_content);
        }
        var value = selected_id.split('-');
        var metaid_value = value[1];
        var meta_id_content = '<input type = "hidden" name = "meta_id" value = "' + metaid_value + '">';
        var meta_val = jQuery("input[name = meta_id]").val();
        var clinic_val = jQuery("input[name = app_clinic_id]").val();
        if (meta_val != undefined) {
            jQuery("input[name = meta_id]").val(metaid_value);
        } else {
            jQuery(".queries-table").append(meta_id_content);
        }
        if (clinic_val != undefined) {
            jQuery("input[name = app_clinic_id]").val(clinic_id);
        } else {
            jQuery(".queries-table").append(clinic_name_content);
        }
        clinic_val = jQuery("input[name = app_clinic_id]").val();
        patientId = jQuery('.active-patient').val();
        jQuery.ajax({
            url: admin_ajax.ajax_url,
            type: 'POST',
            dataType: 'json',
            data: 'action=get_queries_report' + '&patient_id=' + patientId + '&specialmeta_id=' + metaid_value,
            success: function(response) {
                if (jQuery.trim(response.content) != '') {
                    var db_content = response.content;
                    var append_content = '';
                    var preview_content = '';
                    var pdf;
                    var imageCount = jQuery('.photo-gallery').length;
                    images_data = db_content['consultation-images'];
                    console.log(images_data.length);
                    jQuery(".add-files-browser").remove();
                    // if (images_data.length > 0) window.initial_count = images_data.length;
                    window.initial_count = 1;
                    if (images_data != '') {
                        jQuery.each(images_data, function(key, value) {
                            file_extension = value['image'].split('.').pop();
                            if (file_extension == 'pdf') {
                                pdfsrc = value['image'];
                                value['image'] = image_object.image_url;
                            } else {
                                pdfsrc = '';
                            }
                            image_id = i + parseInt(1);
                            append_content += '<div class="add-files-browser">'
                            append_content += '<input type="file" class="upload-photo" style = "display:none;" value_count = "count-' + key + '"  name="file[]"><span><img class = "photo-gallery" id = "' + key + '" src="' + value['image'] + '" pdfsrc = "' + pdfsrc + '" alt="" /><a class="removeImage" href="javascript:void(0)"><i class="far fa-times"></i></a></span>';
                            append_content += '<input type="hidden" class="existing_pics" id = "count-' + key + '" name="existing_id[]" value = "' + key + '"></div>';
                            if (value['comments'] != null) var comments = value['comments'];
                            else var comments = "";
                            preview_content += '<div style = "display:none" id="image-preview-' + key + '" class="image-popup" style="display: block;"><div class="image-view"><img class="show-image" src="' + value['image'] + '"></div><div class="comments-section"><textarea name="textarea_name[' + key + ']" id="" class="textarea" contenteditable="true">' + comments + '</textarea></div><button name="save-comments">Save</button></div>';
                            jQuery(".add-files-div").append(append_content);
                            jQuery('#image-preview-' + key).remove();
                            jQuery("#pattab-5").append(preview_content);
                            append_content = '';
                            preview_content = '';
                            window.initial_count++;
                        });
                    }
                    if (imageCount <= maxupload_count) {
                        append_content += '<div class="add-files-browser" value_count = "' + window.initial_count + '" >'
                        append_content += '<input type="file" class="upload-photo" style = "display:none;" value_count = "count-' + window.initial_count + '"  name="file[]"><div>';
                        jQuery(".add-files-div").append(append_content);
                    }
                    jQuery.each(db_content, function(key, value) {
                        if (jQuery('.current').find('input[name="' + key + '"]').length > 0) jQuery('.current').find('input[name="' + key + '"]').val(value);
                        else if (jQuery('.current').find('select[name="' + key + '"]').length > 0) jQuery('.current').find('select[name="' + key + '"]').val(value);
                        else jQuery('.current').find('textarea[name="' + key + '"]').val(value);
                    });
                    jQuery('#print-recipe').prop('disabled', false);
                }
            }
        })
    });

    /*Select user profile image*/
    jQuery(".cm_user_profile_image").change(function() {
        var reader = new FileReader();
        reader.onload = function(e) {
            jQuery("#cm_user_profile_image img").attr("src", e.target.result);
        }
        reader.readAsDataURL(jQuery(this)[0].files[0]);
    });

    jQuery('body').on('click', '#anchor-upload-attachments', function() {
        if (window.initial_count <= maxupload_count)
        {
          jQuery('.upload-photo').eq(jQuery('.upload-photo').length - 1).click();
        }
    });
    
    jQuery("body").on("change", ".upload-photo", function(event) {
        var input = jQuery(event.currentTarget);
        var file = input[0].files[0];
        var append_content = '';
        var current_input = jQuery(this);
        var current_value = jQuery(this).attr('value_count');
        var imageCount = jQuery('.photo-gallery').length;
        if (jQuery('.photo-gallery').length > 0) {
            window.initial_count = jQuery('img.photo-gallery').length + 1;
            // window.initial_count = parseInt(window.initial_count) + 1;
        }
        var reader = new FileReader();
        reader.onload = function(e) {
            if (window.initial_count <= maxupload_count) {
                append_content += '<div class="add-files-browser" value_count = "post-' + window.initial_count + '" >'
                append_content += '<input type="file" class="upload-photo" style = "display:none;" value_count = "count-' + window.initial_count + '"  name="file[]"><div>';
                jQuery(".add-files-div").append(append_content);
                if (file.type != 'application/pdf') {
                    current_input.parents('.add-files-browser').append('<span><img class = "photo-gallery" id = "' + window.initial_count + '" src="' + e.target.result + '" pdfsrc = "" alt="" /><a class="removeImage" href="javascript:void(0)"><i class="far fa-times"></i></a></span>');
                } else {
                    current_input.parents('.add-files-browser').append('<span><img class = "photo-gallery" id = ""' + window.initial_count + '" src="' + image_object.image_url + '" pdfsrc = "' + e.target.result + '" alt="" /><a class="removeImage" href="javascript:void(0)"><i class="far fa-times"></i></a></span>');
                }
                window.initial_count++;
            } else {
                alert("Max upload number reached");
                jQuery("#anchor-upload-attachments").prop('disabled','true');
                return false;
            }
        }
        reader.readAsDataURL(jQuery(this)[0].files[0]);
    });

    jQuery('body').on('click', '.removeImage', function() {
        var key = jQuery(this).parents('.add-files-browser').eq(0).find('img').attr('id');
        jQuery(this).parents('.add-files-browser').remove();
        jQuery('#image-preview-' + key).remove();
        window.initial_count--;
        return false;
    });

    jQuery('body').on('click', 'button[name = save-comments]', function() {
        jQuery(this).parents('.image-popup').eq(0).hide();
    });

    jQuery('body').on('click', '.photo-gallery', function() {
        var image_src = jQuery(this).attr('src');
        var pdfsrc = jQuery(this).attr('pdfsrc');
        var image_id = jQuery(this).attr('id');
        fileExtension = image_src.split('.').pop();
        if (pdfsrc != '') {
            window.open(pdfsrc);
        } else {
            append_textarea = '<div id = "image-preview-' + image_id + '" class = "image-popup"><div class = "image-view"><img class = "show-image" src=""></div><div class = "comments-section"><textarea name = "commentstext[]" id = "" class="textarea" contenteditable="true"></textarea><button name = "save-comments">Save</button></div>';
            if (jQuery('#image-preview-' + image_id).length == 0) {
                jQuery(append_textarea).insertAfter(jQuery('.image-popup').eq(jQuery('.image-popup').length - 1));
                textarea_name = jQuery('.textarea').attr('name');
                // jQuery('.show-image').attr('src', image_src);
                jQuery('#image-preview-' + image_id).find('.show-image').attr('src', image_src);
                // jQuery('.image-popup').show();
                concat_name = 'textarea_name[' + image_id + ']';
                jQuery('.textarea').eq(jQuery('.textarea').length - 1).attr('name', concat_name);
                jQuery('.image-popup').eq(jQuery('.image-popup').length - 1).show();
            } else {
                jQuery('#image-preview-' + image_id).show();
            }
        }
        return false;
    });

/*Hide image popup clicking anywhere in the document*/
    jQuery(document).on('click', function(e) {
        if (jQuery(e.target).closest(".image-popup").length === 0) {
            jQuery(".image-popup").hide();
        }
    });
    jQuery('body').on('click', function() {
            jQuery(".dram-patient-selection").hide();
    });

    /*show create-new form on selecting new query from Queries section*/
    jQuery('body').on('click', '#new-query', function() {
        var currentLi = jQuery(".patient-tabs").find('li.pattab-link.current');
        currentLi.removeClass('current');
        jQuery('.queries-form textarea').val('');
        jQuery('.add-files-browser span').remove();
        jQuery("#pattab-5").removeClass('current');
        jQuery("#pattab-1").addClass('current');
        jQuery('.create-new-pat').click();
        jQuery('.create-new-pat input').val('');
        jQuery('.selected-pat-name').text('');
        jQuery('#profile_image').attr('src', profile_object.profile_url);
        jQuery("button[name=patientId]").removeClass('active-patient');
        return false;
    });

    jQuery('body').on('click', 'button[name=patientId]', function() {
        jQuery(".selected-patient").removeClass('active-patient');
        jQuery(this).addClass('active-patient');
        var currentLi = jQuery(".patient-tabs").find('li.pattab-link.current');
        currentLi.removeClass('current');
        currentLi.next().addClass('current');
        jQuery("#pattab-1").removeClass('current');
        jQuery("#pattab-2").addClass('current');
        get_patient_personal_info();
    });

    jQuery('body').on('click', 'button[name = save-comments]', function() {
        return false;
    });

    window.count = 1;

    /*Print the selected consultation*/
    jQuery('body').on('click', '#print-recipe', function() {
        var print_content = '';
        var iframe_src;
        patientId = jQuery('.active-patient').val();
        doctor_report_id = jQuery('input[name=doctor_report_id]').val();
        app_clinic_id = jQuery('input[name=app_clinic_id]').val();
        var prescription = jQuery('textarea[name=prescription]').val();
        var meta_id = jQuery('input[name=meta_id]').val();
        var originalContents = document.body.innerHTML;
        var clinic_image = '';
        iframe_src = print_object.print_url + '?action=get_print_data' + '&patient_id=' + patientId + '&doctorid=' + window.doctorid + '&doctor_report_id=' + doctor_report_id + '&app_clinic_id=' + app_clinic_id + '&detail=' + meta_id;
        jQuery('body').append('<iframe src=' + iframe_src + ' name="printframe" id="printframe" style="height:0px;width:0px;"></iframe>');
        
        return false;
    });

    if (jQuery('.colorpicker').length > 0) jQuery('.colorpicker').colorpicker();
    jQuery('ul.tabs li').click(function() {
        var tab_id = jQuery(this).attr('data-tab');
        jQuery('.success-msg').remove();
        jQuery('ul.tabs li').removeClass('current');
        jQuery('.tab-content').removeClass('current');
        jQuery(this).addClass('current');
        jQuery("#" + tab_id).addClass('current');
    });

    jQuery('ul.email-tabs li').click(function() {
        console.log(jQuery(this).attr('data-tab'));
        var tab_id = jQuery(this).attr('data-tab');
        jQuery('ul.email-tabs li').removeClass('current');
        jQuery('.tab-content-email').removeClass('current');
        jQuery(this).addClass('current');
        jQuery("#" + tab_id).addClass('current');
    });

/*Doctor dashboard tabs click functionality
*/
    jQuery('body').on('click', 'ul.patient-tabs li', function() {
        patientId = jQuery('.active-patient').val();
        if (patientId != undefined) {
            var tab_id = jQuery(this).attr('data-tab');
            jQuery('ul.patient-tabs li').removeClass('current');
            jQuery('.tab-content').removeClass('current');
            jQuery(this).addClass('current');
            jQuery("#" + tab_id).addClass('current');
            if (tab_id == 'pattab-5') {
                get_patient_queries_info();
            }
            if (tab_id == 'pattab-4') {
                get_patient_speciality_info();
            }
            if (tab_id == 'pattab-3') {
                get_patient_background_info();
            }
            if (tab_id == 'pattab-2') {
                get_patient_personal_info();
            }
        }
    });

/*Patient dashboard tabs click functionality
*/
    jQuery('body').on('click', 'ul.nav li', function(e) {
            patient_tab_class = jQuery(this).attr('pat-data');
            jQuery('ul.nav li').removeClass('active current');
            jQuery('div').removeClass('current');
            jQuery(this).addClass('active current');
            jQuery("." + patient_tab_class).addClass('current');
            jQuery('.dram_tab_content').show();
            jQuery('#pattab').remove();

            if(patient_tab_class == 'patdata-app-history' || patient_tab_class == 'patdata-upcoming-app')
            {
                if(patient_tab_class == 'patdata-app-history')
                {
                    is_history = 1;
                }
                else
                {
                    is_history = '';
                }
                dram_get_patient_appointments();
            }
            if(patient_tab_class == 'patdata-contact-info')
            {
                get_patient_name_details();
                get_patient_personal_info();
            }

            if(patient_tab_class == 'patdata-credentials')
            {
                get_patient_personal_info();
            }
            return false;
    });

    /*Search patients from doctor/assistant login section*/
    jQuery('#search-bar').keyup(function() {
        jQuery('#search-icon').hide();
        jQuery('.load').show();
        filterPatient();  //Show searched patients data
        if (jQuery.trim(jQuery('#search-bar').val()).length) {
            jQuery("#search-bar").addClass('active-text');
        } else {
            jQuery('#search-icon').show();
            jQuery('.load').hide();
            jQuery("#search-bar").removeClass('active-text');
        }
    });
   
    jQuery('body').on('change', '#works', function() {
        if (jQuery(this).val() == '2') {
            jQuery('.date').show();
            jQuery('.schedule').hide();
            jQuery('.weekdays').hide();
        } else {
            if (jQuery(this).val() == '1') {
                jQuery('.date').show();
                jQuery('.weekdays').show();
                jQuery('.schedule').show();
            } 
            else if(jQuery(this).val() == '3'){
                jQuery('.date').hide();
                jQuery('.weekdays').hide();
                jQuery('.schedule').show();
            }else  {
                jQuery('.schedule').hide();
                jQuery('.weekdays').hide();
                jQuery('.date').show();
            }
        }
    })
       
    /*Get doctor list on slecting clinic*/
    if (jQuery('select[name="v_clinic"]').length > 0) {
        if (jQuery('select[name="v_clinic"]').val() != '') getDoctorList();
    }
    jQuery('body').on('change', '#clinic', function() {
        var $this = jQuery(this);
        getDoctorList();
        // if(jQuery('.patient-schedule-right').length>0)
        // {
        //  jQuery('.patient-schedule-right').show();
        // }
    })
    jQuery('body').on('change', '#doctor', function() {
        var $this = jQuery(this);
        if (jQuery('.patient-schedule-right').length > 0) {
            jQuery('.patient-schedule-right').show();
        }
    })
    var tags = new Array;
    var tags_selected = new Array;
    if (jQuery('#postTags').length > 0) {
        jQuery('#postTags').find('option').each(function() {
            var localArray = new Array();
            var value = jQuery(this).val().split('-');
            localArray['id'] = value[0];
            localArray['tag'] = value[1];
            tags.push(localArray);
            if (jQuery(this).attr('data-select') == 1) tags_selected.push(localArray['id']);
        });
    }
    if (jQuery('#tags').length > 0) {
        var $tags = jQuery('#tags');
        $tags.selectize({
            plugins: ['remove_button'],
            delimiter: ',',
            persist: false,
            valueField: 'id',
            labelField: 'tag',
            searchField: ['tag'],
            options: tags,
            items: tags_selected,
            create: function(input) {
                return {
                    id: input,
                    tag: input
                }
            }
        });
    }
    jQuery('ul.tabs-dramc-infor li').click(function(event) {
        /* Act on the event */
        var tab_id = jQuery(this).attr('data-tab');
        jQuery('ul.tabs-dramc-infor li').removeClass('current');
        jQuery('.tab-content').removeClass('current');
        jQuery(this).addClass('current');
        jQuery('#' + tab_id).addClass('current');
    });

/*    Prevent default action on pressing enter key
*/    
    jQuery('body').on('keyup keypress', '#pattab-1', function(e) {
        var keyCode = e.keyCode || e.which;
        if (keyCode === 13) {
            e.preventDefault();
            return false;
        }
    });

    /*Create new patient from doctor/assistant login*/
    jQuery('body').on('click', '.create-new-pat', function() {
        jQuery(".loading-screen-cover").show();
        var select_content = '';
        jQuery.ajax({
            url: admin_ajax.ajax_url,
            type: 'POST',
            dataType: 'json',
            data: 'action=get_logged_doctor_clinic',
            success: function(response) {
                jQuery(".loading-screen-cover").hide();
                if (response.status == '200') {

                    /*Append associated clinic of logged in doctor*/
                    if (jQuery("#clinic1").length == 0) {
                        select_content += '<div class="bootstrap-timepicker timepicker clinica-hospital patient-fileds">';
                        select_content += '<select name="doctor_clinic" id = "clinic1" style = "width:100%;margin-bottom:-12px;">';
                        select_content += '<option value = "">--Select Clinic--</option></div>';
                        jQuery(".create-new-container").prepend(select_content);
                        for (var i = 0; i < response.content.id.length; i++) {
                            if (response.content.id[i] != '') {
                                jQuery("select[name = doctor_clinic]").append(jQuery("<option></option>").attr("value", response.content.id[i]).text(response.content.clinic_name[i]));
                            }
                        }
                    }
                }
            }
        })
        jQuery(".create-new-container").show();
        jQuery(".search-div").hide();  /*Hide search patients section*/
        if (jQuery(".app-status").text() == available_text || jQuery("#force-app:checkbox:checked").length > 0) {
            var appTime = jQuery("#timepicker1").val();
            var appDate = jQuery("#app_date").val();
            var scheduleId = jQuery("#scheduleId").val();
            var userEmail = jQuery("#v_user_email").val();
            var userPhone = jQuery("#v_cell_phone").val();
            var firstName = jQuery("#v_first_name").val();
            var surName = jQuery("#v_sur_name").val();
            var checkDuplicate = 'status';
            var patient_id_content = '';

            /*Book Appointment of patient
            */
            jQuery.ajax({
                url: admin_ajax.ajax_url,
                type: 'POST',
                dataType: 'json',
                data: {
                    action: 'save_patient_schedule',
                    appDate: appDate,
                    appTime: appTime,
                    scheduleId: scheduleId,
                    userEmail: userEmail,
                    userPhone: userPhone,
                    firstName: firstName,
                    surName: surName,
                    checkDuplicate: checkDuplicate,
                },
                success: function(response) {
                    if (response.status == '200') {
                        jQuery('body,html').animate({
                            scrollTop: 0
                        }, 800);
                        if (jQuery(".appointment-book-mess").hasClass("red")) {
                            jQuery(".appointment-book-mess").removeClass("red");
                        }
                        jQuery(".appointment-book-mess").text("Appointment Registered");
                        if (jQuery('button[name = patientId]').length > 0) {
                            jQuery('button[name = patientId]').remove();
                        }
                        patient_id_content += ' <div class="patient-schedule-fields"><button name = "patientId" style = "display:none;" class = "selected-patient" value = "' + response.patient_id + '">Selecet</button></div>';
                        jQuery(".create-new-container").append(patient_id_content);
                        jQuery(".selected-patient").addClass('active-patient');
                        var currentLi = jQuery(".patient-tabs").find('li.pattab-link.current');
                        currentLi.removeClass('current');
                        currentLi.next().addClass('current');
                        jQuery("#pattab-1").removeClass('current');
                        jQuery("#pattab-2").addClass('current');
                        get_patient_personal_info();
                    } else if (response.status == '400') {
                        jQuery(".appointment-book-mess").text("Error in Registering Appointment");
                        patient_id_content += ' <div class="patient-schedule-fields"><button name = "patientId" style = "display:none;" class = "selected-patient" value = "' + response.patient_id + '">Selecet</button></div>';
                        jQuery(".create-new-container").append(patient_id_content);
                        jQuery(".selected-patient").addClass('active-patient');
                        var currentLi = jQuery(".patient-tabs").find('li.pattab-link.current');
                        currentLi.removeClass('current');
                        currentLi.next().addClass('current');
                        jQuery("#pattab-1").removeClass('current');
                        jQuery("#pattab-2").addClass('current');
                        get_patient_personal_info();
                    }
                },
            })
        } else if (jQuery(".app-status").text() == non_available_text && jQuery("#force-app:checkbox:checked").length == 0) {
            alert("Appointment cannot be booked");
            // return false;
        }
        return false;
    });

    /*Submit personal information of patient
    */
    jQuery('body').on('submit', '#pattab-2', function() {
        patientId = jQuery('.active-patient').val();
        jQuery("#form_patientId").val(patientId);
        jQuery("#action").val('save_patient_personal_info');
        var form_data = new FormData(jQuery('#pattab-2')[0]);
    
        patientId = jQuery('.active-patient').val();
        jQuery.ajax({
            url: admin_ajax.ajax_url,
            type: 'POST',
            cache: false,
            contentType: false,
            processData: false,
            dataType: 'json',
            data: form_data,
            success: function(response) {
                if (response.status == '200') {
                    var currentLi = jQuery(".patient-tabs").find('li.pattab-link.current');
                    currentLi.removeClass('current');
                    currentLi.next().addClass('current');
                    jQuery("#pattab-2").removeClass('current');
                    jQuery("#pattab-3").addClass('current');
                    get_patient_background_info();
                }
            },
        })
        return false;
    });

    /*Submit background information of patient
    */
    jQuery('body').on('submit', '#pattab-3', function() {
        patientId = jQuery('.active-patient').val();
        jQuery.ajax({
            url: admin_ajax.ajax_url,
            type: 'POST',
            dataType: 'json',
            data: jQuery('#pattab-3').serialize() + '&action=save_patient_background_info' + '&patientId=' + patientId,
            success: function(response) {
                if (response.status == '200') {
                    var currentLi = jQuery(".patient-tabs").find('li.pattab-link.current');
                    currentLi.removeClass('current');
                    currentLi.next().addClass('current');
                    jQuery("#pattab-3").removeClass('current');
                    jQuery("#pattab-4").addClass('current');
                    get_patient_speciality_info();
                }
            },
        })
        return false;
    });
    var max_fields = 10;
    var mainDiv = ".speciality_container";
    var viewDiv = ".form_view";
    var x = 1;
    jQuery('body').on('click', '.remove-field-speciality', function() {
        jQuery(this).parents(".sectiondiv").eq(0).remove();
    });
    /*Selection of speciality fields by admin*/
    jQuery('body').on('change', 'select[name="field_types"]', function() {
        var option_val = jQuery(this).val();
        if (option_val == '1') {
            var html = '<div class = "sectiondiv"><div class = "form-field speciality-input-label term-group"><div class = "labeltext">Enter Input field label:</div><span><input type = "text" field-type[] = "1" name ="label_name[]" id = "label_name" placeholder = "Enter Label info"><div class = "remove-field-speciality"><i class="fa fa-times" aria-hidden="true"></i></div></span><div class = "form-field term-group"><input type = "hidden" name ="input_name[]" id = "" value = "textfield"></div></div></div>';
            jQuery(mainDiv).append(html);
        }
        if (option_val == '2') {
            jQuery(mainDiv).append('<div class = "sectiondiv"><div class = "form-field speciality-input-label term-group"><div class = "labeltext">Enter Text Area label:</div><span><input type = "text" field-type[] = "2" name ="label_name[]" id = "text_arealabel" placeholder = "Enter Label info"><div class = "remove-field remove-field-speciality"><i class="fa fa-times" aria-hidden="true"></i></div></span><div class = "form-field term-group"><input type = "hidden"  name ="input_name[]" id = "" value = "textarea"></div></div></div>');
        }
        if (option_val == '3') {
            jQuery(mainDiv).append('<div class = "sectiondiv"><div class = "form-field speciality-input-label term-group"><div class = "labeltext">Enter Dropdown label:</div><span><input type = "text" field-type[] = "3" name ="label_name[]" class = "select_label" placeholder = "Enter Label info"><div class = "remove-field remove-field-speciality"><i class="fa fa-times" aria-hidden="true"></i></div></span><div class = "form-field speciality-input-label term-group">Enter Option values in commas:<span><input type = "text" name ="options_values[]" class = "options_values"></span></div><div class = "form-field term-group"><input type = "hidden"  name ="input_name[]" id = "" value = "dropdown"></div></div>');
        }
    });

    jQuery(".remove-field").click(function() {
        e.preventDefault();
        jQuery(this).parent('span').remove();
        x--;
    });

    /*Submit queries (consultation report by doctor)
    */
    jQuery('body').on('submit', '#pattab-5', function() {
        patientId = jQuery('.active-patient').val();
        doctor_report_id = jQuery('input[name=doctor_report_id]').val();
        appointment_no = jQuery('select[name=appointment_history]').val();
        append_content = '';
        var formdata = new FormData(jQuery('#pattab-5')[0]);
        formdata.append('action', 'save_patient_queries_info');
        formdata.append('patientId', patientId);
        jQuery.ajax({
            url: admin_ajax.ajax_url,
            type: 'post',
            contentType: false,
            cache: false,
            processData: false,
            async: false,
            dataType: 'json',
            data: formdata,
            success: function(response) {
                if (response.status == '200') {
                    jQuery('.queries-form textarea').val('');
                    jQuery("input[name = meta_id]").val('');
                    jQuery('.add-files-browser').remove();
                    append_content += '<div class="add-files-browser" value_count = "post-0"><input type="file" class="upload-photo" id="upload-attachments" value_count = "count-0" name="file[]" style="display: none"></div>';
                    jQuery(".add-files-div").append(append_content);
                    // jQuery(".queries-form :textarea").val() = '';
                    get_patient_queries_info();
                    jQuery('body,html').animate({
                        scrollTop: 0
                    }, 800);
                }
            },
        })
        return false;
    });

    jQuery('body').on('click', '#dram_appointment_button', function() {
        bookAppointment(jQuery);    
        return false;
    });

    jQuery('body').on('click', '#dram_pat_update-password', function() {
        jQuery(".password-fields").show();
        return false;
    });

    /*Update patient credentials
    */
    jQuery('body').on('click', '#dram-pat-update-credentials', function() {
        jQuery.ajax({
            url: admin_ajax.ajax_url,
            type: 'POST',
            dataType: 'json',
            data: jQuery('#dram-form-patient-credentials').serialize() +'&action=dram_update_patient_credentials',
            success: function(response) {
                if (response.status == '200') {
                    jQuery(".appointment-book-mess").removeClass("red");
                    jQuery(".appointment-book-mess").addClass("green");
                    jQuery(".appointment-book-mess").text(response.message);
                }
                if (response.status == '500') {
                    jQuery(".appointment-book-mess").removeClass("green");
                    jQuery(".appointment-book-mess").addClass("red");
                    jQuery(".appointment-book-mess").text(response.message);
                }
                if (response.status == '400') {
                    jQuery(".appointment-book-mess").removeClass("green");
                    jQuery(".appointment-book-mess").addClass("red");
                    jQuery(".appointment-book-mess").text(response.message);
                }
            },
        })
        return false;
    });

    /*Update patient's contact info
    */
     jQuery('body').on('click', '#dram-pat-update-info', function() {
        jQuery.ajax({
            url: admin_ajax.ajax_url,
            type: 'POST',
            dataType: 'json',
            data: jQuery('#dram-form-patient-contact').serialize() +'&action=dram_save_patient_contact_info',
            success: function(response) {
                if (response.status == '200') {
                    jQuery(".appointment-book-mess").removeClass("red");
                    jQuery(".appointment-book-mess").addClass("green");
                    jQuery(".appointment-book-mess").text(response.message);
                }
                if (response.status == '500') {
                    jQuery(".appointment-book-mess").removeClass("green");
                    jQuery(".appointment-book-mess").addClass("red");
                    jQuery(".appointment-book-mess").text(response.message);
                }
                get_patient_name_details();
            },
        })
        return false;
    });

    jQuery("#is_notification").change(function() {
        if (jQuery("#is_notification").val() == 'Yes') {
            jQuery(".appnotification-fields").show();
        } else {
            jQuery(".appnotification-fields").hide();
        }
    });

    jQuery("#is_appnotification").change(function() {
        if (jQuery("#is_appnotification").val() == 'Yes') {
            jQuery(".radionotification").show();
        } else {
            jQuery(".radionotification").hide();
        }
    });

/*Save notifications for doctor profile settings
*/
    jQuery("#save-notifications").click(function() {
        jQuery.ajax({
            url: admin_ajax.ajax_url,
            type: 'POST',
            dataType: 'json',
            data: jQuery('#notification_form').serialize() + '&action=save_front_notifications',
            success: function(response) {
                if (response.status == '200') {
                    jQuery(".notification-update-status").text("Notification updated");
                }
            },
        })
        return false;
    });

    /*Update doctor profile 
    */
    jQuery("#save_updatedprofile").click(function() {
        changed_password = jQuery("#password_pat").val();
        changed_email = jQuery("#email_pat").val();
        changed_telephone = jQuery("#tel_pat").val();
        if (changed_password != '' || changed_telephone != '' || changed_email != '') {
            jQuery.ajax({
                url: admin_ajax.ajax_url,
                type: 'POST',
                dataType: 'json',
                data: jQuery('#profile_update_form').serialize() + '&action=change_profile_info',
                success: function(response) {
                    if (response.status == '200') {
                        jQuery(".profile-update-status").text("Profile updated");
                    } else {
                        alert("failure");
                    }
                },
            })
        }
        if (changed_password == '' && changed_telephone == '' && changed_email == '') {
            alert("All blank");
        }
        return false;
    });

    /*Save specialty data for the patient*/
    jQuery('body').on('click', '.save-speciality', function() {
        patientId = jQuery('.active-patient').val();
        jQuery.ajax({
            url: admin_ajax.ajax_url,
            type: 'POST',
            dataType: 'json',
            data: jQuery('#pattab-4').serialize() + '&action=save_patient_speciality_info' + '&patientId=' + patientId,
            success: function(response) {
                if (response.status == '200') {
                    var currentLi = jQuery(".patient-tabs").find('li.pattab-link.current');
                    currentLi.removeClass('current');
                    currentLi.next().addClass('current');
                    jQuery("#pattab-4").removeClass('current');
                    jQuery("#pattab-5").addClass('current');
                    get_patient_queries_info();
                }
            },
        })
        return false;
    });
    jQuery(".remove-patient").click(function() {
        patientId = jQuery('.active-patient').val();
        jQuery.ajax({
            url: admin_ajax.ajax_url,
            type: 'POST',
            dataType: 'json',
            data: 'action=deletePatient' + '&patientId=' + patientId,
            success: function(response) {
                if (response.status == '200') {}
            },
        })
        return false;
    });

    jQuery('body').on('change','select[name="appointment_history"]',function(){
        jQuery('.queries-form textarea').val('');
        jQuery('.queries-table input').val('');
        var item=jQuery(this);
        var appointment_no = item.val();
        var arr = appointment_no.split('-');
        var monthString = 'December';
        var dat = new Date('1 ' + arr[1] + ' 1999');
        var month_number = dat.getMonth()+1;
        var calculated_date = arr[3]+'-'+month_number+'-'+arr[2];
        var current_date = get_current_date();
        // console.log(calculated_date);
        // console.log(get_current_date());
        if(new Date(calculated_date).getTime() > new Date().getTime())
        {
            alert('Selected Appointment Date is a Future Date');
        }
    });

    /*get Results if patient is already existing in records
    */
    jQuery('body').on('click', '#search-existing-patient', function() {
        jQuery(".loading-screen-cover").show();
        patientEmail = jQuery('#v_user_email').val();
        jQuery.ajax({
            url: admin_ajax.ajax_url,
            type: 'POST',
            dataType: 'json',
            data: 'action=get_existing_patient_detail' + '&patientEmail=' + patientEmail,
            success: function(response) {
                jQuery(".loading-screen-cover").hide();
                if (jQuery.trim(response.content) != '') {
                    jQuery(".appointment-book-mess").text('');
                    var db_content = response.content;
                    jQuery.each(db_content, function(key, value) {
                        if (jQuery('.current').find('input[name="' + key + '"]').length > 0) jQuery('.current').find('input[name="' + key + '"]').val(value);
                        else if (jQuery('.current').find('select[name="' + key + '"]').length > 0) jQuery('.current').find('select[name="' + key + '"]').val(value);
                        else jQuery('.current').find('textarea[name="' + key + '"]').val(value);
                    });
                }
                if (response.status == '400') {
                    jQuery(".appointment-book-mess").addClass("red");
                    jQuery(".appointment-book-mess").text(response.message);
                }
            },
        })
        return false;
    });

    /*Check availablity of doctor for booking appointment*/
    jQuery('body').on('click', '#checkavail', function() {
        if (jQuery("#clinic").length > 0) {
            var doctorclinicid = jQuery("#clinic option:selected").val();
        } else if (jQuery("#clinic1").length > 0) {
            var doctorclinicid = jQuery("#clinic1 option:selected").val();
        }
        window.doctorid = jQuery("#doctor option:selected").val();
        var appTime = jQuery("#timepicker1").val();
        var appDate = jQuery("#app_date").val();
        var i = '';
        var forceApp = '';

        /*Check if appointment is booked forcefully
        */
        if (jQuery("#force-app:checkbox:checked").length > 0) {
            forceApp = 'Yes';
        } else {
            forceApp = 'No';
        }
        if (jQuery("#doctor").length == 0) {
            jQuery.ajax({
                url: admin_ajax.ajax_url,
                type: 'POST',
                dataType: 'json',
                data: 'action=get_logged_doctor',
                async: false,
                success: function(response) {
                    console.log('response');
                    doctorid = response.doctor_id;
                    window.doctorid = response.doctor_id;
                }
            })
        }
        if (doctorclinicid != '' && window.doctorid != '' && appTime != '' && appDate != '') {
            jQuery.ajax({
                url: admin_ajax.ajax_url,
                type: 'POST',
                dataType: 'json',
                data: {
                    action: 'get_doctorclinic_schedule',
                    doctorclinicid: doctorclinicid,
                    doctorid: window.doctorid,
                    appDate: appDate,
                    appTime: appTime,
                    forceApp: forceApp
                },
                success: function(response) {
                    if (response.status == '200') {
                        var dataschedule = new Array();
                        for (i = 0; i < response.content.length; i++) {
                            var checkAvailablity = response.content[i].isBetween;
                            var scheduleId = response.content[i].relation_id;
                            if (checkAvailablity == 'Yes') {
                                jQuery(".show-checkbox").hide();
                                jQuery(".app-status").removeClass("red");
                                jQuery(".app-status").text(available_text);
                                jQuery("#scheduleId").val(scheduleId);
                            }
                            if (checkAvailablity == 'No') {
                                jQuery(".app-status").addClass("red");
                                jQuery(".app-status").text(non_available_text);
                                jQuery("#scheduleId").val(scheduleId);
                                jQuery(".show-checkbox").show();
                            }
                        }
                    } else {
                        jQuery(".app-status").addClass("red");
                        jQuery(".app-status").text(non_available_text);
                    }
                },
            })
        } else {
            alert("Please enter all fields");
            return false;
        }
    });

    jQuery('#pattab').on('submit', function() {
        return false;
    });

    //dropdown toggle
    jQuery('body').on('click','.patient-dash-dropdown',function(e){
        e.stopPropagation();
        jQuery('.patient-dash-dropdown').not(this).parent().find(".dram-patient-selection").hide();
        jQuery(this).parent().find(".dram-patient-selection").toggle();
        // jQuery(this).parent().toggleClass('open');
    });

    /*Register appointment by patient from registration page
    */
    jQuery('body').on('click',"#registerApp",function() { 
        if (jQuery(".app-status").text() == available_text) {
            // jQuery(".loading-screen-cover").show();
            var appTime = jQuery("#timepicker1").val();
            var appDate = jQuery("#app_date").val();
            var scheduleId = jQuery("#scheduleId").val();
            var userEmail = jQuery("#v_user_email").val();
            var userPhone = jQuery("#v_cell_phone").val();
            var firstName = jQuery("#v_first_name").val();
            var surName = jQuery("#v_sur_name").val();
            var doctorId = jQuery("#doctor").val();
            jQuery.ajax({
                url: admin_ajax.ajax_url,
                type: 'POST',
                dataType: 'json',
                data: {
                    action: 'save_patient_schedule',
                    appDate: appDate,
                    appTime: appTime,
                    scheduleId: scheduleId,
                    userEmail: userEmail,
                    userPhone: userPhone,
                    firstName: firstName,
                    surName: surName,
                    doctorId: doctorId
                },
                success: function(response) {
                    jQuery(".loading-screen-cover").hide();
                    if (response.status == '200') {
                        jQuery('body,html').animate({
                            scrollTop: 0
                        }, 800);
                        jQuery(".appointment-book-mess").text("Appointment Registered");
                    } else {
                        jQuery(".appointment-book-mess").text(response.message);
                    }
                },
            })
        } else {
            alert("Please check availablity of Doctor");
        }
        return false;
    });

    jQuery('.add-dram-info> .save-day').click(function(event) {
        /* Act on the event */
        var startDate = jQuery('#reportrange').data('daterangepicker').startDate.format('MMMM D, YYYY');
        var endDate = jQuery('#reportrange').data('daterangepicker').endDate.format('MMMM D, YYYY');
        /*alert(startDate);*/
        jQuery('.add-dram-info> .spinner').addClass('is-active');
        jQuery.ajax({
            url: admin_ajax.ajax_url,
            type: 'POST',
            dataType: 'json',
            data: {
                action: 'dram_clinic_NonWorkingList',
                startDate: startDate,
                endDate: endDate
            },
            success: function(response) {
                console.log(response);
                jQuery('.dram_listing_info>ul').append(response.content);
                jQuery('.add-dram-info> .spinner').removeClass('is-active');
            },
        })
    });

    jQuery('body').on("click", ".remove-dram-list", function() {
        /* Act on the event */
        jQuery(this).parent('li').remove();
    });
});

jQuery(function() {
    if (jQuery('#reportrange').length > 0) {
        var start = moment().subtract(29, 'days');
        var end = moment();

        function cb(start, end) {
            console.log(start);
            console.log(end);
            jQuery('#reportrange span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
        }
        jQuery('#reportrange').daterangepicker({
            startDate: start,
            endDate: end,
            /*ranges: {

               'Today': [moment(), moment()],

               'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],

               'Last 7 Days': [moment().subtract(6, 'days'), moment()],

               'Last 30 Days': [moment().subtract(29, 'days'), moment()],

               'This Month': [moment().startOf('month'), moment().endOf('month')],

               'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]

            }*/
        }, cb);
        cb(start, end);
    }
    if (jQuery('#map_canvas').length > 0) {
        var map;
        var d_lat = parseInt((jQuery('#dram-input-lat').val() != '' ? jQuery('#dram-input-lat').val() : '20.96143961409684'));
        var d_lng = parseInt(jQuery('#dram-input-lng').val() != '' ? jQuery('#dram-input-lng').val() : '79.1015625');
        var geocoder;
        var mapOptions = {
            center: new google.maps.LatLng(0.0, 0.0),
            zoom: 12,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        var myLatlng = {
            lat: d_lat,
            lng: d_lng
        };
        console.log(myLatlng);

        function initialize() {
            var myOptions = {
                center: new google.maps.LatLng(d_lat, d_lng),
                zoom: 3,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };
            console.log(myOptions);
            geocoder = new google.maps.Geocoder();
            var map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
            google.maps.event.addListener(map, 'click', function(event) {
                placeMarker(event.latLng);
            });
            var marker = new google.maps.Marker({
                position: myLatlng,
                map: map,
                title: 'Click to zoom'
            });
            var marker;

            function placeMarker(location) {
                if (marker) { //on vérifie si le marqueur existe
                    marker.setPosition(location); //on change sa position
                } else {
                    marker = new google.maps.Marker({ //on créé le marqueur
                        position: location,
                        map: map
                    });
                }
                //console.log(location.lat());
                document.getElementById('dram-input-lat').value = location.lat();
                document.getElementById('dram-input-lng').value = location.lng();
                getAddress(location);
            }

            function getAddress(latLng) {
                geocoder.geocode({
                    'latLng': latLng
                }, function(results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        if (results[0]) {
                            document.getElementById("address1").value = results[0].formatted_address;
                            createCookie('gpslocation', results[0].formatted_address, 7);
                        } else {
                            document.getElementById("address1").value = "No results";
                        }
                    } else {
                        document.getElementById("address1").value = status;
                        createCookie('gpslocation', status, 7);
                    }
                });
            }
        }
        google.maps.event.addDomListener(window, 'load', initialize);
    }
});

(function($) {
$(document).ready(function() {
    var id = 10; 
    var settings_object;
    window.isNextweek;
    jQuery('body').on('change', '#doctor', function() {
        if (jQuery('#calendar').is(':empty'))
        {
            var curr                = new Date; 
            var month               = new Date().getMonth();
            var first               = curr.getDate() - curr.getDay(); // First day is the day of the month - the day of the week
            
            var d = new Date();
            var day = d.getDay(),
            diff = d.getDate() - day + (day == 0 ? -7:0); // adjust when day is sunday
            first = new Date(d.setDate(diff));

            var last                = new Date(); // last day is the first day + 6
            last.setDate(first.getDate()+6);
            window.first_date_week  = get_dates_of_week(first);
            window.last_date_week   = get_dates_of_week(last);
            cm_load_calendar();
        }
        // else
        // {
        //     $calendar = '';
        //     jQuery("#calendar div").html('');
        // }
    })

   function cm_fetch_settings_parameters(data_array)
   {
        jQuery.ajax({
             url: admin_ajax.ajax_url,
             type: 'POST',
             dataType: 'json',
             async : false,
             data: 
             {
                action          :   'cm_get_calendar_initial_settings',
                data_array      :    JSON.stringify(data_array)
             },
                success:function(response){
                    settings_object = response;
                },
        }) 
   }

function cm_load_calendar(){
    if(registration_object.registration_url == window.location.href)
    {
        // var curr        = new Date; 
        // var month       = new Date().getMonth();
        // var first       = curr.getDate() - curr.getDay(); // First day is the day of the month - the day of the week
        // var last        = first + 6; // last day is the first day + 6
        // var first_date_week  = get_dates_of_week(first);
        // var last_date_week   = get_dates_of_week(last);
        var data_array = {};
        data_array['clinic_id']         = jQuery("#clinic").val();
        data_array['doctor_id']         = jQuery("#doctor").val();
        
        cm_fetch_settings_parameters(data_array);   //run ajax to fetch the initial settings
        var $calendar = $('#calendar').weekCalendar({

        timeslotsPerHour:settings_object.timeslotsPerHour,
        timeFormat:settings_object.timeFormat,
        dateFormat:settings_object.dateFormat,
        use24Hour:settings_object.use24Hour,
        daysToShow:settings_object.daysToShow,
        businessHours:settings_object.businessHours,
        defaultEventLength:settings_object.defaultEventLength,
        defaultFreeBusy: {free: false},

        height: function($calendar){
          return $(window).height() - $('h1').outerHeight(true);
        },
        eventRender : function(calEvent, $event) {
            calEvent.end.getTime() == calEvent.start.getTime();
          if (calEvent.end.getTime() < new Date().getTime()) {
            $event.css('backgroundColor', '#aaa');
            $event.find('.wc-time').css({
              backgroundColor: '#ed1c50',
              border:'1px solid #888'
            });
          }
        },
        eventNew : function(calEvent, $event,FreeBusyManager, calendar) {
         var isFree = true;
          $.each(FreeBusyManager.getFreeBusys(calEvent.start, calEvent.end), function() {
            if (
              this.getStart().getTime() != calEvent.end.getTime()
              && this.getEnd().getTime() != calEvent.start.getTime()
              && !this.getOption('free')
            ){
              isFree = false;
              return false;
            }
          });

          if (!isFree) {
            $(calendar).weekCalendar('removeEvent',calEvent.id);
            alert('looks like you tried to add an event on busy part !');
            return false;
          }

         var $dialogContent = $("#event_edit_container");
         resetForm($dialogContent);
         var startField = $dialogContent.find("select[name='start']").val(calEvent.start);
         var endField   = $dialogContent.find("select[name='end']").val(calEvent.end);

         $dialogContent.dialog({
            modal: true,
            title: "New Calendar Event",
            close: function() {
               $dialogContent.dialog("destroy");
               $dialogContent.hide();
               $('#calendar').weekCalendar("removeUnsavedEvents");
            },
            buttons: {
               save : function() {
                alert("test save new event");
                  calEvent.id = id;
                  id++;
                  calEvent.start    = new Date(startField.val());
                  calEvent.end      = new Date(endField.val());
                //When save button is clicked for booking an appointment fetch date/time to save in db

                    jQuery.ajax({
                        url: admin_ajax.ajax_url,
                        type: 'POST',
                        dataType: 'json',
                        data: 
                        {
                            action              :   'test_save_calendar_event',
                            appointment_date    :    calEvent.start,
                            doctorid            :    doctorid
                        },
                    })
                  $calendar.weekCalendar("removeUnsavedEvents");
                  $calendar.weekCalendar("updateEvent", calEvent);
                  $dialogContent.dialog("close");
               },
               cancel : function() {
                  $dialogContent.dialog("close");
               }
            }
         }).show();
         $dialogContent.find(".date_holder").text($calendar.weekCalendar("formatDate", calEvent.start));
         setupStartAndEndTimeFields(startField, endField, calEvent, $calendar.weekCalendar("getTimeslotTimes", calEvent.start));
      },

      eventClick : function(calEvent, $event) {
        jQuery("event_edit_container").show();
         if (calEvent.readOnly) {
            return;
         }
         var $dialogContent = $("#event_edit_container");
         resetForm($dialogContent);
         var startField = $dialogContent.find("select[name='start']").val(calEvent.start);
         var endField = $dialogContent.find("select[name='end']").val(calEvent.end);
         var titleField = $dialogContent.find("input[name='title']").val(calEvent.title);
         var bodyField = $dialogContent.find("textarea[name='body']");
         bodyField.val(calEvent.body);

         $dialogContent.dialog({
            modal: true,
            title: "Edit - " + calEvent.title,
            close: function() {
               $dialogContent.dialog("destroy");
               $dialogContent.hide();
               $('#calendar').weekCalendar("removeUnsavedEvents");
            },
            buttons: {
               save : function() {
                  calEvent.start    = new Date(startField.val());
                  calEvent.end      = new Date(endField.val());
                  calEvent.title    = titleField.val();
                  calEvent.body     = bodyField.val();

                  $calendar.weekCalendar("updateEvent", calEvent);
                  $dialogContent.dialog("close");
               },
               "delete" : function() {
                  $calendar.weekCalendar("removeEvent", calEvent.id);
                  $dialogContent.dialog("close");
               },
               cancel : function() {
                  $dialogContent.dialog("close");
               }
            }
         }).show();

         var startField = $dialogContent.find("select[name='start']").val(calEvent.start);
         var endField = $dialogContent.find("select[name='end']").val(calEvent.end);
         $dialogContent.find(".date_holder").text($calendar.weekCalendar("formatDate", calEvent.start));
         setupStartAndEndTimeFields(startField, endField, calEvent, $calendar.weekCalendar("getTimeslotTimes", calEvent.start));
         $(window).resize().resize(); //fixes a bug in modal overlay size ??
      },

        data: function(start, end, callback) {
            console.log("data callback");
            callback(getMyData());
            // callback(getEventData());
        },
        nextWeekclick: function() {
            window.isNextweek = true;
            var get_new_date =  $("#calendar").weekCalendar("nextWeek");
            window.isNextweek = '';
        },
        prevWeekclick: function() {
            window.isPrevweek = true;
            var get_new_date =  $("#calendar").weekCalendar("prevWeek");
            window.isPrevweek = '';
        },
        // showAsSeparateUser: true,
        // displayOddEven: true,
        displayFreeBusys: true,
        // daysToShow: 7,
        switchDisplay: {'1 day': 1, '3 next days': 3, 'work week': 5, 'full week': 7},
      });

        $('.patient-schedule-left #doctor').change(function() {
            $calendar.weekCalendar('refresh');
        });
   }
}
    function resetForm($dialogContent) 
    {
      $dialogContent.find("input").val("");
      $dialogContent.find("textarea").val("");
    }

    function getDateCalendarFormat(week_date)
    {
        var first               = week_date; // First day is the day of the month - the day of the week
        console.log("first");
        console.log(first);
        var last                = new Date(); // last day is the first day + 6
        // last.setDate(week_date.getDate() + 6);

        var newDate = new Date(last.setTime( first.getTime() + 6 * 86400000 ));

        console.log("last");
        console.log(last);
        window.first_date_week  = get_dates_of_week(first);
        window.last_date_week   = get_dates_of_week(last);
        console.log(window.first_date_week);
        console.log(window.last_date_week);
    }

    function getMyData()
    { 
        jQuery(".loading-screen-cover").show();
        if(window.isNextweek == true || window.isPrevweek == true)
        {
            var week_date = new Date(window.first_date_week);
            if(window.isNextweek == true)
            {
                week_date.setDate(week_date.getDate() + 7);
            }
            else
            {
                week_date.setDate(week_date.getDate() - 7);
            }
            getDateCalendarFormat(week_date);
        }
      
        var clinic_id = jQuery("#clinic").val();
        var doctor_id = jQuery("#doctor").val();
        var my_array;
        jQuery.ajax({
         url: admin_ajax.ajax_url,
         type: 'POST',
         dataType: 'json',
         async : false,
         data: 
         {
            action          :   'dram_calendar_doctorclinic_schedule',
            clinic_id       :    clinic_id,
            doctor_id       :    doctor_id,
            first_date_week :    window.first_date_week,
            last_date_week  :    window.last_date_week
         },
            success:function(response){
                jQuery(".loading-screen-cover").hide();
                my_array =  response;
            },
        }) 
        return my_array;
    }

    function getEventData() 
    {
      var year = new Date().getFullYear();
      var month = new Date().getMonth();
      var day = new Date().getDate();

        var free_data = 
        {
            options: {
            // timeslotsPerHour: 2,
            // timeslotHeight: 20,
            defaultFreeBusy: {free: true},
            },
               events : [
                {'id':1, 'start': new Date(year, month, day, 10), 'end': new Date(year, month, day, 10), 'title': 'Lunch with Mike'}
              // //   {'id':2, 'start': new Date(year, month, day+3, 14), 'end': new Date(year, month, day+3, 14, 45), 'title': 'Dev Meeting'},
              // //   {'id':3, 'start': new Date(year, month, day+1, 18), 'end': new Date(year, month, day+1, 18, 45), 'title': 'Hair cut'},
              // //   {'id':4, 'start': new Date(year, month, day+2, 8), 'end': new Date(year, month, day+2, 9, 30), 'title': 'Team breakfast'},
              // //   {'id':5, 'start': new Date(year, month, day+1, 14), 'end': new Date(year, month, day+1, 15), 'title': 'Product showcase'}
              ],
              freebusys: [
             {'start': new Date(year, month, day, 12), 'end': new Date(year, month, day, 13), 'free': false},
             {'start': new Date(year, month, day+1, 12), 'end': new Date(year, month, day+1, 13), 'free': false},
             {'start': new Date(year, month, day+2, 12), 'end': new Date(year, month, day+2, 13), 'free': false}

          ]
        };
    // console.log(freebusys);
    return free_data;
   }


    function setupStartAndEndTimeFields($startTimeField, $endTimeField, calEvent, timeslotTimes) 
    {
        for (var i = 0; i < timeslotTimes.length; i++) {
         var startTime = timeslotTimes[i].start;
         var endTime = timeslotTimes[i].end;
         var startSelected = "";
         if (startTime.getTime() === calEvent.start.getTime()) {
            startSelected = "selected=\"selected\"";
         }
         var endSelected = "";
         if (endTime.getTime() === calEvent.end.getTime()) {
            endSelected = "selected=\"selected\"";
         }
         $startTimeField.append("<option value=\"" + startTime + "\" " + startSelected + ">" + timeslotTimes[i].startFormatted + "</option>");
         $endTimeField.append("<option value=\"" + endTime + "\" " + endSelected + ">" + timeslotTimes[i].endFormatted + "</option>");
      }
      $endTimeOptions = $endTimeField.find("option");
      $startTimeField.trigger("change");
    }
        
    });
})(jQuery);

