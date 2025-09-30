import os
import re
from collections import defaultdict

def scan_error_msg_files(root_dir):
    """
    Recursively scan all files named 'error_msg' and process their contents
    """
    hint_pattern = re.compile(r'Hint:\s*(.+)')
    
    # Store Hint content and counts for READ and WRITE separately
    read_hint_counter = defaultdict(int)
    write_hint_counter = defaultdict(int)
    
    # Counters with maximum limit
    read_count = 0
    write_count = 0
    max_count = 100000000000000000000000
    
    # Recursively traverse directories
    for root, dirs, files in os.walk(root_dir):
        if read_count >= max_count and write_count >= max_count:
            break  # Early termination if both reach the limit
            
        for file in files:
            if file == 'error_msg':
                file_path = os.path.join(root, file)
                try:
                    read_found, write_found = process_file(
                        file_path, hint_pattern, 
                        read_hint_counter, write_hint_counter,
                        read_count, write_count, max_count
                    )
                    read_count += read_found
                    write_count += write_found
                    
                    # Check if limits are reached
                    if read_count >= max_count and write_count >= max_count:
                        break
                        
                except Exception as e:
                    print(f"Error processing file {file_path}: {e}")
        
        # Check if limits are reached for early termination
        if read_count >= max_count and write_count >= max_count:
            break
    
    return read_hint_counter, write_hint_counter, read_count, write_count

def process_file(file_path, hint_pattern, read_hint_counter, write_hint_counter, 
                current_read_count, current_write_count, max_count):
    """
    Process a single error_msg file
    """
    read_found = 0
    write_found = 0
    
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        lines = f.readlines()
    
    for i in range(len(lines) - 1):  # Ensure there's a next line
        current_line = lines[i].strip()
        next_line = lines[i + 1].strip()
        
        # Check if limits are reached
        if current_read_count >= max_count and current_write_count >= max_count:
            break
        
        # Check if current line contains READ memory access error
        if 'READ memory access' in current_line and current_read_count < max_count:
            hint_match = hint_pattern.search(next_line)
            if hint_match:
                hint_content = hint_match.group(1).strip()
                read_hint_counter[hint_content] += 1
                read_found += 1
                print(f"READ - Found Hint in {file_path}: {hint_content} (Total: {current_read_count + read_found})")
        
        # Check if current line contains WRITE memory access error
        elif 'WRITE memory access' in current_line and current_write_count < max_count:
            hint_match = hint_pattern.search(next_line)
            if hint_match:
                hint_content = hint_match.group(1).strip()
                write_hint_counter[hint_content] += 1
                write_found += 1
                print(f"WRITE - Found Hint in {file_path}: {hint_content} (Total: {current_write_count + write_found})")
    
    return read_found, write_found

def print_results(counter, title, total_count):
    """Print results"""
    print(f"\n=== {title} Results ({total_count} found) ===")
    if counter:
        print("Hint content and occurrence count (sorted by frequency):")
        for hint, count in sorted(counter.items(), key=lambda x: x[1], reverse=True):
            print(f"  {hint}: {count} times")
    else:
        print("No matching Hint content found")

def main():
    # Set root directory to scan
    root_directory = input("Please enter the root directory path to scan: ").strip()
    
    if not os.path.isdir(root_directory):
        print("Error: The specified path is not a valid directory")
        return
    
    print(f"Starting directory scan: {root_directory}")
    print("Scanning will stop after finding 1000 READ and 1000 WRITE entries each...")
    
    # Scan and process files
    read_hint_counter, write_hint_counter, read_count, write_count = scan_error_msg_files(root_directory)
    
    # Output results
    print("\n" + "="*50)
    print_results(read_hint_counter, "READ memory access", read_count)
    print("\n" + "="*50)
    print_results(write_hint_counter, "WRITE memory access", write_count)
    
    # Statistics
    print("\n=== Scan Statistics ===")
    print(f"READ memory access found: {read_count}")
    print(f"WRITE memory access found: {write_count}")
    print(f"READ Hint types: {len(read_hint_counter)}")
    print(f"WRITE Hint types: {len(write_hint_counter)}")

if __name__ == "__main__":
    main()