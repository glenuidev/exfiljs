# exfiljs
=======

A node application that will extract dom nodes from a given url using a jquery selector

## Info

1. start a node server on your local host
2. fetch bits of html from a url using jquery selectors

	example: http://localhost:7070/?curl=https://twitter.com/search?q=nodejs&src=tyah&qid=.stream-container
	
### Features:

* debug mode (stdout dump): true/false
* content type: switches to text when in debug mode
* optional port specification

### To-do: 

* need to make selector escape more robust
* need to make parsing nodes which contain js more robust

## Pre-requisites:

* node v0.8.5 (developed on)
* jsdom https://github.com/tmpvar/jsdom

## Usage:

	node exfil.js
	http://localhost:7070?curl=http://path.to.url&qid=jquery_selector

## Known issues:

1. some queries will kill the server and require a restart (see to-do)

