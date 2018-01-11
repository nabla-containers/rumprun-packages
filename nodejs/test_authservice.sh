# First setup the network using
#	sudo bash setup-tests.sh
# Then, run these first in two different terminals:
# 	python test-http-server.py
# 	make run_authservice

curl -X POST -d '{"data":"23","username":"xyz","password":"xyz"}' 10.0.0.2:9083/auth/login
