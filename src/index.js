class VideoRecorder {

	constructor(videoPreviewId = 'preview', mediaOption = {
		video: true,
		audio: true
	}) {

		this.recording  = null;
		this.videoPreviewId = videoPreviewId
		this.mediaSetting = mediaOption
		this.preview = document.getElementById(this.videoPreviewId);
		this.data = [];
		this.recorder = null;
	}

	stop() {
		this._stop();
	}
	isSupport() {
		return typeof MediaRecorder === 'function' && typeof navigator.mediaDevices === 'object'
	}
	start() {
		this.recording = document.createElement("video");		
		this.preview.removeAttribute('controls')
		this.data = [];
		navigator.mediaDevices.getUserMedia(this.mediaSetting)
			.then(stream => {
				this.preview.src = null;
				this.preview.srcObject = stream;
				this.preview.play()
				this.preview.captureStream = this.preview.captureStream || this.preview.mozCaptureStream;
				return new Promise(resolve => this.preview.onplaying = resolve);
			}).then(() => this._startRecording())

	}
	pause() {
		this.preview.pause()
		this._pauseRecorder();
	}
	resume() {
		this.preview.play()
		this._resume();
	}
	download(fileName) {
		this._download(fileName);
	}
	getBlob() {
		return this._blob();
	}
	getRawData() {
		return this.data;
	}

	_startRecording() {
		this.recorder = new MediaRecorder(this.preview.captureStream());
		this.data = [];
		// this.recording.src = null;		 
		this.recorder.ondataavailable = event => {
			this.data.push(event.data);
			this._updatePlayer()
		}
		this.recorder.start();
	}

	_pauseRecorder() {
		this.recorder.pause()
	}
	_resume() {
		if (this.recorder) {
			this.preview.removeAttribute('controls')
			this.recorder.resume();
		} else {
			this.start();
		}
	}
	_updatePlayer() {
		const recordedBlob = new Blob(this.data, {
			type: "video/webm"
		});
		this.recording.src = URL.createObjectURL(recordedBlob);
	}
	_download(fileName) {
		if (!this.recorder && !this.data && !this.data.length) {
			return;
		}
		
		return this._blob()
			.then(recordedBlob => {
				let downloadButton = document.createElement("a");
				document.body.appendChild(downloadButton);
				downloadButton.style = "display: none";
				downloadButton.href = this.recording.src;
				downloadButton.download = fileName + '.webm';
				downloadButton.click();
				window.URL.revokeObjectURL(this.recording.src);
			})
	}
	_blob() {
		if (!this.recorded && this.data && this.data.length) {
			return new Blob(this.data, {
				type: "video/webm"
			});
		}
		return this._stop()
			.then(data => {
				return new Blob(data, {
					type: "video/webm"
				});
			})
	}
	_stop() {

		if (!this.recorder) return

		let stopped = new Promise((resolve, reject) => {
			this.recorder.onstop = resolve;
			this.recorder.onerror = event => reject(event.name);
		});
		let recorded = this.recorder.state == "recording" && this.recorder.stop()
		return Promise.all([
				stopped,
				recorded
			]).then(() => this.data)
			.then((data) => {
				this.recorder = null;				
				this.preview.srcObject.getTracks().forEach(track => track.stop());
				this.preview.srcObject = null;
				this.preview.src = this.recording.src
				this.recording.remove();
				this.preview.setAttribute('controls', true)
				this.preview.pause();
				return new Promise(resolve => resolve(data))
			})

	}

}

export default VideoRecorder;