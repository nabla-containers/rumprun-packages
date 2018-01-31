include ../Makefile.inc

UPSTREAM=https://www.python.org/ftp/python/3.5.2/Python-3.5.2.tar.xz
TARBALL=$(notdir $(UPSTREAM))
ARCH=$(shell $(HOST_CC) -dumpmachine)

all: libssl $(RUMPRUN_PKGS_DIR)/lib/libsqlite.a images/python.iso

.NOTPARALLEL: $(RUMPRUN_PKGS_DIR)/lib/libsqlite.a
$(RUMPRUN_PKGS_DIR)/lib/libsqlite.a:
	$(MAKE) -C ../sqlite

build/python: build/Makefile
	$(MAKE) -C build
	$(MAKE) -C build install

PYTHON_CONF_ENV += \
	LDFLAGS="-static -static-libgcc -L${RUMPRUN_PKGS_DIR}/lib" \
	CPPFLAGS="$(CPPFLAGS) -static -I${RUMPRUN_PKGS_DIR}/include" \
	CFLAGS="$(CFLAGS) -static" \
	CC=$(RUMPRUN_CC) \
	PYTHON_FOR_BUILD=$(shell pwd)/build/hostdist/bin/python3 \
	CONFIG_SITE=config.site

PYTHON_CONF_OPTS += \
	--prefix=$(shell pwd)/build/pythondist \
	--disable-shared \
	--host=$(RUMPRUN_TOOLCHAIN_TUPLE) \
	--build $(ARCH) \
	--enable-ipv6 \
	--with-openssl=${RUMPRUN_PKGS_DIR} \
	--without-ensurepip

dl/$(TARBALL):
	mkdir -p dl
	../scripts/fetch.sh ${UPSTREAM} dl/$(TARBALL)

build/hostpython: | dl/$(TARBALL)
	mkdir -p build
	(cd build && tar -x --strip-components 1 -f ../dl/$(TARBALL))
	(cd build; ./configure --prefix=$(shell pwd)/build/hostdist; make python Parser/pgen && make install)
	mv build/python build/hostpython

build/Parser/hostpgen: build/hostpython
	cp build/Parser/pgen build/Parser/hostpgen

build/Programs/host_freeze_importlib: build/Parser/hostpgen
	cp build/Programs/_freeze_importlib build/Programs/host_freeze_importlib

build/configure: build/Programs/host_freeze_importlib
	(cd build; make distclean)

build/stamp_patch: build/configure patches/*
	cp config.site build/
	(cd build && ../../scripts/apply-patches.sh ./ ../patches/*)
	wget --no-clobber https://github.com/numpy/numpy/releases/download/v1.12.1/numpy-1.12.1.tar.gz
	rm -rf numpy-1.12.1
	rm -rf build/Modules/numpy
	tar xzvf numpy-1.12.1.tar.gz
	cp -R numpy-1.12.1/numpy/core build/Modules/numpy
	cp -R files/* build/Modules/
	touch $@

build/Makefile: build/stamp_patch
	(cd build; $(PYTHON_CONF_ENV) ./configure $(PYTHON_CONF_OPTS))

images/python.iso: build/python
	mkdir -p images
	$(RUMPRUN_GENISOIMAGE) -o images/python.iso build/pythondist/lib/python3.5

python.fs: examples/main.py
	rm -rf python
	mkdir -p python/lib/
	cp -r build/pythondist/lib/python3.5 python/lib/.
	cp examples/main.py python/lib/python3.5/site-packages/.
	x86_64-rumprun-netbsd-cookfs python.fs python

python_flask.fs: flask_main.py
	rm -rf flask-env
	pyvenv-3.5 flask-env
	bash -c "source flask-env/bin/activate; pip install flask; deactivate"
	rm -rf python
	mkdir -p python/lib
	cp -r build/pythondist/lib/python3.5 python/lib/.
	cp -r flask-env/lib/python3.5/site-packages/* python/lib/python3.5/site-packages/.
	cp flask_main.py python/lib/python3.5/site-packages/.
	x86_64-rumprun-netbsd-cookfs python_flask.fs python

python_tornado.fs: tornado_main.py
	rm -rf tornado-env
	pyvenv-3.5 tornado-env
	bash -c "source tornado-env/bin/activate; pip install tornado; deactivate"
	rm -rf python
	mkdir -p python/lib
	cp -r build/pythondist/lib/python3.5 python/lib/.
	cp -r tornado-env/lib/python3.5/site-packages/* python/lib/python3.5/site-packages/.
	cp tornado_main.py python/lib/python3.5/site-packages/.
	x86_64-rumprun-netbsd-cookfs python_tornado.fs python

flaskenv.iso: flask_main.py
	rm -rf flask-env
	pyvenv-3.5 flask-env
	bash -c "source flask-env/bin/activate; pip install flask; deactivate"
	genisoimage -r -o flaskenv.iso flask_main.py flask-env/lib/python3.5/site-packages

aioenv.iso: aio_main.py
	rm -rf aio-env
	pyvenv-3.5 aio-env
	bash -c "source aio-env/bin/activate; pip install aiohttp asyncio; deactivate"
	genisoimage -r -o aioenv.iso aio_main.py aio-env/lib/python3.5/site-packages

tornadoenv.iso: tornado_main.py
	rm -rf tornado-env
	pyvenv-3.5 tornado-env
	bash -c "source tornado-env/bin/activate; pip install tornado; deactivate"
	genisoimage -r -o tornadoenv.iso tornado_main.py tornado-env/lib/python3.5/site-packages

numpyenv.iso: numpy_main.py
	rm -rf numpy-env
	pyvenv-3.5 numpy-env
	bash -c "source numpy-env/bin/activate; pip install numpy; deactivate"
	genisoimage -r -o numpyenv.iso numpy_main.py numpy-env/lib/python3.5/site-packages

.PHONY: run_hw_flask_iso
run_hw_flask_iso: flaskenv.iso
	rumprun-bake hw_generic examples/python.bin build/python 
	rumprun qemu -i -g '-nographic -vga none' \
 	   -I if,vioif,'-net tap,ifname=tap100,script=no' \
           -W if,inet,static,10.0.0.2/24 \
	   -b images/python.iso,/python/lib/python3.5 \
	   -b flaskenv.iso,/python/lib/python3.5/site-packages \
	   -e PYTHONHOME=/python \
	   -- examples/python.bin -m flask_main

.PHONY: run_hw_aio_iso
run_hw_aio_iso: aioenv.iso
	rumprun-bake hw_generic examples/python.bin build/python 
	rumprun qemu -i -g '-nographic -vga none' \
 	   -I if,vioif,'-net tap,ifname=tap100,script=no' \
           -W if,inet,static,10.0.0.2/24 \
	   -b images/python.iso,/python/lib/python3.5 \
	   -b aioenv.iso,/python/lib/python3.5/site-packages \
	   -e PYTHONHOME=/python \
	   -- examples/python.bin -m aio_main

.PHONY: run_hw_tornado_iso
run_hw_tornado_iso: tornadoenv.iso
	rumprun-bake hw_generic examples/python.bin build/python 
	rumprun qemu -i -g '-nographic -vga none' \
 	   -I if,vioif,'-net tap,ifname=tap100,script=no' \
           -W if,inet,static,10.0.0.2/24 \
	   -b images/python.iso,/python/lib/python3.5 \
	   -b tornadoenv.iso,/python/lib/python3.5/site-packages \
	   -e PYTHONHOME=/python \
	   -- examples/python.bin -m tornado_main

.PHONY: run_hw_numpy_iso
run_hw_numpy_iso: numpyenv.iso
	rumprun-bake hw_generic examples/python.bin build/python 
	rumprun qemu -i -g '-nographic -vga none' \
 	   -I if,vioif,'-net tap,ifname=tap100,script=no' \
           -W if,inet,static,10.0.0.2/24 \
	   -b images/python.iso,/python/lib/python3.5 \
	   -b numpyenv.iso,/python/lib/python3.5/site-packages \
	   -e PYTHONHOME=/python -e PATH=/python \
	   -- examples/python.bin -m numpy_main

run_hw_flask: python_flask.fs
	rumprun-bake -m "add python_flask.fs" hw_generic examples/python.bin build/python
	rumprun qemu -M 256 -i -g '-nographic -vga none' \
 	   -I if,vioif,'-net tap,ifname=tap100,script=no' \
           -W if,inet,static,10.0.0.2/24 \
	   -e PYTHONHOME=/python \
	   -- examples/python.bin -m flask_main

run_hw_tornado: python_tornado.fs
	rumprun-bake -m "add python_tornado.fs" hw_generic examples/python.bin build/python
	rumprun qemu -M 256 -i -g '-nographic -vga none' \
 	   -I if,vioif,'-net tap,ifname=tap100,script=no' \
           -W if,inet,static,10.0.0.2/24 \
	   -e PYTHONHOME=/python \
	   -- examples/python.bin -m tornado_main

.PHONY: run_hw
run_hw: python.fs
	rumprun-bake -m "add python.fs" hw_generic examples/python.bin build/python 
	rumprun qemu -M 256 -i -g '-nographic -vga none' -e PYTHONHOME=/python -- examples/python.bin -m main

.PHONY: run_ukvm
run_ukvm: python.fs
	rumprun-bake -m "add python.fs" solo5_net examples/python.bin build/python 
	touch dummy
	../ukvm-bin --disk=dummy --net=tap100 examples/python.bin '{"cmdline":"examples/python.bin -m main","env":"PYTHONHOME=/python","net":{"if":"ukvmif0","cloner":"True","type":"inet","method":"static","addr":"10.0.0.2","mask":"16"}}' 

.PHONY: run_hw_fs
run_hw_fs:
	rumprun-bake hw_generic examples/python.bin build/python 
	rumprun kvm -i -g '-nographic -vga none' \
	   -b images/python.iso,/python/lib/python3.5 \
	   -b examples/main.iso,/python/lib/python3.5/site-packages \
	   -e PYTHONHOME=/python \
	   -- examples/python.bin -m main

.PHONY: clean
clean:
	-$(MAKE) -C build clean
	rm -f bin/*
	rm -f images/python.iso
	rm -f examples/hw.c examples/hw.bin examples/hw

.PHONY: distclean
distclean: clean
	rm -rf build

include ../Makefile.deps
