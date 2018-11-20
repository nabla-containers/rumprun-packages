include ../Makefile.inc

UPSTREAM=http://archive.debian.org/debian/pool/main/p/postmark/postmark_1.51.orig.tar.gz
TARBALL=$(notdir $(UPSTREAM))

all: bin/postmark

bin/postmark: build/postmark
	mkdir -p bin
	cp $< $@

build/postmark: build/Makefile
	(cd	build && x86_64-rumprun-netbsd-gcc *.c -o postmark)

dl/$(TARBALL):
	mkdir -p dl
	../scripts/fetch.sh ${UPSTREAM} dl/$(TARBALL)

build/Makefile: | dl/$(TARBALL)
	mkdir -p build
	(cd build && tar -xz --strip-components 1 -f ../dl/$(TARBALL))

.PHONY: clean
clean:
	rm -rf build/ bin/ dl/

.PHONY: distclean
distclean: clean

bin/postmark.seccomp:
	rumprun-bake solo5_ukvm_seccomp bin/postmark.seccomp bin/postmark
