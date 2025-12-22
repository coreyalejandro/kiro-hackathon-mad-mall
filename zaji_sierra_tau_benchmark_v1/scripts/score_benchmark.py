#!/usr/bin/env python3
"""
Zaji Sierra Tau Benchmark Scorer
Evaluates benchmark results against expectations
"""

import json
import re
import sys
from argparse import ArgumentParser
from pathlib import Path
from typing import Dict, List, Any, Optional


class BenchmarkScorer:
    def __init__(self):
        self.supported_expectations = {
            'equals', 'any_of', 'contains', 'all_contains', 
            'not_contains', 'regex'
        }
    
    def evaluate_response(self, response: str, expect: Dict[str, Any]) -> Dict[str, Any]:
        """Evaluate a single response against expectations"""
        result = {
            'passed': False,
            'reason': '',
            'details': {}
        }
        
        if not expect:
            result['passed'] = True
            result['reason'] = 'No expectations defined'
            return result
        
        # Check each expectation type
        for expect_type, expect_value in expect.items():
            if expect_type not in self.supported_expectations:
                result['reason'] = f'Unsupported expectation type: {expect_type}'
                return result
            
            if expect_type == 'equals':
                if response.strip() == expect_value.strip():
                    result['details']['equals'] = True
                else:
                    result['details']['equals'] = False
                    result['reason'] = f'Expected exact match: "{expect_value}", got: "{response}"'
                    return result
            
            elif expect_type == 'any_of':
                if not isinstance(expect_value, list):
                    result['reason'] = 'any_of expects a list of strings'
                    return result
                
                response_lower = response.lower()
                matches = [v for v in expect_value if v.lower() in response_lower]
                if matches:
                    result['details']['any_of'] = True
                else:
                    result['details']['any_of'] = False
                    result['reason'] = f'Expected one of: {expect_value}, got: "{response}"'
                    return result
            
            elif expect_type == 'contains':
                if expect_value.lower() in response.lower():
                    result['details']['contains'] = True
                else:
                    result['details']['contains'] = False
                    result['reason'] = f'Expected to contain: "{expect_value}"'
                    return result
            
            elif expect_type == 'all_contains':
                if not isinstance(expect_value, list):
                    result['reason'] = 'all_contains expects a list of strings'
                    return result
                
                response_lower = response.lower()
                missing = [v for v in expect_value if v.lower() not in response_lower]
                if not missing:
                    result['details']['all_contains'] = True
                else:
                    result['details']['all_contains'] = False
                    result['reason'] = f'Missing required substrings: {missing}'
                    return result
            
            elif expect_type == 'not_contains':
                if expect_value.lower() not in response.lower():
                    result['details']['not_contains'] = True
                else:
                    result['details']['not_contains'] = False
                    result['reason'] = f'Should not contain: "{expect_value}"'
                    return result
            
            elif expect_type == 'regex':
                try:
                    pattern = re.compile(expect_value, re.IGNORECASE | re.DOTALL)
                    if pattern.search(response):
                        result['details']['regex'] = True
                    else:
                        result['details']['regex'] = False
                        result['reason'] = f'Regex pattern did not match: {expect_value}'
                        return result
                except re.error as e:
                    result['reason'] = f'Invalid regex pattern: {e}'
                    return result
        
        # If we get here, all expectations passed
        result['passed'] = True
        result['reason'] = 'All expectations met'
        return result
    
    def score_suite(self, results_file: Path) -> Dict[str, Any]:
        """Score a single benchmark suite"""
        results = []
        
        with open(results_file, 'r') as f:
            for line in f:
                if line.strip():
                    results.append(json.loads(line.strip()))
        
        scored_results = []
        passed_count = 0
        
        for result in results:
            if result['status'] != 'success':
                # Failed requests are automatically marked as failed
                scored_result = {
                    **result,
                    'evaluation': {
                        'passed': False,
                        'reason': f'Request failed: {result["status"]}',
                        'details': {}
                    }
                }
            else:
                evaluation = self.evaluate_response(result['response'], result['expect'])
                scored_result = {
                    **result,
                    'evaluation': evaluation
                }
            
            if scored_result['evaluation']['passed']:
                passed_count += 1
            
            scored_results.append(scored_result)
        
        accuracy = passed_count / len(results) if results else 0
        
        return {
            'suite_name': results_file.parent.name,
            'total_items': len(results),
            'passed_items': passed_count,
            'failed_items': len(results) - passed_count,
            'accuracy': accuracy,
            'results': scored_results
        }
    
    def score_latest_run(self, outputs_dir: str = "outputs") -> Dict[str, Any]:
        """Score the most recent benchmark run"""
        outputs_path = Path(outputs_dir)
        
        if not outputs_path.exists():
            print(f"Outputs directory {outputs_dir} not found")
            return {}
        
        # Find the latest run directory
        run_dirs = [d for d in outputs_path.iterdir() if d.is_dir()]
        if not run_dirs:
            print(f"No benchmark runs found in {outputs_dir}")
            return {}
        
        latest_run = max(run_dirs, key=lambda d: d.name)
        print(f"Scoring latest run: {latest_run}")
        
        suite_scores = {}
        
        # Score each suite in the run
        for suite_dir in latest_run.iterdir():
            if suite_dir.is_dir() and (suite_dir / 'results.jsonl').exists():
                suite_score = self.score_suite(suite_dir / 'results.jsonl')
                suite_scores[suite_dir.name] = suite_score
                
                # Save individual suite score
                score_file = suite_dir / 'scores.json'
                with open(score_file, 'w') as f:
                    json.dump(suite_score, f, indent=2)
                
                # Save CSV for easy analysis
                csv_file = suite_dir / 'scores.csv'
                self._save_suite_csv(suite_score, csv_file)
        
        # Calculate overall summary
        total_items = sum(s['total_items'] for s in suite_scores.values())
        total_passed = sum(s['passed_items'] for s in suite_scores.values())
        overall_accuracy = total_passed / total_items if total_items > 0 else 0
        
        summary = {
            'run_directory': str(latest_run),
            'timestamp': latest_run.name,
            'overall_accuracy': overall_accuracy,
            'total_items': total_items,
            'total_passed': total_passed,
            'total_failed': total_items - total_passed,
            'suites': suite_scores
        }
        
        # Save summary
        summary_file = latest_run / 'scores_summary.json'
        with open(summary_file, 'w') as f:
            json.dump(summary, f, indent=2)
        
        # Save summary CSV
        summary_csv = latest_run / 'scores_summary.csv'
        self._save_summary_csv(summary, summary_csv)
        
        return summary
    
    def _save_suite_csv(self, suite_score: Dict[str, Any], csv_file: Path):
        """Save suite results as CSV"""
        import csv
        
        with open(csv_file, 'w', newline='') as f:
            writer = csv.writer(f)
            writer.writerow([
                'id', 'prompt', 'response', 'passed', 'reason', 
                'latency_ms', 'status', 'expect_type', 'expect_value'
            ])
            
            for result in suite_score['results']:
                expect_type = list(result['expect'].keys())[0] if result['expect'] else 'none'
                expect_value = str(list(result['expect'].values())[0]) if result['expect'] else ''
                
                writer.writerow([
                    result['id'],
                    result['prompt'][:100] + '...' if len(result['prompt']) > 100 else result['prompt'],
                    result['response'][:100] + '...' if len(result['response']) > 100 else result['response'],
                    result['evaluation']['passed'],
                    result['evaluation']['reason'],
                    result['latency_ms'],
                    result['status'],
                    expect_type,
                    expect_value
                ])
    
    def _save_summary_csv(self, summary: Dict[str, Any], csv_file: Path):
        """Save overall summary as CSV"""
        import csv
        
        with open(csv_file, 'w', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(['suite', 'total_items', 'passed_items', 'failed_items', 'accuracy'])
            
            for suite_name, suite_data in summary['suites'].items():
                writer.writerow([
                    suite_name,
                    suite_data['total_items'],
                    suite_data['passed_items'],
                    suite_data['failed_items'],
                    f"{suite_data['accuracy']:.3f}"
                ])
            
            # Add overall row
            writer.writerow([
                'OVERALL',
                summary['total_items'],
                summary['total_passed'],
                summary['total_failed'],
                f"{summary['overall_accuracy']:.3f}"
            ])


def main():
    parser = ArgumentParser(description="Score Zaji Sierra Tau benchmark results")
    parser.add_argument("--latest", action="store_true", help="Score the latest run")
    parser.add_argument("--outputs", default="outputs", help="Outputs directory")
    
    args = parser.parse_args()
    
    scorer = BenchmarkScorer()
    
    if args.latest:
        summary = scorer.score_latest_run(args.outputs)
        if summary:
            print(f"\nBenchmark Scoring Complete")
            print(f"Overall Accuracy: {summary['overall_accuracy']:.1%}")
            print(f"Total Items: {summary['total_items']}")
            print(f"Passed: {summary['total_passed']}")
            print(f"Failed: {summary['total_failed']}")
            print(f"\nSuite Breakdown:")
            for suite_name, suite_data in summary['suites'].items():
                print(f"  {suite_name}: {suite_data['accuracy']:.1%} ({suite_data['passed_items']}/{suite_data['total_items']})")
        else:
            sys.exit(1)
    else:
        print("Use --latest to score the most recent benchmark run")
        sys.exit(1)


if __name__ == "__main__":
    main()
