
#!/usr/bin/env python3
"""
TCP Ping Test (defaults to port 80, 10000 packets)
 
Usage: ./tcpping.py host [port] [maxCount]
- Ctrl-C Exits with Results
"""
 
import sys
import socket
import time
# import signal
from timeit import default_timer as timer
from datetime import datetime, timedelta
import random
 
host = None
port = 80
 
# Default to 10000 connections max
maxCount = 1000000
count = 0
 
# Pass/Fail counters
passed = 0
failed = 0
 

# PUT REMOTE HOSTS HERE
remote_hosts=[
    '10.20.147.136',
    '10.20.180.3',
    '10.20.125.232',
    '10.40.169.255',
    '10.40.132.216',
    '10.40.111.12'
]
port=80
 
script_start = datetime.now()
script_end = datetime.now() + timedelta(seconds=86400) #
 

# Loop while less than max count or until Ctrl-C caught
while count < maxCount:
    if datetime.now() > script_end:
        sys.exit(0)
 
    # Increment Counter
    count += 1
 
    success = False
 
    # New Socket
    s = socket.socket(
    socket.AF_INET, socket.SOCK_STREAM)
 
    # 10sec Timeout
    s.settimeout(10)
 
    # Start a timer
    s_start = timer()
    start = datetime.now()
 
    start_time = start.strftime("%Y-%m-%dT%H:%M:%S.%f %Z")
 
    #get a random host
    host=remote_hosts[random.randrange(0, len(remote_hosts))]
    # Try to Connect
    try:
        s.connect((host, int(port)))
        s.shutdown(socket.SHUT_RD)
        success = True
   
    # Connection Timed Out
    except socket.timeout:
        print("Connection timed out!")
        failed += 1
    except OSError as e:
        print("OS Error:", e)
        failed += 1
   
    end = datetime.now()
 
    end_time = end.strftime("%Y-%m-%dT%H:%M:%S.%f %Z")
    # Stop Timer
    s_stop = timer()
    s_runtime = "%.2f" % (1000 * (s_stop - s_start))
 
    if success:
        print("status=success remote_host=%s port=%s tcp_seq=%s time=%s ms start=%s end=%s" % (host, port, (count-1), s_runtime, start_time, end_time))
        passed += 1
    else:
        print("status=failure remote_host=%s port=%s tcp_seq=%s time=%s ms start=%s end=%s" % (host, port, (count-1), s_runtime, start_time, end_time))
    # if (1000 * (s_stop - s_start)) > 300:
    #     print("Connection to %s[%s]: tcp_seq=%s time=%s ms start=%s end=%s" % (host, port, (count-1), s_runtime, start_time, end_time))
 
    # Sleep for 1sec
    if count < maxCount:
        time.sleep(1)
 
# Output Results if maxCount reached
# getResults()
 
 