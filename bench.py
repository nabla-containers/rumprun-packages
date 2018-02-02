import argparse
import pexpect
import os
import time

unikernel_cmd = './ukvm-bin.rr --disk=dummy --net=tap100 python3/examples/python.ukvm \'{"cmdline":"examples/python.bin -m bm_chameleon","env":"PYTHONHOME=/python"}\''
parser = argparse.ArgumentParser()
parser.add_argument('--cmd', dest='cmd', help='rumprun unikernel command', default=unikernel_cmd, type=str)
parser.add_argument('--show', dest='show', help='show output', default=False, type=bool)
parser.add_argument('--num', dest='num', help='number of runs', default=10, type=int)
parser.add_argument('--timeout', dest='timeout', help='timeout', default=30, type=int)
args = parser.parse_args()

for i in range(0, args.num):
    vm = pexpect.spawn(args.cmd, timeout=args.timeout)
    try:
        vm.expect('=== calling')
        t0 = time.time()
        vm.expect('=== _exit')
        t1 = time.time()
        print(t1 - t0)
    finally:
        vm.close()

if args.show:
    print vm.before
