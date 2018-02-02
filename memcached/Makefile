include ../Makefile.inc

UPSTREAM=http://www.memcached.org/files/memcached-1.4.28.tar.gz
TARBALL=$(notdir $(UPSTREAM))

all: $(RUMPRUN_PKGS_DIR)/lib/libevent.a build/configure build/Makefile

.NOTPARALLEL: $(RUMPRUN_PKGS_DIR)/lib/libevent.a
$(RUMPRUN_PKGS_DIR)/lib/libevent.a:
	$(MAKE) -C ../libevent

MEMCACHED_CONF_ENV += \
	LIBS=-lc \
	CC=$(RUMPRUN_CC)

MEMCACHED_CONF_OPTS += \
	--prefix=$(shell pwd)/build/dist \
	--host=$(RUMPRUN_TOOLCHAIN_TUPLE) \
	--with-libevent=$(shell pwd)/../../pkgs

build/stamp_patch:
	(cd build && ../../scripts/apply-patches.sh ./ ../patches/*)
	touch $@

.PHONY: build/Makefile
build/Makefile: build/stamp_patch
	(cd build; $(MEMCACHED_CONF_ENV) ./configure $(MEMCACHED_CONF_OPTS); make)

dl/$(TARBALL):
	mkdir -p dl
	../scripts/fetch.sh ${UPSTREAM} dl/$(TARBALL)

build/configure: | dl/$(TARBALL)
	mkdir -p build
	(cd build && tar -xz --strip-components 1 -f ../dl/$(TARBALL))

run_hw: build/memcached.bin build/memcached
	rumprun-bake hw_generic build/memcached.bin build/memcached
	rumprun qemu -g '-nographic -vga none' -i -M 256 \
	    -I if,vioif,'-net tap,script=no,ifname=tap100' \
	    -W if,inet,static,10.0.0.2/24 \
	    -- build/memcached.bin -u root

run_ukvm: build/memcached.bin build/memcached
	rumprun-bake solo5_ukvm_net build/memcached.ukvm build/memcached
	touch dummy
	../ukvm-bin --disk=dummy --net=tap100 build/memcached.ukvm '{"cmdline":"build/memcached.bin -u root","net":{"if":"ukvmif0","cloner":"True","type":"inet","method":"static","addr":"10.0.0.2","mask":"16"}}' 

run_qemu_directly: build/memcached.bin build/memcached
	rumprun-bake hw_generic build/memcached.bin build/memcached
	qemu-system-x86_64 -L /root/qemu-2.5/pc-bios -m 128 -nodefaults -no-acpi -display none -serial stdio -device virtio-net,netdev=n0 -netdev tap,id=n0,ifname=tap100,script=no,downscript=no -device isa-debug-exit -kernel build/memcached.bin -append '{"cmdline":"build/memcached.bin -u root","net":{"if":"vioif0","type":"inet","method":"static","addr":"10.0.0.2","mask":"24"}}'

.PHONY: clean
clean:
	(cd build; make clean)
	rm build/stamp_patch
	rm -rf build

.PHONY: distclean
distclean: clean
	rm -rf build
