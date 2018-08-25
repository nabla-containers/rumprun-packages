include ../Makefile.inc
UPSTREAM=hello.tar.gz

all: bin/hello.seccomp

bin/hello.seccomp: build/hello.seccomp
	mkdir -p bin
	cp $< $@

build/hello.seccomp: build/configure
	$(MAKE) -C build hello.seccomp

build/configure:
	mkdir -p build
	cp hello.tar.gz build
	(cd build && tar -xz --strip-components 1 -f hello.tar.gz)

.PHONY: clean
clean:
	-$(MAKE) -C build clean
	rm -rf bin build

