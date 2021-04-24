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
            let ICON = '../../../ui/resources/accessoryicon/?type='+data.type
            let Return = '../../../ui/accessories'
            ShowPairWindow(data.SetupURI,data.Name,data.AID,data.SN,ICON,data.Pincode,Return)
        }
    }
   
}

function ShowPairWindow(SetupURI, Name, AID, SN, IconURL, Pincode, returnURL){

    $("#AC_QRImage",window.top.document).attr("src","../../../ui/qrcode/?data="+SetupURI+"&width=170");
    $("#AC_Name",window.top.document).text(Name);
    $("#AC_AID",window.top.document).text(AID);
    $("#AC_SN",window.top.document).text(SN);
    $("#AC_Code",window.top.document).text(Pincode);
    $("#PairIcon",window.top.document).attr('src',IconURL);
    $("#ReturnLink",window.top.document).attr('href',returnURL);



    $('#EnrollDiv',window.top.document).css("display","block")

    StartPairCheck(returnURL,AID)

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

function ShowBridgePair(SetupURI,SN,Pincode,UN){
 
    let Icon = '../../../ui/static/Images/Bridge-Big.png'
    let Return = '../../../ui/bridge'


    ShowPairWindow(SetupURI,'HAP Router Bridge',UN,SN,Icon,Pincode,Return)
}

function CloseEnroll(){

    clearInterval(Timer);
    $('#EnrollDiv',window.top.document).css("display","none")
}

var Timer;
function StartPairCheck(Return, ID){

    Timer = setInterval(()=>{

        $.ajax({
            type: "GET",
            url: "../../../ui/pairstatus/"+ID,
            dataType: "json",
            success: function(data){

                if(data.paired){
                    location.href = Return;
                    CloseEnroll();
                }
            }
        });


    },5000)
}

function SaveNewRoute(Type){

    let Data =  {
        name:$("#RT_Name").val(),
        type:Type
    }

    let ParamElements = $(".RouteParam");

    ParamElements.each((index,element) => {

        let EL = $(element)
        Data[EL.attr('data-param')] = EL.val();

    });


    $.ajax({
        type: "POST",
        url: "../../../ui/createroute",
        data: JSON.stringify(Data),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(data){

            if(data.success){
               location.href = '../../../ui/routing'
            }
        }
    });
}

function SaveRouteChanges(ID){


    let ParamElements = $(".RouteParam");
    
    let Data =  {
        name:ID,
    }
    ParamElements.each((index,element) => {

        let EL = $(element)
        Data[EL.attr('data-param')] = EL.val();

    });

    $.ajax({
        type: "POST",
        url: "../../../ui/editroute",
        data: JSON.stringify(Data),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(data){

            if(data.success){
               location.href = '../../../ui/routing'
            }
        }
    });
}


/******************************************* */




