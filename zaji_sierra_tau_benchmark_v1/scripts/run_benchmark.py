#!/usr/bin/env python3
"""
Zaji Sierra Tau Benchmark Runner
Sends prompts to Zaji endpoint and saves raw results
"""

import asyncio
import json
import os
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional

import httpx
import yaml
from argparse import ArgumentParser


class BenchmarkRunner:
    def __init__(self, config_path: str = "config.yaml"):
        with open(config_path, 'r') as f:
            self.config = yaml.safe_load(f)
        
        self.endpoint = self.config['endpoint']
        self.temperature = self.config['temperature']
        self.timeout = self.config['timeout_s']
        self.concurrency = self.config['concurrency']
        self.retries = self.config['retries']
        self.suites = self.config['suites']
        
        # Create output directory with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        self.output_dir = Path(self.config['output_dir']) / timestamp
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Save manifest
        self._save_manifest()
    
    def _save_manifest(self):
        """Save run configuration for reproducibility"""
        manifest = {
            'timestamp': datetime.now().isoformat(),
            'config': self.config,
            'endpoint': self.endpoint,
            'temperature': self.temperature
        }
        
        with open(self.output_dir / 'manifest.json', 'w') as f:
            json.dump(manifest, f, indent=2)
    
    async def _send_prompt(self, client: httpx.AsyncClient, prompt_data: Dict[str, Any]) -> Dict[str, Any]:
        """Send a single prompt to Zaji endpoint"""
        payload = {
            'prompt': prompt_data['prompt'],
            'temperature': self.temperature,
            'userId': f"benchmark_{prompt_data['id']}"
        }
        
        start_time = time.time()
        
        for attempt in range(self.retries + 1):
            try:
                response = await client.post(
                    self.endpoint,
                    json=payload,
                    timeout=self.timeout
                )
                
                if response.status_code == 200:
                    result = response.json()
                    latency = time.time() - start_time
                    
                    return {
                        'id': prompt_data['id'],
                        'prompt': prompt_data['prompt'],
                        'expect': prompt_data.get('expect', {}),
                        'response': result.get('response', ''),
                        'success': result.get('success', False),
                        'latency_ms': round(latency * 1000, 2),
                        'status': 'success',
                        'attempt': attempt + 1,
                        'timestamp': datetime.now().isoformat()
                    }
                else:
                    if attempt == self.retries:
                        return {
                            'id': prompt_data['id'],
                            'prompt': prompt_data['prompt'],
                            'expect': prompt_data.get('expect', {}),
                            'response': '',
                            'success': False,
                            'latency_ms': round((time.time() - start_time) * 1000, 2),
                            'status': f'http_error_{response.status_code}',
                            'attempt': attempt + 1,
                            'timestamp': datetime.now().isoformat()
                        }
            except Exception as e:
                if attempt == self.retries:
                    return {
                        'id': prompt_data['id'],
                        'prompt': prompt_data['prompt'],
                        'expect': prompt_data.get('expect', {}),
                        'response': '',
                        'success': False,
                        'latency_ms': round((time.time() - start_time) * 1000, 2),
                        'status': f'error_{type(e).__name__}',
                        'error': str(e),
                        'attempt': attempt + 1,
                        'timestamp': datetime.now().isoformat()
                    }
        
        return None
    
    async def _run_suite(self, suite_name: str, dataset_path: str) -> List[Dict[str, Any]]:
        """Run a single benchmark suite"""
        print(f"Running suite: {suite_name}")
        
        # Load dataset
        prompts = []
        with open(dataset_path, 'r') as f:
            for line in f:
                if line.strip():
                    prompts.append(json.loads(line.strip()))
        
        print(f"Loaded {len(prompts)} prompts from {dataset_path}")
        
        # Create output directory for this suite
        suite_output_dir = self.output_dir / suite_name
        suite_output_dir.mkdir(exist_ok=True)
        
        # Run prompts concurrently
        semaphore = asyncio.Semaphore(self.concurrency)
        
        async def run_with_semaphore(client, prompt):
            async with semaphore:
                return await self._send_prompt(client, prompt)
        
        async with httpx.AsyncClient() as client:
            tasks = [run_with_semaphore(client, prompt) for prompt in prompts]
            results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Filter out exceptions and save results
        valid_results = [r for r in results if isinstance(r, dict)]
        
        # Save results as JSONL
        results_file = suite_output_dir / 'results.jsonl'
        with open(results_file, 'w') as f:
            for result in valid_results:
                f.write(json.dumps(result) + '\n')
        
        print(f"Saved {len(valid_results)} results to {results_file}")
        return valid_results
    
    async def run_all_suites(self):
        """Run all configured benchmark suites"""
        print(f"Starting benchmark run at {datetime.now().isoformat()}")
        print(f"Output directory: {self.output_dir}")
        print(f"Endpoint: {self.endpoint}")
        print(f"Temperature: {self.temperature}")
        print(f"Concurrency: {self.concurrency}")
        print()
        
        all_results = {}
        
        for suite_name, suite_config in self.suites.items():
            dataset_path = suite_config['dataset']
            if not os.path.exists(dataset_path):
                print(f"Warning: Dataset {dataset_path} not found, skipping {suite_name}")
                continue
            
            results = await self._run_suite(suite_name, dataset_path)
            all_results[suite_name] = results
            
            # Print summary
            success_count = sum(1 for r in results if r['status'] == 'success')
            avg_latency = sum(r['latency_ms'] for r in results if r['status'] == 'success') / max(success_count, 1)
            
            print(f"{suite_name}: {success_count}/{len(results)} successful, avg latency: {avg_latency:.1f}ms")
            print()
        
        print(f"Benchmark run completed. Results saved to: {self.output_dir}")
        return all_results


async def main():
    parser = ArgumentParser(description="Run Zaji Sierra Tau benchmarks")
    parser.add_argument("--all", action="store_true", help="Run all suites")
    parser.add_argument("--suite", help="Run specific suite")
    parser.add_argument("--endpoint", help="Override endpoint URL")
    parser.add_argument("--config", default="config.yaml", help="Config file path")
    
    args = parser.parse_args()
    
    runner = BenchmarkRunner(args.config)
    
    if args.endpoint:
        runner.endpoint = args.endpoint
    
    if args.all:
        await runner.run_all_suites()
    elif args.suite:
        if args.suite in runner.suites:
            suite_config = runner.suites[args.suite]
            await runner._run_suite(args.suite, suite_config['dataset'])
        else:
            print(f"Suite '{args.suite}' not found in config")
            sys.exit(1)
    else:
        print("Use --all to run all suites or --suite <name> for specific suite")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())

