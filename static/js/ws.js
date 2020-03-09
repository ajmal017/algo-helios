

var loc = window.location;
var wsStart = 'ws://';
if (loc.protocol == "https:") {
    wsStart = 'wss://';
}
var endpoint = wsStart + loc.host + "/channel/";
var socket = new WebSocket(endpoint);
console.log("socket : coonn ,,, ", socket)
function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function guid() {
    var nav = window.navigator;
    var screen = window.screen;
    var guid = nav.mimeTypes.length;
    guid += nav.userAgent.replace(/\D+/g, '');
    guid += nav.plugins.length;
    guid += screen.height || '';
    guid += screen.width || '';
    guid += screen.pixelDepth || '';

    return guid;
};

console.log(sessionStorage)



socket.onopen = function (e) {
    console.log("Web-socket conn opened ", e);
    // window.onload = setTimeout(socket.send(JSON.stringify({'id' :sessionStorage['id'], 'username' : sessionStorage['username']})), 5000)
    sessionStorage['id'] = guid();
    setTimeout(function() {
        socket.send(JSON.stringify({'id' :sessionStorage['id'], 'username' : sessionStorage['username']}));
        console.log(sessionStorage)
    }, 1000);
}


function getStatus(status) {
    if(status) {
        if(status.toLowerCase() == "partialhit") status = "Partial HIT"
        return status
    }
    return "Active"
}

function inserNewRow(source_table, data, position, status) {
    let newRow = source_table.getElementsByTagName("tbody")[0].insertRow(0);
    status = getStatus(status)
    newRow.innerHTML =
    `<td id="ticker" data-label="Ticker">`+data["ticker"]+`</td>
    <td id="ltp" data-label="LTP">`+data["price"]+`</td>
    <td id="signal" data-label="Signal"><button type="button" class="` + data['signal'] + `_btn trade btn-xs" data-toggle="modal"
        data-target="#trade_modal">` + data["signal"] + `</button></td>
    <td id="signal_time" data-label="Signal Time">`+timeFormat(data["signal_time"], data["portfolio_id"])+`</td>
    <td id="price" data-label="Signal Price">`+data["price"]+`</td>
    <td id="target_price" data-label="TP">`+data["target_price"]+`</td>
    <td id="stop_loss" data-label="SL">`+data["stop_loss"]+`</td>
    <td id="profit_percent" data-label="Profit %">`+data['profit_percent']+`</td>
    <td id="status" data-label="Status" class="call_status">`+status+`</td>`;
    newRow.id = data["call_id"];
    newRow.setAttribute('class', data['instrument_token'])
    return newRow
}

function timeFormat(signal_time, portfolioId){
    if (portfolioId == 1  || portfolioId == "TEST") {
        return new Date(signal_time).toLocaleString("en-GB", {hour: '2-digit', minute: '2-digit'})
    }
    else if (portfolioId == 2) {
        return new Date(signal_time).toLocaleString("en-GB", {day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'})
    }
    else if (portfolioId == 3) {
        return new Date(signal_time).toLocaleString("en-GB", {day: 'numeric', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit'})
    }
    else if (portfolioId == 4) {
        return new Date(signal_time).toLocaleString("en-GB", {day: 'numeric', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit'})
    }
    return new Date(signal_time).toLocaleString("en-GB", {day: 'numeric', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit'})
}

function getEligibleTab(portfolioId) {
    if (portfolioId == 1  || portfolioId == "TEST") {
        return "intraday"
    }
    else if (portfolioId == 2) {
        return "btst"
    }
    else if (portfolioId == 3) {
        return "positional"
    }
    else if (portfolioId == 4) {
        return "longterm"
    }
    return "intraday"
}

function updateCount(activeTab) {
    var total_count = -1;
    var hit_count = 0;
    var miss_count = 0;
    var partial_count = 0;
    var table = document.getElementById(activeTab + "_data-table");
    for (var i = 0, row; row = table.rows[i]; i++) {
        status = row.cells[8].innerText
        total_count += 1
        if (status == 'HIT') {
            hit_count += 1
        }
        else if (status == 'MISS') {
            miss_count += 1
        }
        else if (status == 'Partial HIT') {
            partial_count += 1
        }
    }

    document.getElementById(activeTab + '_total_count').innerHTML = total_count;
    document.getElementById(activeTab + '_hit_count').innerHTML = hit_count;
    document.getElementById(activeTab + '_miss_count').innerHTML = miss_count;
    document.getElementById(activeTab + '_partial_hit_count').innerHTML = partial_count;
}

socket.onmessage = function (e) {
    // console.log("message ", e);

    var data_dict = JSON.parse(e['data']);
    if (typeof data_dict == 'undefined' || data_dict.length <= 0) {
        // the array is defined and has at least one element
        return;
    }
    console.log("data recieved : ", data_dict)
    dataType = data_dict["dtype"]
    if (dataType == "signal" || dataType == "tick" || dataType == "signal_update") {
        // hit = data_dict['hit']
        var status = data_dict['status']
        var active = data_dict['active']
        console.log("status : ", status, "active : ", active)
        call_id = data_dict["call_id"];
        
        portfolioId = data_dict["portfolio_id"];

        var activeTab = getEligibleTab(portfolioId);

        var dataTable = document.getElementById(activeTab + "_data-table")

        // var rowId = activeTab + instrument_token
        var rowId = call_id

        if (dataType == "signal") {
            let data;
            data = data_dict;
            if (existing = dataTable.rows.namedItem(rowId)) {

                // A new signal with different side is received, ignore signal with same side
                if (dataTable.rows.namedItem(rowId).cells.namedItem("signal").innerHTML != data['signal']){
                    row = document.getElementById(rowId);
                    row.className = "disabled";
                    // console.log("Making row Inactive with status ", row.cells.namedItem("status").innerHTML)
                    if (row.cells.namedItem("status").innerHTML == "Active") {
                        row.cells.namedItem("status").innerHTML = "Inactive";
                    }
                    
                    status = getStatus(status)
                    inserNewRow(dataTable, data, 0, status)
                }
            }
            else {
                // console.log("Received a new row ", data)
                status = getStatus(status)
                row = inserNewRow(dataTable, data, 0, status);
                if (!active) {
                    console.log("Will disable row with call id : ", call_id)
                    row.className = "disabled";
                    // row.id = instrumentToken + (Math.random * 100);
                }
            }
        }
        else if (dataType == "signal_update"){
            if (dataTable && dataTable.rows.namedItem(rowId)) {
                dataTable.rows.namedItem(rowId).cells.namedItem("ltp").innerHTML = data_dict["last_price"];
                dataTable.rows.namedItem(rowId).cells.namedItem("profit_percent").innerHTML = data_dict['profit_percent'];
                dataTable.rows.namedItem(rowId).cells.namedItem("status").innerHTML = getStatus(status);

                row = document.getElementById(rowId);
                
                if (!active) {
                    console.log("Will disable row with call id : ", call_id)
                    row.className = "disabled";
                }
            }
        }
        else if(dataType == "tick"){
            class_name = data_dict['instrument_token']
            instruments = document.getElementsByClassName(class_name)
            console.log("Instruments on page are : ", instruments, typeof(instruments))
            for(var i = 0; i < instruments.length; i++){
                inst = instruments[i]
                inst.cells.namedItem("ltp").innerHTML = data_dict["last_price"];
                inst.cells.namedItem("profit_percent").innerHTML = data_dict["profit_percent"];
                inst.cells.namedItem("status").innerHTML = status

                if(!status){
                    console.log("Will disable the row by tick update");
                    inst.className = "disabled";
                }
            };
            
        }
        // else if (dataType == "tick") {
        //     delete data_dict.dtype;
        //     data = data_dict;

        //     if (dataTable && dataTable.rows.namedItem(rowId)) {
        //         dataTable.rows.namedItem(rowId).cells.namedItem("ltp").innerHTML = data_dict["last_price"];
        //         dataTable.rows.namedItem(rowId).cells.namedItem("profit_percent").innerHTML = data_dict['profit_percent'];
        //         dataTable.rows.namedItem(rowId).cells.namedItem("status").innerHTML = getStatus(status);

        //         row = document.getElementById(rowId);
        //         if (status != 0 && status != 2) {
        //             row.className = "disabled";
        //             row.id = instrumentToken + (Math.random * 100);
        //         }
        //     }
        // }
    }
    else {
        //Create table from received data from database
        data_dict.forEach(data => {

            var status = data['status']
            var active = data['active']
            var instrumentToken = data["instrument_token"];
            var portfolioId = data["portfolio_id"];
    
            var activeTab = getEligibleTab(portfolioId);
            var dataTable = document.getElementById(activeTab + "_data-table")

            newRow = inserNewRow(dataTable, data, 0, status);

            if (active != 1) {
                newRow.className = "disabled";
            }
        })

        allTabs = document.getElementById("ordertypes").getElementsByTagName("li")
        for (var i = 0, max = allTabs.length; i < max; i++) {
            updateCount(allTabs[i].getAttribute("id"))
        }
        return
    }

    updateCount(activeTab)
}

socket.onerror = function (e) {
    console.log("error", e);
}

socket.onclose = function (e) {
    console.log("close", e);
}

window.onbeforeunload = function () {
    this.socket.close();
}
