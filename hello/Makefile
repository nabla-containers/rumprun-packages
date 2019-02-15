include ../Makefile.inc

all: bin/hello.spt bin/hello.hvt

bin/hello.spt: build/hello.spt
	mkdir -p bin
	cp $< $@

bin/hello.hvt: build/hello.hvt
	mkdir -p bin
	cp $< $@

build/hello.spt: build/configure
	$(MAKE) -C build hello.spt

build/hello.hvt: build/configure
	$(MAKE) -C build hello.hvt

build/configure:
	mkdir -p build
	cp src/* build

.PHONY: clean
clean:
	-$(MAKE) -C build clean
	rm -rf bin build

