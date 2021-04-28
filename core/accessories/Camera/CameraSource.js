'use strict'

const { uuid, CameraController, AudioStreamingSamplerate } = require("hap-nodejs")
const IP = require('ip')
const { spawn } = require('child_process')


const CameraSource = function (Config) {

    this.config = Config;
    this.controller = undefined;
    this.pendingSessions = {}
    this.ongoingSessions = {}
    this.maxFPS = Config.maxFPS > 30 ? 30 : Config.maxFPS
    this.maxWidth = Config.maxWidthHeight.split("x")[0];
    this.maxHeight = Config.maxWidthHeight.split("x")[1];
    this.maxBitrate = Config.maxBitrate;
    this.maxPacketSize = Config.packetSize;
    this.lastSnapshotTime = undefined;
    this.imageCache = undefined;

}

CameraSource.prototype.KillStreams = function(){

    Object.keys(this.ongoingSessions).forEach((SI) =>{

        let OS = this.ongoingSessions[SI];
        this.controller.forceStopStreamingSession(OS.SessionID);
        OS.FFMPEG.kill('SIGKILL');
        delete this.ongoingSessions[SI]
        
    })
}

CameraSource.prototype.attachController = function (Controller) {
    this.controller = Controller;
}

CameraSource.prototype.handleSnapshotRequest = async function (request, callback) {

    if (this.lastSnapshotTime !== undefined) {
        const Now = new Date().getTime();
        const Diff = (Now - this.lastSnapshotTime) / 1000;

        //  snapshot cache life
        if (parseInt(Diff) < this.config.snapshotCacheTime) {
            callback(undefined, this.imageCache)
            return;
        }

    }

    let imageBuffer = Buffer.alloc(0);
    var CB = callback;

    const CMD = [];
    CMD.push('-analyzeduration 1')
    CMD.push(this.config.stillImageSource)
    CMD.push('-s ' + request.width + 'x' + request.height)
    CMD.push('-vframes 1')
    CMD.push('-f image2')
    CMD.push('-')

    const ffmpeg = spawn(this.config.processor, CMD.join(' ').split(' '), {env: process.env, stderr:'ignore' })

    ffmpeg.stdout.on('data', function (data) {
        imageBuffer = Buffer.concat([imageBuffer, data])
    })

    ffmpeg.on('error', (error) => {
        if(CB){
            CB(new Error('Snapshot failed'));
            CB = undefined
        }
    })

    ffmpeg.on('exit',(Code, Signal) =>{
        
        let _Error = ExitDueToError(Code, Signal);

        if(!_Error){

            this.lastSnapshotTime = new Date().getTime();
            this.imageCache = undefined;
            this.imageCache = imageBuffer
            if(CB){
                CB(undefined, this.imageCache)
                CB = undefined
            }
        }else{
            if(CB){
                CB(new Error("Return Code: " + Code + ", SIGNAL:" + Signal));
                CB = undefined
            }
        }
    })
}

CameraSource.prototype.prepareStream = async function (request, callback) {

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

    const currentAddress = IP.address()

    const addressResp = {
        address: currentAddress,
    }

    if (IP.isV4Format(currentAddress)) {
        addressResp['type'] = 'v4'
    } else {
        addressResp['type'] = 'v6'
    }

    response['address'] = addressResp

    this.pendingSessions[uuid.unparse(sessionID)] = sessionInfo
    callback(null, response);
}

function ExitDueToError(Code, Signal){

    if(Code == null && Signal === 'SIGKILL') {return false}
    if(Code === 255 && Signal == null) {return false}
    if(Code > 0 && Code < 255 && Signal == null) {return true}

}

CameraSource.prototype.handleStreamRequest = async function (request, callback) {

    const sessionID = request['sessionID']
    const requestType = request['type']

    if (sessionID) {
        const sessionIdentifier = uuid.unparse(sessionID)
        switch (requestType) {

            case "reconfigure":
                console.info(' CameraSource: HomeKit requested Stream to reconfigure');
                callback(undefined);
                break;

            case "stop":
                console.info(' CameraSource: HomeKit requested Stream to stop');
                const OS = this.ongoingSessions[sessionIdentifier]
                if (OS) {
                    OS.FFMPEG.kill('SIGKILL')
                }
                delete this.ongoingSessions[sessionIdentifier]
                callback(undefined);
                break;

            case "start":
                console.info(' CameraSource: HomeKit requested Stream to start');
                const sessionInfo = this.pendingSessions[sessionIdentifier]

                if (sessionInfo) {
                    let width = this.maxWidth;
                    let height = this.maxHeight;
                    let FPS = this.maxFPS;
                    let bitRate = this.maxBitrate
                    let aBitRate = 24
                    let aSampleRate = AudioStreamingSamplerate.KHZ_16
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
                    CMD.push('-vcodec ' + this.config.videoEncoder)
                    CMD.push('-pix_fmt yuv420p')
                    CMD.push('-r ' + FPS)
                    CMD.push('-f rawvideo')

                    if (this.config.additionalCommandline.length > 0) {
                        CMD.push(this.config.additionalCommandline);
                    }

                    if (this.config.honourRequestedResolution === true && this.config.videoEncoder !== 'copy') {
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
                    if (this.config.enableAudio === true) {
                        // Input
                        CMD.push('-map ' + this.config.mapAudio)
                        CMD.push('-acodec ' + this.config.audioEncoder)

                        if(this.config.audioProfile.length > 0){
                            CMD.push('-profile:a '+ this.config.audioProfile)
                        }
                        
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
                        CMD.push('srtp://' + targetAddress + ':' + targetAudioPort + '?rtcpport=' + targetAudioPort + '&pkt_size=' + MaxPaketSize)
                    }

                    var CB = callback;

                    const ffmpeg = spawn(this.config.processor, CMD.join(' ').split(' '), { env: process.env, stdout:'ignore' })

                    // up and running
                    ffmpeg.stderr.on('data', (data) => {
                        if(data.toString().includes('frame=')){

                            if(CB){
                                console.info(' CameraSource: Stream is now running');
                                CB(undefined)
                                CB = undefined;
                                this.ongoingSessions[sessionIdentifier] = {FFMPEG:ffmpeg,SessionID:sessionID}
                                delete this.pendingSessions[sessionIdentifier]
                            }
                            
                        }
                    })

                    // error before start
                    ffmpeg.on('error',(error)=>{

                        console.info(' CameraSource: Stream failed to start');
                        if (CB) {
                            CB(new Error('Streaming failed'));
                            CB = undefined
                            delete this.pendingSessions[sessionIdentifier]
                        }
                       
                    })

                    // process exit (error or expected)
                    ffmpeg.on('exit', (Code, Signal) =>{

                        let _Error = ExitDueToError(Code, Signal);

                        if(_Error){

                            console.info(' CameraSource: Stream process terminated due to error');
                            if(CB){
                                CB(new Error("Return Code: " + Code + ", SIGNAL:" + Signal));
                                CB = undefined
                                delete this.pendingSessions[sessionIdentifier]
                            }else{
                                this.controller.forceStopStreamingSession(sessionID);
                                delete this.ongoingSessions[sessionIdentifier]
                            }

                        }else{

                            if(!ffmpeg.killed){
                                console.info(' CameraSource: Stream process terminated unexpectedly');
                                this.controller.forceStopStreamingSession(sessionID);
                                delete this.ongoingSessions[sessionIdentifier]
                            }
                            else{
                                console.info(' CameraSource: Stream process terminated as per request');
                            }
                        }
                    })
                }
                break;
        }
    }
}

module.exports = {
    CameraSource: CameraSource,
}