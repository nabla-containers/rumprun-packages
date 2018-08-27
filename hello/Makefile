include ../Makefile.inc

all: bin/hello.seccomp

bin/hello.seccomp: build/hello.seccomp
	mkdir -p bin
	cp $< $@

build/hello.seccomp: build/configure
	$(MAKE) -C build hello.seccomp

build/configure:
	mkdir -p build
	cp src/* build

.PHONY: clean
clean:
	-$(MAKE) -C build clean
	rm -rf bin build

