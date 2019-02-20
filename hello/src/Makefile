default: hello

hello: hello.c
	${RUMPRUN_CC} hello.c -o hello

hello.spt: hello
	${RUMPRUN_BAKE} solo5_spt $@ $<

hello.hvt: hello
	${RUMPRUN_BAKE} solo5_hvt $@ $<

clean:
	-rm -f hello
	-rm -f hello.spt hello.hvt

