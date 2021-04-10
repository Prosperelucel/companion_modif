# Module for Extron SMP 351

> This module connects to the Extron H.264 Streaming Media Processor (SMP) 351 and allows you to login, send commands, and recieve feedback based on the status of the device.

## Connecting

* Admin or User Password can be set if used
* Extron telnet connection has a timeout default 5mins

## Supported commands

* **Input to Output Channel** Route an input to an output channel
* **Recall Presets** Recall user, input & layout presets
* **Start Recording** Start a recording
* **Stop Recording** Stop a recording
* **Pause Recording** Pause a recording
* **Extend Recording** Extend a scheduled recording by X mins

## Supported feedback

* **Record state** Stop/Record/Pause

## Supported button variables

* **Record state** Stopped/Recording/Paused
* **Time Remaining** Time remaining on a recording in hh:mm format
