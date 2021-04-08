'use strict'
const HapNodeJS = require('hap-nodejs')
const uuid = HapNodeJS.uuid
const ip = require('ip')
const CameraController = HapNodeJS.CameraController;
const spawn = require('child_process').spawn

const Camera = function(Config) {
    this.config = Config;
    this.controller = null;
    this.pendingSessions = {}
    this.ongoingSessions = {}
    this.maxFPS = Config.maxFPS > 30 ? 30 : Config.maxFPS
    this.maxWidth = Config.maxWidthHeight.split("x")[0];
    this.maxHeight = Config.maxWidthHeight.split("x")[1];
    this.maxBitrate = Config.maxBitrate;
    this.maxPacketSize = Config.packetSize;
    this.lastSnapshotTime;
    this.imageCache;

}

Camera.prototype.attachController = function(Controller) {
    this.controller = Controller;
}

Camera.prototype.handleSnapshotRequest = function(request, callback) {

    if (this.lastSnapshotTime != null) {
        const Now = new Date().getTime();
        const Diff = (Now - this.lastSnapshotTime) / 1000;

        // 1 Minute snapshot cache
        if (parseInt(Diff) < 60) {
            callback(null, this.imageCache)
            return;
        }

    }

    let imageBuffer = Buffer.alloc(0);

    const CMD = [];
    CMD.push('-analyzeduration 1')
    CMD.push(this.config.stillImageSource)
    CMD.push('-s ' + request.width + 'x' + request.height)
    CMD.push('-vframes 1')
    CMD.push('-f image2')
    CMD.push('-')

    const ffmpeg = spawn(this.config.processor, CMD.join(' ').split(' '), {
        env: process.env
    })

    ffmpeg.stdout.on('data', function(data) {
        imageBuffer = Buffer.concat([imageBuffer, data])
    })

    // We need to get access to context here, hence the more recent arrow function approach
    ffmpeg.on('close', (c) => {
        this.lastSnapshotTime = new Date().getTime();
        this.imageCache = null;
        this.imageCache = imageBuffer

        callback(null, this.imageCache)

    })

}

Camera.prototype.prepareStream = function(request, callback) {
    const sessionInfo = {}

    const sessionID = request['sessionID']
    sessionInfo['address'] = request['targetAddress']

    const response = {}

    const videoInfo = request['video']
    if (videoInfo) {
        const targetPort = videoInfo['port']
        const srtp_key = videoInfo['srtp_key']
        const srtp_salt = videoInfo['srtp_salt']
        const ssrc = CameraController.generateSynchronisationSource();
        response['video'] = {
            port: targetPort,
            ssrc: ssrc,
            srtp_key: srtp_key,
            srtp_salt: srtp_salt
        }
        sessionInfo['video_port'] = targetPort
        sessionInfo['video_srtp'] = Buffer.concat([srtp_key, srtp_salt])
        sessionInfo['video_ssrc'] = ssrc
    }

    const audioInfo = request['audio']
    if (audioInfo) {
        const targetPort = audioInfo['port']
        const srtp_key = audioInfo['srtp_key']
        const srtp_salt = audioInfo['srtp_salt']
        const ssrc = CameraController.generateSynchronisationSource();
        response['audio'] = {
            port: targetPort,
            ssrc: ssrc,
            srtp_key: srtp_key,
            srtp_salt: srtp_salt
        }
        sessionInfo['audio_port'] = targetPort
        sessionInfo['audio_srtp'] = Buffer.concat([srtp_key, srtp_salt])
        sessionInfo['audio_ssrc'] = ssrc
    }

    const currentAddress = ip.address()

    const addressResp = {

        address: currentAddress,
    }

    if (ip.isV4Format(currentAddress)) {
        addressResp['type'] = 'v4'
    } else {
        addressResp['type'] = 'v6'
    }

    response['address'] = addressResp

    this.pendingSessions[uuid.unparse(sessionID)] = sessionInfo
    callback(null, response);
}

Camera.prototype.handleStreamRequest = function(request, callback) {
    const sessionID = request['sessionID']
    const requestType = request['type']

    if (sessionID) {
        const sessionIdentifier = uuid.unparse(sessionID)
        switch (requestType) {
            case "reconfigure":
                // to do
                callback(null);
                break;

            case "stop":
                const ffmpegProcess = this.ongoingSessions[sessionIdentifier]
                if (ffmpegProcess) {
                    ffmpegProcess.kill('SIGKILL')
                }
                delete this.ongoingSessions[sessionIdentifier]
                callback(null);
                break;

            case "start":
                const sessionInfo = this.pendingSessions[sessionIdentifier]

                if (sessionInfo) {
                    let width = this.maxWidth;
                    let height = this.maxHeight;
                    let FPS = this.maxFPS;
                    let bitRate = this.maxBitrate
                    let aBitRate = 24
                    let aSampleRate = HapNodeJS.AudioStreamingSamplerate.KHZ_16
                    let VPT = 0;
                    let APT = 0;
                    let MaxPaketSize = this.maxPacketSize

                    const videoInfo = request['video']
                    if (videoInfo) {
                        width = videoInfo['width']
                        height = videoInfo['height']
                        VPT = videoInfo["pt"];

                        const expectedFPS = videoInfo['fps']
                        if (expectedFPS < FPS) {
                            FPS = expectedFPS
                        }

                        if (videoInfo['max_bit_rate'] < bitRate) {
                            bitRate = videoInfo['max_bit_rate']
                        }

                        if (videoInfo["mtu"] < MaxPaketSize) {
                            MaxPaketSize = videoInfo["mtu"];
                        }
                    }

                    const audioInfo = request['audio']
                    if (audioInfo) {
                        if (audioInfo['max_bit_rate'] < aBitRate) {
                            aBitRate = audioInfo['max_bit_rate']
                        }

                        if (audioInfo['sample_rate'] < aSampleRate) {
                            aSampleRate = audioInfo['sample_rate']
                        }

                        APT = audioInfo["pt"];
                    }

                    const targetAddress = sessionInfo['address']
                    const targetVideoPort = sessionInfo['video_port']
                    const videoKey = sessionInfo['video_srtp']
                    const videoSsrc = sessionInfo['video_ssrc']
                    const targetAudioPort = sessionInfo['audio_port']
                    const audioKey = sessionInfo['audio_srtp']
                    const audioSsrc = sessionInfo['audio_ssrc']

                    const CMD = [];

                    // Input
                    CMD.push(this.config.liveStreamSource)
                    CMD.push('-map ' + this.config.mapVideo)
                    CMD.push('-vcodec ' + this.config.encoder)
                    CMD.push('-pix_fmt yuv420p')
                    CMD.push('-r ' + FPS)
                    CMD.push('-f rawvideo')

                    if (this.config.additionalCommandline.length > 0) {
                        CMD.push(this.config.additionalCommandline);
                    }

                    if (this.config.adhereToRequestedSize == 'true' && this.config.encoder != 'copy') {
                        CMD.push('-vf scale=' + width + ':' + height)
                    }

                    CMD.push('-b:v ' + bitRate + 'k')
                    CMD.push('-bufsize ' + bitRate + 'k')
                    CMD.push('-maxrate ' + bitRate + 'k')
                    CMD.push('-payload_type ' + VPT)

                    // Output
                    CMD.push('-ssrc ' + videoSsrc)
                    CMD.push('-f rtp')
                    CMD.push('-srtp_out_suite AES_CM_128_HMAC_SHA1_80')
                    CMD.push('-srtp_out_params ' + videoKey.toString('base64'))
                    CMD.push('srtp://' + targetAddress + ':' + targetVideoPort + '?rtcpport=' + targetVideoPort + '&pkt_size=' + MaxPaketSize)

                    // Audio ?
                    if (this.config.enableAudio == 'true') {
                        // Input
                        CMD.push('-map ' + this.config.mapAudio)
                        CMD.push('-acodec ' + this.config.encoder_audio)
                        CMD.push('-profile:a aac_eld')
                        CMD.push('-flags +global_header')
                        CMD.push('-f null');
                        CMD.push('-ar ' + aSampleRate + 'k')
                        CMD.push('-b:a ' + aBitRate + 'k')
                        CMD.push('-bufsize ' + aBitRate + 'k')
                        CMD.push('-ac 1')
                        CMD.push('-payload_type ' + APT)

                        // Output
                        CMD.push('-ssrc ' + audioSsrc)
                        CMD.push('-f rtp')
                        CMD.push('-srtp_out_suite AES_CM_128_HMAC_SHA1_80')
                        CMD.push('-srtp_out_params ' + audioKey.toString('base64'))
                        CMD.push('srtp://' + targetAddress + ':' + targetAudioPort + '?rtcpport=' + targetAudioPort + '&pkt_size=188')
                    }

                    const ffmpeg = spawn(this.config.processor, CMD.join(' ').split(' '), {
                        env: process.env,
                        stdout: 'ignore'
                    })

                    let live = false;
                    let CBCalled = false;

                    ffmpeg.stderr.on('data', data => {
                        if (!live) {
                            if (data.toString().includes('frame=')) {
                                live = true;
                                CBCalled = true;
                                callback(null);

                                this.ongoingSessions[sessionIdentifier] = ffmpeg
                                delete this.pendingSessions[sessionIdentifier]
                            }
                        }
                    });

                    ffmpeg.on('error', error => {
                        if (!live) {
                            if (!CBCalled) {
                                callback(new Error('FFMPEG Error : ' + error.message));
                                CBCalled = true;
                            }

                            delete this.pendingSessions[sessionIdentifier]
                        } else {
                            this.controller.forceStopStreamingSession(sessionID);
                            if (this.ongoingSessions.hasOwnProperty(sessionIdentifier)) {
                                delete this.ongoingSessions[sessionIdentifier]
                            }
                        }

                    });

                    ffmpeg.on('exit', (c, s) => {
                        if (c != null && c != 255) {
                            if (!live) {
                                if (!CBCalled) {
                                    callback(new Error('FFMPEG Exit : Code - ' + c + ', Signal -  ' + s));
                                    CBCalled = true;
                                }

                                delete this.pendingSessions[sessionIdentifier]
                            } else {
                                this.controller.forceStopStreamingSession(sessionID);
                                if (this.ongoingSessions.hasOwnProperty(sessionIdentifier)) {
                                    delete this.ongoingSessions[sessionIdentifier]
                                }
                            }
                        }
                    });

                }
                break;
        }
    }
}

module.exports = {
    Camera: Camera,
}