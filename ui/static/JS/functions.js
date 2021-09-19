/* eslint-env jquery */
/* eslint-env browser */
/* eslint no-undef: "warn"*/
/* eslint no-unused-vars: "warn"*/

$(document).ready(function () {
	lc_switch('input[type=checkbox]', {
		on_color: '#F36B08',
		compact_mode: true
	});

	$('input[type=checkbox]').each((I, E) => {
		const Event = $(E).attr('event');
		if (Event !== undefined) {
			$(E).on('lcs-statuschange', window[Event]);
		}
	});
});

// Login
function Login() {
	const Data = {
		username: $('#TXT_Username').val(),
		password: $('#TXT_Password').val()
	};
	$.ajax({
		type: 'POST',
		url: '../../../ui/login',
		data: JSON.stringify(Data),
		contentType: 'application/json; charset=utf-8',
		dataType: 'json',
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
	const Data = {
		advertiser: $('#CFG_Advertiser').val(),
		interface: $('#CFG_MDNSInterface').val(),
		webInterfacePort: parseInt($('#CFG_APIPort').val()),
		webInterfaceAddress: $('#CFG_APIInterface').val(),
		routeInitDelay: parseInt($('#CFG_RouteDelay').val()),

		enableIncomingMQTT: $('#CFG_MQTTEnabled').is(':checked'),
		MQTTBroker: $('#CFG_MQTTBroker').val(),
		MQTTTopic: $('#CFG_MQTTTopic').val(),
		MQTTOptions: {
			username: $('#CFG_MQTTUsername').val(),
			password: $('#CFG_MQTTPassword').val()
		}
	};

	$.ajax({
		type: 'POST',
		url: '../../../ui/settings',
		data: JSON.stringify(Data),
		contentType: 'application/json; charset=utf-8',
		dataType: 'json',
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

function GetParams(Package) {
	const ParamElements = $('.ConfigParam');

	ParamElements.each((index, element) => {
		const EL = $(element);

		const Type = EL.attr('data-type');
		const ID = EL.attr('data-param');
		let Value;

		switch (Type) {
			case 'text':
			case 'select':
			case 'numeric':
				Value = EL.val();
				break;

			case 'checkbox':
				Value = EL.is(':checked');
				break;

			case 'array':
				Value = [];
				const Lines = EL.val().split(/\n/);
				Lines.forEach((AE) => {
					if (AE && AE.length) {
						Value.push(AE);
					}
				});

				break;
		}

		Package[ID] = Value;
	});
}

// Save Accessory
function SaveNewAccessory(type) {
	if ($('#ACC_Route').val() === 'N') {
		$('#ACC_Route').css('background-color', '#F36B08');
		$('#ACC_Route').css('color', 'rgb(255,255,255)');
		return;
	}

	if ($('#ACC_Name').val().length < 1) {
		$('#ACC_Name').css('background-color', '#F36B08');
		$('#ACC_Name').css('color', 'rgb(255,255,255)');
		return;
	}

	const Accessory = {
		name: $('#ACC_Name').val(),
		manufacturer: $('#ACC_MAN').val(),
		model: $('#ACC_MODEL').val(),
		serialNumber: $('#ACC_SN').val(),
		route: $('#ACC_Route').val(),
		bridged: $('#ACC_PublishMode').val() === 'Attached',
		type: type
	};

	if (Accessory.manufacturer.length < 1) {
		delete Accessory.manufacturer;
	}
	if (Accessory.model.length < 1) {
		delete Accessory.model;
	}
	if (Accessory.serialNumber.length < 1) {
		delete Accessory.serialNumber;
	}

	GetParams(Accessory);

	$.ajax({
		type: 'POST',
		data: JSON.stringify(Accessory),
		contentType: 'application/json',
		url: '../../../ui/createaccessory/' + type,
		dataType: 'json',
		success: AddAccessoryDone
	});
}

function AddAccessoryDone(data) {
	if (data.success) {
		if ($('#ACC_PublishMode').val() === 'Attached') {
			location.href = '../../../ui/accessories';
		} else {
			ShowAccessoryPair(
				data.SetupURI,
				data.Name,
				data.AID,
				data.SN,
				data.type,
				data.Pincode
			);
		}
	}
}

function ShowAccessoryPair(SetupURI, Name, AID, SN, Type, Pincode) {
	const ICON = '../../../ui/resources/accessoryicon/?type=' + Type;

	ShowPairWindow(
		SetupURI,
		Name,
		AID,
		SN,
		ICON,
		Pincode,
		'../../../ui/accessories'
	);
}

function ShowPairWindow(SetupURI, Name, AID, SN, IconURL, Pincode, returnURL) {
	$('#AC_QRImage', window.top.document).attr(
		'src',
		'../../../ui/qrcode/?data=' + SetupURI + '&width=170'
	);
	$('#AC_Name', window.top.document).text(Name);
	$('#AC_AID', window.top.document).text(AID);
	$('#AC_SN', window.top.document).text(SN);
	$('#AC_Code', window.top.document).text(Pincode);
	$('#PairIcon', window.top.document).attr('src', IconURL);
	$('#ReturnLink', window.top.document).attr('href', returnURL);

	$('#EnrollDiv', window.top.document).css('display', 'block');

	StartPairCheck(returnURL, AID);
}

function SaveAccessoryChanges(ID) {
	if ($('#ACC_Route').val() === 'N') {
		$('#ACC_Route').css('background-color', '#F36B08');
		$('#ACC_Route').css('color', 'rgb(255,255,255)');
		return;
	}

	if ($('#ACC_Name').val().length < 1) {
		$('#ACC_Name').css('background-color', '#F36B08');
		$('#ACC_Name').css('color', 'rgb(255,255,255)');
		return;
	}

	const Accessory = {
		name: $('#ACC_Name').val(),
		manufacturer: $('#ACC_MAN').val(),
		model: $('#ACC_MODEL').val(),
		serialNumber: $('#ACC_SN').val(),
		route: $('#ACC_Route').val()
	};

	if (Accessory.manufacturer.length < 1) {
		delete Accessory.manufacturer;
	}
	if (Accessory.model.length < 1) {
		delete Accessory.model;
	}
	if (Accessory.serialNumber.length < 1) {
		delete Accessory.serialNumber;
	}

	GetParams(Accessory);

	$.ajax({
		type: 'POST',
		data: JSON.stringify(Accessory),
		contentType: 'application/json',
		url: '../../../ui/editaccessory/' + ID,
		dataType: 'json',
		success: EditAccessoryDone
	});
}

function EditAccessoryDone(data) {
	if (data.success) {
		location.href = '../../../ui/accessories';
	}
}

function ChangeBridgeStatus() {
	const Enabled = $(this).is(':checked');

	const Data = {
		enableBridge: Enabled
	};
	$.ajax({
		type: 'POST',
		url: '../../../ui/bridge',
		data: JSON.stringify(Data),
		contentType: 'application/json; charset=utf-8',
		dataType: 'json'
	});
}

function ShowBridgePair(SetupURI, SN, Pincode, UN) {
	const Icon = '../../../ui/static/Images/Bridge-Big.png';
	const Return = '../../../ui/bridge';

	ShowPairWindow(SetupURI, 'HAP Router Bridge', UN, SN, Icon, Pincode, Return);
}

function CloseEnroll() {
	clearInterval(Timer);
	$('#EnrollDiv', window.top.document).css('display', 'none');
}

let Timer;
function StartPairCheck(Return, ID) {
	Timer = setInterval(() => {
		$.ajax({
			type: 'GET',
			url: '../../../ui/pairstatus/' + ID,
			dataType: 'json',
			success: function (data) {
				if (data.paired) {
					location.href = Return;
					CloseEnroll();
				}
			}
		});
	}, 5000);
}

function SaveNewRoute(Type) {
	if ($('#RT_Name').val().length < 1) {
		$('#RT_Name').css('background-color', '#F36B08');
		$('#RT_Name').css('color', 'rgb(255,255,255)');
		return;
	}

	const Data = {
		name: $('#RT_Name').val(),
		type: Type
	};

	const ParamElements = $('.RouteParam');

	ParamElements.each((index, element) => {
		const EL = $(element);
		if (EL.is(':checkbox')) {
			Data[EL.attr('data-param')] = EL.prop('checked');
		} else if (EL.attr('type') === 'number') {
			Data[EL.attr('data-param')] = parseInt(EL.val());
		} else {
			Data[EL.attr('data-param')] = EL.val();
		}
	});

	$.ajax({
		type: 'POST',
		url: '../../../ui/createroute',
		data: JSON.stringify(Data),
		contentType: 'application/json; charset=utf-8',
		dataType: 'json',
		success: function (data) {
			if (data.success) {
				location.href = '../../../ui/routing';
			}
		}
	});
}

function SaveRouteChanges(ID) {
	const ParamElements = $('.RouteParam');

	const Data = {
		name: ID
	};
	ParamElements.each((index, element) => {
		const EL = $(element);
		if (EL.is(':checkbox')) {
			Data[EL.attr('data-param')] = EL.prop('checked');
		} else if (EL.attr('type') === 'number') {
			Data[EL.attr('data-param')] = parseInt(EL.val());
		} else {
			Data[EL.attr('data-param')] = EL.val();
		}
	});

	$.ajax({
		type: 'POST',
		url: '../../../ui/editroute',
		data: JSON.stringify(Data),
		contentType: 'application/json; charset=utf-8',
		dataType: 'json',
		success: function (data) {
			if (data.success) {
				location.href = '../../../ui/routing';
			}
		}
	});
}

function DeleteRoute(Name) {
	if (confirm('Are you sure, you wish to delete this Route?')) {
		$.ajax({
			type: 'GET',
			url: '../../../ui/delete/?what=route&id=' + Name,
			dataType: 'json',
			success: function (data) {
				if (data.success) {
					location.href = '../../../ui/routing';
				}
			}
		});
	}
}

function DeleteAccessory(ID) {
	if (confirm('Are you sure, you wish to delete this Accessory?')) {
		$.ajax({
			type: 'GET',
			url: '../../../ui/delete/?what=accessory&id=' + ID,
			dataType: 'json',
			success: function (data) {
				if (data.success) {
					location.href = '../../../ui/accessories';
				}
			}
		});
	}
}

function AccessoryAction(ID, Method) {
	$.ajax({
		type: 'GET',
		url: '../../../ui/accessoryaction/?aid=' + ID + '&method=' + Method,
		dataType: 'json',
		success: function (data) {
			if (data.success) {
				$('#ActionMessage').text('Action performed successfully!');
			} else {
				$('#ActionMessage').text('Action not found or incorrect type!');
			}
		}
	});
}

function RestoreConfig() {
	const Input = $('#RestoreFile');
	Input.on('change', () => {
		const FILE = Input[0].files[0];
		const FR = new FileReader();
		FR.onload = function () {
			Input.off('change');
			Input.val('');
			const FileData = FR.result;
			$.ajax({
				type: 'POST',
				url: '../../../ui/restore',
				dataType: 'json',
				contentType: 'application/json',
				data: JSON.stringify(JSON.parse(FileData)),
				success: function (data) {
					if (data.success) {
						alert(
							'HAP Router has been restored. It has now been shutdown. Please start it, in order to apply the restored configuration'
						);
					} else {
						alert(
							'HAP Router could not be restored. Ensure the backup file is correct.'
						);
					}
				}
			});
		};
		FR.readAsText(FILE);
	});
	Input.click();
}
