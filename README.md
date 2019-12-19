# js-video-recorder

## Install

Using npm:

```sh
npm install --save js-video-recorder
```

or using yarn:

```sh
yarn add js-video-recorder
```

## Use

```
import videorecorder from  'js-video-recorder'

const  vr = videorecorder('video_player_id', { video: true, audio: true  })
vr.start() to start the recording
vr.stop()
vr.pause()
vr.resume()
vr.download(filename)
vr.getBlob()
vr.isSupport()
```
<a href="https://jsfiddle.net/hitesh399/j2mxbeqy/?utm_source=website&utm_medium=embed&utm_campaign=j2mxbeqy" target="_blank">JS Example</a>
