$( document ).ready(function() {

    lc_switch('input[type=checkbox]',{on_color:'#F36B08',compact_mode: true})

    $('input[type=checkbox]').each((I,E)=>{
        let Event = $(E).attr('event')
        if(Event !== undefined){
            $(E).on('lcs-statuschange',window[Event])
        }
    })
 });

let EndPoints = []
let Connectors = []

// Login
function Login() {
    let Data = {
        "username": $('#TXT_Username').val(),
        "password": $('#TXT_Password').val(),
    }
    $.ajax({
        type: "POST",
        url: "../../../ui/login",
        data: JSON.stringify(Data),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: LoginDone
    });

}

function LoginDone(data) {
    if (data.success) {
        document.location = data.destination;
    } else {
        $('#Message').text('Invalid username and/or password');
    }
}

// Save Settings
function SaveSettings() {

    let Data = {

        "advertiser": $("#CFG_Advertiser").val(),
        "interface": $("#CFG_MDNSInterface").val(),
        "webInterfacePort": parseInt($("#CFG_APIPort").val()),
        "webInterfaceAddress": $("#CFG_APIInterface").val(),

        "enableIncomingMQTT": $('#CFG_MQTTEnabled').is(":checked"),
        "MQTTBroker": $("#CFG_MQTTBroker").val(),
        "MQTTTopic": $("#CFG_MQTTTopic").val(),
        "MQTTOptions": {
            "username": $('#CFG_MQTTUsername').val(),
            "password": $('#CFG_MQTTPassword').val()
        }
    }

    $.ajax({
        type: "POST",
        url: "../../../ui/settings",
        data: JSON.stringify(Data),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: SaveConfigDone
    });
}

function SaveConfigDone(data) {
    if (data.success) {
        $('#Message').text('Settings updated! Please restart HAP Router.');
    } else {
        $('#Message').text('Could not save Settings');
    }
}

function GetParams(Package){

    let ParamElements = $(".ConfigParam");

    ParamElements.each((index,element) => {

        let EL = $(element)

        let Type  = EL.attr('data-type');
        let ID = EL.attr('data-param')
        var Value;

        switch(Type)
        {
            case "text":
            case "select":
            case "numeric":
                Value = EL.val();
                break

            case "checkbox":
                Value = EL.is(":checked")
                break;

            case "array":
                Value = []
                let Lines = EL.val().split(/\n/);
                Lines.forEach((AE)=>{
                    if(AE && AE.length){
                        Value.push(AE);
                     }
                })
               
                break;
        }

        Package[ID] = Value;
    })
}

// Save Accessory
function SaveNewAccessory(type) {

    let Accessory = {
        name: $("#ACC_Name").val(),
        manufacturer: $("#ACC_MAN").val(),
        model: $("#ACC_MODEL").val(),
        serialNumber: $("#ACC_SN").val(),
        route: $("#ACC_Route").val(),
        bridged: ($("#ACC_PublishMode").val() === 'Attached'),
        type:type
    }

    if(Accessory.manufacturer.length < 1){
        delete Accessory.manufacturer;
    }
    if(Accessory.model.length < 1){
        delete Accessory.model;
    }
    if(Accessory.serialNumber.length < 1){
        delete Accessory.serialNumber;
    }

  
    GetParams(Accessory)

    
    $.ajax({
        type: "POST",
        data: JSON.stringify(Accessory),
        contentType: "application/json",
        url: "../../../ui/createaccessory/"+type,
        dataType: "json",
        success: AddAccessoryDone
    });
  
}

function AddAccessoryDone(data) {

    if(data.success){

        

        if(($("#ACC_PublishMode").val() === 'Attached')){
            location.href = '../../../ui/accessories'
        }
        else{

            $("#AC_QRImage").attr("src","../../../ui/qrcode/?data="+data.SetupURI+"&width=170");
            $("#AC_Name").text(data.Name);
            $("#AC_AID").text(data.AID);
            $("#AC_SN").text(data.SN);
            $("#AC_Code").text(data.Pincode);

            $("#EnrollDiv").css("display","block")
        }
    }
   
    
}

function SaveAccessoryChanges(ID){

    let Accessory = {
        name: $("#ACC_Name").val(),
        manufacturer: $("#ACC_MAN").val(),
        model: $("#ACC_MODEL").val(),
        serialNumber: $("#ACC_SN").val(),
        route: $("#ACC_Route").val(),
    }

    if(Accessory.manufacturer.length < 1){
        delete Accessory.manufacturer;
    }
    if(Accessory.model.length < 1){
        delete Accessory.model;
    }
    if(Accessory.serialNumber.length < 1){
        delete Accessory.serialNumber;
    }

    GetParams(Accessory)
    
    $.ajax({
        type: "POST",
        data: JSON.stringify(Accessory),
        contentType: "application/json",
        url: "../../../ui/editaccessory/"+ID,
        dataType: "json",
        success: EditAccessoryDone
    });
}

function EditAccessoryDone(data){

    if(data.success){
        location.href = '../../../ui/accessories'
    }
      
}

function ChangeBridgeStatus(){

    let Enabled = $(this).is(":checked");

    let Data = {
        "enableBridge": Enabled
    }
    $.ajax({
        type: "POST",
        url: "../../../ui/bridge",
        data: JSON.stringify(Data),
        contentType: "application/json; charset=utf-8",
        dataType: "json"
    });

}


/******************************************* */


// delete route()
function DeleteRoute() {
    if (confirm("Are you sure you wish to delete this route?")) {
        let Name = $("#RDelete").attr("route_name");

        $.ajax({
            type: "POST",
            data: JSON.stringify({
                "name": "" + Name + ""
            }),
            contentType: "application/json",
            url: "../../../ui/deleteroute",
            dataType: "json",
            success: ByPass
        });
    }
}

// save config
function SaveConfig() {
    let Data = {
        "webInterfacePort": parseInt($('#CFG_Port').val()),
        "advertiser": $('#CFG_Advertiser').val(),
        "MQTTBroker": $('#CFG_Broker').val(),
        "MQTTTopic": $('#CFG_Topic').val(),
        "MQTTOptions": {
            "username": "" + $('#CFG_username').val() + "",
            "password": "" + $('#CFG_password').val() + ""
        },
        "enableIncomingMQTT": "" + ($('#CFG_MQTT').prop("checked") == true) + "",
        "interface": $("#CFG_Interface").val(),
        "webInterfaceAddress": $("#CFG_Address").val()
    }

    $.ajax({
        type: "POST",
        url: "../../../ui/setconfig",
        data: JSON.stringify(Data),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function () {
            alert('Please restart the server to apply the new configuration.')
        }
    });
}

// Restore
function StartRestore() {
    if (confirm('Are you sure you wish to restore your configuration. This will include all Homekit client mappings?')) {
        let IP = document.createElement("input");
        IP.setAttribute("type", "file");
        IP.onchange = ProcessRestore;
        IP.click();

    }
}

function ProcessRestore(input) {
    let FR = new FileReader();

    FR.onload = function () {
        $.ajax({
            type: "POST",
            data: JSON.stringify({
                "content": "" + FR.result + ""
            }),
            contentType: "application/json",
            url: "../../../ui/restore",
            dataType: "json",
            success: RestoreDone
        });

    }
    FR.readAsText(input.target.files[0]);

}

function RestoreDone(data) {
    if (data.OK) {
        alert('Configuration Restored! The server has been shutdown - please start it again to apply the Configuration.')
    } else {
        if (data.Reason == "VersionMismatch") {
            alert('This backup is not compatible with the version of HomeKit Devcie Stack Installed.')
        } else {
            alert('The backup is invalid.')
        }

    }
}

// Device Setup
function StartPairCheck(ID) {
    setInterval(() => {
        DoCheckDevice(ID)
    }, 5000);
}

function DoCheckDevice(ID) {
    $.ajax({
        type: "GET",
        url: "../../../ui/pairstatus/" + ID,
        dataType: "json",
        success: Check
    });
}

// Bridge Setup 
function StartIntervalCheck() {
    setInterval(DoCheck, 5000);
}

function DoCheck() {
    $.ajax({
        type: "GET",
        url: "../../../ui/pairstatus",
        dataType: "json",
        success: Check
    });
}

function Check(data) {
    if (data.paired) {
        document.location = '../../../ui/main'
    }
}

// Root Type Change
function RouteTypeChanged() {

    let Type = $('#R_Type').val();

    $.ajax({

        type: "GET",
        url: "../../../ui/getroutemeta/" + Type,
        dataType: "json",
        success: function (data) {

            let Anchor = $("#Anchor")

            $(".param_row").remove()

            data.Inputs.reverse()

            data.Inputs.forEach((I) => {


                Anchor.after('<tr class="param_row"><td valign="top">' + I.label + '</td><td style="text-align:right"><input param="' + I.id + '" class="config_param" type="text" style="width: 300px"></td></tr>')


            })

        }
    });



}

// Populate Route Data
function ProcessRouteData() {
    let Prop = JSON.parse($(event.target).attr('properties').replace(/\|/g, '"'));

    $('#R_Type').val(Prop.type)
    TypeChanged();
    $("#R_Name").val($(event.target).attr("id").split("_")[1])

    $("#RDelete").attr("route_name", $("#R_Name").val());
    $("#RDelete").css("visibility", "visible")

    switch (Prop.type) {
        case "HTTP":
            $("#R_HTTP_URI").val(Prop.destinationURI);
            break;

        case "UDP":
            $("#R_UDP_ADDRESS").val(Prop.address + ":" + Prop.port)
            break;

        case "FILE":
            $("#R_FILE_DIRECTORY").val(Prop.directory);
            break;

        case "WEBSOCKET":
            $("#R_WEBSOCKET_URI").val(Prop.uri);
            break;

        case "MQTT":
            $("#R_MQTT_BROKER").val(Prop.broker);
            $("#R_MQTT_TOPIC").val(Prop.topic);
            if (Prop.MQTTOptions != null) {
                $("#R_MQTT_USER").val(Prop.MQTTOptions.username)
                $("#R_MQTT_PASS").val(Prop.MQTTOptions.password)
            }
            break;
    }

}

function ClearRoute() {
    $('#R_Type').val("HTTP")
    $("#R_Name").val("")
    $("#R_FILE_DIRECTORY").val("");
    $("#R_HTTP_URI").val("");
    $("#R_UDP_ADDRESS").val("")
    $("#R_MQTT_BROKER").val("")
    $("#R_MQTT_TOPIC").val("")
    $("#R_MQTT_USER").val("")
    $("#R_MQTT_PASS").val("")
    $("#R_WEBSOCKET_URI").val("");

    $("#RDelete").css("visibility", "hidden")

    TypeChanged();
}

function Show(ID, CB) {

    $('#' + ID).css('display', 'block')
    if (CB) {
        CB();
    }
}

function Hide(ID, CB) {
    $('#' + ID).css('display', 'none')
    if (CB) {
        CB();
    }
}

function PopulatePrototype() {
    $('#TypeIcon').attr('src', '../../../ui/static/Images/device_icons/' + Prototype.Icon);
    $('#Label').text(Prototype.Label);

    for (let i = 0; i < Prototype.ConfigProperties.length; i++) {
        let Prop = Prototype.ConfigProperties[i];

        // Table Row
        let TR = $('<tr></tr>')

        // Label
        let LTD = $('<td></td>')
        LTD.css('text-align', 'left')
        LTD.html(Prop.Label);

        // Input
        let ITD = $('<td></td>')
        ITD.css('text-align', 'right')

        var ITE;
        switch (Prop.Type) {
            case "text":
                ITE = $('<input/>');
                ITE.attr('type', 'text');
                ITE.css('width', '90%');
                ITE.attr('config-name', Prop.Name);
                if (Prop.hasOwnProperty('Default')) {
                    ITE.val(Prop.Default);
                }
                break;

            case "multi":
                ITE = $('<textarea></textarea>');
                ITE.css('width', '90%');
                ITE.css('height', '120px');
                ITE.attr('config-name', Prop.Name);
                if (Prop.hasOwnProperty('Default')) {
                    for (let i = 0; i < Prop.Default.length; i++) {
                        let CV = ITE.val();
                        ITE.val(CV + Prop.Default[i] + '\r\n')
                    }
                }
                break;

            case "choice":
                ITE = $('<select></select>');
                ITE.css('width', '90%');
                ITE.attr('config-name', Prop.Name);
                for (let i = 0; i < Prop.Choices.length; i++) {
                    let Op = $('<option></option>');
                    Op.attr('value', Prop.Choices[i])
                    Op.append(Prop.Choices[i])

                    ITE.append(Op);
                }

                if (Prop.hasOwnProperty('Default')) {
                    ITE.val(Prop.Default)

                }

                break;

            case "checkbox":
                ITE = $('<input/>');
                ITE.attr('type', 'checkbox');
                ITE.attr('config-name', Prop.Name);
                if (Prop.hasOwnProperty('Default')) {
                    if (Prop.Default == 'true') {
                        ITE.attr('checked', 'checked');
                    }
                }
                break;
        }

        ITD.append(ITE);

        TR.append(LTD);
        TR.append(ITD);

        $('#Form').append(TR);

    }
}

function PopulateData() {
    $('#AName').text(ConfiguredObject.name)

    for (let i = 0; i < Prototype.ConfigProperties.length; i++) {

        let Name = Prototype.ConfigProperties[i].Name;
        let Type = Prototype.ConfigProperties[i].Type;

        if (Type == 'multi') {
            $("[config-name='" + Name + "']").val('');
            for (let i = 0; i < ConfiguredObject[Name].length; i++) {

                let CV = $("[config-name='" + Name + "']").val();
                $("[config-name='" + Name + "']").val(CV + ConfiguredObject[Name][i] + '\r\n');
            }

        }

        if (Type == 'checkbox') {
            if (ConfiguredObject[Name] == 'true') {
                $("[config-name='" + Name + "']").prop("checked", true);
            } else {
                $("[config-name='" + Name + "']").prop("checked", false);
            }

        }

        if (Type == 'choice') {
            $("[config-name='" + Name + "']").val(ConfiguredObject[Name]);
        }

        if (Type == 'text') {
            $("[config-name='" + Name + "']").val(ConfiguredObject[Name]);
        }

    }

}

function DeleteAccesssory() {

    if (!confirm('Are you sure you wish to delete \'' + ConfiguredObject['name'] + '\' This action cannot be undone.')) {
        return
    }

    let AccessoryOBJ = {}
    AccessoryOBJ['username'] = ConfiguredObject['username']
    AccessoryOBJ['bridged'] = ConfiguredObject['bridged']

    $.ajax({

        type: "POST",
        url: "../../../ui/deleteaccessory",
        data: JSON.stringify(AccessoryOBJ),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: ByPass
    });
}

function UpdateAccessory() {

    let Props = $('[config-name]');
    let AccessoryOBJ = {}

    AccessoryOBJ.bridged = ConfiguredObject.bridged;
    AccessoryOBJ.type = ConfiguredObject.type;
    AccessoryOBJ.route = ConfiguredObject.route;
    AccessoryOBJ.pincode = ConfiguredObject.pincode;
    AccessoryOBJ.username = ConfiguredObject.username;
    AccessoryOBJ.setupID = ConfiguredObject.setupID;
    AccessoryOBJ.serialNumber = ConfiguredObject.serialNumber;

    Props.each(function () {
        if ($(this).is('textarea')) {

            let lines = $(this).val().replace(/\r\n/g, "\n").split("\n");
            lines = lines.filter(L => L.length > 0);
            AccessoryOBJ[$(this).attr('config-name')] = lines;
        }

        if ($(this).attr('type') == 'checkbox') {

            AccessoryOBJ[$(this).attr('config-name')] = $(this).is(':checked').toString();
        } else {
            AccessoryOBJ[$(this).attr('config-name')] = $(this).val();
        }

    })

    $.ajax({

        type: "POST",
        url: "../../../ui/editaccessory",
        data: JSON.stringify(AccessoryOBJ),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: ByPass
    });

}

function SaveAccessory(Bridged) {
    let Props = $('[config-name]');

    let AccessoryOBJ = {}

    AccessoryOBJ.bridged = Bridged;
    AccessoryOBJ.type = Prototype.Name;
    AccessoryOBJ.route = ''

    Props.each(function () {
        if ($(this).is('textarea')) {

            let lines = $(this).val().replace(/\r\n/g, "\n").split("\n");
            lines = lines.filter(L => L.length > 0);
            AccessoryOBJ[$(this).attr('config-name')] = lines;
        }

        if ($(this).attr('type') == 'checkbox') {

            AccessoryOBJ[$(this).attr('config-name')] = $(this).is(':checked').toString();
        } else {
            AccessoryOBJ[$(this).attr('config-name')] = $(this).val();
        }

    })

    $.ajax({

        type: "POST",
        url: "../../../ui/createaccessory",
        data: JSON.stringify(AccessoryOBJ),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: GoToMain
    });
}

function ByPass() {
    document.location = '../../../ui/main';
}

function GoToMain(Data) {
    if (Data.hasOwnProperty("Pin")) {

        $("#NBCode").text(Data.Pin);

        new QRCode(document.getElementById("qrcode"), {
            "text": Data.URI,
            width: 125,
            height: 125
        });

        Show('QR')

        StartPairCheck(Data.ID);
    } else {
        document.location = '../../../ui/main';
    }

}

function SaveRoute() {

    let RouteType = $('#R_Type').val();

    let Data = {};

    Data["name"] = $('#R_Name').val();
    Data["type"] = RouteType;

    let Params = $(".config_param");

    Params.each(function (index) {

        Data[$(this).attr('param')] = $(this).val();
    })


    $.ajax({
        type: "POST",
        url: "../../../ui/createroute",
        data: JSON.stringify(Data),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: ByPass
    });

}

function RouteCMD(Data, Type) {
    $.ajax({
        type: "POST",
        url: "../../../ui/" + Type,
        data: JSON.stringify({
            SID: Data.sourceId,
            TID: Data.targetId
        }),
        contentType: "application/json; charset=utf-8",
        dataType: "json"

    });
}

