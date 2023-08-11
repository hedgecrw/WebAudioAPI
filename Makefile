BUILD_DIR             := build
DEMO_DIR              := $(BUILD_DIR)/demos
DOCS_DIR              := $(BUILD_DIR)/docs
LIB_DIR               := $(BUILD_DIR)/lib

DEMO_TARGETS          := netsblox piano score external effects analysis
TOOL_TARGETS          := instrumentcreator

.PHONY : all clean lib assets docs demos $(DEMO_TARGETS) $(TOOL_TARGETS) run

all :
	$(info Make target must be one of: clean lib assets docs demos run)

$(LIB_DIR) :
	mkdir -p "$@"

lib : $(LIB_DIR)
	npm run build

assets : $(LIB_DIR)
	find assets/instruments -type f | sed s,^assets/instruments/,, | tar czf $(LIB_DIR)/webAudioAPI-instruments.tgz -C assets/instruments -T -

docs :
	./node_modules/.bin/jsdoc library/webaudioapi -c docs/conf.json -P package.json -R README.md -d $(DOCS_DIR)

demos : $(DEMO_TARGETS) $(TOOL_TARGETS)

demoassets :
	mkdir -p "$(DEMO_DIR)"
	cp -rf assets/instruments "$(DEMO_DIR)/"
	cp -f demos/index.html "$(DEMO_DIR)/"

$(DEMO_TARGETS) : lib demoassets
	mkdir -p "$(DEMO_DIR)/$@/js"
	cp -f $(LIB_DIR)/*.js "$(DEMO_DIR)/$@/js/"
	cp -f demos/$@/*.js "$(DEMO_DIR)/$@/js/"
	find demos/$@/* -maxdepth 0 ! -name '*.js' -exec cp -rf "{}" "$(DEMO_DIR)/$@"/  \;

instrumentcreator :
	mkdir -p "$(DEMO_DIR)/$@/js"
	cp -f library/webaudioapi/modules/*.*js "$(DEMO_DIR)/$@/js/"
	cp -f tools/$@/*.js "$(DEMO_DIR)/$@/js/"
	find tools/$@/* -maxdepth 0 ! -name '*.js' -exec cp -rf "{}" "$(DEMO_DIR)/$@"/  \;

run :
	cd $(DEMO_DIR) && python3 -m http.server --cgi 8080

clean :
	rm -rf $(BUILD_DIR)

test : clean demos run