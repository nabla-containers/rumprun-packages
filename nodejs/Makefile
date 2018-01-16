include ../Makefile.inc
include Makefile.inc

UPSTREAM=https://github.com/nodejs/node/archive/v$(NODE_VERSION).tar.gz
TARBALL=$(notdir $(UPSTREAM))

PKGSRC_DIR=pkgsrc/lang/$(PKGSRC)/patches

RUMPRUN_TOOLCHAIN_ARCH=$(shell echo $(RUMPRUN_TOOLCHAIN_TUPLE) | cut -d - -f 1)
ifeq ($(RUMPRUN_TOOLCHAIN_ARCH),x86_64)
	CPU=x64
endif
ifeq ($(RUMPRUN_TOOLCHAIN_ARCH),i486)
	CPU=x86
endif
ifndef CPU
	$(error Unsupported CPU architecture)
endif

export CC=$(RUMPRUN_TOOLCHAIN_TUPLE)-gcc
export CXX=$(RUMPRUN_TOOLCHAIN_TUPLE)-g++
export AR=$(RUMPRUN_TOOLCHAIN_TUPLE)-ar
export RANLIB=$(RUMPRUN_TOOLCHAIN_TUPLE)-ranlib
export LINK=$(CXX)
export GYP_DEFINES="OS=netbsd"

NODE_OUT=$(BUILD_DIR)/out/Release/node

all: $(NODE_BIN)

$(NODE_BIN): $(NODE_OUT)
	cp $^ $@

$(NODE_OUT): $(BUILD_DIR)/node.gyp $(BUILD_DIR)/config.mk _third_party_main.js rumpmain.js
	$(MAKE) -C $(BUILD_DIR)

$(BUILD_DIR)/config.mk: $(BUILD_DIR)/stamp_patch
	(cd $(BUILD_DIR); ./configure --without-snapshot --dest-cpu=$(CPU) --link-module=../_third_party_main.js --link-module=../rumpmain.js)

$(BUILD_DIR)/stamp_patch: $(BUILD_DIR)/configure patches/*.patch | patches/$(PKGSRC_DIR)
	(cd $(BUILD_DIR) && ../../scripts/apply-patches.sh -p 0 ./ ../patches/$(PKGSRC_DIR)/patch-* ../patches/*.patch)
	touch $@

$(BUILD_DIR)/node.gyp $(BUILD_DIR)/configure: | dl/$(TARBALL)
	mkdir -p $(BUILD_DIR)
	(cd $(BUILD_DIR) && tar -x --strip-components 1 -f ../dl/$(TARBALL))

dl/$(TARBALL):
	mkdir -p dl
	../scripts/fetch.sh $(UPSTREAM) dl/$(TARBALL)

patches/$(PKGSRC_DIR):
	(cd patches && cvs -q -z2 -d anoncvs@anoncvs.NetBSD.org:/cvsroot checkout -r HEAD -P $(PKGSRC_DIR))
	perl -pi -e 's/\@PYTHONBIN@/python/g' patches/$(PKGSRC_DIR)/patch-*

.PHONY: clean
clean:
	if [ -d $(BUILD_DIR) ]; then $(MAKE) -C $(BUILD_DIR) clean; rm -f $(NODE_BIN) $(NODE_BIN).bin; fi
	ln -sf default.js rumpmain.js
	$(MAKE) -C examples clean

.PHONY: run_hw
run_hw:
	(cd examples/express-4.13.3; npm install --production)
	(cd examples; \
	x86_64-rumprun-netbsd-cookfs express-4.13.3.fs express-4.13.3; \
	rumprun-bake -m "add express-4.13.3.fs" hw_generic ../build-4.3.0/out/Release/node-express-4.13.3.bin ../build-4.3.0/out/Release/node-default; \
	rumprun kvm -M 256 -I if,vioif,"-net tap,script=no,ifname=tap100" -W if,inet,static,10.0.0.2/24 -i ../build-4.3.0/out/Release/node-express-4.13.3.bin /express-4.13.3/examples/hello-world/index.js )

.PHONY: run_ukvm
run_ukvm:
	(cd examples/express-4.13.3; npm install --production; npm install body-parser method-override cookie-parser log4js morgan jsonwebtoken debug encodings)
	(cd examples; time x86_64-rumprun-netbsd-cookfs express-4.13.3.fs express-4.13.3;)
	(cd examples; rumprun-bake -m "add express-4.13.3.fs" solo5_net ../build-4.3.0/out/Release/node-express-4.13.3.bin ../build-4.3.0/out/Release/node-default;)
	(cd examples; touch dummy; \
	../ukvm-bin --disk=dummy --net=tap100 ../build-4.3.0/out/Release/node-express-4.13.3.bin '{"cmdline":"../build-4.3.0/out/Release/node-express-4.13.3.bin /express-4.13.3/examples/authservice-node/authservice_app.js","env":"CUSTOMER_SERVICE=10.0.0.4:5000","net":{"if":"ukvmif0","cloner":"True","type":"inet","method":"static","addr":"10.0.0.2","mask":"16"}}')

build-4.3.0/out/Release/node-authservice.ukvm: examples/authservice/authservice_app.js examples/authservice/authservice/routes/index.js
	(cd examples/authservice; npm install)
	(cd examples; time x86_64-rumprun-netbsd-cookfs authservice.fs authservice;)
	(cd examples; rumprun-bake -m "add authservice.fs" solo5_net ../build-4.3.0/out/Release/node-authservice.ukvm ../build-4.3.0/out/Release/node-default;)

.PHONY: run_authservice
run_authservice: build-4.3.0/out/Release/node-authservice.ukvm
	(cd examples; touch dummy; \
	../ukvm-bin --disk=dummy --net=tap100 ../build-4.3.0/out/Release/node-authservice.ukvm '{"cmdline":"../build-4.3.0/out/Release/node-authservice.ukvm /authservice/authservice_app.js","env":"CUSTOMER_SERVICE=10.0.0.4:5000","net":{"if":"ukvmif0","cloner":"True","type":"inet","method":"static","addr":"10.0.0.2","mask":"16"}}')

.PHONY: distclean
distclean:
	rm -rf build-* dl
