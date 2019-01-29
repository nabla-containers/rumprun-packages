default: hello

hello.o: hello.c 
	gcc -c hello.c -o hello.o 

hello: hello.o 
	gcc hello.o -o hello 


hello.seccomp: hello.c
	x86_64-rumprun-netbsd-gcc hello.c -o hello-rumprun
	rumprun-bake solo5_ukvm_seccomp hello.seccomp hello-rumprun

clean:
	-rm -f hello.o 
	-rm -f hello
	-rm -f hello-rumprun

