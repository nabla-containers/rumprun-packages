SUBDIRS=$(dir $(wildcard */Makefile))
.PHONY: world all $(SUBDIRS)

all:
	@echo "To build a package with automated build support, run 'make'"
	@echo "in the package directory."
	@echo
	@echo "To build all packages, run 'make world'."

TEMPDIR := $(shell mktemp -d)

# TEST: build nodejs/examples/authservice
build_auth_seccomp: nodejs/examples/authservice.ext2 nodejs/examples/node.seccomp ukvm-bin.seccomp.static Dockerfile
	cp nodejs/examples/node.seccomp $(TEMPDIR)/.
	cp nodejs/examples/authservice.ext2 $(TEMPDIR)/.
	cp ukvm-bin.seccomp.static $(TEMPDIR)/.
	cp Dockerfile $(TEMPDIR)/.
	(cd $(TEMPDIR); sudo docker build -t solo5-rump-node:4.3.0 .)
	rm -rf ${TEMPDIR}

nodejs/examples/authservice.ext2:
	make -C nodejs/examples authservice.ext2

nodejs/examples/node.seccomp:
	make -C nodejs/examples node.seccomp

# TEST: run nodejs/examples/authservice
run_auth_seccomp:
	sudo docker run --rm --name=rump_node --privileged --net=host -it solo5-rump-node:4.3.0 /ukvm-bin --disk=authservice.ext2 --net=tap100 node.ukvm '{"cmdline":"node.seccomp /authservice/authservice_app.js","env":"CUSTOMER_SERVICE=10.0.0.4:5000","net":{"if":"ukvmif0","cloner":"True","type":"inet","method":"static","addr":"10.0.0.2","mask":"16"},"blk":{"source":"etfs","path":"/dev/ld0a","fstype":"blk","mountpoint":"/authservice"}}'

world: $(SUBDIRS)

$(SUBDIRS):
	$(MAKE) -C $@ all
