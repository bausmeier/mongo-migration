MOCHA = node_modules/.bin/_mocha

cover:
	@istanbul cover $(MOCHA)

debug:
	@node-theseus $(MOCHA)

.PHONY: cover debug
