'use strict';

const {
	Service,
	Characteristic,
	Categories,
	SRTPCryptoSuites,
	H264Profile,
	H264Level,
	CameraController,
	AudioStreamingCodecType,
	AudioStreamingSamplerate,
	AudioBitrate
} = require('hap-nodejs');
const { BaseAccessory } = require('../BaseAccessory');
const { CameraSource } = require('./CameraSource');

const Set = function (payload) {
	Object.keys(payload).forEach((K) => {
		switch (K) {
			case 'MotionDetected':
			case 'StatusActive':
			case 'StatusFault':
			case 'StatusTampered':
				this._Properties[K] = payload[K];
				this._MDService.setCharacteristic(Characteristic[K], payload[K]);
				break;

			case 'ProgrammableSwitchEvent':
				this._VDBService.setCharacteristic(Characteristic[K], payload[K]);
				break;
		}
	});
};

class Camera extends BaseAccessory {
	constructor(Config) {
		// Door Bell?
		if (Config.enableDoorbellService === true) {
			super(Config, Categories.VIDEO_DOORBELL);

			this._VDBService = new Service.Doorbell('', '');
			this._VDBService.setCharacteristic(
				Characteristic.ProgrammableSwitchEvent,
				undefined
			);

			const _VDBService_ES = {
				Get: ['ProgrammableSwitchEvent'],
				Set: []
			};

			this._wireUpEvents(this._VDBService, _VDBService_ES);
			this._accessory.addService(this._VDBService);
		} else {
			super(Config, Categories.IP_CAMERA);
		}

		// Camera
		const Options = {
			supportedCryptoSuites: [SRTPCryptoSuites.AES_CM_128_HMAC_SHA1_80],
			video: {
				codec: {
					profiles: [H264Profile.BASELINE, H264Profile.MAIN, H264Profile.HIGH],
					levels: [H264Level.LEVEL3_1, H264Level.LEVEL3_2, H264Level.LEVEL4_0]
				}
			}
		};

		const videoResolutions = [];

		this.maxFPS = Config.maxFPS > 30 ? 30 : Config.maxFPS;
		this.maxWidth = Config.maxWidthHeight.split('x')[0];
		this.maxHeight = Config.maxWidthHeight.split('x')[1];

		if (this.maxWidth >= 320) {
			if (this.maxHeight >= 240) {
				videoResolutions.push([320, 240, this.maxFPS]);
				if (this.maxFPS > 15) {
					videoResolutions.push([320, 240, 15]);
				}
			}
			if (this.maxHeight >= 180) {
				videoResolutions.push([320, 180, this.maxFPS]);
				if (this.maxFPS > 15) {
					videoResolutions.push([320, 180, 15]);
				}
			}
		}
		if (this.maxWidth >= 480) {
			if (this.maxHeight >= 360) {
				videoResolutions.push([480, 360, this.maxFPS]);
			}
			if (this.maxHeight >= 270) {
				videoResolutions.push([480, 270, this.maxFPS]);
			}
		}
		if (this.maxWidth >= 640) {
			if (this.maxHeight >= 480) {
				videoResolutions.push([640, 480, this.maxFPS]);
			}
			if (this.maxHeight >= 360) {
				videoResolutions.push([640, 360, this.maxFPS]);
			}
		}
		if (this.maxWidth >= 1280) {
			if (this.maxHeight >= 960) {
				videoResolutions.push([1280, 960, this.maxFPS]);
			}
			if (this.maxHeight >= 720) {
				videoResolutions.push([1280, 720, this.maxFPS]);
			}
		}
		if (this.maxWidth >= 1920) {
			if (this.maxHeight >= 1080) {
				videoResolutions.push([1920, 1080, this.maxFPS]);
			}
		}

		Options.video.resolutions = videoResolutions;

		if (Config.enableAudio === true) {
			Options.audio = {
				codecs: [
					{
						type: AudioStreamingCodecType.AAC_ELD,
						samplerate: AudioStreamingSamplerate.KHZ_16,
						audioChannels: 1,
						bitrate: AudioBitrate.VARIABLE
					}
				]
			};
		}

		this.CameraDelegate = new CameraSource(Config);
		this.Controller = new CameraController({
			cameraStreamCount: Config.maxStreams,
			delegate: this.CameraDelegate,
			streamingOptions: Options
		});

		this.CameraDelegate.attachController(this.Controller);
		this._accessory.configureController(this.Controller);

		// Motion?
		if (Config.enableMotionDetectionService === true) {
			this._MDService = new Service.MotionSensor('', '');
			this._MDService.setCharacteristic(Characteristic.MotionDetected, false);
			this._MDService.setCharacteristic(Characteristic.StatusActive, 1);
			this._MDService.setCharacteristic(Characteristic.StatusFault, 0);
			this._MDService.setCharacteristic(Characteristic.StatusTampered, 0);
			this._Properties['MotionDetected'] = false;
			this._Properties['StatusActive'] = 1;
			this._Properties['StatusFault'] = 0;
			this._Properties['StatusTampered'] = 0;

			const _MDService_ES = {
				Get: [
					'MotionDetected',
					'StatusActive',
					'StatusTampered',
					'StatusFault'
				],
				Set: []
			};

			this._wireUpEvents(this._MDService, _MDService_ES);
			this._accessory.addService(this._MDService);
		}
	}
}
Camera.prototype.setCharacteristics = Set;

Camera.prototype.KillStreams = function () {
	this.CameraDelegate.KillStreams();
};

module.exports = {
	Camera: Camera
};
