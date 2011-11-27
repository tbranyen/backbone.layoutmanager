BASE = .

all:
	uglifyjs $(BASE)/backbone.layoutmanager.js > $(BASE)/dist/backbone.layoutmanager.min.js
