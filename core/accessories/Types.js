const { Alarm } = require('./Alarm');
const { ContactSensor } = require('./ContactSensor');
const { Outlet } = require('./Outlet');
const { Bridge } = require('./Bridge');
const { Switch } = require('./Switch');
const { Fan } = require('./Fan');
const { Lock } = require('./Lock');
const { LightBulb } = require('./LightBulb');
const { TV } = require('./Television');
const { GarageDoor } = require('./GarageDoorOpener');
const { Thermostat } = require('./Thermostat');
const { Smoke } = require('./SmokeSensor');
const { Leak } = require('./LeakSensor');
const { Camera } = require('./Camera/Camera');
const { MultiSensor } = require('./MultiSensor');
const { AirQualitySensor } = require('./AirQualitySensor');

const Types = {
	CONTACT_SENSOR: {
		Label: 'Contact Sensor',
		Icon: 'CONTACT_SENSOR.png',
		SupportsRouting: true,
		Class: ContactSensor,
		Actions: [],
		ConfigProperties: []
	},
	AIR_QUALITY_SENSOR: {
		Label: 'Air Quality Sensor',
		Icon: 'AIR_QUALITY.png',
		SupportsRouting: true,
		Class: AirQualitySensor,
		Actions: [],
		ConfigProperties: []
	},
	INTRUDER_ALARM: {
		Label: 'Intruder Alarm',
		Icon: 'INTRUDER_ALARM.png',
		SupportsRouting: true,
		Class: Alarm,
		Actions: [],
		ConfigProperties: []
	},
	MULTI_SENSOR: {
		Label: 'Multisensor',
		Icon: 'MULTI_SENSOR.png',
		SupportsRouting: true,
		Class: MultiSensor,
		Actions: [],
		ConfigProperties: [
			{
				id: 'enableMotionSensor',
				label: 'Motion Sensor',
				type: 'checkbox',
				default: true
			},
			{
				id: 'enableLuxSensor',
				label: 'Lux Level Sensor',
				type: 'checkbox',
				default: true
			},
			{
				id: 'enableTempSensor',
				label: 'Temperature Sensor',
				type: 'checkbox',
				default: true
			},
			{
				id: 'enableHumiditySensor',
				label: 'Humidty Sensor',
				type: 'checkbox',
				default: false
			}
		]
	},
	OUTLET: {
		Label: 'Power Outlet',
		Icon: 'OUTLET.png',
		SupportsRouting: true,
		Class: Outlet,
		Actions: [],
		ConfigProperties: []
	},
	SWITCH: {
		Label: 'Basic Switch',
		Icon: 'SWITCH.png',
		SupportsRouting: true,
		Class: Switch,
		Actions: [],
		ConfigProperties: []
	},
	FAN: {
		Label: 'Fan',
		Icon: 'FAN.png',
		SupportsRouting: true,
		Class: Fan,
		Actions: [],
		ConfigProperties: []
	},

	LOCK: {
		Label: 'Lock',
		Icon: 'LOCK.png',
		SupportsRouting: true,
		Class: Lock,
		Actions: [],
		ConfigProperties: []
	},
	LIGHT_BULB: {
		Label: 'Smart Bulb',
		Icon: 'LIGHT.png',
		SupportsRouting: true,
		Class: LightBulb,
		Actions: [],
		ConfigProperties: [
			{
				id: 'colorMode',
				label: 'Color Mode',
				type: 'select',
				options: ['hue', 'temperature', 'none'],
				default: 'hue'
			},
			{
				id: 'supportsBrightness',
				label: 'Supports Brightness',
				type: 'checkbox',
				default: true
			}
		]
	},
	TELEVISION: {
		Label: 'Smart TV',
		Icon: 'TV.png',
		SupportsRouting: true,
		Class: TV,
		Actions: [],
		ConfigProperties: [
			{
				id: 'inputs',
				label: 'Source Inputs',
				type: 'array',
				default: ['HDMI 1', 'HDMI 2', 'HDMI 3']
			},
			{
				id: 'category',
				label: 'System/Icon Type',
				type: 'select',
				options: [
					'TELEVISION',
					'TV SET TOP BOX',
					'TV STREAMING STICK',
					'AUDIO RECEIVER'
				],
				default: 'TELEVISION'
			}
		]
	},
	GARAG_DOOR_OPENER: {
		Label: 'Garage Door Opener',
		Icon: 'GARAGE.png',
		SupportsRouting: true,
		Class: GarageDoor,
		Actions: [],
		ConfigProperties: []
	},
	THERMOSTAT: {
		Label: 'Thermostat',
		Icon: 'THERMOSTAT.png',
		SupportsRouting: true,
		Class: Thermostat,
		Actions: [],
		ConfigProperties: []
	},
	SMOKE_SENSOR: {
		Label: 'Smoke Sensor',
		Icon: 'SMOKE_SENSOR.png',
		SupportsRouting: true,
		Class: Smoke,
		ConfigProperties: []
	},
	LEAK_SENSOR: {
		Label: 'Leak Sensor',
		Icon: 'LEAK_SENSOR.png',
		SupportsRouting: true,
		Class: Leak,
		Actions: [],
		ConfigProperties: []
	},
	CAMERA: {
		Label: 'CCTV Camera',
		Icon: 'CAMERA.png',
		SupportsRouting: true,
		Class: Camera,
		Actions: [{ label: 'Kill Streams', method: 'KillStreams' }],
		ConfigProperties: [
			{
				id: 'processor',
				label: 'Stream Processor',
				type: 'text',
				default: 'ffmpeg'
			},
			{
				id: 'liveStreamSource',
				label: 'Live Stream Source',
				type: 'text',
				default:
					'-rtsp_transport tcp -i rtsp://username:password@ip:port/StreamURI'
			},
			{
				id: 'stillImageSource',
				label: 'Still Image Source',
				type: 'text',
				default: 'http://username:password@ip:port/SnapshotURI'
			},
			{
				id: 'enableDoorbellService',
				label: 'Enable Door Service',
				type: 'checkbox',
				default: false
			},
			{
				id: 'enableMotionDetectionService',
				label: 'Enable Motion Detection Service',
				type: 'checkbox',
				default: false
			},
			{ id: 'maxFPS', label: 'Max FPS', type: 'numeric', default: 10 },
			{
				id: 'snapshotCacheTime',
				label: 'Frame Snapshot Age (seconds)',
				type: 'numeric',
				default: 60
			},
			{
				id: 'maxBitrate',
				label: 'Max Bit Rate',
				type: 'numeric',
				default: 300
			},
			{
				id: 'packetSize',
				label: 'Max Packet Size (multiples of 188)',
				type: 'numeric',
				default: 376
			},
			{
				id: 'maxStreams',
				label: 'Max Stream Clients',
				type: 'numeric',
				default: 2
			},
			{
				id: 'maxWidthHeight',
				label: 'Max Width/Hight (WxH)',
				type: 'text',
				default: '1280x720'
			},
			{ id: 'mapVideo', label: 'Video Map', type: 'text', default: '0:0' },
			{
				id: 'videoEncoder',
				label: 'Video Encoder',
				type: 'text',
				default: 'libx264'
			},
			{
				id: 'honourRequestedResolution',
				label: 'Honour Requested Resolution',
				type: 'checkbox',
				default: true
			},
			{
				id: 'enableAudio',
				label: 'Enable Audio Streaming',
				type: 'checkbox',
				default: false
			},
			{ id: 'mapAudio', label: 'Audio Map', type: 'text', default: '0:1' },
			{
				id: 'audioEncoder',
				label: 'Audio Encoder',
				type: 'text',
				default: 'libfdk_aac'
			},
			{
				id: 'audioProfile',
				label: 'Audio Profile',
				type: 'text',
				default: 'aac_eld'
			},
			{
				id: 'additionalCommandline',
				label: 'Additional Processor Args',
				type: 'text',
				default: '-tune zerolatency -preset ultrafast'
			}
		]
	}
};

module.exports = {
	Types: Types,
	Bridge: Bridge
};
