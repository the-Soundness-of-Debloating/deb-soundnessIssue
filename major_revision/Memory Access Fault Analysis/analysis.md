# Memory Access Fault Analysis

## Overview

A total of **2922** memory access faults were detected during the scan.

- **READ** access faults: **2619**
- **WRITE** access faults: **303**

## READ Fault Breakdown (2619)

| Fault Cause | Count | Percentage |
| :--- | :--- | :--- |
| **Dereferenced a NULL/Zero page pointer** | 1824 | 69.65% |
| Dereferenced a high-value address (invalid pointer) | 749 | 28.60% |
| Program Counter (PC) at non-executable memory (wild jump) | 46 | 1.76% |

## WRITE Fault Breakdown (303)

| Fault Cause | Count | Percentage |
| :--- | :--- | :--- |
| **Dereferenced a NULL/Zero page pointer** | 303 | 100.0% |