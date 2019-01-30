include ../Makefile.inc

UPSTREAM=http://nginx.org/download/nginx-1.8.0.tar.gz
TARBALL=$(notdir $(UPSTREAM))

all: libssl $(RUMPRUN_PKGS_DIR)/lib/libpcre.a bin/nginx images

.NOTPARALLEL: $(RUMPRUN_PKGS_DIR)/lib/libpcre.a
$(RUMPRUN_PKGS_DIR)/lib/libpcre.a:
	$(MAKE) -C ../pcre

bin/nginx: build/objs/nginx
	mkdir -p bin
	cp $< $@

build/objs/nginx: build/Makefile
	$(MAKE) -C build

NGINX_CONF_ENV += \
	ngx_force_c_compiler=yes \
	ngx_force_c99_have_variadic_macros=yes \
	ngx_force_gcc_have_variadic_macros=yes \
	ngx_force_gcc_have_atomic=yes \
	ngx_force_have_libatomic=no \
	ngx_force_sys_nerr=100 \
	ngx_force_have_map_anon=yes \
	ngx_force_have_map_devzero=no \
	ngx_force_have_timer_event=yes \
	ngx_force_have_posix_sem=yes

NGINX_CONF_OPTS += \
	--crossbuild=NetBSD \
	--with-cc=$(RUMPRUN_CC) \
	--with-cc-opt="-I $(RUMPRUN_PKGS_DIR)/include" \
	--with-ld-opt="-L $(RUMPRUN_PKGS_DIR)/lib" \
	--prefix=/none \
	--conf-path=/data/conf/nginx.conf \
	--sbin-path=/none \
	--pid-path=/tmp/nginx.pid \
	--lock-path=/tmp/nginx.lock \
	--error-log-path=/tmp/error.log \
	--http-log-path=/tmp/access.log \
	--http-client-body-temp-path=/tmp/client-body \
	--http-proxy-temp-path=/tmp/proxy \
	--http-fastcgi-temp-path=/tmp/fastcgi \
	--http-scgi-temp-path=/tmp/scgi \
	--http-uwsgi-temp-path=/tmp/uwsgi \
	--with-http_ssl_module \
	--with-ipv6 \
	--with-pcre

build/Makefile: build/stamp_patch
	(cd build; $(NGINX_CONF_ENV) ./configure $(NGINX_CONF_OPTS))

build/stamp_patch: build/configure patches/*
	../scripts/apply-patches.sh build/ patches/*
	touch $@

dl/$(TARBALL):
	mkdir -p dl
	../scripts/fetch.sh ${UPSTREAM} dl/$(TARBALL)

build/configure: | dl/$(TARBALL)
	mkdir -p build
	(cd build && tar -xz --strip-components 1 -f ../dl/$(TARBALL))

.PHONY: images
images: images/data.iso

images/data.iso: images/data/conf/* images/data/www/*
	$(RUMPRUN_GENISOIMAGE) -o images/data.iso images/data

.PHONY: clean
clean:
	-$(MAKE) -C build clean
	rm -f bin/*
	rm -f images/data.iso

.PHONY: distclean
distclean: clean
	rm -rf build

.PHONY: run_hw
run_hw: bin/nginx
	x86_64-rumprun-netbsd-cookfs data.fs data
	rumprun-bake -m "add data.fs" hw_generic bin/nginx.bin bin/nginx
	rumprun qemu -i -I if,vioif,"-net tap,script=no,ifname=tap100" -W if,inet,static,10.0.0.2/24 -- bin/nginx.bin -c /data/conf/nginx.conf

bin/nginx.ukvm: bin/nginx
	rumprun-bake solo5_hvt bin/nginx.ukvm bin/nginx

bin/nginx.seccomp: bin/nginx
	rumprun-bake solo5_spt bin/nginx.seccomp bin/nginx

.PHONY: run_ukvm
run_ukvm: bin/nginx.ukvm images/data.iso
	../../rumprun/solo5/tenders/hvt/solo5-hvt --disk=images/data.iso --net=tap100 bin/nginx.ukvm '{"cmdline":"bin/nginx.ukvm -c /data/conf/nginx.conf","net":{"if":"ukvmif0","cloner":"True","type":"inet","method":"static","addr":"10.0.0.2","mask":"16"},"blk":{"source":"etfs","path":"/dev/ld0a","fstype":"blk","mountpoint":"/data"}}'

run_seccomp: bin/nginx.seccomp images/data.iso
	../../rumprun/solo5/tenders/spt/solo5-spt --disk=images/data.iso --net=tap100 bin/nginx.seccomp '{"cmdline":"bin/nginx.seccomp -c /data/conf/nginx.conf","net":{"if":"ukvmif0","cloner":"True","type":"inet","method":"static","addr":"10.0.0.2","mask":"16"},"blk":{"source":"etfs","path":"/dev/ld0a","fstype":"blk","mountpoint":"/data"}}'

run_seccomp_gdb: bin/nginx.seccomp
	touch dummy
	cgdb --ex="b ukvm_elf_load" --ex="r --disk=dummy --net=tap100 bin/nginx.seccomp '{\"cmdline\":\"bin/nginx.seccomp -c /data/conf/nginx.conf\",\"net\":{\"if\":\"ukvmif0\",\"cloner\":\"True\",\"type\":\"inet\",\"method\":\"static\",\"addr\":\"10.0.0.2\",\"mask\":\"16\"}}'" --ex="finish" --ex="add-symbol-file bin/nginx.seccomp 0x100000" ../ukvm-bin.seccomp

run_seccomp_gdb2: bin/nginx.seccomp
	touch dummy
	cgdb --ex="b ukvm_elf_load" --ex="r --disk=dummy --net=tap100 bin/nginx.seccomp '{\"cmdline\":\"bin/nginx.seccomp -c /data/conf/nginx.conf\",\"net\":{\"if\":\"ukvmif0\",\"cloner\":\"True\",\"type\":\"inet\",\"method\":\"static\",\"addr\":\"10.0.0.2\",\"mask\":\"16\"}}'" --ex="finish" --ex="add-symbol-file bin/nginx.seccomp 0x100000" \
	--ex="b rumpuser_clock_sleep" \
	--ex="b rumpcomp_ukvmif_receive" \
	--ex="b solo5_yield" \
	--ex="b schedule" \
	--ex="b rump_schedlock_cv_wait" \
	--ex="b sched_switch" \
	--ex="ignore 2 10000000" \
	--ex="ignore 3 10000000" \
	--ex="ignore 4 10000000" \
	--ex="ignore 5 10000000" \
	--ex="ignore 6 10000000" \
	--ex="ignore 7 10000000" \
	../ukvm-bin.seccomp

run_seccomp_perf: bin/nginx.seccomp
	touch dummy
	perf record -g -F 999 -d -- ../ukvm-bin.seccomp --disk=dummy --net=tap100 bin/nginx.seccomp '{"cmdline":"bin/nginx.seccomp -c /data/conf/nginx.conf","net":{"if":"ukvmif0","cloner":"True","type":"inet","method":"static","addr":"10.0.0.2","mask":"16"}}'

nginx.seccomp.map: bin/nginx.seccomp
	#nm bin/nginx.seccomp > nginx.seccomp.map
	bash -c "objdump -x bin/nginx.seccomp | awk '{ print \$$1, g, \$$NF }' > nginx.seccomp.map"
	bash -c "objdump -x ../ukvm-bin.seccomp | awk '{ print \$$1, g, \$$NF }' >> nginx.seccomp.map"
	#bash -c "objdump -x bin/nginx.seccomp | awk '{ print \$$1, \$$2, \$$NF }' > nginx.seccomp.map"

.PHONY: flamegraph_seccomp
flamegraph_seccomp: nginx.seccomp.map
	cp nginx.seccomp.map /tmp/perf-19924.map
	perf script  | ~/research/FlameGraph/stackcollapse-perf.pl --all --addrs | ~/research/FlameGraph/flamegraph.pl --color=java > out.svg

flamegraph_gdb:
	cat trace | ~/research/FlameGraph/stackcollapse-gdb.pl | ~/research/FlameGraph/flamegraph.pl --color=java > out.svg

include ../Makefile.deps
