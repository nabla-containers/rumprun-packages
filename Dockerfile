FROM scratch
ADD node.seccomp /node.ukvm
ADD ukvm-bin.seccomp.static /ukvm-bin
ADD authservice.ext2 /authservice.ext2
#RUN ["/ukvm-bin.seccomp", "--disk=authservice.ext2", "--net=tap100", "/node-authservice.seccomp", "'{\"cmdline\":\"node-authservice.seccomp\",\"/authservice/authservice_app.js\",\"env\":\"CUSTOMER_SERVICE=10.0.0.4:5000\",\"net\":{\"if\":\"ukvmif0\",\"cloner\":\"True\",\"type\":\"inet\",\"method\":\"static\",\"addr\":\"10.0.0.2\",\"mask\":\"16\"},\"blk\":{\"source\":\"etfs\",\"path\":\"/dev/ld0a\",\"fstype\":\"blk\",\"mountpoint\":\"/authservice\"}}'"]
