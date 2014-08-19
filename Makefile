.PHONY: all

#This doesn't actually work yet, but this is somewhat the idea...

all: build build/index.html

compiled.js : engine/core.js
	closure-compiler --js $< --js_output_file $@

index.html : Makefile skel.html compiled.js undo.png reset.png title.png goal.png
	sed -n '1,/SCRIPT/ p' skel.html | sed '/SCRIPT/ d' > $@
	( (echo 'window.titleData = "data:image/png;base64,'; base64 title.png; ) | tr -d '\n'; echo '";' ) >> $@
	( (echo 'window.goalData = "data:image/png;base64,'; base64 goal.png; ) | tr -d '\n'; echo '";' ) >> $@
	cat compiled.js >> $@
	sed -n '/SCRIPT/,/UNDO_BACKGROUND/ p' skel.html | sed '/SCRIPT/ d; /UNDO_BACKGROUND/ d' >> $@
	( (echo '	background:url(data:image/png;base64,'; base64 undo.png; ) | tr -d '\n'; echo ');' ) >> $@
	sed -n '/UNDO_BACKGROUND/,/RESET_BACKGROUND/ p' skel.html | sed '/UNDO_BACKGROUND/ d; /RESET_BACKGROUND/ d' >> $@
	( (echo '	background:url(data:image/png;base64,'; base64 reset.png; ) | tr -d '\n'; echo ');' ) >> $@
	sed -n '/RESET_BACKGROUND/,$$ p' skel.html | sed '/RESET_BACKGROUND/ d' >> $@
	#echo '/* automatically generated to avoid single-origin problems when running locally. */' > $@
	#( echo -n 'var intro0TexData="data:image/png;base64,'; base64 -w0 undo.png; echo '";' ) >> $@
