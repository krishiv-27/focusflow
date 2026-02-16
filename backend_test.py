#!/usr/bin/env python3

import requests
import json
import sys
from typing import Dict, Any, List

# Test configuration
BASE_URL = "https://focusflow-study-2.preview.emergentagent.com"
API_BASE = f"{BASE_URL}/api"

class FocusFlowAPITester:
    def __init__(self):
        self.base_url = API_BASE
        self.test_results = []
        self.failed_tests = []
        
    def log_test(self, test_name: str, passed: bool, details: str = ""):
        """Log test result"""
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status}: {test_name}")
        if details:
            print(f"   Details: {details}")
        
        self.test_results.append({
            'test': test_name,
            'passed': passed,
            'details': details
        })
        
        if not passed:
            self.failed_tests.append(f"{test_name}: {details}")
    
    def test_health_endpoint(self):
        """Test GET /api/health endpoint"""
        print("\n🔍 Testing Health Endpoint...")
        
        try:
            response = requests.get(f"{self.base_url}/health", timeout=10)
            
            # Test status code
            if response.status_code == 200:
                self.log_test("Health endpoint returns 200", True)
            else:
                self.log_test("Health endpoint returns 200", False, f"Got status {response.status_code}")
                return
            
            # Test response is JSON
            try:
                data = response.json()
                self.log_test("Health endpoint returns valid JSON", True)
            except json.JSONDecodeError:
                self.log_test("Health endpoint returns valid JSON", False, "Response is not valid JSON")
                return
            
            # Test required fields
            required_fields = ['status', 'app', 'version']
            for field in required_fields:
                if field in data:
                    self.log_test(f"Health response has '{field}' field", True, f"Value: {data[field]}")
                else:
                    self.log_test(f"Health response has '{field}' field", False, f"Missing field: {field}")
            
            # Test specific values
            if data.get('status') == 'ok':
                self.log_test("Health status is 'ok'", True)
            else:
                self.log_test("Health status is 'ok'", False, f"Got status: {data.get('status')}")
                
            if data.get('app') == 'FocusFlow API':
                self.log_test("App name is 'FocusFlow API'", True)
            else:
                self.log_test("App name is 'FocusFlow API'", False, f"Got app: {data.get('app')}")
            
        except requests.exceptions.RequestException as e:
            self.log_test("Health endpoint accessible", False, f"Request failed: {str(e)}")
    
    def test_cors_options(self):
        """Test OPTIONS /api/tasks/breakdown for CORS preflight"""
        print("\n🔍 Testing CORS OPTIONS...")
        
        try:
            response = requests.options(f"{self.base_url}/tasks/breakdown", timeout=10)
            
            if response.status_code == 200:
                self.log_test("OPTIONS /api/tasks/breakdown returns 200", True)
            else:
                self.log_test("OPTIONS /api/tasks/breakdown returns 200", False, f"Got status {response.status_code}")
            
            # Check CORS headers
            cors_headers = {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            }
            
            for header, expected_value in cors_headers.items():
                actual_value = response.headers.get(header)
                if actual_value == expected_value:
                    self.log_test(f"CORS header {header} correct", True)
                else:
                    self.log_test(f"CORS header {header} correct", False, f"Expected: {expected_value}, Got: {actual_value}")
                    
        except requests.exceptions.RequestException as e:
            self.log_test("OPTIONS endpoint accessible", False, f"Request failed: {str(e)}")
    
    def test_task_breakdown_valid(self):
        """Test POST /api/tasks/breakdown with valid input"""
        print("\n🔍 Testing Task Breakdown - Valid Input...")
        
        test_cases = [
            {"task": "Study for AP Calc test", "expected_type": "study"},
            {"task": "Read Chapter 5 Biology", "expected_type": "read"},
            {"task": "Write essay on Shakespeare", "expected_type": "write"},
            {"task": "Complete project proposal", "expected_type": "default"}
        ]
        
        for test_case in test_cases:
            task_input = {"task": test_case["task"]}
            
            try:
                response = requests.post(
                    f"{self.base_url}/tasks/breakdown",
                    json=task_input,
                    headers={'Content-Type': 'application/json'},
                    timeout=10
                )
                
                if response.status_code == 200:
                    self.log_test(f"Task breakdown '{test_case['task']}' returns 200", True)
                else:
                    self.log_test(f"Task breakdown '{test_case['task']}' returns 200", False, f"Got status {response.status_code}")
                    continue
                
                # Test response is JSON
                try:
                    data = response.json()
                    self.log_test(f"Task breakdown '{test_case['task']}' returns valid JSON", True)
                except json.JSONDecodeError:
                    self.log_test(f"Task breakdown '{test_case['task']}' returns valid JSON", False, "Response is not valid JSON")
                    continue
                
                # Test response structure
                if 'success' in data and data['success']:
                    self.log_test(f"Task breakdown '{test_case['task']}' has success=true", True)
                else:
                    self.log_test(f"Task breakdown '{test_case['task']}' has success=true", False, f"Got success: {data.get('success')}")
                
                if 'tasks' in data and isinstance(data['tasks'], list):
                    tasks = data['tasks']
                    self.log_test(f"Task breakdown '{test_case['task']}' returns tasks array", True, f"Got {len(tasks)} tasks")
                    
                    # Test each micro-task structure
                    required_fields = ['id', 'parentTask', 'title', 'estimatedTime', 'difficulty', 'xpReward', 'completed', 'order']
                    valid_difficulties = ['easy', 'medium', 'hard']
                    
                    for i, task in enumerate(tasks):
                        all_fields_present = True
                        for field in required_fields:
                            if field not in task:
                                self.log_test(f"Micro-task {i} has field '{field}'", False, f"Missing field: {field}")
                                all_fields_present = False
                        
                        if all_fields_present:
                            self.log_test(f"Micro-task {i} has all required fields", True)
                            
                            # Test field types and values
                            if task['difficulty'] in valid_difficulties:
                                self.log_test(f"Micro-task {i} has valid difficulty", True, f"Difficulty: {task['difficulty']}")
                            else:
                                self.log_test(f"Micro-task {i} has valid difficulty", False, f"Invalid difficulty: {task['difficulty']}")
                            
                            if task['completed'] is False:
                                self.log_test(f"Micro-task {i} completed=false", True)
                            else:
                                self.log_test(f"Micro-task {i} completed=false", False, f"Expected false, got: {task['completed']}")
                            
                            if isinstance(task['estimatedTime'], int) and task['estimatedTime'] > 0:
                                self.log_test(f"Micro-task {i} has valid estimatedTime", True, f"Time: {task['estimatedTime']} min")
                            else:
                                self.log_test(f"Micro-task {i} has valid estimatedTime", False, f"Invalid time: {task['estimatedTime']}")
                            
                            if isinstance(task['xpReward'], int) and task['xpReward'] > 0:
                                self.log_test(f"Micro-task {i} has valid xpReward", True, f"XP: {task['xpReward']}")
                            else:
                                self.log_test(f"Micro-task {i} has valid xpReward", False, f"Invalid XP: {task['xpReward']}")
                else:
                    self.log_test(f"Task breakdown '{test_case['task']}' returns tasks array", False, "No tasks array in response")
                    
            except requests.exceptions.RequestException as e:
                self.log_test(f"Task breakdown '{test_case['task']}' accessible", False, f"Request failed: {str(e)}")
    
    def test_task_breakdown_invalid(self):
        """Test POST /api/tasks/breakdown with invalid input"""
        print("\n🔍 Testing Task Breakdown - Invalid Input...")
        
        test_cases = [
            {"data": {}, "description": "empty body"},
            {"data": {"task": ""}, "description": "empty task"},
            {"data": {"task": None}, "description": "null task"},
            {"data": {"notask": "test"}, "description": "missing task field"}
        ]
        
        for test_case in test_cases:
            try:
                response = requests.post(
                    f"{self.base_url}/tasks/breakdown",
                    json=test_case["data"],
                    headers={'Content-Type': 'application/json'},
                    timeout=10
                )
                
                if response.status_code == 400:
                    self.log_test(f"Task breakdown with {test_case['description']} returns 400", True)
                    
                    try:
                        data = response.json()
                        if 'error' in data:
                            self.log_test(f"Task breakdown with {test_case['description']} has error message", True, f"Error: {data['error']}")
                        else:
                            self.log_test(f"Task breakdown with {test_case['description']} has error message", False, "No error field in response")
                    except json.JSONDecodeError:
                        self.log_test(f"Task breakdown with {test_case['description']} returns valid JSON", False, "Response is not valid JSON")
                        
                else:
                    self.log_test(f"Task breakdown with {test_case['description']} returns 400", False, f"Got status {response.status_code}")
                    
            except requests.exceptions.RequestException as e:
                self.log_test(f"Task breakdown with {test_case['description']} request handled", False, f"Request failed: {str(e)}")
    
    def test_nonexistent_endpoint(self):
        """Test non-existent endpoint returns 404"""
        print("\n🔍 Testing Non-existent Endpoint...")
        
        try:
            response = requests.get(f"{self.base_url}/nonexistent", timeout=10)
            
            if response.status_code == 404:
                self.log_test("Non-existent endpoint returns 404", True)
            else:
                self.log_test("Non-existent endpoint returns 404", False, f"Got status {response.status_code}")
                
            try:
                data = response.json()
                if 'error' in data:
                    self.log_test("404 response has error message", True, f"Error: {data['error']}")
                else:
                    self.log_test("404 response has error message", False, "No error field in response")
            except json.JSONDecodeError:
                self.log_test("404 response is valid JSON", False, "Response is not valid JSON")
                
        except requests.exceptions.RequestException as e:
            self.log_test("Non-existent endpoint accessible", False, f"Request failed: {str(e)}")
    
    def run_all_tests(self):
        """Run all tests"""
        print(f"🚀 Starting FocusFlow API Tests")
        print(f"🌐 Testing against: {self.base_url}")
        print("=" * 60)
        
        # Run all test methods
        self.test_health_endpoint()
        self.test_cors_options()
        self.test_task_breakdown_valid()
        self.test_task_breakdown_invalid()
        self.test_nonexistent_endpoint()
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result['passed'])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if self.failed_tests:
            print("\n🚨 FAILED TESTS:")
            for failure in self.failed_tests:
                print(f"   • {failure}")
        
        print("\n" + "=" * 60)
        
        return failed_tests == 0

if __name__ == "__main__":
    tester = FocusFlowAPITester()
    success = tester.run_all_tests()
    
    if success:
        print("🎉 ALL TESTS PASSED!")
        sys.exit(0)
    else:
        print("💥 SOME TESTS FAILED!")
        sys.exit(1)