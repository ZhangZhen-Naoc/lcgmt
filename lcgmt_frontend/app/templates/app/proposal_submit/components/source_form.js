
var visibilityUrl = "{{ url_for('proposal_submit.target_visibility_tool')}}"

/**
 * form 相关的动作
 * Duration单位和值改变，min/max的联动
 * 表单默认值
 */
$(document).ready(function () {

    /**  设置单位改变的事件
     * min/max的单位与duration一致
     * seconds时，默认值为0.8/1.2倍（seconds时）
     * orbit时，默认值=duration
     * seconds时，duration取值范围600-3600
     */
    $("select[name='exposure_time_unit']").change(function () {
      document.getElementById("duration").setCustomValidity('')
      //select的值为second时，
      // id为min_con_obs_duration-unit的span中的html为second，否则为orbit
      if ($("select[name='exposure_time_unit']").val() == "second") {
        $("#min_con_obs_duration-unit").html("second");
        $("#max_con_obs_duration-unit").html("second");
        //min_con_obs_duration的值是duration的值的0.8倍
        $("#min_con_obs_duration").val($("#duration").val() * 0.8);
        $("#min_con_obs_duration").val(
          //parseFloat($("#min_con_obs_duration").val()).toFixed(2)
          parseInt($("#min_con_obs_duration").val())
        );
        $("#max_con_obs_duration").val($("#duration").val() * 1.2);
        $("#max_con_obs_duration").val(
          // parseFloat($("#max_con_obs_duration").val()).toFixed(2)
          parseInt($("#max_con_obs_duration").val())
        );

        $("#duration").attr('min',600)
        // 因为max需要自定义提示信息，所以写到checkValidate里
        // $("#duration").attr('max',3600)
  
      } else {
        $("#min_con_obs_duration-unit").html("orbit");
        $("#max_con_obs_duration-unit").html("orbit");
        //min_con_obs_duration的值与duration的值相同
        $("#min_con_obs_duration").val($("#duration").val());
        $("#max_con_obs_duration").val($("#duration").val());

        $("#duration").removeAttr('min')
        $("#duration").removeAttr('max')
      }
    }).change();
  
    //当duration的值改变时，min_con_obs_duration与max_con_obs_duration的值也改变，当duration_unit的值为second时，min_con_obs_duration的值是duration的值的0.8倍，max_con_obs_duration的值是duration的值的1.2倍，当duration_unit的值为orbit时，min_con_obs_duration的值是duration的值，max_con_obs_duration的值也是duration的值
    $("#duration").change(function () {
      document.getElementById("duration").setCustomValidity('')
      if ($("select[name='exposure_time_unit']").val() == "second") {
        $("#min_con_obs_duration").val($("#duration").val() * 0.8);
        $("#min_con_obs_duration").val(
          ////将min_con_obs_duration的值四舍五入为整数
          parseInt($("#min_con_obs_duration").val())
          // parseFloat($("#min_con_obs_duration").val()).toFixed(2)
        );
        $("#max_con_obs_duration").val($("#duration").val() * 1.2);
        $("#max_con_obs_duration").val(
          ////将min_con_obs_duration的值四舍五入为整数
          parseInt($("#max_con_obs_duration").val())
          // parseFloat($("#max_con_obs_duration").val()).toFixed(2)
        );
      } else {
        $("#min_con_obs_duration").val($("#duration").val());
        $("#max_con_obs_duration").val($("#duration").val());
      }
    }).change();
  
    $(".datetimepicker").datetimepicker({
          allowInputToggle: true,
          showClose: false,
          showClear: false,
          showTodayButton: false,
          useCurrent: false,
          format: "YYYY-MM-DD HH:mm:ss",
       
    }).attr("autocomplete","off");

    $("#visibility-tool").click(function () {
      const  form = document.forms['form']
      const ra = form.ra.value
      const dec = form.dec.value
      const start_time = form.start_time.value
      const end_time = form.end_time.value
      const url = `${visibilityUrl}?ra=${ra}&dec=${dec}&start_time=${start_time}&end_time=${end_time}`
      window.open(url)
    })

    // 设置默认值
    {% set ignored = ['variable_source','extend_source'] %}
    {% for input in form if input.id not in ['csrf_token','submit']+ignored %}
        console.log("{{input.id}}")
        {% if input.data %}
            $("#{{input.id}}").val("{{input.data}}").change();
        {% endif %}
        {% if input.data and input.type=='IntegerField' %}
            $("#{{input.id}}").val(parseInt("{{input.data}}")).change();
            $("#{{input.id}}").attr('step',1)
        {% endif %}

        {# 添加required属性 #}
        {% if 'required' in input.flags %}
            $("#{{input.id}}").prop('required',true);
        {% endif %}
    {% endfor %}
    var variable_source ="{{form.variable_source.data}}".toLowerCase();
    $("#variable_source").val(variable_source);
    $("#extend_source").val("{{form.extend_source.data}}".toLowerCase());


    // 校验 
    $("#form").submit(function(e){
      var durationInput = document.getElementById("duration")
      var duration = Number.parseInt(durationInput.value);
      var durationUnit = document.getElementById("exposure_time_unit").value;
      // if (duration>3600 && durationUnit=="second") {
      //     durationInput.setCustomValidity("Your duration is greater than 3600s, please use orbit instead(1o=3600s)");
      //     e.preventDefault();
      //     durationInput.reportValidity()
      // } 
      
    })
})
