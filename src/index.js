class VideoRecorder {

	  constructor(videoPreviewId = 'preview', videoRecordingId = 'recording', mediaOption = {
	    	video: true,
	    	audio: true
	  	}) {

	  	this.videoPreviewId = videoPreviewId
	  	this.videoRecordingId = videoRecordingId
	  	this.mediaSetting = mediaOption
	  	this.preview = document.getElementById(this.videoPreviewId);
		this.recording = document.getElementById(this.videoRecordingId);
		this.data = [];
		this.recorder = null;
	  }

	stop  () {
		this._stop();
	}
	isSupport() {
		return typeof MediaRecorder === 'function' && typeof navigator.mediaDevices === 'object'
	}
		start () {

			navigator.mediaDevices.getUserMedia(this.mediaSetting)
				.then(stream => {
					this.preview.srcObject = stream;
				    this.preview.captureStream = this.preview.captureStream || this.preview.mozCaptureStream;
				    return new Promise(resolve => this.preview.onplaying = resolve);
				}).then(() => this._startRecording())
			
		}
		pause () {
			this._pauseRecorder();
		}
		resume () {
			this._resume();
		}
		download (fileName) {
			this._download(fileName);
		}
		getBlob () {
			return this._blob();
		}

		_startRecording() {
		  this.recorder = new MediaRecorder(this.preview.captureStream());
		  this.data = [];
		  this.recording.src = null;		 
		  this.recorder.ondataavailable = event => { this.data.push(event.data); this._updatePlayer() }
		  this.recorder.start();
		}

		_pauseRecorder() {
			let stopped = new Promise((resolve, reject) => {
		    	this.recorder.onstop = resolve;
		    	this.recorder.onerror = event => reject(event.name);
		  	});
		  	let recorded = this.recorder.state == "recording" && this.recorder.stop();
		  	return Promise.all([
		    stopped,
		    recorded
		  ]).then(() => this.data);
		}

		_resume () {
			if (this.recorder) {
				this.recorder.start();
			} else {
				this.start();
			}
		}
		_updatePlayer () {
			const recordedBlob = new Blob(this.data, { type: "video/webm" });
			this.recording.src = URL.createObjectURL(recordedBlob);
		}
		_download (fileName) {
			if (!this.recorder) {
				return;
			}
			return this._blob()
					.then(recordedBlob => {
						let downloadButton = document.createElement("a");
					    document.body.appendChild(downloadButton);
					    downloadButton.style = "display: none";
					    downloadButton.href = recording.src;
					    downloadButton.download = fileName + '.webm';
					    downloadButton.click();
        				window.URL.revokeObjectURL(recording.src);
					})
		}
		_blob() {
			return this._stop()
					.then(data => {
						return new Blob(data, { type: "video/webm" });
					})
		}
 		_stop() {
 			return this._pauseRecorder()
 				.then((data) => {
 					this.recorder = null;
					this.data = [];
					this.preview.srcObject.getTracks().forEach(track => track.stop());
					return new Promise(resolve => resolve(data))
 				})
			
		}

}