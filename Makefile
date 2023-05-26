OUTPUT_DIR            := demo

.PHONY : all clean run libcopy netsblox piano score instrument

all :
	$(info Make target must be one of "clean, run, netsblox, piano, score, or instrument")

$(OUTPUT_DIR) :
	mkdir -p "$@/js"

libcopy :
	cp -rf library/webaudioapi $(OUTPUT_DIR)/js/
	cp -rf assets/{effects,instruments} $(OUTPUT_DIR)/js/

netsblox : clean $(OUTPUT_DIR) libcopy
	cp -f demos/$@/*.js $(OUTPUT_DIR)/js/
	find demos/$@/* ! -name '*.js' -maxdepth 0 -exec cp -rf "{}" $(OUTPUT_DIR)/  \;

piano : clean $(OUTPUT_DIR) libcopy
	cp -f demos/$@/*.js $(OUTPUT_DIR)/js/
	find demos/$@/* ! -name '*.js' -maxdepth 0 -exec cp -rf "{}" $(OUTPUT_DIR)/  \;

score : clean $(OUTPUT_DIR) libcopy
	cp -f demos/$@/*.js $(OUTPUT_DIR)/js/
	find demos/$@/* ! -name '*.js' -maxdepth 0 -exec cp -rf "{}" $(OUTPUT_DIR)/  \;

instrument : clean $(OUTPUT_DIR) libcopy
	cp -f tools/$@/*.js $(OUTPUT_DIR)/js/
	find tools/$@/* ! -name '*.js' -maxdepth 0 -exec cp -rf "{}" $(OUTPUT_DIR)/  \;

clean :
	rm -rf $(OUTPUT_DIR)

run :
	cd $(OUTPUT_DIR) && python3 -m http.server --cgi 8080
