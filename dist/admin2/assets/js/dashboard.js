String.prototype.toHHMMSS = function () {
    var sec_num = parseInt(this, 10); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    return hours+':'+minutes+':'+seconds;
};


(function (){
  window.tableOrder = {
    listQueue:'!client_name',
    listQueueInChat:'client_name'
  }
  window.queueSelected = 'ALL'
  const refreshData = ()=>{
    clearTimeout(window.timerDash)
    var data = $.ajax({
      url: '/dashboard_data',
      data: {data:true, group:queueSelected},
      type: 'get',
      async: false
    }).done((result)=>{
      if(typeof result!=='object'){
        window.location.reload()
      }
      let html_TableStatus = '';
      result.status_today.forEach(status=>{
        html_TableStatus+='<tr><th class="text-right w-50">'+status.status+'</th><td>'+status.c+'</td></tr>';
      })
      $('#TableStatus').html(html_TableStatus)

      if(result.tabs_top.queue_time_avarage.indexOf('00:')===0){
        
        result.tabs_top.queue_time_avarage=result.tabs_top.queue_time_avarage.substr(3)
      }

      $('#QueueTotal').text(result.tabs_top.queue_total)
      $('#QueueTime').text(result.tabs_top.queue_time_avarage)
      $('#AgentsOnline').text(result.tabs_top.agents_online)
      $('#TotalToday').text(result.tabs_top.queue_total_today)

      
      $('#liveAgents tbody').html(
        result.live_agents.map(a=>{
          let pause = '';
          let pause_class = '';
          let txt_obs_1 = '';
          if(a.status[0]==='pause'){
            pause=a.status[1]
            let valid = pauses.filter(a=>a.pause_name===pause)[0]
            let __class = 'warning';
            txt_obs_1 = ((Date.now()-a.statusUpdated)/1000+"").toHHMMSS()
            if(valid){
              valid = valid.pause_limit
              if(valid!=='00:00:00'){
                if(txt_obs_1>=valid){
                  __class="danger"
                }
              }
            }
            pause_class='bg-'+__class+' text-center text-white'
          }else{
            pause='ONLINE'
            pause_class='bg-success text-center text-white'
          }

          if(a.inChat>0 && pause==='ONLINE'){
            txt_obs_1='Em <b>'+a.inChat+'</b> atendimento'
            if(a.inChat>1) txt_obs_1+="s"
          }
          

          return '<tr>\
            <td>'+a.user_id+'</td>\
            <td>'+a.name+'</td>\
            <td class="'+pause_class+'">'+pause+'</td>\
            <td>'+txt_obs_1+'</td>\
          </tr>'}).join('')
      );

      
      [{
        id: 'listQueue',
        lines: result.list_queue
      },{
        id: 'listQueueInChat',
        lines: result.list_queue_chat
      }].forEach((a)=>
        $('#'+a.id).html(a.lines.sort((aa,b)=>{
          let field = tableOrder[a.id]
          if(field[0]==='!') {
            field = field.slice(1)
            return b[field].localeCompare(aa[field])
          } else {
            return aa[field].localeCompare(b[field])
          }
        }).map(line=>{
          let ret = `<div class="d-flex justify-content-between mb-2 pb-2 border-bottom">`;
          ret += `<div class="d-flex align-items-center hover-pointer">`;
          ret += `<img class="img-xs rounded-circle" src="${line.picture}" alt=""/>`;
          ret += `<div class="ml-2">`;

          if(a.id==='listQueue') ret += `<p>${line.client_name} ${['| '+line.client_external_id.split('@')[0]].filter(a=>a.indexOf('-')===-1).join()}</p>`;
          if(a.id==='listQueueInChat') ret += `<p>${line.client_name}</p>`;

          if(a.id==='listQueue') ret += `<p class="tx-11 text-muted">Na fila <b>${line.group_name}</b> há ${line.requeue}</p>`;
          if(a.id==='listQueueInChat') ret += `<p class="tx-11 text-muted">Sendo atendido por: <b>${line.user_name}</b></p>`;
          
          ret += `</div>`;
          ret += `</div>`;
          ret += `<button class="btn btn-icon"><i data-feather="user-plus" data-toggle="tooltip" title="Connect"></i></button>`;
          ret += `</div>`;
          return ret;
        }).join(''))
      )

      if(result.list_queue.length==0){
        $('#listQueue').html('<div class="text-center">(nenhum cliente na fila)</div>')
      }
      
      if(alert_dashboard.style.display!=='none')$('#alert_dashboard').fadeOut(500);
    }).catch(()=>{
      if(alert_dashboard.style.display!=='none')return;
      $('#alert_dashboard').fadeIn();
      $('#alert_dashboard span').text('A conexão foi perdida');
    })
    $('#toggleAgentsList .btn.active').click()
    window.timerDash = setTimeout(refreshData,1800)
  }
  refreshData()

  $('#queue').on('change', function (){
    window.queueSelected = $(this).val()
    refreshData()
  })

  $('#toggleAgentsList .btn').on('click', function (){
    $('#toggleAgentsList .btn.active').removeClass('active')
    $(this).addClass('active')
    
    let _class = $(this).attr('class')
    $('#liveAgents tbody tr').hide()
    if(_class.indexOf('dark')>-1){
      $('#liveAgents tbody tr').show()
    }else if(_class.indexOf('warning')>-1){
      $('#liveAgents tbody tr').each(function (){
        if($(this).find('td:nth-child(3)').attr('class').indexOf('warning')>-1){
          $(this).show();
        }
      })
    }else if(_class.indexOf('danger')>-1){
      $('#liveAgents tbody tr').each(function (){
        if($(this).find('td:nth-child(3)').attr('class').indexOf('danger')>-1){
          $(this).show();
        }
      })
    }else if(_class.indexOf('success')>-1 || _class.indexOf('info')>-1){
      $('#liveAgents tbody tr').each(function (){
        if($(this).find('td:nth-child(3)').attr('class').indexOf('success')>-1){
          if(_class.indexOf('success')>-1){
            $(this).show();
          }else{
            if($(this).find('td:nth-child(4) b').text()>0){
              $(this).show()
            }
          }
        }
      })
    }
  })

  $('[id*="order_"]').on('change', function (){
    let table = $(this).attr('id').split('_')[1]
    window.tableOrder[table] = $(this).val()
    refreshData();
  }).trigger('click')

})()